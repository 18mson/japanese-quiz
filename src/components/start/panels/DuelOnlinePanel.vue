<script setup lang="ts">
import { Users } from '@lucide/vue';

defineProps<{
  subType: string;
}>();
</script>

<template>
  <div class="w-full">
    <!-- Quiz Blitz Info Banner -->
    <div 
      v-if="subType === 'quiz_blitz'" 
      key="quiz-blitz-banner" 
      class="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/60 dark:via-orange-950/40 dark:to-rose-950/60 border border-amber-300/80 dark:border-amber-800/80 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 w-full animate-fadeIn"
    >
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold flex-shrink-0 shadow-sm text-sm">
          🔥
        </div>
        <div>
          <div class="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100">Aturan Quiz Blitz</div>
          <div class="text-xs sm:text-sm text-gray-600 dark:text-slate-300 font-medium leading-tight">
            10s/soal • Skor kecepatan adu refleks (Max 200 pts) • 5 Menit
          </div>
        </div>
      </div>
    </div>

    <!-- Adu Ketik (Battleground) Info Banner -->
    <div 
      v-else 
      key="battle-banner" 
      class="bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 dark:from-rose-950/60 dark:via-orange-950/40 dark:to-amber-950/60 border border-rose-200/80 dark:border-rose-800/80 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 w-full animate-fadeIn"
    >
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
          <Users class="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <div class="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100">Aturan Adu Ketik</div>
          <div class="text-xs sm:text-sm text-gray-600 dark:text-slate-300 font-medium leading-tight">
            2–8 Pemain • Eliminasi bertahap • Adu kecepatan mengetik romaji
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
