<script setup lang="ts">
import { Users, Swords, Zap } from '@lucide/vue';

defineProps<{
  subType: string;
}>();

const emit = defineEmits<{
  (e: 'selectSubType', key: string): void;
  (e: 'interact'): void;
}>();

const onlineGameSubTypes = [
  { key: 'battleground', label: 'Adu Ketik', icon: Swords },
  { key: 'quiz_blitz', label: 'Quiz Blitz', icon: Zap },
];

const handleSelect = (key: string) => {
  emit('interact');
  emit('selectSubType', key);
};
</script>

<template>
  <div class="flex flex-col gap-2 w-full animate-fadeIn pt-1">
    <!-- Sub-Menu Selector Pills: Adu Ketik & Quiz Blitz (Terlihat Keduanya) -->
    <div class="grid grid-cols-2 gap-1.5 sm:gap-2 w-full">
      <button
        v-for="sub in onlineGameSubTypes"
        :key="sub.key"
        type="button"
        @click.stop="handleSelect(sub.key)"
        :class="[
          'min-h-[44px] py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 shadow-2xs active:scale-95',
          subType === sub.key
            ? 'bg-gradient-to-r from-rose-600 to-orange-600 text-white border-rose-500 font-black shadow-xs scale-[1.02]'
            : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200/90 dark:border-slate-700/80'
        ]"
      >
        <component :is="sub.icon" class="w-4 h-4 text-amber-300 shrink-0" />
        <span class="truncate">{{ sub.label }}</span>
      </button>
    </div>

    <!-- Detail Description Banner: Mengikuti tombol sub judul yg aktif -->
    <Transition name="fade-slide-up" mode="out-in">
      <!-- Quiz Blitz Info Banner -->
      <div 
        v-if="subType === 'quiz_blitz'" 
        key="quiz-blitz-banner" 
        class="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 dark:bg-none dark:bg-slate-900 border border-amber-300/80 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 w-full"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold flex-shrink-0 shadow-sm text-sm">
            🔥
          </div>
          <div>
            <div class="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100">Aturan Quiz Blitz</div>
            <div class="text-xs sm:text-sm text-gray-600 dark:text-slate-400 font-medium leading-tight">
              10s/soal • Skor kecepatan adu refleks (Max 200 pts) • 5 Menit
            </div>
          </div>
        </div>
      </div>

      <!-- Adu Ketik (Battleground) Info Banner -->
      <div 
        v-else 
        key="battle-banner" 
        class="bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 dark:bg-none dark:bg-slate-900 border border-rose-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 w-full"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-600 dark:bg-torii text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
            <Users class="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div class="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100">Aturan Adu Ketik</div>
            <div class="text-xs sm:text-sm text-gray-600 dark:text-slate-400 font-medium leading-tight">
              2-8 Pemain • Eliminasi bertahap • Adu kecepatan mengetik romaji
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
