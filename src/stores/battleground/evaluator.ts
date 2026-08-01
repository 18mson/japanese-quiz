// src/stores/battleground/evaluator.ts

import { supabase } from '../../lib/supabaseClient';
import type {
  RoomPlayer,
  ActiveRound,
  RoundStanding,
  RoundResultPayload,
  GameOverPayload,
  PlayerProgress,
} from './types';

export async function evaluateRoundForHost(
  roomId: string,
  activeRound: ActiveRound,
  alivePlayers: RoomPlayer[],
  realtimeChannel: any,
  force: boolean = false,
  playerProgressMap?: Map<string, PlayerProgress>
): Promise<void> {
  const roundId = activeRound.id;
  const aliveIds = alivePlayers.map(p => p.player_id);

  // Fetch all submissions for this round
  const { data: subs } = await supabase
    .from('round_submissions')
    .select('*')
    .eq('round_id', roundId);

  const submissionList = subs ?? [];
  const submittedIds = new Set(submissionList.map((s: any) => s.player_id));
  const allSubmitted = aliveIds.every(id => submittedIds.has(id));

  if (!allSubmitted && !force) return;

  await runElimination(roomId, activeRound, alivePlayers, submissionList, realtimeChannel, playerProgressMap);
}

export async function forceEvaluateWithTimeouts(
  roomId: string,
  activeRound: ActiveRound,
  alivePlayers: RoomPlayer[],
  realtimeChannel: any,
  playerProgressMap?: Map<string, PlayerProgress>
): Promise<void> {
  const aliveIds = alivePlayers.map(p => p.player_id);

  const { data: subs } = await supabase
    .from('round_submissions')
    .select('player_id')
    .eq('round_id', activeRound.id);

  const submittedIds = new Set((subs ?? []).map((s: any) => s.player_id));
  const notSubmitted = aliveIds.filter(id => !submittedIds.has(id));

  for (const pid of notSubmitted) {
    const pProg = playerProgressMap?.get(pid);
    const pProgress = pProg?.progressPercentage ?? 0;
    const correctChars = pProg?.correctChars ?? 0;
    const wrongChars = pProg?.wrongChars ?? 0;
    const score = Math.max(0, correctChars - wrongChars);
    const totalSentences = activeRound.sentences?.length ?? 1;
    const completedSentences = Math.floor((pProgress / 100) * totalSentences);

    const payloadMeta = JSON.stringify({
      completed: completedSentences,
      total: totalSentences,
      pct: pProgress,
      input: 'TIMEOUT',
    });

    await supabase
      .from('round_submissions')
      .upsert({
        round_id: activeRound.id,
        room_id: roomId,
        player_id: pid,
        typed_input: payloadMeta,
        is_valid: false,
        completion_time_ms: (activeRound.duration_seconds ?? 75) * 1000,
        status: 'timeout',
        completed_sentences: completedSentences,
        total_sentences: totalSentences,
        progress_percentage: pProgress,
        correct_chars: correctChars,
        wrong_chars: wrongChars,
        score: score,
      }, { onConflict: 'round_id,player_id' });
  }

  await evaluateRoundForHost(roomId, activeRound, alivePlayers, realtimeChannel, true, playerProgressMap);
}

