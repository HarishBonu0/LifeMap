import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Languages, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp,
  Brain
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { formatIndianCurrency } from '../../lib/calculator';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-16 sm:space-y-24 py-4 sm:py-8 max-w-5xl mx-auto">
      {/* 1. Hero Section */}
      <section className="text-center space-y-6 pt-6 sm:pt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-brand-teal text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
          <span>{t('brandName')} • {t('byAspireX')}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-navy tracking-tight leading-[1.12]">
          {t('heroHeadlineMain') || 'Plan for the life you want.'} <br />
          <span className="text-brand-teal">{t('heroHeadlineHighlight') || 'Protect the people you love.'}</span>
        </h1>

        <p className="text-base sm:text-lg text-brand-textSecondary max-w-2xl mx-auto leading-relaxed">
          {t('heroSubheadline') || 'Understand your life insurance needs, explore available plans, and build a financial roadmap around the people and goals that matter most.'}
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle transition-all"
          >
            <span>{t('getStarted') || 'Get Started'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-brand-navy bg-white hover:bg-slate-50 border border-brand-border transition-all"
          >
            <span>{t('exploreHowItWorks') || 'Explore How It Works'}</span>
          </a>
        </div>
      </section>

      {/* 2. Illustrative Coverage Gap Preview */}
      <section className="rounded-2xl border border-brand-border bg-white shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              {t('illustrativeSnapshotBadge') || 'Illustrative Example • Not Your Personal Result'}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-brand-navy mt-1">
              {t('illustrativeSnapshotTitle') || 'Sample Financial Protection Snapshot'}
            </h2>
          </div>
          <span className="text-xs text-brand-textSecondary">
            {t('illustrativeSnapshotSub') || 'Example Profile: 32-yr-old with Home Loan & 2 Dependents'}
          </span>
        </div>

        {/* 4 Sample Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl p-4 bg-brand-navy text-white space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">
              {t('protectionNeed') || 'Protection Need'}
            </span>
            <p className="text-xl sm:text-2xl font-black text-white">{formatIndianCurrency(18500000, true)}</p>
            <p className="text-[10px] text-slate-300">{t('requiredSafetyNet') || 'Required safety net'}</p>
          </div>

          <div className="rounded-xl p-4 bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-textSecondary">
              {t('existingCoverage') || 'Existing Coverage'}
            </span>
            <p className="text-xl sm:text-2xl font-black text-brand-navy">{formatIndianCurrency(5000000, true)}</p>
            <p className="text-[10px] text-brand-textSecondary">{t('employerPlusPersonal') || 'Employer + personal'}</p>
          </div>

          <div className="rounded-xl p-4 bg-red-50/60 border border-red-200 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-red-600">
              {t('coverageGap') || 'Coverage Gap'}
            </span>
            <p className="text-xl sm:text-2xl font-black text-red-700">{formatIndianCurrency(13500000, true)}</p>
            <p className="text-[10px] text-red-600 font-medium">{t('unprotectedShortfall') || 'Unprotected shortfall'}</p>
          </div>

          <div className="rounded-xl p-4 bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-textSecondary">
              {t('grossResponsibilities') || 'Total Responsibilities'}
            </span>
            <p className="text-xl sm:text-2xl font-black text-brand-navy">{formatIndianCurrency(21000000, true)}</p>
            <p className="text-[10px] text-brand-textSecondary">{t('livingCostsPlusLiabilities') || 'Living costs + liabilities'}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-navy">
            <span>{t('financialSnapshot') || 'Illustrative Protection Status'}</span>
            <span className="text-red-600">73% {t('shortfall') || 'Uncovered Shortfall'}</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div className="h-full bg-brand-teal" style={{ width: '27%' }} title="Covered: ₹50.0 L" />
            <div className="h-full bg-red-400 flex-1" title="Uncovered Gap: ₹1.35 Cr" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-brand-textSecondary">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-teal" />
              {t('existingCoverage') || 'Existing Cover'} (₹50 Lakh)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              {t('coverageGap') || 'Shortfall Gap'} (₹1.35 Crore)
            </span>
          </div>
        </div>
      </section>

      {/* 3. The Three Main Steps Journey */}
      <section id="how-it-works" className="space-y-8 scroll-mt-20">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">
            {t('howItWorksHeadline') || 'The LifeMap Journey'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            {t('howItWorksHeadline') || 'Three Steps to Financial Protection'}
          </h2>
          <p className="text-xs sm:text-sm text-brand-textSecondary max-w-xl mx-auto">
            {t('howItWorksSub') || 'We reverse the traditional insurance trap. Understand your genuine family needs before looking at any product.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl border-2 border-teal-200/90 bg-gradient-to-br from-white via-white to-teal-50/40 space-y-3 shadow-xs hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/10 transition-all relative overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-teal-400 to-emerald-500 absolute top-0 left-0" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              01
            </div>
            <h3 className="text-base font-bold text-brand-navy">
              {t('journeyStep1Title') || '1. Map Family Goals'}
            </h3>
            <p className="text-xs text-brand-textSecondary leading-relaxed">
              {t('journeyStep1Desc') || 'Add children milestones, home loan obligations, and dependents to an interactive timeline.'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl border-2 border-blue-200/90 bg-gradient-to-br from-white via-white to-blue-50/40 space-y-3 shadow-xs hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all relative overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-indigo-500 absolute top-0 left-0" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              02
            </div>
            <h3 className="text-base font-bold text-brand-navy">
              {t('journeyStep2Title') || '2. Assess Responsibilities'}
            </h3>
            <p className="text-xs text-brand-textSecondary leading-relaxed">
              {t('journeyStep2Desc') || 'Calculate true living costs factoring 6% annual inflation and liability principal without guesswork.'}
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl border-2 border-purple-200/90 bg-gradient-to-br from-white via-white to-purple-50/40 space-y-3 shadow-xs hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10 transition-all relative overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-purple-400 to-pink-500 absolute top-0 left-0" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              03
            </div>
            <h3 className="text-base font-bold text-brand-navy">
              {t('journeyStep3Title') || '3. Build Your Protection Plan'}
            </h3>
            <p className="text-xs text-brand-textSecondary leading-relaxed">
              {t('journeyStep3Desc') || 'Deterministic present-value calculation of your family\'s genuine safety net.'}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Concise Feature Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl border-2 border-teal-200/80 bg-gradient-to-br from-white via-white to-teal-50/30 space-y-2.5 shadow-xs hover:border-teal-400 transition-all">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-brand-navy">Independent Actuarial Science</h3>
          <p className="text-xs text-brand-textSecondary leading-relaxed">
            Deterministic present-value calculation based on true family living expenses and loans, with zero commission bias or insurer affiliation.
          </p>
        </div>

        <div className="p-5 rounded-2xl border-2 border-blue-200/80 bg-gradient-to-br from-white via-white to-blue-50/30 space-y-2.5 shadow-xs hover:border-blue-400 transition-all">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-brand-navy">Private & User-Scoped Data</h3>
          <p className="text-xs text-brand-textSecondary leading-relaxed">
            Row-Level Security (RLS) ensures your assessment, scenarios, and chat history are exclusively accessible to your authenticated session.
          </p>
        </div>

        <div className="p-5 rounded-2xl border-2 border-amber-200/80 bg-gradient-to-br from-white via-white to-amber-50/30 space-y-2.5 shadow-xs hover:border-amber-400 transition-all">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xs">
            <Languages className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-brand-navy">{t('switchLanguage')}: English, తెలుగు, हिंदी</h3>
          <p className="text-xs text-brand-textSecondary leading-relaxed">
            Full support across English, తెలుగు, and हिंदी for terms, questions, simulations, and AI guide assistance.
          </p>
        </div>
      </section>

      {/* 5. Bottom Call to Action */}
      <section className="rounded-2xl bg-brand-navy text-white p-8 sm:p-12 text-center space-y-5 shadow-card">
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          {t('ctaReadyToPlan') || 'Ready to Protect Your Family\'s Future?'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          {t('ctaSub') || 'Join thousands of Indian families making informed, pressure-free life insurance decisions.'}
        </p>
        <div className="pt-2">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-brand-navy bg-white hover:bg-slate-100 shadow-subtle transition-all"
          >
            <span>{t('getStarted') || 'Get Started Free'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Educational Disclaimer */}
      <section className="pt-4 border-t border-brand-border">
        <p className="text-[11px] text-center text-brand-textSecondary leading-relaxed max-w-2xl mx-auto">
          {t('disclaimerText')}
        </p>
      </section>
    </div>
  );
};
