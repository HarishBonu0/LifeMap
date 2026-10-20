import { 
  UserProfile, 
  LifeGoal, 
  FinancialAssessmentInputs, 
  ScenarioSimulation, 
  UserLearningProgress, 
  ChatMessage,
  InsuranceNeedsResult 
} from '../types';
import { DEMO_PROFILES, DemoProfilePackage } from '../data/demoProfiles';
import { calculateInsuranceNeeds } from './calculator';

const STORAGE_KEYS = {
  CURRENT_USER: 'lifemap_user_profile',
  ASSESSMENT_INPUTS: 'lifemap_assessment_inputs',
  LIFE_GOALS: 'lifemap_life_goals',
  SCENARIOS: 'lifemap_scenarios',
  LEARNING_PROGRESS: 'lifemap_learning_progress',
  CHAT_MESSAGES: 'lifemap_chat_history',
};

// Initial default profile is Priya & Amit
const DEFAULT_PACKAGE: DemoProfilePackage = DEMO_PROFILES[0];

export const StorageAdapter = {
  // User Profile
  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse user profile from storage', e);
    }
    return DEFAULT_PACKAGE.profile;
  },

  setUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
  },

  // Financial Assessment Inputs
  getAssessmentInputs(): FinancialAssessmentInputs {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ASSESSMENT_INPUTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse assessment inputs from storage', e);
    }
    return DEFAULT_PACKAGE.inputs;
  },

  setAssessmentInputs(inputs: FinancialAssessmentInputs): void {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENT_INPUTS, JSON.stringify(inputs));
  },

  // Life Goals
  getLifeGoals(): LifeGoal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LIFE_GOALS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse life goals from storage', e);
    }
    return DEFAULT_PACKAGE.goals;
  },

  setLifeGoals(goals: LifeGoal[]): void {
    localStorage.setItem(STORAGE_KEYS.LIFE_GOALS, JSON.stringify(goals));
  },

  addLifeGoal(goal: LifeGoal): LifeGoal[] {
    const goals = this.getLifeGoals();
    const updated = [goal, ...goals];
    this.setLifeGoals(updated);
    return updated;
  },

  removeLifeGoal(goalId: string): LifeGoal[] {
    const goals = this.getLifeGoals();
    const updated = goals.filter(g => g.id !== goalId);
    this.setLifeGoals(updated);
    return updated;
  },

  // Scenario Simulations
  getScenarios(): ScenarioSimulation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCENARIOS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse scenarios from storage', e);
    }
    return [];
  },

  saveScenario(scenario: ScenarioSimulation): void {
    const scenarios = this.getScenarios();
    // Prepend new scenario, limit to last 10
    const updated = [scenario, ...scenarios.filter(s => s.id !== scenario.id)].slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(updated));
  },

  // Learning Progress
  getLearningProgress(): UserLearningProgress[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEARNING_PROGRESS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse learning progress from storage', e);
    }
    return [
      {
        userId: 'demo-user',
        gameId: 'game-pure-term-vs-savings',
        attempts: 1,
        completed: true,
        highScore: 100,
        badgesEarned: ['Term Shield Master'],
        lastPlayedAt: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ];
  },

  saveLearningProgress(progress: UserLearningProgress): void {
    const all = this.getLearningProgress();
    const filtered = all.filter(p => p.gameId !== progress.gameId);
    localStorage.setItem(STORAGE_KEYS.LEARNING_PROGRESS, JSON.stringify([...filtered, progress]));
  },

  // Chat History
  getChatHistory(): ChatMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse chat messages from storage', e);
    }
    return [];
  },

  saveChatHistory(messages: ChatMessage[]): void {
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages.slice(-30)));
  },

  // Load a full synthetic Demo Profile Package
  loadDemoProfile(profileId: string): DemoProfilePackage {
    const found = DEMO_PROFILES.find(p => p.id === profileId) || DEMO_PROFILES[0];
    this.setUserProfile(found.profile);
    this.setAssessmentInputs(found.inputs);
    this.setLifeGoals(found.goals);
    return found;
  },

  // Reset to default initial state
  resetAllToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.ASSESSMENT_INPUTS);
    localStorage.removeItem(STORAGE_KEYS.LIFE_GOALS);
    localStorage.removeItem(STORAGE_KEYS.SCENARIOS);
    localStorage.removeItem(STORAGE_KEYS.LEARNING_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
  }
};
