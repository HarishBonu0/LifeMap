import { supabase } from '../lib/supabase';
import { MINDSET_QUESTION_POOL } from '../data/mindsetQuestions';
import { AssessmentSession, AssessmentAnswer, MindsetQuestion } from '../types';

export const assessmentService = {
  // Fisher-Yates shuffle helper
  shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  // Restore incomplete session or initialize a new randomized 20-question session
  async getOrCreateSession(userId: string): Promise<{
    session: AssessmentSession;
    questions: MindsetQuestion[];
    answers: Record<string, AssessmentAnswer>;
  }> {
    // 1. Check for existing incomplete session for this user
    const { data: existingSessions, error: sessionErr } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!sessionErr && existingSessions && existingSessions.length > 0) {
      const activeSession = existingSessions[0];

      // Restore exact question sequence from saved question_ids
      const questionMap = new Map(MINDSET_QUESTION_POOL.map(q => [q.id, q]));
      const restoredQuestions = (activeSession.question_ids as string[])
        .map(id => questionMap.get(id))
        .filter((q): q is MindsetQuestion => Boolean(q));

      // Fetch all previously answered questions for this session
      const { data: answersData } = await supabase
        .from('assessment_answers')
        .select('*')
        .eq('session_id', activeSession.id)
        .eq('user_id', userId);

      const answersMap: Record<string, AssessmentAnswer> = {};
      if (answersData) {
        for (const ans of answersData) {
          answersMap[ans.question_id] = {
            id: ans.id,
            sessionId: ans.session_id,
            userId: ans.user_id,
            questionId: ans.question_id,
            selectedOptionIndex: ans.selected_option_index,
            pointsEarned: ans.points_earned,
            answeredAt: ans.answered_at
          };
        }
      }

      return {
        session: {
          id: activeSession.id,
          userId: activeSession.user_id,
          assessmentType: activeSession.assessment_type,
          status: activeSession.status,
          questionIds: activeSession.question_ids,
          currentQuestionIndex: activeSession.current_question_index || Object.keys(answersMap).length,
          score: activeSession.score,
          mindsetCategory: activeSession.mindset_category,
          summary: activeSession.summary,
          createdAt: activeSession.created_at,
          updatedAt: activeSession.updated_at
        },
        questions: restoredQuestions,
        answers: answersMap
      };
    }

    // 2. No incomplete session found -> Randomly select 20 questions
    const shuffledPool = this.shuffle(MINDSET_QUESTION_POOL);
    const selected20 = shuffledPool.slice(0, 20);
    const questionIds = selected20.map(q => q.id);

    const newSessionRecord = {
      user_id: userId,
      assessment_type: 'financial_mindset',
      status: 'in_progress',
      question_ids: questionIds,
      current_question_index: 0,
      score: 0
    };

    const { data: created, error } = await supabase
      .from('assessment_sessions')
      .insert(newSessionRecord);

    const sessionObj = Array.isArray(created) ? created[0] : created;

    return {
      session: {
        id: sessionObj.id,
        userId: sessionObj.user_id,
        assessmentType: sessionObj.assessment_type,
        status: sessionObj.status,
        questionIds: sessionObj.question_ids,
        currentQuestionIndex: 0,
        score: 0,
        createdAt: sessionObj.created_at,
        updatedAt: sessionObj.updated_at
      },
      questions: selected20,
      answers: {}
    };
  },

  // Save an answer for a question
  async saveAnswer(
    sessionId: string,
    userId: string,
    questionId: string,
    optionIndex: number,
    points: number,
    nextQuestionIndex: number
  ): Promise<{ answer: AssessmentAnswer | null; error: any }> {
    const answerRecord = {
      session_id: sessionId,
      user_id: userId,
      question_id: questionId,
      selected_option_index: optionIndex,
      points_earned: points,
      answered_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('assessment_answers')
      .insert(answerRecord);

    if (error) {
      return { answer: null, error };
    }

    // Update session progress
    await supabase
      .from('assessment_sessions')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .update({
        current_question_index: nextQuestionIndex,
        updated_at: new Date().toISOString()
      });

    return {
      answer: {
        id: data?.id || 'ans_' + Date.now(),
        sessionId,
        userId,
        questionId,
        selectedOptionIndex: optionIndex,
        pointsEarned: points,
        answeredAt: answerRecord.answered_at
      },
      error: null
    };
  },

  // Complete the assessment session
  async completeSession(
    sessionId: string,
    userId: string
  ): Promise<{ session: AssessmentSession | null; error: any }> {
    const { data: answers, error: fetchErr } = await supabase
      .from('assessment_answers')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId);

    if (fetchErr) {
      return { session: null, error: fetchErr };
    }

    const totalPoints = (answers || []).reduce(
      (sum: number, a: any) => sum + (Number(a.points_earned) || 0),
      0
    );

    // Max score is 20 questions * 4 points = 80 points. Percentage score:
    const percentage = Math.round((totalPoints / 80) * 100);

    let category: 'Prudent Protector' | 'Disciplined Builder' | 'Aggressive Accumulator' | 'Vulnerable Starter';
    if (percentage >= 75) {
      category = 'Prudent Protector';
    } else if (percentage >= 55) {
      category = 'Disciplined Builder';
    } else if (percentage >= 40) {
      category = 'Aggressive Accumulator';
    } else {
      category = 'Vulnerable Starter';
    }

    const updates = {
      status: 'completed',
      score: percentage,
      mindset_category: category,
      summary: {
        totalPoints,
        percentageScore: percentage,
        questionsAnswered: answers?.length || 0,
        completedAt: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    };

    const { data: updated, error } = await supabase
      .from('assessment_sessions')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .update(updates);

    if (error) {
      return { session: null, error };
    }

    const updatedSession = Array.isArray(updated) ? updated[0] : updated;
    return {
      session: {
        id: sessionId,
        userId,
        assessmentType: 'financial_mindset',
        status: 'completed',
        questionIds: updatedSession?.question_ids || [],
        currentQuestionIndex: 20,
        score: percentage,
        mindsetCategory: category,
        summary: updates.summary,
        createdAt: updatedSession?.created_at || new Date().toISOString(),
        updatedAt: updates.updated_at
      },
      error: null
    };
  }
};
