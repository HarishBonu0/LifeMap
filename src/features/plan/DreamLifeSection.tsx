import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Send, 
  Edit3, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ShieldCheck, 
  Target, 
  Sliders, 
  ArrowRight, 
  RotateCcw, 
  HelpCircle, 
  Briefcase, 
  BookOpen, 
  ExternalLink, 
  Info,
  Calendar,
  Lock,
  Layers,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { 
  DreamLifeGoal, 
  DreamLifeScenarioInputs, 
  DreamLifeScenarioSummary, 
  BusinessIdeaInputs, 
  BusinessIdeaResult, 
  PersonalizedEducationalResource,
  FinancialAssessmentInputs
} from '../../types';
import { 
  calculateDreamLifeScenarios, 
  calculateBusinessIdeaScenarios, 
  formatIndianCurrency, 
  calculateFutureGoalCost 
} from '../../lib/calculator';
import { goalExtractionService } from '../../services/goalExtractionService';
import { BrowserSpeechController } from '../../lib/speechRecognition';
import { VERIFIED_EDUCATIONAL_RESOURCES, getRecommendedResourcesForGoals } from '../../data/personalizedResourcesData';

interface DreamLifeSectionProps {
  userInputs: FinancialAssessmentInputs;
  onOpenEditProfile: () => void;
  onSavePlanNotice?: () => void;
}

