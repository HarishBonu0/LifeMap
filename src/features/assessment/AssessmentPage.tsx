import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { FinancialAssessmentInputs } from '../../types';
import { DEMO_PROFILES } from '../../data/demoProfiles';
import { formatIndianCurrency, sanitizeFinancialInputs } from '../../lib/calculator';
import {
  User,
  IndianRupee,
  Home,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  AlertTriangle
} from 'lucide-react';

const STEPS = ['Personal', 'Income & Expenses', 'Debts & Goals', 'Current Coverage'];

const defaultInputs: FinancialAssessmentInputs = {
  age: 30,
  employmentType: 'salaried',
  maritalStatus: 'married',
  dependantsCount: 2,
  supportDurationYears: 20,
  monthlyIncome: 80000,
  monthlyExpenses: 45000,
  annualExpenseInflationRate: 0.06,
  outstandingHomeLoan: 0,
  outstandingOtherLoans: 0,
  futureEducationCommitments: 0,
  otherMajorObligations: 0,
  liquidSavingsAndInvestments: 0,
  existingIndividualTermInsurance: 0,
  existingEmployerTermInsurance: 0,
  existingOtherPoliciesSumAssured: 0,
};

export const AssessmentPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [inputs, setInputs] = useState<FinancialAssessmentInputs>(() => {
    const stored = sessionStorage.getItem('lifemap_assessment');
    if (stored) {
      try {
        return sanitizeFinancialInputs(JSON.parse(stored));
      } catch {}
    }
    return defaultInputs;
  });

  const update = (field: keyof FinancialAssessmentInputs, value: any) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const loadDemo = (profileId: string) => {
    const profile = DEMO_PROFILES.find((p) => p.id === profileId);
    if (profile) {
      setInputs({ ...profile.inputs });
      sessionStorage.setItem('lifemap_assessment', JSON.stringify(profile.inputs));
    }
  };

  const handleSubmit = () => {
    const sanitized = sanitizeFinancialInputs(inputs);
    sessionStorage.setItem('lifemap_assessment', JSON.stringify(sanitized));
    navigate('/calculator');
  };

  const canNext = () => {
    if (step === 0) return inputs.age >= 18 && inputs.dependantsCount >= 0;
    if (step === 1) return inputs.monthlyIncome > 0 && inputs.monthlyExpenses > 0;
    return true;
  };

  const InputField: React.FC<{
    label: string;
    value: number;
    field: keyof FinancialAssessmentInputs;
    prefix?: string;
    suffix?: string;
    min?: number;
    max?: number;
    step?: number;
    hint?: string;
  }> = ({ label, value, field, prefix = '₹', suffix, min = 0, max, step = 1, hint }) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-brand-navy">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-brand-textSecondary font-semibold">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value === 0 ? '' : value}
          placeholder="0"
          min={min}
          max={max}
          step={step}
          onChange={(e) => update(field, Number(e.target.value))}
          className={`w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal transition-all ${prefix ? 'pl-8' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-brand-textSecondary">{suffix}</span>
        )}
      </div>
      {hint && <p className="text-[10px] text-brand-textSecondary">{hint}</p>}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Plan Workflow Navigation Tabs */}
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-brand-border">
          <button
            type="button"
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white text-brand-navy shadow-subtle"
          >
            1. Financial Assessment
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-brand-textSecondary hover:text-brand-navy transition-colors"
          >
            2. Needs Calculator
          </button>
        </div>
      </div>

      {/* Primary Heading */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
          Financial & Family Assessment
        </h1>
        <p className="text-xs text-brand-textSecondary">
          Provide your circumstances to calculate an explainable, transparent protection need.
        </p>
      </div>

      {/* Quick Demo Selector */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-brand-border text-xs">
        <span className="text-brand-textSecondary font-medium">Quick Start Demo:</span>
        <div className="flex items-center gap-1.5">
          {DEMO_PROFILES.map((p) => (
            <button
              key={p.id}
              onClick={() => loadDemo(p.id)}
              className="px-2.5 py-1 rounded-lg border border-brand-border bg-white hover:bg-slate-50 text-[11px] font-semibold text-brand-navy transition-colors"
            >
              {p.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Step Progress Indicators */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        {STEPS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setStep(idx)}
            className={`py-2 px-1 rounded-lg font-bold border transition-colors ${
              idx === step
                ? 'bg-brand-navy text-white border-brand-navy'
                : idx < step
                ? 'bg-slate-50 text-brand-teal border-brand-teal/30'
                : 'bg-white text-brand-textSecondary border-brand-border'
            }`}
          >
            <span className="text-[10px] block text-slate-400 font-normal">Step {idx + 1}</span>
            <span className="truncate block text-[11px]">{s}</span>
          </button>
        ))}
      </div>

      {/* Form Content Card */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-subtle p-6 space-y-5">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <User className="w-4 h-4 text-brand-teal" /> Personal & Family Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Your Age" value={inputs.age} field="age" prefix="" suffix="years" min={18} max={80} />
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-navy">Employment Type</label>
                <select
                  value={inputs.employmentType}
                  onChange={(e) => update('employmentType', e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                >
                  <option value="salaried">Salaried Employee</option>
                  <option value="self_employed">Self-Employed</option>
                  <option value="business">Business Owner</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="homemaker">Homemaker</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-navy">Marital Status</label>
                <select
                  value={inputs.maritalStatus}
                  onChange={(e) => update('maritalStatus', e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <InputField label="Number of Dependants" value={inputs.dependantsCount} field="dependantsCount" prefix="" min={0} max={10} />

              <div className="sm:col-span-2">
                <InputField
                  label="Support Duration"
                  value={inputs.supportDurationYears}
                  field="supportDurationYears"
                  prefix=""
                  suffix="years"
                  min={1}
                  max={40}
                  hint="Number of years your dependants need living cost protection"
                />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-brand-teal" /> Income & Living Expenses
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Monthly Take-Home Income" value={inputs.monthlyIncome} field="monthlyIncome" step={5000} hint="Net in-hand pay" />
              <InputField label="Monthly Household Expenses" value={inputs.monthlyExpenses} field="monthlyExpenses" step={5000} hint="Family living costs" />

              <div className="space-y-1.5 sm:col-span-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-brand-navy">Assumed Inflation Rate</span>
                  <span className="font-extrabold text-brand-teal">{(inputs.annualExpenseInflationRate * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min={0.03}
                  max={0.12}
                  step={0.005}
                  value={inputs.annualExpenseInflationRate}
                  onChange={(e) => update('annualExpenseInflationRate', Number(e.target.value))}
                  className="w-full accent-brand-teal cursor-pointer"
                />
                <p className="text-[10px] text-brand-textSecondary">Expected annual inflation for future living costs</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <Home className="w-4 h-4 text-brand-teal" /> Debts & Major Milestones
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Outstanding Home Loan" value={inputs.outstandingHomeLoan} field="outstandingHomeLoan" step={100000} hint="Principal balance remaining" />
              <InputField label="Other Debts & Loans" value={inputs.outstandingOtherLoans} field="outstandingOtherLoans" step={50000} hint="Car, personal, education loans" />
              <InputField label="Future Education Commitments" value={inputs.futureEducationCommitments} field="futureEducationCommitments" step={100000} hint="Higher education milestones" />
              <InputField label="Other Major Obligations" value={inputs.otherMajorObligations} field="otherMajorObligations" step={50000} hint="Parental care, health reserves" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-teal" /> Current Coverage & Assets
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Liquid Savings & Investments" value={inputs.liquidSavingsAndInvestments} field="liquidSavingsAndInvestments" step={100000} hint="FDs, mutual funds, emergency cash" />
              <InputField label="Existing Individual Term Cover" value={inputs.existingIndividualTermInsurance} field="existingIndividualTermInsurance" step={500000} hint="Personal term life policy" />
              <InputField label="Employer Group Life Cover" value={inputs.existingEmployerTermInsurance} field="existingEmployerTermInsurance" step={500000} hint="Corporate group cover" />
              <InputField label="Other Traditional Policies" value={inputs.existingOtherPoliciesSumAssured} field="existingOtherPoliciesSumAssured" step={100000} hint="ULIP / Endowment sum assured" />
            </div>

            {inputs.existingEmployerTermInsurance > 0 && inputs.existingIndividualTermInsurance === 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Notice:</strong> Relying solely on employer group cover leaves you unprotected if you switch jobs or retire. Individual term cover provides lifelong portable safety.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-brand-border">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-brand-navy bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight disabled:opacity-40 transition-colors"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle transition-all"
            >
              Calculate Protection Need <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
