// src/stores/battlegroundStore.ts
// Re-export types for component compatibility
export * from './battleground/types';

import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from './authStore';
import type {
  GamePhase,
  RoomPlayer,
  ActiveRound,
  RoundResultPayload,
  GameOverPayload,
  PlayerProgress,
  SubmissionStatus,
  PublicRoomItem,
  PowerUpType,
  PowerUpBroadcastPayload,
} from './battleground/types';
import {
  generateRoomCode,
  pickMultipleRandomSentences,
  getGuestId,
  getGuestName,
} from './battleground/helpers';
import {
  evaluateRoundForHost,
  forceEvaluateWithTimeouts,
} from './battleground/evaluator';

export const useBattlegroundStore = defineStore('battleground', () => {
  const authStore = useAuthStore();

  // ── State ───────────────────────────────────────────────────
  const phase = ref<GamePhase>('idle');
  const roomId = ref<string | null>(null);
  const roomCode = ref<string | null>(null);
  const hostPlayerId = ref<string | null>(null);
  const players = ref<RoomPlayer[]>([]);
  const activeRound = ref<ActiveRound | null>(null);
  const lastRoundResult = ref<RoundResultPayload | null>(null);
  const gameOverData = ref<GameOverPayload | null>(null);
  const playerProgress = ref<Map<string, PlayerProgress>>(new Map());
  const showPlayAgainPrompt = ref(false);
  const publicRooms = ref<PublicRoomItem[]>([]);
  const isLoadingPublicRooms = ref(false);
  const error = ref<string | null>(null);
  const isLoading = ref(false);

  // ── Submissions & Timer ─────────────────────────────────────
  const mySubmissionStatus = ref<SubmissionStatus | null>(null);
  const myCompletionTimeMs = ref<number | null>(null);
  const playersWhoSubmitted = ref<Set<string>>(new Set());

  const countdownSeconds = ref<number>(0);
  let countdownTimer: ReturnType<typeof setInterval> | null = null;
  let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

  // ── Computed ────────────────────────────────────────────────
  const myPlayerId = computed<string>(() => authStore.user?.id ?? getGuestId());
  const myPlayerName = computed<string>(() => authStore.displayUsername || getGuestName());
  const isHost = computed<boolean>(() => hostPlayerId.value === myPlayerId.value);

  const alivePlayers = computed<RoomPlayer[]>(() =>
    players.value.filter(p => p.status === 'alive')
  );
  const eliminatedPlayers = computed<RoomPlayer[]>(() =>
    players.value.filter(p => p.status === 'eliminated')
  );
  const myPlayer = computed<RoomPlayer | undefined>(() =>
    players.value.find(p => p.player_id === myPlayerId.value)
  );
  const iAmAlive = computed<boolean>(() => myPlayer.value?.status === 'alive');

  // ── Realtime Subscription ───────────────────────────────────

  const latestPowerUpEvent = ref<PowerUpBroadcastPayload | null>(null);
  const activePowerUpEvents = ref<Map<string, { type: PowerUpType; expiresAt: number }>>(new Map());

  function triggerPowerUp(type: PowerUpType) {
    if (!realtimeChannel || !iAmAlive.value) return;
    const payload: PowerUpBroadcastPayload = {
      senderId: myPlayerId.value,
      senderName: myPlayerName.value,
      type,
      sentAt: Date.now(),
    };
    realtimeChannel.send({
      type: 'broadcast',
      event: 'power_up_triggered',
      payload,
    });
  }

  function subscribeToRoom(rId: string) {
    if (realtimeChannel) unsubscribeFromRoom();

    realtimeChannel = supabase.channel(`room:${rId}`, {
      config: { broadcast: { self: true } },
    });

    realtimeChannel.on('broadcast', { event: 'player_joined' }, async () => {
      await refreshPlayers();
    });

    realtimeChannel.on('broadcast', { event: 'power_up_triggered' }, ({ payload }: { payload: PowerUpBroadcastPayload }) => {
      latestPowerUpEvent.value = payload;
      const durationMs = payload.type === 'freeze' ? 3000 : (payload.type === 'storm' ? 5000 : 1500);
      activePowerUpEvents.value.set(payload.senderId, {
        type: payload.type,
        expiresAt: Date.now() + durationMs,
      });
      setTimeout(() => {
        activePowerUpEvents.value.delete(payload.senderId);
      }, durationMs);
    });
    realtimeChannel.on('presence', { event: 'join' }, async () => {
      await refreshPlayers();
    });
    realtimeChannel.on('presence', { event: 'leave' }, async () => {
      await refreshPlayers();
    });

    // Broadcast listeners
    realtimeChannel.on('broadcast', { event: 'player_joined' }, async () => {
      await refreshPlayers();
    });

    realtimeChannel.on('broadcast', { event: 'round_preparing' }, ({ payload }: { payload: ActiveRound & { roundStartAt: string } }) => {
      activeRound.value = {
        ...payload,
        start_at: payload.roundStartAt ?? null,
      };
      mySubmissionStatus.value = null;
      myCompletionTimeMs.value = null;
      playersWhoSubmitted.value = new Set();
      playerProgress.value = new Map();
      phase.value = 'round_preparing';

      startCountdownFromServerTime(payload.roundStartAt);
    });

    realtimeChannel.on('broadcast', { event: 'typing_progress' }, ({ payload }: { payload: PlayerProgress }) => {
      if (payload.playerId !== myPlayerId.value) {
        playerProgress.value.set(payload.playerId, payload);
      }
    });

    realtimeChannel.on('broadcast', { event: 'player_submitted' }, ({ payload }: { payload: { playerId: string } }) => {
      playersWhoSubmitted.value.add(payload.playerId);
    });

    realtimeChannel.on('broadcast', { event: 'round_results' }, ({ payload }: { payload: RoundResultPayload }) => {
      lastRoundResult.value = payload;
      for (const elim of payload.eliminatedPlayers) {
        const player = players.value.find(p => p.player_id === elim.playerId);
        if (player) {
          player.status = 'eliminated';
          player.elimination_reason = elim.reason;
          player.final_rank = elim.rank ?? null;
        }
      }
      phase.value = 'round_result';
      clearCountdown();
    });

    realtimeChannel.on('broadcast', { event: 'game_over' }, ({ payload }: { payload: GameOverPayload }) => {
      gameOverData.value = payload;
      if (payload.winnerPlayerId) {
        const winner = players.value.find(p => p.player_id === payload.winnerPlayerId);
        if (winner) winner.final_rank = 1;
      }
      phase.value = 'game_over';
      clearCountdown();
    });

    realtimeChannel.on('broadcast', { event: 'room_reset_play_again' }, async () => {
      if (!isHost.value) {
        showPlayAgainPrompt.value = true;
      }
    });

    // Postgres CDC listeners
    realtimeChannel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${rId}` },
      async () => {
        await refreshPlayers();
      }
    );

    realtimeChannel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'round_submissions', filter: `room_id=eq.${rId}` },
      async () => {
        if (isHost.value && activeRound.value && phase.value === 'round_active') {
          await evaluateRoundForHost(rId, activeRound.value, alivePlayers.value, realtimeChannel);
        }
      }
    );

    realtimeChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await realtimeChannel!.track({
          player_id: myPlayerId.value,
          name: myPlayerName.value,
          status: myPlayer.value?.status ?? 'alive',
        });
      }
    });
  }

  function unsubscribeFromRoom() {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  }

  // ── Timer Handlers ──────────────────────────────────────────

  function startCountdownFromServerTime(roundStartAt: string) {
    clearCountdown();
    const startMs = new Date(roundStartAt).getTime();

    const tick = () => {
      const now = Date.now();
      const roundDuration = (activeRound.value?.duration_seconds ?? 30) * 1000;
      const elapsed = now - startMs;
      const remaining = Math.max(0, Math.ceil((roundDuration - elapsed) / 1000));
      countdownSeconds.value = remaining;

      if (elapsed >= 0 && phase.value === 'round_preparing') {
        phase.value = 'round_active';
      }

      if (remaining <= 0) {
        clearCountdown();
        if (iAmAlive.value && mySubmissionStatus.value === null) {
          handleTimeout();
        }
        if (isHost.value && phase.value === 'round_active') {
          setTimeout(async () => {
            if (phase.value === 'round_active' && roomId.value && activeRound.value) {
              await forceEvaluateWithTimeouts(roomId.value, activeRound.value, alivePlayers.value, realtimeChannel);
            }
          }, 2000);
        }
      }
    };

    tick();
    countdownTimer = setInterval(tick, 500);
  }

  function clearCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  async function handleTimeout() {
    if (!roomId.value || !activeRound.value) return;
    if (mySubmissionStatus.value !== null) return;
    mySubmissionStatus.value = 'timeout';

    const pProg = playerProgress.value.get(myPlayerId.value);
    const totalSentences = activeRound.value.sentences?.length ?? 5;
    const completedSentences = pProg?.completedSentences ?? 0;
    const progressPercentage = pProg?.progressPercentage ?? 0;

    await submitRound({
      typedInput: 'TIMEOUT',
      isValid: false,
      completedSentences,
      totalSentences,
      progressPercentage,
    });
  }

  // ── Actions ─────────────────────────────────────────────────

  async function refreshPlayers() {
    if (!roomId.value) return;
    const { data } = await supabase
      .from('room_players')
      .select('*')
      .eq('room_id', roomId.value)
      .order('joined_at', { ascending: true });
    if (data) players.value = data as RoomPlayer[];
  }

  async function fetchPublicRooms() {
    isLoadingPublicRooms.value = true;
    try {
      const { data: roomRows, error: fetchErr } = await supabase
        .from('rooms')
        .select('id, code, host_player_id, max_players, created_at, room_players(player_name, player_id)')
        .eq('is_public', true)
        .eq('status', 'waiting')
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchErr) throw fetchErr;

      if (roomRows) {
        publicRooms.value = roomRows.map((r: any) => {
          const hostPlayer = r.room_players?.find((p: any) => p.player_id === r.host_player_id);
          return {
            id: r.id,
            code: r.code,
            host_player_id: r.host_player_id,
            host_name: hostPlayer?.player_name ?? 'Host',
            max_players: r.max_players ?? 8,
            player_count: r.room_players?.length ?? 1,
            created_at: r.created_at,
          };
        });
      }
    } catch (err: any) {
      console.error('[Battleground] Failed to fetch public rooms:', err);
    } finally {
      isLoadingPublicRooms.value = false;
    }
  }

  async function createRoom(playerName?: string, isPublic: boolean = true) {
    isLoading.value = true;
    error.value = null;

    try {
      const code = generateRoomCode();
      const pid = myPlayerId.value;
      const pname = playerName || myPlayerName.value;

      if (!authStore.user && playerName) {
        localStorage.setItem('battleground_guest_name', playerName);
      }

      const { data: roomData, error: roomErr } = await supabase
        .from('rooms')
        .insert({
          code,
          host_player_id: pid,
          status: 'waiting',
          max_players: 8,
          elimination_rate: 0.30,
          min_ms_per_char: 40,
          is_public: isPublic,
        })
        .select()
        .single();

      if (roomErr || !roomData) throw roomErr ?? new Error('Failed to create room');

      roomId.value = roomData.id;
      roomCode.value = code;
      hostPlayerId.value = pid;

      await joinRoomAsPlayer(roomData.id, pid, pname);
      subscribeToRoom(roomData.id);
      phase.value = 'lobby';

    } catch (err: any) {
      error.value = err?.message ?? 'Failed to create room';
    } finally {
      isLoading.value = false;
    }
  }

  async function joinRoom(code: string, playerName?: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const upperCode = code.toUpperCase().trim();
      const pid = myPlayerId.value;
      const pname = playerName || myPlayerName.value;

      if (!authStore.user && playerName) {
        localStorage.setItem('battleground_guest_name', playerName);
      }

      const { data: roomData, error: roomErr } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', upperCode)
        .single();

      if (roomErr || !roomData) {
        error.value = 'Kode room tidak ditemukan.';
        return;
      }

      if (roomData.status !== 'waiting') {
        error.value = 'Game sudah berjalan atau selesai.';
        return;
      }

      const { data: existingPlayers } = await supabase
        .from('room_players')
        .select('player_id')
        .eq('room_id', roomData.id);

      if ((existingPlayers?.length ?? 0) >= roomData.max_players) {
        error.value = 'Room sudah penuh (maks. 8 pemain).';
        return;
      }

      roomId.value = roomData.id;
      roomCode.value = roomData.code;
      hostPlayerId.value = roomData.host_player_id;

      await joinRoomAsPlayer(roomData.id, pid, pname);
      subscribeToRoom(roomData.id);
      await refreshPlayers();

      await realtimeChannel?.send({
        type: 'broadcast',
        event: 'player_joined',
        payload: { playerId: pid, playerName: pname },
      });

      phase.value = 'lobby';

    } catch (err: any) {
      error.value = err?.message ?? 'Gagal join room.';
    } finally {
      isLoading.value = false;
    }
  }

  async function joinRoomAsPlayer(rId: string, pid: string, pname: string) {
    const { error: insertErr } = await supabase
      .from('room_players')
      .upsert({
        room_id: rId,
        player_id: pid,
        player_name: pname,
        avatar_seed: pid,
        status: 'alive',
      }, { onConflict: 'room_id,player_id' });

    if (insertErr) throw insertErr;
    await refreshPlayers();
  }

  async function startGame() {
    if (!isHost.value || !roomId.value) return;
    if (alivePlayers.value.length < 2) {
      error.value = 'Butuh minimal 2 pemain untuk mulai.';
      return;
    }

    isLoading.value = true;
    error.value = null;
    try {
      // Clear leftover submissions & rounds for this room before starting round 1
      await supabase.from('round_submissions').delete().eq('room_id', roomId.value);
      await supabase.from('rounds').delete().eq('room_id', roomId.value);

      await supabase
        .from('rooms')
        .update({ status: 'in_progress', current_round_num: 1, used_sentence_ids: [] })
        .eq('id', roomId.value);

      await startNextRound(1);
    } catch (err: any) {
      error.value = err?.message ?? 'Gagal memulai game.';
    } finally {
      isLoading.value = false;
    }
  }

  async function startNextRound(roundNum: number) {
    if (!roomId.value) return;

    const { data: roomData } = await supabase
      .from('rooms')
      .select('used_sentence_ids')
      .eq('id', roomId.value)
      .single();

    const usedIds: string[] = roomData?.used_sentence_ids ?? [];
    
    const numP = alivePlayers.value.length;
    let sentenceCount = 7;
    let durationSeconds = 90;
    if (numP >= 5) {
      sentenceCount = 10;
      durationSeconds = 150;
    } else if (numP >= 3) {
      sentenceCount = 8;
      durationSeconds = 120;
    }

    const sentences = pickMultipleRandomSentences(usedIds, sentenceCount);
    const primarySentence = sentences[0];

    if (!primarySentence || sentences.length === 0) {
      error.value = 'Kalimat habis! Game selesai.';
      return;
    }

    const startAt = new Date(Date.now() + 5000).toISOString();

    const formattedSentences = sentences.map(s => ({
      id: s.id,
      japanese: s.japanese,
      romaji_variants: s.romaji_variants,
      word_spans: s.word_spans ?? null,
      meaning: s.meaning_id,
    }));

    const { data: roundData, error: roundErr } = await supabase
      .from('rounds')
      .upsert({
        room_id: roomId.value,
        round_number: roundNum,
        sentence_id: primarySentence.id,
        sentence_japanese: primarySentence.japanese,
        sentence_romaji_variants: primarySentence.romaji_variants,
        sentence_word_spans: primarySentence.word_spans ?? null,
        sentence_meaning: primarySentence.meaning_id,
        status: 'active',
        start_at: startAt,
        duration_seconds: durationSeconds,
      }, { onConflict: 'room_id,round_number' })
      .select()
      .single();

    if (roundErr || !roundData) throw roundErr ?? new Error('Failed to create round');

    const newUsedIds = [...usedIds, ...sentences.map(s => s.id)];

    await supabase
      .from('rooms')
      .update({ used_sentence_ids: newUsedIds, current_round_num: roundNum })
      .eq('id', roomId.value);

    const payloadData = {
      id: roundData.id,
      room_id: roomId.value,
      round_number: roundNum,
      sentence_id: primarySentence.id,
      sentence_japanese: primarySentence.japanese,
      sentence_romaji_variants: primarySentence.romaji_variants,
      sentence_word_spans: primarySentence.word_spans ?? null,
      sentence_meaning: primarySentence.meaning_id,
      sentences: formattedSentences,
      status: 'active' as const,
      roundStartAt: startAt,
      duration_seconds: durationSeconds,
      start_at: startAt,
    };

    activeRound.value = payloadData;
    mySubmissionStatus.value = null;
    myCompletionTimeMs.value = null;
    playersWhoSubmitted.value.clear();
    phase.value = 'round_preparing';
    startCountdownFromServerTime(startAt);

    await realtimeChannel?.send({
      type: 'broadcast',
      event: 'round_preparing',
      payload: payloadData,
    });
  }

  async function startNextRoundFromResult() {
    if (!isHost.value || !lastRoundResult.value) return;
    const nextNum = (lastRoundResult.value.roundNumber ?? 0) + 1;
    isLoading.value = true;
    try {
      await startNextRound(nextNum);
    } finally {
      isLoading.value = false;
    }
  }

  async function submitRound(inputOrOptions: string | {
    typedInput?: string;
    isValid?: boolean;
    completedSentences?: number;
    totalSentences?: number;
    progressPercentage?: number;
  }) {
    if (!roomId.value || !activeRound.value) return;
    if (mySubmissionStatus.value !== null && mySubmissionStatus.value !== 'timeout') return;

    const pid = myPlayerId.value;
    const round = activeRound.value;
    const startMs = round.start_at ? new Date(round.start_at).getTime() : Date.now();
    const completionTimeMs = Date.now() - startMs;

    let typedInput = 'TIMEOUT';
    let isValid = false;
    let completedSentences = 0;
    let totalSentences = round.sentences?.length ?? 5;
    let progressPercentage = 0;

    if (typeof inputOrOptions === 'object') {
      typedInput = inputOrOptions.typedInput ?? 'TIMEOUT';
      isValid = inputOrOptions.isValid ?? false;
      completedSentences = inputOrOptions.completedSentences ?? 0;
      totalSentences = inputOrOptions.totalSentences ?? totalSentences;
      progressPercentage = inputOrOptions.progressPercentage ?? (isValid ? 100 : Math.round((completedSentences / Math.max(1, totalSentences)) * 100));
    } else {
      typedInput = inputOrOptions;
      isValid = inputOrOptions === 'COMPLETE';
      completedSentences = isValid ? totalSentences : 0;
      progressPercentage = isValid ? 100 : 0;
    }

    const resultStatus: SubmissionStatus = isValid ? 'success' : 'timeout';
    mySubmissionStatus.value = resultStatus;
    myCompletionTimeMs.value = completionTimeMs;

    await realtimeChannel?.send({
      type: 'broadcast',
      event: 'player_submitted',
      payload: { playerId: pid },
    });

    const payloadMeta = JSON.stringify({
      completed: completedSentences,
      total: totalSentences,
      pct: progressPercentage,
      input: typedInput,
    });

    const { error: subErr } = await supabase
      .from('round_submissions')
      .upsert({
        round_id: round.id,
        room_id: roomId.value,
        player_id: pid,
        typed_input: payloadMeta,
        is_valid: isValid,
        completion_time_ms: completionTimeMs,
        status: resultStatus,
      }, { onConflict: 'round_id,player_id' });

    if (subErr) {
      console.error('[Battleground] Failed to save submission:', subErr);
    }

    if (isHost.value) {
      setTimeout(() => {
        if (roomId.value && activeRound.value) {
          evaluateRoundForHost(roomId.value, activeRound.value, alivePlayers.value, realtimeChannel);
        }
      }, 300);
    }
  }

  function broadcastProgress(progressInfo: number | { completedSentences: number; totalSentences: number; progressPercentage: number }, totalChars?: number) {
    if (!realtimeChannel || !iAmAlive.value) return;

    let payload: PlayerProgress;
    if (typeof progressInfo === 'object') {
      payload = {
        playerId: myPlayerId.value,
        completedSentences: progressInfo.completedSentences,
        totalSentences: progressInfo.totalSentences,
        progressPercentage: progressInfo.progressPercentage,
      };
    } else {
      payload = {
        playerId: myPlayerId.value,
        charIndex: progressInfo,
        totalChars: totalChars ?? 1,
        progressPercentage: totalChars && totalChars > 0 ? Math.round((progressInfo / totalChars) * 100) : 0,
      };
    }

    playerProgress.value.set(myPlayerId.value, payload);

    realtimeChannel.send({
      type: 'broadcast',
      event: 'typing_progress',
      payload,
    });
  }

  async function resetRoomForNextGame() {
    if (!isHost.value || !roomId.value) return;
    isLoading.value = true;
    error.value = null;

    try {
      // 1. Delete previous round_submissions & rounds to prevent unique key constraint violations
      await supabase
        .from('round_submissions')
        .delete()
        .eq('room_id', roomId.value);

      await supabase
        .from('rounds')
        .delete()
        .eq('room_id', roomId.value);

      // 2. Reset rooms table status & used sentences
      await supabase
        .from('rooms')
        .update({
          status: 'waiting',
          current_round_num: 0,
          used_sentence_ids: [],
        })
        .eq('id', roomId.value);

      await supabase
        .from('room_players')
        .update({
          status: 'alive',
          eliminated_in_round: null,
          elimination_reason: null,
          final_rank: null,
        })
        .eq('room_id', roomId.value);

      activeRound.value = null;
      lastRoundResult.value = null;
      gameOverData.value = null;
      mySubmissionStatus.value = null;
      myCompletionTimeMs.value = null;
      playersWhoSubmitted.value = new Set();
      playerProgress.value = new Map();
      showPlayAgainPrompt.value = false;

      await refreshPlayers();

      await realtimeChannel?.send({
        type: 'broadcast',
        event: 'room_reset_play_again',
        payload: {},
      });

      phase.value = 'lobby';
    } catch (err: any) {
      error.value = err?.message ?? 'Gagal reset game.';
    } finally {
      isLoading.value = false;
    }
  }

  async function acceptPlayAgain() {
    if (!roomId.value) return;
    isLoading.value = true;
    try {
      await supabase
        .from('room_players')
        .update({
          status: 'alive',
          eliminated_in_round: null,
          elimination_reason: null,
          final_rank: null,
        })
        .eq('room_id', roomId.value)
        .eq('player_id', myPlayerId.value);

      activeRound.value = null;
      lastRoundResult.value = null;
      gameOverData.value = null;
      mySubmissionStatus.value = null;
      myCompletionTimeMs.value = null;
      playersWhoSubmitted.value = new Set();
      playerProgress.value = new Map();
      showPlayAgainPrompt.value = false;

      await refreshPlayers();
      phase.value = 'lobby';
    } finally {
      isLoading.value = false;
    }
  }

  function declinePlayAgain() {
    showPlayAgainPrompt.value = false;
    leaveRoom();
  }

  async function leaveRoom() {
    clearCountdown();
    unsubscribeFromRoom();

    if (roomId.value && iAmAlive.value) {
      await supabase
        .from('room_players')
        .update({ status: 'eliminated', elimination_reason: 'disconnect' })
        .eq('room_id', roomId.value)
        .eq('player_id', myPlayerId.value);
    }

    phase.value = 'idle';
    roomId.value = null;
    roomCode.value = null;
    hostPlayerId.value = null;
    players.value = [];
    activeRound.value = null;
    lastRoundResult.value = null;
    gameOverData.value = null;
    playerProgress.value = new Map();
    mySubmissionStatus.value = null;
    myCompletionTimeMs.value = null;
    playersWhoSubmitted.value = new Set();
    showPlayAgainPrompt.value = false;
    error.value = null;
    isLoading.value = false;
  }

  return {
    phase,
    roomId,
    roomCode,
    hostPlayerId,
    players,
    activeRound,
    lastRoundResult,
    gameOverData,
    playerProgress,
    showPlayAgainPrompt,
    publicRooms,
    isLoadingPublicRooms,
    error,
    isLoading,
    mySubmissionStatus,
    myCompletionTimeMs,
    playersWhoSubmitted,
    countdownSeconds,
    myPlayerId,
    myPlayerName,
    isHost,
    alivePlayers,
    eliminatedPlayers,
    myPlayer,
    iAmAlive,
    latestPowerUpEvent,
    activePowerUpEvents,
    triggerPowerUp,
    createRoom,
    joinRoom,
    startGame,
    startNextRound,
    startNextRoundFromResult,
    submitRound,
    broadcastProgress,
    leaveRoom,
    refreshPlayers,
    fetchPublicRooms,
    resetRoomForNextGame,
    acceptPlayAgain,
    declinePlayAgain,
  };
});
