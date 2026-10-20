import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { InsuranceNeedsResult, FinancialAssessmentInputs } from '../../types';
import { calculateInsuranceNeeds, formatIndianCurrency } from '../../lib/calculator';
import { DEMO_PROFILES } from '../../data/demoProfiles';
import {
  ShieldCheck, ShieldAlert, Building2, User, AlertTriangle,
  ArrowRight, Info, TrendingDown, Lock
} from 'lucide-react';

export const CoveragePage: React.FC = () => {
  const { t } = useTranslation();
  const [result, setResult] = useState<InsuranceNeedsResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('lifemap_result');
    if (stored) {
      try { setResult(JSON.parse(stored)); } catch {}
    } else {
      const storedInputs = sessionStorage.getItem('lifemap_assessment');
      if (storedInputs) {
        try { setResult(calculateInsuranceNeeds(JSON.parse(storedInputs))); } catch {}
      } else {
        setResult(calculateInsuranceNeeds(DEMO_PROFILES[0].inputs));
      }
    }
  }, []);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-sm text-brand-textSecondary">No calculation data available.</p>
        <Link to="/assessment" className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-navy">Start Assessment</Link>
      </div>
    );
  }

  const individual = result.existingIndividualCoverage;
  const employer = result.existingEmployerCoverage;
  const total = result.existingTotalCoverage;
  const gap = result.coverageGap;
  const need = result.totalProtectionNeed;
  const employerPct = total > 0 ? Math.round((employer / total) * 100) : 0;
  const individualPct = total > 0 ? Math.round((individual / total) * 100) : 0;

  const isFullyEmployerDependent = employer > 0 && individual === 0;
  const gapPct = need > 0 ? Math.min(100, Math.round((gap / need) * 100)) : 0;
  const coveredPct = 100 - gapPct;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">Coverage Gap Analysis</h1>
        <p className="text-sm text-brand-textSecondary">
          Compare your existing protection against calculated needs and identify your true shortfall.
        </p>
      </div>

      {/* Visual Gap Meter */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-brand-border shadow-card space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-brand-navy">Protection Coverage vs Need</h3>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            gap > 0 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
          }`}>
            {gap > 0 ? `${gapPct}% Shortfall` : 'Adequately Covered'}
          </span>
        </div>

        {/* Stacked Bar */}
        <div className="space-y-2">
          <div className="h-8 bg-slate-100 rounded-full overflow-hidden flex">
            {individualPct > 0 && (
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-center transition-all duration-700"
                style={{ width: `${Math.max(2, (individual / need) * 100)}%` }}
              >
                <span className="text-[9px] font-bold text-white truncate px-1">Individual</span>
              </div>
            )}
            {employerPct > 0 && (
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-300 flex items-center justify-center transition-all duration-700"
                style={{ width: `${Math.max(2, (employer / need) * 100)}%` }}
              >
                <span className="text-[9px] font-bold text-amber-900 truncate px-1">Employer</span>
              </div>
            )}
            {gap > 0 && (
              <div
                className="h-full bg-gradient-to-r from-red-400 to-red-300 flex items-center justify-center flex-1 transition-all duration-700"
              >
                <span className="text-[9px] font-bold text-white truncate px-1">Gap: {formatIndianCurrency(gap, true)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-brand-textSecondary">
            <span>₹0</span>
            <span>Need: {formatIndianCurrency(need, true)}</span>
          </div>
        </div>

        {/* Coverage Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="rounded-xl p-4 bg-emerald-50 border border-emerald-200 space-y-1">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Individual Term</span>
            </div>
            <p className="text-xl font-black text-emerald-700">{formatIndianCurrency(individual, true)}</p>
            <p className="text-[10px] text-emerald-600">Portable, stays with you</p>
          </div>

          <div className="rounded-xl p-4 bg-amber-50 border border-amber-200 space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] font-bold text-amber-700 uppercase">Employer Group</span>
            </div>
            <p className="text-xl font-black text-amber-700">{formatIndianCurrency(employer, true)}</p>
            <p className="text-[10px] text-amber-600">Ends when you leave job</p>
          </div>

          <div className={`rounded-xl p-4 space-y-1 ${gap > 0 ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center gap-2">
              {gap > 0 ? <ShieldAlert className="w-4 h-4 text-red-600" /> : <ShieldCheck className="w-4 h-4 text-blue-600" />}
              <span className={`text-[10px] font-bold uppercase ${gap > 0 ? 'text-red-700' : 'text-blue-700'}`}>
                {gap > 0 ? 'Shortfall' : 'Surplus'}
              </span>
            </div>
            <p className={`text-xl font-black ${gap > 0 ? 'text-red-700' : 'text-blue-700'}`}>
              {formatIndianCurrency(gap, true)}
            </p>
            <p className={`text-[10px] ${gap > 0 ? 'text-red-600' : 'text-blue-600'}`}>
              {gap > 0 ? 'Additional cover needed' : 'Coverage exceeds need'}
            </p>
          </div>
        </div>
      </div>

      {/* Employer Dependency Warning */}
      {isFullyEmployerDependent && (
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 shadow-subtle flex gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-amber-800">{t('employerWarningTitle')}</h3>
            <p className="text-xs text-amber-700 leading-relaxed">{t('employerWarningDesc')}</p>
            <div className="bg-white rounded-xl p-4 border border-amber-200 mt-3 space-y-2">
              <h4 className="text-xs font-bold text-brand-navy">What happens if you lose employer cover?</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-emerald-50">
                  <p className="text-[10px] text-brand-textSecondary">Current Total Cover</p>
                  <p className="text-sm font-bold text-emerald-700">{formatIndianCurrency(total, true)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-50">
                  <p className="text-[10px] text-brand-textSecondary">After Job Change</p>
                  <p className="text-sm font-bold text-red-700">{formatIndianCurrency(individual, true)}</p>
                </div>
              </div>
              <p className="text-[10px] text-amber-600 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                {formatIndianCurrency(employer, true)} coverage disappears instantly on resignation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Note */}
      <div className="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <Lock className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-brand-textSecondary leading-relaxed">
          LifeMap does not sell insurance, collect your PAN/Aadhaar, or share data with brokers. This analysis is purely educational.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/simulator"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-extrabold text-brand-navyDark bg-gradient-to-r from-brand-tealLight to-brand-emerald hover:brightness-105 shadow-float transition-all"
        >
          Simulate Future Scenarios <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/calculator"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-brand-navy bg-slate-100 hover:bg-slate-200 transition-all"
        >
          Back to Calculator
        </Link>
      </div>
    </div>
  );
};
