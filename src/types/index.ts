// Core TypeScript Type Definitions for LifeMap (Team AspireX)

export type Language = 'en' | 'te' | 'hi';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferredLanguage: Language;
  age?: number;
  employmentType?: 'salaried' | 'self_employed' | 'business' | 'freelancer' | 'homemaker' | 'student';
  maritalStatus?: 'single' | 'married' | 'other';
  dependantsCount?: number;
  isDemoUser?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type GoalCategory = 
  | 'parents' 
  | 'spouse' 
  | 'children_support' 
  | 'education' 
  | 'home'
  | 'home_loan' 
  | 'other_loan' 
  | 'household_living' 
  | 'family_independence' 
  | 'retirement'
  | 'wealth'
  | 'emergency'
  | 'vehicle'
  | 'custom';

export type GoalPriority = 'essential' | 'high' | 'medium' | 'flexible';

export interface LifeGoal {
  id: string;
  userId: string;
  category: GoalCategory;
  title: string;
  description: string;
  priority: GoalPriority;
  targetAmount: number;
  targetYears: number; // in how many years
  isCustom?: boolean;
  createdAt: string;
}

export interface FinancialAssessmentInputs {
  // Step A: Personal Situation
  age: number;
  employmentType: 'salaried' | 'self_employed' | 'business' | 'freelancer' | 'homemaker' | 'student';
  maritalStatus: 'single' | 'married' | 'other';
  dependantsCount: number;
  supportDurationYears: number; // how many years dependants need support

  // Step B: Income & Expenses
  monthlyIncome: number;
  monthlyExpenses: number;
  annualExpenseInflationRate: number; // default e.g. 6% (0.06)

  // Step C: Liabilities & Commitments
  outstandingHomeLoan: number;
  outstandingOtherLoans: number;
  futureEducationCommitments: number;
  otherMajorObligations: number;

  // Step D: Available Assets & Current Protection
  liquidSavingsAndInvestments: number; // emergency funds/stocks eligible for family protection
  existingIndividualTermInsurance: number; // individual sum assured
  existingEmployerTermInsurance: number; // corporate group insurance
  existingOtherPoliciesSumAssured: number; // traditional endowment/ULIP life cover if known
}

export type CalculationMode = 'present_value' | 'simplified';

export interface CalculationAssumptions {
  inflationRate: number; // e.g. 0.06
  discountRate: number; // e.g. 0.075 (for present value calculation)
  supportDurationYears: number;
  calculationMode: CalculationMode;
  notes: string[];
}

export interface CalculationBreakdownItem {
  id: string;
  label: string;
  amount: number;
  type: 'addition' | 'subtraction';
  category: 'expenses' | 'loans' | 'commitments' | 'assets' | 'existing_insurance';
  description: string;
  assumptions?: string;
}

export interface InsuranceNeedsResult {
  version: string;
  calculationMode: CalculationMode;
  timestamp: string;
  
  // High-level outputs
  totalProtectionNeed: number; // Net recommended life protection requirement
  grossResponsibilities: number; // Total future needs + debts + commitments
  existingTotalCoverage: number; // Combined individual + employer + other insurance
  existingIndividualCoverage: number;
  existingEmployerCoverage: number;
  eligibleAssetsConsidered: number;
  
  // Gap analysis
  coverageGap: number; // Shortfall if positive; 0 or negative indicates covered under assumptions
  coverageStatus: 'critical_shortfall' | 'moderate_shortfall' | 'adequately_covered' | 'surplus_coverage';
  
  // Component breakdown
  futureFamilySupportTotal: number;
  outstandingLiabilitiesTotal: number;
  futureCommitmentsTotal: number;
  
  breakdown: CalculationBreakdownItem[];
  assumptions: CalculationAssumptions;
  primaryDrivers: string[];
  disclaimer: string;
}

export interface ScenarioSimulation {
  id: string;
  userId: string;
  name: string;
  description: string;
  presetKey?: string;
  scenarioInputs: FinancialAssessmentInputs;
  baselineResult: InsuranceNeedsResult;
  scenarioResult: InsuranceNeedsResult;
  differenceAmount: number; // scenarioGap - baselineGap
  percentageChange: number;
  keyDrivers: string[];
  createdAt: string;
}

