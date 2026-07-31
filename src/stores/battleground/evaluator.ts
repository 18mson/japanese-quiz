// src/stores/battleground/evaluator.ts

import { supabase } from '../../lib/supabaseClient';
import type {
  RoomPlayer,
  ActiveRound,
  RoundStanding,
  RoundResultPayload,
  GameOverPayload,
} from './types';

export async function evaluateRoundForHost(
  roomId: string,
  activeRound: ActiveRound,
  alivePlayers: RoomPlayer[],
  realtimeChannel: any,
  force: boolean = false
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

  await runElimination(roomId, activeRound, alivePlayers, submissionList, realtimeChannel);
}

export async function forceEvaluateWithTimeouts(
  roomId: string,
  activeRound: ActiveRound,
  alivePlayers: RoomPlayer[],
  realtimeChannel: any,
  playerProgressMap?: Map<string, { progressPercentage: number }>
): Promise<void> {
  const aliveIds = alivePlayers.map(p => p.player_id);

  const { data: subs } = await supabase
    .from('round_submissions')
    .select('player_id')
    .eq('round_id', activeRound.id);

  const submittedIds = new Set((subs ?? []).map((s: any) => s.player_id));
  const notSubmitted = aliveIds.filter(id => !submittedIds.has(id));

  for (const pid of notSubmitted) {
    const pProgress = playerProgressMap?.get(pid)?.progressPercentage ?? 0;
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
      }, { onConflict: 'round_id,player_id' });
  }

  await evaluateRoundForHost(roomId, activeRound, alivePlayers, realtimeChannel, true);
}

async function runElimination(
  roomId: string,
  activeRound: ActiveRound,
  alivePlayers: RoomPlayer[],
  subs: any[],
  realtimeChannel: any
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

    if (typeof sub.progress_percentage === 'number' && sub.progress_percentage > 0) {
      pct = sub.progress_percentage;
    }
    if (typeof sub.completed_sentences === 'number' && sub.completed_sentences > 0) {
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

  const successSubs = subs
    .filter((s: any) => s.is_valid && aliveIds.includes(s.player_id))
    .sort((a: any, b: any) => a.completion_time_ms - b.completion_time_ms);

  const failSubs = subs
    .filter((s: any) => !s.is_valid && aliveIds.includes(s.player_id))
    .sort((a: any, b: any) => {
      const metaA = parseMeta(a);
      const metaB = parseMeta(b);
      if (metaA.pct !== metaB.pct) return metaB.pct - metaA.pct;
      return a.completion_time_ms - b.completion_time_ms;
    });

  const rankedPlayers: Array<{ playerId: string; status: string; timeMs: number; completedSentences: number; totalSentences: number; pct: number }> = [
    ...successSubs.map((s: any) => {
      const meta = parseMeta(s);
      return { playerId: s.player_id, status: 'success', timeMs: s.completion_time_ms, completedSentences: meta.completed, totalSentences: meta.total, pct: meta.pct };
    }),
    ...failSubs.map((s: any) => {
      const meta = parseMeta(s);
      return { playerId: s.player_id, status: s.status || 'timeout', timeMs: s.completion_time_ms, completedSentences: meta.completed, totalSentences: meta.total, pct: meta.pct };
    }),
  ];

  const recordedIds = new Set(rankedPlayers.map(p => p.playerId));
  for (const id of aliveIds) {
    if (!recordedIds.has(id)) {
      rankedPlayers.push({
        playerId: id,
        status: 'timeout',
        timeMs: (activeRound.duration_seconds ?? 75) * 1000,
        completedSentences: 0,
        totalSentences: totalSentencesInRound,
        pct: 0,
      });
    }
  }

  const allIdle = rankedPlayers.every(p => p.pct === 0);

  let isDraw = false;
  let drawReason = '';

  if (allIdle) {
    isDraw = true;
    drawReason = 'Semua pemain idle (0% progress)';
  } else if (N === 2 && rankedPlayers.length >= 2) {
    const p1 = rankedPlayers[0];
    const p2 = rankedPlayers[1];
    if (p1.pct === p2.pct && p1.timeMs === p2.timeMs) {
      isDraw = true;
      drawReason = 'Skor & Waktu Sama (Juara Bersama)';
    }
  }

  let playersToEliminate: typeof rankedPlayers = [];
  if (!isDraw) {
    playersToEliminate = rankedPlayers.slice(rankedPlayers.length - numToEliminate);
  }

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

  if (isGameOver && survivors.length === 1) {
    await supabase
      .from('room_players')
      .update({ final_rank: 1 })
      .eq('room_id', roomId)
      .eq('player_id', survivors[0]);

    await supabase
      .from('rooms')
      .update({ status: 'finished' })
      .eq('id', roomId);
  }

  const standings: RoundStanding[] = rankedPlayers.map(p => ({
    playerId: p.playerId,
    completionTimeMs: p.timeMs,
    status: p.status,
    completedSentences: p.completedSentences,
    totalSentences: p.totalSentences,
    progressPercentage: p.pct,
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
    await realtimeChannel?.send({
      type: 'broadcast',
      event: 'game_over',
      payload: gameOverPayload,
    });
  } else {
    await realtimeChannel?.send({
      type: 'broadcast',
      event: 'round_results',
      payload: resultPayload,
    });
  }
}
