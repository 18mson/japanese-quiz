<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  Lock, 
  Check, 
  Sparkles, 
  Info,
  X
} from '@lucide/vue';
import BaseModal from './common/BaseModal.vue';
import { useBadgeStore } from '../stores/badgeStore';
import { useAuthStore } from '../stores/authStore';
import { useMasteryStore } from '../stores/masteryStore';
import { TIER_CONFIG, type Badge } from '../data/badges';
import { useTabIndicator } from '../composables/useTabIndicator';

const badgeStore = useBadgeStore();
const authStore = useAuthStore();
const masteryStore = useMasteryStore();

const activeFilter = ref<'all' | 'unlocked' | 'locked'>('all');
const selectedBadgeToInspect = ref<Badge | null>(null);
const avatarFeedbackMsg = ref<string | null>(null);

const { setTabRef, indicatorStyle, isInitialized } = useTabIndicator(activeFilter, {
  isOpen: computed(() => badgeStore.showProfileBadgeModal)
});

const filteredBadges = computed(() => {
  if (activeFilter.value === 'unlocked') {
    return badgeStore.unlockedBadges;
  }
  if (activeFilter.value === 'locked') {
    return badgeStore.lockedBadges;
  }
  return badgeStore.allBadges;
});

const selectAsAvatar = async (badge: Badge) => {
  if (!badgeStore.isBadgeUnlocked(badge.id)) return;
  const success = await badgeStore.setAvatarBadge(badge.id);
  if (success) {
    avatarFeedbackMsg.value = `Avatar berhasil diubah ke ${badge.title}!`;
    setTimeout(() => {
      avatarFeedbackMsg.value = null;
    }, 2500);
  }
};

const inspectBadge = (badge: Badge) => {
  selectedBadgeToInspect.value = badge;
};

const closeInspect = () => {
  selectedBadgeToInspect.value = null;
};
</script>

