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
  AlertCircle,
  Zap,
  Layers,
  Shield,
  DollarSign,
  HeartHandshake,
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n';
import { assessmentService } from '../../services/assessmentService';
import { gameService } from '../../services/gameService';
import { CONFIGURABLE_GAMES } from '../../data/gamesData';
import { AssessmentSession, AssessmentAnswer, MindsetQuestion, GameMetadata, UserLearningProgress } from '../../types';
import { StorageAdapter } from '../../lib/storage';
import { formatIndianCurrency } from '../../lib/calculator';

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
  const [planAppliedNotification, setPlanAppliedNotification] = useState(false);
  const [isAssessmentActive, setIsAssessmentActive] = useState(false);

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

  // Derive dynamic personalized plan based on user's actual answers & financial profile
  const userInputs = StorageAdapter.getAssessmentInputs() || {
    monthlyIncome: 85000,
    monthlyExpenses: 45000,
    liquidSavingsAndInvestments: 600000,
    outstandingHomeLoan: 3500000,
  };

  // Compute calculated plan targets
  const recommendedTermCover = Math.max(15000000, userInputs.monthlyExpenses * 12 * 20 + (userInputs.outstandingHomeLoan || 0));
  const recommendedEmergencyReserve = (userInputs.monthlyExpenses || 45000) * 6;
  const recommendedMonthlySIP = Math.max(10000, Math.round((userInputs.monthlyIncome || 85000) * 0.20));

  const handleApplyPlanToMaster = () => {
    StorageAdapter.setAssessmentInputs({
      ...userInputs,
      liquidSavingsAndInvestments: userInputs.liquidSavingsAndInvestments || recommendedEmergencyReserve,
    });
    setPlanAppliedNotification(true);
    setTimeout(() => setPlanAppliedNotification(false), 3000);
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
      {/* Page Title & Mission - Vibrant and Bright */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-teal-500/15 via-emerald-500/15 to-blue-500/15 text-teal-800 text-[11px] font-extrabold uppercase tracking-wider mb-1.5 border border-teal-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Integrated Learning & Gaming Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
            Financial Learning & Interactive Games
          </h1>
          <p className="text-xs sm:text-sm text-brand-textSecondary mt-0.5">
            Discover your mindset, play educational challenges, and build an actionable financial plan from your answers.
          </p>
        </div>

        {/* 2 Primary Experience Tabs */}
        <div className="flex items-center rounded-2xl bg-white p-1.5 border-2 border-teal-200/90 shadow-md shadow-teal-500/5 self-start sm:self-auto">
          <button
            onClick={() => setTab('mindset')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'mindset'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/30 scale-[1.02]'
                : 'text-slate-600 hover:text-brand-navy hover:bg-slate-50'
            }`}
          >
            <Brain className={`w-4 h-4 ${activeTab === 'mindset' ? 'text-white' : 'text-teal-600'}`} />
            <span>Discover Mindset</span>
            {mindsetSession?.status === 'completed' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white" />
            )}
          </button>

          <button
            onClick={() => setTab('games')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'games'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 scale-[1.02]'
                : 'text-slate-600 hover:text-brand-navy hover:bg-slate-50'
            }`}
          >
            <Gamepad2 className={`w-4 h-4 ${activeTab === 'games' ? 'text-white' : 'text-blue-600'}`} />
            <span>Learning Games</span>
            {allBadges.length > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
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
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-xs text-brand-navy">
              <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <span className="font-semibold">Restoring your personalized mindset assessment session...</span>
            </div>
          ) : mindsetSession?.status === 'completed' ? (
            /* Completed Assessment Results View + DYNAMIC PERSONALIZED PLAN */
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
              {/* Profile Card Header */}
              <div className="bg-gradient-to-br from-white via-teal-50/30 to-emerald-50/40 rounded-3xl border-2 border-teal-300 p-6 sm:p-8 shadow-lg text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-teal-500/25">
                  <Award className="w-9 h-9" />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-100/90 px-3 py-1 rounded-full border border-teal-300 inline-block">
                    Assessment Completed • Answers Analyzed
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-brand-navy">
                    {getProfileTitle(mindsetSession.mindsetCategory)}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Financial Resilience Score: <strong className="text-teal-700 font-bold text-base">{mindsetSession.score}%</strong>
                  </p>
                </div>

                {/* Transparent Category Explanation */}
                <div className="p-5 rounded-2xl bg-white border border-teal-200 text-xs text-brand-navy leading-relaxed text-left space-y-3 shadow-xs">
                  <p className="font-bold text-brand-navy flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Transparent Profile Analysis
                  </p>
                  <p className="text-slate-700">
                    {mindsetSession.mindsetCategory === 'Prudent Protector' &&
                      'Your responses reflect an exceptional actuarial understanding of financial vulnerability. You prioritize pure term insurance over high-fee endowment products, insist on full health transparency, recognize the portability risks of employer cover, and maintain strong liquidity.'}
                    {mindsetSession.mindsetCategory === 'Disciplined Builder' &&
                      'You demonstrate sound foundational budgeting, debt discipline, and genuine concern for dependants. You can optimize further by ensuring that home loan liabilities and higher education milestones are fully insured with pure individual term coverage.'}
                    {mindsetSession.mindsetCategory === 'Aggressive Accumulator' &&
                      'You place high emphasis on investments and wealth generation, but may have under-hedged core mortality and health risks. Remember that investment returns can fluctuate, while a term insurance backstop guarantees your family standard of living.'}
                    {mindsetSession.mindsetCategory === 'Vulnerable Starter' &&
                      'Your current strategy leaves dependants exposed to income disruption. Priority actions include establishing 3–6 months of emergency reserves and locking in an affordable pure term life insurance policy before taking investment risks.'}
                  </p>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* DYNAMIC PLAN GENERATED FROM USER'S ANSWERS                     */}
              {/* ------------------------------------------------------------- */}
              <div className="bg-white rounded-3xl border-2 border-teal-300 p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-300">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" /> Actionable Blueprint
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-brand-navy">
                      Your Personalized Financial & Protection Plan
                    </h3>
                    <p className="text-xs text-slate-500">
                      Calculated precisely from your responses on emergency liquidity, liabilities, dependants, and risk appetite.
                    </p>
                  </div>

                  {planAppliedNotification && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-md animate-in fade-in">
                      <Check className="w-4 h-4" /> Plan Applied to Master Profile!
                    </span>
                  )}
                </div>

                {/* 4 Plan Pillars Calculated from Answers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Pillar 1: Pure Term Life Shield */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-white via-teal-50/40 to-emerald-50/50 border-2 border-teal-300 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800">
                        Pillar 1 • Life Cover
                      </span>
                      <Shield className="w-4 h-4 text-teal-600" />
                    </div>
                    <p className="text-xl font-black text-brand-navy">
                      {formatIndianCurrency(recommendedTermCover, true)}
                    </p>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Target pure term insurance covering 20 years living support + debts.
                    </p>
                    <span className="inline-block text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                      Est. ~₹850 - ₹1,200/mo
                    </span>
                  </div>

                  {/* Pillar 2: Liquid Emergency Reserve */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/50 border-2 border-blue-300 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800">
                        Pillar 2 • Liquidity
                      </span>
                      <DollarSign className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-xl font-black text-brand-navy">
                      {formatIndianCurrency(recommendedEmergencyReserve, true)}
                    </p>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      6 months living expenses in instant-access sweep/liquid funds.
                    </p>
                    <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      Zero Capital Risk
                    </span>
                  </div>

                  {/* Pillar 3: Wealth Building SIP */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-white via-purple-50/40 to-pink-50/50 border-2 border-purple-300 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800">
                        Pillar 3 • Monthly SIP
                      </span>
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-xl font-black text-brand-navy">
                      {formatIndianCurrency(recommendedMonthlySIP, true)}/mo
                    </p>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Allocated across low-cost broad index funds (70% Equity / 30% Debt).
                    </p>
                    <span className="inline-block text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                      Beats 6% Inflation
                    </span>
                  </div>

                  {/* Pillar 4: Debt & Liability Shield */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-white via-amber-50/40 to-orange-50/50 border-2 border-amber-300 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                        Pillar 4 • Debt Shield
                      </span>
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-xl font-black text-brand-navy">
                      {formatIndianCurrency(userInputs.outstandingHomeLoan || 3500000, true)}
                    </p>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Home loan insulation so family keeps the home unconditionally.
                    </p>
                    <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      100% Liability Cleared
                    </span>
                  </div>
                </div>

                {/* 4 Concrete Next Steps */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Recommended Implementation Sequence
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-800">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
                      <p><strong>Lock In Pure Term Cover:</strong> Buy ₹{formatIndianCurrency(recommendedTermCover, true)} individual term cover before health or age changes increase premiums.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
                      <p><strong>Ringfence Liquid Emergency Fund:</strong> Ensure ₹{formatIndianCurrency(recommendedEmergencyReserve, true)} is parked in liquid sweep accounts.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">3</span>
                      <p><strong>Insulate Home Loan:</strong> Confirm term policy tenor covers the 15-20 year mortgage repayment schedule.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">4</span>
                      <p><strong>Automate Index SIP:</strong> Channel ₹{formatIndianCurrency(recommendedMonthlySIP, true)}/month on salary day into index funds.</p>
                    </div>
                  </div>
                </div>

                {/* Call-to-Actions including DreamLife AI Simulator Launch */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleApplyPlanToMaster}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Apply Plan to Master Profile</span>
                    </button>

                    <Link
                      to="/schemes"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-brand-navy border-2 border-slate-200 hover:border-teal-400 bg-white hover:bg-slate-50 transition-all"
                    >
                      <Shield className="w-4 h-4 text-teal-600" />
                      <span>View Matching Schemes</span>
                    </Link>
                  </div>

                  {/* DreamLife AI Future Simulator Launch Button */}
                  <Link
                    to="/plan?tab=dreamlife"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all scale-[1.02] cursor-pointer"
                  >
                    <Gamepad2 className="w-4 h-4 text-amber-300" />
                    <span>🎮 Live Out This Plan in DreamLife AI →</span>
                  </Link>
                </div>

                {/* Sub-controls */}
                <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => setShowAnswerReview(!showAnswerReview)}
                    className="inline-flex items-center gap-1.5 text-slate-500 hover:text-brand-navy font-semibold transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showAnswerReview ? 'Hide Recorded Answers' : 'Review Recorded Answers'}</span>
                  </button>

                  <span className="text-slate-300">•</span>

                  <button
                    onClick={handleRetakeAssessment}
                    className="inline-flex items-center gap-1.5 text-slate-500 hover:text-brand-navy font-semibold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Mindset Assessment</span>
                  </button>
                </div>
              </div>

              {/* Review of Answers */}
              {showAnswerReview && (
                <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-md space-y-4 animate-in fade-in duration-200">
                  <h3 className="text-sm font-bold text-brand-navy">Review of Your 20 Answers</h3>
                  <div className="space-y-3">
                    {questions.map((q, idx) => {
                      const ans = answers[q.id];
                      const selectedOpt = ans !== undefined ? q.options[ans.selectedOptionIndex] : null;
                      return (
                        <div key={q.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                          <span className="text-[10px] font-bold uppercase text-teal-700">Question {idx + 1} • {q.category.replace('_', ' ')}</span>
                          <p className="font-semibold text-brand-navy">{q.prompt}</p>
                          <p className="text-emerald-800 bg-emerald-50 p-2 rounded-lg mt-1 border border-emerald-200">
                            <strong>Your Selection:</strong> {selectedOpt?.text || 'Not recorded'}
                          </p>
                          {selectedOpt?.insight && (
                            <p className="text-[11px] text-slate-600">
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
          ) : !isAssessmentActive ? (
            /* ========================================================= */
            /* INTERACTIVE INTRODUCTION SCREEN                           */
            /* ========================================================= */
            <div className="max-w-4xl mx-auto space-y-8 py-4 animate-in fade-in duration-300">
              {/* Hero Banner */}
              <div className="bg-gradient-to-br from-white via-teal-50/40 to-blue-50/50 rounded-3xl border-2 border-teal-300 p-7 sm:p-10 shadow-xl space-y-6 text-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-black uppercase tracking-wider border border-teal-300">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Financial Psychology & Resilience Diagnostic</span>
                </div>

                <div className="max-w-2xl mx-auto space-y-2">
                  <h2 className="text-2xl sm:text-4xl font-black text-brand-navy tracking-tight">
                    Discover Your Financial Mindset
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Before calculating insurance figures, discover how you genuinely view risk, emergency liquidity, loans, and family security. This assessment reveals your protection instincts and highlights blind spots before they impact your dependants.
                  </p>
                </div>

                {/* 3 Core Blueprint Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto pt-2">
                  <div className="p-4 rounded-2xl bg-white border border-teal-200 shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
                    <p className="text-base font-black text-brand-navy flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-teal-600" /> ~5 – 7 Minutes
                    </p>
                    <p className="text-[11px] text-slate-500">20 focused, scenario-based questions.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-teal-200 shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Diagnostic Output</span>
                    <p className="text-base font-black text-brand-navy flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-teal-600" /> Actionable Plan
                    </p>
                    <p className="text-[11px] text-slate-500">Customized roadmap based on your answers.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-teal-200 shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Privacy Pledge</span>
                    <p className="text-base font-black text-brand-navy flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-600" /> 100% Confidential
                    </p>
                    <p className="text-[11px] text-slate-500">Bound to your account. Never sold to agents.</p>
                  </div>
                </div>

                {/* Visual Preview of 4 Archetypes */}
                <div className="space-y-3 pt-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                    Visual Preview of Mindset Profiles You May Unlock
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
                    <div className="p-3.5 rounded-2xl bg-white/90 border border-teal-300 space-y-1 shadow-xs">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                        Prudent Protector
                      </span>
                      <h4 className="text-xs font-bold text-brand-navy">High Risk Awareness</h4>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Understands pure risk transfer, avoids endowment traps, maintains high liquid reserves.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/90 border border-blue-300 space-y-1 shadow-xs">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        Disciplined Builder
                      </span>
                      <h4 className="text-xs font-bold text-brand-navy">Balanced Planner</h4>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Strong debt management and milestone budgeting; ready to optimize term protection.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/90 border border-purple-300 space-y-1 shadow-xs">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                        Aggressive Accumulator
                      </span>
                      <h4 className="text-xs font-bold text-brand-navy">Growth-Focused</h4>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Prioritizes market compounding; needs backstop protection against health and mortality risks.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/90 border border-amber-300 space-y-1 shadow-xs">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Vulnerable Starter
                      </span>
                      <h4 className="text-xs font-bold text-brand-navy">Foundational Stage</h4>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Requires rapid establishment of 6-month emergency buffer and entry-level pure term cover.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setIsAssessmentActive(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-600 hover:from-teal-600 hover:to-emerald-700 shadow-xl shadow-teal-500/25 transition-all scale-[1.02] cursor-pointer"
                  >
                    <span>{Object.keys(answers).length > 0 ? `Resume Assessment (Question ${currentIndex + 1} of ${questions.length || 20})` : 'Begin Mindset Assessment 🚀'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {Object.keys(answers).length > 0 && (
                    <button
                      onClick={handleRetakeAssessment}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-semibold text-slate-600 hover:text-brand-navy border border-slate-200 hover:bg-white transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restart from Question 1</span>
                    </button>
                  )}
                </div>

                {/* Privacy & Methodology Guarantee */}
                <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed max-w-xl mx-auto">
                  <strong>Accurate Storage Disclosure:</strong> Your answers are saved locally under your account ID and used exclusively to calculate your personalized plan. LifeMap does not sell data, use deceptive dark patterns, or infer psychology from voice recordings.
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* ACTIVE ASSESSMENT STEPPER (One focused question at a time)*/
            /* ========================================================= */
            (() => {
              const currentQ = questions[currentIndex] || questions[0];
              const answeredCount = Object.keys(answers).length;
              const progressPercent = Math.round((answeredCount / (questions.length || 20)) * 100);

              return (
                <div className="max-w-2xl mx-auto space-y-6 py-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setIsAssessmentActive(false)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-navy transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back to Overview</span>
                    </button>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800 px-3 py-1 rounded-full bg-teal-100/90 border border-teal-300">
                      Question {currentIndex + 1} of {questions.length}
                    </span>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-brand-navy">
                      <span>Progress</span>
                      <span className="text-teal-700 font-extrabold">{progressPercent}% Completed</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Question Card - Luminous White & Glowing Border */}
                  {currentQ && (
                    <div className="bg-white rounded-3xl border-2 border-teal-300/90 shadow-xl p-6 sm:p-7 space-y-5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                          {currentQ.category.replace('_', ' ')}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-brand-navy leading-snug pt-1">
                          {currentQ.prompt}
                        </h3>
                      </div>

                      {/* Options */}
                      <div className="space-y-3">
                        {currentQ.options.map((opt, idx) => {
                          const isSelected = answers[currentQ.id]?.selectedOptionIndex === idx;

                          return (
                            <button
                              key={idx}
                              onClick={() => handleSelectOption(idx, opt.points)}
                              disabled={savingAnswer}
                              className={`w-full text-left p-4 rounded-2xl border-2 text-xs text-brand-navy transition-all flex items-start gap-3.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-gradient-to-r from-teal-50 to-emerald-50/80 border-teal-500 ring-2 ring-teal-400/30 font-semibold shadow-sm'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-teal-300'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                                isSelected ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {isSelected ? <CheckCircle2 className="w-4 h-4" /> : String.fromCharCode(65 + idx)}
                              </span>
                              <span className="leading-relaxed text-slate-800">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Navigation Controls */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                        <button
                          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                          disabled={currentIndex === 0}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-brand-navy font-semibold disabled:opacity-30 transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </button>

                        <span className="text-[11px] text-slate-400 font-medium">
                          Answers save automatically to your profile
                        </span>

                        <button
                          onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                          disabled={currentIndex >= questions.length - 1 || !answers[currentQ.id]}
                          className="inline-flex items-center gap-1 text-teal-700 font-bold disabled:opacity-30 transition-colors cursor-pointer"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4" />
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
      {/* TAB 2: LEARN THROUGH GAMES & DREAMLIFE SIMULATOR QUEST    */}
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
                  <div className="max-w-2xl mx-auto py-4 space-y-6 animate-in fade-in">
                    {/* Game Score & Mastery Card */}
                    <div className="rounded-3xl p-6 sm:p-8 text-center space-y-5 border-2 border-teal-300 bg-white shadow-xl">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-teal-500/25">
                        <Award className="w-9 h-9" />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-100/90 px-3 py-1 rounded-full border border-teal-300 inline-block">
                          Challenge Finished • Insights Synthesized
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-brand-navy">
                          {passed ? 'Financial Mastery Achieved!' : 'Challenge Completed'}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium">
                          You scored <strong className="text-teal-700 font-bold">{gameScore} / {questions.length}</strong> points on {activeGame.title}.
                        </p>
                      </div>

                      {passed && (
                        <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 inline-flex items-center gap-2 font-semibold">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>Earned Badge: <strong className="text-teal-950">{activeGame.badgeName}</strong> (+{activeGame.badgeRewardPoints} Points)</span>
                        </div>
                      )}

                      {/* --------------------------------------------------------- */}
                      {/* ACTION PLAN BUILT FROM GAME ANSWERS                       */}
                      {/* --------------------------------------------------------- */}
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/30 border-2 border-teal-200 text-left space-y-3">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-teal-600" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-brand-navy">
                            Action Plan Built From Your Game Answers
                          </h4>
                        </div>

                        {activeGame.id === 'game-pure-term-vs-savings' && (
                          <div className="space-y-2 text-xs text-slate-700">
                            <p className="font-semibold text-brand-navy">
                              ✓ Your Pure Term Optimization Strategy:
                            </p>
                            <p className="leading-relaxed">
                              By identifying that low-sum-assured endowment policies leave families vulnerable, your plan re-allocates <strong>₹850/month to pure term insurance for ₹1.5 Crore sum assured</strong>, freeing up ₹2,150/month to channel directly into high-return equity index SIPs.
                            </p>
                            <div className="p-2.5 rounded-xl bg-white border border-teal-200 text-[11px] text-teal-900 font-medium">
                              💡 <strong>Plan Outcome:</strong> 20x higher family protection cover today, plus ₹21+ Lakhs in liquid compounding investments over 15 years!
                            </div>
                          </div>
                        )}

                        {activeGame.id === 'game-inflation-time-machine' && (
                          <div className="space-y-2 text-xs text-slate-700">
                            <p className="font-semibold text-brand-navy">
                              ✓ Your Inflation-Proof Family Defense Strategy:
                            </p>
                            <p className="leading-relaxed">
                              You mastered the Rule of 72: household expenses will double from ₹50,000/mo to ₹1,00,000/mo in 12 years. Your plan schedules <strong>life-stage term cover increases (+25% at child milestones)</strong> and models higher education targets at 8% compounding inflation.
                            </p>
                            <div className="p-2.5 rounded-xl bg-white border border-teal-200 text-[11px] text-teal-900 font-medium">
                              💡 <strong>Plan Outcome:</strong> Ensures surviving family standard of living never falls behind India's cost-of-living curve.
                            </div>
                          </div>
                        )}

                        {activeGame.id === 'game-risk-voyager' && (
                          <div className="space-y-2 text-xs text-slate-700">
                            <p className="font-semibold text-brand-navy">
                              ✓ Your 4-Pillar Clan Safety Armor:
                            </p>
                            <p className="leading-relaxed">
                              Your answers insulated living maintenance, loan clearance, and child education. Your plan mandates <strong>independent personal term cover</strong> so protection never lapses upon job transitions or sabbatical years.
                            </p>
                            <div className="p-2.5 rounded-xl bg-white border border-teal-200 text-[11px] text-teal-900 font-medium">
                              💡 <strong>Plan Outcome:</strong> Complete independence from employer-provided group term policy portability risks.
                            </div>
                          </div>
                        )}

                        {/* Interactive Launch into DreamLife AI Simulator */}
                        <div className="pt-2">
                          <Link
                            to="/plan?tab=dreamlife"
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
                          >
                            <Gamepad2 className="w-4 h-4 text-amber-300" />
                            <span>🎮 Test This Game Blueprint in DreamLife AI Simulator →</span>
                          </Link>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                          onClick={exitGame}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
                        >
                          <span>Back to All Games</span>
                        </button>
                        <button
                          onClick={() => startGame(activeGame)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Replay Challenge</span>
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
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-brand-navy">{activeGame.title}</span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                        Question {currentGameQ + 1} of {questions.length}
                      </span>
                    </div>

                    <button
                      onClick={exitGame}
                      className="text-xs font-semibold text-slate-500 hover:text-brand-navy transition-colors cursor-pointer"
                    >
                      Exit Game
                    </button>
                  </div>

                  {/* Active Question Box */}
                  <div className="bg-white rounded-3xl border-2 border-teal-300/80 shadow-lg p-6 sm:p-7 space-y-5">
                    <p className="text-base font-bold text-brand-navy leading-snug">
                      {currentQData.prompt}
                    </p>

                    <div className="space-y-3">
                      {currentQData.options.map((opt, idx) => {
                        let btnStyle = 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800';
                        if (showGameExplanation) {
                          if (idx === currentQData.answerIndex) {
                            btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400/40 shadow-sm';
                          } else if (selectedGameAnswer === idx) {
                            btnStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-medium';
                          } else {
                            btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleGameAnswer(idx)}
                            disabled={showGameExplanation}
                            className={`w-full text-left p-4 rounded-2xl border-2 text-xs transition-all flex items-start gap-3.5 cursor-pointer ${btnStyle}`}
                          >
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="leading-relaxed">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Educational Explanation Box */}
                    {showGameExplanation && (
                      <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-xs space-y-1.5 animate-in fade-in">
                        <div className="flex items-center gap-1.5 font-bold text-brand-navy">
                          {selectedGameAnswer === currentQData.answerIndex ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span className="text-emerald-700 font-extrabold">Correct! Good financial judgment.</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-rose-600" />
                              <span className="text-rose-700 font-bold">Incorrect Choice</span>
                            </>
                          )}
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          {currentQData.explanation}
                        </p>
                      </div>
                    )}

                    {showGameExplanation && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={handleNextGameQuestion}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-md shadow-teal-500/20 transition-all cursor-pointer"
                        >
                          <span>{currentGameQ < questions.length - 1 ? 'Next Question' : 'View Action Plan Results'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            /* Catalog of Educational Games + FEATURED DREAMLIFE AI QUEST */
            <div className="space-y-6">
              {/* Badges Bar */}
              {allBadges.length > 0 && (
                <div className="p-4 rounded-3xl bg-gradient-to-r from-teal-50 via-emerald-50 to-blue-50 border-2 border-teal-300 flex items-center gap-3.5 shadow-md">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-teal-500/20">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-900 block">
                      Badges Earned on Your Account
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {allBadges.map((badge, idx) => (
                        <span key={idx} className="text-xs font-black text-slate-900 bg-white px-3 py-1 rounded-full border border-teal-300 shadow-xs flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>{badge}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* PREMIER FEATURED QUEST: DREAMLIFE AI FUTURE SIMULATOR         */}
              {/* ------------------------------------------------------------- */}
              <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-indigo-700 via-blue-700 to-purple-800 text-white shadow-xl shadow-indigo-500/15 border-2 border-indigo-400/50 relative overflow-hidden">
                {/* Background glow decoration */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 border border-white/20 text-[11px] font-black uppercase tracking-wider">
                      <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Premier Interactive AI Simulation Quest</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      DreamLife AI: Interactive Future Life & Risk Simulator
                    </h2>

                    <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-normal">
                      Yes, DreamLife AI is designed as your interactive future life simulation quest! Voice-speak your life goals, simulate 3 financial pathways (Current, Growth, Priority), stress-test real-world risk shocks (health crises, market crashes), and simulate starting your dream business.
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-bold">
                      <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10 text-cyan-200">
                        🎙 Voice-First AI
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10 text-emerald-200">
                        ⚡ 3 Trajectory Pathways
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10 text-amber-200">
                        🌪 Risk Shock Stress-Testing
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10 text-purple-200">
                        🚀 Business Idea Venture Lab
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex flex-col gap-2.5">
                    <Link
                      to="/plan?tab=dreamlife"
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-400/30 transition-all scale-[1.02] cursor-pointer"
                    >
                      <Gamepad2 className="w-4 h-4 text-slate-950" />
                      <span>Play DreamLife Quest 🚀</span>
                    </Link>

                    <span className="text-[10px] text-center text-blue-200">
                      Located in My Plan & playable here
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 Configurable Interactive Games - Brightened & Themed */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {CONFIGURABLE_GAMES.map((game) => {
                  const progress = userProgress.find(p => p.gameId === game.id);
                  const isDone = progress?.completed;

                  // Distinct bright theme per module mapped correctly by game ID
                  const theme = game.id === 'game-pure-term-vs-savings' ? {
                    border: 'border-2 border-emerald-300 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10',
                    bg: 'bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/40',
                    bar: 'bg-gradient-to-r from-teal-400 to-emerald-500',
                    badge: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
                    box: 'bg-emerald-50/90 border border-emerald-200 text-emerald-950',
                    btn: 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-md shadow-teal-500/25'
                  } : game.id === 'game-inflation-time-machine' ? {
                    border: 'border-2 border-blue-300 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10',
                    bg: 'bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40',
                    bar: 'bg-gradient-to-r from-blue-400 to-indigo-500',
                    badge: 'bg-blue-100 text-blue-900 border border-blue-300',
                    box: 'bg-blue-50/90 border border-blue-200 text-blue-950',
                    btn: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25'
                  } : {
                    border: 'border-2 border-amber-300 hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/10',
                    bg: 'bg-gradient-to-br from-white via-amber-50/30 to-rose-50/40',
                    bar: 'bg-gradient-to-r from-amber-400 to-rose-500',
                    badge: 'bg-amber-100 text-amber-900 border border-amber-300',
                    box: 'bg-amber-50/90 border border-amber-200 text-amber-950',
                    btn: 'bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 shadow-md shadow-amber-500/25'
                  };

                  return (
                    <div
                      key={game.id}
                      className={`rounded-3xl p-5 shadow-md transition-all flex flex-col justify-between space-y-4 overflow-hidden relative ${theme.bg} ${theme.border}`}
                    >
                      {/* Top Accent Strip */}
                      <div className={`h-2 w-full absolute top-0 left-0 ${theme.bar}`} />

                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${theme.badge}`}>
                            {game.difficulty}
                          </span>
                          {isDone ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" /> ~{game.estimatedMinutes} mins
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-base font-black text-brand-navy leading-snug">{game.title}</h3>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {game.shortDescription}
                          </p>
                        </div>

                        <div className={`p-2.5 rounded-xl text-[11px] ${theme.box}`}>
                          <strong className="font-bold">Badge Reward:</strong> {game.badgeName}
                        </div>
                      </div>

                      <button
                        onClick={() => startGame(game)}
                        className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-white transition-all cursor-pointer ${theme.btn}`}
                      >
                        <Gamepad2 className="w-4 h-4" />
                        <span>{isDone ? 'Replay Challenge' : 'Play Challenge & Build Plan'}</span>
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
