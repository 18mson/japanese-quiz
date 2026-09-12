// src/services/hitunganService.ts
import { supabase } from '../lib/supabaseClient';
import { HITUNGAN_WAVES, type HitunganWaveDef } from '../data/hitunganWaves';

export interface HitunganProgressRecord {
  wave_key: string;
  tutorial_seen: boolean;
  attempts: number;
  correct_count: number;
  last_practiced_at: string | null;
}

const LOCAL_STORAGE_PROGRESS_KEY = 'nihongo_hitungan_progress';

export class HitunganService {
  /**
   * Loads all available Hitungan waves.
   * Merges Supabase records with local definitions if available.
   */
  static async getWaves(): Promise<HitunganWaveDef[]> {
    try {
      const { data, error } = await supabase
        .from('hitungan_waves')
        .select('*')
        .order('order_index', { ascending: true });

      if (error || !data || data.length === 0) {
        return HITUNGAN_WAVES;
      }

      // Merge Supabase ids into local definitions
      return HITUNGAN_WAVES.map((localWave) => {
        const dbWave = data.find((d: any) => d.wave_key === localWave.wave_key);
        return {
          ...localWave,
          id: dbWave ? dbWave.id : localWave.id,
        };
      });
    } catch (err) {
      console.warn('Failed to load hitungan_waves from Supabase, using local:', err);
      return HITUNGAN_WAVES;
    }
  }

  /**
   * Retrieves user progress for all waves from Supabase (or localStorage fallback).
   */
  static async getProgress(userId?: string | null): Promise<Record<string, HitunganProgressRecord>> {
    // 1. Read local storage first
    let progressMap: Record<string, HitunganProgressRecord> = {};
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROGRESS_KEY);
      if (saved) {
        progressMap = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error parsing hitungan progress from localStorage', e);
    }

    // 2. If logged in, fetch from Supabase and merge
    if (userId) {
      try {
        const { data, error } = await supabase
          .from('hitungan_progress')
          .select(`
            id,
            tutorial_seen,
            attempts,
            correct_count,
            last_practiced_at,
            wave_id,
            hitungan_waves!inner(wave_key)
          `)
          .eq('user_id', userId);

        if (!error && data) {
          for (const item of data as any[]) {
            const waveKey = item.hitungan_waves?.wave_key;
            if (waveKey) {
              const local = progressMap[waveKey];
              progressMap[waveKey] = {
                wave_key: waveKey,
                tutorial_seen: item.tutorial_seen || local?.tutorial_seen || false,
                attempts: Math.max(item.attempts || 0, local?.attempts || 0),
                correct_count: Math.max(item.correct_count || 0, local?.correct_count || 0),
                last_practiced_at: item.last_practiced_at || local?.last_practiced_at || null,
              };
            }
          }
          // Update localStorage cache with merged data
          localStorage.setItem(LOCAL_STORAGE_PROGRESS_KEY, JSON.stringify(progressMap));
        }
      } catch (err) {
        console.warn('Error fetching hitungan_progress from Supabase:', err);
      }
    }

    return progressMap;
  }

  /**
   * Updates progress for a specific wave (tutorial seen, attempts, correct counts).
   */
  static async saveProgress(
    waveKey: string,
    updates: {
      tutorial_seen?: boolean;
      attemptsDelta?: number;
      correctDelta?: number;
    },
    userId?: string | null,
    waveId?: string | null
  ): Promise<HitunganProgressRecord> {
    // 1. Update local storage immediately
    let progressMap: Record<string, HitunganProgressRecord> = {};
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROGRESS_KEY);
      if (saved) progressMap = JSON.parse(saved);
    } catch {}

    const existing = progressMap[waveKey] || {
      wave_key: waveKey,
      tutorial_seen: false,
      attempts: 0,
      correct_count: 0,
      last_practiced_at: null,
    };

    const newRecord: HitunganProgressRecord = {
      wave_key: waveKey,
      tutorial_seen: updates.tutorial_seen !== undefined ? updates.tutorial_seen : existing.tutorial_seen,
      attempts: existing.attempts + (updates.attemptsDelta || 0),
      correct_count: existing.correct_count + (updates.correctDelta || 0),
      last_practiced_at: new Date().toISOString(),
    };

    progressMap[waveKey] = newRecord;
    localStorage.setItem(LOCAL_STORAGE_PROGRESS_KEY, JSON.stringify(progressMap));

    // 2. Persist to Supabase if authenticated
    if (userId) {
      try {
        // Resolve wave_id if not supplied
        let targetWaveId = waveId;
        if (!targetWaveId) {
          const { data: waveRow } = await supabase
            .from('hitungan_waves')
            .select('id')
            .eq('wave_key', waveKey)
            .maybeSingle();
          targetWaveId = waveRow?.id;
        }

        if (targetWaveId) {
          await supabase
            .from('hitungan_progress')
            .upsert(
              {
                user_id: userId,
                wave_id: targetWaveId,
                tutorial_seen: newRecord.tutorial_seen,
                attempts: newRecord.attempts,
                correct_count: newRecord.correct_count,
                last_practiced_at: newRecord.last_practiced_at,
              },
              { onConflict: 'user_id,wave_id' }
            );
        }
      } catch (err) {
        console.warn('Failed to upsert hitungan_progress to Supabase:', err);
      }
    }

    return newRecord;
  }
}
