import { describe, it, expect } from 'vitest';
import { 
  calculateInsuranceNeeds, 
  formatIndianCurrency, 
  sanitizeFinancialInputs, 
  compareScenarios,
  calculateFutureSupportExpensesPV,
  calculateGrowthProjections,
  calculateFutureGoalCost,
  calculateRequiredMonthlyContribution,
  calculateDreamLifeScenarios,
  calculateBusinessIdeaScenarios
} from '../lib/calculator';
import { FinancialAssessmentInputs, DreamLifeGoal } from '../types';

describe('LifeMap Financial Calculation Engine (Team AspireX)', () => {
  const baseSample: FinancialAssessmentInputs = {
    age: 32,
    employmentType: 'salaried',
    maritalStatus: 'married',
    dependantsCount: 2,
    supportDurationYears: 20,
    monthlyIncome: 120000,
    monthlyExpenses: 50000,
    annualExpenseInflationRate: 0.06,
    outstandingHomeLoan: 4000000,
    outstandingOtherLoans: 0,
    futureEducationCommitments: 2000000,
    otherMajorObligations: 0,
    liquidSavingsAndInvestments: 1000000,
    existingIndividualTermInsurance: 0,
    existingEmployerTermInsurance: 2000000,
    existingOtherPoliciesSumAssured: 0
  };

  // 1. A user with zero existing insurance
  it('1. calculates coverage gap for user with zero existing insurance', () => {
    const inputs: FinancialAssessmentInputs = {
      ...baseSample,
      existingIndividualTermInsurance: 0,
      existingEmployerTermInsurance: 0,
      existingOtherPoliciesSumAssured: 0
    };
    const result = calculateInsuranceNeeds(inputs, 'present_value');
    expect(result.existingTotalCoverage).toBe(0);
    expect(result.coverageGap).toBe(result.totalProtectionNeed);
    expect(result.coverageStatus).toBe('critical_shortfall');
    expect(result.coverageGap).toBeGreaterThan(0);
  });

  // 2. A user with partial existing coverage
  it('2. calculates coverage gap for user with partial existing coverage', () => {
    const inputs: FinancialAssessmentInputs = {
      ...baseSample,
      existingIndividualTermInsurance: 2500000,
      existingEmployerTermInsurance: 1500000
    };
    const result = calculateInsuranceNeeds(inputs, 'present_value');
    expect(result.existingTotalCoverage).toBe(4000000);
    expect(result.coverageGap).toBe(result.totalProtectionNeed - 4000000);
    expect(result.coverageGap).toBeGreaterThan(0);
  });

  // 3. A user whose existing coverage meets the estimate
  it('3. reports no shortfall when existing coverage exactly meets the estimate', () => {
    const inputs: FinancialAssessmentInputs = { ...baseSample };
    // First calculate total need
    const initial = calculateInsuranceNeeds(inputs, 'present_value');
    // Set existing insurance to exact need
    const matchedInputs = {
      ...inputs,
      existingIndividualTermInsurance: initial.totalProtectionNeed,
      existingEmployerTermInsurance: 0
    };
    const result = calculateInsuranceNeeds(matchedInputs, 'present_value');
    expect(result.coverageGap).toBe(0);
    expect(result.coverageStatus).toBe('adequately_covered');
  });

  // 4. A user whose existing coverage exceeds the estimate
  it('4. handles surplus when existing coverage exceeds the estimate', () => {
    const inputs: FinancialAssessmentInputs = { ...baseSample };
    const initial = calculateInsuranceNeeds(inputs, 'present_value');
    const surplusInputs = {
      ...inputs,
      existingIndividualTermInsurance: initial.totalProtectionNeed + 2000000,
      existingEmployerTermInsurance: 0
    };
    const result = calculateInsuranceNeeds(surplusInputs, 'present_value');
    expect(result.coverageGap).toBe(0); // Shortfall is 0
    expect(result.coverageStatus).toBe('surplus_coverage');
  });

  // 5. A user with no dependants
  it('5. computes needs for single user with no dependants', () => {
    const singleInputs: FinancialAssessmentInputs = {
      age: 24,
      employmentType: 'salaried',
      maritalStatus: 'single',
      dependantsCount: 0,
      supportDurationYears: 5,
      monthlyIncome: 60000,
      monthlyExpenses: 20000,
      annualExpenseInflationRate: 0.06,
      outstandingHomeLoan: 0,
      outstandingOtherLoans: 300000,
      futureEducationCommitments: 0,
      otherMajorObligations: 0,
      liquidSavingsAndInvestments: 500000,
      existingIndividualTermInsurance: 0,
      existingEmployerTermInsurance: 500000,
      existingOtherPoliciesSumAssured: 0
    };
    const result = calculateInsuranceNeeds(singleInputs, 'present_value');
    expect(result.totalProtectionNeed).toBeGreaterThanOrEqual(0);
    // Net need should cover debts minus assets
    expect(result.outstandingLiabilitiesTotal).toBe(300000);
  });

  // 6. A user with zero income (e.g. homemaker or student)
  it('6. gracefully handles zero income user', () => {
    const zeroIncomeInputs = {
      ...baseSample,
      monthlyIncome: 0
    };
    const result = calculateInsuranceNeeds(zeroIncomeInputs);
    expect(result.totalProtectionNeed).toBeGreaterThan(0);
    expect(isNaN(result.totalProtectionNeed)).toBe(false);
  });

  // 7. Missing financial inputs
  it('7. applies default sanitization for missing inputs without throwing', () => {
    const partialInputs = {};
    const sanitized = sanitizeFinancialInputs(partialInputs);
    expect(sanitized.age).toBe(30);
    expect(sanitized.supportDurationYears).toBe(20);
    expect(sanitized.annualExpenseInflationRate).toBe(0.06);
    
    const result = calculateInsuranceNeeds(partialInputs);
    expect(result.totalProtectionNeed).toBeGreaterThanOrEqual(0);
    expect(isNaN(result.totalProtectionNeed)).toBe(false);
  });

  // 8. Invalid negative financial values
  it('8. clamps negative values to zero to prevent calculation corruption', () => {
    const negativeInputs = {
      ...baseSample,
      monthlyExpenses: -50000,
      outstandingHomeLoan: -1000000,
      liquidSavingsAndInvestments: -200000
    };
    const sanitized = sanitizeFinancialInputs(negativeInputs);
    expect(sanitized.monthlyExpenses).toBe(0);
    expect(sanitized.outstandingHomeLoan).toBe(0);
    expect(sanitized.liquidSavingsAndInvestments).toBe(0);
  });

  // 9. Very large financial amounts
  it('9. accurately handles large amounts without numeric overflow', () => {
    const largeInputs = {
      ...baseSample,
      monthlyExpenses: 500000,
      outstandingHomeLoan: 50000000, // 5 Cr
      futureEducationCommitments: 30000000, // 3 Cr
      liquidSavingsAndInvestments: 10000000
    };
    const result = calculateInsuranceNeeds(largeInputs, 'present_value');
    expect(result.totalProtectionNeed).toBeGreaterThan(50000000);
    expect(isFinite(result.totalProtectionNeed)).toBe(true);
  });

  // 10. Inflation and support duration changes
  it('10. reflects higher inflation and longer support duration in increased present value', () => {
    const pvLowInf = calculateFutureSupportExpensesPV(600000, 20, 0.04, 0.075);
    const pvHighInf = calculateFutureSupportExpensesPV(600000, 20, 0.08, 0.075);
    expect(pvHighInf).toBeGreaterThan(pvLowInf);

    const pv10Years = calculateFutureSupportExpensesPV(600000, 10, 0.06, 0.075);
    const pv25Years = calculateFutureSupportExpensesPV(600000, 25, 0.06, 0.075);
    expect(pv25Years).toBeGreaterThan(pv10Years);
  });

  // 11. Outstanding liabilities
  it('11. includes all debts and mortgages in liabilities total', () => {
    const loanInputs = {
      ...baseSample,
      outstandingHomeLoan: 4500000,
      outstandingOtherLoans: 750000
    };
    const result = calculateInsuranceNeeds(loanInputs);
    expect(result.outstandingLiabilitiesTotal).toBe(5250000);
  });

  // 12. Avoidance of double-counting
  it('12. ensures assets reduce total need without double counting debts or coverage', () => {
    const testInputs = {
      ...baseSample,
      monthlyExpenses: 40000,
      outstandingHomeLoan: 2000000,
      outstandingOtherLoans: 0,
      futureEducationCommitments: 1000000,
      otherMajorObligations: 0,
      liquidSavingsAndInvestments: 1000000,
      existingIndividualTermInsurance: 1500000,
      existingEmployerTermInsurance: 500000
    };
    const result = calculateInsuranceNeeds(testInputs, 'simplified');
    // Simplified: 40,000 * 12 * 20 = 9,600,000
    // Gross: 9,600,000 + 2,000,000 + 1,000,000 = 12,600,000
    // Net need: 12,600,000 - 1,000,000 (assets) = 11,600,000
    // Total existing insurance: 1,500,000 + 500,000 = 2,000,000
    // Coverage gap: 11,600,000 - 2,000,000 = 9,600,000
    expect(result.grossResponsibilities).toBe(12600000);
    expect(result.totalProtectionNeed).toBe(11600000);
    expect(result.existingTotalCoverage).toBe(2000000);
    expect(result.coverageGap).toBe(9600000);
  });

  // 13. Scenario changes against the baseline
  it('13. correctly computes deltas when comparing alternative scenarios', () => {
    const baseline = { ...baseSample };
    const scenario = {
      ...baseSample,
      outstandingHomeLoan: baseSample.outstandingHomeLoan + 3000000, // extra 30 Lakh loan
      monthlyExpenses: baseSample.monthlyExpenses + 15000 // higher expenses
    };
    const comparison = compareScenarios(baseline, scenario, 'present_value');
    expect(comparison.needDelta).toBeGreaterThan(3000000);
    expect(comparison.gapDelta).toBeGreaterThan(3000000);
    expect(comparison.percentageNeedChange).toBeGreaterThan(0);
    expect(comparison.keyInsights.length).toBeGreaterThan(0);
  });

  // 14. Rounding and Indian currency formatting
  it('14. formats Indian currency correctly with standard and compact notation', () => {
    expect(formatIndianCurrency(1250000)).toBe('₹12,50,000');
    expect(formatIndianCurrency(15000000, true)).toBe('₹1.5 Cr');
    expect(formatIndianCurrency(500000, true)).toBe('₹5 Lakh');
    expect(formatIndianCurrency(45000, true)).toBe('₹45k');
    expect(formatIndianCurrency(0)).toBe('₹0');
    expect(formatIndianCurrency(-50000)).toBe('-₹50,000');
  });

  // 15. Deterministic 10-year and 20-year growth projections
  it('15. calculates deterministic 10-year and 20-year growth projections with nominal and real values', () => {
    const projection = calculateGrowthProjections({
      initialSavings: 500000, // ₹5 Lakhs
      monthlyContribution: 25000, // ₹25,000 / month
      annualInflation: 0.06,
      conservativeRate: 0.065,
      moderateRate: 0.10,
      aggressiveRate: 0.125,
      baselineProtectionNeed: 15000000,
      supportDurationYears: 20
    });

    expect(projection.tenYear.investedPrincipal).toBe(500000 + 25000 * 120); // ₹35 Lakhs
    expect(projection.twentyYear.investedPrincipal).toBe(500000 + 25000 * 240); // ₹65 Lakhs

    // Aggressive > Moderate > Conservative
    expect(projection.tenYear.aggressive.nominal).toBeGreaterThan(projection.tenYear.moderate.nominal);
    expect(projection.tenYear.moderate.nominal).toBeGreaterThan(projection.tenYear.conservative.nominal);

    // Real values should be less than nominal due to 6% inflation
    expect(projection.tenYear.moderate.real).toBeLessThan(projection.tenYear.moderate.nominal);
    expect(projection.twentyYear.moderate.real).toBeLessThan(projection.twentyYear.moderate.nominal);

    // Protection need at Year 20 should taper to 0 as support duration concludes
    expect(projection.tenYear.protectionNeed).toBe(7500000);
    expect(projection.twentyYear.protectionNeed).toBe(0);

    // 20 data points in trajectory
    expect(projection.trajectory.length).toBe(20);
    expect(projection.trajectory[9].year).toBe(10);
    expect(projection.trajectory[19].year).toBe(20);
  });

  // 16. Edge cases for zero savings/contribution
  it('16. handles zero initial savings and zero monthly contributions gracefully', () => {
    const projection = calculateGrowthProjections({
      initialSavings: 0,
      monthlyContribution: 0,
      baselineProtectionNeed: 0
    });
    expect(projection.tenYear.investedPrincipal).toBe(0);
    expect(projection.tenYear.moderate.nominal).toBe(0);
    expect(projection.twentyYear.moderate.nominal).toBe(0);
  });

  // 17. DreamLife future goal cost with inflation
  it('17. calculates compounded future goal cost accurately with inflation', () => {
    // Current ₹1.5 Cr home at 6% inflation over 10 years: 1.5 Cr * (1.06)^10 = 26,862,715
    const cost10Yr = calculateFutureGoalCost(15000000, 10, 0.06);
    expect(cost10Yr).toBe(26862715);

    // Zero inflation retains current cost
    const zeroInfCost = calculateFutureGoalCost(1000000, 5, 0);
    expect(zeroInfCost).toBe(1000000);

    // Zero years retains current cost
    const zeroYearsCost = calculateFutureGoalCost(1000000, 0, 0.06);
    expect(zeroYearsCost).toBe(1000000);
  });

  // 18. Required monthly savings contribution (SIP) with zero-return & compounding
  it('18. calculates required monthly contributions with payment timing & zero-return edge cases', () => {
    // Zero return: ₹12 Lakhs needed in 1 year = ₹1,00,000 / month
    const zeroReturnMonthly = calculateRequiredMonthlyContribution(1200000, 1, 0, 0);
    expect(zeroReturnMonthly).toBe(100000);

    // Compounded return: ₹10 Lakhs in 5 years at 10% annual return
    const sipMonthly = calculateRequiredMonthlyContribution(1000000, 5, 0.10, 0);
    expect(sipMonthly).toBeGreaterThan(0);
    // Standard SIP needed is less than uncompounded ₹10L / 60mo = ₹16,667
    expect(sipMonthly).toBeLessThan(16667);

    // Existing dedicated savings reduces required contribution
    const sipWithDedicated = calculateRequiredMonthlyContribution(1000000, 5, 0.10, 500000);
    expect(sipWithDedicated).toBeLessThan(sipMonthly);
  });

  // 19. DreamLife 3 distinct scenario pathways
  it('19. calculates 3 distinct scenarios: Current Path, Growth Path, and Priority Path', () => {
    const sampleGoals: DreamLifeGoal[] = [
      {
        id: 'g1',
        category: 'property',
        title: 'New Family Villa',
        description: 'Independent house',
        targetYears: 10,
        currentEstimatedCost: 15000000,
        futureInflatedCost: 26862720,
        estimateSource: 'user_supplied',
        priority: 'essential'
      },
      {
        id: 'g2',
        category: 'vehicle',
        title: 'Two Premium Cars',
        description: 'Vehicles for family mobility',
        targetYears: 5,
        currentEstimatedCost: 3000000,
        futureInflatedCost: 4014677,
        estimateSource: 'user_supplied',
        priority: 'flexible'
      }
    ];

    const result = calculateDreamLifeScenarios({
      goals: sampleGoals,
      monthlyIncome: 150000,
      monthlyExpenses: 60000,
      liquidSavings: 1500000, // ₹15 Lakhs (reserves ₹3.6L for 6mo emergency fund)
      inflationRate: 0.06,
      nominalReturnRate: 0.10
    });

    // 1. Current Path
    expect(result.currentPath.monthlySurplus).toBe(90000);
    expect(result.currentPath.totalGoalsCount).toBe(2);

    // 2. Growth Path should boost investable surplus and corpus
    expect(result.growthPath.monthlySurplus).toBeGreaterThan(result.currentPath.monthlySurplus);
    expect(result.growthPath.projectedCorpus10Yr).toBeGreaterThan(result.currentPath.projectedCorpus10Yr);

    // 3. Priority Path should reduce immediate required contribution by postponing flexible goals
    expect(result.priorityPath.targetMonthlyContribution).toBeLessThan(result.currentPath.targetMonthlyContribution);
  });

  // 20. Business idea explorer feasibility calculations
  it('20. evaluates business venture break-even timeline and cash flow feasibility', () => {
    // Profitable venture
    const viable = calculateBusinessIdeaScenarios({
      ideaTitle: 'Consulting Practice',
      startupCapital: 600000, // ₹6 Lakhs
      monthlyOperatingCosts: 40000,
      monthlyRevenue: 100000,
      profitMarginPct: 80 // 80% gross margin = ₹80,000 - ₹40,000 opex = ₹40,000 net/mo
    });

    expect(viable.isCashFlowPositive).toBe(true);
    expect(viable.monthlyNetCashFlow).toBe(40000);
    expect(viable.breakEvenMonths).toBe(15); // ₹6,00,000 / ₹40,000 = 15 months
    expect(viable.cashFlowRunwayRecommended).toBe(600000 + 40000 * 6); // ₹8.4 Lakhs

    // Unviable / negative cash flow venture
    const unviable = calculateBusinessIdeaScenarios({
      ideaTitle: 'High-Overhead Cafe',
      startupCapital: 2000000,
      monthlyOperatingCosts: 150000,
      monthlyRevenue: 100000,
      profitMarginPct: 50 // ₹50,000 gross - ₹1,50,000 opex = -₹1,00,000 net/mo
    });

    expect(unviable.isCashFlowPositive).toBe(false);
    expect(unviable.monthlyNetCashFlow).toBeLessThan(0);
    expect(unviable.breakEvenMonths).toBeNull();
  });
});

