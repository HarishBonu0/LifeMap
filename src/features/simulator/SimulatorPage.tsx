import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { FinancialAssessmentInputs } from '../../types';
import { compareScenarios, formatIndianCurrency, sanitizeFinancialInputs } from '../../lib/calculator';
import { DEMO_PROFILES } from '../../data/demoProfiles';
import {
  Sliders, Baby, Home, GraduationCap, TrendingUp, ShieldPlus,
  ArrowRight, RotateCcw, ChevronUp, ChevronDown, Zap, BarChart3
} from 'lucide-react';

interface Preset {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  apply: (inputs: FinancialAssessmentInputs) => FinancialAssessmentInputs;
}

export const SimulatorPage: React.FC = () => {
  const { t } = useTranslation();

  const [baselineInputs, setBaselineInputs] = useState<FinancialAssessmentInputs>(
    () => {
      const stored = sessionStorage.getItem('lifemap_assessment');
      if (stored) {
        try { return sanitizeFinancialInputs(JSON.parse(stored)); } catch {}
      }
      return DEMO_PROFILES[0].inputs;
    }
  );

  const [scenarioInputs, setScenarioInputs] = useState<FinancialAssessmentInputs>({ ...baselineInputs });
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const presets: Preset[] = [
    {
      id: 'baseline', label: t('presetCurrent'), icon: BarChart3, color: 'text-slate-600', bg: 'bg-slate-50',
      apply: (inp) => ({ ...inp }),
    },
    {
      id: 'new-child', label: t('presetNewChild'), icon: Baby, color: 'text-pink-600', bg: 'bg-pink-50',
      apply: (inp) => ({
        ...inp,
        dependantsCount: inp.dependantsCount + 1,
        supportDurationYears: Math.max(inp.supportDurationYears, 22),
        monthlyExpenses: Math.round(inp.monthlyExpenses * 1.2),
        futureEducationCommitments: inp.futureEducationCommitments + 2000000,
      }),
    },
    {
      id: 'home-loan', label: t('presetHomeLoan'), icon: Home, color: 'text-blue-600', bg: 'bg-blue-50',
      apply: (inp) => ({
        ...inp,
        outstandingHomeLoan: inp.outstandingHomeLoan + 4000000,
      }),
    },
    {
      id: 'education', label: t('presetHigherEdu'), icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50',
      apply: (inp) => ({
        ...inp,
        futureEducationCommitments: inp.futureEducationCommitments + 2500000,
      }),
    },
    {
      id: 'inflation', label: t('presetHighInflation'), icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50',
      apply: (inp) => ({
        ...inp,
        annualExpenseInflationRate: 0.08,
      }),
    },
    {
      id: 'more-cover', label: t('presetIncreasedCoverage'), icon: ShieldPlus, color: 'text-emerald-600', bg: 'bg-emerald-50',
      apply: (inp) => ({
        ...inp,
        existingIndividualTermInsurance: inp.existingIndividualTermInsurance + 5000000,
      }),
    },
  ];

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    if (preset.id === 'baseline') {
      setScenarioInputs({ ...baselineInputs });
    } else {
      setScenarioInputs(preset.apply({ ...baselineInputs }));
    }
  };

  const comparison = compareScenarios(baselineInputs, scenarioInputs);
  const { baselineResult, scenarioResult, needDelta, gapDelta, percentageNeedChange, keyInsights } = comparison;

  const isIncrease = needDelta > 0;
  const deltaColor = isIncrease ? 'text-red-600' : needDelta < 0 ? 'text-emerald-600' : 'text-slate-500';
  const deltaBg = isIncrease ? 'bg-red-50 border-red-200' : needDelta < 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200';

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">{t('simulatorTitle')}</h1>
        <p className="text-sm text-brand-textSecondary">{t('simulatorSub')}</p>
      </div>

      {/* Scenario Presets */}
      <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-card space-y-4">
        <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-amber" /> {t('presetsTitle')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {presets.map((preset) => {
            const Icon = preset.icon;
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all hover:-translate-y-0.5 ${
                  isActive
                    ? `${preset.bg} border-brand-teal shadow-card ring-2 ring-brand-teal/30`
                    : 'bg-white border-brand-border hover:shadow-card'
                }`}
              >
                <Icon className={`w-5 h-5 ${preset.color}`} />
                <span className="text-[10px] font-bold text-brand-navy leading-tight">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Scenario Sliders */}
      <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-subtle space-y-5">
        <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-teal" /> Fine-Tune Scenario
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: 'Monthly Expenses', field: 'monthlyExpenses' as const, min: 10000, max: 300000, step: 5000, format: (v: number) => `${formatIndianCurrency(v)}/mo` },
            { label: 'Support Years', field: 'supportDurationYears' as const, min: 5, max: 35, step: 1, format: (v: number) => `${v} years` },
            { label: 'Home Loan', field: 'outstandingHomeLoan' as const, min: 0, max: 20000000, step: 500000, format: (v: number) => formatIndianCurrency(v, true) },
            { label: 'Education Fund', field: 'futureEducationCommitments' as const, min: 0, max: 10000000, step: 250000, format: (v: number) => formatIndianCurrency(v, true) },
            { label: 'Inflation Rate', field: 'annualExpenseInflationRate' as const, min: 0.03, max: 0.12, step: 0.005, format: (v: number) => `${(v * 100).toFixed(1)}%` },
            { label: 'Individual Term Cover', field: 'existingIndividualTermInsurance' as const, min: 0, max: 50000000, step: 500000, format: (v: number) => formatIndianCurrency(v, true) },
          ].map((slider) => (
            <div key={slider.field} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-brand-navy">{slider.label}</span>
                <span className="font-extrabold text-brand-teal">{slider.format(scenarioInputs[slider.field] as number)}</span>
              </div>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={scenarioInputs[slider.field] as number}
                onChange={(e) => {
                  setActivePreset(null);
                  setScenarioInputs((prev) => ({ ...prev, [slider.field]: Number(e.target.value) }));
                }}
                className="w-full accent-brand-teal cursor-pointer"
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => { setScenarioInputs({ ...baselineInputs }); setActivePreset('baseline'); }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-textSecondary hover:text-brand-navy transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset to Baseline
        </button>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-card overflow-hidden">
        <div className="p-6 border-b border-brand-border">
          <h3 className="text-sm font-bold text-brand-navy">{t('baselineVsScenario')}</h3>
        </div>
        <div className="grid grid-cols-3 divide-x divide-brand-border">
          {/* Baseline */}
          <div className="p-5 space-y-3">
            <span className="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider">Baseline</span>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-brand-textSecondary">Protection Need</p>
                <p className="text-lg font-black text-brand-navy">{formatIndianCurrency(baselineResult.totalProtectionNeed, true)}</p>
              </div>
              <div>
                <p className="text-[10px] text-brand-textSecondary">Coverage Gap</p>
                <p className="text-sm font-bold text-brand-navy">{formatIndianCurrency(baselineResult.coverageGap, true)}</p>
              </div>
            </div>
          </div>

          {/* Delta */}
          <div className={`p-5 space-y-3 ${deltaBg}`}>
            <span className="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider">{t('differenceImpact')}</span>
            <div className="space-y-2 text-center">
              <div>
                <p className="text-[10px] text-brand-textSecondary">Need Change</p>
                <p className={`text-lg font-black ${deltaColor} flex items-center justify-center gap-1`}>
                  {isIncrease ? <ChevronUp className="w-4 h-4" /> : needDelta < 0 ? <ChevronDown className="w-4 h-4" /> : null}
                  {needDelta === 0 ? 'No Change' : `${isIncrease ? '+' : ''}${formatIndianCurrency(needDelta, true)}`}
                </p>
              </div>
              {percentageNeedChange !== 0 && (
                <p className={`text-xs font-bold ${deltaColor}`}>
                  ({percentageNeedChange > 0 ? '+' : ''}{percentageNeedChange.toFixed(1)}%)
                </p>
              )}
            </div>
          </div>

          {/* Scenario */}
          <div className="p-5 space-y-3">
            <span className="text-[10px] font-bold text-brand-teal uppercase tracking-wider">Scenario</span>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-brand-textSecondary">Protection Need</p>
                <p className="text-lg font-black text-brand-teal">{formatIndianCurrency(scenarioResult.totalProtectionNeed, true)}</p>
              </div>
              <div>
                <p className="text-[10px] text-brand-textSecondary">Coverage Gap</p>
                <p className="text-sm font-bold text-brand-teal">{formatIndianCurrency(scenarioResult.coverageGap, true)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      {keyInsights.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-subtle space-y-3">
          <h3 className="text-sm font-bold text-brand-navy">Scenario Insights</h3>
          {keyInsights.map((insight, i) => (
            <div key={i} className="flex gap-2.5 text-xs text-brand-textSecondary leading-relaxed">
              <TrendingUp className="w-3.5 h-3.5 text-brand-teal flex-shrink-0 mt-0.5" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/games"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-extrabold text-brand-navyDark bg-gradient-to-r from-brand-tealLight to-brand-emerald hover:brightness-105 shadow-float transition-all"
        >
          Explore Learning Games <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/coverage"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-brand-navy bg-slate-100 hover:bg-slate-200 transition-all"
        >
          Back to Coverage
        </Link>
      </div>
    </div>
  );
};
