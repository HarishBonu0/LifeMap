import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { FinancialAssessmentInputs, InsuranceNeedsResult } from '../../types';
import { calculateInsuranceNeeds, formatIndianCurrency } from '../../lib/calculator';
import { DEMO_PROFILES, DemoProfilePackage } from '../../data/demoProfiles';
import {
  LayoutDashboard, ShieldCheck, ShieldAlert, TrendingUp, Users,
  ArrowRight, Sparkles, BarChart3, Home, GraduationCap,
  PiggyBank, Building2, User, ChevronRight
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeProfile, setActiveProfile] = useState<DemoProfilePackage>(DEMO_PROFILES[0]);
  const [result, setResult] = useState<InsuranceNeedsResult | null>(null);
  const [inputs, setInputs] = useState<FinancialAssessmentInputs | null>(null);

  useEffect(() => {
    // Try to load from session first, otherwise use active demo profile
    const stored = sessionStorage.getItem('lifemap_assessment');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setInputs(parsed);
        setResult(calculateInsuranceNeeds(parsed));
        return;
      } catch {}
    }
    setInputs(activeProfile.inputs);
    setResult(calculateInsuranceNeeds(activeProfile.inputs));
  }, [activeProfile]);

  const switchProfile = (profile: DemoProfilePackage) => {
    setActiveProfile(profile);
    setInputs(profile.inputs);
    setResult(calculateInsuranceNeeds(profile.inputs));
    sessionStorage.setItem('lifemap_assessment', JSON.stringify(profile.inputs));
  };

  if (!result || !inputs) return null;

  const statusColors = {
    critical_shortfall: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    moderate_shortfall: { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    adequately_covered: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    surplus_coverage: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  };
  const sc = statusColors[result.coverageStatus];

  return (
    <div className="space-y-8 py-4">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-5 h-5 text-brand-teal" />
            <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            {activeProfile.name}'s LifeMap
          </h1>
          <p className="text-xs text-brand-textSecondary mt-1">{activeProfile.tagline}</p>
        </div>
        <Link
          to="/assessment"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight transition-all"
        >
          {t('editInputs')} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Profile Switcher */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {DEMO_PROFILES.map((p) => (
          <button
            key={p.id}
            onClick={() => switchProfile(p)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
              activeProfile.id === p.id
                ? 'bg-brand-navy text-white border-brand-navy shadow-subtle'
                : 'bg-white text-brand-navy border-brand-border hover:border-brand-teal'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-brand-navyDark to-brand-navy rounded-2xl p-5 text-white shadow-float border border-brand-teal/20">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-brand-tealLight" />
            <span className="text-[10px] font-bold tracking-wider text-brand-tealLight uppercase">{t('protectionNeed')}</span>
          </div>
          <p className="text-2xl font-black text-brand-tealLight">{formatIndianCurrency(result.totalProtectionNeed, true)}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-brand-navy" />
            <span className="text-[10px] font-bold tracking-wider text-brand-textSecondary uppercase">{t('grossResponsibilities')}</span>
          </div>
          <p className="text-2xl font-black text-brand-navy">{formatIndianCurrency(result.grossResponsibilities, true)}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-brand-emerald" />
            <span className="text-[10px] font-bold tracking-wider text-brand-textSecondary uppercase">{t('existingCoverage')}</span>
          </div>
          <p className="text-2xl font-black text-brand-navy">{formatIndianCurrency(result.existingTotalCoverage, true)}</p>
          <div className="flex gap-2 mt-1 text-[10px]">
            <span className="text-emerald-600 font-bold">Own: {formatIndianCurrency(result.existingIndividualCoverage, true)}</span>
            <span className="text-amber-600 font-bold">Emp: {formatIndianCurrency(result.existingEmployerCoverage, true)}</span>
          </div>
        </div>

        <div className={`rounded-2xl p-5 border shadow-card ${sc.bg} ${sc.border}`}>
          <div className="flex items-center gap-2 mb-3">
            {result.coverageGap > 0 ? <ShieldAlert className={`w-4 h-4 ${sc.text}`} /> : <ShieldCheck className={`w-4 h-4 ${sc.text}`} />}
            <span className="text-[10px] font-bold tracking-wider text-brand-textSecondary uppercase">{t('coverageGap')}</span>
          </div>
          <p className={`text-2xl font-black ${sc.text}`}>{formatIndianCurrency(result.coverageGap, true)}</p>
        </div>
      </div>

      {/* Key Breakdown & Goals Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-brand-navy">Financial Responsibilities</h3>
          <div className="space-y-3">
            {[
              { label: 'Family Living Support', value: result.futureFamilySupportTotal, icon: Users, color: 'text-brand-teal', bg: 'bg-teal-50' },
              { label: 'Home Loan', value: inputs.outstandingHomeLoan, icon: Home, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Other Loans', value: inputs.outstandingOtherLoans, icon: PiggyBank, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Education & Milestones', value: result.futureCommitmentsTotal, icon: GraduationCap, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Liquid Assets (Offset)', value: -result.eligibleAssetsConsidered, icon: PiggyBank, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].filter(item => item.value !== 0).map((item, i) => {
              const Icon = item.icon;
              const isNeg = item.value < 0;
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <span className="text-xs font-medium text-brand-navy">{item.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${isNeg ? 'text-emerald-600' : 'text-brand-navy'}`}>
                    {isNeg ? '−' : ''}{formatIndianCurrency(Math.abs(item.value), true)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Life Goals */}
        <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-brand-navy">Life Goals</h3>
          {activeProfile.goals.length === 0 ? (
            <p className="text-xs text-brand-textSecondary">No goals configured yet.</p>
          ) : (
            <div className="space-y-3">
              {activeProfile.goals.map((goal) => (
                <div key={goal.id} className="p-4 rounded-xl border border-brand-border hover:shadow-card transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      goal.priority === 'essential' ? 'bg-red-50 text-red-700' :
                      goal.priority === 'high' ? 'bg-amber-50 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {goal.priority.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-brand-teal">{formatIndianCurrency(goal.targetAmount, true)}</span>
                  </div>
                  <h4 className="text-xs font-bold text-brand-navy">{goal.title}</h4>
                  <p className="text-[10px] text-brand-textSecondary">{goal.description}</p>
                  <span className="text-[10px] text-brand-textSecondary">Target: {goal.targetYears} years</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Primary Drivers */}
      <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-subtle space-y-3">
        <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-teal" /> Key Insights & Drivers
        </h3>
        {result.primaryDrivers.map((d, i) => (
          <div key={i} className="flex gap-2.5 text-xs text-brand-textSecondary leading-relaxed">
            <Sparkles className="w-3.5 h-3.5 text-brand-amber flex-shrink-0 mt-0.5" />
            <span>{d}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Assessment', to: '/assessment', icon: User, color: 'text-brand-navy' },
          { label: 'Calculator', to: '/calculator', icon: BarChart3, color: 'text-brand-teal' },
          { label: 'Simulator', to: '/simulator', icon: TrendingUp, color: 'text-brand-blue' },
          { label: 'Games', to: '/games', icon: Sparkles, color: 'text-brand-amber' },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className="group bg-white rounded-xl p-4 border border-brand-border shadow-subtle hover:shadow-card hover:-translate-y-0.5 transition-all text-center space-y-2"
            >
              <Icon className={`w-6 h-6 mx-auto ${action.color} group-hover:scale-110 transition-transform`} />
              <span className="text-xs font-bold text-brand-navy">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
