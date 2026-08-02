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
  getGuestId,
  getGuestName,
} from './battleground/helpers';
import {
  evaluateRoundForHost,
  forceEvaluateWithTimeouts,
} from './battleground/evaluator';
import {
  fetchPublicRoomsApi,
  createRoomApi,
  joinRoomByCodeApi,
  togglePublicApi,
  leaveRoomApi,
} from './battleground/roomService';
import {
  submitRoundApi,
  startNextRoundApi,
  resetRoomApi,
} from './battleground/roundService';

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
  const myCorrectChars = ref(0);
  const myWrongChars = ref(0);
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

  // ── Realtime Subscription & Power-Up Events ───────────────
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

  let unloadListener: (() => void) | null = null;

  async function handlePresenceUpdate() {
    if (!realtimeChannel || !roomId.value) return;

    await refreshPlayers();

    const state = realtimeChannel.presenceState();
    const onlinePlayerIds = new Set<string>();
    for (const key in state) {
      const presences = state[key] as any[];
      for (const p of presences) {
        if (p?.player_id) onlinePlayerIds.add(p.player_id);
      }
    }

    const now = Date.now();
    const disconnectedPlayers = players.value.filter(p => {
      const joinedMs = new Date(p.joined_at).getTime();
      return !onlinePlayerIds.has(p.player_id) && (now - joinedMs > 3000);
    });

    if (disconnectedPlayers.length === 0) return;

    const onlinePlayers = players.value.filter(p => onlinePlayerIds.has(p.player_id));
    const oldestOnlinePlayerId = onlinePlayers[0]?.player_id;
    const iAmManager = isHost.value || (oldestOnlinePlayerId === myPlayerId.value);

    if (iAmManager) {
      for (const dPlayer of disconnectedPlayers) {
        if (phase.value === 'idle' || phase.value === 'lobby') {
          await supabase
            .from('room_players')
            .delete()
            .eq('room_id', roomId.value)
            .eq('player_id', dPlayer.player_id);
        } else if (dPlayer.status === 'alive') {
          await supabase
            .from('room_players')
            .update({ status: 'eliminated', elimination_reason: 'disconnect' })
            .eq('room_id', roomId.value)
            .eq('player_id', dPlayer.player_id);
        }
      }

      const hostDisconnected = disconnectedPlayers.some(p => p.player_id === hostPlayerId.value);
      if (hostDisconnected && (phase.value === 'idle' || phase.value === 'lobby')) {
        if (onlinePlayers.length > 0) {
          const newHostId = onlinePlayers[0].player_id;
          hostPlayerId.value = newHostId;
          await supabase
            .from('rooms')
            .update({ host_player_id: newHostId })
            .eq('id', roomId.value);
        } else {
          await supabase
            .from('rooms')
            .update({ status: 'finished' })
            .eq('id', roomId.value);
        }
      }

      await refreshPlayers();

      if (isHost.value && activeRound.value && phase.value === 'round_active') {
        await evaluateRoundForHost(roomId.value, activeRound.value, alivePlayers.value, realtimeChannel, false, playerProgress.value);
      }
    }
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
      await handlePresenceUpdate();
    });
    realtimeChannel.on('presence', { event: 'sync' }, async () => {
      await handlePresenceUpdate();
    });

    realtimeChannel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${rId}` },
      (payload: any) => {
        if (payload.new?.host_player_id) {
          hostPlayerId.value = payload.new.host_player_id;
        }
        if (payload.new?.status === 'finished') {
          // Only leave room if finished while players are waiting in lobby
          if (phase.value === 'idle' || phase.value === 'lobby') {
            leaveRoom();
          }
        }
      }
    );

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

    realtimeChannel.on('broadcast', { event: 'player_joined' }, async () => {
      await refreshPlayers();
    });

    realtimeChannel.on('broadcast', { event: 'player_left' }, async ({ payload }: { payload: { playerId: string } }) => {
      if (payload?.playerId) {
        players.value = players.value.filter(p => p.player_id !== payload.playerId);
        playerProgress.value.delete(payload.playerId);
      }
      await refreshPlayers();
    });

    realtimeChannel.on('presence', { event: 'leave' }, async () => {
      await refreshPlayers();
    });

    realtimeChannel.on('presence', { event: 'sync' }, async () => {
      await refreshPlayers();
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
          await evaluateRoundForHost(rId, activeRound.value, alivePlayers.value, realtimeChannel, false, playerProgress.value);
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

    unloadListener = () => {
      if (roomId.value && myPlayerId.value) {
        const isLobby = phase.value === 'idle' || phase.value === 'lobby';
        if (realtimeChannel) {
          try {
            realtimeChannel.send({
              type: 'broadcast',
              event: 'player_left',
              payload: { playerId: myPlayerId.value, isHost: isHost.value },
            });
            realtimeChannel.untrack();
          } catch (e) {
            // ignore on unload
          }
        }
        leaveRoomApi(roomId.value, myPlayerId.value, isLobby, isHost.value, iAmAlive.value);
      }
    };
    window.addEventListener('beforeunload', unloadListener);
    window.addEventListener('pagehide', unloadListener);
  }

  function unsubscribeFromRoom() {
    if (unloadListener) {
      window.removeEventListener('beforeunload', unloadListener);
      window.removeEventListener('pagehide', unloadListener);
      unloadListener = null;
    }
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
        if (isHost.value && (phase.value === 'round_active' || phase.value === 'round_preparing')) {
          setTimeout(async () => {
            if (roomId.value && activeRound.value) {
              await forceEvaluateWithTimeouts(roomId.value, activeRound.value, alivePlayers.value, realtimeChannel, playerProgress.value);
            }
          }, 800);
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
    const correctChars = myCorrectChars.value || (pProg?.correctChars ?? 0);
    const wrongChars = myWrongChars.value || (pProg?.wrongChars ?? 0);

    const payloadMeta = JSON.stringify({
      completed: completedSentences,
      total: totalSentences,
      pct: progressPercentage,
      input: 'TIMEOUT',
    });

    await submitRound({
      typedInput: payloadMeta,
      isValid: false,
      completedSentences,
      totalSentences,
      progressPercentage,
      correctChars,
      wrongChars,
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
      publicRooms.value = await fetchPublicRoomsApi();
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
      const pid = myPlayerId.value;
      const pname = playerName || myPlayerName.value;

      if (!authStore.user && playerName) {
        localStorage.setItem('battleground_guest_name', playerName);
      }

      const room = await createRoomApi(pid, pname, isPublic);

      roomId.value = room.id;
      roomCode.value = room.code;
      hostPlayerId.value = pid;

      subscribeToRoom(room.id);
      await refreshPlayers();
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
      const pid = myPlayerId.value;
      const pname = playerName || myPlayerName.value;

      if (!authStore.user && playerName) {
        localStorage.setItem('battleground_guest_name', playerName);
      }

      const room = await joinRoomByCodeApi(code, pid, pname);

      roomId.value = room.id;
      roomCode.value = room.code;
      hostPlayerId.value = room.host_player_id;

      subscribeToRoom(room.id);
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

  async function togglePublic() {
    if (!isHost.value || !roomId.value) return;
    const currentPublic = myPlayer.value?.status === 'alive';
    isLoading.value = true;
    try {
      await togglePublicApi(roomId.value, currentPublic);
    } catch (err: any) {
      error.value = err?.message ?? 'Gagal mengubah status room.';
    } finally {
      isLoading.value = false;
    }
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

    const res = await startNextRoundApi({
      roomId: roomId.value,
      roundNum,
      aliveCount: alivePlayers.value.length,
    });

    const payloadData = {
      id: res.roundData.id,
      room_id: roomId.value,
      round_number: roundNum,
      sentence_id: res.primarySentence.id,
      sentence_japanese: res.primarySentence.japanese,
      sentence_romaji_variants: res.primarySentence.romaji_variants,
      sentence_word_spans: res.primarySentence.word_spans ?? null,
      sentence_meaning: res.primarySentence.meaning_id,
      sentences: res.formattedSentences,
      status: 'active' as const,
      roundStartAt: res.startAt,
      duration_seconds: res.durationSeconds,
      start_at: res.startAt,
    };

    activeRound.value = payloadData;
    mySubmissionStatus.value = null;
    myCompletionTimeMs.value = null;
    playersWhoSubmitted.value.clear();
    phase.value = 'round_preparing';
    startCountdownFromServerTime(res.startAt);

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

  async function submitRound(payload: {
    typedInput: string;
    isValid: boolean;
    completedSentences?: number;
    totalSentences?: number;
    progressPercentage?: number;
    correctChars?: number;
    wrongChars?: number;
  }) {
    if (!activeRound.value || mySubmissionStatus.value !== null) return;

    const completedSentences = payload.completedSentences ?? 0;
    const totalSentences = payload.totalSentences ?? 5;
    const progressPercentage = payload.progressPercentage ?? 0;
    const correctChars = payload.correctChars ?? 0;
    const wrongChars = payload.wrongChars ?? 0;

    mySubmissionStatus.value = payload.isValid ? 'success' : 'typo';

    try {
      const res = await submitRoundApi({
        activeRound: activeRound.value,
        myPlayerId: myPlayerId.value,
        typedInput: payload.typedInput,
        isValid: payload.isValid,
        completedSentences,
        totalSentences,
        progressPercentage,
        correctChars,
        wrongChars,
      });

      myCompletionTimeMs.value = res.completionTimeMs;

      await realtimeChannel?.send({
        type: 'broadcast',
        event: 'player_submitted',
        payload: { playerId: myPlayerId.value },
      });

      if (isHost.value && activeRound.value) {
        await evaluateRoundForHost(roomId.value!, activeRound.value, alivePlayers.value, realtimeChannel, false, playerProgress.value);
      }

    } catch (err: any) {
      console.error('[Battleground] Submit error:', err);
    }
  }

  function broadcastProgress(progress: {
    sentenceIndex?: number;
    activeUnitIndex?: number;
    completedSentences: number;
    totalSentences: number;
    progressPercentage: number;
    correctChars?: number;
    wrongChars?: number;
  }) {
    if (typeof progress.correctChars === 'number') myCorrectChars.value = progress.correctChars;
    if (typeof progress.wrongChars === 'number') myWrongChars.value = progress.wrongChars;

    playerProgress.value.set(myPlayerId.value, {
      playerId: myPlayerId.value,
      ...progress,
    });

    if (!realtimeChannel || !iAmAlive.value) return;

    realtimeChannel.send({
      type: 'broadcast',
      event: 'typing_progress',
      payload: {
        playerId: myPlayerId.value,
        ...progress,
      },
    });
  }

  async function resetRoomForNextGame() {
    if (!isHost.value || !roomId.value) return;
    isLoading.value = true;
    try {
      await resetRoomApi(roomId.value);

      await realtimeChannel?.send({
        type: 'broadcast',
        event: 'room_reset_play_again',
        payload: { roomId: roomId.value },
      });

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

  async function acceptPlayAgain() {
    showPlayAgainPrompt.value = false;
    if (!roomId.value) return;
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
    const rId = roomId.value;
    const pid = myPlayerId.value;
    const isLobby = phase.value === 'idle' || phase.value === 'lobby';
    const amHost = isHost.value;

    if (realtimeChannel) {
      try {
        await realtimeChannel.send({
          type: 'broadcast',
          event: 'player_left',
          payload: { playerId: pid, isHost: amHost },
        });
        await realtimeChannel.untrack();
      } catch (e) {
        console.warn('[Battleground] Untrack / broadcast leave error:', e);
      }
    }

    if (rId) {
      await leaveRoomApi(rId, pid, isLobby, amHost, iAmAlive.value);
    }

    unsubscribeFromRoom();

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
    fetchPublicRooms,
    createRoom,
    joinRoom,
    togglePublic,
    startGame,
    startNextRound,
    startNextRoundFromResult,
    submitRound,
    broadcastProgress,
    resetRoomForNextGame,
    acceptPlayAgain,
    declinePlayAgain,
    leaveRoom,
  };
});
