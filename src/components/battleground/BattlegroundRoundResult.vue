<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useBattlegroundStore } from '../../stores/battlegroundStore';
import { playVictorySound, playDefeatSound, stopRoundBgm } from '../../utils/battleSoundManager';
import { ShieldX, Timer, ChevronRight, Loader2 } from '@lucide/vue';

const store = useBattlegroundStore();

const nextRoundCountdown = ref(0);
let interval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  stopRoundBgm();
  if (myResult.value?.status === 'eliminated') {
    playDefeatSound();
  } else {
    playVictorySound();
  }

  const totalSecs = store.lastRoundResult?.nextRoundInSeconds ?? 5;
  nextRoundCountdown.value = totalSecs;
  interval = setInterval(() => {
    nextRoundCountdown.value = Math.max(0, nextRoundCountdown.value - 1);
    if (nextRoundCountdown.value <= 0 && interval) {
      clearInterval(interval);
      interval = null;
    }
  }, 1000);
});

const result = computed(() => store.lastRoundResult);

const myResult = computed(() => {
  if (!result.value) return null;
  return result.value.roundStandings.find((s: any) => s.playerId === store.myPlayerId) ?? null;
});

const sortedStandings = computed(() => {
  if (!result.value) return [];
  return [...result.value.roundStandings].sort((a, b) => {
    // Urutkan berdasarkan skor tertinggi
    const scoreA = a.score ?? 0;
    const scoreB = b.score ?? 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    // Tiebreaker: waktu selesai lebih cepat
    return a.completionTimeMs - b.completionTimeMs;
  });
});

function reasonLabel(reason: string): string {
  switch (reason) {
    case 'typo': return 'Typo';
    case 'too_slow': return 'Terlambat';
    case 'too_fast': return 'Terlalu cepat';
    case 'disconnect': return 'Disconnect';
    default: return 'Gugur';
  }
}

function reasonIcon(reason: string): string {
  switch (reason) {
    case 'typo': return '✗';
    case 'too_slow': return '⏱';
    case 'too_fast': return '⚡';
    case 'disconnect': return '📡';
    default: return '✗';
  }
}

function reasonColor(reason: string): string {
  switch (reason) {
    case 'typo': return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
    case 'too_slow': return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    case 'too_fast': return 'text-orange-400 bg-orange-500/15 border-orange-500/30';
    default: return 'text-slate-400 bg-slate-500/15 border-slate-500/30';
  }
}

function msToStr(ms: number): string {
  return (ms / 1000).toFixed(2) + 's';
}

function avatarColor(name: string): string {
  return `hsl(${(name.charCodeAt(0) * 47) % 360}, 60%, 40%)`;
}

function getPlayerName(playerId: string): string {
  return store.players.find((p: any) => p.player_id === playerId)?.player_name ?? playerId.slice(0, 8);
}
</script>

