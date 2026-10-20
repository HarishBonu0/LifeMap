import { InsuranceProductEducationalItem } from '../types';

export const VERIFIED_EDUCATIONAL_PRODUCTS: InsuranceProductEducationalItem[] = [
  {
    id: 'prod-pure-term',
    categoryName: 'Pure Term Life Insurance',
    name: 'Pure Protection Term Plan',
    providerType: 'Life Insurance Providers (Regulated by IRDAI)',
    description: 'Provides pure financial compensation (sum assured) to nominees upon death of the insured during the policy term. No maturity value if the insured survives.',
    typicalTermYears: '10 to 40 years (typically up to age 65–75)',
    coverageRange: '₹50 Lakhs to ₹5+ Crores',
    pricingStructure: 'Lowest cost per rupee of life cover (e.g. ~₹8,000–₹16,000/year for ₹1 Cr cover for a healthy 30-year-old non-smoker).',
    keyBenefits: [
      'High sum assured at affordable annual premiums',
      'Option to add critical illness and accidental disability riders',
      'Income tax deductions under Section 80C and tax-free payout under Section 10(10D)',
      'Locks in low premiums for the entire multi-decade duration'
    ],
    majorExclusions: [
      'Suicide within the first 12 months from policy inception',
      'Fraud or deliberate non-disclosure of pre-existing medical conditions or smoking habits',
      'Death resulting from participation in hazardous sports or illegal activities without rider'
    ],
    eligibilityConditions: [
      'Minimum age: 18 years; Maximum entry age: typically 65 years',
      'Requires income verification (salary slips / ITR) and medical screening for high coverage'
    ],
    bestSuitedFor: 'Anyone with financially dependent family members, outstanding home loans, or future children education milestones.',
    sourceOfInfo: 'IRDAI Consumer Protection Guidelines & Life Insurance Council Benchmarks',
    lastVerifiedDate: '2026-01-15',
    sampleIllustrativePremiumRange: '₹700 – ₹1,400 / month for ₹1 Cr (indicative for 28–35 age band)'
  },
  {
    id: 'prod-employer-group-term',
    categoryName: 'Group Term Life Insurance (GTL)',
    name: 'Corporate Employer Group Cover',
    providerType: 'Employer Sponsored Policy via Life Insurers',
    description: 'Life insurance cover provided by corporate organizations as an employee benefit for active employees during their tenure.',
    typicalTermYears: 'Annual renewable (valid only while actively employed)',
    coverageRange: 'Typically 1x to 3x annual CTC (e.g. ₹15 Lakhs to ₹50 Lakhs)',
    pricingStructure: 'Subsidized or fully paid by employer as a corporate fringe benefit.',
    keyBenefits: [
      'Usually no individual medical test required up to Free Cover Limit',
      'Immediate coverage from day one of employment',
      'Zero or minimal direct cost to the employee'
    ],
    majorExclusions: [
      'Coverage terminates on the last working day of employment or retirement',
      'Cannot be customized for personal loan liabilities or 20-year family horizons',
      'Employer can alter or cancel the policy benefits at renewal'
    ],
    eligibilityConditions: [
      'Active full-time employment status in the sponsoring company'
    ],
    bestSuitedFor: 'Supplementary safety net, but should NEVER be relied upon as the sole family protection shield.',
    sourceOfInfo: 'IRDAI Group Insurance Guidelines & Corporate HR Standard Practices',
    lastVerifiedDate: '2026-01-15',
    sampleIllustrativePremiumRange: 'Paid by employer (Not portable after exit)'
  },
  {
    id: 'prod-trop',
    categoryName: 'Term with Return of Premium (TROP)',
    name: 'Return of Premium Term Plan',
    providerType: 'Life Insurance Providers (Regulated by IRDAI)',
    description: 'A term plan variation where the insurer refunds the total base premiums paid if the policyholder survives the full tenure.',
    typicalTermYears: '15 to 35 years',
    coverageRange: '₹25 Lakhs to ₹2 Crores',
    pricingStructure: '2x to 3.5x more expensive than pure term insurance for the exact same coverage.',
    keyBenefits: [
      'Nominees receive the full sum assured if death occurs during term',
      'Total base premiums returned upon surviving the term'
    ],
    majorExclusions: [
      'Taxes (GST) and rider premiums are non-refundable upon maturity',
      'High opportunity cost: refunded amount does not earn interest and loses purchasing power to inflation over 30 years'
    ],
    eligibilityConditions: [
      'Minimum age 18; steady documented income'
    ],
    bestSuitedFor: 'Individuals with psychological resistance to "losing premium money", though mathematically inferior to Pure Term + Mutual Fund SIP.',
    sourceOfInfo: 'IRDAI Master Circular on Life Insurance Products',
    lastVerifiedDate: '2026-01-15',
    sampleIllustrativePremiumRange: '₹2,200 – ₹4,000 / month for ₹1 Cr'
  },
  {
    id: 'prod-endowment',
    categoryName: 'Traditional Endowment / Money-Back',
    name: 'Traditional Savings-cum-Protection Plan',
    providerType: 'Life Insurance Providers (Public & Private)',
    description: 'Combines small life insurance cover with a conservative savings element, returning guaranteed bonuses or money back at periodic intervals.',
    typicalTermYears: '10 to 25 years',
    coverageRange: 'Typically modest (₹2 Lakhs to ₹20 Lakhs)',
    pricingStructure: 'Very high premiums for low coverage (e.g. ₹50,000/yr for just ₹5-10L cover).',
    keyBenefits: [
      'Disciplined forced savings for risk-averse individuals',
      'Guaranteed additions or periodic liquidity payouts'
    ],
    majorExclusions: [
      'Severe underinsurance: ₹5-10L coverage is critically inadequate for supporting a family after a tragedy',
      'Historical internal rate of return (IRR) is typically 4.5%–5.5%, often lagging inflation'
    ],
    eligibilityConditions: [
      'Minimum age 0 (for child plans) to 60'
    ],
    bestSuitedFor: 'Conservative investors seeking sovereign or guaranteed payouts who already have adequate pure term coverage.',
    sourceOfInfo: 'IRDAI Annual Reports & Life Insurance Industry Disclosures',
    lastVerifiedDate: '2026-01-15',
    sampleIllustrativePremiumRange: '₹40,000 – ₹1,00,000 / year for ₹10 Lakh cover'
  }
];
