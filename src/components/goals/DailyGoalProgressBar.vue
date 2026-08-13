<script setup lang="ts">
import { onMounted } from 'vue';
import { Target, Trophy } from '@lucide/vue';
import { useGoalsStore } from '../../stores/goalsStore';
import { useAuthStore } from '../../stores/authStore';

const goalsStore = useGoalsStore();
const authStore = useAuthStore();

onMounted(() => {
  goalsStore.loadGoalsAndProgress(authStore.user?.id);
});
</script>

<template>
  <div class="flex items-center gap-2 bg-slate-800/60 dark:bg-slate-800/80 border border-slate-700/60 rounded-full px-3 py-1.5 shadow-sm text-xs font-semibold">
    <div class="flex items-center gap-1 text-amber-400">
      <Target v-if="!goalsStore.goalCompleted" class="w-3.5 h-3.5 animate-pulse" />
      <Trophy v-else class="w-3.5 h-3.5 text-yellow-400" />
      <span>Target Harian:</span>
    </div>

    <div class="flex items-center gap-1.5">
      <span class="font-extrabold text-slate-100">
        {{ goalsStore.currentValue }} / {{ goalsStore.targetValue }} {{ goalsStore.goalType === 'questions' ? 'Soal' : 'Mnt' }}
      </span>
      
      <!-- Progress Pill -->
      <div class="w-14 sm:w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div 
          class="h-full rounded-full transition-all duration-500 ease-out"
          :class="goalsStore.goalCompleted ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-indigo-500'"
          :style="{ width: `${goalsStore.progressPercentage}%` }"
        ></div>
      </div>

      <span class="text-[10px] text-slate-400 font-bold">
        {{ goalsStore.progressPercentage }}%
      </span>
    </div>
  </div>
</template>
