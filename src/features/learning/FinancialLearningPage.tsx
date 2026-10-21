import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Brain, 
  Gamepad2, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  Award, 
  Eye, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n';
import { assessmentService } from '../../services/assessmentService';
import { gameService } from '../../services/gameService';
import { CONFIGURABLE_GAMES } from '../../data/gamesData';
import { AssessmentSession, AssessmentAnswer, MindsetQuestion, GameMetadata, UserLearningProgress } from '../../types';

export const FinancialLearningPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active sub-tab: 'mindset' (Discover Your Financial Mindset) or 'games' (Learn Through Games)
  const activeTab = searchParams.get('tab') === 'games' ? 'games' : 'mindset';

  const setTab = (tab: 'mindset' | 'games') => {
    setSearchParams(tab === 'games' ? { tab: 'games' } : {});
  };

  const activeUserId = user?.id || 'guest-user';

  // -------------------------------------------------------------
  // TAB 1: FINANCIAL MINDSET ASSESSMENT STATE
  // -------------------------------------------------------------
  const [mindsetSession, setMindsetSession] = useState<AssessmentSession | null>(null);
  const [questions, setQuestions] = useState<MindsetQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingAssessment, setLoadingAssessment] = useState(true);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [showAnswerReview, setShowAnswerReview] = useState(false);

  const initAssessment = async () => {
    setLoadingAssessment(true);
    try {
      const { session, questions: qList, answers: ansMap } = await assessmentService.getOrCreateSession(activeUserId);
      setMindsetSession(session);
      setQuestions(qList);
      setAnswers(ansMap);
      setCurrentIndex(session.currentQuestionIndex || Object.keys(ansMap).length);
    } catch (err) {
      console.error('Failed to initialize assessment', err);
    } finally {
      setLoadingAssessment(false);
    }
  };

  useEffect(() => {
    initAssessment();
  }, [user]);

  const handleSelectOption = async (optionIndex: number, points: number) => {
    if (!mindsetSession || savingAnswer || currentIndex >= questions.length) return;
    setSavingAnswer(true);

    const currentQ = questions[currentIndex];
    const nextIdx = currentIndex + 1;

    try {
      const { answer, error } = await assessmentService.saveAnswer(
        mindsetSession.id,
        activeUserId,
        currentQ.id,
        optionIndex,
        points,
        nextIdx
      );

      if (answer && !error) {
        setAnswers((prev) => ({ ...prev, [currentQ.id]: answer }));
      }

      if (nextIdx < questions.length) {
        setCurrentIndex(nextIdx);
      } else {
        // Complete the 20-question assessment session
        const { session: completed } = await assessmentService.completeSession(mindsetSession.id, activeUserId);
        if (completed) {
          setMindsetSession(completed);
        }
      }
    } catch (err) {
      console.error('Failed to record answer', err);
    } finally {
      setSavingAnswer(false);
    }
  };

  const handleRetakeAssessment = async () => {
    setLoadingAssessment(true);
    await initAssessment();
  };

  const getProfileTitle = (cat?: string) => {
    if (!cat) return 'Balanced Planner';
    if (cat === 'Prudent Protector') return 'Protection-Focused (Prudent Protector)';
    if (cat === 'Disciplined Builder') return 'Balanced Planner (Disciplined Builder)';
    if (cat === 'Aggressive Accumulator') return 'Long-Term Growth-Oriented (Aggressive Accumulator)';
    return 'Vulnerable Starter';
  };

  // -------------------------------------------------------------
  // TAB 2: LEARNING GAMES STATE
  // -------------------------------------------------------------
  const [activeGame, setActiveGame] = useState<GameMetadata | null>(null);
  const [currentGameQ, setCurrentGameQ] = useState(0);
  const [selectedGameAnswer, setSelectedGameAnswer] = useState<number | null>(null);
  const [showGameExplanation, setShowGameExplanation] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [userProgress, setUserProgress] = useState<UserLearningProgress[]>([]);

  useEffect(() => {
    gameService.getUserProgress(user?.id).then(setUserProgress);
  }, [user]);

  const startGame = (game: GameMetadata) => {
    setActiveGame(game);
    setCurrentGameQ(0);
    setSelectedGameAnswer(null);
    setShowGameExplanation(false);
    setGameScore(0);
    setGameCompleted(false);
  };

  const handleGameAnswer = (idx: number) => {
    if (showGameExplanation) return;
    setSelectedGameAnswer(idx);
    setShowGameExplanation(true);
    if (activeGame && idx === activeGame.previewConcept.sampleQuestions[currentGameQ].answerIndex) {
      setGameScore((s) => s + 1);
    }
  };

  const handleNextGameQuestion = async () => {
    if (!activeGame) return;
    const questions = activeGame.previewConcept.sampleQuestions;
    if (currentGameQ < questions.length - 1) {
      setCurrentGameQ((q) => q + 1);
      setSelectedGameAnswer(null);
      setShowGameExplanation(false);
    } else {
      setGameCompleted(true);
      const isPassed = gameScore >= Math.ceil(questions.length / 2);
      const earnedBadge = isPassed ? activeGame.badgeName : undefined;
      const updated = await gameService.saveScore(
        user?.id || null,
        activeGame.id,
        gameScore,
        true,
        earnedBadge
      );
      setUserProgress((prev) => {
        const filtered = prev.filter(p => p.gameId !== updated.gameId);
        return [...filtered, updated];
      });
    }
  };

  const exitGame = () => {
    setActiveGame(null);
    setGameCompleted(false);
    setCurrentGameQ(0);
  };

  const allBadges = Array.from(
    new Set(userProgress.flatMap(p => p.badgesEarned || []))
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Page Title & Mission */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-brand-teal text-[10px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-brand-amber" /> Integrated Learning Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            Financial Learning & Discovery
          </h1>
          <p className="text-xs sm:text-sm text-brand-textSecondary mt-0.5">
            Discover your financial mindset through guided assessment, then reinforce concepts with interactive challenges.
          </p>
        </div>

        {/* 2 Primary Experience Tabs */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-brand-border self-start sm:self-auto">
          <button
            onClick={() => setTab('mindset')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'mindset'
                ? 'bg-white text-brand-navy shadow-subtle'
                : 'text-brand-textSecondary hover:text-brand-navy'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-brand-teal" />
            <span>Discover Mindset</span>
            {mindsetSession?.status === 'completed' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            onClick={() => setTab('games')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'games'
                ? 'bg-white text-brand-navy shadow-subtle'
                : 'text-brand-textSecondary hover:text-brand-navy'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-brand-teal" />
            <span>Learning Games</span>
            {allBadges.length > 0 && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-brand-teal text-white">
                {allBadges.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: DISCOVER YOUR FINANCIAL MINDSET                     */}
      {/* ========================================================= */}
      {activeTab === 'mindset' && (
        <div className="space-y-6">
          {loadingAssessment ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-2 text-xs text-brand-textSecondary">
              <div className="w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
              <span>Restoring your personalized mindset assessment session...</span>
            </div>
          ) : mindsetSession?.status === 'completed' ? (
            /* Completed Assessment Results View */
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-2xl border border-brand-border p-6 sm:p-8 shadow-card text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-teal-50 text-brand-teal flex items-center justify-center mx-auto shadow-inner">
                  <Award className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                    Assessment Completed • Profile Generated
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-brand-navy">
                    {getProfileTitle(mindsetSession.mindsetCategory)}
                  </h2>
                  <p className="text-xs text-brand-textSecondary">
                    Financial Resilience Score: <strong className="text-brand-navy font-bold">{mindsetSession.score}%</strong>
                  </p>
                </div>

                {/* Transparent Category Explanation */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-brand-textSecondary leading-relaxed text-left space-y-3">
                  <p className="font-bold text-brand-navy flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-amber" /> Transparent Profile Analysis
                  </p>
                  <p>
                    {mindsetSession.mindsetCategory === 'Prudent Protector' &&
                      'Your responses reflect an exceptional actuarial understanding of financial vulnerability. You prioritize pure term insurance over high-fee endowment products, insist on full health transparency, recognize the portability risks of employer cover, and maintain strong liquidity.'}
                    {mindsetSession.mindsetCategory === 'Disciplined Builder' &&
                      'You demonstrate sound foundational budgeting, debt discipline, and genuine concern for dependants. You can optimize further by ensuring that home loan liabilities and higher education milestones are fully insured with pure individual term coverage.'}
                    {mindsetSession.mindsetCategory === 'Aggressive Accumulator' &&
                      'You place high emphasis on investments and wealth generation, but may have under-hedged core mortality and health risks. Remember that investment returns can fluctuate, while a term insurance backstop guarantees your family standard of living.'}
                    {mindsetSession.mindsetCategory === 'Vulnerable Starter' &&
                      'Your current strategy leaves dependants exposed to income disruption. Priority actions include establishing 3–6 months of emergency reserves and locking in an affordable pure term life insurance policy before taking investment risks.'}
                  </p>
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-brand-textSecondary italic">
                    <strong>Educational Notice:</strong> This profile is an educational categorization based on your entered answers, not a psychological diagnosis or financial guarantee.
                  </div>
                </div>

                {/* Clear Primary CTA: "Build My Plan" */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => navigate('/plan')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle transition-all"
                  >
                    <span>Build My Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setTab('games')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs font-semibold text-brand-navy border border-brand-border hover:bg-slate-50 transition-colors"
                  >
                    <Gamepad2 className="w-3.5 h-3.5 text-brand-teal" />
                    <span>Test Knowledge With Games</span>
                  </button>

                  <button
                    onClick={() => setShowAnswerReview(!showAnswerReview)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold text-brand-textSecondary border border-brand-border hover:bg-slate-50 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showAnswerReview ? 'Hide Review' : 'Review Answers'}</span>
                  </button>

                  <button
                    onClick={handleRetakeAssessment}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold text-brand-textSecondary hover:text-brand-navy transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                </div>
              </div>

              {/* Review of Answers */}
              {showAnswerReview && (
                <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-subtle space-y-4 animate-in fade-in duration-200">
                  <h3 className="text-sm font-bold text-brand-navy">Review of Your 20 Answers</h3>
                  <div className="space-y-3">
                    {questions.map((q, idx) => {
                      const ans = answers[q.id];
                      const selectedOpt = ans !== undefined ? q.options[ans.selectedOptionIndex] : null;
                      return (
                        <div key={q.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                          <span className="text-[10px] font-bold uppercase text-brand-teal">Question {idx + 1} • {q.category.replace('_', ' ')}</span>
                          <p className="font-semibold text-brand-navy">{q.prompt}</p>
                          <p className="text-emerald-700 bg-emerald-50/60 p-2 rounded-lg mt-1 border border-emerald-100">
                            <strong>Your Selection:</strong> {selectedOpt?.text || 'Not recorded'}
                          </p>
                          {selectedOpt?.insight && (
                            <p className="text-[11px] text-brand-textSecondary">
                              <em>Insight:</em> {selectedOpt.insight}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Active Assessment Stepper */
            (() => {
              const currentQ = questions[currentIndex] || questions[0];
              const answeredCount = Object.keys(answers).length;
              const progressPercent = Math.round((answeredCount / (questions.length || 20)) * 100);

              return (
                <div className="max-w-2xl mx-auto space-y-6 py-2">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal px-2.5 py-0.5 rounded-full bg-teal-50">
                      Step 1 of 2 • 20 Meaningful Questions
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-brand-navy">
                      Discover Your Financial Mindset
                    </h2>
                    <p className="text-xs text-brand-textSecondary">
                      Assesses family responsibilities, emergency liquidity, loans, term vs endowment mindset, and risk tolerance.
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-brand-navy">
                      <span>Question {currentIndex + 1} of {questions.length}</span>
                      <span className="text-brand-teal">{progressPercent}% Completed</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-teal rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Question Card */}
                  {currentQ && (
                    <div className="bg-gradient-to-br from-white via-white to-teal-50/25 rounded-2xl border-2 border-teal-200/80 shadow-md p-6 space-y-5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                          {currentQ.category.replace('_', ' ')}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-brand-navy leading-snug">
                          {currentQ.prompt}
                        </h3>
                      </div>

                      {/* Options */}
                      <div className="space-y-2.5">
                        {currentQ.options.map((opt, idx) => {
                          const isSelected = answers[currentQ.id]?.selectedOptionIndex === idx;

                          return (
                            <button
                              key={idx}
                              onClick={() => handleSelectOption(idx, opt.points)}
                              disabled={savingAnswer}
                              className={`w-full text-left p-3.5 rounded-xl border text-xs text-brand-navy transition-all flex items-start gap-3 ${
                                isSelected
                                  ? 'bg-teal-50 border-brand-teal ring-1 ring-brand-teal font-semibold'
                                  : 'bg-white border-brand-border hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${
                                isSelected ? 'bg-brand-teal text-white' : 'bg-slate-100 text-brand-textSecondary'
                              }`}>
                                {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : String.fromCharCode(65 + idx)}
                              </span>
                              <span className="leading-relaxed">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Navigation Controls */}
                      <div className="flex items-center justify-between pt-3 border-t border-brand-border text-xs text-brand-textSecondary">
                        <button
                          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                          disabled={currentIndex === 0}
                          className="inline-flex items-center gap-1 text-brand-textSecondary hover:text-brand-navy disabled:opacity-30 transition-colors"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Previous</span>
                        </button>

                        <span className="text-[11px] text-brand-textSecondary">
                          Answers save automatically to your account
                        </span>

                        <button
                          onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                          disabled={currentIndex >= questions.length - 1 || !answers[currentQ.id]}
                          className="inline-flex items-center gap-1 text-brand-navy font-semibold disabled:opacity-30 transition-colors"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: LEARN THROUGH GAMES                                */}
      {/* ========================================================= */}
      {activeTab === 'games' && (
        <div className="space-y-6">
          {activeGame ? (
            /* Active Game Challenge View */
            (() => {
              const questions = activeGame.previewConcept.sampleQuestions;

              if (gameCompleted) {
                const passed = gameScore >= Math.ceil(questions.length / 2);

                return (
                  <div className="max-w-xl mx-auto py-6 space-y-6 animate-in fade-in">
                    <div className="rounded-2xl p-6 sm:p-8 text-center space-y-4 border border-brand-border bg-white shadow-card">
                      <div className="w-14 h-14 rounded-full bg-teal-50 text-brand-teal flex items-center justify-center mx-auto shadow-inner">
                        <Award className="w-7 h-7" />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                          Challenge Finished
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-brand-navy">
                          {passed ? 'Mastery Achieved!' : 'Keep Practicing'}
                        </h2>
                        <p className="text-xs text-brand-textSecondary">
                          You scored <strong className="text-brand-navy">{gameScore} / {questions.length}</strong> points on {activeGame.title}.
                        </p>
                      </div>

                      {passed && (
                        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 inline-flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-brand-amber" />
                          <span>Earned Badge: <strong>{activeGame.badgeName}</strong></span>
                        </div>
                      )}

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                          onClick={exitGame}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle transition-all"
                        >
                          <span>Back to All Games</span>
                        </button>
                        <button
                          onClick={() => startGame(activeGame)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-brand-navy border border-brand-border hover:bg-slate-50 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retry Challenge</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              const currentQData = questions[currentGameQ];

              return (
                <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in">
                  {/* Game Stepper Header */}
                  <div className="flex items-center justify-between border-b border-brand-border pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-navy">{activeGame.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-brand-textSecondary font-semibold">
                        Question {currentGameQ + 1} of {questions.length}
                      </span>
                    </div>

                    <button
                      onClick={exitGame}
                      className="text-xs font-semibold text-brand-textSecondary hover:text-brand-navy transition-colors"
                    >
                      Exit Game
                    </button>
                  </div>

                  {/* Active Question Box */}
                  <div className="bg-white rounded-2xl border border-brand-border shadow-subtle p-6 space-y-5">
                    <p className="text-sm font-bold text-brand-navy leading-snug">
                      {currentQData.prompt}
                    </p>

                    <div className="space-y-2.5">
                      {currentQData.options.map((opt, idx) => {
                        let btnStyle = 'bg-white border-brand-border hover:bg-slate-50 text-brand-navy';
                        if (showGameExplanation) {
                          if (idx === currentQData.answerIndex) {
                            btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold ring-1 ring-emerald-500';
                          } else if (selectedGameAnswer === idx) {
                            btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 font-medium';
                          } else {
                            btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleGameAnswer(idx)}
                            disabled={showGameExplanation}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-start gap-3 ${btnStyle}`}
                          >
                            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="leading-relaxed">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Educational Explanation Box */}
                    {showGameExplanation && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 animate-in fade-in">
                        <div className="flex items-center gap-1.5 font-bold text-brand-navy">
                          {selectedGameAnswer === currentQData.answerIndex ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span className="text-emerald-700">Correct!</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-rose-600" />
                              <span className="text-rose-700">Incorrect Choice</span>
                            </>
                          )}
                        </div>
                        <p className="text-brand-textSecondary leading-relaxed text-[11px]">
                          {currentQData.explanation}
                        </p>
                      </div>
                    )}

                    {showGameExplanation && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={handleNextGameQuestion}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle transition-all"
                        >
                          <span>{currentGameQ < questions.length - 1 ? 'Next Question' : 'View Challenge Results'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            /* Catalog of Educational Games */
            <div className="space-y-6">
              {/* Badges Bar */}
              {allBadges.length > 0 && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50 to-blue-50 border-2 border-teal-300 flex items-center gap-3 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-900 block">
                      Badges Earned on Your Account
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {allBadges.map((badge, idx) => (
                        <span key={idx} className="text-xs font-bold text-teal-950 bg-white px-3 py-0.5 rounded-full border border-teal-200 shadow-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>{badge}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3 Configurable Interactive Games */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {CONFIGURABLE_GAMES.map((game) => {
                  const progress = userProgress.find(p => p.gameId === game.id);
                  const isDone = progress?.completed;

                  // Distinct bright theme per module
                  const theme = game.id === 'game-1' ? {
                    border: 'border-2 border-emerald-300 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10',
                    bg: 'bg-gradient-to-br from-white via-emerald-50/25 to-teal-50/30',
                    bar: 'bg-gradient-to-r from-teal-400 to-emerald-500',
                    badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
                    box: 'bg-emerald-50/80 border border-emerald-200 text-emerald-950',
                    btn: 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-md shadow-teal-500/25'
                  } : game.id === 'game-2' ? {
                    border: 'border-2 border-blue-300 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10',
                    bg: 'bg-gradient-to-br from-white via-blue-50/25 to-indigo-50/30',
                    bar: 'bg-gradient-to-r from-blue-400 to-indigo-500',
                    badge: 'bg-blue-100 text-blue-800 border border-blue-300',
                    box: 'bg-blue-50/80 border border-blue-200 text-blue-950',
                    btn: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25'
                  } : {
                    border: 'border-2 border-amber-300 hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/10',
                    bg: 'bg-gradient-to-br from-white via-amber-50/25 to-rose-50/30',
                    bar: 'bg-gradient-to-r from-amber-400 to-rose-500',
                    badge: 'bg-amber-100 text-amber-800 border border-amber-300',
                    box: 'bg-amber-50/80 border border-amber-200 text-amber-950',
                    btn: 'bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 shadow-md shadow-amber-500/25'
                  };

                  return (
                    <div
                      key={game.id}
                      className={`rounded-2xl p-5 shadow-subtle transition-all flex flex-col justify-between space-y-4 overflow-hidden relative ${theme.bg} ${theme.border}`}
                    >
                      {/* Top Accent Strip */}
                      <div className={`h-1.5 w-full absolute top-0 left-0 ${theme.bar}`} />

                      <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${theme.badge}`}>
                            {game.difficulty}
                          </span>
                          {isDone ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                            </span>
                          ) : (
                            <span className="text-[10px] text-brand-textSecondary font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" /> ~{game.estimatedMinutes} mins
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-brand-navy leading-snug">{game.title}</h3>
                          <p className="text-xs text-brand-textSecondary mt-1 leading-relaxed">
                            {game.shortDescription}
                          </p>
                        </div>

                        <div className={`p-2.5 rounded-xl text-[11px] ${theme.box}`}>
                          <strong className="font-bold">Badge Reward:</strong> {game.badgeName}
                        </div>
                      </div>

                      <button
                        onClick={() => startGame(game)}
                        className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${theme.btn}`}
                      >
                        <Gamepad2 className="w-4 h-4" />
                        <span>{isDone ? 'Replay Challenge' : 'Play Challenge'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
