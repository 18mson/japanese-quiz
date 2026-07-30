<script setup lang="ts">
import { useQuizStore } from '../stores/quizStore';
import { Home, Trophy, Lightbulb, Zap } from '@lucide/vue';

const emit = defineEmits<{
  (e: 'home'): void;
  (e: 'leaderboard'): void;
}>();

const quizStore = useQuizStore();

const formatTimeSaved = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m} Menit ${s} Detik`;
  return `${s} Detik`;
};

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
  <div class="p-2 sm:p-4 max-w-3xl mx-auto animate-slide-up w-full h-full flex flex-col overflow-hidden min-h-0" v-if="quizStore.quizCompleted">
    <h2 class="text-xl text-gray-800 text-center mb-2 font-black flex-shrink-0">Quiz Results</h2>

    <!-- Speed Achievement Celebration Banner -->
    <div 
      v-if="quizStore.speedAchievement && quizStore.speedAchievement.isFaster" 
      class="mb-2 p-3 bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 border border-indigo-400/30 rounded-2xl text-white shadow-md relative overflow-hidden flex-shrink-0 animate-fadeIn"
    >
      <div class="flex items-center gap-3 relative z-10">
        <div class="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner flex-shrink-0">
          <Zap class="w-5 h-5 animate-pulse" />
        </div>
        <div class="text-left flex-1">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-indigo-950 px-2 py-0.5 rounded-full">
              {{ quizStore.speedAchievement.rankText }}
            </span>
            <span class="text-xs text-indigo-200 font-bold">
              +{{ quizStore.speedAchievement.bonusPoints }} Bonus Poin Kecepatan!
            </span>
          </div>
          <h4 class="text-xs font-black text-white mt-0.5">
            Selesai {{ formatTimeSaved(quizStore.speedAchievement.timeSavedSeconds) }} Lebih Cepat Dari Estimasi Target! 🚀
          </h4>
        </div>
      </div>
    </div>

    <!-- New Record Celebration Banner -->
    <div 
      v-if="quizStore.newRecordAchieved" 
      class="mb-2 p-3 bg-gradient-to-r from-amber-500/10 via-yellow-500/20 to-amber-500/10 border border-amber-300 rounded-2xl text-center shadow-md relative overflow-hidden animate-pulse-border flex-shrink-0"
    >
      <div class="flex items-center justify-center gap-2 relative z-10">
        <Trophy class="w-6 h-6 text-amber-500 fill-amber-500/20 drop-shadow" />
        <span class="text-xs font-black text-amber-900 uppercase tracking-wider">New Leaderboard Record!</span>
      </div>
    </div>
    
    <!-- Score Circle & Message Header -->
    <div class="flex items-center justify-center gap-4 mb-3 flex-shrink-0 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
      <div class="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-teal-400 flex flex-col items-center justify-center shadow-md border-2 border-white flex-shrink-0">
        <span class="text-lg font-black text-white leading-none">{{ Math.min(100, Math.round(quizStore.finalScore)) }}%</span>
      </div>
      <div class="text-left flex-1 min-w-0">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Akurasi Jawaban</h3>
        <p class="text-xs sm:text-sm text-gray-700 font-bold leading-tight mt-0.5 truncate">{{ getScoreMessage() }}</p>
      </div>
    </div>
    
    <!-- Question Summary List Box (Flex-1 for maximum scrolling area) -->
    <div class="bg-white rounded-2xl p-3 border border-gray-200 flex-1 flex flex-col overflow-hidden min-h-0 shadow-sm">
      <div class="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 flex-shrink-0">
        <h3 class="text-xs font-black text-gray-800 uppercase tracking-wider">Ringkasan Jawaban Soal</h3>
        <span class="text-[10px] font-bold text-gray-400">{{ quizStore.userAnswers.length }} Soal Selesai</span>
      </div>

      <ul class="space-y-2 flex-1 overflow-y-auto pr-1 min-h-0 pb-20">
        <li 
          v-for="(answer, index) in quizStore.userAnswers" 
          :key="index"
          class="flex items-center p-2.5 rounded-xl bg-gray-50/70 border border-gray-150 transition-all duration-200 hover:bg-white hover:shadow-sm"
          :class="{ 
            'border-l-4 border-emerald-500': answer.pointsEarned === 4, 
            'border-l-4 border-indigo-500': answer.pointsEarned >= 2 && answer.pointsEarned < 4, 
            'border-l-4 border-amber-500': answer.pointsEarned === 1,
            'border-l-4 border-rose-500': answer.pointsEarned === 0 
          }"
        >
          <!-- SVG Circular Progress around Character -->
          <div class="relative w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0 bg-white rounded-full border border-gray-150 shadow-inner">
            <svg class="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="20" cy="20" r="17" stroke="#f3f4f6" stroke-width="3" fill="transparent" />
              <circle 
                cx="20" 
                cy="20" 
                r="17" 
                :stroke="getProgressColor(answer)" 
                stroke-width="3" 
                fill="transparent" 
                :stroke-dasharray="2 * Math.PI * 17" 
                :stroke-dashoffset="2 * Math.PI * 17 * (1 - (answer.pointsEarned || 0) / 4)" 
                stroke-linecap="round"
                class="transition-all duration-500 ease-out"
              />
            </svg>
            <span 
              class="font-black text-gray-800 z-10 select-none text-center" 
              :class="answer.character.length > 4 ? 'text-[8px] leading-tight max-w-[28px] truncate' : 'text-xs'"
            >
              {{ answer.character }}
            </span>
          </div>

          <div class="flex-1 flex flex-col min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <!-- Correct/Incorrect badge -->
              <span class="font-extrabold text-[11px]" :class="{ 'text-emerald-600': answer.pointsEarned === 4, 'text-indigo-600': answer.pointsEarned >= 1 && answer.pointsEarned < 4, 'text-rose-600': answer.pointsEarned === 0 }">
                {{ answer.pointsEarned === 4 ? 'Dikuasai' : (answer.pointsEarned > 0 ? 'Benar' : 'Salah') }}
              </span>
              
              <!-- Points score badge -->
              <span class="text-[9px] font-bold px-1.5 py-0.2 rounded" :class="{ 'bg-emerald-100 text-emerald-800': answer.pointsEarned === 4, 'bg-indigo-100 text-indigo-800': answer.pointsEarned >= 2 && answer.pointsEarned < 4, 'bg-amber-100 text-amber-800': answer.pointsEarned === 1, 'bg-rose-100 text-rose-800': answer.pointsEarned === 0 }">
                {{ answer.pointsEarned }}/4 poin
              </span>

              <!-- Typo badge -->
              <span v-if="answer.isTypo" class="text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.2 rounded">
                Salah Ketik
              </span>

              <!-- Hints badge -->
              <span v-if="answer.hintsUsed > 0" class="text-[9px] font-bold bg-violet-100 text-violet-800 px-1.5 py-0.2 rounded flex items-center gap-1">
                <Lightbulb class="w-2.5 h-2.5 text-violet-800" />
                <span>{{ answer.hintsUsed }} Petunjuk</span>
              </span>

              <!-- Kana reading badge -->
              <span v-if="answer.kana" class="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded-full border border-indigo-100/50">
                {{ answer.kana }}
              </span>
            </div>

            <span class="text-[11px] text-gray-600 mt-0.5 truncate">
              <template v-if="answer.isCorrect">
                {{ quizStore.isTypingMode ? 'Ketik:' : 'Pilih:' }} <code class="font-mono bg-gray-200/70 px-1 py-0.5 rounded text-[10px]">{{ answer.userRomaji }}</code>
              </template>
              <template v-else>
                {{ quizStore.isTypingMode ? 'Ketik:' : 'Pilih:' }} <code class="font-mono bg-rose-50 text-rose-700 px-1 py-0.5 rounded text-[10px]">{{ answer.userRomaji }}</code> | Benar: <code class="font-mono bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded text-[10px] font-semibold">{{ answer.correctRomaji }}</code>
              </template>
            </span>
            <span v-if="answer.meaning" class="text-[9px] text-gray-400 italic truncate">
              Arti: {{ answer.meaning }}
            </span>
          </div>
        </li>
      </ul>
    </div>
    
    <!-- Fixed/Pinned Bottom Action Bar -->
    <div class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 py-3.5 px-6 flex justify-center items-center shadow-lg z-30 w-full animate-fadeIn">
      <div class="max-w-xs sm:max-w-sm w-full flex items-center justify-center gap-3">
        <button 
          class="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition shadow hover:-translate-y-0.5 cursor-pointer flex items-center justify-center w-11 h-11 flex-shrink-0"
          @click="emit('home')"
          title="Go to Home"
        >
          <Home class="w-5 h-5 text-gray-600" />
        </button>
        
        <button 
          class="flex-1 py-2.5 px-6 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer text-center"
          @click="quizStore.restartQuiz"
        >
          Try Again
        </button>

        <button 
          class="p-2.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl transition shadow hover:-translate-y-0.5 cursor-pointer flex items-center justify-center w-11 h-11 flex-shrink-0"
          @click="emit('leaderboard')"
          title="View Leaderboard"
        >
          <Trophy class="w-5 h-5 text-amber-600" />
        </button>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-border {
  0%, 100% { box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.1), 0 2px 4px -1px rgba(245, 158, 11, 0.06); border-color: rgba(245, 158, 11, 0.3); }
  50% { box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3), 0 4px 6px -2px rgba(245, 158, 11, 0.2); border-color: rgba(245, 158, 11, 0.8); }
}
.animate-pulse-border {
  animation: pulse-border 2s infinite ease-in-out;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}

@keyframes float-sparkle {
  0% { transform: translateY(10px) scale(0.6); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-20px) scale(1); opacity: 0; }
}
.sparkle {
  position: absolute;
  font-size: 14px;
  animation: float-sparkle 2.5s infinite linear;
}
.s1 { top: 10%; left: 15%; animation-delay: 0s; }
.s2 { top: 40%; left: 80%; animation-delay: 0.6s; }
.s3 { top: 70%; left: 25%; animation-delay: 1.2s; }
.s4 { top: 20%; left: 70%; animation-delay: 1.8s; }
</style>
