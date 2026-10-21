// LifeMap Financial Calculation Engine
// Version: 2026.1-IN
// Deterministic, transparent, and explainable financial risk calculations

import { 
  FinancialAssessmentInputs, 
  InsuranceNeedsResult, 
  CalculationMode, 
  CalculationBreakdownItem,
  CalculationAssumptions,
  GrowthProjectionResult,
  GrowthTrajectoryPoint
} from '../types';

/**
 * Formats a number into Indian Rupee notation (e.g. ₹12,50,000 or ₹1.25 Cr)
 */
export function formatIndianCurrency(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || !isFinite(amount)) return '₹0';
  
  const absAmount = Math.abs(Math.round(amount));
  const sign = amount < 0 ? '-' : '';

  if (compact) {
    if (absAmount >= 10000000) {
      const cr = (absAmount / 10000000).toFixed(2).replace(/\.?0+$/, '');
      return `${sign}₹${cr} Cr`;
    }
    if (absAmount >= 100000) {
      const lakh = (absAmount / 100000).toFixed(2).replace(/\.?0+$/, '');
      return `${sign}₹${lakh} Lakh`;
    }
    if (absAmount >= 1000) {
      const k = (absAmount / 1000).toFixed(1).replace(/\.?0+$/, '');
      return `${sign}₹${k}k`;
    }
  }

  // Standard Indian comma separator formatting (XX,XX,XXX)
  const numStr = absAmount.toString();
  let lastThree = numStr.substring(numStr.length - 3);
  const otherNumbers = numStr.substring(0, numStr.length - 3);
  
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  
  return `${sign}₹${formatted}`;
}

/**
 * Validates and sanitizes raw assessment inputs to prevent negative values, NaN, or Infinity
 */
export function sanitizeFinancialInputs(inputs: Partial<FinancialAssessmentInputs>): FinancialAssessmentInputs {
  return {
    age: Math.max(18, Math.min(100, Number(inputs.age) || 30)),
    employmentType: inputs.employmentType || 'salaried',
    maritalStatus: inputs.maritalStatus || 'married',
    dependantsCount: Math.max(0, Number(inputs.dependantsCount) || 0),
    supportDurationYears: Math.max(1, Math.min(40, Number(inputs.supportDurationYears) || 20)),
    
    monthlyIncome: Math.max(0, Number(inputs.monthlyIncome) || 0),
    monthlyExpenses: Math.max(0, Number(inputs.monthlyExpenses) || 0),
    annualExpenseInflationRate: typeof inputs.annualExpenseInflationRate === 'number' 
      ? Math.max(0, Math.min(0.20, inputs.annualExpenseInflationRate)) 
      : 0.06, // default 6% inflation
    
    outstandingHomeLoan: Math.max(0, Number(inputs.outstandingHomeLoan) || 0),
    outstandingOtherLoans: Math.max(0, Number(inputs.outstandingOtherLoans) || 0),
    futureEducationCommitments: Math.max(0, Number(inputs.futureEducationCommitments) || 0),
    otherMajorObligations: Math.max(0, Number(inputs.otherMajorObligations) || 0),
    
    liquidSavingsAndInvestments: Math.max(0, Number(inputs.liquidSavingsAndInvestments) || 0),
    existingIndividualTermInsurance: Math.max(0, Number(inputs.existingIndividualTermInsurance) || 0),
    existingEmployerTermInsurance: Math.max(0, Number(inputs.existingEmployerTermInsurance) || 0),
    existingOtherPoliciesSumAssured: Math.max(0, Number(inputs.existingOtherPoliciesSumAssured) || 0),
  };
}

/**
 * Calculates Present Value of future living expenses using net real discount rate
 */
