<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useBattlegroundStore } from '../../stores/battlegroundStore';
import { stopRoundBgm, playVictorySound, playDefeatSound } from '../../utils/battleSoundManager';
import { Trophy, Swords, Home, RotateCcw, Loader2, Sparkles } from '@lucide/vue';

const store = useBattlegroundStore();
const emit = defineEmits<{ exit: [] }>();

// Confetti animation
const confettiDots = ref<Array<{ x: number; y: number; color: string; size: number; delay: number }>>([]);
onMounted(() => {
  stopRoundBgm();
  const isWinner = data.value?.winnerPlayerId === store.myPlayerId;
  if (isWinner) {
    playVictorySound();
  } else {
    playDefeatSound();
  }

  const colors = ['#f59e0b', '#6366f1', '#ec4899', '#10b981', '#f97316'];
  confettiDots.value = Array.from({ length: 30 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 60,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 4 + Math.random() * 6,
    delay: Math.random() * 0.8,
  }));
});

const data = computed(() => store.gameOverData);
const winner = computed(() => {
  const wId = data.value?.winnerPlayerId;
  return store.players.find((p: any) => p.player_id === wId) ?? null;
});

// Build full final rankings from room_players
const finalRankings = computed(() => {
  return [...store.players]
    .sort((a, b) => (a.final_rank ?? 999) - (b.final_rank ?? 999));
});

function getPlayerName(playerId: string): string {
  return store.players.find((p: any) => p.player_id === playerId)?.player_name ?? playerId.slice(0, 8);
}

const winnerName = computed(() =>
  data.value?.winnerPlayerId ? getPlayerName(data.value.winnerPlayerId) : '—'
);

function avatarColor(name: string): string {
  return `hsl(${(name.charCodeAt(0) * 47) % 360}, 60%, 40%)`;
}

function reasonLabel(reason: string | null): string {
  if (!reason) return '🏆 Pemenang';
  switch (reason) {
    case 'typo': return 'Salah Ketik';
    case 'too_slow': return 'Time Out / Terlambat';
    case 'too_fast': return 'Anti-cheat';
    case 'disconnect': return 'Disconnect';
    default: return 'Gugur';
  }
}

