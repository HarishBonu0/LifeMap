import { FinancialAssessmentInputs, LifeGoal, UserProfile } from '../types';

export interface DemoProfilePackage {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  profile: UserProfile;
  inputs: FinancialAssessmentInputs;
  goals: LifeGoal[];
}

export const DEMO_PROFILES: DemoProfilePackage[] = [
  {
    id: 'demo-priya-amit',
    name: 'Priya & Amit Verma',
    badge: 'Young Family with Child',
    tagline: 'Age 34 • Married with 5-year-old child • Active Home Loan',
    profile: {
      id: 'demo-priya-amit',
      name: 'Priya & Amit Verma',
      email: 'amit.verma@example.com',
      preferredLanguage: 'en',
      age: 34,
      employmentType: 'salaried',
      maritalStatus: 'married',
      dependantsCount: 2,
      isDemoUser: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    inputs: {
      age: 34,
      employmentType: 'salaried',
      maritalStatus: 'married',
      dependantsCount: 2,
      supportDurationYears: 20,
      monthlyIncome: 165000,
      monthlyExpenses: 65000,
      annualExpenseInflationRate: 0.06,
      outstandingHomeLoan: 4200000,
      outstandingOtherLoans: 0,
      futureEducationCommitments: 2500000,
      otherMajorObligations: 500000,
      liquidSavingsAndInvestments: 1200000,
      existingIndividualTermInsurance: 5000000,
      existingEmployerTermInsurance: 2500000,
      existingOtherPoliciesSumAssured: 500000,
    },
    goals: [
      {
        id: 'g-1',
        userId: 'demo-priya-amit',
        category: 'home_loan',
        title: 'Home Loan Protection Shield',
        description: 'Ensure surviving family retains our 3BHK flat without forced sale by bank.',
        priority: 'essential',
        targetAmount: 4200000,
        targetYears: 15,
        createdAt: new Date().toISOString()
      },
      {
        id: 'g-2',
        userId: 'demo-priya-amit',
        category: 'education',
        title: 'Aarav Higher Education Corpus',
        description: 'Undergraduate engineering or medical degree milestone funding at age 18.',
        priority: 'essential',
        targetAmount: 2500000,
        targetYears: 13,
        createdAt: new Date().toISOString()
      },
      {
        id: 'g-3',
        userId: 'demo-priya-amit',
        category: 'household_living',
        title: 'Family Living Expense Continuity',
        description: 'Maintain grocery, utilities, and schooling standard of living for 20 years.',
        priority: 'essential',
        targetAmount: 9500000,
        targetYears: 20,
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'demo-rohan',
    name: 'Rohan Sharma',
    badge: 'Young Tech Professional',
    tagline: 'Age 27 • Single • Supporting Elderly Mother',
    profile: {
      id: 'demo-rohan',
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      preferredLanguage: 'en',
      age: 27,
      employmentType: 'salaried',
      maritalStatus: 'single',
      dependantsCount: 1,
      isDemoUser: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    inputs: {
      age: 27,
      employmentType: 'salaried',
      maritalStatus: 'single',
      dependantsCount: 1,
      supportDurationYears: 18,
      monthlyIncome: 95000,
      monthlyExpenses: 32000,
      annualExpenseInflationRate: 0.06,
      outstandingHomeLoan: 0,
      outstandingOtherLoans: 250000,
      futureEducationCommitments: 0,
      otherMajorObligations: 600000, // mother healthcare contingency
      liquidSavingsAndInvestments: 650000,
      existingIndividualTermInsurance: 0,
      existingEmployerTermInsurance: 2000000, // 100% employer dependent
      existingOtherPoliciesSumAssured: 0,
    },
    goals: [
      {
        id: 'g-rohan-1',
        userId: 'demo-rohan',
        category: 'parents',
        title: 'Mother Healthcare & Living Security',
        description: 'Provide guaranteed monthly care and healthcare corpus for widowed mother.',
        priority: 'essential',
        targetAmount: 5000000,
        targetYears: 18,
        createdAt: new Date().toISOString()
      },
      {
        id: 'g-rohan-2',
        userId: 'demo-rohan',
        category: 'other_loan',
        title: 'Car Loan Settlement',
        description: 'Clear vehicle loan balance to avoid debt liability on mother.',
        priority: 'medium',
        targetAmount: 250000,
        targetYears: 2,
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'demo-suresh',
    name: 'Suresh Kumar',
    badge: 'Senior Manager with Dual Generations',
    tagline: 'Age 44 • Married • 2 School-Age Children + Elderly Parents',
    profile: {
      id: 'demo-suresh',
      name: 'Suresh Kumar',
      email: 'suresh.kumar@example.com',
      preferredLanguage: 'hi',
      age: 44,
      employmentType: 'salaried',
      maritalStatus: 'married',
      dependantsCount: 4,
      isDemoUser: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    inputs: {
      age: 44,
      employmentType: 'salaried',
      maritalStatus: 'married',
      dependantsCount: 4,
      supportDurationYears: 16,
      monthlyIncome: 240000,
      monthlyExpenses: 110000,
      annualExpenseInflationRate: 0.065,
      outstandingHomeLoan: 2800000,
      outstandingOtherLoans: 400000,
      futureEducationCommitments: 4000000,
      otherMajorObligations: 1000000,
      liquidSavingsAndInvestments: 3200000,
      existingIndividualTermInsurance: 10000000,
      existingEmployerTermInsurance: 5000000,
      existingOtherPoliciesSumAssured: 1500000,
    },
    goals: [
      {
        id: 'g-suresh-1',
        userId: 'demo-suresh',
        category: 'education',
        title: 'Two Children College Fund',
        description: 'Dual university degrees across next 7 and 10 years.',
        priority: 'essential',
        targetAmount: 4000000,
        targetYears: 8,
        createdAt: new Date().toISOString()
      },
      {
        id: 'g-suresh-2',
        userId: 'demo-suresh',
        category: 'parents',
        title: 'Elderly Parents Long-term Care Fund',
        description: 'Dedicated geriatric medical emergencies and monthly care allowance.',
        priority: 'essential',
        targetAmount: 2000000,
        targetYears: 12,
        createdAt: new Date().toISOString()
      }
    ]
  }
];
