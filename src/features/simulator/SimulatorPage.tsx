import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  Sliders, 
  RotateCcw, 
  Info, 
  ShieldAlert, 
  Check, 
  Bookmark, 
  AlertTriangle, 
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PiggyBank
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import { FinancialAssessmentInputs, GrowthScenarioRecord } from '../../types';
import { 
  calculateGrowthProjections, 
  calculateInsuranceNeeds, 
  formatIndianCurrency, 
  sanitizeFinancialInputs,
  compareScenarios 
} from '../../lib/calculator';
import { DEMO_PROFILES } from '../../data/demoProfiles';
import { scenarioService } from '../../services/scenarioService';

export const SimulatorPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Load baseline assessment inputs
  const [inputs, setInputs] = useState<FinancialAssessmentInputs>(() => {
    const stored = sessionStorage.getItem('lifemap_assessment');
    if (stored) {
      try {
        return sanitizeFinancialInputs(JSON.parse(stored));
      } catch {}
    }
    return DEMO_PROFILES[0].inputs;
  });

  // Simulator Interactive Controls
  const [initialSavings, setInitialSavings] = useState<number>(() => inputs.liquidSavingsAndInvestments || 500000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(() => {
    const netSavings = Math.max(10000, inputs.monthlyIncome - inputs.monthlyExpenses);
    return Math.min(100000, netSavings || 25000);
  });
  const [inflationRate, setInflationRate] = useState<number>(inputs.annualExpenseInflationRate || 0.06);
  const [viewMetric, setViewMetric] = useState<'nominal' | 'real'>('nominal');
  const [showFormulas, setShowFormulas] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<GrowthScenarioRecord[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Baseline protection need
  const baselineResult = useMemo(() => calculateInsuranceNeeds(inputs), [inputs]);

  // Compute 10- and 20-year growth projections
  const projection = useMemo(() => {
    return calculateGrowthProjections({
      initialSavings,
      monthlyContribution,
      annualInflation: inflationRate,
      conservativeRate: 0.065,
      moderateRate: 0.10,
      aggressiveRate: 0.125,
      baselineProtectionNeed: baselineResult.totalProtectionNeed,
      supportDurationYears: inputs.supportDurationYears
    });
  }, [initialSavings, monthlyContribution, inflationRate, baselineResult, inputs.supportDurationYears]);

  useEffect(() => {
    scenarioService.getUserScenarios(user?.id || null).then(setSavedScenarios);
  }, [user]);

  const handleSaveScenario = async () => {
    const saved = await scenarioService.saveScenario({
      userId: user?.id || null,
      scenarioName: `Growth Plan (${formatIndianCurrency(monthlyContribution)}/mo)`,
      description: `10-Yr: ${formatIndianCurrency(projection.tenYear.moderate.nominal, true)} | 20-Yr: ${formatIndianCurrency(projection.twentyYear.moderate.nominal, true)}`,
      inputs: {
        initialSavings,
        monthlyContribution,
        inflationRate
      },
      results: {
        tenYearModerate: projection.tenYear.moderate.nominal,
        twentyYearModerate: projection.twentyYear.moderate.nominal
      },
      differenceAmount: projection.twentyYear.moderate.nominal - projection.twentyYear.investedPrincipal
    });

    setSavedScenarios(prev => [saved, ...prev]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const resetDefaults = () => {
    setInitialSavings(inputs.liquidSavingsAndInvestments || 500000);
    const netSavings = Math.max(10000, inputs.monthlyIncome - inputs.monthlyExpenses);
    setMonthlyContribution(Math.min(100000, netSavings || 25000));
    setInflationRate(inputs.annualExpenseInflationRate || 0.06);
  };

  // Recharts formatted chart data
  const chartData = projection.trajectory.map(pt => ({
    year: `Yr ${pt.year}`,
    Principal: pt.investedPrincipal,
    Conservative: viewMetric === 'nominal' ? pt.conservativeNominal : pt.conservativeReal,
    Moderate: viewMetric === 'nominal' ? pt.moderateNominal : pt.moderateReal,
    Aggressive: viewMetric === 'nominal' ? pt.aggressiveNominal : pt.aggressiveReal,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-brand-teal text-[10px] font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-3 h-3" /> Personalized 10- & 20-Year Projections
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            Financial Growth & Milestone Simulator
          </h1>
          <p className="text-xs sm:text-sm text-brand-textSecondary mt-0.5">
            Deterministic projections for savings, wealth compounding, and evolving life protection needs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveScenario}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle transition-all"
          >
            {saveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{saveSuccess ? 'Scenario Saved' : 'Save Scenario'}</span>
          </button>
        </div>
      </div>

      {/* Prominent Risk & Disclaimers Banner */}
      <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs text-brand-textSecondary space-y-1">
        <div className="flex items-center gap-2 text-brand-navy font-bold">
          <Info className="w-4 h-4 text-brand-teal flex-shrink-0" />
          <span>Actuarial Separation Rule & Non-Guarantee Notice</span>
        </div>
        <p className="leading-relaxed text-[11px]">
          <strong>1. Insurance Independence:</strong> Life insurance needs are calculated strictly independently of projected wealth to prevent underinsurance.
          <br />
          <strong>2. Illustrative Returns:</strong> Conservative (6.5%), Moderate (10.0%), and Higher-Growth (12.5%) are illustrative model benchmarks. Actual market returns fluctuate and can be negative.
        </p>
      </div>

      {/* Interactive Inputs & Sliders */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-brand-border shadow-subtle space-y-5">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-teal" /> Adjust Monthly Savings & Assumptions
          </h2>
          <button
            onClick={resetDefaults}
            className="text-[11px] font-semibold text-brand-textSecondary hover:text-brand-navy flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* 1. Monthly SIP */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-brand-navy">Monthly Contribution (SIP)</span>
              <span className="font-bold text-brand-teal">{formatIndianCurrency(monthlyContribution)}/mo</span>
            </div>
            <input
              type="range"
              min={2000}
              max={150000}
              step={2000}
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full accent-brand-teal cursor-pointer"
            />
            <span className="text-[10px] text-brand-textSecondary block">Regular monthly savings allocation</span>
          </div>

          {/* 2. Initial Savings */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-brand-navy">Initial Savings Balance</span>
              <span className="font-bold text-brand-teal">{formatIndianCurrency(initialSavings, true)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={5000000}
              step={50000}
              value={initialSavings}
              onChange={(e) => setInitialSavings(Number(e.target.value))}
              className="w-full accent-brand-teal cursor-pointer"
            />
            <span className="text-[10px] text-brand-textSecondary block">Starting liquid corpus available today</span>
          </div>

          {/* 3. Expected Inflation */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-brand-navy">Assumed Inflation Rate</span>
              <span className="font-bold text-brand-teal">{(inflationRate * 100).toFixed(1)}% p.a.</span>
            </div>
            <input
              type="range"
              min={0.03}
              max={0.10}
              step={0.005}
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="w-full accent-brand-teal cursor-pointer"
            />
            <span className="text-[10px] text-brand-textSecondary block">Annual purchasing power erosion rate</span>
          </div>
        </div>
      </div>

      {/* 10-Year and 20-Year Projection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 10-Year Milestone Card */}
        <div className="bg-white rounded-2xl border border-brand-border shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-teal" />
              <h3 className="text-sm font-bold text-brand-navy">10-Year Milestone Horizon</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-brand-textSecondary">
              Invested: {formatIndianCurrency(projection.tenYear.investedPrincipal, true)}
            </span>
          </div>

          {/* Three Scenarios Table */}
          <div className="space-y-2.5">
            {/* Conservative */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-brand-navy block">Conservative (6.5%)</span>
                <span className="text-[10px] text-brand-textSecondary">Fixed income, FDs, EPF</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-brand-navy text-sm block">
                  {formatIndianCurrency(viewMetric === 'nominal' ? projection.tenYear.conservative.nominal : projection.tenYear.conservative.real, true)}
                </span>
                <span className="text-[10px] text-slate-500">
                  {viewMetric === 'nominal' ? `Real: ${formatIndianCurrency(projection.tenYear.conservative.real, true)}` : 'In today\'s ₹'}
                </span>
              </div>
            </div>

            {/* Moderate (Highlight) */}
            <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-brand-tealDark block">Moderate (10.0%)</span>
                <span className="text-[10px] text-brand-textSecondary">Balanced index & hybrid</span>
              </div>
              <div className="text-right">
                <span className="font-black text-brand-teal text-base block">
                  {formatIndianCurrency(viewMetric === 'nominal' ? projection.tenYear.moderate.nominal : projection.tenYear.moderate.real, true)}
                </span>
                <span className="text-[10px] text-teal-800">
                  {viewMetric === 'nominal' ? `Real: ${formatIndianCurrency(projection.tenYear.moderate.real, true)}` : 'In today\'s ₹'}
                </span>
              </div>
            </div>

            {/* Higher Growth */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-brand-navy block">Higher Growth (12.5%)</span>
                <span className="text-[10px] text-brand-textSecondary">Equity mutual fund SIPs</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-brand-navy text-sm block">
                  {formatIndianCurrency(viewMetric === 'nominal' ? projection.tenYear.aggressive.nominal : projection.tenYear.aggressive.real, true)}
                </span>
                <span className="text-[10px] text-slate-500">
                  {viewMetric === 'nominal' ? `Real: ${formatIndianCurrency(projection.tenYear.aggressive.real, true)}` : 'In today\'s ₹'}
                </span>
              </div>
            </div>
          </div>

          {/* Life Insurance Trajectory at Year 10 */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-brand-textSecondary text-[11px]">Recommended Life Cover at Yr 10:</span>
            <span className="font-bold text-brand-navy">{formatIndianCurrency(projection.tenYear.protectionNeed, true)}</span>
          </div>
        </div>

        {/* 20-Year Milestone Card */}
        <div className="bg-white rounded-2xl border border-brand-border shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-teal" />
              <h3 className="text-sm font-bold text-brand-navy">20-Year Milestone Horizon</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-brand-textSecondary">
              Invested: {formatIndianCurrency(projection.twentyYear.investedPrincipal, true)}
            </span>
          </div>

          {/* Three Scenarios Table */}
          <div className="space-y-2.5">
            {/* Conservative */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-brand-navy block">Conservative (6.5%)</span>
                <span className="text-[10px] text-brand-textSecondary">Fixed income, FDs, EPF</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-brand-navy text-sm block">
                  {formatIndianCurrency(viewMetric === 'nominal' ? projection.twentyYear.conservative.nominal : projection.twentyYear.conservative.real, true)}
                </span>
                <span className="text-[10px] text-slate-500">
                  {viewMetric === 'nominal' ? `Real: ${formatIndianCurrency(projection.twentyYear.conservative.real, true)}` : 'In today\'s ₹'}
                </span>
              </div>
            </div>

            {/* Moderate (Highlight) */}
            <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-brand-tealDark block">Moderate (10.0%)</span>
                <span className="text-[10px] text-brand-textSecondary">Balanced index & hybrid</span>
              </div>
              <div className="text-right">
                <span className="font-black text-brand-teal text-base block">
                  {formatIndianCurrency(viewMetric === 'nominal' ? projection.twentyYear.moderate.nominal : projection.twentyYear.moderate.real, true)}
                </span>
                <span className="text-[10px] text-teal-800">
                  {viewMetric === 'nominal' ? `Real: ${formatIndianCurrency(projection.twentyYear.moderate.real, true)}` : 'In today\'s ₹'}
                </span>
              </div>
            </div>

            {/* Higher Growth */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-brand-navy block">Higher Growth (12.5%)</span>
                <span className="text-[10px] text-brand-textSecondary">Equity mutual fund SIPs</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-brand-navy text-sm block">
                  {formatIndianCurrency(viewMetric === 'nominal' ? projection.twentyYear.aggressive.nominal : projection.twentyYear.aggressive.real, true)}
                </span>
                <span className="text-[10px] text-slate-500">
                  {viewMetric === 'nominal' ? `Real: ${formatIndianCurrency(projection.twentyYear.aggressive.real, true)}` : 'In today\'s ₹'}
                </span>
              </div>
            </div>
          </div>

          {/* Life Insurance Trajectory at Year 20 */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-brand-textSecondary text-[11px]">Recommended Life Cover at Yr 20:</span>
            <span className="font-bold text-brand-navy">{formatIndianCurrency(projection.twentyYear.protectionNeed, true)}</span>
          </div>
        </div>
      </div>

      {/* Interactive Growth Trajectory Chart */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-subtle p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-brand-navy">
              20-Year Wealth Trajectory Chart
            </h3>
            <p className="text-[11px] text-brand-textSecondary">
              Visual compounding of initial corpus plus monthly contributions.
            </p>
          </div>

          {/* Nominal vs Real Toggle */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-brand-border self-start sm:self-auto">
            <button
              onClick={() => setViewMetric('nominal')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMetric === 'nominal'
                  ? 'bg-white text-brand-navy shadow-subtle'
                  : 'text-brand-textSecondary hover:text-brand-navy'
              }`}
            >
              Nominal Values
            </button>
            <button
              onClick={() => setViewMetric('real')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMetric === 'real'
                  ? 'bg-white text-brand-navy shadow-subtle'
                  : 'text-brand-textSecondary hover:text-brand-navy'
              }`}
            >
              Inflation-Adjusted (Real ₹)
            </button>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAggressive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5A4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0EA5A4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorModerate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis 
                tickFormatter={(val) => formatIndianCurrency(val, true)} 
                tick={{ fontSize: 11 }}
                width={70}
              />
              <Tooltip 
                formatter={(val: any) => [formatIndianCurrency(Number(val)), '']}
                labelStyle={{ fontWeight: 'bold', color: '#0B2545' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="Aggressive" stroke="#0EA5A4" strokeWidth={2} fillOpacity={1} fill="url(#colorAggressive)" />
              <Area type="monotone" dataKey="Moderate" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorModerate)" />
              <Area type="monotone" dataKey="Principal" stroke="#64748B" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPrincipal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assumptions & Mathematical Formula Disclosure */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden">
        <button
          onClick={() => setShowFormulas(!showFormulas)}
          className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-brand-teal" />
            <span className="text-xs font-bold text-brand-navy">Deterministic Formulas & Technical Notes</span>
          </div>
          <span className="text-xs text-brand-teal font-semibold">{showFormulas ? 'Hide' : 'Inspect'}</span>
        </button>

        {showFormulas && (
          <div className="p-5 border-t border-brand-border bg-slate-50/50 space-y-3 text-xs text-brand-textSecondary">
            <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-brand-navy">
              {projection.assumptions.formulaSummary}
            </div>
            <ul className="space-y-1 text-[11px] leading-relaxed">
              {projection.assumptions.notes.map((n, i) => (
                <li key={i}>• {n}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Saved Scenarios List */}
      {savedScenarios.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-subtle space-y-3">
          <span className="text-xs font-bold text-brand-navy block">Your Saved Scenarios</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedScenarios.slice(0, 4).map((s) => (
              <div key={s.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-brand-navy block">{s.scenarioName}</span>
                  <span className="text-[10px] text-brand-textSecondary">{s.description}</span>
                </div>
                <span className="text-[11px] font-bold text-brand-teal">
                  +{formatIndianCurrency(s.differenceAmount, true)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          to="/schemes"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle transition-all"
        >
          <span>Explore Insurance Schemes</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/coverage"
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl text-xs font-semibold text-brand-navy border border-brand-border bg-white hover:bg-slate-50 transition-colors"
        >
          Review Protection Plan
        </Link>
      </div>
    </div>
  );
};