export function calculateFutureSupportExpensesPV(
  annualExpenses: number,
  years: number,
  inflationRate: number = 0.06,
  nominalDiscountRate: number = 0.075
): number {
  if (annualExpenses <= 0 || years <= 0) return 0;
  
  // Real discount rate (Fisher equation): (1 + i) / (1 + inf) - 1
  const realRate = (nominalDiscountRate - inflationRate) / (1 + inflationRate);
  
  if (Math.abs(realRate) < 0.0001) {
    // If real discount rate is effectively 0, PV = annual * years
    return Math.round(annualExpenses * years);
  }
  
  // Discrete annuity present value: PV = P * [1 - (1 + r)^(-n)] / r
  const pvFactor = (1 - Math.pow(1 + realRate, -years)) / realRate;
  return Math.round(annualExpenses * pvFactor);
}

/**
 * Core calculation of life insurance protection needs and coverage gap
 */
export function calculateInsuranceNeeds(
  rawInputs: Partial<FinancialAssessmentInputs>,
  mode: CalculationMode = 'present_value',
  customDiscountRate: number = 0.075
): InsuranceNeedsResult {
  const inputs = sanitizeFinancialInputs(rawInputs);
  
  const annualExpenses = inputs.monthlyExpenses * 12;
  const inflation = inputs.annualExpenseInflationRate;
  const years = inputs.supportDurationYears;
  
  // 1. Calculate Future Family Support
  let futureFamilySupportTotal = 0;
  if (mode === 'present_value') {
    futureFamilySupportTotal = calculateFutureSupportExpensesPV(
      annualExpenses,
      years,
      inflation,
      customDiscountRate
    );
  } else {
    // Simplified undiscounted projection
    futureFamilySupportTotal = Math.round(annualExpenses * years);
  }
  
  // 2. Liabilities Total
  const outstandingLiabilitiesTotal = inputs.outstandingHomeLoan + inputs.outstandingOtherLoans;
  
  // 3. Future Commitments Total
  const futureCommitmentsTotal = inputs.futureEducationCommitments + inputs.otherMajorObligations;
  
  // 4. Gross Responsibilities
  const grossResponsibilities = futureFamilySupportTotal + outstandingLiabilitiesTotal + futureCommitmentsTotal;
  
  // 5. Eligible Assets
  const eligibleAssetsConsidered = inputs.liquidSavingsAndInvestments;
  
  // 6. Net Protection Need (Gross responsibilities minus eligible existing assets)
  const totalProtectionNeed = Math.max(0, grossResponsibilities - eligibleAssetsConsidered);
  
  // 7. Existing Coverage Aggregation
  const existingIndividualCoverage = inputs.existingIndividualTermInsurance;
  const existingEmployerCoverage = inputs.existingEmployerTermInsurance;
  const existingOtherPolicies = inputs.existingOtherPoliciesSumAssured;
  const existingTotalCoverage = existingIndividualCoverage + existingEmployerCoverage + existingOtherPolicies;
  
  // 8. Coverage Gap (Shortfall)
  // Shortfall exists if protection need > existing coverage
  const rawGap = totalProtectionNeed - existingTotalCoverage;
  const coverageGap = Math.max(0, rawGap);
  
  let coverageStatus: InsuranceNeedsResult['coverageStatus'] = 'adequately_covered';
  if (rawGap > 0) {
    if (existingTotalCoverage === 0 || rawGap > totalProtectionNeed * 0.5) {
      coverageStatus = 'critical_shortfall';
    } else {
      coverageStatus = 'moderate_shortfall';
    }
  } else if (rawGap < 0) {
    coverageStatus = 'surplus_coverage';
  } else {
    coverageStatus = 'adequately_covered';
  }
  
  // Detailed Waterfall Breakdown Items
  const breakdown: CalculationBreakdownItem[] = [
    {
      id: 'family_support',
      label: 'Future Family Support Needs',
      amount: futureFamilySupportTotal,
      type: 'addition',
      category: 'expenses',
      description: mode === 'present_value'
        ? `Present value of ${years} years of family living expenses with ${(inflation * 100).toFixed(1)}% annual inflation.`
        : `Undiscounted estimated living expenses across ${years} years (Annual: ${formatIndianCurrency(annualExpenses)}).`,
      assumptions: `${formatIndianCurrency(inputs.monthlyExpenses)}/month for ${years} years @ ${(inflation * 100).toFixed(1)}% inflation.`
    },
    {
      id: 'home_loan',
      label: 'Outstanding Home Loan',
      amount: inputs.outstandingHomeLoan,
      type: 'addition',
      category: 'loans',
      description: 'Principal loan balance that would otherwise burden surviving dependants.',
    },
    {
      id: 'other_loans',
      label: 'Personal & Vehicle Loans',
      amount: inputs.outstandingOtherLoans,
      type: 'addition',
      category: 'loans',
      description: 'Other short-term or personal debts needing settlement.',
    },
    {
      id: 'education',
      label: 'Children Education & Life Milestones',
      amount: inputs.futureEducationCommitments,
      type: 'addition',
      category: 'commitments',
      description: 'Anticipated higher education or milestone funding for dependants.',
    },
    {
      id: 'other_commitments',
      label: 'Other Financial Commitments',
      amount: inputs.otherMajorObligations,
      type: 'addition',
      category: 'commitments',
      description: 'Emergency healthcare funds or specific parental support allocations.',
    },
    {
      id: 'eligible_assets',
      label: 'Eligible Savings & Liquid Assets',
      amount: -eligibleAssetsConsidered,
      type: 'subtraction',
      category: 'assets',
      description: 'Liquid assets, fixed deposits, and mutual funds usable by family in an emergency.',
      assumptions: 'Excludes primary residence or illiquid personal property.'
    },
    {
      id: 'existing_individual_insurance',
      label: 'Existing Individual Term Insurance',
      amount: -existingIndividualCoverage,
      type: 'subtraction',
      category: 'existing_insurance',
      description: 'Independently owned life insurance policies that remain valid irrespective of job changes.',
    },
    {
      id: 'existing_employer_insurance',
      label: 'Employer Group Life Coverage',
      amount: -existingEmployerCoverage,
      type: 'subtraction',
      category: 'existing_insurance',
      description: 'Corporate group cover provided by your current employer (note: ceases upon resignation).',
    },
    {
      id: 'existing_other_insurance',
      label: 'Other Life Cover (Endowment/ULIP)',
      amount: -existingOtherPolicies,
      type: 'subtraction',
      category: 'existing_insurance',
      description: 'Sum assured from traditional or unit-linked life policies.',
    }
  ];
  
  // Identify Primary Drivers
  const primaryDrivers: string[] = [];
  if (futureFamilySupportTotal >= grossResponsibilities * 0.4) {
    primaryDrivers.push(`Family living expenses form the largest portion (${Math.round((futureFamilySupportTotal / grossResponsibilities) * 100 || 0)}%) of total need.`);
  }
  if (outstandingLiabilitiesTotal > 0) {
    primaryDrivers.push(`Outstanding debt obligations (${formatIndianCurrency(outstandingLiabilitiesTotal)}) require immediate debt-shield protection.`);
  }
  if (existingEmployerCoverage > 0 && existingIndividualCoverage === 0) {
    primaryDrivers.push('Warning: 100% of your current protection is linked to your employer and is lost upon career transitions.');
  }
  if (coverageGap > 0) {
    primaryDrivers.push(`Your dependants have an estimated shortfall of ${formatIndianCurrency(coverageGap)} under current assumptions.`);
  } else {
    primaryDrivers.push('Under current assumptions, existing coverage meets estimated liabilities and living needs.');
  }
  
  const assumptions: CalculationAssumptions = {
    inflationRate: inflation,
    discountRate: customDiscountRate,
    supportDurationYears: years,
    calculationMode: mode,
    notes: [
      `Assumes annual inflation of ${(inflation * 100).toFixed(1)}% on household maintenance expenses.`,
      mode === 'present_value' 
        ? `Applies present-value discounting using an illustrative safe reinvestment rate of ${(customDiscountRate * 100).toFixed(1)}%.`
        : 'Simplified undiscounted model: simple sum across years.',
      'Primary residence value is excluded from assets to ensure dependants retain housing.',
      'Does not constitute personalized legal, tax, or actuarial advice.'
    ]
  };

  return {
    version: '2026.1-IN',
    calculationMode: mode,
    timestamp: new Date().toISOString(),
    totalProtectionNeed,
    grossResponsibilities,
    existingTotalCoverage,
    existingIndividualCoverage,
    existingEmployerCoverage,
    eligibleAssetsConsidered,
    coverageGap,
    coverageStatus,
    futureFamilySupportTotal,
    outstandingLiabilitiesTotal,
    futureCommitmentsTotal,
    breakdown,
    assumptions,
    primaryDrivers,
    disclaimer: 'LifeMap provides educational information and illustrative estimates based on the information and assumptions entered. Results are not guaranteed and are not a substitute for personalized professional advice or the official terms of an insurance policy.'
  };
}

