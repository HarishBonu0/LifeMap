import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  ShieldCheck, 
  TrendingUp, 
  Target, 
  Sliders, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  AlertTriangle, 
  Info, 
  Check, 
  Bookmark, 
  RotateCcw, 
  Brain, 
  PiggyBank, 
  CheckCircle2, 
  Home, 
  GraduationCap,
  SlidersHorizontal,
  X,
  Edit3,
  Plus,
  Trash2,
  Filter,
  DollarSign,
  LayoutDashboard,
  Shield,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n';
import { FinancialAssessmentInputs, InsuranceNeedsResult, GrowthScenarioRecord, LifeGoal, GoalCategory, GoalPriority } from '../../types';
import { 
  calculateInsuranceNeeds, 
  calculateGrowthProjections, 
  formatIndianCurrency, 
  sanitizeFinancialInputs,
  calculateFutureGoalCost,
  calculateRequiredMonthlyContribution
} from '../../lib/calculator';
import { assessmentService } from '../../services/assessmentService';
import { scenarioService } from '../../services/scenarioService';
import { StorageAdapter } from '../../lib/storage';
import { DreamLifeSection } from './DreamLifeSection';
import { ContextualDisclaimer } from '../../components/Footer';

const STANDARD_BASELINE_INPUTS: FinancialAssessmentInputs = {
  age: 32,
  employmentType: 'salaried',
  maritalStatus: 'married',
  dependantsCount: 2,
  supportDurationYears: 20,
  monthlyIncome: 85000,
  monthlyExpenses: 45000,
  annualExpenseInflationRate: 0.06,
  outstandingHomeLoan: 3500000,
  outstandingOtherLoans: 0,
  futureEducationCommitments: 2000000,
  otherMajorObligations: 0,
  liquidSavingsAndInvestments: 600000,
  existingIndividualTermInsurance: 0,
  existingEmployerTermInsurance: 2500000,
  existingOtherPoliciesSumAssured: 0
};

