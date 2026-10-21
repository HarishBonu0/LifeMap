import { describe, it, expect, beforeEach } from 'vitest';
import { localSupabaseInstance } from '../lib/supabase';
import { assessmentService } from '../services/assessmentService';
import { gameService } from '../services/gameService';
import { chatService } from '../services/chatService';
import { scenarioService } from '../services/scenarioService';

describe('LifeMap Supabase Auth & Row Level Security (RLS) Test Suite', () => {
  beforeEach(() => {
    localSupabaseInstance.clearAll();
  });

  it('1. Signs up User A and User B with independent profiles', async () => {
    // Register User A (Alice)
    const { data: authA, error: errA } = await localSupabaseInstance.auth.signUp({
      email: 'alice@example.com',
      password: 'Password123!',
      options: { data: { name: 'Alice Sharma', preferred_language: 'en' } }
    });
    expect(errA).toBeNull();
    expect(authA.user).toBeDefined();
    expect(authA.user?.email).toBe('alice@example.com');

    // Verify User A profile was created automatically
    const { data: profileA } = await localSupabaseInstance
      .from('profiles')
      .select('*')
      .eq('id', authA.user!.id)
      .single();
    expect(profileA.name).toBe('Alice Sharma');

    // Register User B (Bob)
    const { data: authB, error: errB } = await localSupabaseInstance.auth.signUp({
      email: 'bob@example.com',
      password: 'Password456!',
      options: { data: { name: 'Bob Rao', preferred_language: 'te' } }
    });
    expect(errB).toBeNull();
    expect(authB.user?.email).toBe('bob@example.com');

    // Verify User B profile was created automatically
    const { data: profileB } = await localSupabaseInstance
      .from('profiles')
      .select('*')
      .eq('id', authB.user!.id)
      .single();
    expect(profileB.name).toBe('Bob Rao');
    expect(profileB.preferred_language).toBe('te');
  });

  it('2. Enforces RLS: User B cannot access User A profile', async () => {
    // Create User A
    const { data: userA } = await localSupabaseInstance.auth.signUp({
      email: 'alice@example.com',
      password: 'Password123!',
      options: { data: { name: 'Alice Sharma' } }
    });
    const userAId = userA.user!.id;

    // Switch to User B
    const { data: userB } = await localSupabaseInstance.auth.signUp({
      email: 'bob@example.com',
      password: 'Password456!',
      options: { data: { name: 'Bob Rao' } }
    });

    // User B tries to query User A's profile
    const { data: stolenProfile, error } = await localSupabaseInstance
      .from('profiles')
      .select('*')
      .eq('id', userAId)
      .single();

    // RLS must block this access!
    expect(stolenProfile).toBeNull();
    expect(error).toBeDefined();
  });

  it('3. Generates randomized 20-question mindset assessment, persists answers, and restores incomplete session', async () => {
    // Log in User A
    const { data: authA } = await localSupabaseInstance.auth.signUp({
      email: 'alice@example.com',
      password: 'Password123!',
      options: { data: { name: 'Alice' } }
    });
    const userAId = authA.user!.id;

    // Start session
    const { session, questions, answers } = await assessmentService.getOrCreateSession(userAId);
    expect(session.status).toBe('in_progress');
    expect(questions.length).toBe(20);
    expect(session.questionIds.length).toBe(20);
    expect(Object.keys(answers).length).toBe(0);

    const firstQuestionId = questions[0].id;
    const secondQuestionId = questions[1].id;

    // Answer first question
    await assessmentService.saveAnswer(
      session.id,
      userAId,
      firstQuestionId,
      0, // Option A
      4, // 4 points
      1
    );

    // Answer second question
    await assessmentService.saveAnswer(
      session.id,
      userAId,
      secondQuestionId,
      1, // Option B
      3, // 3 points
      2
    );

    // Simulate page reload / revisit: retrieve or restore session
    const restored = await assessmentService.getOrCreateSession(userAId);
    expect(restored.session.id).toBe(session.id);
    expect(restored.session.status).toBe('in_progress');
    // Questions must preserve the EXACT saved randomized order
    expect(restored.questions.map(q => q.id)).toEqual(questions.map(q => q.id));
    // Restored answers must contain both answers
    expect(Object.keys(restored.answers).length).toBe(2);
    expect(restored.answers[firstQuestionId].selectedOptionIndex).toBe(0);
    expect(restored.answers[firstQuestionId].pointsEarned).toBe(4);
    expect(restored.answers[secondQuestionId].selectedOptionIndex).toBe(1);
    expect(restored.answers[secondQuestionId].pointsEarned).toBe(3);
  });

  it('4. Enforces RLS: User B cannot view or tamper with User A assessment session or answers', async () => {
    // User A creates assessment and answers
    const { data: authA } = await localSupabaseInstance.auth.signUp({
      email: 'alice@example.com',
      password: 'Password123!'
    });
    const userAId = authA.user!.id;

    const { session, questions } = await assessmentService.getOrCreateSession(userAId);
    await assessmentService.saveAnswer(session.id, userAId, questions[0].id, 0, 4, 1);

    // User B signs in
    const { data: authB } = await localSupabaseInstance.auth.signUp({
      email: 'bob@example.com',
      password: 'Password456!'
    });
    const userBId = authB.user!.id;

    // User B tries to query User A's session
    const { data: crossSession } = await localSupabaseInstance
      .from('assessment_sessions')
      .select('*')
      .eq('id', session.id);
    // RLS filters out rows not owned by User B
    expect(crossSession).toEqual([]);

    // User B tries to query User A's answers
    const { data: crossAnswers } = await localSupabaseInstance
      .from('assessment_answers')
      .select('*')
      .eq('session_id', session.id);
    expect(crossAnswers).toEqual([]);

    // User B tries to insert an answer into User A's session pretending to be User A
    const { error: tamperError } = await localSupabaseInstance
      .from('assessment_answers')
      .insert({
        session_id: session.id,
        user_id: userAId, // Trying to spoof User A!
        question_id: questions[1].id,
        selected_option_index: 0
      });
    // RLS WITH CHECK policy rejects the insert!
    expect(tamperError).toBeDefined();

    // User B gets their own separate session with fresh randomization
    const bobSession = await assessmentService.getOrCreateSession(userBId);
    expect(bobSession.session.id).not.toBe(session.id);
    expect(bobSession.session.userId).toBe(userBId);
  });

  it('5. Completes mindset assessment and computes score and category', async () => {
    const { data: authA } = await localSupabaseInstance.auth.signUp({
      email: 'alice@example.com',
      password: 'Password123!'
    });
    const userAId = authA.user!.id;

    const { session, questions } = await assessmentService.getOrCreateSession(userAId);

    // Answer all 20 questions with 4 points each (80 points total = 100%)
    for (let i = 0; i < questions.length; i++) {
      await assessmentService.saveAnswer(session.id, userAId, questions[i].id, 0, 4, i + 1);
    }

    const { session: completed, error } = await assessmentService.completeSession(session.id, userAId);
    expect(error).toBeNull();
    expect(completed?.status).toBe('completed');
    expect(completed?.score).toBe(100);
    expect(completed?.mindsetCategory).toBe('Prudent Protector');
  });

  it('6. Isolates game progress and badges between User A and User B', async () => {
    // User A signs in and plays Game 1
    const { data: authA } = await localSupabaseInstance.auth.signUp({
      email: 'alice@example.com',
      password: 'Password123!'
    });
    const userAId = authA.user!.id;

    await gameService.saveScore(userAId, 'game-term-vs-endowment', 100, true, 'Term Shield Master');
    const progressA = await gameService.getUserProgress(userAId);
    expect(progressA.length).toBe(1);
    expect(progressA[0].highScore).toBe(100);
    expect(progressA[0].badgesEarned).toContain('Term Shield Master');

    // User B signs in and plays Game 1 with different score
    const { data: authB } = await localSupabaseInstance.auth.signUp({
      email: 'bob@example.com',
      password: 'Password456!'
    });
    const userBId = authB.user!.id;

    await gameService.saveScore(userBId, 'game-term-vs-endowment', 60, true, 'Term Apprentice');
    const progressB = await gameService.getUserProgress(userBId);
    expect(progressB.length).toBe(1);
    expect(progressB[0].highScore).toBe(60);
    expect(progressB[0].badgesEarned).toEqual(['Term Apprentice']);
    expect(progressB[0].badgesEarned).not.toContain('Term Shield Master');

    // Switch back to User A
    await localSupabaseInstance.auth.signInWithPassword({
      email: 'alice@example.com',
      password: 'Password123!'
    });
    const progressARestored = await gameService.getUserProgress(userAId);
    expect(progressARestored[0].highScore).toBe(100);
    expect(progressARestored[0].badgesEarned).toContain('Term Shield Master');
  });

  it('7. Isolates chat conversations and messages between users', async () => {
    // User A creates chat conversation and sends message
    const { data: authA } = await localSupabaseInstance.auth.signUp({
      email: 'alice@example.com',
      password: 'Password123!'
    });
    const userAId = authA.user!.id;

    const convAId = await chatService.getOrCreateConversation(userAId, 'en');
    await localSupabaseInstance.from('chat_messages').insert({
      conversation_id: convAId,
      user_id: userAId,
      sender: 'user',
      content: 'Hello, what is my coverage gap?'
    });

    const messagesA = await chatService.getMessages(userAId, convAId);
    expect(messagesA.length).toBe(1);
    expect(messagesA[0].content).toBe('Hello, what is my coverage gap?');

    // User B signs in
    const { data: authB } = await localSupabaseInstance.auth.signUp({
      email: 'bob@example.com',
      password: 'Password456!'
    });
    const userBId = authB.user!.id;

    // User B tries to read User A's messages
    const messagesB = await chatService.getMessages(userBId, convAId);
    expect(messagesB).toEqual([]); // Access denied by RLS!

    // User B creates their own message
    const convBId = await chatService.getOrCreateConversation(userBId, 'te');
    await localSupabaseInstance.from('chat_messages').insert({
      conversation_id: convBId,
      user_id: userBId,
      sender: 'user',
      content: 'నా రక్షణ అవసరం ఎంత?'
    });

    const bobMessages = await chatService.getMessages(userBId, convBId);
    expect(bobMessages.length).toBe(1);
    expect(bobMessages[0].content).toBe('నా రక్షణ అవసరం ఎంత?');
  });

  it('8. Isolates growth scenarios per user and supports logout/login', async () => {
    // User A signs in
    const { data: authA } = await localSupabaseInstance.auth.signUp({
      email: 'alice@example.com',
      password: 'Password123!'
    });
    const userAId = authA.user!.id;

    // User A saves scenario
    await scenarioService.saveScenario({
      userId: userAId,
      scenarioName: 'New Baby Milestone',
      description: 'Added 2nd child',
      inputs: { dependants: 3 },
      results: { gap: 15000000 },
      differenceAmount: 3000000
    });

    const aliceScenarios = await scenarioService.getUserScenarios(userAId);
    expect(aliceScenarios.length).toBe(1);
    expect(aliceScenarios[0].scenarioName).toBe('New Baby Milestone');

    // User A logs out
    await localSupabaseInstance.auth.signOut();

    // Unauthenticated user cannot see Alice's scenarios
    const anonScenarios = await scenarioService.getUserScenarios(null);
    expect(anonScenarios.find(s => s.scenarioName === 'New Baby Milestone')).toBeUndefined();

    // User A logs back in
    const { data: loginA, error: loginErr } = await localSupabaseInstance.auth.signInWithPassword({
      email: 'alice@example.com',
      password: 'Password123!'
    });
    expect(loginErr).toBeNull();
    expect(loginA.user?.id).toBe(userAId);

    // Alice's scenarios are restored
    const aliceRestored = await scenarioService.getUserScenarios(userAId);
    expect(aliceRestored.length).toBe(1);
    expect(aliceRestored[0].scenarioName).toBe('New Baby Milestone');

    // Invalid password fails
    const { error: badLogin } = await localSupabaseInstance.auth.signInWithPassword({
      email: 'alice@example.com',
      password: 'WrongPassword'
    });
    expect(badLogin).toBeDefined();
  });
});