/**
 * Compares a baseline assessment with a simulated future scenario
 */
export function compareScenarios(
  baselineInputs: FinancialAssessmentInputs,
  scenarioInputs: FinancialAssessmentInputs,
  mode: CalculationMode = 'present_value'
) {
  const baselineResult = calculateInsuranceNeeds(baselineInputs, mode);
  const scenarioResult = calculateInsuranceNeeds(scenarioInputs, mode);
  
  const needDelta = scenarioResult.totalProtectionNeed - baselineResult.totalProtectionNeed;
  const gapDelta = scenarioResult.coverageGap - baselineResult.coverageGap;
  const percentageNeedChange = baselineResult.totalProtectionNeed > 0
    ? (needDelta / baselineResult.totalProtectionNeed) * 100
    : 0;

  const keyInsights: string[] = [];
  
  if (scenarioInputs.monthlyExpenses > baselineInputs.monthlyExpenses) {
    keyInsights.push(`Higher monthly expenses increased protection requirements by ${formatIndianCurrency(scenarioResult.futureFamilySupportTotal - baselineResult.futureFamilySupportTotal)}.`);
  }
  if (scenarioInputs.outstandingHomeLoan > baselineInputs.outstandingHomeLoan) {
    keyInsights.push(`A new home loan added a direct liability of ${formatIndianCurrency(scenarioInputs.outstandingHomeLoan - baselineInputs.outstandingHomeLoan)}.`);
  }
  if (scenarioInputs.futureEducationCommitments > baselineInputs.futureEducationCommitments) {
    keyInsights.push(`Education goals added ${formatIndianCurrency(scenarioInputs.futureEducationCommitments - baselineInputs.futureEducationCommitments)} to the required cover.`);
  }
  if (scenarioInputs.annualExpenseInflationRate > baselineInputs.annualExpenseInflationRate) {
    keyInsights.push(`Higher inflation rate compounded future household support needs.`);
  }
  if (scenarioInputs.existingIndividualTermInsurance > baselineInputs.existingIndividualTermInsurance) {
    keyInsights.push(`Increasing individual term insurance reduced the potential coverage gap.`);
  }

  return {
    baselineResult,
    scenarioResult,
    needDelta,
    gapDelta,
    percentageNeedChange,
    keyInsights
  };
}

