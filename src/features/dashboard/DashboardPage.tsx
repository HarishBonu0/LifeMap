import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { FinancialAssessmentInputs, InsuranceNeedsResult } from '../../types';
import { calculateInsuranceNeeds, formatIndianCurrency, sanitizeFinancialInputs, calculateGrowthProjections } from '../../lib/calculator';
import { StorageAdapter } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';
import { assessmentService } from '../../services/assessmentService';
import {
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Users,
  Home,
  GraduationCap,
  PiggyBank,
  Brain,
  TrendingUp,
  MessageSquare,
  Shield,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();

  const [currentUser, setCurrentUser] = useState(() => profile || StorageAdapter.getUserProfile());
  const [inputs, setInputs] = useState<FinancialAssessmentInputs | null>(null);
  const [result, setResult] = useState<InsuranceNeedsResult | null>(null);
  const [mindsetCategory, setMindsetCategory] = useState<string | null>(null);
  const [mindsetScore, setMindsetScore] = useState<number | null>(null);

  useEffect(() => {
    if (profile) setCurrentUser(profile);
  }, [profile]);

  useEffect(() => {
    const stored = sessionStorage.getItem('lifemap_assessment');
    if (stored) {
      try {
        const parsed = sanitizeFinancialInputs(JSON.parse(stored));
        setInputs(parsed);
        setResult(calculateInsuranceNeeds(parsed));
        return;
      } catch {}
    }

    const adapterInputs = StorageAdapter.getAssessmentInputs();
    if (adapterInputs) {
      const sanitized = sanitizeFinancialInputs(adapterInputs);
      setInputs(sanitized);
      setResult(calculateInsuranceNeeds(sanitized));
      return;
    }

    // Default baseline inputs fallback
    const defaultInputs: FinancialAssessmentInputs = {
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
    setInputs(defaultInputs);
    setResult(calculateInsuranceNeeds(defaultInputs));
  }, []);

  useEffect(() => {
    if (user?.id) {
      assessmentService.getOrCreateSession(user.id).then(({ session }) => {
        if (session.status === 'completed') {
          setMindsetCategory(session.mindsetCategory || null);
          setMindsetScore(session.score || null);
        }
      });
    }
  }, [user]);

  if (!result || !inputs) return null;

  const displayName = currentUser.name || user?.email?.split('@')[0] || 'Member';

  // Deterministic 10- and 20-year growth projection summary
  const growthPreview = calculateGrowthProjections({
    initialSavings: inputs.liquidSavingsAndInvestments || 500000,
    monthlyContribution: Math.max(10000, inputs.monthlyIncome - inputs.monthlyExpenses),
    annualInflation: inputs.annualExpenseInflationRate || 0.06,
    baselineProtectionNeed: result.totalProtectionNeed
  });

  return (
    <div className="space-y-8 py-4 max-w-6xl mx-auto">
      {/* Title & Personalized Recommendation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-brand-teal text-[10px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-brand-amber" /> {t('navOverview') || 'Overview'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            {t('welcome') || 'Welcome'}, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-brand-textSecondary mt-0.5">
            {result.coverageGap > 0 ? (
              <span className="text-red-700 font-medium">
                {t('actionRecommended') || 'Action Recommended'}: {t('uncoveredShortfall') || 'Uncovered protection gap of'} <strong>{formatIndianCurrency(result.coverageGap, true)}</strong>.
              </span>
            ) : (
              <span className="text-emerald-700 font-medium">
                {t('protectedBanner') || 'Protected: Your existing coverage meets your calculated family safety net needs.'}
              </span>
            )}
          </p>
        </div>

        <Link
          to="/plan"
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle transition-all"
        >
          <span>{t('viewMyPlan') || 'View My Plan'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Four Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Protection Need (Navy to Indigo Gradient) */}
        <div className="bg-gradient-to-br from-[#0B2545] via-[#103058] to-[#1E3A8A] text-white rounded-2xl p-5 border-2 border-[#1E3A8A] shadow-md space-y-2">
          <span className="text-[10px] font-extrabold tracking-wider text-teal-300 uppercase block">
            {t('protectionNeed') || 'Protection Need'}
          </span>
          <p className="text-2xl sm:text-3xl font-black text-white">
            {formatIndianCurrency(result.totalProtectionNeed, true)}
          </p>
          <p className="text-[11px] text-slate-200">
            {formatIndianCurrency(result.totalProtectionNeed)}
          </p>
        </div>

        {/* 2. Existing Coverage (Emerald Gradient) */}
        <div className="bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/40 rounded-2xl p-5 border-2 border-emerald-200/90 shadow-xs space-y-2 hover:border-emerald-400 transition-all">
          <span className="text-[10px] font-extrabold tracking-wider text-emerald-800 uppercase block">
            {t('existingCoverage') || 'Existing Coverage'}
          </span>
          <p className="text-2xl sm:text-3xl font-black text-brand-navy">
            {formatIndianCurrency(result.existingTotalCoverage, true)}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-brand-textSecondary">
            <span>{t('ownCover') || 'Own'}: <strong className="text-emerald-700">{formatIndianCurrency(result.existingIndividualCoverage, true)}</strong></span>
            <span>•</span>
            <span>{t('empCover') || 'Emp'}: <strong className="text-blue-700">{formatIndianCurrency(result.existingEmployerCoverage, true)}</strong></span>
          </div>
        </div>

        {/* 3. Coverage Gap (Rose/Red Alert Gradient) */}
        <div className="bg-gradient-to-br from-white via-rose-50/50 to-red-50/60 rounded-2xl p-5 border-2 border-rose-300/90 shadow-xs space-y-2 hover:border-rose-400 transition-all">
          <span className="text-[10px] font-extrabold tracking-wider text-rose-700 uppercase block">
            {t('coverageGap') || 'Coverage Gap'}
          </span>
          <p className="text-2xl sm:text-3xl font-black text-red-700">
            {formatIndianCurrency(result.coverageGap, true)}
          </p>
          <p className="text-[11px] text-red-600 font-semibold">
            {result.coverageGap > 0 ? (t('uncoveredShortfall') || '⚠ Uncovered family shortfall') : (t('adequatelyProtected') || '✓ Adequately protected')}
          </p>
        </div>

        {/* 4. Family Responsibilities (Blue Gradient) */}
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-2xl p-5 border-2 border-blue-200/90 shadow-xs space-y-2 hover:border-blue-400 transition-all">
          <span className="text-[10px] font-extrabold tracking-wider text-blue-800 uppercase block">
            {t('familyResponsibilities') || 'Family Responsibilities'}
          </span>
          <p className="text-2xl sm:text-3xl font-black text-brand-navy">
            {formatIndianCurrency(result.grossResponsibilities, true)}
          </p>
          <p className="text-[11px] text-brand-textSecondary font-medium">
            {t('livingSupportDebt') || 'Living support + debt obligations'}
          </p>
        </div>
      </div>

      {/* Assessment Status & 10- & 20-Year Projection Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Mindset Assessment Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-brand-border shadow-subtle flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-navy flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-brand-teal" /> {t('financialMindsetProfile') || 'Financial Mindset Profile'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                mindsetCategory ? 'bg-teal-50 text-brand-teal' : 'bg-amber-50 text-amber-800'
              }`}>
                {mindsetCategory ? (t('completed') || 'Completed') : (t('pending') || 'Pending')}
              </span>
            </div>

            {mindsetCategory ? (
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-brand-navy">{mindsetCategory}</h3>
                <p className="text-xs text-brand-textSecondary leading-relaxed">
                  Your profile demonstrates structured financial discipline. {t('resilienceScore') || 'Resilience score'}: <strong className="text-brand-navy">{mindsetScore}%</strong>.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-brand-navy">{t('discoverMindset') || 'Discover Your Protection Mindset'}</h3>
                <p className="text-xs text-brand-textSecondary leading-relaxed">
                  {t('mindsetPromptSub') || 'Take the randomized assessment to measure your family protection resilience, risk tolerance, and time horizon.'}
                </p>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Link
              to="/learning"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-teal hover:text-brand-tealDark transition-colors"
            >
              <span>{mindsetCategory ? (t('reviewMindsetGames') || 'Review Mindset & Games') : (t('takeMindsetAssessment') || 'Take Mindset Assessment')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 10- & 20-Year Projections Preview */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-brand-border shadow-subtle flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-navy flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-brand-teal" /> {t('tenTwentyYearOutlook') || '10- & 20-Year Growth Projections'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-brand-navy">
                {t('moderatePath') || 'Moderate (10.0%)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-brand-textSecondary block">10-Year Horizon</span>
                <p className="text-base font-black text-brand-navy">
                  {formatIndianCurrency(growthPreview.tenYear.moderate.nominal, true)}
                </p>
                <p className="text-[10px] text-slate-500">
                  Real: {formatIndianCurrency(growthPreview.tenYear.moderate.real, true)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-brand-teal block">20-Year Horizon</span>
                <p className="text-base font-black text-brand-teal">
                  {formatIndianCurrency(growthPreview.twentyYear.moderate.nominal, true)}
                </p>
                <p className="text-[10px] text-teal-800">
                  Real: {formatIndianCurrency(growthPreview.twentyYear.moderate.real, true)}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/plan?tab=10year"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-teal hover:text-brand-tealDark transition-colors"
            >
              <span>{t('exploreGrowthScenarios') || 'Explore Wealth Outlook in My Plan'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-brand-border shadow-subtle space-y-4">
        <h2 className="text-sm font-bold text-brand-navy">
          {t('tabProtection') || 'Financial Protection Breakdown'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {[
              { label: t('stepPersonal') || 'Family Living Support', amount: result.futureFamilySupportTotal, color: 'bg-brand-teal' },
              { label: t('homeLoan') || 'Home Loan Principal', amount: inputs.outstandingHomeLoan, color: 'bg-blue-600' },
              { label: t('educationLabel') || 'Education & Milestones', amount: result.futureCommitmentsTotal, color: 'bg-amber-600' },
              { label: t('savingsLabel') || 'Liquid Assets (Offset)', amount: -result.eligibleAssetsConsidered, color: 'bg-emerald-600' },
            ].filter(item => item.amount !== 0).map((item, idx) => {
              const isOffset = item.amount < 0;
              const absAmt = Math.abs(item.amount);
              const maxAmt = Math.max(result.grossResponsibilities, 1);
              const pct = Math.min(100, Math.round((absAmt / maxAmt) * 100));

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-brand-navy">{item.label}</span>
                    <span className={`font-bold ${isOffset ? 'text-emerald-600' : 'text-brand-navy'}`}>
                      {isOffset ? '− ' : ''}{formatIndianCurrency(absAmt, true)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-brand-textSecondary space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-bold text-brand-navy block">Deterministic Actuarial Logic</span>
              <p className="leading-relaxed text-[11px]">
                LifeMap calculates pure protection requirements by discounting future family living costs with expected inflation (6% p.a.), adding liabilities, and subtracting liquid investments.
              </p>
            </div>
            <Link
              to="/plan"
              className="text-xs font-bold text-brand-teal hover:underline inline-flex items-center gap-1 self-start"
            >
              <span>{t('viewMyPlan') || 'View Full Calculations'}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Primary Navigation Destination Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/schemes"
          className="p-4 rounded-2xl border-2 border-blue-200/90 bg-gradient-to-br from-white via-white to-blue-50/50 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all space-y-2 shadow-xs text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-brand-navy block">{t('navSchemes') || 'Insurance Schemes'}</span>
          <span className="text-[10px] text-brand-textSecondary block">{t('browseSchemesSub') || 'Browse & compare official plans'}</span>
        </Link>

        <Link
          to="/plan"
          className="p-4 rounded-2xl border-2 border-teal-200/90 bg-gradient-to-br from-white via-white to-teal-50/50 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/10 transition-all space-y-2 shadow-xs text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-brand-navy block">{t('navMyPlan') || 'My Plan'}</span>
          <span className="text-[10px] text-brand-textSecondary block">{t('coverageGap') || 'Coverage gap'} & {t('tenTwentyYearOutlook') || 'projections'}</span>
        </Link>

        <Link
          to="/learning"
          className="p-4 rounded-2xl border-2 border-purple-200/90 bg-gradient-to-br from-white via-white to-purple-50/50 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10 transition-all space-y-2 shadow-xs text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Brain className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-brand-navy block">{t('navFinancialLearning') || 'Financial Learning'}</span>
          <span className="text-[10px] text-brand-textSecondary block">{t('discoverMindset') || 'Mindset assessment'} & {t('navGames') || 'challenges'}</span>
        </Link>

        <Link
          to="/chat"
          className="p-4 rounded-2xl border-2 border-amber-200/90 bg-gradient-to-br from-white via-white to-amber-50/50 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 transition-all space-y-2 shadow-xs text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-brand-navy block">{t('navAIAssistant') || 'AI Assistant'}</span>
          <span className="text-[10px] text-brand-textSecondary block">{t('askAiGuideSub') || 'Context-aware advice & history'}</span>
        </Link>
      </div>
    </div>
  );
};
