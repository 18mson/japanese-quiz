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
  realtimeChannel: any
): Promise<void> {
  const roundId = activeRound.id;
  const aliveIds = alivePlayers.map(p => p.player_id);

  // Fetch all submissions for this round
  const { data: subs } = await supabase
    .from('round_submissions')
    .select('*')
    .eq('round_id', roundId);

  if (!subs) return;

  const submittedIds = new Set(subs.map((s: any) => s.player_id));
  const allSubmitted = aliveIds.every(id => submittedIds.has(id));
  if (!allSubmitted) return;

  await runElimination(roomId, activeRound, alivePlayers, subs, realtimeChannel);
}

export async function forceEvaluateWithTimeouts(
  roomId: string,
  activeRound: ActiveRound,
  alivePlayers: RoomPlayer[],
  realtimeChannel: any
): Promise<void> {
  const aliveIds = alivePlayers.map(p => p.player_id);

  const { data: subs } = await supabase
    .from('round_submissions')
    .select('player_id')
    .eq('round_id', activeRound.id);

  const submittedIds = new Set((subs ?? []).map((s: any) => s.player_id));
  const notSubmitted = aliveIds.filter(id => !submittedIds.has(id));

  for (const pid of notSubmitted) {
    await supabase
      .from('round_submissions')
      .upsert({
        round_id: activeRound.id,
        room_id: roomId,
        player_id: pid,
        typed_input: '',
        is_valid: false,
        completion_time_ms: (activeRound.duration_seconds ?? 30) * 1000,
        status: 'timeout',
      }, { onConflict: 'round_id,player_id' });
  }

  await evaluateRoundForHost(roomId, activeRound, alivePlayers, realtimeChannel);
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

  const successSubs = subs
    .filter((s: any) => s.is_valid && aliveIds.includes(s.player_id))
    .sort((a: any, b: any) => a.completion_time_ms - b.completion_time_ms);

  const failSubs = subs
    .filter((s: any) => !s.is_valid && aliveIds.includes(s.player_id));

  const eliminatedThisRound: Array<{ playerId: string; reason: string }> = [];

  for (const s of failSubs) {
    eliminatedThisRound.push({
      playerId: s.player_id,
      reason: s.status === 'timeout' ? 'too_slow' : 'typo',
    });
  }

  if (failSubs.length === 0 && successSubs.length >= 2) {
    const { data: roomData } = await supabase
      .from('rooms')
      .select('elimination_rate')
      .eq('id', roomId)
      .single();

    const rate = roomData?.elimination_rate ?? 0.3;
    const numToElim = Math.max(1, Math.floor(successSubs.length * rate));
    const slowest = successSubs.slice(successSubs.length - numToElim);
    for (const s of slowest) {
      eliminatedThisRound.push({ playerId: s.player_id, reason: 'too_slow' });
    }
  }

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

  const isGameOver = survivors.length <= 1;

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

  const allSubs = subs.filter((s: any) => aliveIds.includes(s.player_id));
  const standings: RoundStanding[] = allSubs
    .map((s: any) => ({
      playerId: s.player_id,
      completionTimeMs: s.completion_time_ms,
      status: s.is_valid ? 'success' : 'failed',
    }))
    .sort((a: RoundStanding, b: RoundStanding) => a.completionTimeMs - b.completionTimeMs);

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
  };

  if (isGameOver) {
    const gameOverPayload: GameOverPayload = {
      winnerPlayerId: survivors[0] ?? null,
      finalRoundNumber: roundNum,
      eliminatedPlayers: resultPayload.eliminatedPlayers,
      roundStandings: standings,
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
