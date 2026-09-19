// src/stores/battleground/battlegroundBotService.ts
import { supabase } from '../../lib/supabaseClient';
import type {
  ActiveRound,
  RoomPlayer,
  BotDifficulty,
  PlayerProgress,
} from './types';

export interface BotPreset {
  key: string;
  name: string;
  avatarSeed: string;
  difficulty: BotDifficulty;
  charDelayRangeMs: [number, number]; // for typing (ms per character)
  accuracy: number;                  // for quiz blitz (0.0 - 1.0)
  reactionTimeRangeMs: [number, number]; // for quiz blitz (ms delay)
}

export const BOT_PRESETS: BotPreset[] = [
  {
    key: 'sakura',
    name: '🤖 Sakura (Santai)',
    avatarSeed: 'bot-sakura',
    difficulty: 'easy',
    charDelayRangeMs: [320, 440], // ~30 WPM
    accuracy: 0.65,
    reactionTimeRangeMs: [3200, 5200],
  },
  {
    key: 'kenji',
    name: '🤖 Kenji (Normal)',
    avatarSeed: 'bot-kenji',
    difficulty: 'medium',
    charDelayRangeMs: [200, 290], // ~45 WPM
    accuracy: 0.82,
    reactionTimeRangeMs: [2000, 3600],
  },
  {
    key: 'takeshi',
    name: '🤖 Takeshi (Master)',
    avatarSeed: 'bot-takeshi',
    difficulty: 'hard',
    charDelayRangeMs: [130, 190], // ~70 WPM
    accuracy: 0.95,
    reactionTimeRangeMs: [1200, 2300],
  },
  {
    key: 'aoi',
    name: '🤖 Aoi (Normal)',
    avatarSeed: 'bot-aoi',
    difficulty: 'medium',
    charDelayRangeMs: [210, 300],
    accuracy: 0.80,
    reactionTimeRangeMs: [2100, 3800],
  },
  {
    key: 'ren',
    name: '🤖 Ren (Master)',
    avatarSeed: 'bot-ren',
    difficulty: 'hard',
    charDelayRangeMs: [120, 180],
    accuracy: 0.96,
    reactionTimeRangeMs: [1100, 2100],
  },
  {
    key: 'hana',
    name: '🤖 Hana (Santai)',
    avatarSeed: 'bot-hana',
    difficulty: 'easy',
    charDelayRangeMs: [310, 430],
    accuracy: 0.68,
    reactionTimeRangeMs: [3400, 5400],
  },
];

export async function createBotPlayerApi(
  roomId: string,
  difficulty: BotDifficulty = 'medium',
  existingPlayers: RoomPlayer[]
): Promise<RoomPlayer> {
  const existingNames = new Set(existingPlayers.map(p => p.player_name));
  
  // Prefer preset with requested difficulty that is not already in the room
  let candidates = BOT_PRESETS.filter(p => p.difficulty === difficulty && !existingNames.has(p.name));
  if (candidates.length === 0) {
    candidates = BOT_PRESETS.filter(p => !existingNames.has(p.name));
  }
  if (candidates.length === 0) {
    const num = existingPlayers.length + 1;
    candidates = [{
      key: `bot${num}`,
      name: `🤖 Bot ${num}`,
      avatarSeed: `bot-${num}`,
      difficulty,
      charDelayRangeMs: [200, 300],
      accuracy: 0.8,
      reactionTimeRangeMs: [2000, 3500],
    }];
  }

  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  const botPlayerId = `bot_${selected.key}_${Math.random().toString(36).substring(2, 7)}`;

  const { data, error } = await supabase
    .from('room_players')
    .insert({
      room_id: roomId,
      player_id: botPlayerId,
      player_name: selected.name,
      avatar_seed: selected.avatarSeed,
      status: 'alive',
      score: 0,
    })
    .select()
    .single();

  if (error || !data) {
    throw error ?? new Error('Gagal menambahkan bot ke dalam room.');
  }

  return data;
}

export async function removeBotPlayerApi(roomId: string, botPlayerId: string): Promise<void> {
  const { error } = await supabase
    .from('room_players')
    .delete()
    .eq('room_id', roomId)
    .eq('player_id', botPlayerId);

  if (error) {
    throw error;
  }
}

