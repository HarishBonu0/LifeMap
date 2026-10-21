import { InsuranceScheme } from '../types';

export const VERIFIED_INSURANCE_SCHEMES: InsuranceScheme[] = [
  // 1. Pure Term Insurance
  {
    id: 'scheme-lic-tech-term',
    insurer: 'Life Insurance Corporation of India (LIC)',
    name: 'LIC Digi Term / Tech Term (Plan 854)',
    category: 'term',
    categoryLabel: 'Pure Term Insurance',
    policyPurpose: 'Pure mortality risk transfer providing a tax-free financial compensation to nominees upon the demise of the life assured. No survival or maturity benefit.',
    entryAgeMin: 18,
    entryAgeMax: 65,
    maxMaturityAge: 80,
    premiumPaymentTerms: 'Regular Pay, Limited Pay (5 or 10 years), or Single Premium',
    policyTerm: '10 to 40 years (subject to max maturity age of 80)',
    sumAssuredMin: 5000000,
    sumAssuredText: '₹50 Lakhs to No upper limit (subject to underwriting)',
    indicativeAnnualCost: '₹9,200 – ₹16,500 / year for ₹1 Cr cover (indicative 30-yr-old non-smoker)',
    keyBenefits: [
      'High pure protection coverage backed by sovereign guarantee under LIC Act Section 37',
      'Option to choose Level Sum Assured or Increasing Sum Assured (rises by 10% annually after 5th year)',
      'Special differential lower premium rates for non-smoker healthy individuals',
      'Accident benefit rider add-on available for accidental demise compensation',
      'Tax deduction on premiums under Section 80C and 100% tax-free death claim under Section 10(10D)'
    ],
    majorExclusions: [
      'Suicide within 12 months from policy commencement: insurer pays 80% of total premiums received (excluding taxes/riders)',
      'Death resulting from intentional self-injury, intoxication, or participation in criminal breach of law',
      'Deliberate non-disclosure or fraudulent omission of pre-existing medical ailments or tobacco use'
    ],
    importantConditions: [
      'Pure risk policy with zero maturity value if the life assured survives the policy term',
      'Requires mandatory medical screening (tele-MER or physical blood panel) and ITR/salary slip income proof for covers exceeding ₹1 Crore',
      '30-day grace period for annual/half-yearly premiums; 15-day grace period for monthly mode'
    ],
    officialUrl: 'https://licindia.in',
    isUlipOrMarketLinked: false,
    isEndowmentOrSavings: false,
    investmentVsInsuranceNotice: 'This is a pure protection policy. It transfers financial catastrophe risk to the insurer and generates zero investment returns. It is designed solely to replace lost income for dependants.',
    isDemoSample: false
  },
  {
    id: 'scheme-hdfc-click2protect-super',
    insurer: 'HDFC Life Insurance Co. Ltd.',
    name: 'HDFC Life Click 2 Protect Super',
    category: 'term',
    categoryLabel: 'Pure Term Insurance',
    policyPurpose: 'Comprehensive pure term insurance allowing customizable cover variants (Life, Extra Life, or Income Plus) to safeguard dependants from income interruption.',
    entryAgeMin: 18,
    entryAgeMax: 65,
    maxMaturityAge: 85,
    premiumPaymentTerms: 'Regular Pay, Limited Pay (Pay till 60, 5/10/12 yrs), Single Pay',
    policyTerm: '10 to 40 years (whole-life option up to age 85 or 99)',
    sumAssuredMin: 5000000,
    sumAssuredText: '₹50 Lakhs to ₹10+ Crores (based on financial underwriting)',
    indicativeAnnualCost: '₹8,400 – ₹14,200 / year for ₹1 Cr cover (indicative 30-yr-old non-smoker)',
    keyBenefits: [
      'Life Stage Protection: Option to enhance sum assured by 25%–50% upon marriage or birth of children without fresh medicals',
      'Accelerated Terminal Illness Benefit: 100% of sum assured paid immediately upon diagnosis of terminal illness with <6 months life expectancy',
      'Waiver of Premium on Total & Permanent Disability option',
      'Comprehensive Critical Illness rider covering 60+ critical illnesses',
      'Income payout option: Nominee can receive claim as lump sum or monthly income over 10 years'
    ],
    majorExclusions: [
      'Suicide within first 12 months from date of inception or revival',
      'Pre-existing conditions not declared during underwriting (covered under Section 45 of Insurance Act after 3 continuous policy years)',
      'War, civil commotion, or active participation in military operations'
    ],
    importantConditions: [
      'Zero surrender value under regular pay term option',
      'Annual premium locking: Fixed premium remains unchanged throughout the policy tenure regardless of age advancement',
      'Proof of income (Form 16 or 3-year ITR) mandatory for high sums assured'
    ],
    officialUrl: 'https://www.hdfclife.com',
    isUlipOrMarketLinked: false,
    isEndowmentOrSavings: false,
    investmentVsInsuranceNotice: 'Pure insurance policy. Every rupee goes towards buying high death cover. No investment yield or cash surrender value.',
    isDemoSample: false
  },
  {
    id: 'scheme-icici-iprotect-smart',
    insurer: 'ICICI Prudential Life Insurance Co. Ltd.',
    name: 'ICICI Pru iProtect Smart',
    category: 'term',
    categoryLabel: 'Pure Term Insurance',
    policyPurpose: 'Flexible individual pure protection plan with integrated terminal illness payout, extensive critical illness coverage, and accidental death riders.',
    entryAgeMin: 18,
    entryAgeMax: 65,
    maxMaturityAge: 85,
    premiumPaymentTerms: 'Regular Pay, Limited Pay (Pay till age 60, 5/7/10 yrs)',
    policyTerm: '5 to 40 years or Whole Life (up to age 99)',
    sumAssuredMin: 5000000,
    sumAssuredText: '₹50 Lakhs to ₹20+ Crores',
    indicativeAnnualCost: '₹8,200 – ₹13,800 / year for ₹1 Cr cover (indicative 30-yr-old non-smoker)',
    keyBenefits: [
      'Instant payout on terminal illness diagnosis to fund emergency treatment and palliative care',
      'Accelerated Critical Illness benefit covering 34 major ailments including cancer, heart attack, and stroke',
      'Special discounted rates for salaried professionals and female policyholders',
      'Accidental Death benefit doubles sum assured in case of accidental demise',
      'Multiple claim payout choices: Lump-sum, Regular Monthly Income, or Increasing Monthly Income'
    ],
    majorExclusions: [
      'Suicide claim repudiated in first 12 months (premiums refunded up to 80%)',
      'Failure to disclose tobacco, gutkha, or nicotine replacement habits during application',
      'Ailments diagnosed during the 90-day waiting period for critical illness rider'
    ],
    importantConditions: [
      'Pure term contract: no investment returns or bonuses accrue',
      'Requires financial justification: Sum assured typically capped at 20x–25x annual CTC for age 18–35, tapering with age',
      'Premiums eligible for tax deductions under 80C; critical illness premiums under 80D'
    ],
    officialUrl: 'https://www.iciciprulife.com',
    isUlipOrMarketLinked: false,
    isEndowmentOrSavings: false,
    investmentVsInsuranceNotice: 'Pure life insurance. Do not purchase this expecting investment maturity values; its purpose is family income replacement.',
    isDemoSample: false
  },
  {
    id: 'scheme-max-smart-total-elite',
    insurer: 'Max Life Insurance Co. Ltd.',
    name: 'Max Life Smart Total Elite Protection (STEP)',
    category: 'term',
    categoryLabel: 'Pure Term Insurance',
    policyPurpose: 'Term plan engineered for high-net-worth individuals and salaried earners seeking comprehensive protection with special coverage renewal checkpoints.',
    entryAgeMin: 18,
    entryAgeMax: 65,
    maxMaturityAge: 85,
    premiumPaymentTerms: 'Regular, Limited Pay (5/10/12/15 yrs), Pay-to-60',
    policyTerm: '10 to 50 years',
    sumAssuredMin: 10000000,
    sumAssuredText: '₹1 Crore to ₹25+ Crores',
    indicativeAnnualCost: '₹8,900 – ₹15,100 / year for ₹1 Cr cover (indicative 30-yr-old non-smoker)',
    keyBenefits: [
      'Special Exit Value: Option to exit policy at retirement age (e.g. age 65) and receive 100% of base premiums back',
      'Insta-Claim feature with claims paid within 24 hours for eligible policies',
      'Accelerated Critical Illness cover for 40 life-threatening conditions',
      'Child education booster benefit rider add-on',
      'Cover continuation benefit allowing policy to continue without premium payment upon severe illness'
    ],
    majorExclusions: [
      'Suicide within year one of policy inception',
      'Pre-existing undisclosed chronic conditions (kidney disease, coronary heart disease, diabetes history)',
      'Substance abuse or narcotics involvement'
    ],
    importantConditions: [
      'Minimum sum assured entry threshold is ₹1 Crore',
      'Requires medical tele-underwriting and video verification',
      'Pure risk structure with optional special exit value at specific retirement windows'
    ],
    officialUrl: 'https://www.maxlifeinsurance.com',
    isUlipOrMarketLinked: false,
    isEndowmentOrSavings: false,
    investmentVsInsuranceNotice: 'Focuses on pure mortality risk. Exit value at retirement does not include compound interest.',
    isDemoSample: false
  },

  // 2. Savings / Traditional Endowment Plans
  {
    id: 'scheme-lic-new-jeevan-anand',
    insurer: 'Life Insurance Corporation of India (LIC)',
    name: 'LIC New Jeevan Anand (Plan 915)',
    category: 'endowment',
    categoryLabel: 'Savings & Endowment Plan',
    policyPurpose: 'Combination of conservative savings and life insurance cover providing a lump sum maturity amount plus continued life cover after policy term.',
    entryAgeMin: 18,
    entryAgeMax: 50,
    maxMaturityAge: 75,
    premiumPaymentTerms: 'Regular annual, half-yearly, quarterly, or monthly ECS',
    policyTerm: '15 to 35 years',
    sumAssuredMin: 100000,
    sumAssuredText: '₹1 Lakh to No upper limit',
    indicativeAnnualCost: '₹48,000 – ₹62,000 / year for only ₹10 Lakhs sum assured',
    keyBenefits: [
      'Maturity Benefit: Basic Sum Assured along with Simple Reversionary Bonuses and Final Additional Bonus paid at end of policy term',
      'Continued Life Cover: Basic sum assured remains active throughout life after policy maturity until the death of the life assured',
      'Loan facility available after 2 full years of premium payments',
      'Income tax benefits under Section 80C and Section 10(10D)'
    ],
    majorExclusions: [
      'Suicide within 12 months (premiums refunded at 80% or surrender value)',
      'Lapse without revival if premiums are not paid within 30-day grace period'
    ],
    importantConditions: [
      'Severe underinsurance hazard: Premiums are 5x to 8x higher than Pure Term for only a fraction of the life cover',
      'Historical internal rate of return (IRR) has averaged approximately 4.5%–5.5%, which historically lags retail inflation in India',
      'High surrender charges if surrendered in early policy years'
    ],
    officialUrl: 'https://licindia.in',
    isUlipOrMarketLinked: false,
    isEndowmentOrSavings: true,
    investmentVsInsuranceNotice: 'IMPORTANT DISTINCTION: Endowment plans blend modest insurance cover with conservative debt savings. The cover (e.g. ₹10 Lakhs) is generally inadequate for family income replacement, and investment returns have historically struggled to beat inflation.',
    isDemoSample: false
  },
  {
    id: 'scheme-hdfc-sanchay-plus',
    insurer: 'HDFC Life Insurance Co. Ltd.',
    name: 'HDFC Life Sanchay Plus',
    category: 'endowment',
    categoryLabel: 'Guaranteed Savings / Income Plan',
    policyPurpose: 'Non-participating, non-linked savings plan offering guaranteed periodic payouts or lump sum maturity along with life cover.',
    entryAgeMin: 5,
    entryAgeMax: 60,
    maxMaturityAge: 76,
    premiumPaymentTerms: 'Limited Pay: 5 to 12 years',
    policyTerm: '10 to 40 years or Lifetime Income variant up to age 99',
    sumAssuredMin: 300000,
    sumAssuredText: '10x to 12x annual premium (e.g. ₹10 Lakhs for ₹1 Lakh/year premium)',
    indicativeAnnualCost: '₹1,00,000 / year for ~₹10.5 Lakh life cover',
    keyBenefits: [
      'Guaranteed Income payout options for 10, 25, or 30 years after premium payment term',
      'Return of Total Premiums paid at the end of payout period under Life Long Income option',
      'Guaranteed additions declared at policy inception; zero equity market fluctuation risk',
      'Tax advantages under Section 80C and Section 10(10D) subject to budget caps'
    ],
    majorExclusions: [
      'Suicide clause within 12 months of inception',
      'Critical illness or disability not covered unless specific riders are purchased separately'
    ],
    importantConditions: [
      'Low life cover multiplier (typically 10x annual premium), which does not replace lost income for dependants with loans',
      'Internal Rate of Return (IRR) is locked in at approximately 5.2%–6.0% p.a., suited only for conservative debt allocations',
      'Strict surrender penalty rules apply before completion of premium payment term'
    ],
    officialUrl: 'https://www.hdfclife.com',
    isUlipOrMarketLinked: false,
    isEndowmentOrSavings: true,
    investmentVsInsuranceNotice: 'Guaranteed savings plans provide sovereign or corporate-backed fixed income. They should NOT be treated as a substitute for pure term life insurance needed to protect dependants from high liabilities.',
    isDemoSample: false
  },

  // 3. Whole Life Plans
  {
    id: 'scheme-lic-jeevan-umang',
    insurer: 'Life Insurance Corporation of India (LIC)',
    name: 'LIC Jeevan Umang (Plan 945)',
    category: 'whole_life',
    categoryLabel: 'Whole Life Plan',
    policyPurpose: 'Whole life assurance policy offering annual survival benefits from end of premium payment term up to age 100, plus a lump sum upon demise or reaching 100 years.',
    entryAgeMin: 0,
    entryAgeMax: 55,
    maxMaturityAge: 100,
    premiumPaymentTerms: 'Limited Pay: 15, 20, 25, or 30 years',
    policyTerm: '100 minus entry age (up to age 100)',
    sumAssuredMin: 200000,
    sumAssuredText: '₹2 Lakhs to No upper limit',
    indicativeAnnualCost: '₹52,000 / year for ₹10 Lakh sum assured (15-yr pay, age 30)',
    keyBenefits: [
      'Guaranteed annual survival benefit equal to 8% of Basic Sum Assured paid every year starting from end of premium payment term till age 99',
      'Lump-sum maturity payout at age 100 comprising Basic Sum Assured + Simple Reversionary Bonuses + Final Additional Bonus',
      'Whole life coverage: Sum assured + accrued bonuses payable to nominee on demise at any age up to 100',
      'Loan facility available after 2 years of continuous premium payments'
    ],
    majorExclusions: [
      'Suicide within 12 months',
      'Lapse due to non-payment of premiums within grace period'
    ],
    importantConditions: [
      'High premium commitment across 15–30 years',
      '8% payout is calculated on Basic Sum Assured, NOT on the total premiums paid',
      'Effective annualized yield over multi-decade tenure is approximately 5.0%–5.8%'
    ],
    officialUrl: 'https://licindia.in',
    isUlipOrMarketLinked: false,
    isEndowmentOrSavings: true,
    investmentVsInsuranceNotice: 'Whole life plans provide legacy planning and retirement cash flow, but offer low sum assured per rupee of premium. Maintain an independent pure term plan for family liabilities.',
    isDemoSample: false
  },

  // 4. Unit-Linked Insurance Plans (ULIPs)
  {
    id: 'scheme-hdfc-click2wealth',
    insurer: 'HDFC Life Insurance Co. Ltd.',
    name: 'HDFC Life Click 2 Wealth',
    category: 'ulip',
    categoryLabel: 'Unit-Linked Insurance Plan (ULIP)',
    policyPurpose: 'Market-linked insurance plan where premium is invested in selected debt and equity funds after mortality charge deductions. Sum assured or fund value paid on demise.',
    entryAgeMin: 0,
    entryAgeMax: 65,
    maxMaturityAge: 75,
    premiumPaymentTerms: 'Regular Pay or Limited Pay (5/7/10 yrs)',
    policyTerm: '10 to 40 years or Whole Life',
    sumAssuredMin: 250000,
    sumAssuredText: '10x annual premium (e.g. ₹10 Lakhs for ₹1 Lakh/yr investment)',
    indicativeAnnualCost: '₹50,000 – ₹5,00,000 / year (Investment amount)',
    keyBenefits: [
      'Zero premium allocation charges and zero policy administration charges: 100% of premium invested in chosen funds',
      'Mortality Charge Return: Insurer refunds total mortality charges deducted over the term upon maturity',
      'Unlimited free switches between equity, hybrid, and liquid debt funds',
      'Fund Value paid on maturity; Higher of Sum Assured or Fund Value paid on death of life assured',
      'Tax-free switching between asset classes without triggering capital gains tax'
    ],
    majorExclusions: [
      'Suicide in year one: Fund value as on date of death is paid to nominee',
      'Investment losses due to equity market crashes are borne entirely by the policyholder'
    ],
    importantConditions: [
      'Mandatory 5-year lock-in period: No withdrawals permitted during the first 5 policy years',
      'Sum assured is typically only 10x the annual investment, leaving a significant protection gap for young families',
      'Subject to Budget 2021 tax rules: If annual ULIP premium exceeds ₹2.5 Lakhs, maturity proceeds are subject to capital gains tax'
    ],
    officialUrl: 'https://www.hdfclife.com',
    isUlipOrMarketLinked: true,
    isEndowmentOrSavings: false,
    investmentVsInsuranceNotice: 'MARKET RISK DISCLOSURE: ULIPs are market-linked instruments. Returns are not guaranteed and fluctuate based on stock market conditions. Do not rely on a ULIP as your primary life insurance shield because the death benefit (10x premium) is far below family needs.',
    isDemoSample: false
  },
  {
    id: 'scheme-icici-pru-signature',
    insurer: 'ICICI Prudential Life Insurance Co. Ltd.',
    name: 'ICICI Pru Signature',
    category: 'ulip',
    categoryLabel: 'Unit-Linked Insurance Plan (ULIP)',
    policyPurpose: 'Unit-linked wealth creation plan with return of mortality charges, whole life option, and diverse equity fund choices.',
    entryAgeMin: 0,
    entryAgeMax: 60,
    maxMaturityAge: 75,
    premiumPaymentTerms: 'Limited Pay (5/7/10 yrs) or Regular Pay',
    policyTerm: '10 to 30 years or Whole Life to age 99',
    sumAssuredMin: 300000,
    sumAssuredText: '10x annual premium',
    indicativeAnnualCost: '₹60,000 – ₹10,00,000 / year (Investment amount)',
    keyBenefits: [
      'Return of mortality and policy administration charges at policy maturity',
      'Wealth Boosters and Systematic Loyalty Additions added to unit balance every 5 years',
      'Choice of 16 funds ranging from Multi-Cap Equity to Pure Liquid Debt',
      'Free systematic withdrawal plan (SWP) for tax-efficient cash flow after 5 years'
    ],
    majorExclusions: [
      'Suicide clause in first 12 months (fund value paid)',
      'Equity market downside risk borne exclusively by the policyholder'
    ],
    importantConditions: [
      '5-year statutory lock-in period applies under IRDAI regulations',
      'Fund management charges (FMC) of up to 1.35% p.a. apply',
      'Not a substitute for high-cover pure term insurance'
    ],
    officialUrl: 'https://www.iciciprulife.com',
    isUlipOrMarketLinked: true,
    isEndowmentOrSavings: false,
    investmentVsInsuranceNotice: 'ULIP investments are subject to market risks. The investment risk in investment portfolio is borne by the policyholder. Pure term insurance is mathematically superior for family protection.',
    isDemoSample: false
  }
];

export const SCHEME_CATEGORIES = [
  { id: 'all', label: 'All Schemes', count: 8 },
  { id: 'term', label: 'Pure Term Insurance', count: 4, badge: 'Highest Protection' },
  { id: 'endowment', label: 'Savings & Endowment', count: 2, badge: 'Guaranteed' },
  { id: 'whole_life', label: 'Whole Life Plans', count: 1, badge: 'Lifetime Cashflow' },
  { id: 'ulip', label: 'ULIP (Market-Linked)', count: 2, badge: 'Market Linked' }
] as const;
