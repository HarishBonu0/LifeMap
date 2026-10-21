import { MindsetQuestion } from '../types';

export const MINDSET_QUESTION_POOL: MindsetQuestion[] = [
  {
    id: 'mq-01',
    prompt: 'When deciding on life insurance, what is your primary expectation?',
    category: 'policy_literacy',
    options: [
      { text: 'I want pure financial protection for my family, regardless of whether I get money back.', points: 4, insight: 'Understands pure risk transfer.' },
      { text: 'I prefer getting my premiums back if nothing happens to me.', points: 2, insight: 'Prefers return-of-premium products which cost significantly more.' },
      { text: 'I view insurance primarily as a guaranteed tax-saving investment.', points: 1, insight: 'Susceptible to low-cover endowment traps.' },
      { text: 'I have not thought about it; I rely on whatever agent suggests.', points: 1, insight: 'Needs foundational insurance literacy.' }
    ]
  },
  {
    id: 'mq-02',
    prompt: 'How many months of household living expenses do you currently maintain in liquid emergency savings?',
    category: 'family_protection',
    options: [
      { text: '6 or more months in accessible bank accounts/liquid funds.', points: 4, insight: 'Excellent liquidity buffer.' },
      { text: '3 to 5 months of living expenses.', points: 3, insight: 'Adequate starter emergency fund.' },
      { text: '1 to 2 months of living expenses.', points: 2, insight: 'Vulnerable to short-term disruptions.' },
      { text: 'Less than 1 month; living month-to-month.', points: 1, insight: 'High vulnerability to financial shocks.' }
    ]
  },
  {
    id: 'mq-03',
    prompt: 'If you already have group term life cover through your employer, how do you view it?',
    category: 'family_protection',
    options: [
      { text: 'A temporary perk; I maintain a separate personal individual term plan.', points: 4, insight: 'Aware of corporate cover portability risks.' },
      { text: 'Helpful, but I plan to buy personal cover before changing jobs.', points: 3, insight: 'Recognizes future transition risk.' },
      { text: 'Sufficient as long as I remain employed somewhere.', points: 2, insight: 'At risk if health deteriorates between jobs.' },
      { text: 'Completely adequate; I see no reason to buy personal insurance.', points: 1, insight: 'Unaware that cover lapses on resignation.' }
    ]
  },
  {
    id: 'mq-04',
    prompt: 'When you take a substantial home loan (e.g. ₹40 Lakhs), what step do you consider most essential?',
    category: 'debt_management',
    options: [
      { text: 'Immediately increase term life cover by at least the loan amount.', points: 4, insight: 'Protects surviving dependants from home seizure.' },
      { text: 'Take a reducing cover loan insurance policy bundled by the bank.', points: 3, insight: 'Good but often tied to single lender.' },
      { text: 'Focus solely on aggressive EMI prepayments from salary.', points: 2, insight: 'Prepayment is positive, but leaves temporary gap.' },
      { text: 'Do nothing extra; the property itself is the collateral.', points: 1, insight: 'High risk of family eviction on premature demise.' }
    ]
  },
  {
    id: 'mq-05',
    prompt: 'How do you factor inflation into your family\'s long-term financial milestones?',
    category: 'inflation_horizon',
    options: [
      { text: 'I assume 6-8% annual inflation for living costs and 10% for education.', points: 4, insight: 'Realistic compounding calculation.' },
      { text: 'I know costs will rise and try to save an arbitrary extra buffer.', points: 2, insight: 'Aware but lacks quantitative modeling.' },
      { text: 'I assume ₹25 Lakhs today will have similar purchasing power in 15 years.', points: 1, insight: 'Suffers from money illusion.' },
      { text: 'I do not consider inflation when setting financial targets.', points: 1, insight: 'Severe risk of future purchasing power shortfall.' }
    ]
  },
  {
    id: 'mq-06',
    prompt: 'What proportion of your monthly take-home salary goes toward servicing debt (EMIs)?',
    category: 'debt_management',
    options: [
      { text: 'Under 25% of monthly income.', points: 4, insight: 'Healthy debt-to-income ratio.' },
      { text: '25% to 40% of monthly income.', points: 3, insight: 'Manageable debt load.' },
      { text: '40% to 60% of monthly income.', points: 2, insight: 'Elevated debt stress.' },
      { text: 'More than 60% of monthly income.', points: 1, insight: 'Over-leveraged financial situation.' }
    ]
  },
  {
    id: 'mq-07',
    prompt: 'Between a Pure Term Plan (₹1 Crore cover for ₹12,000/yr) and an Endowment Plan (₹10 Lakh cover for ₹50,000/yr), which do you choose?',
    category: 'policy_literacy',
    options: [
      { text: 'Pure Term: Buy maximum cover cheaply and invest the remaining ₹38,000 elsewhere.', points: 4, insight: 'Understands the separation of protection & investment.' },
      { text: 'Endowment: Because I get my capital back plus guaranteed bonus.', points: 1, insight: 'Sacrifices 90% of cover for sub-inflation returns.' },
      { text: 'A mixture of both to stay balanced.', points: 2, insight: 'Sub-optimal compromise.' },
      { text: 'Whichever plan offers the highest upfront tax deduction under Section 80C.', points: 1, insight: 'Tax-driven rather than need-driven.' }
    ]
  },
  {
    id: 'mq-08',
    prompt: 'In the event of an unexpected income loss, how long can your dependants maintain their current lifestyle?',
    category: 'family_protection',
    options: [
      { text: 'More than 15 years through term insurance and invested assets.', points: 4, insight: 'Comprehensive family safety net.' },
      { text: '5 to 10 years with current assets and partial cover.', points: 3, insight: 'Moderate transitional buffer.' },
      { text: '1 to 2 years before exhausting liquid savings.', points: 2, insight: 'Short-term buffer only.' },
      { text: 'Less than 6 months; dependants would face immediate financial distress.', points: 1, insight: 'Severe protection shortfall.' }
    ]
  },
  {
    id: 'mq-09',
    prompt: 'How frequently do you review your life insurance coverage amounts?',
    category: 'risk_awareness',
    options: [
      { text: 'Annually or whenever a major life event occurs (marriage, child, home loan).', points: 4, insight: 'Proactive financial lifecycle management.' },
      { text: 'Every 3 to 5 years.', points: 3, insight: 'Reasonable periodic checkup.' },
      { text: 'Only when changing jobs or buying a property.', points: 2, insight: 'Event-reactive approach.' },
      { text: 'Never; I bought a policy years ago and haven\'t checked since.', points: 1, insight: 'Stale coverage unadjusted for inflation.' }
    ]
  },
  {
    id: 'mq-10',
    prompt: 'When an insurance salesperson pitches a "Unit Linked Insurance Plan (ULIP)", how do you evaluate it?',
    category: 'policy_literacy',
    options: [
      { text: 'I check mortality charges, fund management charges, and compare with direct mutual funds.', points: 4, insight: 'Thorough fee and structure scrutiny.' },
      { text: 'I consider it only if lock-in and tax exemption suit my specific bracket.', points: 3, insight: 'Balanced tax awareness.' },
      { text: 'I assume bank-recommended ULIPs are safe and high-yielding.', points: 1, insight: 'Blind trust in institutional distribution.' },
      { text: 'I don\'t understand the difference between insurance and mutual funds.', points: 1, insight: 'Needs product mechanism clarity.' }
    ]
  },
  {
    id: 'mq-11',
    prompt: 'How do you view life insurance for a non-earning spouse or homemaker?',
    category: 'family_protection',
    options: [
      { text: 'Essential to cover childcare, household management, and emotional transition costs.', points: 4, insight: 'Recognizes economic value of domestic contribution.' },
      { text: 'Useful for medical riders or joint-life terms, but lower sum assured.', points: 3, insight: 'Moderate appreciation of homemaker value.' },
      { text: 'Unnecessary because they don\'t earn taxable salary.', points: 1, insight: 'Ignores the immense replacement cost of homemaker services.' },
      { text: 'I haven\'t considered it.', points: 2, insight: 'Common oversight in Indian planning.' }
    ]
  },
  {
    id: 'mq-12',
    prompt: 'What is your strategy if market volatility causes your equity investments to drop by 20%?',
    category: 'risk_awareness',
    options: [
      { text: 'Stay invested or increase SIPs because long-term horizon remains intact.', points: 4, insight: 'Disciplined long-term psychology.' },
      { text: 'Pause contributions and wait until market recovers.', points: 2, insight: 'Loss-aversion bias.' },
      { text: 'Panic and redeem everything to fixed deposits.', points: 1, insight: 'High emotional volatility.' },
      { text: 'I don\'t invest in equities; I keep all money in gold and FDs.', points: 2, insight: 'Inflation-vulnerable conservative mindset.' }
    ]
  },
  {
    id: 'mq-13',
    prompt: 'How do you verify whether an insurance claim will be settled smoothly by an insurer?',
    category: 'policy_literacy',
    options: [
      { text: 'I check Claim Settlement Ratio (CSR), Claim Amount Ratio, and disclose all pre-existing health habits.', points: 4, insight: 'Understands IRDAI metrics and utmost good faith.' },
      { text: 'I rely on brand popularity and celebrity endorsements in advertisements.', points: 1, insight: 'Marketing-driven selection.' },
      { text: 'I ask friends or colleagues which insurer they used.', points: 2, insight: 'Anecdotal validation.' },
      { text: 'I don\'t check claim settlement statistics.', points: 1, insight: 'Uninformed consumer.' }
    ]
  },
  {
    id: 'mq-14',
    prompt: 'If you have credit card outstanding balance from month to month, what describes your approach?',
    category: 'debt_management',
    options: [
      { text: 'I never carry a balance; I pay 100% of the total due every billing cycle.', points: 4, insight: 'Prudent credit discipline.' },
      { text: 'Occasionally pay minimum due during emergency months, but clear within 60 days.', points: 2, insight: 'Occasional high-interest trap.' },
      { text: 'Regularly pay only the minimum amount due.', points: 1, insight: 'Caught in 36-45% APR revolving debt trap.' },
      { text: 'I don\'t track billing statements closely.', points: 1, insight: 'Financial neglect.' }
    ]
  },
  {
    id: 'mq-15',
    prompt: 'At what age do you recommend purchasing individual term life insurance?',
    category: 'risk_awareness',
    options: [
      { text: 'In your early 20s/30s when healthy, locking in the lowest lifelong premium.', points: 4, insight: 'Understands age-based mortality curve.' },
      { text: 'Only after having children or purchasing a home.', points: 3, insight: 'Event-triggered, slightly delayed.' },
      { text: 'Around age 45-50 when health problems start appearing.', points: 1, insight: 'Costly mistake; high likelihood of rejection.' },
      { text: 'Right before retirement.', points: 1, insight: 'Severe misunderstanding of term cover purpose.' }
    ]
  },
  {
    id: 'mq-16',
    prompt: 'How do you plan for your children\'s higher education costs in 15 years?',
    category: 'inflation_horizon',
    options: [
      { text: 'Targeted equity/index mutual funds combined with adequate term cover on the earning parent.', points: 4, insight: 'Dual-engine: wealth accumulation + protection backstop.' },
      { text: 'Child endowment policy promising maturity bonus.', points: 2, insight: 'Under-funded due to 4-5% real returns.' },
      { text: 'Rely on taking an education loan when the time comes.', points: 2, insight: 'Shifts debt burden onto the child.' },
      { text: 'Have not started planning for higher education yet.', points: 1, insight: 'Delayed compounding.' }
    ]
  },
  {
    id: 'mq-17',
    prompt: 'What role does Critical Illness or Accidental Disability rider play in your protection plan?',
    category: 'risk_awareness',
    options: [
      { text: 'Essential add-on: disability or illness can destroy earning power while living.', points: 4, insight: 'Understands living benefits.' },
      { text: 'Nice to have if the additional premium is modest.', points: 3, insight: 'Cost-conscious consideration.' },
      { text: 'Unnecessary; standard health insurance covers all hospital expenses.', points: 2, insight: 'Confuses indemnity health insurance with fixed-benefit income replacement.' },
      { text: 'I don\'t know what riders are.', points: 1, insight: 'Needs rider education.' }
    ]
  },
  {
    id: 'mq-18',
    prompt: 'When taking a personal life insurance policy, what is your approach to health disclosures (tobacco, pre-existing conditions)?',
    category: 'policy_literacy',
    options: [
      { text: '100% full disclosure, even if it slightly increases premium, ensuring claim will never be rejected.', points: 4, insight: 'Section 45 IRDAI awareness; ironclad claim validity.' },
      { text: 'Disclose only what medical tests explicitly catch.', points: 2, insight: 'Risks future claim repudiation for fraud.' },
      { text: 'Hide smoking/drinking habits to get a cheaper rate.', points: 1, insight: 'Guarantees claim rejection during investigation.' },
      { text: 'Let the agent fill out the health form without reviewing it.', points: 1, insight: 'Dangerous abdication of personal responsibility.' }
    ]
  },
  {
    id: 'mq-19',
    prompt: 'How do you balance retirement savings against immediate family gratification?',
    category: 'inflation_horizon',
    options: [
      { text: 'Automated monthly retirement investments (NPS/mutual funds) happen before discretionary spending.', points: 4, insight: 'Pays oneself first.' },
      { text: 'I invest whatever is left over at the end of the month.', points: 2, insight: 'Inconsistent savings behavior.' },
      { text: 'I prioritize current lifestyle upgrades; retirement is decades away.', points: 1, insight: 'Present bias.' },
      { text: 'I expect my children to support me during retirement.', points: 1, insight: 'Outdated intergenerational dependency mindset.' }
    ]
  },
  {
    id: 'mq-20',
    prompt: 'What is your perspective on purchasing life insurance online directly versus through a commission-based agent?',
    category: 'policy_literacy',
    options: [
      { text: 'Online direct is 15-25% cheaper, transparent, with no intermediary conflict of interest.', points: 4, insight: 'Cost-effective direct consumer.' },
      { text: 'Agent is fine if they transparently explain pure term vs traditional plans.', points: 3, insight: 'Pragmatic if agent is competent.' },
      { text: 'I only buy from someone who visits my home and promises gifts or cashbacks.', points: 1, insight: 'Susceptible to unethical mis-selling.' },
      { text: 'I find buying insurance online too confusing.', points: 2, insight: 'Needs guided digital assistance.' }
    ]
  },
  {
    id: 'mq-21',
    prompt: 'How do you view term insurance tenure (e.g. cover until age 60/65 vs whole life until age 99)?',
    category: 'policy_literacy',
    options: [
      { text: 'Cover until retirement age (60-65) when dependants are independent and loans are paid.', points: 4, insight: 'Optimal term tenure matching true dependency.' },
      { text: 'Whole life (age 99) because it guarantees an eventual payout to heirs.', points: 2, insight: 'Pays double/triple premium for late-life bequest.' },
      { text: 'Short tenure (10 years) because it is cheapest right now.', points: 2, insight: 'Leaves user uninsured in mid-career.' },
      { text: 'I haven\'t considered policy duration.', points: 1, insight: 'Tenure oversight.' }
    ]
  },
  {
    id: 'mq-22',
    prompt: 'If an unexpected medical expense of ₹3 Lakhs arises tomorrow, how will you fund it?',
    category: 'family_protection',
    options: [
      { text: 'Comprehensive family floater health insurance with emergency fund backup.', points: 4, insight: 'Robust health risk insulation.' },
      { text: 'Liquidate mutual funds or fixed deposits.', points: 3, insight: 'Saves the day, but derails compounding.' },
      { text: 'Borrow from relatives or take an instant personal loan.', points: 1, insight: 'Debt spiral risk.' },
      { text: 'Rely on credit card cash advance.', points: 1, insight: 'Extreme financial distress.' }
    ]
  },
  {
    id: 'mq-23',
    prompt: 'What is your understanding of the "Rule of 72" regarding inflation and purchasing power?',
    category: 'inflation_horizon',
    options: [
      { text: 'At 6% inflation, costs double every 12 years (72 ÷ 6 = 12).', points: 4, insight: 'Sharp mental math on purchasing power decay.' },
      { text: 'I know it relates to how fast money doubles, but not the exact formula.', points: 3, insight: 'General awareness.' },
      { text: 'I haven\'t heard of the Rule of 72.', points: 2, insight: 'Foundational literacy opportunity.' },
      { text: 'I believe prices stay relatively stable in real terms.', points: 1, insight: 'Inflation denial.' }
    ]
  },
  {
    id: 'mq-24',
    prompt: 'How do you evaluate personal loans and Buy Now Pay Later (BNPL) schemes for consumer goods?',
    category: 'debt_management',
    options: [
      { text: 'Avoid consumer debt completely; only purchase depreciating goods with saved cash.', points: 4, insight: 'Strong anti-consumer-debt stance.' },
      { text: 'Use 0% no-cost EMI only if total money is already sitting in savings.', points: 3, insight: 'Controlled cash-flow management.' },
      { text: 'Regularly use BNPL for shopping without tracking aggregate commitments.', points: 1, insight: 'Impulse debt habit.' },
      { text: 'Take personal loans for vacations and celebrations.', points: 1, insight: 'High-cost lifestyle inflation.' }
    ]
  },
  {
    id: 'mq-25',
    prompt: 'When you achieve a salary hike or annual bonus, what is your standard practice?',
    category: 'risk_awareness',
    options: [
      { text: 'Increase SIP contributions and upgrade protection need proportionately.', points: 4, insight: 'Combats lifestyle creep proactively.' },
      { text: 'Spend some, save some without a strict formula.', points: 3, insight: 'Moderate discipline.' },
      { text: 'Upgrade lifestyle expenses immediately to match new income.', points: 1, insight: 'Lifestyle inflation treadmill.' },
      { text: 'Take on a bigger car EMI.', points: 1, insight: 'Increases fixed monthly liabilities.' }
    ]
  }
];
