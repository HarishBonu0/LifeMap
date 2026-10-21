import { 
  UserProfile, 
  LifeGoal, 
  FinancialAssessmentInputs, 
  ScenarioSimulation, 
  UserLearningProgress, 
  ChatMessage
} from '../types';
import { DEMO_PROFILES, DemoProfilePackage } from '../data/demoProfiles';

const BASE_KEYS = {
  CURRENT_USER: 'lifemap_user_profile',
  ASSESSMENT_INPUTS: 'lifemap_assessment_inputs',
  LIFE_GOALS: 'lifemap_life_goals',
  SCENARIOS: 'lifemap_scenarios',
  LEARNING_PROGRESS: 'lifemap_learning_progress',
  CHAT_MESSAGES: 'lifemap_chat_history',
};

// In-memory fallback map for Node/test environments
const memoryStorage = new Map<string, string>();

const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {}
    return memoryStorage.get(key) || null;
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {}
    memoryStorage.set(key, value);
  },
  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {}
    memoryStorage.delete(key);
  }
};

// Default profile for guest/demo mode
const DEFAULT_PACKAGE: DemoProfilePackage = DEMO_PROFILES[0];

let currentScopedUserId: string | null = null;

const getKey = (baseKey: string): string => {
  if (currentScopedUserId) {
    return `${baseKey}_user_${currentScopedUserId}`;
  }
  return `${baseKey}_demo`;
};

export const StorageAdapter = {
  setScopedUserId(userId: string | null) {
    currentScopedUserId = userId;
  },

  getScopedUserId(): string | null {
    return currentScopedUserId;
  },

  // User Profile
  getUserProfile(): UserProfile {
    try {
      const data = safeStorage.getItem(getKey(BASE_KEYS.CURRENT_USER));
      if (data) return JSON.parse(data);

      // Legacy fallback
      const legacy = safeStorage.getItem(BASE_KEYS.CURRENT_USER);
      if (legacy && !currentScopedUserId) return JSON.parse(legacy);
    } catch (e) {
      console.warn('Failed to parse user profile from storage', e);
    }
    return DEFAULT_PACKAGE.profile;
  },

  setUserProfile(profile: UserProfile): void {
    safeStorage.setItem(getKey(BASE_KEYS.CURRENT_USER), JSON.stringify(profile));
  },

  // Financial Assessment Inputs
  getAssessmentInputs(): FinancialAssessmentInputs {
    try {
      const data = safeStorage.getItem(getKey(BASE_KEYS.ASSESSMENT_INPUTS));
      if (data) return JSON.parse(data);

      const legacy = safeStorage.getItem(BASE_KEYS.ASSESSMENT_INPUTS);
      if (legacy && !currentScopedUserId) return JSON.parse(legacy);
    } catch (e) {
      console.warn('Failed to parse assessment inputs from storage', e);
    }
    return DEFAULT_PACKAGE.inputs;
  },

  setAssessmentInputs(inputs: FinancialAssessmentInputs): void {
    safeStorage.setItem(getKey(BASE_KEYS.ASSESSMENT_INPUTS), JSON.stringify(inputs));
  },

  // Life Goals
  getLifeGoals(): LifeGoal[] {
    try {
      const data = safeStorage.getItem(getKey(BASE_KEYS.LIFE_GOALS));
      if (data) return JSON.parse(data);

      const legacy = safeStorage.getItem(BASE_KEYS.LIFE_GOALS);
      if (legacy && !currentScopedUserId) return JSON.parse(legacy);
    } catch (e) {
      console.warn('Failed to parse life goals from storage', e);
    }
    return DEFAULT_PACKAGE.goals;
  },

  setLifeGoals(goals: LifeGoal[]): void {
    safeStorage.setItem(getKey(BASE_KEYS.LIFE_GOALS), JSON.stringify(goals));
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
      const data = safeStorage.getItem(getKey(BASE_KEYS.SCENARIOS));
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse scenarios from storage', e);
    }
    return [];
  },

  saveScenario(scenario: ScenarioSimulation): void {
    const scenarios = this.getScenarios();
    const updated = [scenario, ...scenarios.filter(s => s.id !== scenario.id)].slice(0, 10);
    safeStorage.setItem(getKey(BASE_KEYS.SCENARIOS), JSON.stringify(updated));
  },

  // Learning Progress
  getLearningProgress(): UserLearningProgress[] {
    try {
      const data = safeStorage.getItem(getKey(BASE_KEYS.LEARNING_PROGRESS));
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse learning progress from storage', e);
    }
    return [
      {
        userId: currentScopedUserId || 'demo-user',
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
    safeStorage.setItem(getKey(BASE_KEYS.LEARNING_PROGRESS), JSON.stringify([...filtered, progress]));
  },

  // Chat History
  getChatHistory(): ChatMessage[] {
    try {
      const data = safeStorage.getItem(getKey(BASE_KEYS.CHAT_MESSAGES));
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse chat messages from storage', e);
    }
    return [];
  },

  saveChatHistory(messages: ChatMessage[]): void {
    safeStorage.setItem(getKey(BASE_KEYS.CHAT_MESSAGES), JSON.stringify(messages.slice(-30)));
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
    safeStorage.removeItem(getKey(BASE_KEYS.CURRENT_USER));
    safeStorage.removeItem(getKey(BASE_KEYS.ASSESSMENT_INPUTS));
    safeStorage.removeItem(getKey(BASE_KEYS.LIFE_GOALS));
    safeStorage.removeItem(getKey(BASE_KEYS.SCENARIOS));
    safeStorage.removeItem(getKey(BASE_KEYS.LEARNING_PROGRESS));
    safeStorage.removeItem(getKey(BASE_KEYS.CHAT_MESSAGES));
  }
};
