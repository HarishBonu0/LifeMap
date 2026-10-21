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
  GrowthTrajectoryPoint,
  DreamLifeGoal,
  DreamLifeScenarioInputs,
  DreamLifeScenarioSummary,
  BusinessIdeaInputs,
  BusinessIdeaResult
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

/**
 * Calculates future inflated cost of a goal:
 * Future Cost = Current Cost * (1 + inflation rate)^years
 */
export function calculateFutureGoalCost(
  currentCost: number,
  years: number,
  inflationRate: number = 0.06
): number {
  if (currentCost <= 0 || isNaN(currentCost)) return 0;
  if (years <= 0 || isNaN(years)) return Math.round(currentCost);
  const rate = Math.max(0, Math.min(0.25, inflationRate));
  return Math.round(currentCost * Math.pow(1 + rate, years));
}

/**
 * Calculates the required monthly contribution (SIP) to reach a target future sum
 * over a given number of years at an expected annual return rate, taking into account
 * any initial dedicated savings, handling zero-return and edge cases explicitly.
 */
export function calculateRequiredMonthlyContribution(
  targetFutureCost: number,
  years: number,
  annualReturnRate: number = 0.10,
  currentDedicatedSavings: number = 0
): number {
  if (targetFutureCost <= 0 || isNaN(targetFutureCost)) return 0;
  if (years <= 0 || isNaN(years)) return Math.round(targetFutureCost);

  const months = Math.round(years * 12);
  if (months <= 0) return Math.round(targetFutureCost);

  const dedicated = Math.max(0, currentDedicatedSavings || 0);

  // Zero-return scenario (e.g. cash hoard / 0% interest account)
  if (Math.abs(annualReturnRate) < 0.0001) {
    const netShortfall = Math.max(0, targetFutureCost - dedicated);
    return Math.round(netShortfall / months);
  }

  // Future value of existing dedicated savings at maturity
  const fvExisting = dedicated * Math.pow(1 + annualReturnRate, years);
  const remainingNeeded = Math.max(0, targetFutureCost - fvExisting);

  if (remainingNeeded <= 0) return 0;

  // Monthly compounded rate
  const monthlyRate = annualReturnRate / 12;
  // SIP annuity formula with beginning-of-month payments:
  // FV = P * [((1 + r)^n - 1) / r] * (1 + r)
  const annuityFactor = ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  
  if (annuityFactor <= 0) return Math.round(remainingNeeded / months);
  return Math.round(remainingNeeded / annuityFactor);
}

/**
 * Deterministically computes the 3 DreamLife AI Scenarios:
 * 1. Current Path: Baseline income, expenses, and current saving capacity.
 * 2. Growth Path: User tests alternative savings rate & progressive income growth.
 * 3. Priority Path: Prioritizes Essential & High goals, postpones medium/flexible goals to fit realistic surplus.
 */