export const MyPlanPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 5 Tabs: 'overview', 'goals', 'protection', 'scenarios', 'dreamlife'
  const rawTab = searchParams.get('tab') || 'overview';
  const activeTab = rawTab === 'summary' ? 'overview' : 
                   rawTab === '10year' || rawTab === '20year' ? 'overview' : rawTab;

  const setTab = (tab: string) => {
    setSearchParams(tab === 'overview' ? {} : { tab });
  };

  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState<FinancialAssessmentInputs>(STANDARD_BASELINE_INPUTS);
  const [isCustomized, setIsCustomized] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Growth Simulator Interactive State
  const [initialSavings, setInitialSavings] = useState<number>(600000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(40000);
  const [inflationRate, setInflationRate] = useState<number>(0.06);
  const [viewMetric, setViewMetric] = useState<'nominal' | 'real'>('nominal');
  const [showFormulas, setShowFormulas] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<GrowthScenarioRecord[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form edit state for modal
  const [formInputs, setFormInputs] = useState<FinancialAssessmentInputs>(STANDARD_BASELINE_INPUTS);

  // Financial Goals State & Modals
  const [goals, setGoals] = useState<LifeGoal[]>([]);
  const [goalFilter, setGoalFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LifeGoal | null>(null);
  const [goalFormData, setGoalFormData] = useState<{
    title: string;
    category: GoalCategory;
    priority: GoalPriority;
    targetAmount: number;
    targetYears: number;
    description: string;
  }>({
    title: '',
    category: 'home',
    priority: 'high',
    targetAmount: 2500000,
    targetYears: 5,
    description: ''
  });

  useEffect(() => {
    const loadAssessmentData = async () => {
      setLoading(true);
      try {
        let loadedInputs: FinancialAssessmentInputs | null = null;

        // 1. Check session storage for user-customized inputs
        const stored = sessionStorage.getItem('lifemap_assessment');
        if (stored) {
          try {
            loadedInputs = sanitizeFinancialInputs(JSON.parse(stored));
            setIsCustomized(true);
          } catch {}
        }

        // 2. Check StorageAdapter per-user persistence
        if (!loadedInputs) {
          const adapterInputs = StorageAdapter.getAssessmentInputs();
          if (adapterInputs) {
            loadedInputs = sanitizeFinancialInputs(adapterInputs);
            setIsCustomized(true);
          }
        }

        // 3. Fallback to standard baseline profile
        if (!loadedInputs) {
          loadedInputs = { ...STANDARD_BASELINE_INPUTS };
          setIsCustomized(false);
        }

        setInputs(loadedInputs);
        setFormInputs(loadedInputs);
        setInitialSavings(loadedInputs.liquidSavingsAndInvestments || 600000);
        const net = Math.max(10000, loadedInputs.monthlyIncome - loadedInputs.monthlyExpenses);
        setMonthlyContribution(Math.min(100000, net));
        setInflationRate(loadedInputs.annualExpenseInflationRate || 0.06);

        // Load saved goals from StorageAdapter
        const savedGoals = StorageAdapter.getLifeGoals();
        setGoals(savedGoals);
      } finally {
        setLoading(false);
      }
    };

    loadAssessmentData();
  }, [user]);

  // Recalculate deterministic insurance needs
  const result: InsuranceNeedsResult = useMemo(() => {
    return calculateInsuranceNeeds(inputs);
  }, [inputs]);

  // Recalculate growth projections (10- and 20-year)
  const growth = useMemo(() => {
    return calculateGrowthProjections({
      initialSavings,
      monthlyContribution,
      annualInflation: inflationRate,
      baselineProtectionNeed: result.totalProtectionNeed
    });
  }, [initialSavings, monthlyContribution, inflationRate, result.totalProtectionNeed]);

  // Load user saved scenarios
  useEffect(() => {
    scenarioService.getUserScenarios(user?.id || null).then((scList) => {
      setSavedScenarios(scList);
    });
  }, [user]);

  const handleSaveScenario = async () => {
    if (!growth) return;
    try {
      const saved = await scenarioService.saveScenario({
        userId: user?.id || null,
        scenarioName: `Growth Plan (${formatIndianCurrency(monthlyContribution)}/mo)`,
        description: `10-Yr: ${formatIndianCurrency(growth.tenYear.moderate.nominal, true)} | 20-Yr: ${formatIndianCurrency(growth.twentyYear.moderate.nominal, true)}`,
        inputs: {
          initialSavings,
          monthlyContribution,
          inflationRate
        },
        results: {
          tenYear: growth.tenYear,
          twentyYear: growth.twentyYear
        },
        differenceAmount: growth.tenYear.moderate.nominal - (initialSavings + monthlyContribution * 120)
      });

      setSavedScenarios((prev) => [saved, ...prev]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save scenario', err);
    }
  };

  // Handle Save Profile Inputs
  const handleSaveInputs = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeFinancialInputs(formInputs);
    setInputs(sanitized);
    setIsCustomized(true);
    setInitialSavings(sanitized.liquidSavingsAndInvestments || 600000);
    const net = Math.max(10000, sanitized.monthlyIncome - sanitized.monthlyExpenses);
    setMonthlyContribution(Math.min(100000, net));
    setInflationRate(sanitized.annualExpenseInflationRate || 0.06);

    // Save to single source of truth StorageAdapter and session storage
    StorageAdapter.setAssessmentInputs(sanitized);
    sessionStorage.setItem('lifemap_assessment', JSON.stringify(sanitized));
    setEditModalOpen(false);
  };

  const handleResetToBaseline = () => {
    setInputs(STANDARD_BASELINE_INPUTS);
    setFormInputs(STANDARD_BASELINE_INPUTS);
    setIsCustomized(false);
    StorageAdapter.setAssessmentInputs(STANDARD_BASELINE_INPUTS);
    sessionStorage.removeItem('lifemap_assessment');
    setEditModalOpen(false);
  };

  // -----------------------------------------------------------------
  // Financial Goals Handlers
  // -----------------------------------------------------------------
  const openAddGoalModal = () => {
    setEditingGoal(null);
    setGoalFormData({
      title: '',
      category: 'home',
      priority: 'high',
      targetAmount: 2500000,
      targetYears: 5,
      description: ''
    });
    setGoalModalOpen(true);
  };

  const openEditGoalModal = (goal: LifeGoal) => {
    setEditingGoal(goal);
    setGoalFormData({
      title: goal.title,
      category: goal.category,
      priority: goal.priority,
      targetAmount: goal.targetAmount,
      targetYears: goal.targetYears,
      description: goal.description || ''
    });
    setGoalModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalFormData.title.trim()) return;

    if (editingGoal) {
      const updatedGoals = goals.map(g => g.id === editingGoal.id ? {
        ...g,
        title: goalFormData.title.trim(),
        category: goalFormData.category,
        priority: goalFormData.priority,
        targetAmount: Number(goalFormData.targetAmount),
        targetYears: Number(goalFormData.targetYears),
        description: goalFormData.description.trim()
      } : g);
      setGoals(updatedGoals);
      StorageAdapter.setLifeGoals(updatedGoals);
    } else {
      const newGoal: LifeGoal = {
        id: 'goal_' + Date.now(),
        userId: user?.id || 'local-user',
        title: goalFormData.title.trim(),
        category: goalFormData.category,
        priority: goalFormData.priority,
        targetAmount: Number(goalFormData.targetAmount),
        targetYears: Number(goalFormData.targetYears),
        description: goalFormData.description.trim(),
        isCustom: true,
        createdAt: new Date().toISOString()
      };
      const updated = StorageAdapter.addLifeGoal(newGoal);
      setGoals(updated);
    }
    setGoalModalOpen(false);
  };

  const handleDeleteGoal = (goalId: string) => {
    const updated = StorageAdapter.removeLifeGoal(goalId);
    setGoals(updated);
  };

  // Filtered goals
  const filteredGoals = useMemo(() => {
    if (goalFilter === 'short') return goals.filter(g => g.targetYears <= 3);
    if (goalFilter === 'medium') return goals.filter(g => g.targetYears > 3 && g.targetYears <= 7);
    if (goalFilter === 'long') return goals.filter(g => g.targetYears > 7);
    return goals;
  }, [goals, goalFilter]);

  // Visual Breakdown percentages
  const total = Math.max(1, result.totalProtectionNeed);
  const individual = result.existingIndividualCoverage;
  const employer = result.existingEmployerCoverage;
  const gap = result.coverageGap;
  const individualPct = Math.round((individual / total) * 100);
  const employerPct = Math.round((employer / total) * 100);
  const gapPct = Math.max(0, 100 - individualPct - employerPct);

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Page Header with Edit Profile Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/90 text-teal-800 text-[11px] font-black uppercase tracking-wider mb-1.5 border border-teal-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Master Financial Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
            My Financial & Protection Plan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Your centralized command center for family safety nets, financial goals, deterministic projections, and DreamLife AI.
          </p>
        </div>

        <button
          onClick={() => {
            setFormInputs({ ...inputs });
            setEditModalOpen(true);
          }}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-md shadow-teal-500/20 transition-all cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Financial Figures</span>
        </button>
      </div>

      {/* Primary Navigation Tabs: Overview, Goals, Protection, Explore Scenarios, DreamLife AI */}
      <div className="flex items-center overflow-x-auto pb-1 gap-1.5 border-b border-slate-200 text-xs font-bold">
        {[
          { id: 'overview', label: t('tabOverview') || 'Overview', icon: LayoutDashboard },
          { id: 'goals', label: t('tabGoals') || 'Financial Goals', icon: Target },
          { id: 'protection', label: t('tabProtection') || 'Protection Analysis', icon: ShieldCheck },
          { id: 'scenarios', label: t('exploreScenarios') || 'Explore Scenarios', icon: Sliders },
          { id: 'dreamlife', label: t('tabDreamLife') || 'DreamLife AI 🎮', icon: Sparkles, badge: 'Simulator Quest' },
        ].map((tab: any) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-t-2xl transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                isActive
                  ? 'border-teal-500 text-brand-navy bg-white shadow-xs font-black'
                  : 'border-transparent text-slate-500 hover:text-brand-navy hover:bg-slate-50 font-semibold'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 1. OVERVIEW TAB (Concise Top Snapshot & Growth Projections)*/}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Concise Overview Card */}
          <div className="bg-white rounded-3xl border-2 border-teal-300/90 p-6 sm:p-7 shadow-lg space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 pb-5">
              {/* Position snapshot */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-100/90 px-2.5 py-0.5 rounded-full border border-teal-300">
                  Current Financial Position
                </span>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700 pt-1">
                  <span>Monthly Salary: <strong className="text-brand-navy">{formatIndianCurrency(inputs.monthlyIncome)}</strong></span>
                  <span>•</span>
                  <span>Living Expenses: <strong className="text-slate-900">{formatIndianCurrency(inputs.monthlyExpenses)}</strong></span>
                  <span>•</span>
                  <span>Liquid Savings: <strong className="text-teal-700">{formatIndianCurrency(inputs.liquidSavingsAndInvestments || 0, true)}</strong></span>
                  <span>•</span>
                  <span>Home Loan: <strong className="text-blue-700">{formatIndianCurrency(inputs.outstandingHomeLoan || 0, true)}</strong></span>
                </div>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Estimated Gap</span>
                  <span className={`text-base font-black ${gap > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {gap > 0 ? formatIndianCurrency(gap, true) : 'Protected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Recommended Action & DreamLife AI Entry */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-blue-50 to-indigo-50 border border-teal-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-brand-navy">
                    Next Recommended Strategic Action
                  </h4>
                  <p className="text-xs text-slate-700 leading-snug mt-0.5">
                    {gap > 0 
                      ? `Secure a pure individual term life cover of ${formatIndianCurrency(gap, true)} before age 35 to lock in low premiums and insulate your home mortgage.`
                      : 'Your family safety net is fully insulated against living expenses and outstanding mortgage obligations.'
                    }
                  </p>
                </div>
              </div>

              <button
                onClick={() => setTab('dreamlife')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md shadow-indigo-500/25 transition-all scale-[1.02] cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Visualize Future with DreamLife AI →</span>
              </button>
            </div>
          </div>

          {/* 10-Year and 20-Year Projections Preview */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-7 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-brand-navy">
                  10- & 20-Year Wealth & Protection Outlook
                </h3>
                <p className="text-xs text-slate-500">
                  Deterministic compounding growth assuming monthly savings of {formatIndianCurrency(monthlyContribution)} at historical Indian equity (12%), hybrid (9%), and debt (6%) rates.
                </p>
              </div>

              {/* Nominal vs Real Toggle */}
              <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 self-start sm:self-auto">
                <button
                  onClick={() => setViewMetric('nominal')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMetric === 'nominal' ? 'bg-white text-brand-navy shadow-xs' : 'text-slate-400'
                  }`}
                >
                  Nominal (₹)
                </button>
                <button
                  onClick={() => setViewMetric('real')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMetric === 'real' ? 'bg-white text-brand-navy shadow-xs' : 'text-slate-400'
                  }`}
                >
                  Inflation-Adjusted
                </button>
              </div>
            </div>

            {/* 3 Scenario Cards at Year 10 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Conservative Path (6.5% Return)</span>
                <p className="text-xl font-black text-brand-navy">
                  {formatIndianCurrency(viewMetric === 'nominal' ? growth.tenYear.conservative.nominal : growth.tenYear.conservative.real, true)}
                </p>
                <p className="text-[11px] text-slate-500">Fixed deposits, PPF, and liquid debt reserves.</p>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/70 border-2 border-teal-300 space-y-1.5 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-teal-800 block">Balanced Path (10% Return)</span>
                <p className="text-xl font-black text-teal-950">
                  {formatIndianCurrency(viewMetric === 'nominal' ? growth.tenYear.moderate.nominal : growth.tenYear.moderate.real, true)}
                </p>
                <p className="text-[11px] text-teal-900">50/50 diversified hybrid index & debt strategy.</p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border-2 border-indigo-300 space-y-1.5 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-indigo-800 block">Growth Path (12.5% Return)</span>
                <p className="text-xl font-black text-indigo-950">
                  {formatIndianCurrency(viewMetric === 'nominal' ? growth.tenYear.aggressive.nominal : growth.tenYear.aggressive.real, true)}
                </p>
                <p className="text-[11px] text-indigo-900">Pure equity index SIPs (Nifty 50 & Next 50).</p>
              </div>
            </div>

            {/* Visual Recharts Area Chart */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growth.trajectory}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="balancedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5A4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0EA5A4" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="year" tickFormatter={(y) => `Yr ${y}`} tick={{ fontSize: 11 }} />
                  <YAxis 
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip 
                    formatter={(val: any) => [formatIndianCurrency(Number(val)), 'Accumulated Value']}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey={viewMetric === 'nominal' ? 'aggressiveNominal' : 'aggressiveReal'} 
                    name="Growth Path (12.5%)" 
                    stroke="#4F46E5" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#growthGrad)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey={viewMetric === 'nominal' ? 'moderateNominal' : 'moderateReal'} 
                    name="Balanced Path (10%)" 
                    stroke="#0EA5A4" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#balancedGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. FINANCIAL GOALS TAB (Interactive Full CRUD Manager)     */}
      {/* ========================================================= */}
      {activeTab === 'goals' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Bar with Filters and Add Goal Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
            <div>
              <h3 className="text-base font-black text-brand-navy">Your Financial Goals & Milestones</h3>
              <p className="text-xs text-slate-500">
                Track target timelines, inflation-adjusted future costs, and required monthly SIP funding.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                {(['all', 'short', 'medium', 'long'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setGoalFilter(filter)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      goalFilter === filter ? 'bg-white text-brand-navy shadow-xs' : 'text-slate-400 hover:text-brand-navy'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter === 'short' ? '< 3 Yrs' : filter === 'medium' ? '3-7 Yrs' : '7+ Yrs'}
                  </button>
                ))}
              </div>

              <button
                onClick={openAddGoalModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-sm shadow-teal-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Goal</span>
              </button>
            </div>
          </div>

          {/* Goals Grid */}
          {filteredGoals.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <Target className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-sm font-bold text-brand-navy">No Financial Goals in this View</h4>
                <p className="text-xs text-slate-500">
                  Add major life milestones such as home purchase, child education, or emergency reserve to calculate funding requirements.
                </p>
              </div>
              <button
                onClick={openAddGoalModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Financial Goal</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGoals.map((goal) => {
                const futureCost = calculateFutureGoalCost(goal.targetAmount, goal.targetYears, inputs.annualExpenseInflationRate || 0.06);
                const monthlySIP = calculateRequiredMonthlyContribution(futureCost, goal.targetYears, 0.12);

                return (
                  <div
                    key={goal.id}
                    className="p-5 rounded-3xl border-2 border-slate-200 bg-white hover:border-teal-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center flex-shrink-0">
                            {goal.category === 'home' ? <Home className="w-4 h-4" /> :
                             goal.category === 'education' ? <GraduationCap className="w-4 h-4" /> :
                             goal.category === 'retirement' ? <PiggyBank className="w-4 h-4" /> :
                             <Target className="w-4 h-4" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-brand-navy leading-snug">{goal.title}</h4>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">{goal.category}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            goal.priority === 'essential' ? 'bg-red-100 text-red-800' :
                            goal.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {goal.priority}
                          </span>
                          <button
                            onClick={() => openEditGoalModal(goal)}
                            className="p-1 rounded-lg text-slate-400 hover:text-brand-navy hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Goal"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Goal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {goal.description && (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {goal.description}
                        </p>
                      )}

                      {/* Calculations breakdown */}
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Target Today</span>
                          <span className="text-xs font-black text-brand-navy">{formatIndianCurrency(goal.targetAmount, true)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Future Cost ({goal.targetYears}y)</span>
                          <span className="text-xs font-black text-teal-800">{formatIndianCurrency(futureCost, true)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Req. SIP (12%)</span>
                          <span className="text-xs font-black text-indigo-700">{formatIndianCurrency(monthlySIP, true)}/mo</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Horizon: {goal.targetYears} Years
                      </span>
                      <span>Assumed Inflation: 6%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PROTECTION ANALYSIS TAB (Deep Calculation Breakdown)   */}
      {/* ========================================================= */}
      {activeTab === 'protection' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Visual Gap Card */}
          <div className="bg-gradient-to-br from-white via-teal-50/25 to-blue-50/30 rounded-3xl p-6 sm:p-8 border-2 border-teal-300/90 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-100/90 px-3 py-1 rounded-full border border-teal-300">
                  Total Protection Need
                </span>
                <p className="text-3xl sm:text-4xl font-black text-brand-navy mt-1.5">
                  {formatIndianCurrency(result.totalProtectionNeed, true)}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Calculated based on {inputs.dependantsCount} dependents over {inputs.supportDurationYears} years with {(inputs.annualExpenseInflationRate * 100).toFixed(0)}% annual inflation.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs bg-white p-3.5 rounded-2xl border border-teal-200 shadow-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Existing Coverage</span>
                  <span className="font-black text-brand-navy text-sm">{formatIndianCurrency(result.existingTotalCoverage, true)}</span>
                </div>
                <div className="h-7 w-px bg-slate-200" />
                <div>
                  <span className="text-[10px] text-red-600 block uppercase font-bold">Uncovered Gap</span>
                  <span className="font-black text-red-700 text-sm">{formatIndianCurrency(gap, true)}</span>
                </div>
              </div>
            </div>

            {/* Segmented Progress Bar */}
            <div className="space-y-3">
              <div className="h-7 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-200/60">
                {individualPct > 0 && (
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 flex items-center justify-center transition-all duration-500"
                    style={{ width: `${individualPct}%` }}
                    title={`Individual: ${individualPct}%`}
                  >
                    <span className="text-[11px] font-bold text-white px-1 truncate">{individualPct}%</span>
                  </div>
                )}
                {employerPct > 0 && (
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center transition-all duration-500"
                    style={{ width: `${employerPct}%` }}
                    title={`Employer: ${employerPct}%`}
                  >
                    <span className="text-[11px] font-bold text-white px-1 truncate">{employerPct}%</span>
                  </div>
                )}
                {gapPct > 0 && (
                  <div
                    className="h-full bg-gradient-to-r from-rose-400 to-rose-500 flex items-center justify-center transition-all duration-500"
                    style={{ width: `${gapPct}%` }}
                    title={`Uncovered Gap: ${gapPct}%`}
                  >
                    <span className="text-[11px] font-bold text-white px-1 truncate">{gapPct}% Gap</span>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
                  <span className="text-brand-navy">Personal Term: {formatIndianCurrency(individual, true)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500 shadow-xs" />
                  <span className="text-brand-navy">Employer Cover: {formatIndianCurrency(employer, true)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs" />
                  <span className="font-bold text-rose-700">Uncovered Gap: {formatIndianCurrency(gap, true)}</span>
                </div>
              </div>
            </div>

            {/* Employer Cover Portability Advisory */}
            {employer > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5 shadow-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>Employer Coverage Advisory:</strong> Your ₹{formatIndianCurrency(employer, true)} employer insurance is tied to your job. It terminates if you switch employers, take a sabbatical, or retire. Experts recommend securing an individual pure term plan as your permanent foundation.
                </p>
              </div>
            )}
          </div>

          {/* Mathematical Breakdown of Responsibilities */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-brand-navy uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" /> Transparent Calculation Formula Breakdown
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50/50 border-2 border-blue-200 shadow-xs">
                <span className="text-[10px] font-black uppercase text-blue-700 block">Future Living Costs</span>
                <span className="text-lg font-black text-brand-navy block mt-1">
                  {formatIndianCurrency(result.futureFamilySupportTotal, true)}
                </span>
                <span className="text-[10px] text-slate-500">Monthly ₹{formatIndianCurrency(inputs.monthlyExpenses)} × {inputs.supportDurationYears} yrs (6% inflation)</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border-2 border-amber-200 shadow-xs">
                <span className="text-[10px] font-black uppercase text-amber-700 block">Outstanding Debts</span>
                <span className="text-lg font-black text-brand-navy block mt-1">
                  {formatIndianCurrency(result.outstandingLiabilitiesTotal, true)}
                </span>
                <span className="text-[10px] text-slate-500">Home loan + other borrowings</span>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/50 border-2 border-purple-200 shadow-xs">
                <span className="text-[10px] font-black uppercase text-purple-700 block">Milestones & College</span>
                <span className="text-lg font-black text-brand-navy block mt-1">
                  {formatIndianCurrency(result.futureCommitmentsTotal, true)}
                </span>
                <span className="text-[10px] text-slate-500">Higher education & obligations</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 border-2 border-emerald-200 shadow-xs">
                <span className="text-[10px] font-black uppercase text-emerald-700 block">Less: Liquid Assets</span>
                <span className="text-lg font-black text-emerald-800 block mt-1">
                  -{formatIndianCurrency(result.eligibleAssetsConsidered, true)}
                </span>
                <span className="text-[10px] text-slate-500">Eligible emergency savings</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Formula: (Living Support + Debts + Commitments) - Liquid Assets = <strong>{formatIndianCurrency(result.totalProtectionNeed, true)}</strong>
              </p>
              <Link
                to="/schemes"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-slate-800 shadow-sm transition-all"
              >
                <span>Browse Matching Schemes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Contextual Educational Disclaimer at Bottom of Protection Analysis */}
          <ContextualDisclaimer />
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. EXPLORE SCENARIOS TAB (Interactive Growth Explorer)     */}
      {/* ========================================================= */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-2 border-teal-300 p-6 sm:p-7 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-brand-navy">
                  {t('exploreScenarios') || 'Interactive Growth Scenario Explorer'}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('scenariosSub') || 'Test adjustments to your monthly savings, initial capital, and inflation assumptions.'}
                </p>
              </div>

              {/* View Metric Toggle */}
              <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  onClick={() => setViewMetric('nominal')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMetric === 'nominal' ? 'bg-white text-brand-navy shadow-xs' : 'text-slate-400'
                  }`}
                >
                  {t('nominalMetric') || 'Nominal (₹)'}
                </button>
                <button
                  onClick={() => setViewMetric('real')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMetric === 'real' ? 'bg-white text-brand-navy shadow-xs' : 'text-slate-400'
                  }`}
                >
                  {t('realMetric') || 'Real (Inflation-Adjusted)'}
                </button>
              </div>
            </div>

            {/* Interactive Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/20 border-2 border-teal-200/60 text-xs shadow-xs">
              <div className="space-y-2">
                <div className="flex justify-between font-semibold text-brand-navy">
                  <span>{t('monthlySavingsGoal') || 'Monthly Contribution'}</span>
                  <span className="font-extrabold text-teal-600 text-sm">{formatIndianCurrency(monthlyContribution)}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="150000"
                  step="5000"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-semibold text-brand-navy">
                  <span>{t('savingsLabel') || 'Initial Savings'}</span>
                  <span className="font-extrabold text-teal-600 text-sm">{formatIndianCurrency(initialSavings, true)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="50000"
                  value={initialSavings}
                  onChange={(e) => setInitialSavings(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-semibold text-brand-navy">
                  <span>{t('inflationLabel') || 'Inflation Assumption'}</span>
                  <span className="font-extrabold text-teal-600 text-sm">{(inflationRate * 100).toFixed(1)}% / yr</span>
                </div>
                <input
                  type="range"
                  min="0.04"
                  max="0.09"
                  step="0.005"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
            </div>

            {/* 3 Scenario Cards at Year 10 */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                10-Year Estimated Compounding Trajectory ({viewMetric === 'nominal' ? 'Nominal' : 'Real In Today\'s Purchasing Power'})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">{t('conservativePath') || 'Conservative Path (6.5% Return)'}</span>
                  <p className="text-xl font-black text-brand-navy">
                    {formatIndianCurrency(growth.tenYear.conservative[viewMetric], true)}
                  </p>
                  <p className="text-[11px] text-slate-500">Fixed deposits, high-grade corporate bonds.</p>
                </div>
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-teal-800 block">{t('moderatePath') || 'Moderate Path (10.0% Return)'}</span>
                  <p className="text-xl font-black text-teal-800">
                    {formatIndianCurrency(growth.tenYear.moderate[viewMetric], true)}
                  </p>
                  <p className="text-[11px] text-teal-700">Balanced hybrid funds, diversified equity.</p>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-indigo-800 block">{t('aggressivePath') || 'Aggressive Path (12.5% Return)'}</span>
                  <p className="text-xl font-black text-indigo-900">
                    {formatIndianCurrency(growth.tenYear.aggressive[viewMetric], true)}
                  </p>
                  <p className="text-[11px] text-indigo-700">Broad-market Indian equities / Index funds.</p>
                </div>
              </div>
            </div>

            {/* Save Scenario & Formulas Action */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setShowFormulas(!showFormulas)}
                className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{showFormulas ? (t('hideFormulas') || 'Hide Mathematical Formulas') : (t('viewFormulas') || 'View Transparent Formulas')}</span>
              </button>

              <button
                onClick={handleSaveScenario}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-md shadow-teal-500/20 transition-all cursor-pointer"
              >
                {saveSuccess ? <Check className="w-3.5 h-3.5 text-white" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{saveSuccess ? (t('scenarioSaved') || 'Scenario Saved!') : (t('saveScenario') || 'Save This Scenario')}</span>
              </button>
            </div>

            {/* Formulas Box */}
            {showFormulas && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 animate-in fade-in">
                <span className="font-bold text-brand-navy block uppercase text-[10px] tracking-wider">Actuarial Compounding Formula:</span>
                <p className="font-mono text-[11px] bg-white p-2.5 rounded-xl border border-slate-200">
                  FV = P × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]
                </p>
                <p className="text-[11px] text-slate-500">
                  Where P = initial savings ({formatIndianCurrency(initialSavings)}), PMT = monthly contribution ({formatIndianCurrency(monthlyContribution)}), r = monthly effective interest rate, n = total compounding months. Real values discount FV by (1 + inflation)^n.
                </p>
              </div>
            )}

            {/* Saved Scenarios List */}
            {savedScenarios.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                  {t('savedScenarios') || 'Saved Scenarios on Your Account'} ({savedScenarios.length})
                </h4>
                <div className="space-y-2">
                  {savedScenarios.map((sc) => (
                    <div key={sc.id} className="p-3.5 rounded-xl border-2 border-teal-100 bg-gradient-to-r from-white to-teal-50/30 flex items-center justify-between text-xs shadow-xs">
                      <div>
                        <span className="font-bold text-brand-navy">{sc.scenarioName}</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">{sc.description}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(sc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. DREAMLIFE AI TAB (Interactive Future Simulator Quest)  */}
      {/* ========================================================= */}
      {activeTab === 'dreamlife' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <DreamLifeSection 
            userInputs={inputs} 
            onOpenEditProfile={() => setEditModalOpen(true)}
          />
        </div>
      )}

      {/* Goal Add/Edit Modal */}
      {goalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 border-2 border-teal-300 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-brand-navy">
                {editingGoal ? 'Edit Financial Goal' : 'Add New Financial Goal'}
              </h3>
              <button
                onClick={() => setGoalModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-navy hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-navy block">Goal Title</label>
                <input
                  type="text"
                  required
                  value={goalFormData.title}
                  onChange={(e) => setGoalFormData({ ...goalFormData, title: e.target.value })}
                  placeholder="e.g. Buy 3BHK Flat in Hyderabad"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-navy block">Category</label>
                  <select
                    value={goalFormData.category}
                    onChange={(e) => setGoalFormData({ ...goalFormData, category: e.target.value as GoalCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="home">Home / Property</option>
                    <option value="education">Child Education</option>
                    <option value="retirement">Retirement</option>
                    <option value="emergency">Emergency Fund</option>
                    <option value="wealth">Wealth Creation</option>
                    <option value="vehicle">Vehicle / Asset</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-navy block">Priority</label>
                  <select
                    value={goalFormData.priority}
                    onChange={(e) => setGoalFormData({ ...goalFormData, priority: e.target.value as GoalPriority })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="essential">Essential (Top)</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-navy block">Target Cost Today (₹)</label>
                  <input
                    type="number"
                    min={10000}
                    step={50000}
                    required
                    value={goalFormData.targetAmount}
                    onChange={(e) => setGoalFormData({ ...goalFormData, targetAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-navy block">Target Horizon (Years)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={goalFormData.targetYears}
                    onChange={(e) => setGoalFormData({ ...goalFormData, targetYears: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-navy block">Description / Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={goalFormData.description}
                  onChange={(e) => setGoalFormData({ ...goalFormData, description: e.target.value })}
                  placeholder="Notes about location, college, or milestone strategy..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-brand-navy focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-sm transition-all cursor-pointer"
                >
                  {editingGoal ? 'Save Changes' : 'Add Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Financial Figures Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 border-2 border-teal-300 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-brand-navy">
                Edit Your Family Financial Figures
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-navy hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInputs} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-navy block">Monthly Income (₹)</label>
                  <input
                    type="number"
                    value={formInputs.monthlyIncome}
                    onChange={(e) => setFormInputs({ ...formInputs, monthlyIncome: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-brand-navy"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-navy block">Monthly Expenses (₹)</label>
                  <input
                    type="number"
                    value={formInputs.monthlyExpenses}
                    onChange={(e) => setFormInputs({ ...formInputs, monthlyExpenses: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-brand-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-navy block">Home Loan Principal (₹)</label>
                  <input
                    type="number"
                    value={formInputs.outstandingHomeLoan}
                    onChange={(e) => setFormInputs({ ...formInputs, outstandingHomeLoan: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-brand-navy"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-navy block">Liquid Savings (₹)</label>
                  <input
                    type="number"
                    value={formInputs.liquidSavingsAndInvestments}
                    onChange={(e) => setFormInputs({ ...formInputs, liquidSavingsAndInvestments: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-brand-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-navy block">Personal Term Cover (₹)</label>
                  <input
                    type="number"
                    value={formInputs.existingIndividualTermInsurance}
                    onChange={(e) => setFormInputs({ ...formInputs, existingIndividualTermInsurance: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-brand-navy"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-navy block">Employer Group Cover (₹)</label>
                  <input
                    type="number"
                    value={formInputs.existingEmployerTermInsurance}
                    onChange={(e) => setFormInputs({ ...formInputs, existingEmployerTermInsurance: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-brand-navy"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetToBaseline}
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Reset to Standard Baseline
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all cursor-pointer"
                  >
                    Save & Recalculate
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
