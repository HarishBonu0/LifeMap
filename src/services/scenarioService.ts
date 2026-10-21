import { supabase } from '../lib/supabase';
import { GrowthScenarioRecord } from '../types';
import { StorageAdapter } from '../lib/storage';

export const scenarioService = {
  async getUserScenarios(userId?: string | null): Promise<GrowthScenarioRecord[]> {
    if (!userId) {
      const local = StorageAdapter.getScenarios();
      return local.map(s => ({
        id: s.id,
        userId: 'demo-user',
        scenarioName: s.name,
        description: s.description,
        inputs: s.scenarioInputs as any,
        results: s.scenarioResult as any,
        differenceAmount: s.differenceAmount,
        createdAt: s.createdAt
      }));
    }

    try {
      const { data, error } = await supabase
        .from('growth_scenarios')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        scenarioName: row.scenario_name,
        description: row.description,
        inputs: row.inputs,
        results: row.results,
        differenceAmount: Number(row.difference_amount) || 0,
        createdAt: row.created_at
      }));
    } catch {
      return [];
    }
  },

  async saveScenario(params: {
    userId: string | null;
    scenarioName: string;
    description?: string;
    inputs: Record<string, any>;
    results: Record<string, any>;
    differenceAmount: number;
  }): Promise<GrowthScenarioRecord> {
    const { userId, scenarioName, description, inputs, results, differenceAmount } = params;

    if (!userId) {
      const record: GrowthScenarioRecord = {
        id: 'sc_' + Date.now(),
        userId: 'demo-user',
        scenarioName,
        description,
        inputs,
        results,
        differenceAmount,
        createdAt: new Date().toISOString()
      };
      return record;
    }

    const { data, error } = await supabase
      .from('growth_scenarios')
      .insert({
        user_id: userId,
        scenario_name: scenarioName,
        description,
        inputs,
        results,
        difference_amount: differenceAmount
      });

    if (error) {
      throw error;
    }

    const row = Array.isArray(data) ? data[0] : data;
    return {
      id: row?.id || 'sc_' + Date.now(),
      userId,
      scenarioName,
      description,
      inputs,
      results,
      differenceAmount,
      createdAt: row?.created_at || new Date().toISOString()
    };
  }
};
