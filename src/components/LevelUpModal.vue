<script setup lang="ts">
import { Sparkles, Award } from '@lucide/vue';
import { computed } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { useBadgeStore } from '../stores/badgeStore';
import { TIER_CONFIG } from '../data/badges';
import BaseModal from './common/BaseModal.vue';
import BadgeIcon from './common/BadgeIcon.vue';

const quizStore = useQuizStore();
const badgeStore = useBadgeStore();

const currentDisplayLevel = computed(() => {
  return badgeStore.nextUnclaimedLevel || quizStore.currentUserLevel;
});

const previousDisplayLevel = computed(() => {
  return Math.max(1, currentDisplayLevel.value - 1);
});

const newBadge = computed(() => {
  return badgeStore.getBadgeByLevel(currentDisplayLevel.value) || badgeStore.allBadges[0];
});

const tier = computed(() => {
  return TIER_CONFIG[newBadge.value.tier] || TIER_CONFIG.bronze;
});

const claimLevelUp = async () => {
  const levelToClaim = currentDisplayLevel.value;
  await badgeStore.claimLevel(levelToClaim);

  if (badgeStore.hasUnclaimedLevels) {
    return;
  }

  quizStore.showLevelUpScreen = false;
  if (quizStore.endTime > 0) {
    quizStore.quizCompleted = true;
  }
};
</script>

<template>
  <BaseModal
    :is-open="quizStore.showLevelUpScreen"
    max-width="md"
    :show-close-button="false"
    :dismiss-on-backdrop="false"
    panel-class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-amber-300/80 dark:border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-amber-500/15 dark:shadow-slate-950/80 relative overflow-hidden text-slate-800 dark:text-slate-100"
  >
    <!-- Ambient Japanese celebratory background glows -->
    <div class="absolute -top-24 -right-24 w-60 h-60 bg-amber-400/20 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-24 -left-24 w-60 h-60 bg-torii/10 dark:bg-aizome/30 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Floating celebratory particles -->
    <div class="absolute inset-0 pointer-events-none opacity-40 dark:opacity-30">
      <div class="sparkle s1 text-xl animate-bounce">✨</div>
      <div class="sparkle s2 text-2xl animate-pulse">⭐</div>
      <div class="sparkle s3 text-xl animate-ping">✨</div>
      <div class="sparkle s4 text-2xl animate-spin">🌸</div>
    </div>
    
    <div class="flex flex-col items-center gap-3 relative z-10">
      <!-- Glowing Level Up Header Badge -->
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 dark:bg-amber-500/10 border border-amber-400/50 dark:border-amber-400/30 text-amber-700 dark:text-amber-300 text-xs font-black uppercase tracking-widest shadow-xs">
        <Sparkles class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin" />
        <span>Pencapaian Baru Terbuka</span>
      </div>
      
      <!-- Celebratory Title (Clear in light mode & glowing in dark mode) -->
      <h2 class="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-amber-400 dark:via-yellow-200 dark:to-amber-300 bg-clip-text text-transparent uppercase tracking-wider drop-shadow-xs">
        LEVEL UP!
      </h2>

      <!-- Level Progression Pill -->
      <div class="flex items-center justify-center gap-4 w-full bg-amber-50/70 dark:bg-slate-800/60 py-2.5 px-4 rounded-2xl border border-amber-200/70 dark:border-slate-700/60">
        <div class="flex flex-col items-center">
          <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Sebelumnya</span>
          <span class="text-lg font-black text-slate-700 dark:text-slate-300">Level {{ previousDisplayLevel }}</span>
        </div>
        <div class="text-lg text-amber-500 dark:text-amber-400 animate-pulse font-black">➔</div>
        <div class="flex flex-col items-center">
          <span class="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold tracking-wider">Level Baru</span>
          <span class="text-xl font-black text-amber-600 dark:text-amber-300 drop-shadow-xs">Level {{ currentDisplayLevel }}</span>
        </div>
      </div>

      <!-- Unlocked Badge Card Showcase -->
      <div class="w-full mt-2 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-amber-300/70 dark:border-amber-400/30 shadow-lg shadow-amber-500/5 dark:shadow-none relative group">
        <!-- Glow Effect behind badge icon -->
        <div class="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-white dark:bg-gradient-to-tr dark:from-amber-500/30 dark:via-yellow-400/20 dark:to-transparent border-2 border-amber-300 dark:border-amber-400/60 flex items-center justify-center shadow-md shadow-amber-500/10 dark:shadow-amber-500/20 mb-3 relative p-2">
          <BadgeIcon 
            :badge-id="newBadge.id" 
            class="w-14 h-14 sm:w-16 sm:h-16 transform transition-transform group-hover:scale-110"
          />
          <div class="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded-md shadow-xs">
            BARU!
          </div>
        </div>

        <div class="flex flex-col items-center gap-1">
          <div class="flex items-center gap-1.5 flex-wrap justify-center">
            <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {{ newBadge.title }}
            </h3>
            <span class="text-xs px-2 py-0.5 rounded-full font-bold border" :class="tier.bgBadge">
              {{ tier.label.split(' ')[0] }}
            </span>
          </div>

          <p class="text-xs font-bold text-aizome dark:text-amber-300/90 font-mono">
            {{ newBadge.japaneseTitle }}
          </p>

          <p class="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xs leading-relaxed font-medium">
            {{ newBadge.description }}
          </p>
        </div>
      </div>
      
      <p class="text-[11px] text-emerald-700 dark:text-teal-300 font-medium mt-1 flex items-center gap-1.5">
        <Sparkles class="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-teal-300" />
        <span>Badge ini sekarang telah ditambahkan ke koleksi profilmu!</span>
      </p>
      
      <button 
        @click="claimLevelUp"
        class="w-full mt-2 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-yellow-500 active:scale-[0.99] text-slate-950 rounded-2xl font-black text-sm uppercase tracking-wider transition duration-200 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 border border-yellow-300/50"
      >
        <Award class="w-4 h-4 text-slate-950" />
        <span>{{ badgeStore.hasMoreThanOneUnclaimed ? 'Klaim Badge & Lanjut' : (quizStore.endTime > 0 ? 'Klaim Badge & Lihat Hasil' : 'Klaim Badge & Selesai') }}</span>
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
