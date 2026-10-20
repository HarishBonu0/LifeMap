import { GameMetadata } from '../types';

export const CONFIGURABLE_GAMES: GameMetadata[] = [
  {
    id: 'game-pure-term-vs-savings',
    slug: 'term-shield-vs-savings-trap',
    title: 'Term Shield vs. The Savings Trap',
    shortDescription: 'Unmask confusing financial jargon and discover why pure term insurance beats traditional low-cover policies.',
    fullDescription: 'In this interactive scenario, navigate through flashy sales pitches offering "money back" and "guaranteed returns". Discover how inflation and low life coverage in endowment/ULIP policies leave families underprotected compared to pure term insurance.',
    learningObjective: 'Understand why separating protection (Pure Term) from wealth creation (Diversified Investments) maximizes family security.',
    difficulty: 'Beginner',
    estimatedMinutes: 5,
    iconName: 'ShieldCheck',
    badgeName: 'Term Shield Master',
    badgeRewardPoints: 100,
    category: 'Policy Comparison',
    isAvailable: true,
    previewConcept: {
      storyline: 'You have a monthly budget of ₹3,000 for financial planning. A salesperson offers an endowment plan promising return of premium plus bonus, but offering only ₹5 Lakhs sum assured. Meanwhile, a pure term plan offers ₹1 Crore cover for just ₹800/month.',
      keyTakeaway: 'Pure term provides 20x higher coverage for a fraction of the cost, ensuring true family solvency.',
      sampleQuestions: [
        {
          prompt: 'A salesperson offers you an "Endowment Policy" where you pay ₹50,000/year and get ₹5 Lakhs life cover plus "money back". Is this adequate protection for a family with ₹50,000/month expenses?',
          options: [
            'Yes, because you get your money back if nothing happens.',
            'No. ₹5 Lakhs only covers 10 months of expenses. Pure term would provide ₹1 Crore for much less.',
            'Yes, bonuses always beat inflation.',
            'No, life insurance should only be taken after age 50.'
          ],
          answerIndex: 1,
          explanation: 'Correct! ₹5 Lakhs cover is exhausted in under 10 months of living expenses. Pure term provides genuine long-term safety.'
        },
        {
          prompt: 'What happens to your employer-provided life insurance if you switch jobs or take a sabbatical?',
          options: [
            'It stays with you permanently for life.',
            'It automatically transfers to your new company without tests.',
            'It terminates immediately upon leaving the organization.',
            'Your previous company keeps paying the premium.'
          ],
          answerIndex: 2,
          explanation: 'Spot on! Employer cover ends immediately upon leaving. Always own an independent individual term policy.'
        }
      ]
    }
  },
  {
    id: 'game-inflation-time-machine',
    slug: 'inflation-time-machine',
    title: 'The Inflation Time Machine',
    shortDescription: 'Travel 20 years into the future to see why ₹50,000/month today turns into ₹1,60,000/month tomorrow.',
    fullDescription: 'Experience the silent eroding power of 6% annual inflation on household living expenses, college tuition, and healthcare over a 20-year family horizon.',
    learningObjective: 'Learn why static coverage estimates fail if they do not incorporate compounded inflation.',
    difficulty: 'Intermediate',
    estimatedMinutes: 6,
    iconName: 'TrendingUp',
    badgeName: 'Inflation Navigator',
    badgeRewardPoints: 120,
    category: 'Inflation & Time Horizon',
    isAvailable: true,
    previewConcept: {
      storyline: 'Set your current household grocery and utility budget and fast-forward 10 and 20 years with historical Indian inflation.',
      keyTakeaway: 'At 6% inflation, living costs double every ~12 years (Rule of 72). Protection must factor this future reality.',
      sampleQuestions: [
        {
          prompt: 'At an average annual inflation rate of 6%, in approximately how many years will your household living expenses double?',
          options: [
            '5 years',
            '12 years (Rule of 72: 72 / 6 = 12)',
            '25 years',
            'Inflation does not affect household expenses'
          ],
          answerIndex: 1,
          explanation: 'Using the Rule of 72: 72 / 6% = 12 years. If your family spends ₹50k today, they will need ₹1 Lakh/month in 12 years!'
        },
        {
          prompt: 'If college education costs ₹25 Lakhs today, what will it roughly cost in 15 years at 8% education inflation?',
          options: [
            '₹25 Lakhs (fees remain fixed)',
            '₹35 Lakhs',
            'Around ₹79 Lakhs due to compounding',
            '₹10 Lakhs'
          ],
          answerIndex: 2,
          explanation: 'Education inflation in India often runs at 8-10%, tripling college costs in 15 years. Life protection must cover this milestone.'
        }
      ]
    }
  },
  {
    id: 'game-risk-voyager',
    slug: 'risk-voyager',
    title: 'Risk Voyager: Protect the Clan',
    shortDescription: 'Identify hidden family vulnerabilities, debt cascades, and critical dependents before disaster strikes.',
    fullDescription: 'Step into the shoes of a family risk architect. Allocate safety shields across home loans, aging parents, and minor children to achieve 100% financial resilience.',
    learningObjective: 'Recognize the 4 core pillars of protection: living maintenance, debt clearance, milestone funding, and emergency liquidity.',
    difficulty: 'Advanced',
    estimatedMinutes: 7,
    iconName: 'HeartHandshake',
    badgeName: 'Clan Guardian',
    badgeRewardPoints: 150,
    category: 'Risk Awareness',
    isAvailable: true,
    previewConcept: {
      storyline: 'You are presented with a family of four with a ₹45 Lakh home loan and two dependent parents. A sudden income disruption occurs. What happens without life insurance?',
      keyTakeaway: 'Home loan debt can force bank recovery unless covered by dedicated debt-protection insurance.',
      sampleQuestions: [
        {
          prompt: 'If a breadwinner with a ₹40 Lakh home loan passes away without insurance, what happens to the family home?',
          options: [
            'The bank automatically waives the entire loan out of goodwill.',
            'The surviving family must pay the remaining EMIs or the bank will auction the property.',
            'The government pays off the home loan.',
            'The home is converted into a rental property automatically.'
          ],
          answerIndex: 1,
          explanation: 'Banks have legal mortgage liens. Without term insurance or loan cover, surviving family members face eviction or forced distress sales.'
        },
        {
          prompt: 'Which asset should NEVER be counted towards family emergency survival funds in your assessment?',
          options: [
            'Liquid mutual funds',
            'Fixed deposit in a bank',
            'The primary residence where your family currently lives',
            'Savings bank balance'
          ],
          answerIndex: 2,
          explanation: 'The primary residence provides shelter and security. Counting it would assume your surviving family sells their roof to eat.'
        }
      ]
    }
  }
];