interface ActiveBotTask {
  botId: string;
  delayTimeoutId?: ReturnType<typeof setTimeout> | null;
  actionTimeoutId?: ReturnType<typeof setTimeout> | null;
  intervalId?: ReturnType<typeof setInterval> | null;
}

let activeBotTasks: ActiveBotTask[] = [];

export function stopAllBotSimulations(): void {
  for (const task of activeBotTasks) {
    if (task.delayTimeoutId) clearTimeout(task.delayTimeoutId);
    if (task.actionTimeoutId) clearTimeout(task.actionTimeoutId);
    if (task.intervalId) clearInterval(task.intervalId);
  }
  activeBotTasks = [];
}

function resolveBotPreset(bot: RoomPlayer): BotPreset {
  const byAvatar = BOT_PRESETS.find(p => p.avatarSeed === bot.avatar_seed);
  if (byAvatar) return byAvatar;
  
  const byName = BOT_PRESETS.find(p => bot.player_name.includes(p.key) || bot.player_name.includes(p.name));
  if (byName) return byName;

  return BOT_PRESETS[1]; // default kenji (medium)
}

export function startBotRoundSimulation(params: {
  roomId: string;
  activeRound: ActiveRound;
  aliveBots: RoomPlayer[];
  realtimeChannel: any;
  onLocalProgress?: (progress: PlayerProgress) => void;
}): void {
  stopAllBotSimulations();

  const { roomId, activeRound, aliveBots, realtimeChannel, onLocalProgress } = params;
  if (!activeRound || aliveBots.length === 0) return;

  const startAtMs = activeRound.start_at ? new Date(activeRound.start_at).getTime() : Date.now();
  const delayUntilStart = Math.max(0, startAtMs - Date.now());

  for (const bot of aliveBots) {
    const preset = resolveBotPreset(bot);
    const task: ActiveBotTask = { botId: bot.player_id };
    activeBotTasks.push(task);

    // Schedule simulation after round official start time
    task.delayTimeoutId = setTimeout(() => {
      if (activeRound.question_data) {
        simulateQuizBlitzRound(roomId, activeRound, bot, preset, realtimeChannel, task);
      } else {
        simulateSentenceTypingRound(roomId, activeRound, bot, preset, realtimeChannel, onLocalProgress, task);
      }
    }, delayUntilStart);
  }
}

function simulateQuizBlitzRound(
  roomId: string,
  activeRound: ActiveRound,
  bot: RoomPlayer,
  preset: BotPreset,
  realtimeChannel: any,
  task: ActiveBotTask
): void {
  const question = activeRound.question_data;
  if (!question) return;

  const [minReaction, maxReaction] = preset.reactionTimeRangeMs;
  const maxAllowedMs = Math.max(1000, ((activeRound.duration_seconds ?? 10) * 1000) - 600);
  const reactionDelay = Math.min(
    maxAllowedMs,
    Math.floor(minReaction + Math.random() * (maxReaction - minReaction))
  );

  task.actionTimeoutId = setTimeout(async () => {
    try {
      const isCorrect = Math.random() < preset.accuracy;
      let selectedAnswer = question.correctAnswer;
      if (!isCorrect) {
        const wrongOptions = question.options.filter(opt => opt !== question.correctAnswer);
        if (wrongOptions.length > 0) {
          selectedAnswer = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        } else {
          selectedAnswer = question.options[0] ?? 'A';
        }
      }

      const completionTimeMs = activeRound.start_at
        ? Math.max(0, Date.now() - new Date(activeRound.start_at).getTime())
        : reactionDelay;

      const totalDurationMs = (activeRound.duration_seconds ?? 10) * 1000;
      const remainingMs = Math.max(0, totalDurationMs - completionTimeMs);
      const score = isCorrect ? Math.max(10, Math.round((remainingMs / totalDurationMs) * 200)) : 0;

      await supabase.from('round_submissions').upsert(
        {
          round_id: activeRound.id,
          room_id: roomId,
          player_id: bot.player_id,
          typed_input: selectedAnswer,
          completion_time_ms: completionTimeMs,
          is_valid: isCorrect,
          status: isCorrect ? 'success' : 'typo',
          score,
        },
        { onConflict: 'round_id,player_id' }
      );

      await realtimeChannel?.send({
        type: 'broadcast',
        event: 'player_submitted',
        payload: { playerId: bot.player_id },
      });
    } catch (err) {
      console.warn('[BotService] Error submitting bot quiz blitz answer:', err);
    }
  }, reactionDelay);
}