export const DreamLifeSection: React.FC<DreamLifeSectionProps> = ({
  userInputs,
  onOpenEditProfile
}) => {
  // Speech & Input State
  const [speechController] = useState(() => new BrowserSpeechController());
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Dream Transcript
  const [transcript, setTranscript] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  // Extracted Goals
  const [goals, setGoals] = useState<DreamLifeGoal[]>([]);
  const [editingGoal, setEditingGoal] = useState<DreamLifeGoal | null>(null);
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);

  // Active Scenario Tab in Step E: 'currentPath' | 'growthPath' | 'priorityPath'
  const [selectedScenarioId, setSelectedScenarioId] = useState<'currentPath' | 'growthPath' | 'priorityPath'>('currentPath');

  // Business Idea Explorer State
  const [showBusinessExplorer, setShowBusinessExplorer] = useState(false);
  const [businessInputs, setBusinessInputs] = useState<BusinessIdeaInputs>({
    ideaTitle: 'Digital Services & Consulting Studio',
    startupCapital: 500000,
    monthlyOperatingCosts: 45000,
    monthlyRevenue: 120000,
    profitMarginPct: 75
  });

  // Check speech recognition support on mount
  useEffect(() => {
    setSpeechSupported(speechController.isSupported());
  }, [speechController]);

  // Handle Voice Record Toggle
  const toggleRecording = () => {
    if (isRecording) {
      speechController.stop();
      setIsRecording(false);
      return;
    }

    setSpeechError(null);
    const started = speechController.start(
      {
        onResult: (text, isFinal) => {
          setTranscript(text);
        },
        onError: (err) => {
          setSpeechError(err);
          setIsRecording(false);
        },
        onStateChange: (listening) => {
          setIsRecording(listening);
        }
      },
      (sec) => setRecordingSeconds(sec)
    );

    if (started) {
      setIsRecording(true);
      setRecordingSeconds(0);
    }
  };

  // Pre-fill a realistic dream prompt
  const handleLoadSampleDream = () => {
    const sample = 'I want a house worth ₹1.5 crore, two cars, ₹3 crore in investments, and a business within the next ten years.';
    setTranscript(sample);
  };

  // Convert Transcript to Structured Goal Cards
  const handleExtractGoals = async () => {
    if (!transcript.trim()) return;
    setIsExtracting(true);
    setSpeechError(null);
    try {
      const extracted = await goalExtractionService.extractGoalsFromTranscript(
        transcript,
        userInputs.annualExpenseInflationRate || 0.06
      );
      setGoals(extracted);
    } catch (err) {
      console.error('Goal extraction error', err);
      setSpeechError('Could not process goals. You can add goals manually below.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Deterministic 3 Scenarios
  const scenarioResults = useMemo(() => {
    if (goals.length === 0) return null;
    return calculateDreamLifeScenarios({
      goals,
      monthlyIncome: userInputs.monthlyIncome,
      monthlyExpenses: userInputs.monthlyExpenses,
      liquidSavings: userInputs.liquidSavingsAndInvestments,
      inflationRate: userInputs.annualExpenseInflationRate || 0.06,
      nominalReturnRate: 0.10,
      growthIncomeGrowthRatePct: 0.10,
      growthSavingsRateBoostPct: 0.15,
      priorityPostponeYears: 4
    });
  }, [goals, userInputs]);

  // Business Idea Result
  const businessResult: BusinessIdeaResult = useMemo(() => {
    return calculateBusinessIdeaScenarios(businessInputs);
  }, [businessInputs]);

  // Recommended Educational Resources
  const recommendedResources = useMemo(() => {
    const categories = goals.map(g => g.category);
    if (showBusinessExplorer && !categories.includes('business')) {
      categories.push('business');
    }
    return getRecommendedResourcesForGoals(categories);
  }, [goals, showBusinessExplorer]);

  // Goal Manipulation Handlers
  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleSaveEditedGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    const futureCost = calculateFutureGoalCost(
      editingGoal.currentEstimatedCost,
      editingGoal.targetYears,
      userInputs.annualExpenseInflationRate || 0.06
    );
    const updated = {
      ...editingGoal,
      futureInflatedCost: futureCost
    };
    setGoals(prev => prev.map(g => g.id === updated.id ? updated : g));
    setEditingGoal(null);
  };

  const handleAddNewGoal = (newGoal: Partial<DreamLifeGoal>) => {
    const cost = newGoal.currentEstimatedCost || 1000000;
    const years = newGoal.targetYears || 5;
    const created: DreamLifeGoal = {
      id: `goal_${Date.now()}`,
      category: newGoal.category || 'other',
      title: newGoal.title || 'New Milestone',
      description: newGoal.description || 'Custom life goal',
      targetYears: years,
      currentEstimatedCost: cost,
      futureInflatedCost: calculateFutureGoalCost(cost, years, userInputs.annualExpenseInflationRate || 0.06),
      estimateSource: 'user_supplied',
      priority: newGoal.priority || 'high'
    };
    setGoals(prev => [created, ...prev]);
    setIsNewGoalModalOpen(false);
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* ------------------------------------------------------------- */}
      {/* STEP A: CAPTURE DREAMS (VOICE-FIRST & TEXT FALLBACK)          */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-gradient-to-br from-white via-slate-50 to-teal-50/20 rounded-2xl p-6 sm:p-8 border border-brand-border shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-amber" /> Step A • DreamLife AI
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-brand-navy">
              Describe the Life You Want
            </h2>
            <p className="text-xs sm:text-sm text-brand-textSecondary mt-0.5">
              Tell LifeMap what you hope to achieve in 10 or 20 years. We’ll help you explore the financial path.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLoadSampleDream}
            className="self-start sm:self-auto text-xs font-semibold text-brand-teal hover:text-brand-tealDark bg-teal-50/80 hover:bg-teal-100/80 px-3 py-1.5 rounded-xl border border-teal-200/60 transition-colors"
          >
            Try Example Dream →
          </button>
        </div>

        {/* Speech Error Banner */}
        {speechError && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Voice Input Notice:</span>
              <p>{speechError}</p>
            </div>
          </div>
        )}

        {/* Voice Recording Control Center */}
        <div className="flex flex-col items-center justify-center py-4 space-y-4 text-center">
          <div className="relative">
            {isRecording && (
              <span className="absolute -inset-3 rounded-full bg-rose-400/30 animate-ping" />
            )}
            <button
              type="button"
              onClick={toggleRecording}
              className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center transition-all shadow-md focus:outline-none focus:ring-4 ${
                isRecording
                  ? 'bg-rose-600 text-white hover:bg-rose-700 ring-rose-200 animate-pulse'
                  : 'bg-brand-navy text-white hover:bg-brand-navyLight ring-teal-100'
              }`}
              aria-label={isRecording ? 'Stop recording voice' : 'Start recording voice'}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-7 h-7 sm:w-8 sm:h-8" />
                  <span className="text-[10px] font-bold mt-1">Stop</span>
                </>
              ) : (
                <>
                  <Mic className="w-7 h-7 sm:w-8 sm:h-8" />
                  <span className="text-[10px] font-bold mt-1">Tap to Speak</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-300'}`} />
              <span className="text-xs font-bold text-brand-navy">
                {isRecording ? `Listening... (${formatSecs(recordingSeconds)})` : 'Click the microphone or type below'}
              </span>
            </div>
            <p className="text-[11px] text-brand-textSecondary max-w-md">
              Speak naturally in English or Hinglish: "I want a house worth ₹1.5 crore, two cars, ₹3 crore in investments, and a business within the next ten years."
            </p>
          </div>
        </div>

        {/* Transcript Preview & Direct Text Input Alternative */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-navy">
            <span>Your Dream Vision (Transcript / Text Input)</span>
            {transcript && (
              <button
                type="button"
                onClick={() => setTranscript('')}
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={3}
            placeholder="Describe your desired future: property, cars, children's education, investments, business ideas, retirement timeline..."
            className="w-full px-4 py-3 text-xs sm:text-sm text-brand-navy bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-teal/40 transition-all placeholder:text-slate-400"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            {/* Transparent Speech Processing Disclosure */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-brand-teal" />
              <span>Voice is transcribed locally in your browser session. No raw audio files are stored or uploaded.</span>
            </div>

            <button
              type="button"
              disabled={!transcript.trim() || isExtracting}
              onClick={handleExtractGoals}
              className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                transcript.trim() && !isExtracting
                  ? 'bg-brand-teal text-white hover:bg-brand-tealDark shadow-subtle cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isExtracting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Interpreting Goals...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extract & Confirm Goals →</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* STEP B & C: CONFIRM GOALS & INTEGRATE PROFILE                */}
      {/* ------------------------------------------------------------- */}
      {goals.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Target className="w-3.5 h-3.5" /> Step B & C • Structured Goal Roadmap
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-brand-navy">
                Confirmed Life Goals ({goals.length})
              </h3>
              <p className="text-xs text-brand-textSecondary">
                Review, edit estimates, and prioritize before running deterministic financial forecasts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNewGoalModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-navy bg-white border border-brand-border hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-brand-teal" />
                <span>Add Goal</span>
              </button>
            </div>
          </div>

          {/* Real User Profile Baseline Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Monthly Income</span>
                <span className="text-sm font-black text-white">{formatIndianCurrency(userInputs.monthlyIncome)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Monthly Expenses</span>
                <span className="text-sm font-black text-slate-200">{formatIndianCurrency(userInputs.monthlyExpenses)}</span>
              </div>
              <div>
                <span className="text-[10px] text-teal-300 block uppercase font-bold">Investable Surplus</span>
                <span className="text-sm font-black text-brand-teal">
                  {formatIndianCurrency(Math.max(0, userInputs.monthlyIncome - userInputs.monthlyExpenses))}/mo
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Liquid Reserves</span>
                <span className="text-sm font-black text-slate-200">{formatIndianCurrency(userInputs.liquidSavingsAndInvestments)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenEditProfile}
              className="self-start sm:self-auto text-xs font-bold text-brand-teal hover:text-teal-200 underline whitespace-nowrap cursor-pointer"
            >
              Edit Profile Figures →
            </button>
          </div>

          {/* Structured Goal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const sourceBadge = {
                user_supplied: { label: 'User Specified', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                reliable_benchmark: { label: 'Benchmark Estimate', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
                illustrative_assumption: { label: 'Illustrative Assumption', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
                unknown_needs_clarification: { label: 'Needs Clarification', bg: 'bg-purple-50 text-purple-800 border-purple-200' }
              }[goal.estimateSource];

              const priorityBadge = {
                essential: 'bg-rose-50 text-rose-700 border-rose-200',
                high: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                medium: 'bg-slate-100 text-slate-700 border-slate-200',
                flexible: 'bg-teal-50 text-teal-700 border-teal-200'
              }[goal.priority];

              return (
                <div
                  key={goal.id}
                  className="p-5 rounded-2xl border border-brand-border bg-white shadow-xs space-y-4 hover:border-brand-teal/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${priorityBadge}`}>
                        {goal.priority} priority
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sourceBadge.bg}`}>
                        {sourceBadge.label}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-brand-navy">
                      {goal.title}
                    </h4>
                    <p className="text-xs text-brand-textSecondary leading-relaxed">
                      {goal.description}
                    </p>

                    {goal.missingInfo && (
                      <p className="text-[11px] text-amber-700 bg-amber-50/80 p-2 rounded-lg border border-amber-200/60">
                        ⚠️ {goal.missingInfo}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Present Cost</span>
                        <span className="text-sm font-bold text-brand-navy">
                          {formatIndianCurrency(goal.currentEstimatedCost)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">
                          In {goal.targetYears} Yrs (with 6% Inflation)
                        </span>
                        <span className="text-sm font-bold text-brand-teal">
                          {formatIndianCurrency(goal.futureInflatedCost)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingGoal(goal)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-navy hover:bg-slate-100 transition-colors"
                        title="Edit Goal"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP D & E: THREE DISTINCT SCENARIO PATHWAYS                  */}
      {/* ------------------------------------------------------------- */}
      {scenarioResults && (
        <section className="space-y-6">
          <div className="border-b border-brand-border pb-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5" /> Step D & E • Deterministic Scenario Engine
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-brand-navy">
              Three Future Pathways Compared
            </h3>
            <p className="text-xs sm:text-sm text-brand-textSecondary">
              All projections are mathematical models calculated under explicit assumptions, not speculative forecasts.
            </p>
          </div>

          {/* Scenario Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'currentPath' as const, data: scenarioResults.currentPath, color: 'border-slate-300' },
              { id: 'growthPath' as const, data: scenarioResults.growthPath, color: 'border-teal-400' },
              { id: 'priorityPath' as const, data: scenarioResults.priorityPath, color: 'border-indigo-400' }
            ].map(({ id, data }) => {
              const isSelected = selectedScenarioId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedScenarioId(id as any)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-brand-teal bg-teal-50/30 shadow-sm'
                      : 'border-brand-border bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-brand-navy">{data.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      data.fundedGoalsCount === data.totalGoalsCount 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {data.fundedGoalsCount}/{data.totalGoalsCount} Funded
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-textSecondary line-clamp-2 leading-relaxed">
                    {data.tagline}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Selected Scenario Deep-Dive Card */}
          {(() => {
            const currentScenario: DreamLifeScenarioSummary = scenarioResults[selectedScenarioId];
            return (
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-brand-border shadow-card space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-teal tracking-wider">Active Analysis</span>
                    <h4 className="text-lg font-black text-brand-navy">{currentScenario.title}</h4>
                    <p className="text-xs text-brand-textSecondary">{currentScenario.tagline}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Inflated Goal Cost</span>
                    <span className="text-lg font-black text-brand-navy">{formatIndianCurrency(currentScenario.totalGoalCostFuture, true)}</span>
                  </div>
                </div>

                {/* 4 Metric Boxes */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Monthly Surplus</span>
                    <p className="text-lg font-black text-brand-navy">{formatIndianCurrency(currentScenario.monthlySurplus)}</p>
                    <p className="text-[10px] text-slate-500">Available from cashflow</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Target Monthly SIP</span>
                    <p className="text-lg font-black text-brand-teal">{formatIndianCurrency(currentScenario.targetMonthlyContribution)}</p>
                    <p className="text-[10px] text-slate-500">To fund all goals</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-500">10-Yr Projected Corpus</span>
                    <p className="text-lg font-black text-brand-navy">{formatIndianCurrency(currentScenario.projectedCorpus10Yr, true)}</p>
                    <p className="text-[10px] text-slate-500">At ~10% annual return</p>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-1 ${
                    currentScenario.shortfallPerMonth > 0
                      ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                      : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  }`}>
                    <span className="text-[10px] font-bold uppercase">
                      {currentScenario.shortfallPerMonth > 0 ? 'Monthly Gap' : 'Funding Status'}
                    </span>
                    <p className="text-lg font-black">
                      {currentScenario.shortfallPerMonth > 0
                        ? formatIndianCurrency(currentScenario.shortfallPerMonth)
                        : 'Fully Funded!'}
                    </p>
                    <p className="text-[10px]">
                      {currentScenario.shortfallPerMonth > 0 ? 'Monthly contribution shortfall' : 'Surplus covers targets'}
                    </p>
                  </div>
                </div>

                {/* Timeline & Planning Highlights */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-brand-navy block">Timeline & Practical Highlights:</span>
                  <div className="space-y-1.5">
                    {currentScenario.timelineHighlights.map((hl, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-brand-navy bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transparent Assumptions List */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Transparent Model Assumptions & Risk Boundaries
                  </span>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-brand-textSecondary">
                    {currentScenario.assumptions.map((asm, i) => (
                      <li key={i}>{asm}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP F: ACTIONABLE ROADMAP                                    */}
      {/* ------------------------------------------------------------- */}
      {scenarioResults && (
        <section className="bg-gradient-to-br from-brand-navy to-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-card">
          <div className="space-y-1 border-b border-slate-800 pb-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-teal">Step F • Actionable Roadmap</span>
            <h3 className="text-xl font-black text-white">Your Practical Next Steps</h3>
            <p className="text-xs text-slate-300">
              Clear, prioritized actions to work toward your dream life while keeping family safety strictly protected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-teal">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-[10px] text-teal-300">1</span>
                <span>Maintain Emergency Liquidity</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ensure at least 6 months of living expenses ({formatIndianCurrency(userInputs.monthlyExpenses * 6)}) remain parked in high-liquidity fixed deposits or sweep-in accounts before locking funds into long-term assets.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-[10px] text-teal-300">2</span>
                <span>Separate Protection from Investments</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Keep life insurance in pure term plans (with lowest annual premium per rupee of cover) so family debt and living expenses are fully shielded without cannibalizing wealth accumulation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-[10px] text-teal-300">3</span>
                <span>Establish Automated Monthly SIPs</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automate an initial monthly investment of {formatIndianCurrency(Math.max(10000, userInputs.monthlyIncome - userInputs.monthlyExpenses))} right after salary credit to compound steadily across the 10- and 20-year horizons.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-[10px] text-teal-300">4</span>
                <span>Review Milestones Regularly</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Revisit your DreamLife roadmap every 12 months or when career promotions, new loans, or family additions occur to update inflation adjustments and contribution targets.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 6: OPTIONAL BUSINESS IDEA EXPLORER                    */}
      {/* ------------------------------------------------------------- */}
      <section className="rounded-2xl border border-brand-border bg-white shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Briefcase className="w-3.5 h-3.5" /> Section 6 • Optional Venture Modeling
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-brand-navy">
              Explore a Business Idea
            </h3>
            <p className="text-xs text-brand-textSecondary">
              Experiment with startup capital, monthly operating costs, profit margins, and break-even timelines.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowBusinessExplorer(!showBusinessExplorer)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-brand-navy bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <span>{showBusinessExplorer ? 'Hide Venture Simulator' : 'Test a Business Idea'}</span>
            {showBusinessExplorer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showBusinessExplorer && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Input Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Startup Capital (₹)</label>
                <input
                  type="number"
                  value={businessInputs.startupCapital}
                  onChange={(e) => setBusinessInputs({ ...businessInputs, startupCapital: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl font-semibold text-brand-navy"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Monthly Operating Cost (₹)</label>
                <input
                  type="number"
                  value={businessInputs.monthlyOperatingCosts}
                  onChange={(e) => setBusinessInputs({ ...businessInputs, monthlyOperatingCosts: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl font-semibold text-brand-navy"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Expected Monthly Revenue (₹)</label>
                <input
                  type="number"
                  value={businessInputs.monthlyRevenue}
                  onChange={(e) => setBusinessInputs({ ...businessInputs, monthlyRevenue: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl font-semibold text-brand-navy"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Gross Margin (%)</label>
                <input
                  type="number"
                  value={businessInputs.profitMarginPct}
                  onChange={(e) => setBusinessInputs({ ...businessInputs, profitMarginPct: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl font-semibold text-brand-navy"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Monthly Gross Profit</span>
                <p className="text-base sm:text-lg font-black text-brand-navy">{formatIndianCurrency(businessResult.monthlyGrossProfit)}</p>
                <p className="text-[10px] text-slate-500">{businessInputs.profitMarginPct}% of revenue</p>
              </div>

              <div className={`p-4 rounded-xl border space-y-1 ${
                businessResult.isCashFlowPositive ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
              }`}>
                <span className="text-[10px] uppercase font-bold text-slate-500">Net Monthly Cash Flow</span>
                <p className={`text-base sm:text-lg font-black ${
                  businessResult.isCashFlowPositive ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {formatIndianCurrency(businessResult.monthlyNetCashFlow)}
                </p>
                <p className="text-[10px] text-slate-500">After operating expenses</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Break-Even Period</span>
                <p className="text-base sm:text-lg font-black text-brand-navy">
                  {businessResult.breakEvenMonths ? `${businessResult.breakEvenMonths} Months` : 'N/A (Negative)'}
                </p>
                <p className="text-[10px] text-slate-500">To recover startup capital</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Recommended Runway</span>
                <p className="text-base sm:text-lg font-black text-brand-teal">{formatIndianCurrency(businessResult.cashFlowRunwayRecommended, true)}</p>
                <p className="text-[10px] text-slate-500">Capital + 6mo opex reserve</p>
              </div>
            </div>

            {/* Risk Warnings & Disclaimer */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <span className="text-[11px] font-bold text-amber-900 block">Critical Entrepreneurial Risk Guidance:</span>
              <ul className="list-disc pl-5 space-y-1 text-xs text-amber-800">
                {businessResult.risksAndMitigations.map((risk, idx) => (
                  <li key={idx}>{risk}</li>
                ))}
              </ul>
              <p className="text-[10px] text-amber-700/80 italic pt-1">{businessResult.disclaimer}</p>
            </div>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 7: PERSONALIZED LEARNING & REAL-LIFE STORIES          */}
      {/* ------------------------------------------------------------- */}
      <section className="space-y-4">
        <div className="border-b border-brand-border pb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5" /> Section 7 • Personalized Educational Resources
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-brand-navy">
            Recommended Books & Documented Builder Stories
          </h3>
          <p className="text-xs text-brand-textSecondary">
            Curated financial literature and verified real-life case studies aligned with your planning goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedResources.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-2xl border border-brand-border bg-white shadow-xs space-y-3 flex flex-col justify-between hover:border-brand-teal/50 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {res.type === 'book' ? '📖 Recommended Book' : '👤 Verified Case Study'}
                  </span>
                  <span className="text-[10px] font-bold text-brand-teal uppercase">
                    {res.theme.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-brand-navy">
                  {res.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {res.authorOrSource}
                </p>
                <p className="text-xs text-brand-textSecondary leading-relaxed">
                  {res.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="p-2.5 rounded-xl bg-teal-50/50 border border-teal-100/80 space-y-1">
                  <span className="text-[10px] font-bold text-teal-900 block">Core Planning Takeaway:</span>
                  <p className="text-xs text-teal-800 leading-snug">{res.keyLesson}</p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 italic">Individual outcomes are not guaranteed.</span>
                  <a
                    href={res.verifiedSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-teal hover:text-brand-tealDark"
                  >
                    <span>Read Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EDIT GOAL ESTIMATE                                     */}
      {/* ------------------------------------------------------------- */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h4 className="text-base font-bold text-brand-navy">Edit Goal Details</h4>
              <button onClick={() => setEditingGoal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedGoal} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Goal Title</label>
                <input
                  type="text"
                  value={editingGoal.title}
                  onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl font-semibold text-brand-navy"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Current Cost (₹)</label>
                  <input
                    type="number"
                    value={editingGoal.currentEstimatedCost}
                    onChange={(e) => setEditingGoal({ ...editingGoal, currentEstimatedCost: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl font-semibold text-brand-navy"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Target Timeline (Years)</label>
                  <input
                    type="number"
                    value={editingGoal.targetYears}
                    onChange={(e) => setEditingGoal({ ...editingGoal, targetYears: Number(e.target.value) || 1 })}
                    min={1}
                    max={40}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl font-semibold text-brand-navy"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Priority Level</label>
                <select
                  value={editingGoal.priority}
                  onChange={(e) => setEditingGoal({ ...editingGoal, priority: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl font-semibold text-brand-navy"
                >
                  <option value="essential">Essential (Non-negotiable)</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="flexible">Flexible (Can postpone if needed)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD NEW GOAL                                           */}
      {/* ------------------------------------------------------------- */}
      {isNewGoalModalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h4 className="text-base font-bold text-brand-navy">Add Life Milestone</h4>
              <button onClick={() => setIsNewGoalModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                handleAddNewGoal({
                  title: form.title.value,
                  currentEstimatedCost: Number(form.cost.value) || 1000000,
                  targetYears: Number(form.years.value) || 5,
                  category: form.category.value,
                  priority: form.priority.value
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Milestone Title</label>
                <input
                  name="title"
                  type="text"
                  placeholder="e.g. Dream House, Higher Education, Electric Vehicle"
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl font-semibold text-brand-navy"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Category</label>
                <select
                  name="category"
                  defaultValue="property"
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl font-semibold text-brand-navy"
                >
                  <option value="property">Residential Property / Land</option>
                  <option value="vehicle">Personal / Family Vehicle</option>
                  <option value="education">Higher Education</option>
                  <option value="investment">Wealth Corpus / SIP</option>
                  <option value="business">Business Venture</option>
                  <option value="retirement">Retirement Corpus</option>
                  <option value="travel">Travel & Lifestyle</option>
                  <option value="debt_repayment">Loan Repayment</option>
                  <option value="other">Other Milestone</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Current Cost (₹)</label>
                  <input
                    name="cost"
                    type="number"
                    defaultValue={2000000}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl font-semibold text-brand-navy"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Target Timeline (Years)</label>
                  <input
                    name="years"
                    type="number"
                    defaultValue={5}
                    min={1}
                    max={40}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl font-semibold text-brand-navy"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Priority Level</label>
                <select
                  name="priority"
                  defaultValue="high"
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl font-semibold text-brand-navy"
                >
                  <option value="essential">Essential (Non-negotiable)</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="flexible">Flexible (Can postpone if needed)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsNewGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
