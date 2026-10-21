import { supabase } from '../lib/supabase';
import { UserLearningProgress } from '../types';
import { StorageAdapter } from '../lib/storage';

export const gameService = {
  // Load all game progress for an authenticated user
  async getUserProgress(userId?: string | null): Promise<UserLearningProgress[]> {
    if (!userId) {
      return StorageAdapter.getLearningProgress();
    }

    try {
      const { data, error } = await supabase
        .from('game_progress')
        .select('*')
        .eq('user_id', userId);

      if (error || !data) {
        return StorageAdapter.getLearningProgress();
      }

      return data.map((item: any) => ({
        userId: item.user_id,
        gameId: item.game_id,
        attempts: item.attempts || 1,
        completed: Boolean(item.completed),
        highScore: item.high_score || 0,
        badgesEarned: item.badges_earned || [],
        lastPlayedAt: item.last_played_at
      }));
    } catch {
      return StorageAdapter.getLearningProgress();
    }
  },

  // Save score & badge for authenticated user
  async saveScore(
    userId: string | null,
    gameId: string,
    score: number,
    completed: boolean,
    badgeName?: string
  ): Promise<UserLearningProgress> {
    if (!userId) {
      // Guest demo mode fallback
      const current = StorageAdapter.getLearningProgress();
      const existing = current.find(p => p.gameId === gameId);
      const badges = existing?.badgesEarned ? [...existing.badgesEarned] : [];
      if (badgeName && !badges.includes(badgeName)) {
        badges.push(badgeName);
      }

      const updated: UserLearningProgress = {
        userId: 'demo-user',
        gameId,
        attempts: (existing?.attempts || 0) + 1,
        completed: completed || Boolean(existing?.completed),
        highScore: Math.max(existing?.highScore || 0, score),
        badgesEarned: badges,
        lastPlayedAt: new Date().toISOString()
      };
      StorageAdapter.saveLearningProgress(updated);
      return updated;
    }

    // Authenticated user: persist to Supabase `game_progress` table
    const { data: existingRows } = await supabase
      .from('game_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('game_id', gameId);

    const existing = existingRows && existingRows.length > 0 ? existingRows[0] : null;

    const badges = existing?.badges_earned ? [...existing.badges_earned] : [];
    if (badgeName && !badges.includes(badgeName)) {
      badges.push(badgeName);
    }

    const attempts = (existing?.attempts || 0) + 1;
    const highScore = Math.max(existing?.high_score || 0, score);
    const isCompleted = completed || Boolean(existing?.completed);
    const now = new Date().toISOString();

    if (existing) {
      await supabase
        .from('game_progress')
        .eq('id', existing.id)
        .eq('user_id', userId)
        .update({
          score,
          completed: isCompleted,
          attempts,
          high_score: highScore,
          badges_earned: badges,
          last_played_at: now
        });
    } else {
      await supabase
        .from('game_progress')
        .insert({
          user_id: userId,
          game_id: gameId,
          score,
          completed: isCompleted,
          attempts,
          high_score: highScore,
          badges_earned: badges,
          last_played_at: now
        });
    }

    return {
      userId,
      gameId,
      attempts,
      completed: isCompleted,
      highScore,
      badgesEarned: badges,
      lastPlayedAt: now
    };
  }
};
