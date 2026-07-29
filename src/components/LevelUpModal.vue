<script setup lang="ts">
import { Trophy } from '@lucide/vue';
import { useQuizStore } from '../stores/quizStore';

const quizStore = useQuizStore();

const claimLevelUp = () => {
  quizStore.showLevelUpScreen = false;
  quizStore.quizCompleted = true;
};
</script>

<template>
  <div 
    v-if="quizStore.showLevelUpScreen" 
    class="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50 animate-fadeIn"
  >
    <div class="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden animate-scaleUp">
      <!-- Golden particles backdrop -->
      <div class="absolute inset-0 pointer-events-none opacity-30">
        <div class="sparkle s1 text-xl">✨</div>
        <div class="sparkle s2 text-xl">⭐</div>
        <div class="sparkle s3 text-xl">✨</div>
        <div class="sparkle s4 text-xl">⭐</div>
      </div>
      
      <div class="flex flex-col items-center gap-4 relative z-10">
        <!-- Glowing animated trophy -->
        <div class="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-yellow-500/30 animate-pulse">
          <Trophy class="w-10 h-10 text-white drop-shadow-md" />
        </div>
        
        <h2 class="text-3xl font-black bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent uppercase tracking-wider">
          LEVEL UP!
        </h2>
        
        <p class="text-sm text-gray-200 font-medium max-w-xs mx-auto">
          Amazing job! You have fully mastered all Everyday Words in Lesson 1!
        </p>
        
        <div class="flex items-center justify-center gap-6 my-4 w-full bg-white/5 py-4 rounded-2xl border border-white/10">
          <div class="flex flex-col">
            <span class="text-xs text-gray-400 uppercase font-bold">Previous</span>
            <span class="text-2xl font-black text-gray-300">Level 1</span>
          </div>
          <div class="text-xl text-amber-400 animate-pulse">➔</div>
          <div class="flex flex-col">
            <span class="text-xs text-amber-400 uppercase font-bold">Current</span>
            <span class="text-2xl font-black text-amber-300">Level 2</span>
          </div>
        </div>
        
        <p class="text-xs text-teal-300 font-bold mb-2">
          🔓 Unlocked: Minna no Nihongo Lesson 2 Vocabulary
        </p>
        
        <button 
          @click="claimLevelUp"
          class="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition shadow-lg hover:shadow-yellow-500/20 hover:-translate-y-0.5 cursor-pointer"
        >
          Claim & View Results
        </button>
      </div>
    </div>
  </div>
</template>
