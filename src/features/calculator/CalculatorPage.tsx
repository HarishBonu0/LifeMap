import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { FinancialAssessmentInputs, InsuranceNeedsResult } from '../../types';
import { calculateInsuranceNeeds, formatIndianCurrency, sanitizeFinancialInputs } from '../../lib/calculator';
import { DEMO_PROFILES } from '../../data/demoProfiles';
import {
  ShieldCheck, TrendingUp, AlertTriangle, ArrowRight, ChevronDown,
  ChevronUp, Info, Minus, Plus, BarChart3, Eye
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
        const parsed = JSON.parse(stored);
        const sanitized = sanitizeFinancialInputs(parsed);
        setInputs(sanitized);
        setResult(calculateInsuranceNeeds(sanitized));
      } catch { /* ignore */ }
    } else {
      // Load first demo profile as fallback
      const demo = DEMO_PROFILES[0];
      setInputs(demo.inputs);
      setResult(calculateInsuranceNeeds(demo.inputs));
    }
  }, []);

  const handleContinue = () => {
    if (result && inputs) {
      sessionStorage.setItem('lifemap_result', JSON.stringify(result));
      navigate('/coverage');
    }
  };

  if (!result || !inputs) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-sm text-brand-textSecondary">No assessment data found.</p>
        <Link to="/assessment" className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight transition-all">
          Start Assessment
        </Link>
      </div>
    );
  }

  const statusConfig = {
    critical_shortfall: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, label: t('criticalShortfall') },
    moderate_shortfall: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, label: t('moderateShortfall') },
    adequately_covered: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: ShieldCheck, label: t('adequatelyCovered') },
    surplus_coverage: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: ShieldCheck, label: t('surplus') },
  };

  const status = statusConfig[result.coverageStatus];
  const StatusIcon = status.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">{t('protectionNeed')}</h1>
        <p className="text-sm text-brand-textSecondary">
          Transparent, deterministic calculation of your family's financial safety net.
        </p>
      </div>

      {/* Top-Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-brand-navyDark to-brand-navy rounded-2xl p-6 text-white shadow-float border border-brand-teal/20">
          <span className="text-[10px] font-bold tracking-widest text-brand-tealLight uppercase">{t('protectionNeed')}</span>
          <p className="text-2xl sm:text-3xl font-black text-brand-tealLight mt-2">{formatIndianCurrency(result.totalProtectionNeed, true)}</p>
          <p className="text-[11px] text-slate-300 mt-1">{formatIndianCurrency(result.totalProtectionNeed)}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-card">
          <span className="text-[10px] font-bold tracking-widest text-brand-textSecondary uppercase">{t('existingCoverage')}</span>
          <p className="text-2xl font-black text-brand-navy mt-2">{formatIndianCurrency(result.existingTotalCoverage, true)}</p>
          <div className="flex items-center gap-3 mt-2 text-[10px]">
            <span className="text-brand-emerald font-bold">Individual: {formatIndianCurrency(result.existingIndividualCoverage, true)}</span>
            <span className="text-brand-amber font-bold">Employer: {formatIndianCurrency(result.existingEmployerCoverage, true)}</span>
          </div>
        </div>

        <div className={`rounded-2xl p-6 border shadow-card ${status.bg} ${status.border}`}>
          <span className="text-[10px] font-bold tracking-widest uppercase text-brand-textSecondary">{t('coverageGap')}</span>
          <p className={`text-2xl font-black mt-2 ${status.color}`}>{formatIndianCurrency(result.coverageGap, true)}</p>
          <div className={`flex items-center gap-1.5 mt-2 ${status.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">{status.label}</span>
          </div>
        </div>
      </div>

      {/* Primary Insights */}
      <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
          <Eye className="w-4 h-4 text-brand-teal" /> Key Insights
        </h3>
        <div className="space-y-2">
          {result.primaryDrivers.map((driver, i) => (
            <div key={i} className="flex gap-2.5 text-xs text-brand-textSecondary leading-relaxed">
              <TrendingUp className="w-3.5 h-3.5 text-brand-teal flex-shrink-0 mt-0.5" />
              <span>{driver}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Waterfall Breakdown Toggle */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-card overflow-hidden">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-teal" />
            <span className="text-sm font-bold text-brand-navy">Detailed Calculation Breakdown</span>
          </div>
          {showBreakdown ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showBreakdown && (
          <div className="px-6 pb-6 space-y-3 border-t border-brand-border pt-4">
            {/* Visual Waterfall */}
            <div className="space-y-2">
              {result.breakdown.filter(item => item.amount !== 0).map((item) => {
                const isNeg = item.type === 'subtraction';
                const absAmt = Math.abs(item.amount);
                const maxAmt = Math.max(...result.breakdown.map(b => Math.abs(b.amount)), 1);
                const pct = Math.min(100, (absAmt / maxAmt) * 100);

                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isNeg ? <Minus className="w-3 h-3 text-red-500" /> : <Plus className="w-3 h-3 text-emerald-500" />}
                        <span className="text-xs font-medium text-brand-navy">{item.label}</span>
                      </div>
                      <span className={`text-xs font-bold ${isNeg ? 'text-red-600' : 'text-emerald-600'}`}>
                        {isNeg ? '−' : '+'} {formatIndianCurrency(absAmt, true)}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isNeg ? 'bg-red-400' : 'bg-emerald-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-brand-textSecondary pl-5">{item.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Final Total */}
            <div className="mt-4 pt-4 border-t-2 border-brand-navy flex items-center justify-between">
              <span className="text-sm font-extrabold text-brand-navy">{t('netSafetyNet')}</span>
              <span className="text-lg font-black text-brand-teal">{formatIndianCurrency(result.totalProtectionNeed, true)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Assumptions Toggle */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden">
        <button
          onClick={() => setShowAssumptions(!showAssumptions)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-brand-blue" />
            <span className="text-sm font-bold text-brand-navy">Assumptions & Methodology</span>
          </div>
          {showAssumptions ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showAssumptions && (
          <div className="px-6 pb-5 border-t border-brand-border pt-4 space-y-2">
            {result.assumptions.notes.map((note, i) => (
              <p key={i} className="text-xs text-brand-textSecondary flex gap-2">
                <span className="text-brand-teal font-bold">•</span>
                {note}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handleContinue}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-extrabold text-brand-navyDark bg-gradient-to-r from-brand-tealLight to-brand-emerald hover:brightness-105 shadow-float transition-all"
        >
          View Coverage Gap Analysis <ArrowRight className="w-4 h-4" />
        </button>
        <Link
          to="/assessment"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-brand-navy bg-slate-100 hover:bg-slate-200 transition-all"
        >
          {t('editInputs')}
        </Link>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-center text-brand-textSecondary italic max-w-2xl mx-auto">
        {result.disclaimer}
      </p>
    </div>
  );
};