export function calculateDreamLifeScenarios(inputs: DreamLifeScenarioInputs): {
  currentPath: DreamLifeScenarioSummary;
  growthPath: DreamLifeScenarioSummary;
  priorityPath: DreamLifeScenarioSummary;
} {
  const inflation = typeof inputs.inflationRate === 'number' ? Math.max(0, inputs.inflationRate) : 0.06;
  const returnRate = typeof inputs.nominalReturnRate === 'number' ? inputs.nominalReturnRate : 0.10;
  const monthlyIncome = Math.max(0, inputs.monthlyIncome || 0);
  const monthlyExpenses = Math.max(0, inputs.monthlyExpenses || 0);
  const currentSurplus = Math.max(0, monthlyIncome - monthlyExpenses);

  // Prevent double-counting: preserve emergency fund (6 months of living expenses)
  const emergencyFundPreserved = monthlyExpenses * 6;
  const liquidSavingsAvailable = Math.max(0, (inputs.liquidSavings || 0) - emergencyFundPreserved);

  // Calculate future cost for each goal
  const goalsWithFuture = inputs.goals.map(g => {
    const futureCost = calculateFutureGoalCost(g.currentEstimatedCost, g.targetYears, inflation);
    return {
      ...g,
      futureInflatedCost: futureCost
    };
  });

  const totalNominal = goalsWithFuture.reduce((sum, g) => sum + g.currentEstimatedCost, 0);
  const totalFuture = goalsWithFuture.reduce((sum, g) => sum + g.futureInflatedCost, 0);

  // Total required monthly contribution to fund all goals across their respective horizons
  const totalRequiredMonthly = goalsWithFuture.reduce((sum, g) => {
    return sum + calculateRequiredMonthlyContribution(g.futureInflatedCost, g.targetYears, returnRate, 0);
  }, 0);

  // Function to simulate corpus growth at rate r
  const calcCorpus = (initial: number, monthlySip: number, years: number, r: number) => {
    const months = years * 12;
    const lumpFV = initial * Math.pow(1 + r, years);
    const mRate = r / 12;
    const sipFV = mRate > 0 
      ? monthlySip * ((Math.pow(1 + mRate, months) - 1) / mRate) * (1 + mRate)
      : monthlySip * months;
    return Math.round(lumpFV + sipFV);
  };

  // 1. Current Path
  const current10YrCorpus = calcCorpus(liquidSavingsAvailable, currentSurplus, 10, returnRate);
  const current20YrCorpus = calcCorpus(liquidSavingsAvailable, currentSurplus, 20, returnRate);

  const sortedCurrentGoals = [...goalsWithFuture].sort((a, b) => a.targetYears - b.targetYears);
  const fundedCurrentIds: string[] = [];
  const unfundedCurrentIds: string[] = [];

  for (const g of sortedCurrentGoals) {
    const projectedPoolAtYear = calcCorpus(liquidSavingsAvailable, currentSurplus, g.targetYears, returnRate);
    if (projectedPoolAtYear >= g.futureInflatedCost) {
      fundedCurrentIds.push(g.id);
    } else {
      unfundedCurrentIds.push(g.id);
    }
  }

  const currentShortfallMonthly = Math.max(0, totalRequiredMonthly - currentSurplus);
  const currentTotalShortfall = Math.max(0, totalFuture - current10YrCorpus);

  const currentPath: DreamLifeScenarioSummary = {
    id: 'current_path',
    title: 'Current Path',
    tagline: 'Status Quo: Continuing at current income, spending, and saving habits.',
    monthlySurplus: currentSurplus,
    targetMonthlyContribution: totalRequiredMonthly,
    shortfallPerMonth: currentShortfallMonthly,
    totalGoalCostNominal: totalNominal,
    totalGoalCostFuture: totalFuture,
    projectedCorpus10Yr: current10YrCorpus,
    projectedCorpus20Yr: current20YrCorpus,
    fundedGoalsCount: fundedCurrentIds.length,
    totalGoalsCount: goalsWithFuture.length,
    potentialShortfall: currentTotalShortfall,
    timelineHighlights: [
      `Current monthly investable surplus: ${formatIndianCurrency(currentSurplus)}`,
      `Target monthly allocation needed to fulfill all goals: ${formatIndianCurrency(totalRequiredMonthly)}`,
      currentShortfallMonthly > 0
        ? `Monthly gap of ${formatIndianCurrency(currentShortfallMonthly)} requires prioritizing or extending timelines.`
        : 'Current surplus is sufficient to fund your stated goals!'
    ],
    assumptions: [
      `Assumes current monthly savings of ${formatIndianCurrency(currentSurplus)} continues steadily.`,
      `Preserves 6 months of living expenses (${formatIndianCurrency(emergencyFundPreserved)}) strictly for family emergency security.`,
      `Illustrative annual compounded portfolio return of ${(returnRate * 100).toFixed(1)}%.`,
      `Assumes annual inflation of ${(inflation * 100).toFixed(1)}% across goal costs.`
    ],
    fundedGoalIds: fundedCurrentIds,
    unfundedGoalIds: unfundedCurrentIds
  };

  // 2. Growth Path
  const incomeGrowthPct = inputs.growthIncomeGrowthRatePct || 0.10;
  const boostedIncome = monthlyIncome * (1 + incomeGrowthPct);
  const optimizedExpenses = monthlyExpenses * 0.92; // 8% discretionary expense control
  const growthSurplus = Math.round(boostedIncome - optimizedExpenses);

  const growth10YrCorpus = calcCorpus(liquidSavingsAvailable, growthSurplus, 10, returnRate + 0.015);
  const growth20YrCorpus = calcCorpus(liquidSavingsAvailable, growthSurplus, 20, returnRate + 0.015);

  const fundedGrowthIds: string[] = [];
  const unfundedGrowthIds: string[] = [];
  for (const g of sortedCurrentGoals) {
    const projectedPoolAtYear = calcCorpus(liquidSavingsAvailable, growthSurplus, g.targetYears, returnRate + 0.015);
    if (projectedPoolAtYear >= g.futureInflatedCost) {
      fundedGrowthIds.push(g.id);
    } else {
      unfundedGrowthIds.push(g.id);
    }
  }

  const growthPath: DreamLifeScenarioSummary = {
    id: 'growth_path',
    title: 'Growth Path',
    tagline: 'Upskill & Optimize: 10% career income growth with disciplined 8% discretionary expense control.',
    monthlySurplus: growthSurplus,
    targetMonthlyContribution: totalRequiredMonthly,
    shortfallPerMonth: Math.max(0, totalRequiredMonthly - growthSurplus),
    totalGoalCostNominal: totalNominal,
    totalGoalCostFuture: totalFuture,
    projectedCorpus10Yr: growth10YrCorpus,
    projectedCorpus20Yr: growth20YrCorpus,
    fundedGoalsCount: fundedGrowthIds.length,
    totalGoalsCount: goalsWithFuture.length,
    potentialShortfall: Math.max(0, totalFuture - growth10YrCorpus),
    timelineHighlights: [
      `Accelerated monthly investable surplus: ${formatIndianCurrency(growthSurplus)} (+${formatIndianCurrency(growthSurplus - currentSurplus)})`,
      `10-Year Projected Wealth Corpus: ${formatIndianCurrency(growth10YrCorpus, true)}`,
      `Funds ${fundedGrowthIds.length} of ${goalsWithFuture.length} dream goals ahead of schedule.`
    ],
    assumptions: [
      `Hypothesizes a 10% increase in household earnings through career progression or professional upskilling.`,
      `Trims discretionary lifestyle spending by 8% to redeploy directly into milestone investments.`,
      `Assumes a diversified equity mutual fund allocation earning an illustrative ${( (returnRate + 0.015) * 100).toFixed(1)}% annual CAGR.`,
      `Past market performance is illustrative and not guaranteed.`
    ],
    fundedGoalIds: fundedGrowthIds,
    unfundedGoalIds: unfundedGrowthIds
  };

  // 3. Priority Path
  const postponeYears = inputs.priorityPostponeYears || 4;
  const prioritizedGoals = goalsWithFuture.map(g => {
    if (g.priority === 'flexible' || g.priority === 'medium') {
      const extendedYears = g.targetYears + postponeYears;
      return {
        ...g,
        targetYears: extendedYears,
        futureInflatedCost: calculateFutureGoalCost(g.currentEstimatedCost, extendedYears, inflation)
      };
    }
    return g;
  });

  const priorityRequiredMonthly = prioritizedGoals.reduce((sum, g) => {
    return sum + calculateRequiredMonthlyContribution(g.futureInflatedCost, g.targetYears, returnRate, 0);
  }, 0);

  const fundedPriorityIds: string[] = [];
  const unfundedPriorityIds: string[] = [];
  for (const g of prioritizedGoals) {
    const projectedPoolAtYear = calcCorpus(liquidSavingsAvailable, currentSurplus, g.targetYears, returnRate);
    if (projectedPoolAtYear >= g.futureInflatedCost) {
      fundedPriorityIds.push(g.id);
    } else {
      unfundedPriorityIds.push(g.id);
    }
  }

  const priorityPath: DreamLifeScenarioSummary = {
    id: 'priority_path',
    title: 'Priority Path',
    tagline: 'Strategic Sequencing: Locks in essential family safety & education first; postpones lifestyle items by 3–4 years.',
    monthlySurplus: currentSurplus,
    targetMonthlyContribution: priorityRequiredMonthly,
    shortfallPerMonth: Math.max(0, priorityRequiredMonthly - currentSurplus),
    totalGoalCostNominal: totalNominal,
    totalGoalCostFuture: prioritizedGoals.reduce((sum, g) => sum + g.futureInflatedCost, 0),
    projectedCorpus10Yr: current10YrCorpus,
    projectedCorpus20Yr: current20YrCorpus,
    fundedGoalsCount: fundedPriorityIds.length,
    totalGoalsCount: prioritizedGoals.length,
    potentialShortfall: Math.max(0, prioritizedGoals.reduce((sum, g) => sum + g.futureInflatedCost, 0) - current10YrCorpus),
    timelineHighlights: [
      `Lowers immediate monthly funding requirement from ${formatIndianCurrency(totalRequiredMonthly)} down to ${formatIndianCurrency(priorityRequiredMonthly)}.`,
      `Fully protects non-negotiable milestones (Emergency Fund, Debt Shield, Child Education).`,
      `Postpones flexible upgrades (e.g. luxury vehicle or holiday) by ${postponeYears} years to eliminate acute financial strain.`
    ],
    assumptions: [
      `Essential and High-priority goals are funded strictly on their original timelines.`,
      `Medium and Flexible goals are postponed by ${postponeYears} years, allowing compounding to accumulate more corpus naturally.`,
      `Requires no increase in debt and keeps family financial peace intact.`
    ],
    fundedGoalIds: fundedPriorityIds,
    unfundedGoalIds: unfundedPriorityIds
  };

  return {
    currentPath,
    growthPath,
    priorityPath
  };
}

