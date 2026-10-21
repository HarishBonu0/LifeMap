import { PersonalizedEducationalResource } from '../types';

export const VERIFIED_EDUCATIONAL_RESOURCES: PersonalizedEducationalResource[] = [
  // 1. Budgeting & Saving
  {
    id: 'res-lets-talk-money',
    title: "Let's Talk Money: You've Worked Hard for It, Now Make It Work for You",
    authorOrSource: 'Monika Halan (Consulting Editor, Mint; Leading Indian Personal Finance Expert)',
    type: 'book',
    theme: 'budgeting',
    description: 'A structured, practical Indian personal finance system organizing money into separate cash-flow boxes for living, emergency reserves, pure protection, and long-term wealth.',
    verifiedSourceUrl: 'https://www.harpercollins.co.in/product/lets-talk-money/',
    keyLesson: 'Never combine insurance with investment. Secure family living risk with pure term cover before placing a single rupee in market accumulation.',
    planningTradeoff: 'Requires strict discipline to separate monthly surplus rather than letting unspent cash sit idle in low-yield savings accounts.',
    targetAudience: 'Indian salaried professionals and families looking for a holistic, commission-free financial foundation.'
  },
  // 2. Behavioral Finance & Habits
  {
    id: 'res-psychology-of-money',
    title: 'The Psychology of Money: Timeless Lessons on Wealth, Greed, and Happiness',
    authorOrSource: 'Morgan Housel (Former Wall Street Journal Columnist, Partner at Collaborative Fund)',
    type: 'book',
    theme: 'behavioral_finance',
    description: 'Explores how personal beliefs, ego, patience, and emotions drive financial decisions far more than mathematical spreadsheets or economic theories.',
    verifiedSourceUrl: 'https://www.morganhousel.com/',
    keyLesson: 'Doing well with money has a little to do with how smart you are and a lot to do with how you behave. Staying wealthy requires endurance and avoiding catastrophic ruin.',
    planningTradeoff: 'True financial peace often means choosing reasonable, emotionally sustainable choices over theoretically optimal spreadsheet returns.',
    targetAudience: 'Anyone struggling to maintain long-term SIP consistency during market volatility or life transitions.'
  },
  // 3. Investing Fundamentals & Compounding
  {
    id: 'res-coffee-can-investing',
    title: 'Coffee Can Investing: The Low Risk Road to Stupendous Wealth',
    authorOrSource: 'Saurabh Mukherjea, Rakshit Ranjan, and Pranab Uniyal (Marcellus Investment Managers)',
    type: 'book',
    theme: 'investing',
    description: 'An empirical examination of long-term wealth creation in India through high-quality companies with clean accounting and sustainable return on capital.',
    verifiedSourceUrl: 'https://marcellus.in/books/',
    keyLesson: 'Compounding over 10 to 20 years requires low portfolio churn, patience, and resisting the urge to constantly trade based on short-term market noise.',
    planningTradeoff: 'High-quality compounding requires holding through multi-year market plateaus without panic-selling.',
    targetAudience: 'Investors aiming to fund 10- and 20-year family goals like higher education and retirement.'
  },
  // 4. Entrepreneurship & Lean Business
  {
    id: 'res-the-lean-startup',
    title: 'The Lean Startup: How Constant Innovation Creates Radically Successful Businesses',
    authorOrSource: 'Eric Ries',
    type: 'book',
    theme: 'entrepreneurship',
    description: 'A disciplined framework for testing business assumptions, validating customer demand with a Minimum Viable Product (MVP), and pivoting before burning cash.',
    verifiedSourceUrl: 'http://theleanstartup.com/',
    keyLesson: 'Revenue and customer willingness to pay are the only true validations. Keep fixed operating overhead minimal until unit economics are proven.',
    planningTradeoff: 'Early entrepreneurial testing requires operating under high uncertainty and prioritizing speed of learning over immediate profitability.',
    targetAudience: 'Users evaluating a new business venture or startup capital allocation.'
  },
  // 5. Verified Real-Life Story: Bootstrapped Capital Efficiency
  {
    id: 'story-sridhar-vembu-zoho',
    title: 'Sridhar Vembu & Zoho: The Principles of Bootstrapped Capital Stewardship',
    authorOrSource: 'Documented Case Study & Forbes India Profile (Sridhar Vembu, Founder of Zoho)',
    type: 'biography',
    theme: 'entrepreneurship',
    description: 'The journey of building a multi-billion-dollar global enterprise from Chennai and Tenkasi without taking external venture debt or risking insolvency.',
    verifiedSourceUrl: 'https://www.forbesindia.com/article/bootstrapped-special/how-sridhar-vembu-built-zoho/63445/1',
    keyLesson: 'Reinvesting verified operational cash flow rather than burning borrowed funds creates enduring resilience against macroeconomic downturns.',
    planningTradeoff: 'Organic growth takes longer than venture-fueled expansion but retains full ownership and operational control.',
    targetAudience: 'Entrepreneurs exploring capital allocation and sustainable business operations.'
  },
  // 6. Long-Term Goal Setting
  {
    id: 'res-your-money-or-your-life',
    title: 'Your Money or Your Life: 9 Steps to Transforming Your Relationship with Money',
    authorOrSource: 'Vicki Robin and Joe Dominguez',
    type: 'book',
    theme: 'wealth_goals',
    description: 'A classic guide to aligning life energy, daily hours worked, and long-term personal goals with financial independence.',
    verifiedSourceUrl: 'https://yourmoneyoryourlife.com/',
    keyLesson: 'Money is something you trade your life energy for. Conscious spending on what genuinely matters enables faster achievement of major life goals.',
    planningTradeoff: 'Requires redefining personal status symbols and cutting unfulfilling social consumption.',
    targetAudience: 'Individuals planning 10- and 20-year life freedom and family independence.'
  }
];

export function getRecommendedResourcesForGoals(
  categories: string[]
): PersonalizedEducationalResource[] {
  const hasBusiness = categories.includes('business');
  const hasInvestments = categories.includes('investment') || categories.includes('retirement');
  const hasProperty = categories.includes('property') || categories.includes('debt_repayment');

  const picked: PersonalizedEducationalResource[] = [];

  // Core recommendation for everyone
  picked.push(VERIFIED_EDUCATIONAL_RESOURCES[0]); // Monika Halan
  picked.push(VERIFIED_EDUCATIONAL_RESOURCES[1]); // Morgan Housel

  if (hasBusiness) {
    picked.push(VERIFIED_EDUCATIONAL_RESOURCES[3]); // Lean Startup
    picked.push(VERIFIED_EDUCATIONAL_RESOURCES[4]); // Zoho Story
  } else if (hasInvestments) {
    picked.push(VERIFIED_EDUCATIONAL_RESOURCES[2]); // Coffee Can Investing
    picked.push(VERIFIED_EDUCATIONAL_RESOURCES[5]); // Your Money or Your Life
  } else {
    picked.push(VERIFIED_EDUCATIONAL_RESOURCES[2]);
  }

  return picked.slice(0, 4);
}