export interface GameMetadata {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  learningObjective: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  iconName: string;
  badgeName: string;
  badgeRewardPoints: number;
  category: 'Risk Awareness' | 'Policy Comparison' | 'Inflation & Time Horizon';
  isAvailable: boolean; // placeholder / configured state
  previewConcept: {
    storyline: string;
    keyTakeaway: string;
    sampleQuestions: { prompt: string; options: string[]; answerIndex: number; explanation: string }[];
  };
}

export interface UserLearningProgress {
  userId: string;
  gameId: string;
  attempts: number;
  completed: boolean;
  highScore: number;
  badgesEarned: string[];
  lastPlayedAt?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  language: Language;
  timestamp: string;
  suggestedPrompts?: string[];
  contextUsed?: {
    totalNeed?: number;
    coverageGap?: number;
    dependantsCount?: number;
  };
}

export interface InsuranceProductEducationalItem {
  id: string;
  categoryName: string;
  name: string;
  providerType: string; // e.g. "Public Sector / Private Life Insurers"
  description: string;
  typicalTermYears: string;
  coverageRange: string;
  pricingStructure: string;
  keyBenefits: string[];
  majorExclusions: string[];
  eligibilityConditions: string[];
  bestSuitedFor: string;
  sourceOfInfo: string;
  lastVerifiedDate: string;
  sampleIllustrativePremiumRange: string;
}

// -------------------------------------------------------------
// User-Scoped Backend & Mindset Assessment Types
// -------------------------------------------------------------

export interface MindsetQuestionOption {
  text: string;
  points: number; // e.g. 1 to 4
  insight: string;
}

export interface MindsetQuestion {
  id: string;
  prompt: string;
  category: 'risk_awareness' | 'debt_management' | 'family_protection' | 'inflation_horizon' | 'policy_literacy';
  options: MindsetQuestionOption[];
}

