import { describe, it, expect } from 'vitest';
import { 
  calculateInsuranceNeeds, 
  formatIndianCurrency, 
  sanitizeFinancialInputs, 
  compareScenarios,
  calculateFutureSupportExpensesPV 
} from '../lib/calculator';
import { FinancialAssessmentInputs } from '../types';

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
});