async function runElimination(
  roomId: string,
  activeRound: ActiveRound,
  alivePlayers: RoomPlayer[],
  subs: any[],
  realtimeChannel: any,
  playerProgressMap?: Map<string, PlayerProgress>
): Promise<void> {
  const roundNum = activeRound.round_number;
  const aliveIds = alivePlayers.map(p => p.player_id);
  const N = aliveIds.length;
  const totalSentencesInRound = activeRound.sentences?.length ?? 1;

  let targetSurvivors = 1;
  if (N > 4) {
    targetSurvivors = 4;
  } else if (N >= 3) {
    targetSurvivors = 2;
  } else {
    targetSurvivors = 1;
  }

  const numToEliminate = Math.max(1, N - targetSurvivors);

  const parseMeta = (sub: any) => {
    let completed = sub.is_valid ? totalSentencesInRound : 0;
    let total = totalSentencesInRound;
    let pct = sub.is_valid ? 100 : 0;

    if (typeof sub.progress_percentage === 'number') {
      pct = sub.progress_percentage;
    }
    if (typeof sub.completed_sentences === 'number') {
      completed = sub.completed_sentences;
    }

    try {
      if (sub.typed_input && typeof sub.typed_input === 'string' && sub.typed_input.startsWith('{')) {
        const parsed = JSON.parse(sub.typed_input);
        if (typeof parsed.completed === 'number') completed = parsed.completed;
        if (typeof parsed.total === 'number') total = parsed.total;
        if (typeof parsed.pct === 'number') pct = parsed.pct;
      }
    } catch {}
    if (!sub.is_valid && completed >= totalSentencesInRound) {
      completed = Math.max(0, totalSentencesInRound - 1);
    }
    return { completed, total, pct };
  };

  // ── Rank semua pemain (Gabungkan DB submissions & Realtime memory progressMap) ───
  const allSubs = aliveIds.map(pid => {
    const s = subs.find((sub: any) => sub.player_id === pid);
    const pProg = playerProgressMap?.get(pid);
    const meta = s ? parseMeta(s) : { completed: pProg?.completedSentences ?? 0, total: totalSentencesInRound, pct: pProg?.progressPercentage ?? 0 };

    const dbCorrect = typeof s?.correct_chars === 'number' ? s.correct_chars : 0;
    const dbWrong = typeof s?.wrong_chars === 'number' ? s.wrong_chars : 0;
    const progCorrect = pProg?.correctChars ?? 0;
    const progWrong = pProg?.wrongChars ?? 0;

    const correctChars = Math.max(dbCorrect, progCorrect);
    const wrongChars = Math.max(dbWrong, progWrong);

    let score = typeof s?.score === 'number' ? s.score : 0;
    if (score === 0 && (correctChars > 0 || s?.is_valid)) {
      const baseScore = Math.max(0, correctChars - wrongChars);
      const totalDurationMs = (activeRound.duration_seconds ?? 90) * 1000;
      const completionTimeMs = s?.completion_time_ms ?? totalDurationMs;
      const remainingMs = Math.max(0, totalDurationMs - completionTimeMs);
      const timeBonus = s?.is_valid ? Math.floor(remainingMs / 1000) * 10 : 0;
      score = baseScore + timeBonus;
    }

    return {
      playerId: pid,
      status: s?.status || (s?.is_valid ? 'success' : 'timeout'),
      timeMs: s?.completion_time_ms ?? (activeRound.duration_seconds ?? 90) * 1000,
      completedSentences: meta.completed,
      totalSentences: meta.total,
      pct: meta.pct,
      score,
      correctChars,
      wrongChars,
    };
  })
  .sort((a, b) => {
    // 1. Skor tertinggi (score DESC)
    if (b.score !== a.score) return b.score - a.score;
    // 2. Huruf benar terbanyak (correctChars DESC)
    if (b.correctChars !== a.correctChars) return b.correctChars - a.correctChars;
    // 3. Waktu selesai lebih cepat (completionTimeMs ASC)
    if (a.timeMs !== b.timeMs) return a.timeMs - b.timeMs;
    // 4. Tiebreaker deterministik ID (alphabetical ASC)
    return a.playerId.localeCompare(b.playerId);
  });

  const rankedPlayers = [...allSubs];

  const isDraw = false;
  const drawReason = '';

  const playersToEliminate = rankedPlayers.slice(rankedPlayers.length - numToEliminate);

  const eliminatedThisRound: Array<{ playerId: string; reason: string }> = playersToEliminate.map(p => ({
    playerId: p.playerId,
    reason: p.status === 'typo' ? 'typo' : 'too_slow',
  }));

  const eliminatedIds = new Set(eliminatedThisRound.map(e => e.playerId));
  const survivors = aliveIds.filter(id => !eliminatedIds.has(id));

  let rankCounter = aliveIds.length;
  const elimWithRank = eliminatedThisRound.map(e => ({ ...e, rank: rankCounter-- }));

  for (const elim of elimWithRank) {
    await supabase
      .from('room_players')
      .update({
        status: 'eliminated',
        eliminated_in_round: roundNum,
        elimination_reason: elim.reason,
        final_rank: elim.rank,
      })
      .eq('room_id', roomId)
      .eq('player_id', elim.playerId);
  }

  const isGameOver = !isDraw && survivors.length <= 1;

  const standings: RoundStanding[] = rankedPlayers.map(p => ({
    playerId: p.playerId,
    completionTimeMs: p.timeMs,
    status: p.status,
    completedSentences: p.completedSentences,
    totalSentences: p.totalSentences,
    progressPercentage: p.pct,
    score: p.score,
    correctChars: p.correctChars,
    wrongChars: p.wrongChars,
  }));

  const resultPayload: RoundResultPayload = {
    roundNumber: roundNum,
    eliminatedPlayers: elimWithRank.map(e => ({
      playerId: e.playerId,
      reason: e.reason,
      rank: e.rank,
    })),
    survivorPlayerIds: survivors,
    roundStandings: standings,
    isGameOver,
    nextRoundInSeconds: 5,
    isDraw,
    drawReason,
  };

  if (isGameOver) {
    const gameOverPayload: GameOverPayload = {
      winnerPlayerId: survivors[0] ?? null,
      finalRoundNumber: roundNum,
      eliminatedPlayers: resultPayload.eliminatedPlayers,
      roundStandings: standings,
      isDraw,
      drawReason,
    };

    // 1. Broadcast game_over event FIRST so all clients transition to 'game_over' phase immediately
    await realtimeChannel?.send({
      type: 'broadcast',
      event: 'game_over',
      payload: gameOverPayload,
    });

    // 2. Update winner final rank in DB
    if (survivors.length === 1) {
      await supabase
        .from('room_players')
        .update({ final_rank: 1 })
        .eq('room_id', roomId)
        .eq('player_id', survivors[0]);
    }

    // 3. Mark room status as finished in DB
    await supabase
      .from('rooms')
      .update({ status: 'finished' })
      .eq('id', roomId);
  } else {
    await realtimeChannel?.send({
      type: 'broadcast',
      event: 'round_results',
      payload: resultPayload,
    });
  }
}