function simulateSentenceTypingRound(
  roomId: string,
  activeRound: ActiveRound,
  bot: RoomPlayer,
  preset: BotPreset,
  realtimeChannel: any,
  onLocalProgress: ((progress: PlayerProgress) => void) | undefined,
  task: ActiveBotTask
): void {
  // Determine sentences and calculate approximate total characters
  const sentenceList = activeRound.sentences && activeRound.sentences.length > 0
    ? activeRound.sentences
    : [{
        id: activeRound.sentence_id,
        japanese: activeRound.sentence_japanese,
        romaji_variants: activeRound.sentence_romaji_variants,
        meaning: activeRound.sentence_meaning ?? '',
      }];

  const totalSentences = sentenceList.length;
  let totalChars = 0;
  for (const s of sentenceList) {
    if (s.romaji_variants && Array.isArray(s.romaji_variants) && s.romaji_variants.length > 0) {
      // Each element is an array of variant strings for a unit
      totalChars += s.romaji_variants.reduce((acc, unit) => acc + (unit[0]?.length || 1), 0);
    } else {
      totalChars += Math.max(10, Math.round((s.japanese?.length || 5) * 2));
    }
  }

  totalChars = Math.max(20, totalChars);

  const [minCharDelay, maxCharDelay] = preset.charDelayRangeMs;
  const avgCharDelay = (minCharDelay + maxCharDelay) / 2;
  const tickIntervalMs = 250; // Update progress every 250ms
  const charsPerTick = tickIntervalMs / avgCharDelay;

  let currentChars = 0;
  const startTime = Date.now();

  task.intervalId = setInterval(async () => {
    // Add realistic jitter
    const advanceRate = charsPerTick * (0.8 + Math.random() * 0.4);
    currentChars += advanceRate;

    const progressPercentage = Math.min(100, Math.round((currentChars / totalChars) * 100));
    const completedSentences = Math.min(
      totalSentences,
      Math.floor((currentChars / totalChars) * totalSentences)
    );

    const progressPayload: PlayerProgress = {
      playerId: bot.player_id,
      charIndex: Math.min(totalChars, Math.round(currentChars)),
      totalChars,
      completedSentences,
      totalSentences,
      progressPercentage,
      correctChars: Math.min(totalChars, Math.round(currentChars)),
      wrongChars: 0,
    };

    onLocalProgress?.(progressPayload);

    realtimeChannel?.send({
      type: 'broadcast',
      event: 'typing_progress',
      payload: progressPayload,
    });

    if (currentChars >= totalChars) {
      if (task.intervalId) {
        clearInterval(task.intervalId);
        task.intervalId = null;
      }

      try {
        const completionTimeMs = activeRound.start_at
          ? Math.max(0, Date.now() - new Date(activeRound.start_at).getTime())
          : (Date.now() - startTime);

        await supabase.from('round_submissions').upsert(
          {
            round_id: activeRound.id,
            room_id: roomId,
            player_id: bot.player_id,
            typed_input: 'BOT_SUCCESS',
            completion_time_ms: completionTimeMs,
            is_valid: true,
            status: 'success',
            completed_sentences: totalSentences,
            total_sentences: totalSentences,
            progress_percentage: 100,
            correct_chars: totalChars,
            wrong_chars: 0,
            score: totalChars,
          },
          { onConflict: 'round_id,player_id' }
        );

        await realtimeChannel?.send({
          type: 'broadcast',
          event: 'player_submitted',
          payload: { playerId: bot.player_id },
        });
      } catch (err) {
        console.warn('[BotService] Error submitting bot typing result:', err);
      }
    }
  }, tickIntervalMs);
}
