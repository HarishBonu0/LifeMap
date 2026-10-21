import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { InsuranceNeedsResult } from '../../types';
import { calculateInsuranceNeeds, formatIndianCurrency, sanitizeFinancialInputs } from '../../lib/calculator';
import { DEMO_PROFILES } from '../../data/demoProfiles';
import { ArrowRight, AlertTriangle } from 'lucide-react';

export const CoveragePage: React.FC = () => {
  const { t } = useTranslation();
  const [result, setResult] = useState<InsuranceNeedsResult | null>(null);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('lifemap_result');
    if (storedResult) {
      try {
        setResult(JSON.parse(storedResult));
        return;
      } catch {}
    }

    const storedInputs = sessionStorage.getItem('lifemap_assessment');
    if (storedInputs) {
      try {
        const parsed = sanitizeFinancialInputs(JSON.parse(storedInputs));
        setResult(calculateInsuranceNeeds(parsed));
        return;
      } catch {}
    }

    setResult(calculateInsuranceNeeds(DEMO_PROFILES[0].inputs));
  }, []);

  if (!result) return null;

  const individual = result.existingIndividualCoverage;
  const employer = result.existingEmployerCoverage;
  const need = Math.max(result.totalProtectionNeed, 1);
  const gap = result.coverageGap;

  const individualPct = Math.min(100, Math.round((individual / need) * 100));
  const employerPct = Math.min(100 - individualPct, Math.round((employer / need) * 100));
  const gapPct = Math.max(0, 100 - individualPct - employerPct);

  const isEmployerOnly = employer > 0 && individual === 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Title & Subtitle */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
          Your Coverage Gap
        </h1>
        <p className="text-xs sm:text-sm text-brand-textSecondary">
          See what you have and what may be missing.
        </p>
      </div>

      {/* Single Clear Visual Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-brand-border shadow-subtle space-y-6">
        {/* Header Summary Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-textSecondary">Total Protection Need</span>
            <p className="text-xl sm:text-2xl font-black text-brand-navy">
              {formatIndianCurrency(result.totalProtectionNeed, true)}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-[10px] text-brand-textSecondary block uppercase font-medium">Existing Coverage</span>
              <span className="font-bold text-brand-navy">{formatIndianCurrency(result.existingTotalCoverage, true)}</span>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] text-red-600 block uppercase font-medium">Uncovered Gap</span>
              <span className="font-bold text-red-700">{formatIndianCurrency(gap, true)}</span>
            </div>
          </div>
        </div>

        {/* One Segmented Progress Bar */}
        <div className="space-y-3">
          <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            {individualPct > 0 && (
              <div
                className="h-full bg-brand-emerald flex items-center justify-center transition-all duration-500"
                style={{ width: `${individualPct}%` }}
                title={`Individual: ${individualPct}%`}
              >
                {individualPct >= 12 && (
                  <span className="text-[10px] font-bold text-white truncate px-1">
                    {individualPct}%
                  </span>
                )}
              </div>
            )}
            {employerPct > 0 && (
              <div
                className="h-full bg-brand-amber flex items-center justify-center transition-all duration-500"
                style={{ width: `${employerPct}%` }}
                title={`Employer: ${employerPct}%`}
              >
                {employerPct >= 12 && (
                  <span className="text-[10px] font-bold text-white truncate px-1">
                    {employerPct}%
                  </span>
                )}
              </div>
            )}
            {gap > 0 && (
              <div
                className="h-full bg-red-400 flex items-center justify-center flex-1 transition-all duration-500"
                title={`Gap: ${gapPct}%`}
              >
                {gapPct >= 12 && (
                  <span className="text-[10px] font-bold text-white truncate px-1">
                    {gapPct}% Gap
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Short Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
            <span className="flex items-center gap-1.5 text-brand-navy">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald" />
              <span>Individual Term ({formatIndianCurrency(individual, true)})</span>
            </span>

            <span className="flex items-center gap-1.5 text-brand-navy">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-amber" />
              <span>Employer Group ({formatIndianCurrency(employer, true)})</span>
            </span>

            <span className="flex items-center gap-1.5 text-red-700 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span>Uncovered Gap ({formatIndianCurrency(gap, true)})</span>
            </span>
          </div>
        </div>

        {/* Compact Breakdown of Amounts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-brand-textSecondary">Individual Term</span>
            <p className="text-base font-black text-brand-navy">{formatIndianCurrency(individual, true)}</p>
            <p className="text-[10px] text-brand-textSecondary">Portable personal policy</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-brand-textSecondary">Employer Cover</span>
            <p className="text-base font-black text-brand-navy">{formatIndianCurrency(employer, true)}</p>
            <p className="text-[10px] text-brand-textSecondary">Active only during employment</p>
          </div>

          <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-red-600">Net Protection Gap</span>
            <p className="text-base font-black text-red-700">{formatIndianCurrency(gap, true)}</p>
            <p className="text-[10px] text-red-600">Additional safety net recommended</p>
          </div>
        </div>

        {/* Portability Note if Employer Dependent */}
        {isEmployerOnly && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Notice:</strong> Your current life coverage is entirely tied to your job. If you resign, change employers, or retire, coverage ends immediately.
            </p>
          </div>
        )}
      </div>

      {/* Two Actions Only */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/simulator"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle transition-all"
        >
          <span>Explore Scenarios</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/assessment"
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl text-xs font-semibold text-brand-navy border border-brand-border bg-white hover:bg-slate-50 transition-colors"
        >
          Edit Plan
        </Link>
      </div>

      {/* Concise Educational Disclaimer */}
      <p className="text-[10px] text-center text-brand-textSecondary italic max-w-xl mx-auto">
        Educational analysis based on user inputs. LifeMap does not solicit or sell insurance products.
      </p>
    </div>
  );
};