/**
 * Calculates 10-year and 20-year deterministic growth projections for Conservative, Moderate, and Aggressive scenarios,
 * with nominal vs inflation-adjusted (real) values, formula transparency, and separate life insurance protection trajectory.
 */
export function calculateGrowthProjections(params: {
  initialSavings: number;
  monthlyContribution: number;
  annualInflation?: number;
  conservativeRate?: number;
  moderateRate?: number;
  aggressiveRate?: number;
  baselineProtectionNeed?: number;
  supportDurationYears?: number;
}): GrowthProjectionResult {
  const initial = Math.max(0, params.initialSavings || 0);
  const monthly = Math.max(0, params.monthlyContribution || 0);
  const inflation = typeof params.annualInflation === 'number' ? params.annualInflation : 0.06;
  const rCons = typeof params.conservativeRate === 'number' ? params.conservativeRate : 0.065; // 6.5%
  const rMod = typeof params.moderateRate === 'number' ? params.moderateRate : 0.10; // 10.0%
  const rAgg = typeof params.aggressiveRate === 'number' ? params.aggressiveRate : 0.125; // 12.5%
  const baseNeed = Math.max(0, params.baselineProtectionNeed || 0);
  const totalYears = Math.max(5, params.supportDurationYears || 20);

  // Compound initial lump sum + monthly SIP at annual rate r for t years
  const calcFV = (r: number, t: number) => {
    const lumpFV = initial * Math.pow(1 + r, t);
    const monthlyRate = r / 12;
    const months = t * 12;
    let sipFV = 0;
    if (monthlyRate > 0) {
      sipFV = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    } else {
      sipFV = monthly * months;
    }
    const nominal = Math.round(lumpFV + sipFV);
    const real = Math.round(nominal / Math.pow(1 + inflation, t));
    const invested = Math.round(initial + monthly * months);
    const earnings = Math.max(0, nominal - invested);
    return { nominal, real, invested, earnings };
  };

  const calcNeedAtYear = (t: number) => {
    if (t >= totalYears) return 0;
    const remainingRatio = Math.max(0, (totalYears - t) / totalYears);
    return Math.round(baseNeed * remainingRatio);
  };

  const trajectory: GrowthTrajectoryPoint[] = [];
  for (let year = 1; year <= 20; year++) {
    const c = calcFV(rCons, year);
    const m = calcFV(rMod, year);
    const a = calcFV(rAgg, year);
    trajectory.push({
      year,
      investedPrincipal: c.invested,
      conservativeNominal: c.nominal,
      conservativeReal: c.real,
      moderateNominal: m.nominal,
      moderateReal: m.real,
      aggressiveNominal: a.nominal,
      aggressiveReal: a.real,
      protectionNeed: calcNeedAtYear(year)
    });
  }

  const c10 = calcFV(rCons, 10);
  const m10 = calcFV(rMod, 10);
  const a10 = calcFV(rAgg, 10);

  const c20 = calcFV(rCons, 20);
  const m20 = calcFV(rMod, 20);
  const a20 = calcFV(rAgg, 20);

  return {
    inputs: {
      initialSavings: initial,
      monthlyContribution: monthly,
      annualInflation: inflation,
      conservativeRate: rCons,
      moderateRate: rMod,
      aggressiveRate: rAgg
    },
    tenYear: {
      investedPrincipal: c10.invested,
      conservative: { nominal: c10.nominal, real: c10.real, earnings: c10.earnings },
      moderate: { nominal: m10.nominal, real: m10.real, earnings: m10.earnings },
      aggressive: { nominal: a10.nominal, real: a10.real, earnings: a10.earnings },
      protectionNeed: calcNeedAtYear(10)
    },
    twentyYear: {
      investedPrincipal: c20.invested,
      conservative: { nominal: c20.nominal, real: c20.real, earnings: c20.earnings },
      moderate: { nominal: m20.nominal, real: m20.real, earnings: m20.earnings },
      aggressive: { nominal: a20.nominal, real: a20.real, earnings: a20.earnings },
      protectionNeed: calcNeedAtYear(20)
    },
    trajectory,
    assumptions: {
      notes: [
        `Conservative scenario assumes ${(rCons * 100).toFixed(1)}% annual return (representative of fixed income, debt mutual funds, EPF, and sovereign bonds).`,
        `Moderate scenario assumes ${(rMod * 100).toFixed(1)}% annual return (representative of balanced hybrid and large-cap equity index strategies).`,
        `Higher-Growth scenario assumes ${(rAgg * 100).toFixed(1)}% annual return (representative of diversified equity mutual funds / SIP).`,
        `Inflation adjustment assumes ${(inflation * 100).toFixed(1)}% annual cost-of-living rise (Real Purchasing Power = Nominal / (1 + inf)^t).`,
        'Illustrative simulations do not guarantee actual future returns. Market-linked investments carry volatility and risk of capital loss.',
        'Life insurance protection requirements are kept strictly independent of wealth accumulation to avoid underinsurance.'
      ],
      formulaSummary: 'FV_total = Initial × (1 + r)^t + SIP × [((1 + r/12)^(12t) - 1) / (r/12)] × (1 + r/12)'
    }
  };
}
