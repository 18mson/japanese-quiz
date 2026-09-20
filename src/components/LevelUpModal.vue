<script setup lang="ts">
import { Sparkles, Award } from '@lucide/vue';
import { computed } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { useBadgeStore } from '../stores/badgeStore';
import { TIER_CONFIG } from '../data/badges';
import BaseModal from './common/BaseModal.vue';

const quizStore = useQuizStore();
const badgeStore = useBadgeStore();

const newBadge = computed(() => {
  return badgeStore.getBadgeByLevel(quizStore.currentUserLevel) || badgeStore.allBadges[0];
});

const tier = computed(() => {
  return TIER_CONFIG[newBadge.value.tier] || TIER_CONFIG.bronze;
});

const claimLevelUp = async () => {
  await badgeStore.claimLevel(quizStore.currentUserLevel);
  quizStore.showLevelUpScreen = false;
  quizStore.quizCompleted = true;
};
</script>

<template>
  <BaseModal
    :is-open="quizStore.showLevelUpScreen"
    max-width="md"
    :show-close-button="false"
    :dismiss-on-backdrop="false"
    panel-class="bg-slate-950/90 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-amber-500/10 relative overflow-hidden"
  >
    <!-- Golden particles backdrop -->
    <div class="absolute inset-0 pointer-events-none opacity-40">
      <div class="sparkle s1 text-xl animate-bounce">✨</div>
      <div class="sparkle s2 text-2xl animate-pulse">⭐</div>
      <div class="sparkle s3 text-xl animate-ping">✨</div>
      <div class="sparkle s4 text-2xl animate-spin">🌸</div>
    </div>
    
    <div class="flex flex-col items-center gap-3 relative z-10">
      <!-- Glowing Level Up Header Badge -->
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 text-xs font-black uppercase tracking-widest shadow-xs">
        <Sparkles class="w-3.5 h-3.5 animate-spin" />
        <span>Pencapaian Baru Terbuka</span>
      </div>
      
      <h2 class="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-300 bg-clip-text text-transparent uppercase tracking-wider drop-shadow-md">
        LEVEL UP!
      </h2>

      <!-- Level Progression Pill -->
      <div class="flex items-center justify-center gap-4 w-full bg-white/5 py-2.5 px-4 rounded-2xl border border-white/10">
        <div class="flex flex-col items-center">
          <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Sebelumnya</span>
          <span class="text-lg font-black text-gray-300">Level {{ Math.max(1, quizStore.currentUserLevel - 1) }}</span>
        </div>
        <div class="text-lg text-amber-400 animate-pulse font-black">➔</div>
        <div class="flex flex-col items-center">
          <span class="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Level Baru</span>
          <span class="text-xl font-black text-amber-300 drop-shadow-sm">Level {{ quizStore.currentUserLevel }}</span>
        </div>
      </div>

      <!-- Unlocked Badge Card Showcase -->
      <div class="w-full mt-2 p-4 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-amber-400/40 shadow-xl relative group">
        <!-- Glow Effect behind badge icon -->
        <div class="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500/30 via-yellow-400/20 to-transparent border-2 border-amber-400/60 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3 relative">
          <span class="text-4xl sm:text-5xl select-none filter drop-shadow-lg transform transition-transform group-hover:scale-110">
            {{ newBadge.icon }}
          </span>
          <div class="absolute -top-2 -right-2 bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded-md shadow">
            BARU!
          </div>
        </div>

        <div class="flex flex-col items-center gap-1">
          <div class="flex items-center gap-1.5">
            <h3 class="text-lg sm:text-xl font-black text-white">
              {{ newBadge.title }}
            </h3>
            <span class="text-xs px-2 py-0.5 rounded-full font-bold border" :class="tier.bgBadge">
              {{ tier.label.split(' ')[0] }}
            </span>
          </div>

          <p class="text-xs font-bold text-amber-300/90 font-mono">
            {{ newBadge.japaneseTitle }}
          </p>

          <p class="text-xs text-gray-300 mt-1 max-w-xs leading-relaxed font-medium">
            {{ newBadge.description }}
          </p>
        </div>
      </div>
      
      <p class="text-[11px] text-teal-300 font-medium mt-1 flex items-center gap-1">
        <span>✨ Badge ini sekarang telah ditambahkan ke koleksi profilmu!</span>
      </p>
      
      <button 
        @click="claimLevelUp"
        class="w-full mt-2 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-yellow-500 text-slate-950 rounded-2xl font-black text-sm uppercase tracking-wider transition duration-200 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
      >
        <Award class="w-4 h-4 text-slate-950" />
        <span>Klaim Badge & Lihat Hasil</span>
      </button>
    </div>
  </BaseModal>
</template>

<style scoped>
.sparkle {
  position: absolute;
}
.s1 { top: 10%; left: 15%; animation-duration: 2s; }
.s2 { top: 15%; right: 12%; animation-duration: 2.5s; }
.s3 { bottom: 20%; left: 10%; animation-duration: 3s; }
.s4 { bottom: 15%; right: 15%; animation-duration: 4s; }
</style>
