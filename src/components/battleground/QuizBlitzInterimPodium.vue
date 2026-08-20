<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { QuizBlitzScoreItem } from '../../stores/battleground/types';
import { Trophy, Medal, Zap } from '@lucide/vue';

const props = defineProps<{
  scores: QuizBlitzScoreItem[];
  myPlayerId: string;
  roundNumber: number;
  nextRoundInSeconds: number;
}>();

// Counter animation for animated score rolling
const displayedScores = ref<Map<string, number>>(new Map());
const progressWidth = ref(100);
let animationFrameId: number | null = null;
let timerInterval: ReturnType<typeof setInterval> | null = null;

// Sorted scores for rendering
const sortedScores = computed(() => {
  return [...props.scores].sort((a, b) => b.newScore - a.newScore);
});

const top3 = computed(() => sortedScores.value.slice(0, 3));

const myScoreItem = computed(() =>
  sortedScores.value.find(s => s.playerId === props.myPlayerId)
);

const isMyPlayerInTop3 = computed(() => {
  return top3.value.some(s => s.playerId === props.myPlayerId);
});

// Animate numbers from previousScore to newScore over 1.8 seconds
function startScoreRollAnimation() {
  // Initialize with previousScore
  props.scores.forEach(s => {
    displayedScores.value.set(s.playerId, s.previousScore);
  });

  const durationMs = 1800;
  const startAt = performance.now();

  function animate(now: number) {
    const elapsed = now - startAt;
    const progress = Math.min(1, elapsed / durationMs);
    // Ease-out cubic
    const ease = 1 - Math.pow(1 - progress, 3);

    props.scores.forEach(s => {
      const diff = s.newScore - s.previousScore;
      const current = Math.round(s.previousScore + diff * ease);
      displayedScores.value.set(s.playerId, current);
    });

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate);
    }
  }

  animationFrameId = requestAnimationFrame(animate);
}

// 5-second smooth countdown bar
function startCountdownBar() {
  const totalMs = (props.nextRoundInSeconds || 5) * 1000;
  const startAt = Date.now();

  timerInterval = setInterval(() => {
    const elapsed = Date.now() - startAt;
    const remainingPct = Math.max(0, 100 - (elapsed / totalMs) * 100);
    progressWidth.value = remainingPct;
    if (remainingPct <= 0 && timerInterval) {
      clearInterval(timerInterval);
    }
  }, 30);
}

onMounted(() => {
  startScoreRollAnimation();
  startCountdownBar();
});

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (timerInterval) clearInterval(timerInterval);
});



function getPodiumHeight(rank: number) {
  if (rank === 1) return 'h-32 sm:h-40 bg-gradient-to-t from-amber-500/20 to-amber-500/10 border-amber-500/40';
  if (rank === 2) return 'h-24 sm:h-30 bg-gradient-to-t from-slate-400/20 to-slate-400/10 border-slate-400/40';
  return 'h-20 sm:h-24 bg-gradient-to-t from-amber-700/20 to-amber-700/10 border-amber-700/40';
}