export interface AssessmentSession {
  id: string;
  userId: string;
  assessmentType: 'financial_mindset';
  status: 'in_progress' | 'completed' | 'abandoned';
  questionIds: string[];
  currentQuestionIndex: number;
  score?: number;
  mindsetCategory?: 'Prudent Protector' | 'Disciplined Builder' | 'Aggressive Accumulator' | 'Vulnerable Starter';
  summary?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentAnswer {
  id: string;
  sessionId: string;
  userId: string;
  questionId: string;
  selectedOptionIndex: number;
  pointsEarned: number;
  answeredAt: string;
}

export interface ChatConversation {
  id: string;
  userId: string;
  title: string;
  language: Language;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageRecord {
  id: string;
  conversationId: string;
  userId: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface GrowthScenarioRecord {
  id: string;
  userId: string;
  scenarioName: string;
  description?: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
  differenceAmount: number;
  createdAt: string;
}

export type SchemeCategory = 'term' | 'endowment' | 'whole_life' | 'ulip';

export interface InsuranceScheme {
  id: string;
  insurer: string;
  name: string;
  category: SchemeCategory;
  categoryLabel: string;
  policyPurpose: string;
  entryAgeMin: number;
  entryAgeMax: number;
  maxMaturityAge: number;
  premiumPaymentTerms: string;
  policyTerm: string;
  sumAssuredMin: number;
  sumAssuredMax?: number;
  sumAssuredText: string;
  indicativeAnnualCost: string;
  keyBenefits: string[];
  majorExclusions: string[];
  importantConditions: string[];
  officialUrl: string;
  isUlipOrMarketLinked: boolean;
  isEndowmentOrSavings: boolean;
  investmentVsInsuranceNotice: string;
  isDemoSample: boolean;
}

export interface GrowthTrajectoryPoint {
  year: number;
  investedPrincipal: number;
  conservativeNominal: number;
  conservativeReal: number;
  moderateNominal: number;
  moderateReal: number;
  aggressiveNominal: number;
  aggressiveReal: number;
  protectionNeed: number;
}

export interface GrowthProjectionResult {
  inputs: {
    initialSavings: number;
    monthlyContribution: number;
    annualInflation: number;
    conservativeRate: number;
    moderateRate: number;
    aggressiveRate: number;
  };
  tenYear: {
    investedPrincipal: number;
    conservative: { nominal: number; real: number; earnings: number };
    moderate: { nominal: number; real: number; earnings: number };
    aggressive: { nominal: number; real: number; earnings: number };
    protectionNeed: number;
  };
  twentyYear: {
    investedPrincipal: number;
    conservative: { nominal: number; real: number; earnings: number };
    moderate: { nominal: number; real: number; earnings: number };
    aggressive: { nominal: number; real: number; earnings: number };
    protectionNeed: number;
  };
  trajectory: GrowthTrajectoryPoint[];
  assumptions: {
    notes: string[];
    formulaSummary: string;
  };
}

// -------------------------------------------------------------
// DreamLife AI Signature Feature Types (Voice-First & Scenarios)
// -------------------------------------------------------------

export type DreamGoalCategory =
  | 'property'
  | 'vehicle'
  | 'investment'
  | 'business'
  | 'education'
  | 'family'
  | 'retirement'
  | 'travel'
  | 'debt_repayment'
  | 'emergency_fund'
  | 'other';

export type EstimateSourceType =
  | 'user_supplied'
  | 'reliable_benchmark'
  | 'illustrative_assumption'
  | 'unknown_needs_clarification';

export interface DreamLifeGoal {
  id: string;
  category: DreamGoalCategory;
  title: string;
  description: string;
  targetYears: number; // e.g. 5, 10, 20
  currentEstimatedCost: number; // Present day value in INR
  futureInflatedCost: number; // Compounded by inflation: Cost * (1 + inf)^t
  estimateSource: EstimateSourceType;
  priority: 'essential' | 'high' | 'medium' | 'flexible';
  missingInfo?: string;
  isCustom?: boolean;
  allocatedSavings?: number;
  originalTranscriptSnippet?: string;
}

export interface DreamLifeScenarioInputs {
  goals: DreamLifeGoal[];
  monthlyIncome: number;
  monthlyExpenses: number;
  liquidSavings: number;
  inflationRate: number;
  nominalReturnRate?: number; // e.g. 0.10 for 10%
  growthSavingsRateBoostPct?: number; // e.g. +10% higher savings rate
  growthIncomeGrowthRatePct?: number; // e.g. +8% annual salary increase
  priorityPostponeYears?: number; // postpone medium/flexible goals
}

export interface DreamLifeScenarioSummary {
  id: 'current_path' | 'growth_path' | 'priority_path';
  title: string;
  tagline: string;
  monthlySurplus: number;
  targetMonthlyContribution: number;
  shortfallPerMonth: number;
  totalGoalCostNominal: number;
  totalGoalCostFuture: number;
  projectedCorpus10Yr: number;
  projectedCorpus20Yr: number;
  fundedGoalsCount: number;
  totalGoalsCount: number;
  potentialShortfall: number;
  timelineHighlights: string[];
  assumptions: string[];
  fundedGoalIds: string[];
  unfundedGoalIds: string[];
}

export interface BusinessIdeaInputs {
  ideaTitle: string;
  startupCapital: number;
  monthlyOperatingCosts: number;
  monthlyRevenue: number;
  profitMarginPct: number;
}

export interface BusinessIdeaResult {
  ideaTitle: string;
  startupCapital: number;
  monthlyOperatingCosts: number;
  monthlyRevenue: number;
  profitMarginPct: number;
  monthlyGrossProfit: number;
  monthlyNetCashFlow: number;
  breakEvenMonths: number | null;
  cashFlowRunwayRecommended: number;
  isCashFlowPositive: boolean;
  scenarios: {
    conservative: { revenue: number; netCashFlow: number; breakEvenMonths: number | null };
    base: { revenue: number; netCashFlow: number; breakEvenMonths: number | null };
    optimistic: { revenue: number; netCashFlow: number; breakEvenMonths: number | null };
  };
  risksAndMitigations: string[];
  disclaimer: string;
}

export interface PersonalizedEducationalResource {
  id: string;
  title: string;
  authorOrSource: string;
  type: 'book' | 'biography' | 'educational_guide';
  theme: 'budgeting' | 'wealth_goals' | 'entrepreneurship' | 'investing' | 'behavioral_finance';
  description: string;
  verifiedSourceUrl: string;
  keyLesson: string;
  planningTradeoff: string;
  targetAudience: string;
}