/**
 * Calculates deterministic Business Idea feasibility metrics:
 * Startup capital, gross profit, net cash flow, break-even timeline, and risk analysis.
 */
export function calculateBusinessIdeaScenarios(inputs: BusinessIdeaInputs): BusinessIdeaResult {
  const capital = Math.max(0, inputs.startupCapital || 0);
  const opex = Math.max(0, inputs.monthlyOperatingCosts || 0);
  const revenue = Math.max(0, inputs.monthlyRevenue || 0);
  const marginPct = Math.max(0, Math.min(100, inputs.profitMarginPct || 0));

  const grossProfit = Math.round(revenue * (marginPct / 100));
  const netCashFlow = grossProfit - opex;
  const isPositive = netCashFlow > 0;

  const breakEven = isPositive && capital > 0 ? Math.ceil(capital / netCashFlow) : null;
  const runway = capital + opex * 6; // recommended 6-month buffer

  const calcScenario = (revMultiplier: number, opexMultiplier: number) => {
    const sRev = Math.round(revenue * revMultiplier);
    const sOpex = Math.round(opex * opexMultiplier);
    const sGross = Math.round(sRev * (marginPct / 100));
    const sNet = sGross - sOpex;
    const sBreakEven = sNet > 0 && capital > 0 ? Math.ceil(capital / sNet) : null;
    return { revenue: sRev, netCashFlow: sNet, breakEvenMonths: sBreakEven };
  };

  return {
    ideaTitle: inputs.ideaTitle || 'New Venture Proposal',
    startupCapital: capital,
    monthlyOperatingCosts: opex,
    monthlyRevenue: revenue,
    profitMarginPct: marginPct,
    monthlyGrossProfit: grossProfit,
    monthlyNetCashFlow: netCashFlow,
    breakEvenMonths: breakEven,
    cashFlowRunwayRecommended: runway,
    isCashFlowPositive: isPositive,
    scenarios: {
      conservative: calcScenario(0.8, 1.05), // -20% revenue, +5% opex
      base: calcScenario(1.0, 1.0),
      optimistic: calcScenario(1.2, 1.0) // +20% revenue
    },
    risksAndMitigations: [
      'Revenue is not profit: Operating expenses, customer acquisition costs, and taxes must be settled before cash is realized.',
      `Working Capital Buffer: Maintain at least ${formatIndianCurrency(opex * 6)} (6 months of operational expenses) in liquid reserves to survive initial payment delays.`,
      'Do not stake family emergency reserves or term insurance cover as startup collateral.',
      breakEven 
        ? `Estimated capital recovery period is ${breakEven} months under base assumptions, provided steady operating margins are maintained.`
        : 'Under current projections, monthly cash flow is zero or negative. Reduce monthly operating overhead or refine pricing structure before deploying capital.'
    ],
    disclaimer: 'Illustrative educational modeling only. Business performance depends on product-market fit, client contracts, and macroeconomic factors. LifeMap does not provide commercial underwriting or venture capital advisory.'
  };
}

