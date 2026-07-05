<script setup lang="ts">
import { useQuizStore } from '../stores/quizStore';
import { Home, Trophy, Lightbulb } from '@lucide/vue';

const emit = defineEmits<{
  (e: 'home'): void;
  (e: 'leaderboard'): void;
}>();

const quizStore = useQuizStore();

const getProgressColor = (answer: any) => {
  const points = answer.pointsEarned || 0;
  if (points === 4) return '#10b981'; // Emerald
  if (points >= 2) return '#6366f1'; // Indigo
  if (points === 1) return '#f59e0b'; // Amber
  return '#ef4444'; // Red
};

const getScoreMessage = () => {
  const score = quizStore.finalScore;
  const isWords = quizStore.questionType === 'words';
  
  if (score >= 90) return isWords ? 'Outstanding! You\'re an everyday Japanese vocabulary master!' : 'Outstanding! You\'re a Japanese character master!';
  if (score >= 70) return 'Great job! You\'re getting very good at this!';
  if (score >= 50) return 'Nice work! Keep practicing to improve!';
  return 'Good effort! With more practice, you\'ll improve quickly!';
};
</script>

<template>
  <div class="p-4 md:p-6 max-w-3xl mx-auto animate-slide-up w-full h-full flex flex-col overflow-hidden" v-if="quizStore.quizCompleted">
    <h2 class="text-xl text-gray-800 text-center mb-4 font-bold flex-shrink-0">Quiz Results</h2>
    
    <div class="flex flex-col items-center mb-6 flex-shrink-0">
      <div class="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-teal-400 flex items-center justify-center mb-2 shadow-lg border-4 border-white">
        <span class="text-2xl font-bold text-white">{{ Math.round(quizStore.finalScore) }}%</span>
      </div>
      <p class="text-base text-gray-600 text-center max-w-lg font-medium">{{ getScoreMessage() }}</p>
    </div>
    
    <div class="bg-gray-100 rounded-2xl p-4 mb-4 border border-gray-200 flex-1 flex flex-col overflow-hidden">
      <h3 class="text-md text-gray-800 mb-2 pb-2 border-b border-gray-300/70 font-semibold flex-shrink-0">Question Summary</h3>
      <ul class="space-y-2 flex-1 overflow-y-auto pr-1">
        <li 
          v-for="(answer, index) in quizStore.userAnswers" 
          :key="index"
          class="flex items-center p-3 rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow"
          :class="{ 
            'border-l-4 border-emerald-500': answer.pointsEarned === 4, 
            'border-l-4 border-indigo-500': answer.pointsEarned >= 2 && answer.pointsEarned < 4, 
            'border-l-4 border-amber-500': answer.pointsEarned === 1,
            'border-l-4 border-rose-500': answer.pointsEarned === 0 
          }"
        >
          <!-- SVG Circular Progress around Character -->
          <div class="relative w-12 h-12 flex items-center justify-center mr-3 flex-shrink-0 bg-gray-50/50 rounded-full border border-gray-100 shadow-inner">
            <svg class="absolute inset-0 w-full h-full transform -rotate-90">
              <!-- Background track circle -->
              <circle 
                cx="24" 
                cy="24" 
                r="20" 
                stroke="#f3f4f6" 
                stroke-width="3" 
                fill="transparent" 
              />
              <!-- Progress indicator circle -->
              <circle 
                cx="24" 
                cy="24" 
                r="20" 
                :stroke="getProgressColor(answer)" 
                stroke-width="3" 
                fill="transparent" 
                :stroke-dasharray="2 * Math.PI * 20" 
                :stroke-dashoffset="2 * Math.PI * 20 * (1 - (answer.pointsEarned || 0) / 4)" 
                stroke-linecap="round"
                class="transition-all duration-500 ease-out"
              />
            </svg>
            <span 
              class="font-extrabold text-gray-800 z-10 select-none text-center" 
              :class="answer.character.length > 4 ? 'text-[9px] leading-tight max-w-[34px] truncate' : 'text-sm'"
            >
              {{ answer.character }}
            </span>
          </div>

          <div class="flex-1 flex flex-col min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <!-- Correct/Incorrect badge -->
              <span class="font-bold text-xs" :class="{ 'text-emerald-600': answer.pointsEarned === 4, 'text-indigo-600': answer.pointsEarned >= 1 && answer.pointsEarned < 4, 'text-rose-600': answer.pointsEarned === 0 }">
                {{ answer.pointsEarned === 4 ? 'Mastered' : (answer.pointsEarned > 0 ? 'Correct' : 'Incorrect') }}
              </span>
              
              <!-- Points score badge -->
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded" :class="{ 'bg-emerald-100 text-emerald-800': answer.pointsEarned === 4, 'bg-indigo-100 text-indigo-800': answer.pointsEarned >= 2 && answer.pointsEarned < 4, 'bg-amber-100 text-amber-800': answer.pointsEarned === 1, 'bg-rose-100 text-rose-800': answer.pointsEarned === 0 }">
                {{ answer.pointsEarned }}/4 pts
              </span>

              <!-- Typo badge -->
              <span v-if="answer.isTypo" class="text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.5 rounded">
                Typo
              </span>

              <!-- Hints badge -->
              <span v-if="answer.hintsUsed > 0" class="text-[9px] font-bold bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Lightbulb class="w-2.5 h-2.5 text-violet-800" />
                <span>{{ answer.hintsUsed }} Hint{{ answer.hintsUsed > 1 ? 's' : '' }}</span>
              </span>

              <!-- Kana reading badge -->
              <span v-if="answer.kana" class="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/50">
                {{ answer.kana }}
              </span>
            </div>
            <span class="text-xs text-gray-600 mt-0.5 truncate">
              <template v-if="answer.isCorrect">
                {{ quizStore.isTypingMode ? 'You typed:' : 'You chose:' }} <code class="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">{{ answer.userRomaji }}</code>
              </template>
              <template v-else>
                {{ quizStore.isTypingMode ? 'You typed:' : 'You chose:' }} <code class="font-mono bg-rose-50 text-rose-700 px-1 py-0.5 rounded text-[10px]">{{ answer.userRomaji }}</code> <span v-if="answer.isTypo" class="text-[9px] font-bold bg-amber-100 text-amber-800 px-1 py-0.5 rounded ml-1">Typo</span> | Correct: <code class="font-mono bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded text-[10px] font-semibold">{{ answer.correctRomaji }}</code>
              </template>
            </span>
            <span v-if="answer.meaning" class="text-[10px] text-gray-500 italic mt-0.5">
              Meaning: {{ answer.meaning }}
            </span>
          </div>
        </li>
      </ul>
    </div>
    
    <div class="flex items-center justify-center gap-3 w-full max-w-sm mx-auto mt-2 flex-shrink-0">
      <!-- Home Icon Button -->
      <button 
        class="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition shadow hover:-translate-y-0.5 cursor-pointer flex items-center justify-center w-12 h-12"
        @click="emit('home')"
        title="Go to Home"
      >
        <Home class="w-5 h-5 text-gray-600" />
      </button>
      
      <!-- Try Again Button (center/main) -->
      <button 
        class="flex-1 py-3 px-6 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer text-center"
        @click="quizStore.restartQuiz"
      >
        Try Again
      </button>

      <!-- Leaderboard Icon Button -->
      <button 
        class="p-2.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl transition shadow hover:-translate-y-0.5 cursor-pointer flex items-center justify-center w-12 h-12"
        @click="emit('leaderboard')"
        title="View Leaderboard"
      >
        <Trophy class="w-5 h-5 text-amber-600" />
      </button>
    </div>
  </div>
</template>

<style>
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
