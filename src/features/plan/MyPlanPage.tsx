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
  Edit3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n';
import { FinancialAssessmentInputs, InsuranceNeedsResult, GrowthScenarioRecord, LifeGoal } from '../../types';
import { 
  calculateInsuranceNeeds, 
  calculateGrowthProjections, 
  formatIndianCurrency, 
  sanitizeFinancialInputs 
} from '../../lib/calculator';
import { assessmentService } from '../../services/assessmentService';
import { scenarioService } from '../../services/scenarioService';
import { StorageAdapter } from '../../lib/storage';

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

  // Active section tab: 'summary', 'goals', '10year', '20year', 'scenarios'
  const activeTab = searchParams.get('tab') || 'summary';
  const setTab = (tab: string) => {
    setSearchParams(tab === 'summary' ? {} : { tab });
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

  // Goals State
  const [goals, setGoals] = useState<LifeGoal[]>([]);

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

        // 2. Fallback to standard baseline profile
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

        // Load saved goals
        const savedGoals = StorageAdapter.getLifeGoals();
        setGoals(savedGoals);

        // Load saved scenarios
        const scenarios = await scenarioService.getUserScenarios(user?.id || null);
        setSavedScenarios(scenarios);
      } catch (err) {
        console.error('Failed to load plan inputs', err);
      } finally {
        setLoading(false);
      }
    };

    loadAssessmentData();
  }, [user]);

  // Protection Needs Calculation
  const result: InsuranceNeedsResult = useMemo(() => {
    return calculateInsuranceNeeds(inputs);
  }, [inputs]);

  // Deterministic 10- and 20-Year Growth Projections
  const projection = useMemo(() => {
    return calculateGrowthProjections({
      initialSavings,
      monthlyContribution,
      annualInflation: inflationRate,
      conservativeRate: 0.065,
      moderateRate: 0.10,
      aggressiveRate: 0.125,
      baselineProtectionNeed: result.totalProtectionNeed,
      supportDurationYears: inputs.supportDurationYears
    });
  }, [inputs, result, initialSavings, monthlyContribution, inflationRate]);

  // Handle saving custom growth scenario
  const handleSaveScenario = async () => {
    if (!projection) return;
    const saved = await scenarioService.saveScenario({
      userId: user?.id || null,
      scenarioName: `Growth Plan (${formatIndianCurrency(monthlyContribution)}/mo)`,
      description: `10-Yr: ${formatIndianCurrency(projection.tenYear.moderate.nominal, true)} | 20-Yr: ${formatIndianCurrency(projection.twentyYear.moderate.nominal, true)}`,
      inputs: {
        initialSavings,
        monthlyContribution,
        inflationRate
      },
      results: {
        tenYearModerate: projection.tenYear.moderate.nominal,
        twentyYearModerate: projection.twentyYear.moderate.nominal
      },
      differenceAmount: projection.tenYear.moderate.nominal - (initialSavings + monthlyContribution * 120)
    });

    setSavedScenarios((prev) => [saved, ...prev]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Handle saving customized financial profile
  const handleApplyCustomInputs = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeFinancialInputs(formInputs);
    setInputs(sanitized);
    setInitialSavings(sanitized.liquidSavingsAndInvestments || 500000);
    const net = Math.max(10000, sanitized.monthlyIncome - sanitized.monthlyExpenses);
    setMonthlyContribution(Math.min(100000, net));
    setInflationRate(sanitized.annualExpenseInflationRate || 0.06);
    sessionStorage.setItem('lifemap_assessment', JSON.stringify(sanitized));
    setIsCustomized(true);
    setEditModalOpen(false);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-2 text-xs text-brand-textSecondary">
        <div className="w-7 h-7 border-3 border-brand-teal border-t-transparent rounded-full animate-spin" />
        <span className="font-semibold text-brand-navy">Calculating your personalized financial plan...</span>
      </div>
    );
  }

  // Variables for Protection Summary visual
  const individual = result.existingIndividualCoverage;
  const employer = result.existingEmployerCoverage;
  const need = Math.max(result.totalProtectionNeed, 1);
  const gap = result.coverageGap;
  const individualPct = Math.min(100, Math.round((individual / need) * 100));
  const employerPct = Math.min(100 - individualPct, Math.round((employer / need) * 100));
  const gapPct = Math.max(0, 100 - individualPct - employerPct);

  // Formatted chart data for 10-Year and 20-Year projections
  const chartData10 = projection.trajectory.slice(0, 10).map((row) => ({
    year: `Yr ${row.year}`,
    cumulativeInvested: row.investedPrincipal,
    conservative: viewMetric === 'nominal' ? row.conservativeNominal : row.conservativeReal,
    moderate: viewMetric === 'nominal' ? row.moderateNominal : row.moderateReal,
    aggressive: viewMetric === 'nominal' ? row.aggressiveNominal : row.aggressiveReal
  }));

  const chartData20 = projection.trajectory.map((row) => ({
    year: `Yr ${row.year}`,
    cumulativeInvested: row.investedPrincipal,
    conservative: viewMetric === 'nominal' ? row.conservativeNominal : row.conservativeReal,
    moderate: viewMetric === 'nominal' ? row.moderateNominal : row.moderateReal,
    aggressive: viewMetric === 'nominal' ? row.aggressiveNominal : row.aggressiveReal
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Plan Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-[10px] font-bold uppercase tracking-wider mb-1 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-amber" /> Comprehensive Financial Roadmap
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            My Plan
          </h1>
          <p className="text-xs sm:text-sm text-brand-textSecondary mt-0.5">
            Your personalized protection gap, milestone goals, and transparent 10- and 20-year growth outlooks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFormInputs({ ...inputs });
              setEditModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-md shadow-teal-500/20 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Customize Inputs</span>
          </button>

          <Link
            to="/learning"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-brand-border bg-white hover:bg-slate-50 text-xs font-semibold text-brand-navy transition-colors"
            title="Take the 20-question mindset assessment"
          >
            <Brain className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Mindset Quiz</span>
          </Link>
        </div>
      </div>

      {/* Info Banner when on baseline */}
      {!isCustomized && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50/80 via-blue-50/60 to-emerald-50/80 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs text-brand-navy">
              <strong className="text-teal-900">Interactive Baseline Active:</strong> Showing a typical family (Age {inputs.age}, {inputs.dependantsCount} dependents, ₹{formatIndianCurrency(inputs.monthlyIncome)}/mo salary).
            </div>
          </div>
          <button
            onClick={() => {
              setFormInputs({ ...inputs });
              setEditModalOpen(true);
            }}
            className="text-xs font-bold text-teal-800 hover:text-teal-950 underline self-start sm:self-auto cursor-pointer"
          >
            Enter your exact family figures →
          </button>
        </div>
      )}

      {/* 5 Sections / Tabs Navigation */}
      <div className="flex items-center overflow-x-auto pb-1 gap-1 border-b border-brand-border text-xs font-bold">
        {[
          { id: 'summary', label: 'Protection Summary', icon: ShieldCheck },
          { id: 'goals', label: 'Financial Goals', icon: Target },
          { id: '10year', label: '10-Year Outlook', icon: Calendar },
          { id: '20year', label: '20-Year Outlook', icon: TrendingUp },
          { id: 'scenarios', label: 'Explore Scenarios', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                isActive
                  ? 'border-brand-teal text-brand-navy bg-white shadow-xs font-black'
                  : 'border-transparent text-brand-textSecondary hover:text-brand-navy hover:bg-slate-50 font-semibold'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-teal' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 1. PROTECTION SUMMARY TAB                                 */}
      {/* ========================================================= */}
      {activeTab === 'summary' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Visual Gap Card */}
          <div className="bg-gradient-to-br from-white via-teal-50/25 to-blue-50/30 rounded-2xl p-6 sm:p-8 border-2 border-teal-200/80 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-md">
                  Total Protection Need
                </span>
                <p className="text-3xl sm:text-4xl font-black text-brand-navy mt-1">
                  {formatIndianCurrency(result.totalProtectionNeed, true)}
                </p>
                <p className="text-xs text-brand-textSecondary mt-0.5">
                  Calculated based on {inputs.dependantsCount} dependents over {inputs.supportDurationYears} years with {(inputs.annualExpenseInflationRate * 100).toFixed(0)}% annual inflation.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs bg-white/80 p-3 rounded-xl border border-teal-100 shadow-xs">
                <div>
                  <span className="text-[10px] text-brand-textSecondary block uppercase font-medium">Existing Coverage</span>
                  <span className="font-extrabold text-brand-navy text-sm">{formatIndianCurrency(result.existingTotalCoverage, true)}</span>
                </div>
                <div className="h-7 w-px bg-slate-200" />
                <div>
                  <span className="text-[10px] text-red-600 block uppercase font-medium">Uncovered Gap</span>
                  <span className="font-extrabold text-red-700 text-sm">{formatIndianCurrency(gap, true)}</span>
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

            {/* Employer Cover Portability Risk Alert */}
            {employer > 0 && (
              <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5 shadow-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>Employer Coverage Advisory:</strong> Your ₹{formatIndianCurrency(employer, true)} employer insurance is tied to your job. It terminates if you switch employers or retire. Experts recommend securing an individual pure term plan as your permanent foundation.
                </p>
              </div>
            )}
          </div>

          {/* Mathematical Breakdown of Protection Responsibilities */}
          <div className="bg-white rounded-2xl p-6 border-2 border-brand-border shadow-subtle space-y-4">
            <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-teal" /> Transparent Calculation Breakdown
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-gradient-to-br from-white to-blue-50/70 border-2 border-blue-200/80 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-blue-700 block">Future Living Costs</span>
                <span className="text-lg font-black text-brand-navy block mt-1">
                  {formatIndianCurrency(result.futureFamilySupportTotal, true)}
                </span>
                <span className="text-[10px] text-brand-textSecondary">Monthly ₹{formatIndianCurrency(inputs.monthlyExpenses)} × {inputs.supportDurationYears} yrs</span>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-white to-amber-50/70 border-2 border-amber-200/80 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-amber-700 block">Outstanding Debts</span>
                <span className="text-lg font-black text-brand-navy block mt-1">
                  {formatIndianCurrency(result.outstandingLiabilitiesTotal, true)}
                </span>
                <span className="text-[10px] text-brand-textSecondary">Home & personal loans</span>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-white to-purple-50/70 border-2 border-purple-200/80 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-purple-700 block">Education & Commitments</span>
                <span className="text-lg font-black text-brand-navy block mt-1">
                  {formatIndianCurrency(result.futureCommitmentsTotal, true)}
                </span>
                <span className="text-[10px] text-brand-textSecondary">Higher education fund</span>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-white to-emerald-50/70 border-2 border-emerald-200/80 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-emerald-800 block">Liquid Assets (Offset)</span>
                <span className="text-lg font-black text-emerald-900 block mt-1">
                  - {formatIndianCurrency(result.eligibleAssetsConsidered, true)}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">Savings & investments</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-brand-border">
              <span className="text-xs text-brand-textSecondary">
                Need to close this gap? Explore verified term schemes side-by-side.
              </span>
              <button
                onClick={() => navigate('/schemes')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-md shadow-teal-500/20 transition-all cursor-pointer"
              >
                <span>Browse Verified Pure Term Schemes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. FINANCIAL GOALS TAB                                    */}
      {/* ========================================================= */}
      {activeTab === 'goals' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 border-2 border-brand-border shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-navy">Core Life Goals & Protection Timeline</h3>
                <p className="text-xs text-brand-textSecondary">
                  Key financial milestones your life plan is safeguarding.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl border-2 border-emerald-200/80 bg-gradient-to-br from-white via-white to-emerald-50/40 space-y-2 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-brand-navy">Family Income Replacement</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Highest Priority
                  </span>
                </div>
                <p className="text-xs text-brand-textSecondary leading-relaxed">
                  Guarantees {inputs.supportDurationYears} years of monthly living costs for dependents in case of income disruption.
                </p>
                <div className="text-xs font-black text-brand-navy pt-1">
                  Target Cover: <span className="text-emerald-700">{formatIndianCurrency(result.totalProtectionNeed, true)}</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border-2 border-blue-200/80 bg-gradient-to-br from-white via-white to-blue-50/40 space-y-2 shadow-xs hover:border-blue-400 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                      <Home className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-brand-navy">Home Loan Clearance</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    Mortality Hedged
                  </span>
                </div>
                <p className="text-xs text-brand-textSecondary leading-relaxed">
                  Shields the family home from loan repossession by matching outstanding mortgage liability.
                </p>
                <div className="text-xs font-black text-brand-navy pt-1">
                  Outstanding Debt: <span className="text-blue-700">{formatIndianCurrency(inputs.outstandingHomeLoan, true)}</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border-2 border-amber-200/80 bg-gradient-to-br from-white via-white to-amber-50/40 space-y-2 shadow-xs hover:border-amber-400 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-brand-navy">Child Higher Education</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    12-Year Horizon
                  </span>
                </div>
                <p className="text-xs text-brand-textSecondary leading-relaxed">
                  Ring-fenced educational milestone reserve protected against inflation and premature demise.
                </p>
                <div className="text-xs font-black text-brand-navy pt-1">
                  Target Corpus: <span className="text-amber-700">{formatIndianCurrency(inputs.futureEducationCommitments || 2000000, true)}</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border-2 border-purple-200/80 bg-gradient-to-br from-white via-white to-purple-50/40 space-y-2 shadow-xs hover:border-purple-400 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500 text-white flex items-center justify-center">
                      <PiggyBank className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-brand-navy">Retirement Wealth</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    Long-Term Growth
                  </span>
                </div>
                <p className="text-xs text-brand-textSecondary leading-relaxed">
                  Systematic monthly compounding via equity mutual funds and provident fund reserves.
                </p>
                <div className="text-xs font-black text-brand-navy pt-1">
                  Monthly Contribution: <span className="text-purple-700">{formatIndianCurrency(monthlyContribution)}/month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. 10-YEAR OUTLOOK TAB                                    */}
      {/* ========================================================= */}
      {activeTab === '10year' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 border-2 border-brand-border shadow-subtle space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
              <div>
                <h3 className="text-sm font-bold text-brand-navy">10-Year Wealth Growth Projection</h3>
                <p className="text-xs text-brand-textSecondary">
                  Deterministic compound growth projection for your current monthly savings plan.
                </p>
              </div>

              {/* Nominal vs Real Toggle */}
              <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-brand-border">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border-2 border-sky-200 bg-gradient-to-br from-white to-sky-50/60 space-y-1 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-sky-700">Conservative (6.5% p.a.)</span>
                <p className="text-xl font-black text-brand-navy">
                  {formatIndianCurrency(
                    viewMetric === 'nominal'
                      ? projection.tenYear.conservative.nominal
                      : projection.tenYear.conservative.real,
                    true
                  )}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Fixed income & PPF style</p>
              </div>

              <div className="p-4 rounded-xl border-2 border-teal-400 bg-gradient-to-br from-white via-teal-50/50 to-emerald-50/50 space-y-1 shadow-md ring-2 ring-teal-500/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-teal-800">Moderate (10.0% p.a.)</span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-teal-500 text-white">Recommended</span>
                </div>
                <p className="text-xl font-black text-brand-navy">
                  {formatIndianCurrency(
                    viewMetric === 'nominal'
                      ? projection.tenYear.moderate.nominal
                      : projection.tenYear.moderate.real,
                    true
                  )}
                </p>
                <p className="text-[10px] text-teal-800 font-medium">Balanced multi-asset portfolio</p>
              </div>

              <div className="p-4 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50/60 space-y-1 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-purple-700">Aggressive (12.5% p.a.)</span>
                <p className="text-xl font-black text-brand-navy">
                  {formatIndianCurrency(
                    viewMetric === 'nominal'
                      ? projection.tenYear.aggressive.nominal
                      : projection.tenYear.aggressive.real,
                    true
                  )}
                </p>
                <p className="text-[10px] text-purple-800 font-medium">Equity index & growth assets</p>
              </div>
            </div>

            {/* 10-Year Growth Area Chart */}
            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData10} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMod10" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5A4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0EA5A4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis 
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} 
                    tick={{ fontSize: 11, fill: '#64748B' }} 
                  />
                  <Tooltip 
                    formatter={(val: any) => [formatIndianCurrency(Number(val)), '']} 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="conservative" name="Conservative (6.5%)" stroke="#94A3B8" fill="#F1F5F9" />
                  <Area type="monotone" dataKey="moderate" name="Moderate (10.0%)" stroke="#0EA5A4" fill="url(#colorMod10)" />
                  <Area type="monotone" dataKey="aggressive" name="Aggressive (12.5%)" stroke="#0B2545" fill="none" strokeDasharray="3 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. 20-YEAR OUTLOOK TAB                                    */}
      {/* ========================================================= */}
      {activeTab === '20year' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 border-2 border-brand-border shadow-subtle space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
              <div>
                <h3 className="text-sm font-bold text-brand-navy">20-Year Long-Term Horizon Projection</h3>
                <p className="text-xs text-brand-textSecondary">
                  See the exponential power of disciplined monthly compounding over two decades.
                </p>
              </div>

              {/* Nominal vs Real Toggle */}
              <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-brand-border">
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

            {/* 3 Scenario Cards at Year 20 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border-2 border-sky-200 bg-gradient-to-br from-white to-sky-50/60 space-y-1 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-sky-700">Conservative (6.5% p.a.)</span>
                <p className="text-xl font-black text-brand-navy">
                  {formatIndianCurrency(
                    viewMetric === 'nominal'
                      ? projection.twentyYear.conservative.nominal
                      : projection.twentyYear.conservative.real,
                    true
                  )}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Total Invested: ₹{( (initialSavings + monthlyContribution * 240) / 10000000 ).toFixed(2)} Cr</p>
              </div>

              <div className="p-4 rounded-xl border-2 border-teal-400 bg-gradient-to-br from-white via-teal-50/50 to-emerald-50/50 space-y-1 shadow-md ring-2 ring-teal-500/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-teal-800">Moderate (10.0% p.a.)</span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-teal-500 text-white">Recommended</span>
                </div>
                <p className="text-xl font-black text-brand-navy">
                  {formatIndianCurrency(
                    viewMetric === 'nominal'
                      ? projection.twentyYear.moderate.nominal
                      : projection.twentyYear.moderate.real,
                    true
                  )}
                </p>
                <p className="text-[10px] text-teal-800 font-medium">Balanced Wealth Multiplier</p>
              </div>

              <div className="p-4 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50/60 space-y-1 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-purple-700">Aggressive (12.5% p.a.)</span>
                <p className="text-xl font-black text-brand-navy">
                  {formatIndianCurrency(
                    viewMetric === 'nominal'
                      ? projection.twentyYear.aggressive.nominal
                      : projection.twentyYear.aggressive.real,
                    true
                  )}
                </p>
                <p className="text-[10px] text-purple-800 font-medium">High Equity Diversification</p>
              </div>
            </div>

            {/* 20-Year Growth Area Chart */}
            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData20} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMod20" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5A4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0EA5A4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis 
                    tickFormatter={(val) => `₹${(val / 10000000).toFixed(1)}Cr`} 
                    tick={{ fontSize: 11, fill: '#64748B' }} 
                  />
                  <Tooltip 
                    formatter={(val: any) => [formatIndianCurrency(Number(val)), '']} 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="conservative" name="Conservative (6.5%)" stroke="#94A3B8" fill="#F1F5F9" />
                  <Area type="monotone" dataKey="moderate" name="Moderate (10.0%)" stroke="#0EA5A4" fill="url(#colorMod20)" />
                  <Area type="monotone" dataKey="aggressive" name="Aggressive (12.5%)" stroke="#0B2545" fill="none" strokeDasharray="3 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. EXPLORE SCENARIOS TAB                                  */}
      {/* ========================================================= */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 border-2 border-brand-border shadow-subtle space-y-6">
            <div>
              <h3 className="text-sm font-bold text-brand-navy">Interactive Growth Scenario Explorer</h3>
              <p className="text-xs text-brand-textSecondary">
                Test adjustments to your monthly savings, initial capital, and inflation assumptions.
              </p>
            </div>

            {/* Interactive Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/20 border-2 border-teal-200/60 text-xs shadow-xs">
              <div className="space-y-2">
                <div className="flex justify-between font-semibold text-brand-navy">
                  <span>Monthly Contribution</span>
                  <span className="font-extrabold text-brand-teal text-sm">{formatIndianCurrency(monthlyContribution)}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="150000"
                  step="5000"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full accent-brand-teal cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-semibold text-brand-navy">
                  <span>Initial Savings</span>
                  <span className="font-extrabold text-brand-teal text-sm">{formatIndianCurrency(initialSavings, true)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="50000"
                  value={initialSavings}
                  onChange={(e) => setInitialSavings(Number(e.target.value))}
                  className="w-full accent-brand-teal cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-semibold text-brand-navy">
                  <span>Inflation Assumption</span>
                  <span className="font-extrabold text-brand-teal text-sm">{(inflationRate * 100).toFixed(1)}% / yr</span>
                </div>
                <input
                  type="range"
                  min="0.04"
                  max="0.09"
                  step="0.005"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="w-full accent-brand-teal cursor-pointer"
                />
              </div>
            </div>

            {/* Save Scenario Action */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setShowFormulas(!showFormulas)}
                className="text-xs font-semibold text-brand-teal hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{showFormulas ? 'Hide Mathematical Formulas' : 'View Transparent Formulas'}</span>
              </button>

              <button
                onClick={handleSaveScenario}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-md shadow-teal-500/20 transition-all cursor-pointer"
              >
                {saveSuccess ? <Check className="w-3.5 h-3.5 text-white" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{saveSuccess ? 'Scenario Saved!' : 'Save This Scenario'}</span>
              </button>
            </div>

            {/* Expandable Formulas Accordion */}
            {showFormulas && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-brand-navy space-y-2 animate-in fade-in">
                <p className="font-bold">Compound Growth Formula with Monthly Contributions:</p>
                <code className="block p-2 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-700">
                  A = P × (1 + r/12)^(12 × t) + PMT × [ ((1 + r/12)^(12 × t) - 1) / (r/12) ]
                </code>
                <p className="text-[11px] text-brand-textSecondary leading-relaxed">
                  Where <em>P</em> = Initial savings (₹{formatIndianCurrency(initialSavings)}), <em>PMT</em> = Monthly contribution (₹{formatIndianCurrency(monthlyContribution)}), <em>r</em> = Annualized expected return rate, <em>t</em> = Time horizon in years.
                </p>
              </div>
            )}

            {/* Saved Scenarios List */}
            {savedScenarios.length > 0 && (
              <div className="pt-4 border-t border-brand-border space-y-3">
                <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                  Saved Scenarios on Your Account ({savedScenarios.length})
                </h4>
                <div className="space-y-2">
                  {savedScenarios.map((sc) => (
                    <div key={sc.id} className="p-3.5 rounded-xl border-2 border-teal-100 bg-gradient-to-r from-white to-teal-50/30 flex items-center justify-between text-xs shadow-xs">
                      <div>
                        <span className="font-bold text-brand-navy">{sc.scenarioName}</span>
                        <p className="text-[11px] text-brand-textSecondary mt-0.5">{sc.description}</p>
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
      {/* CUSTOMIZE FINANCIAL INPUTS MODAL                          */}
      {/* ========================================================= */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border-2 border-teal-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-navy">Customize Your Financial Plan</h3>
                  <p className="text-xs text-brand-textSecondary">Adjust any numbers below to see instant actuarial calculations</p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-brand-navy hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyCustomInputs} className="space-y-4">
              {/* Category 1: Family & Timeline */}
              <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">1. Family & Timeline</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-brand-navy font-semibold mb-1">Your Age</label>
                    <input
                      type="number"
                      min={18}
                      max={75}
                      value={formInputs.age}
                      onChange={(e) => setFormInputs({ ...formInputs, age: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-brand-navy focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-navy font-semibold mb-1">Dependents Count</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={formInputs.dependantsCount}
                      onChange={(e) => setFormInputs({ ...formInputs, dependantsCount: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-brand-navy focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-navy font-semibold mb-1">Support Duration (Years)</label>
                    <input
                      type="number"
                      min={5}
                      max={40}
                      value={formInputs.supportDurationYears}
                      onChange={(e) => setFormInputs({ ...formInputs, supportDurationYears: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-brand-navy focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                </div>
              </div>

              {/* Category 2: Income & Expenses */}
              <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800">2. Monthly Cashflow</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-brand-navy font-semibold mb-1">Monthly Take-Home (₹)</label>
                    <input
                      type="number"
                      step={5000}
                      value={formInputs.monthlyIncome}
                      onChange={(e) => setFormInputs({ ...formInputs, monthlyIncome: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-brand-navy focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-navy font-semibold mb-1">Monthly Expenses (₹)</label>
                    <input
                      type="number"
                      step={2000}
                      value={formInputs.monthlyExpenses}
                      onChange={(e) => setFormInputs({ ...formInputs, monthlyExpenses: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-brand-navy focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-navy font-semibold mb-1">Annual Inflation (%)</label>
                    <input
                      type="number"
                      step={0.5}
                      min={3}
                      max={12}
                      value={(formInputs.annualExpenseInflationRate * 100).toFixed(1)}
                      onChange={(e) => setFormInputs({ ...formInputs, annualExpenseInflationRate: Number(e.target.value) / 100 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-brand-navy focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                </div>
              </div>

              {/* Category 3: Debts & Goals */}
              <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">3. Liabilities & Milestones</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-brand-navy font-semibold mb-1">Home Loan Balance (₹)</label>
                    <input
                      type="number"
                      step={50000}
                      value={formInputs.outstandingHomeLoan}
                      onChange={(e) => setFormInputs({ ...formInputs, outstandingHomeLoan: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-brand-navy focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-navy font-semibold mb-1">Education Fund Goal (₹)</label>
                    <input
                      type="number"
                      step={50000}
                      value={formInputs.futureEducationCommitments}
                      onChange={(e) => setFormInputs({ ...formInputs, futureEducationCommitments: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-brand-navy focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                </div>
              </div>

              {/* Category 4: Existing Safety Net */}
              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">4. Existing Safety Net</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-brand-navy font-semibold mb-1">Liquid Savings (₹)</label>
                    <input
                      type="number"
                      step={25000}
                      value={formInputs.liquidSavingsAndInvestments}
                      onChange={(e) => setFormInputs({ ...formInputs, liquidSavingsAndInvestments: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-brand-navy focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-navy font-semibold mb-1">Employer Term Cover (₹)</label>
                    <input
                      type="number"
                      step={50000}
                      value={formInputs.existingEmployerTermInsurance}
                      onChange={(e) => setFormInputs({ ...formInputs, existingEmployerTermInsurance: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-brand-navy focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-navy font-semibold mb-1">Individual Term Cover (₹)</label>
                    <input
                      type="number"
                      step={50000}
                      value={formInputs.existingIndividualTermInsurance}
                      onChange={(e) => setFormInputs({ ...formInputs, existingIndividualTermInsurance: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-brand-navy focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-brand-navy hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-md shadow-teal-500/25 transition-all cursor-pointer"
                >
                  Recalculate & Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
