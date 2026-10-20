import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { FinancialAssessmentInputs } from '../../types';
import { DEMO_PROFILES } from '../../data/demoProfiles';
import { formatIndianCurrency, sanitizeFinancialInputs } from '../../lib/calculator';
import {
  User, Briefcase, Heart, Users, Clock, IndianRupee, Home,
  Car, GraduationCap, PiggyBank, ShieldCheck, Building2,
  ChevronRight, ChevronLeft, Sparkles, CheckCircle2, AlertTriangle
} from 'lucide-react';

const STEPS = ['Personal', 'Income & Expenses', 'Debts & Goals', 'Existing Coverage', 'Review'];

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
  const [inputs, setInputs] = useState<FinancialAssessmentInputs>(defaultInputs);

  const update = (field: keyof FinancialAssessmentInputs, value: any) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const loadDemo = (profileId: string) => {
    const profile = DEMO_PROFILES.find((p) => p.id === profileId);
    if (profile) setInputs({ ...profile.inputs });
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
          value={value || ''}
          min={min}
          max={max}
          step={step}
          onChange={(e) => update(field, Number(e.target.value))}
          className={`w-full rounded-xl border border-brand-border bg-white px-3 py-2.5 text-sm font-medium text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal transition-all ${prefix ? 'pl-8' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-brand-textSecondary">{suffix}</span>
        )}
      </div>
      {hint && <p className="text-[10px] text-brand-textSecondary">{hint}</p>}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">{t('assessmentTitle')}</h1>
        <p className="text-sm text-brand-textSecondary">{t('assessmentSub')}</p>
      </div>

      {/* Demo Profiles Quick Start */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-5 border border-brand-border">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-brand-amber" />
          <span className="text-xs font-bold text-brand-navy">{t('quickStartProfiles')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DEMO_PROFILES.map((p) => (
            <button
              key={p.id}
              onClick={() => loadDemo(p.id)}
              className="text-left p-3 rounded-xl bg-white border border-brand-border hover:border-brand-teal hover:shadow-card transition-all group"
            >
              <span className="text-[10px] font-bold text-brand-teal">{p.badge}</span>
              <h4 className="text-xs font-bold text-brand-navy mt-0.5">{p.name}</h4>
              <p className="text-[10px] text-brand-textSecondary mt-0.5">{p.tagline}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, idx) => (
          <React.Fragment key={idx}>
            <button
              onClick={() => setStep(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                idx === step
                  ? 'bg-brand-navy text-white shadow-subtle'
                  : idx < step
                  ? 'bg-brand-tealSoft text-brand-tealDark'
                  : 'bg-slate-100 text-brand-textSecondary'
              }`}
            >
              {idx < step ? <CheckCircle2 className="w-3 h-3" /> : null}
              <span className="hidden sm:inline">{s}</span>
              <span className="sm:hidden">{idx + 1}</span>
            </button>
            {idx < STEPS.length - 1 && <div className="flex-1 h-0.5 bg-slate-200 rounded" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-card p-6 sm:p-8 space-y-6">
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
              <User className="w-5 h-5 text-brand-teal" /> {t('stepPersonal')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label={t('ageLabel')} value={inputs.age} field="age" prefix="" suffix="years" min={18} max={80} />
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-navy">{t('employmentLabel')}</label>
                <select
                  value={inputs.employmentType}
                  onChange={(e) => update('employmentType', e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-white px-3 py-2.5 text-sm font-medium text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                >
                  <option value="salaried">Salaried Employee</option>
                  <option value="self_employed">Self-Employed</option>
                  <option value="business">Business Owner</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="homemaker">Homemaker</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-navy">{t('maritalLabel')}</label>
                <select
                  value={inputs.maritalStatus}
                  onChange={(e) => update('maritalStatus', e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-white px-3 py-2.5 text-sm font-medium text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <InputField label={t('dependantsLabel')} value={inputs.dependantsCount} field="dependantsCount" prefix="" min={0} max={10} />
              <InputField
                label={t('supportYearsLabel')}
                value={inputs.supportDurationYears}
                field="supportDurationYears"
                prefix=""
                suffix="years"
                min={1}
                max={40}
                hint="How long your dependants need financial support"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-brand-teal" /> {t('stepFinancial')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label={t('monthlyIncomeLabel')} value={inputs.monthlyIncome} field="monthlyIncome" step={5000} hint="Take-home pay after taxes" />
              <InputField label={t('monthlyExpensesLabel')} value={inputs.monthlyExpenses} field="monthlyExpenses" step={5000} hint="Total household spending per month" />
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold text-brand-navy">{t('inflationLabel')}</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0.03}
                    max={0.12}
                    step={0.005}
                    value={inputs.annualExpenseInflationRate}
                    onChange={(e) => update('annualExpenseInflationRate', Number(e.target.value))}
                    className="flex-1 accent-brand-teal cursor-pointer"
                  />
                  <span className="text-sm font-bold text-brand-teal w-12 text-right">
                    {(inputs.annualExpenseInflationRate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
              <Home className="w-5 h-5 text-brand-teal" /> {t('stepDependants')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label={t('homeLoanLabel')} value={inputs.outstandingHomeLoan} field="outstandingHomeLoan" step={100000} hint="Outstanding principal balance" />
              <InputField label={t('otherLoansLabel')} value={inputs.outstandingOtherLoans} field="outstandingOtherLoans" step={50000} />
              <InputField label={t('educationLabel')} value={inputs.futureEducationCommitments} field="futureEducationCommitments" step={100000} hint="Future higher education costs" />
              <InputField label="Other Major Obligations" value={inputs.otherMajorObligations} field="otherMajorObligations" step={50000} hint="Medical, parental care, etc." />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-teal" /> {t('stepExisting')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label={t('savingsLabel')} value={inputs.liquidSavingsAndInvestments} field="liquidSavingsAndInvestments" step={100000} hint="FDs, MFs, emergency savings" />
              <InputField label={t('individualInsuranceLabel')} value={inputs.existingIndividualTermInsurance} field="existingIndividualTermInsurance" step={500000} />
              <InputField label={t('employerInsuranceLabel')} value={inputs.existingEmployerTermInsurance} field="existingEmployerTermInsurance" step={500000} />
              <InputField label={t('otherInsuranceLabel')} value={inputs.existingOtherPoliciesSumAssured} field="existingOtherPoliciesSumAssured" step={100000} />
            </div>
            {inputs.existingEmployerTermInsurance > 0 && inputs.existingIndividualTermInsurance === 0 && (
              <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-800">{t('employerWarningTitle')}</h4>
                  <p className="text-[11px] text-amber-700 mt-1">{t('employerWarningDesc')}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand-emerald" /> {t('reviewConfirm')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Age', value: `${inputs.age} years` },
                { label: 'Dependants', value: inputs.dependantsCount.toString() },
                { label: 'Support Duration', value: `${inputs.supportDurationYears} years` },
                { label: 'Monthly Income', value: formatIndianCurrency(inputs.monthlyIncome) },
                { label: 'Monthly Expenses', value: formatIndianCurrency(inputs.monthlyExpenses) },
                { label: 'Inflation Rate', value: `${(inputs.annualExpenseInflationRate * 100).toFixed(1)}%` },
                { label: 'Home Loan', value: formatIndianCurrency(inputs.outstandingHomeLoan) },
                { label: 'Other Loans', value: formatIndianCurrency(inputs.outstandingOtherLoans) },
                { label: 'Education Fund', value: formatIndianCurrency(inputs.futureEducationCommitments) },
                { label: 'Savings', value: formatIndianCurrency(inputs.liquidSavingsAndInvestments) },
                { label: 'Individual Term', value: formatIndianCurrency(inputs.existingIndividualTermInsurance) },
                { label: 'Employer Cover', value: formatIndianCurrency(inputs.existingEmployerTermInsurance) },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-[10px] text-brand-textSecondary font-medium">{item.label}</span>
                  <p className="text-sm font-bold text-brand-navy mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-brand-border">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-brand-navy bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> {t('back')}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight disabled:opacity-40 transition-all"
            >
              {t('next')} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-extrabold text-brand-navyDark bg-gradient-to-r from-brand-tealLight to-brand-emerald hover:brightness-105 shadow-subtle transition-all"
            >
              Calculate My Protection Need <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