<template>
  <div class="min-h-full flex flex-col items-center justify-start p-4 md:p-8 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white overflow-auto">

    <!-- Round Badge -->
    <div class="mb-6 text-center">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-bold text-slate-300 mb-3">
        Ronde {{ result?.roundNumber ?? '?' }} Selesai
      </div>
      <h2 class="text-2xl font-extrabold">Hasil Ronde</h2>
    </div>

    <!-- Draw Banner -->
    <div v-if="result?.isDraw" class="w-full max-w-lg mb-5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-2xl p-4 flex items-center gap-3">
      <div class="text-2xl">🤝</div>
      <div>
        <div class="font-extrabold text-amber-300">RONDE SERI / DRAW!</div>
        <div class="text-xs text-slate-300">{{ result.drawReason || 'Tidak ada pemain yang gugur ronde ini.' }}</div>
      </div>
    </div>

    <!-- My Result -->
    <div v-if="myResult" class="w-full max-w-lg mb-5">
      <div
        :class="[
          'rounded-2xl p-4 border flex items-center gap-3',
          myResult.status === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/30'
            : 'bg-rose-500/15 border-rose-500/30'
        ]"
      >
        <div class="text-2xl">{{ myResult.status === 'success' ? '✓' : '✗' }}</div>
        <div>
          <div class="font-extrabold" :class="myResult.status === 'success' ? 'text-emerald-400' : 'text-rose-400'">
            {{ myResult.status === 'success' ? 'Berhasil!' : 'Gugur Ronde Ini' }}
          </div>
          <div class="text-xs text-slate-400">
            Waktu: {{ msToStr(myResult.completionTimeMs) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Eliminated Players this round -->
    <div v-if="result?.eliminatedPlayers?.length" class="w-full max-w-lg mb-5">
      <h3 class="text-sm font-bold text-slate-400 mb-3 flex items-center gap-1.5">
        <ShieldX class="w-4 h-4 text-rose-500" />
        Gugur Ronde Ini ({{ result.eliminatedPlayers.length }} pemain)
      </h3>
      <div class="space-y-2">
        <div
          v-for="elim in result.eliminatedPlayers"
          :key="elim.playerId"
          :class="['rounded-xl p-3 border flex items-center gap-3', reasonColor(elim.reason)]"
        >
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
            :style="`background: ${avatarColor(getPlayerName(elim.playerId))}`"
          >
            {{ getPlayerName(elim.playerId).slice(0, 2).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-sm truncate">
              {{ getPlayerName(elim.playerId) }}
              <span v-if="elim.playerId === store.myPlayerId" class="text-xs opacity-70 font-normal">(Kamu)</span>
            </div>
            <div class="text-xs opacity-70">Rank #{{ elim.rank }}</div>
          </div>
          <div class="flex items-center gap-1 text-xs font-bold">
            <span>{{ reasonIcon(elim.reason) }}</span>
            <span>{{ reasonLabel(elim.reason) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- All round standings -->
    <div class="w-full max-w-lg mb-6">
      <h3 class="text-sm font-bold text-slate-400 mb-3 flex items-center gap-1.5">
        <Timer class="w-4 h-4" />
        Detail Hasil & Progress Ronde Ini
      </h3>
      <div class="space-y-1.5">
        <div
          v-for="(standing, idx) in sortedStandings"
          :key="standing.playerId"
          :class="[
            'rounded-xl px-3.5 py-2.5 flex items-center gap-3 text-sm border',
            standing.status === 'success' ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 opacity-70'
          ]"
        >
          <span class="text-slate-500 font-mono text-xs w-5 text-center">{{ idx + 1 }}</span>
          <div
            class="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
            :style="`background: ${avatarColor(getPlayerName(standing.playerId))}`"
          >{{ getPlayerName(standing.playerId).slice(0, 2).toUpperCase() }}</div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold truncate text-white">
              {{ getPlayerName(standing.playerId) }}
              <span v-if="standing.playerId === store.myPlayerId" class="text-indigo-400 text-xs font-normal ml-1">(Kamu)</span>
            </div>
            <div class="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
              <span class="text-emerald-400 font-mono">✓{{ standing.correctChars ?? 0 }}</span>
              <span class="text-rose-400 font-mono">✗{{ standing.wrongChars ?? 0 }}</span>
              <span v-if="standing.status === 'success'" class="text-amber-300 font-mono">+⏱{{ msToStr(standing.completionTimeMs) }}</span>
              <span v-else class="font-mono text-slate-300">{{ msToStr(standing.completionTimeMs) }}</span>
            </div>
          </div>
          <div class="text-right flex-shrink-0 flex flex-col items-end gap-1">
            <span class="text-base font-black" :class="standing.status === 'success' ? 'text-emerald-400' : 'text-slate-400'">
              {{ standing.score ?? 0 }} <span class="text-xs font-normal">pts</span>
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="standing.status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'">
              {{ standing.status === 'success' ? '✓ Selesai' : (((standing.progressPercentage ?? 0) > 0 || (standing.correctChars ?? 0) > 0) ? `⏱ ${standing.progressPercentage ?? 0}%` : '⏱ Idle') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Survivors count -->
    <div class="w-full max-w-lg mb-6 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
      <span class="text-slate-400 text-sm">
        Tersisa <strong class="text-white text-base">{{ result?.survivorPlayerIds?.length ?? 0 }}</strong> pemain hidup
      </span>
    </div>

    <!-- Next Round Button (Host only) or waiting message -->
    <div class="w-full max-w-lg">
      <template v-if="store.isHost">
        <button
          @click="store.startNextRoundFromResult()"
          :disabled="store.isLoading || nextRoundCountdown > 0"
          class="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
        >
          <Loader2 v-if="store.isLoading" class="w-4 h-4 animate-spin" />
          <ChevronRight v-else class="w-4 h-4" />
          {{ nextRoundCountdown > 0 ? `Ronde berikutnya dalam ${nextRoundCountdown}s` : 'Mulai Ronde Berikutnya' }}
        </button>
      </template>
      <div v-else class="text-center text-slate-400 text-sm py-3 bg-white/5 rounded-xl border border-dashed border-white/10">
        {{ nextRoundCountdown > 0 ? `⏳ Ronde berikutnya dalam ${nextRoundCountdown}s...` : '⏳ Menunggu host memulai ronde berikutnya...' }}
      </div>
    </div>

  </div>
</template>