function getAvatarUrl(seed: string | null, name: string) {
  const s = encodeURIComponent(seed || name);
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${s}`;
}
</script>

<template>
  <div class="w-full max-w-xl mx-auto flex flex-col items-center animate-fadeIn select-none px-3 sm:px-4">
    <!-- Header Banner -->
    <div class="w-full text-center mb-3 sm:mb-4">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-sm mb-1">
        <Trophy class="w-4 h-4 text-amber-400" />
        Peringkat Sementara Top 3
      </div>
      <p class="text-xs text-slate-400 font-medium">
        Soal {{ roundNumber }} Selesai · Ronde berikutnya dalam {{ nextRoundInSeconds }}s
      </p>
    </div>

    <!-- 5s Auto Advance Countdown Progress Bar -->
    <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4 sm:mb-5">
      <div
        class="h-full bg-gradient-to-r from-indigo-500 via-amber-400 to-rose-500 transition-all duration-75 ease-linear rounded-full"
        :style="{ width: `${progressWidth}%` }"
      />
    </div>

    <!-- Podium Visual Area (Top 3) -->
    <div class="w-full grid grid-cols-3 gap-2 sm:gap-3 items-end justify-center mb-4 sm:mb-5 min-h-[190px] sm:min-h-[230px]">
      
      <!-- Rank 2 (Left) -->
      <div
        v-if="top3[1]"
        class="flex flex-col items-center transition-all duration-700 transform animate-slideUp"
        style="animation-delay: 150ms;"
      >
        <div class="relative flex flex-col items-center mb-2">
          <!-- Overtake / Points added badge -->
          <span
            v-if="top3[1].pointsAdded > 0"
            class="absolute -top-3.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[10px] font-black text-slate-950 shadow-md shadow-emerald-500/30"
          >
            +{{ top3[1].pointsAdded }}
          </span>

          <img
            :src="getAvatarUrl(top3[1].avatarSeed, top3[1].playerName)"
            class="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 border-2 border-slate-300 shadow-md object-cover"
            alt="avatar"
          />
          <div class="w-5 h-5 rounded-full bg-slate-300 text-slate-950 text-[11px] font-black flex items-center justify-center -mt-2.5 shadow-sm border border-white">
            2
          </div>
        </div>

        <span class="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[85px] sm:max-w-[110px] text-center">
          {{ top3[1].playerName }}
        </span>

        <span class="text-xs sm:text-base font-black text-amber-400">
          {{ displayedScores.get(top3[1].playerId) ?? top3[1].newScore }} <span class="text-[10px] font-normal text-slate-400">pts</span>
        </span>

        <div :class="['w-full rounded-t-2xl border-t border-x flex flex-col items-center justify-center mt-1.5 shadow-inner', getPodiumHeight(2)]">
          <Medal class="w-5 h-5 text-slate-300/80" />
        </div>
      </div>
      <div v-else class="h-24 sm:h-30" />

      <!-- Rank 1 (Center) -->
      <div
        v-if="top3[0]"
        class="flex flex-col items-center transition-all duration-700 transform animate-slideUp z-10"
      >
        <div class="relative flex flex-col items-center mb-2">
          <!-- Crown Icon -->
          <div class="absolute -top-5 text-amber-400 animate-pulse">
            <Trophy class="w-5 h-5 sm:w-6 sm:h-6 fill-amber-400" />
          </div>

          <!-- Overtake / Points added badge -->
          <span
            v-if="top3[0].pointsAdded > 0"
            class="absolute -top-1 px-2 py-0.5 rounded-full bg-amber-400 text-[10px] sm:text-xs font-black text-slate-950 shadow-lg shadow-amber-400/40"
          >
            +{{ top3[0].pointsAdded }}
          </span>

          <img
            :src="getAvatarUrl(top3[0].avatarSeed, top3[0].playerName)"
            class="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-slate-800 border-2 border-amber-400 shadow-lg shadow-amber-500/20 object-cover mt-2"
            alt="avatar"
          />
          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 text-xs font-black flex items-center justify-center -mt-3 shadow-md border border-white">
            1
          </div>
        </div>

        <span class="text-xs sm:text-sm font-black text-white truncate max-w-[95px] sm:max-w-[125px] text-center">
          {{ top3[0].playerName }}
        </span>

        <span class="text-sm sm:text-lg font-black text-amber-300 flex items-center gap-0.5">
          <Zap class="w-3.5 h-3.5 fill-amber-300" />
          {{ displayedScores.get(top3[0].playerId) ?? top3[0].newScore }}
          <span class="text-[10px] font-normal text-slate-400">pts</span>
        </span>

        <div :class="['w-full rounded-t-2xl border-t border-x flex flex-col items-center justify-center mt-1.5 shadow-inner', getPodiumHeight(1)]">
          <Trophy class="w-6 h-6 text-amber-400/80" />
        </div>
      </div>
      <div v-else class="h-32 sm:h-40" />

      <!-- Rank 3 (Right) -->
      <div
        v-if="top3[2]"
        class="flex flex-col items-center transition-all duration-700 transform animate-slideUp"
        style="animation-delay: 250ms;"
      >
        <div class="relative flex flex-col items-center mb-2">
          <!-- Overtake / Points added badge -->
          <span
            v-if="top3[2].pointsAdded > 0"
            class="absolute -top-3.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[10px] font-black text-slate-950 shadow-md shadow-emerald-500/30"
          >
            +{{ top3[2].pointsAdded }}
          </span>

          <img
            :src="getAvatarUrl(top3[2].avatarSeed, top3[2].playerName)"
            class="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 border-2 border-amber-700 shadow-md object-cover"
            alt="avatar"
          />
          <div class="w-5 h-5 rounded-full bg-amber-700 text-amber-100 text-[11px] font-black flex items-center justify-center -mt-2.5 shadow-sm border border-amber-600">
            3
          </div>
        </div>

        <span class="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[85px] sm:max-w-[110px] text-center">
          {{ top3[2].playerName }}
        </span>

        <span class="text-xs sm:text-base font-black text-amber-400">
          {{ displayedScores.get(top3[2].playerId) ?? top3[2].newScore }} <span class="text-[10px] font-normal text-slate-400">pts</span>
        </span>

        <div :class="['w-full rounded-t-2xl border-t border-x flex flex-col items-center justify-center mt-1.5 shadow-inner', getPodiumHeight(3)]">
          <Medal class="w-5 h-5 text-amber-700/80" />
        </div>
      </div>
      <div v-else class="h-20 sm:h-24" />

    </div>

    <!-- If user is outside Top 3 (Rank 4+), display player's rank card below podium -->
    <div
      v-if="!isMyPlayerInTop3 && myScoreItem"
      class="w-full p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-indigo-500/40 flex items-center justify-between shadow-lg shadow-indigo-500/10 animate-slideUp"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-7 h-7 rounded-xl bg-indigo-600/30 border border-indigo-400 text-indigo-300 text-xs font-black flex items-center justify-center flex-shrink-0">
          #{{ myScoreItem.rank }}
        </div>
        <img
          :src="getAvatarUrl(myScoreItem.avatarSeed, myScoreItem.playerName)"
          class="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 object-cover flex-shrink-0"
          alt="avatar"
        />
        <div class="truncate">
          <div class="text-xs font-bold text-slate-100 truncate flex items-center gap-1.5">
            <span>{{ myScoreItem.playerName }}</span>
            <span class="px-1.5 py-0.2 rounded text-[9px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Kamu</span>
          </div>
          <div class="text-[10px] text-slate-400">
            Perolehan ronde ini: <span class="font-bold text-emerald-400">+{{ myScoreItem.pointsAdded }} pts</span>
          </div>
        </div>
      </div>

      <div class="text-right flex-shrink-0">
        <div class="text-xs sm:text-sm font-black text-amber-400">
          {{ displayedScores.get(myScoreItem.playerId) ?? myScoreItem.newScore }} pts
        </div>
        <div class="text-[10px] text-slate-400">
          {{ myScoreItem.isCorrect ? '✓ Benar' : '✗ Salah' }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.92);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-slideUp {
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
</style>