<template>
  <BaseModal
    :is-open="badgeStore.showProfileBadgeModal"
    max-width="2xl"
    :show-close-button="false"
    :dismiss-on-backdrop="true"
    @close="badgeStore.closeProfileBadgeModal"
    panel-class="bg-slate-900 text-slate-100 border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col h-[88vh] max-h-[720px] min-h-[560px]"
    body-class="h-full flex flex-col flex-1 min-h-0"
  >
    <!-- Close Button -->
    <button 
      @click="badgeStore.closeProfileBadgeModal" 
      class="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer border border-slate-700/50"
      title="Tutup"
    >
      <X class="w-4 h-4" />
    </button>
    <!-- Background glow ambient -->
    <div class="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Header Section: Profile & Active Avatar -->
    <div class="relative z-10 pb-4 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
      <!-- Active Avatar Display with Glowing Halo -->
      <div class="relative group">
        <div class="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
          <div class="w-full h-full bg-slate-950 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
            <span class="text-4xl select-none filter drop-shadow-md">
              {{ badgeStore.activeAvatarBadge.icon }}
            </span>
          </div>
        </div>
        <div class="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow border border-slate-900 flex items-center gap-0.5" title="Avatar Aktif">
          <Check class="w-3 h-3" />
        </div>
      </div>

      <!-- User Information & Stats -->
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
          <h2 class="text-lg sm:text-xl font-black text-white truncate">
            {{ authStore.displayUsername || 'Tamu Pelajar' }}
          </h2>
          <span 
            class="text-[11px] font-extrabold px-2 py-0.5 rounded-md border"
            :class="TIER_CONFIG[badgeStore.activeAvatarBadge.tier].bgBadge"
          >
            {{ badgeStore.activeAvatarBadge.title }}
          </span>
        </div>

        <p class="text-xs text-slate-400 font-mono mb-3">
          {{ badgeStore.activeAvatarBadge.japaneseTitle }} • {{ authStore.user?.email || 'Akun Lokal' }}
        </p>

        <!-- Stats Chips -->
        <div class="grid grid-cols-3 gap-2 max-w-sm mx-auto sm:mx-0">
          <div class="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2 text-center">
            <div class="text-[10px] text-slate-400 uppercase font-bold">Level Belajar</div>
            <div class="text-sm sm:text-base font-black text-amber-300">
              Lvl {{ masteryStore.currentUserLevel }}
            </div>
          </div>
          <div class="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2 text-center">
            <div class="text-[10px] text-slate-400 uppercase font-bold">Rekor Tertinggi</div>
            <div class="text-sm sm:text-base font-black text-indigo-300">
              Lvl {{ Math.max(badgeStore.highestLevelReached, masteryStore.currentUserLevel) }}
            </div>
          </div>
          <div class="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2 text-center">
            <div class="text-[10px] text-slate-400 uppercase font-bold">Koleksi Badge</div>
            <div class="text-sm sm:text-base font-black text-teal-300">
              {{ badgeStore.unlockedCount }}/{{ badgeStore.totalBadges }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Feedback Toast for Avatar Change -->
    <div 
      v-if="avatarFeedbackMsg" 
      class="mt-3 px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-fadeIn flex items-center justify-center gap-1.5"
    >
      <Sparkles class="w-3.5 h-3.5" />
      <span>{{ avatarFeedbackMsg }}</span>
    </div>

    <!-- Filter Navigation Tabs -->
    <div class="mt-4 mb-3 flex items-center justify-between gap-2 flex-wrap">
      <div class="relative flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs font-bold">
        <!-- Sliding Pill Indicator -->
        <div
          class="absolute rounded-lg bg-indigo-600 shadow-md shadow-indigo-600/30 pointer-events-none"
          :class="isInitialized ? 'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]' : 'transition-none'"
          :style="indicatorStyle"
        ></div>

        <button
          :ref="setTabRef('all')"
          @click="activeFilter = 'all'"
          class="relative z-10 px-3 py-1.5 rounded-lg transition-colors duration-200 cursor-pointer select-none"
          :class="activeFilter === 'all' ? 'text-white font-extrabold' : 'text-slate-400 hover:text-white'"
        >
          Semua ({{ badgeStore.totalBadges }})
        </button>
        <button
          :ref="setTabRef('unlocked')"
          @click="activeFilter = 'unlocked'"
          class="relative z-10 px-3 py-1.5 rounded-lg transition-colors duration-200 cursor-pointer select-none"
          :class="activeFilter === 'unlocked' ? 'text-white font-extrabold' : 'text-slate-400 hover:text-white'"
        >
          Terbuka ({{ badgeStore.unlockedCount }})
        </button>
        <button
          :ref="setTabRef('locked')"
          @click="activeFilter = 'locked'"
          class="relative z-10 px-3 py-1.5 rounded-lg transition-colors duration-200 cursor-pointer select-none"
          :class="activeFilter === 'locked' ? 'text-white font-extrabold' : 'text-slate-400 hover:text-white'"
        >
          Terkunci ({{ badgeStore.totalBadges - badgeStore.unlockedCount }})
        </button>
      </div>

      <div class="text-[11px] text-slate-400 font-medium">
        Koleksi: <span class="font-black text-amber-400">{{ badgeStore.completionPercentage }}%</span>
      </div>
    </div>

    <!-- Badge Grid List with Scroll & Smooth Tab Transition -->
    <div class="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-[300px]">
      <Transition name="tab-fade" mode="out-in">
        <div 
          :key="activeFilter"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 py-1"
        >
          <div
            v-for="badge in filteredBadges"
            :key="badge.id"
            @click="inspectBadge(badge)"
            class="group relative rounded-2xl p-3 border transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-between select-none"
        :class="[
          badgeStore.isBadgeUnlocked(badge.id)
            ? 'bg-slate-800/90 hover:bg-slate-700/80 border-slate-700 hover:border-indigo-400/60 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10'
            : 'bg-slate-950/70 border-slate-800/80 opacity-75 hover:opacity-90 border-dashed'
        ]"
      >
        <!-- Top Status Pill / Level -->
        <div class="w-full flex items-center justify-between text-[10px] font-bold mb-2">
          <span 
            class="px-1.5 py-0.5 rounded"
            :class="badgeStore.isBadgeUnlocked(badge.id) ? 'bg-slate-700 text-slate-300' : 'bg-slate-900 text-slate-500'"
          >
            {{ badge.badgeTypeLabel || `Lvl ${badge.levelRequired}` }}
          </span>

          <span v-if="badgeStore.selectedAvatarBadgeId === badge.id" class="text-amber-400 flex items-center gap-0.5">
            <Check class="w-3 h-3" />
            <span class="text-[9px]">Avatar</span>
          </span>
          <span v-else-if="!badgeStore.isBadgeUnlocked(badge.id)" class="text-slate-500 flex items-center gap-0.5">
            <Lock class="w-2.5 h-2.5" />
          </span>
        </div>

        <!-- Badge Visual Icon (Normal vs Silhouette) -->
        <div class="relative my-2">
          <div 
            class="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
            :class="[
              badgeStore.isBadgeUnlocked(badge.id)
                ? 'bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 shadow-inner'
                : 'bg-slate-900 border border-slate-800/90'
            ]"
          >
            <!-- UNLOCKED ICON -->
            <span 
              v-if="badgeStore.isBadgeUnlocked(badge.id)" 
              class="text-3xl sm:text-4xl filter drop-shadow-md"
            >
              {{ badge.icon }}
            </span>

            <!-- LOCKED SILHOUETTE ICON -->
            <div v-else class="relative flex items-center justify-center">
              <span class="text-3xl sm:text-4xl filter brightness-0 opacity-20 contrast-200 select-none">
                {{ badge.icon }}
              </span>
              <div class="absolute inset-0 flex items-center justify-center text-slate-400">
                <Lock class="w-5 h-5 text-slate-500 drop-shadow-md" />
              </div>
            </div>
          </div>
        </div>

        <!-- Badge Title & Lesson Subtitle -->
        <div class="w-full mt-1">
          <h4 
            class="text-xs font-black truncate"
            :class="badgeStore.isBadgeUnlocked(badge.id) ? 'text-white' : 'text-slate-500'"
          >
            {{ badgeStore.isBadgeUnlocked(badge.id) ? badge.title : '??? Terkunci' }}
          </h4>
          <p 
            class="text-[10px] font-medium truncate mt-0.5"
            :class="badgeStore.isBadgeUnlocked(badge.id) ? 'text-slate-400' : 'text-slate-600'"
          >
            <template v-if="badge.category === 'alphabet'">
              {{ badgeStore.isBadgeUnlocked(badge.id) ? (badge.id === 'badge_hiragana_master' ? '💮 100% Hiragana' : '⚡ 100% Katakana') : 'Hafal 100% Huruf' }}
            </template>
            <template v-else-if="badge.category === 'kanji'">
              {{ badgeStore.isBadgeUnlocked(badge.id) ? '🈴 100% Kanji N5' : 'Hafal 100% Kanji N5' }}
            </template>
            <template v-else-if="badgeStore.isBadgeUnlocked(badge.id)">
              {{ badge.lessonNumber === 0 ? '🔰 Mulai Belajar' : `🌸 Selesai Bab ${badge.lessonNumber}` }}
            </template>
            <template v-else>
              {{ badge.lessonNumber === 0 ? 'Mulai Belajar' : `Kuasai Bab ${badge.lessonNumber}` }}
            </template>
          </p>
        </div>

        <!-- Action Button / Footer -->
        <div class="w-full mt-2.5 pt-2 border-t border-slate-700/50">
          <button
            v-if="badgeStore.isBadgeUnlocked(badge.id)"
            @click.stop="selectAsAvatar(badge)"
            type="button"
            class="w-full py-1 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
            :class="badgeStore.selectedAvatarBadgeId === badge.id
              ? 'bg-amber-400 text-slate-950 font-black'
              : 'bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30'"
          >
            <Check v-if="badgeStore.selectedAvatarBadgeId === badge.id" class="w-3 h-3" />
            <span>{{ badgeStore.selectedAvatarBadgeId === badge.id ? 'Aktif' : 'Pilih Avatar' }}</span>
          </button>

          <div 
            v-else 
            class="w-full py-1 text-[10px] font-semibold text-slate-500 text-center flex items-center justify-center gap-1"
          >
            <Lock class="w-2.5 h-2.5" />
            <span>Siluet Misteri</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</div>

    <!-- Inspect Modal Details (When clicking a badge) -->
    <div 
      v-if="selectedBadgeToInspect"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      @click.self="closeInspect"
    >
      <div class="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative">
        <button 
          @click="closeInspect"
          class="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
        >
          ✕
        </button>

        <!-- Big Badge Preview -->
        <div class="w-24 h-24 mx-auto rounded-3xl p-1 bg-gradient-to-tr from-indigo-500/40 via-purple-500/20 to-transparent border border-white/10 flex items-center justify-center mb-4 shadow-xl">
          <span 
            v-if="badgeStore.isBadgeUnlocked(selectedBadgeToInspect.id)" 
            class="text-5xl filter drop-shadow-lg"
          >
            {{ selectedBadgeToInspect.icon }}
          </span>
          <div v-else class="relative flex items-center justify-center">
            <span class="text-5xl filter brightness-0 opacity-20 select-none">
              {{ selectedBadgeToInspect.icon }}
            </span>
            <Lock class="absolute w-7 h-7 text-slate-400 drop-shadow-md" />
          </div>
        </div>

        <h3 class="text-xl font-black text-white">
          {{ badgeStore.isBadgeUnlocked(selectedBadgeToInspect.id) ? selectedBadgeToInspect.title : 'Badge Belum Terbuka' }}
        </h3>
        <p class="text-xs text-amber-400 font-mono mt-0.5">
          {{ selectedBadgeToInspect.japaneseTitle }}
        </p>

        <div class="inline-block my-2 px-2.5 py-0.5 rounded-full text-xs font-bold border" :class="TIER_CONFIG[selectedBadgeToInspect.tier].bgBadge">
          {{ TIER_CONFIG[selectedBadgeToInspect.tier].label }}
        </div>

        <p class="text-xs text-slate-300 leading-relaxed font-medium my-3">
          {{ selectedBadgeToInspect.description }}
        </p>

        <!-- Unlock Hint Card -->
        <div class="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 text-left mb-4">
          <div class="text-[10px] text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
            <Info class="w-3 h-3 text-indigo-400" />
            <span>Syarat Membuka</span>
          </div>
          <div class="text-xs text-slate-200 font-semibold">
            {{ selectedBadgeToInspect.unlockedHint }}
          </div>
        </div>

        <!-- Action Button -->
        <div class="flex gap-2">
          <button
            v-if="badgeStore.isBadgeUnlocked(selectedBadgeToInspect.id)"
            @click="selectAsAvatar(selectedBadgeToInspect); closeInspect()"
            type="button"
            class="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold text-xs shadow cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check class="w-3.5 h-3.5" />
            <span>{{ badgeStore.selectedAvatarBadgeId === selectedBadgeToInspect.id ? 'Avatar Sedang Aktif' : 'Gunakan Sebagai Avatar' }}</span>
          </button>
          
          <button
            @click="closeInspect"
            type="button"
            class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 8px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.4);
  border-radius: 8px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.7);
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