function rankEmoji(rank: number | null): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank ?? '?'}`;
}
function getStanding(playerId: string) {
  return data.value?.roundStandings?.find((s: any) => s.playerId === playerId) ?? null;
}

function msToStr(ms: number): string {
  if (!ms || ms >= 75000) return 'Time Out';
  return (ms / 1000).toFixed(2) + 's';
}
</script>

<template>
  <div class="min-h-full flex flex-col items-center bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white overflow-auto relative">

    <!-- Confetti Layer -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        v-for="(dot, i) in confettiDots"
        :key="i"
        class="absolute rounded-full animate-confetti"
        :style="{
          left: `${dot.x}%`,
          top: `${dot.y}%`,
          width: `${dot.size}px`,
          height: `${dot.size}px`,
          background: dot.color,
          animationDelay: `${dot.delay}s`,
        }"
      ></div>
    </div>

    <div class="relative z-10 w-full max-w-lg px-4 py-8 flex flex-col items-center">

      <!-- Trophy Icon -->
      <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/40 mb-6 animate-pop">
        <Trophy class="w-10 h-10 text-white" />
      </div>

      <!-- Game Over Title -->
      <h1 class="text-3xl font-extrabold tracking-tight mb-2 text-center">
        {{ data?.isDraw ? 'Match Seri / Draw!' : 'Game Over!' }}
      </h1>
      <p class="text-slate-400 text-sm mb-8 text-center">
        <template v-if="data?.isDraw">
          <strong class="text-amber-400">{{ data.drawReason || 'Juara Bersama' }}</strong>
        </template>
        <template v-else>
          Pemenang: <strong class="text-amber-400">{{ winnerName }}</strong>
        </template>
        &nbsp;·&nbsp; Ronde {{ data?.finalRoundNumber ?? '?' }} · {{ store.players.length }} pemain
      </p>

      <!-- Draw Banner / Winner Card -->
      <div v-if="data?.isDraw" class="w-full mb-8 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-amber-500/10 animate-pop">
        <div class="w-14 h-14 rounded-2xl bg-amber-500/30 text-amber-300 flex items-center justify-center text-2xl font-black flex-shrink-0 shadow-inner">
          🤝
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-xs text-amber-400 font-bold uppercase tracking-widest mb-0.5">HASIL SERI / DRAW 🤝</div>
          <div class="text-lg font-extrabold truncate text-white">
            {{ data.drawReason || 'Juara Bersama!' }}
          </div>
        </div>
      </div>
      <div v-else-if="winner" class="w-full mb-8 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-amber-500/10 animate-pop">
        <div
          class="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0 shadow-inner"
          :style="`background: ${avatarColor(winner.player_name)}`"
        >
          {{ winner.player_name.slice(0, 2).toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-xs text-amber-400 font-bold uppercase tracking-widest mb-0.5">Pemenang 🏆</div>
          <div class="text-xl font-extrabold truncate text-white">
            {{ winner.player_name }}
            <span v-if="winner.player_id === store.myPlayerId" class="text-amber-400 text-sm font-normal ml-1">(Kamu!)</span>
          </div>
        </div>
      </div>

      <!-- Full Rankings Table -->
      <div class="w-full mb-8">
        <h2 class="text-sm font-bold text-slate-400 mb-3 flex items-center gap-1.5">
          <Swords class="w-4 h-4" />
          Ranking Akhir & Skor Pemain
        </h2>
        <div class="space-y-2">
          <div
            v-for="player in finalRankings"
            :key="player.player_id"
            :class="[
              'rounded-xl px-4 py-3 flex items-center gap-3 border transition',
              player.player_id === store.myPlayerId
                ? 'bg-indigo-500/15 border-indigo-500/40'
                : 'bg-white/5 border-white/10'
            ]"
          >
            <span class="text-lg w-8 text-center flex-shrink-0">
              {{ rankEmoji(player.final_rank) }}
            </span>
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
              :style="`background: ${avatarColor(player.player_name)}`"
            >{{ player.player_name.slice(0, 2).toUpperCase() }}</div>
            <div class="flex-1 min-w-0">
              <div class="font-bold text-sm truncate text-white">
                {{ player.player_name }}
                <span v-if="player.player_id === store.myPlayerId" class="text-indigo-400 text-xs font-normal ml-1">(Kamu)</span>
              </div>
              <div class="text-xs text-slate-400 flex items-center gap-2 flex-wrap mt-0.5">
                <template v-if="store.gameMode === 'quiz_blitz'">
                  <span class="text-amber-400 font-bold">Quiz Blitz</span>
                </template>
                <template v-else-if="getStanding(player.player_id)">
                  <span class="text-emerald-400 font-mono">✓{{ getStanding(player.player_id)?.correctChars ?? 0 }}</span>
                  <span class="text-rose-400 font-mono">✗{{ getStanding(player.player_id)?.wrongChars ?? 0 }}</span>
                  <span>•</span>
                  <span class="font-mono text-slate-300">{{ msToStr(getStanding(player.player_id)!.completionTimeMs) }}</span>
                  <span>•</span>
                </template>
                <span v-if="player.eliminated_in_round" class="text-rose-400">Gugur R{{ player.eliminated_in_round }} ({{ reasonLabel(player.elimination_reason) }})</span>
                <span v-else class="text-emerald-400 font-bold">Finished 🏆</span>
              </div>
            </div>
            <div class="flex-shrink-0 flex flex-col items-end gap-1">
              <span
                class="text-base font-black text-amber-400"
              >
                {{ player.score ?? getStanding(player.player_id)?.score ?? 0 }}
                <span class="text-xs font-normal text-slate-400">pts</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="w-full flex flex-col gap-3">
        <!-- Host Controls -->
        <template v-if="store.isHost">
          <button
            @click="store.resetRoomForNextGame()"
            :disabled="store.isLoading"
            class="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 rounded-xl font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer shadow-emerald-900/30"
          >
            <Loader2 v-if="store.isLoading" class="w-4 h-4 animate-spin" />
            <RotateCcw v-else class="w-4 h-4" />
            Mulai Game Lagi (Host)
          </button>
          <button
            @click="store.leaveRoom(); emit('exit')"
            class="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition cursor-pointer text-sm"
          >
            <Home class="w-4 h-4" />
            Keluar ke Menu
          </button>
        </template>

        <!-- Non-Host Controls -->
        <template v-else>
          <button
            @click="store.leaveRoom(); emit('exit')"
            class="w-full py-3.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Home class="w-4 h-4" />
            Keluar ke Menu
          </button>
        </template>
      </div>

    </div>

    <!-- Play Again Popup Modal for Non-Host Players -->
    <div
      v-if="store.showPlayAgainPrompt && !store.isHost"
      class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-pop"
    >
      <div class="w-full max-w-sm bg-gradient-to-b from-indigo-900 to-slate-900 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center">
        <div class="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mb-4 shadow-inner">
          <Sparkles class="w-7 h-7 text-indigo-400" />
        </div>
        
        <h3 class="text-xl font-black text-white mb-2">Host Memulai Game Baru! 🎮</h3>
        <p class="text-xs text-slate-300 leading-relaxed mb-6">
          Host memilih untuk bermain lagi di room ini. Apakah kamu mau ikut bergabung kembali ke arena?
        </p>

        <div class="w-full flex flex-col gap-2.5">
          <button
            @click="store.acceptPlayAgain()"
            :disabled="store.isLoading"
            class="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl font-extrabold text-white flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <RotateCcw class="w-4 h-4" />
            Ikut Main Lagi
          </button>
          <button
            @click="store.declinePlayAgain(); emit('exit')"
            class="w-full py-2.5 text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer"
          >
            Keluar ke Menu
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@keyframes confetti-fall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
}
.animate-confetti {
  animation: confetti-fall 3s ease-in forwards;
}

@keyframes pop {
  0% { opacity: 0; transform: scale(0.7); }
  70% { transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
}
</style>
