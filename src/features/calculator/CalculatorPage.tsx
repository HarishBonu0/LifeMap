import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { FinancialAssessmentInputs, InsuranceNeedsResult } from '../../types';
import { calculateInsuranceNeeds, formatIndianCurrency, sanitizeFinancialInputs } from '../../lib/calculator';
import { DEMO_PROFILES } from '../../data/demoProfiles';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Info,
  Minus,
  Plus,
  BarChart3,
  Sparkles
} from 'lucide-react';

export const CalculatorPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [result, setResult] = useState<InsuranceNeedsResult | null>(null);
  const [inputs, setInputs] = useState<FinancialAssessmentInputs | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showAssumptions, setShowAssumptions] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('lifemap_assessment');
    if (stored) {
      try {
        const parsed = sanitizeFinancialInputs(JSON.parse(stored));
        setInputs(parsed);
        const res = calculateInsuranceNeeds(parsed);
        setResult(res);
        sessionStorage.setItem('lifemap_result', JSON.stringify(res));
        return;
      } catch {}
    }
    const demo = DEMO_PROFILES[0];
    setInputs(demo.inputs);
    const res = calculateInsuranceNeeds(demo.inputs);
    setResult(res);
    sessionStorage.setItem('lifemap_result', JSON.stringify(res));
  }, []);

  const handleContinue = () => {
    if (result) {
      sessionStorage.setItem('lifemap_result', JSON.stringify(result));
      navigate('/coverage');
    }
  };

  if (!result || !inputs) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Plan Workflow Navigation Tabs */}
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-brand-border">
          <Link
            to="/assessment"
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-brand-textSecondary hover:text-brand-navy transition-colors"
          >
            1. Financial Assessment
          </Link>
          <button
            type="button"
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white text-brand-navy shadow-subtle"
          >
            2. Needs Calculator
          </button>
        </div>
      </div>

      {/* Heading */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
          Your Protection Calculation
        </h1>
        <p className="text-xs text-brand-textSecondary">
          Deterministic calculation of your family's financial safety net.
        </p>
      </div>

      {/* 3 Metric Cards Only */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Protection Need (Navy) */}
        <div className="bg-brand-navy text-white rounded-2xl p-5 border border-brand-navy shadow-subtle space-y-1">
          <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">
            Protection Need
          </span>
          <p className="text-2xl sm:text-3xl font-black text-white">
            {formatIndianCurrency(result.totalProtectionNeed, true)}
          </p>
          <p className="text-[11px] text-slate-300">
            {formatIndianCurrency(result.totalProtectionNeed)}
          </p>
        </div>

        {/* Existing Coverage */}
        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-subtle space-y-1">
          <span className="text-[10px] font-bold tracking-wider text-brand-textSecondary uppercase">
            Existing Coverage
          </span>
          <p className="text-2xl sm:text-3xl font-black text-brand-navy">
            {formatIndianCurrency(result.existingTotalCoverage, true)}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-brand-textSecondary mt-1">
            <span>Own: {formatIndianCurrency(result.existingIndividualCoverage, true)}</span>
            <span>•</span>
            <span>Emp: {formatIndianCurrency(result.existingEmployerCoverage, true)}</span>
          </div>
        </div>

        {/* Coverage Gap (Restrained Red) */}
        <div className="bg-red-50/60 rounded-2xl p-5 border border-red-200 shadow-subtle space-y-1">
          <span className="text-[10px] font-bold tracking-wider text-red-600 uppercase">
            Coverage Gap
          </span>
          <p className="text-2xl sm:text-3xl font-black text-red-700">
            {formatIndianCurrency(result.coverageGap, true)}
          </p>
          <p className="text-[11px] text-red-600 font-medium">
            {result.coverageGap > 0 ? 'Unprotected shortfall' : 'Adequately protected'}
          </p>
        </div>
      </div>

      {/* Key Insights (Concise) */}
      {result.primaryDrivers && result.primaryDrivers.length > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-brand-border shadow-subtle space-y-2">
          <span className="text-xs font-bold text-brand-navy flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-amber" /> Key Calculation Insights
          </span>
          <div className="space-y-1.5">
            {result.primaryDrivers.slice(0, 3).map((driver, idx) => (
              <p key={idx} className="text-xs text-brand-textSecondary leading-relaxed">
                • {driver}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Progressive Disclosure: Expandable Detailed Calculation Breakdown */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
          aria-expanded={showBreakdown}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-teal" />
            <span className="text-xs font-bold text-brand-navy">Detailed Calculation Breakdown</span>
          </div>
          {showBreakdown ? <ChevronUp className="w-4 h-4 text-brand-textSecondary" /> : <ChevronDown className="w-4 h-4 text-brand-textSecondary" />}
        </button>

        {showBreakdown && (
          <div className="px-5 pb-5 pt-3 border-t border-brand-border space-y-3 bg-slate-50/40">
            {result.breakdown.filter(item => item.amount !== 0).map((item) => {
              const isNeg = item.type === 'subtraction';
              const absAmt = Math.abs(item.amount);

              return (
                <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-none">
                  <div className="flex items-center gap-2">
                    {isNeg ? <Minus className="w-3 h-3 text-red-500" /> : <Plus className="w-3 h-3 text-emerald-500" />}
                    <span className="text-brand-navy font-medium">{item.label}</span>
                  </div>
                  <span className={`font-bold ${isNeg ? 'text-red-600' : 'text-brand-navy'}`}>
                    {isNeg ? '− ' : '+ '}{formatIndianCurrency(absAmt, true)}
                  </span>
                </div>
              );
            })}

            <div className="pt-2 border-t border-brand-border flex items-center justify-between text-xs">
              <span className="font-bold text-brand-navy">Net Protection Safety Net:</span>
              <span className="font-black text-brand-navy text-sm">{formatIndianCurrency(result.totalProtectionNeed, true)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Progressive Disclosure: Assumptions & Methodology */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden">
        <button
          onClick={() => setShowAssumptions(!showAssumptions)}
          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
          aria-expanded={showAssumptions}
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-brand-teal" />
            <span className="text-xs font-bold text-brand-navy">Assumptions & Methodology</span>
          </div>
          {showAssumptions ? <ChevronUp className="w-4 h-4 text-brand-textSecondary" /> : <ChevronDown className="w-4 h-4 text-brand-textSecondary" />}
        </button>

        {showAssumptions && (
          <div className="px-5 pb-5 pt-3 border-t border-brand-border space-y-2 bg-slate-50/40 text-xs text-brand-textSecondary leading-relaxed">
            {result.assumptions.notes.map((note, idx) => (
              <p key={idx}>• {note}</p>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={handleContinue}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle transition-all"
        >
          <span>View Coverage Gap Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <Link
          to="/assessment"
          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl text-xs font-semibold text-brand-navy border border-brand-border hover:bg-slate-50 transition-colors"
        >
          Edit Assessment
        </Link>
      </div>

      {/* Concise Disclaimer */}
      <p className="text-[10px] text-center text-brand-textSecondary italic max-w-xl mx-auto">
        Estimates based on actuarial present value and current assumptions. Not a binding insurer quote.
      </p>
    </div>
  );
};
