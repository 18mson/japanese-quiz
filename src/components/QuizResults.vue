<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { Home, Trophy, Lightbulb, Zap } from '@lucide/vue';

const emit = defineEmits<{
  (e: 'home'): void;
  (e: 'leaderboard'): void;
}>();

const quizStore = useQuizStore();

const focusedButtonIndex = ref(1); // 0: Home, 1: Try Again, 2: Leaderboard
const isKeyboardNav = ref(false);
const listRef = ref<HTMLElement | null>(null);

const deactivateKeyboardNav = () => {
  isKeyboardNav.value = false;
};

const handleKeydown = (event: KeyboardEvent) => {
  if (!quizStore.quizCompleted) return;

  const target = event.target as HTMLElement | null;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
    return;
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    isKeyboardNav.value = true;
    focusedButtonIndex.value = (focusedButtonIndex.value + 1) % 3;
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    isKeyboardNav.value = true;
    focusedButtonIndex.value = (focusedButtonIndex.value - 1 + 3) % 3;
  } else if (event.key === 'ArrowDown') {
    if (listRef.value) {
      listRef.value.scrollBy({ top: 100, behavior: 'smooth' });
    }
  } else if (event.key === 'ArrowUp') {
    if (listRef.value) {
      listRef.value.scrollBy({ top: -100, behavior: 'smooth' });
    }
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    if (focusedButtonIndex.value === 0) {
      emit('home');
    } else if (focusedButtonIndex.value === 1) {
      quizStore.restartQuiz();
    } else if (focusedButtonIndex.value === 2) {
      emit('leaderboard');
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('pointerdown', deactivateKeyboardNav);
  window.addEventListener('touchstart', deactivateKeyboardNav);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('pointerdown', deactivateKeyboardNav);
  window.removeEventListener('touchstart', deactivateKeyboardNav);
});

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

const displayAccuracy = computed(() => {
  if (quizStore.sentenceStats) {
    return Math.round(quizStore.sentenceStats.accuracy);
  }
  return Math.min(100, Math.round(quizStore.finalScore));
});

const getScoreMessage = () => {
  const score = displayAccuracy.value;
  if (quizStore.questionType === 'sentences' || quizStore.sentenceStats) {
    if (score >= 90) return 'Luar biasa! Pengetikan kalimat Bahasa Jepang sangat akurat!';
    if (score >= 70) return 'Bagus sekali! Pengetikan kalimat makin lancar!';
    if (score >= 50) return 'Cukup baik! Tingkatkan lagi keakuratan pengetikan.';
    return 'Tetap semangat! Teruskan latihan mengetik kalimat Bahasa Jepang.';
  }
  const isWords = quizStore.questionType === 'words';
  
  if (score >= 90) return isWords ? 'Outstanding! You\'re an everyday Japanese vocabulary master!' : 'Outstanding! You\'re a Japanese character master!';
  if (score >= 70) return 'Great job! You\'re getting very good at this!';
  if (score >= 50) return 'Nice work! Keep practicing to improve!';
  return 'Good effort! With more practice, you\'ll improve quickly!';
};

import { TierTransition } from '../utils/masteryStats';

const masteredPromotions = computed(() => {
  return quizStore.sessionTierChanges.filter((t: TierTransition) => t.newTier === 'mastered' && t.direction === 'up');
});

const crownPromotions = computed(() => {
  return quizStore.sessionTierChanges.filter((t: TierTransition) => t.newTier === 'crown' && t.direction === 'up');
});

const demotions = computed(() => {
  return quizStore.sessionTierChanges.filter((t: TierTransition) => t.direction === 'down');
});

const hasTierChanges = computed(() => {
  return quizStore.sessionTierChanges.length > 0;
});
</script>

<template>
  <div class="p-2 sm:p-4 max-w-3xl mx-auto animate-slide-up w-full h-full flex flex-col overflow-hidden min-h-0" v-if="quizStore.quizCompleted">
    <h2 class="text-xl text-gray-800 dark:text-slate-100 text-center mb-2 font-black flex-shrink-0">Quiz Results</h2>

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
      class="mb-2 p-3 bg-gradient-to-r from-amber-500/10 via-yellow-500/20 to-amber-500/10 border border-amber-300 dark:border-amber-500/40 rounded-2xl text-center shadow-md relative overflow-hidden animate-pulse-border flex-shrink-0"
    >
      <div class="flex items-center justify-center gap-2 relative z-10">
        <Trophy class="w-6 h-6 text-amber-500 fill-amber-500/20 drop-shadow" />
        <span class="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">New Leaderboard Record!</span>
      </div>
    </div>

    <!-- Tier Transition Recap Banner -->
    <div 
      v-if="hasTierChanges" 
      class="mb-3 p-3.5 bg-slate-900/90 dark:bg-slate-950 border border-slate-800 rounded-2xl shadow-sm text-left animate-fadeIn flex-shrink-0"
    >
      <h4 class="text-xs font-black uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
        <Sparkles class="w-4 h-4 text-amber-400" />
        <span>Perubahan Tier (Sesi Ini)</span>
      </h4>

      <div class="flex flex-col gap-1.5 text-xs text-slate-200">
        <!-- Crown promotions -->
        <div v-if="crownPromotions.length > 0" class="flex items-center gap-2 font-bold text-amber-300 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
          <span>👑 {{ crownPromotions.length }} huruf naik ke Crown:</span>
          <span class="font-jp text-base font-black tracking-widest text-amber-200">
            {{ crownPromotions.map((t: TierTransition) => t.character).join(' ') }}
          </span>
        </div>

        <!-- Mastered promotions -->
        <div v-if="masteredPromotions.length > 0" class="flex items-center gap-2 font-semibold text-emerald-300 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
          <span>🟢 {{ masteredPromotions.length }} huruf naik ke Hafal:</span>
          <span class="font-jp text-base font-bold tracking-widest text-emerald-200">
            {{ masteredPromotions.map((t: TierTransition) => t.character).join(' ') }}
          </span>
        </div>

        <!-- Demotions -->
        <div v-if="demotions.length > 0" class="flex items-center gap-2 font-medium text-rose-300 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
          <span>🔁 {{ demotions.length }} huruf perlu diulang lagi:</span>
          <span class="font-jp text-base font-bold tracking-widest text-rose-200">
            {{ demotions.map((t: TierTransition) => t.character).join(' ') }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Sentence Typing Custom Stats Banner -->
    <div 
      v-if="quizStore.sentenceStats"
      class="mb-3 grid grid-cols-3 gap-1.5 sm:gap-3 bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white rounded-2xl p-3 sm:p-4 shadow-sm flex-shrink-0 text-center"
    >
      <div class="flex flex-col justify-center">
        <span class="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Kecepatan</span>
        <span class="text-xl sm:text-2xl font-black text-amber-400 my-0.5">{{ quizStore.sentenceStats.cpm }} <span class="text-xs font-normal text-slate-300">CPM</span></span>
        <span class="text-[11px] sm:text-xs text-slate-400">{{ quizStore.sentenceStats.wpm }} WPM</span>
      </div>
      <div class="flex flex-col justify-center border-x border-slate-800">
        <span class="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Akurasi</span>
        <span class="text-xl sm:text-2xl font-black text-emerald-400 my-0.5">{{ quizStore.sentenceStats.accuracy }}%</span>
        <span class="text-[11px] sm:text-xs text-slate-400">{{ quizStore.sentenceStats.errorCount }} Salah Ketik</span>
      </div>
      <div class="flex flex-col justify-center">
        <span class="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Total Ketikan</span>
        <span class="text-xl sm:text-2xl font-black text-indigo-300 my-0.5">{{ quizStore.sentenceStats.totalKeystrokes }}</span>
        <span class="text-[11px] sm:text-xs text-slate-400">Karakter</span>
      </div>
    </div>
    
    <!-- Score Circle & Message Header -->
    <div class="flex items-center justify-center gap-3 sm:gap-4 mb-3 flex-shrink-0 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
      <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-indigo-600 to-teal-400 flex flex-col items-center justify-center shadow-md border-2 border-white dark:border-slate-800 flex-shrink-0">
        <span class="text-base sm:text-lg font-black text-white leading-none">{{ displayAccuracy }}%</span>
      </div>
      <div class="text-left flex-1 min-w-0">
        <h3 class="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">Akurasi Jawaban</h3>
        <p class="text-xs sm:text-sm text-gray-800 dark:text-slate-100 font-bold leading-snug mt-0.5 break-words">{{ getScoreMessage() }}</p>
      </div>
    </div>
    
    <!-- Question Summary List Box (Flex-1 for maximum scrolling area) -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-gray-200 dark:border-slate-800 flex-1 flex flex-col overflow-hidden min-h-0 shadow-sm">
      <div class="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
        <h3 class="text-xs sm:text-xs font-black text-gray-800 dark:text-slate-100 uppercase tracking-wider">Ringkasan Jawaban Soal</h3>
        <span class="text-xs font-bold text-gray-400 dark:text-slate-400">{{ quizStore.userAnswers.length }} Soal Selesai</span>
      </div>

      <ul ref="listRef" class="space-y-2 flex-1 overflow-y-auto pr-1 min-h-0 scroll-smooth">
        <li 
          v-for="(answer, index) in quizStore.userAnswers" 
          :key="index"
          class="flex items-start p-3 sm:p-3.5 rounded-xl bg-gray-50/70 dark:bg-slate-800/70 border border-gray-150 dark:border-slate-700/80 transition-all duration-200 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"
          :class="{ 
            'border-l-4 border-emerald-500': answer.pointsEarned === 4 || answer.isCorrect, 
            'border-l-4 border-indigo-500': answer.pointsEarned >= 2 && answer.pointsEarned < 4, 
            'border-l-4 border-amber-500': answer.pointsEarned === 1,
            'border-l-4 border-rose-500': !answer.isCorrect && (answer.pointsEarned === 0 || !answer.pointsEarned)
          }"
        >
          <!-- SVG Circular Progress around Character / Index Number -->
          <div class="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center mr-3 flex-shrink-0 bg-white dark:bg-slate-900 rounded-full border border-gray-150 dark:border-slate-700 shadow-inner mt-0.5">
            <svg class="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15" stroke="#f3f4f6" class="dark:stroke-slate-700" stroke-width="3" fill="transparent" />
              <circle 
                cx="18" 
                cy="18" 
                r="15" 
                :stroke="getProgressColor(answer)" 
                stroke-width="3" 
                fill="transparent" 
                :stroke-dasharray="2 * Math.PI * 15" 
                :stroke-dashoffset="(quizStore.questionType === 'sentences' || quizStore.sentenceStats) ? (answer.isCorrect ? 0 : 2 * Math.PI * 15) : (2 * Math.PI * 15 * (1 - (answer.pointsEarned || 0) / 4))" 
                stroke-linecap="round"
                class="transition-all duration-500 ease-out"
              />
            </svg>
            <span 
              class="font-black text-gray-800 dark:text-slate-100 z-10 select-none text-center" 
              :class="answer.character.length > 4 ? 'text-xs font-bold text-gray-600 dark:text-slate-300' : 'text-xs sm:text-sm font-bold'"
            >
              {{ answer.character.length > 4 ? `#${index + 1}` : answer.character }}
            </span>
          </div>

          <div class="flex-1 flex flex-col min-w-0">
            <!-- Full Japanese sentence title if character is long -->
            <h4 v-if="answer.character.length > 4" class="text-sm sm:text-base font-bold text-gray-900 dark:text-slate-100 leading-snug font-japanese mb-1 break-words">
              {{ answer.character }}
            </h4>

            <div class="flex items-center gap-1.5 flex-wrap">
              <!-- Correct/Incorrect badge -->
              <span 
                class="font-extrabold text-xs sm:text-xs" 
                :class="[
                  (quizStore.questionType === 'sentences' || quizStore.sentenceStats)
                    ? (answer.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')
                    : (answer.pointsEarned === 4 ? 'text-emerald-600 dark:text-emerald-400' : (answer.pointsEarned >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'))
                ]"
              >
                <template v-if="quizStore.questionType === 'sentences' || quizStore.sentenceStats">
                  {{ answer.isCorrect ? (answer.isTypo ? 'Selesai (Typo)' : 'Selesai') : 'Belum Tepat' }}
                </template>
                <template v-else>
                  {{ answer.pointsEarned === 4 ? 'Dikuasai' : (answer.pointsEarned > 0 ? 'Benar' : 'Salah') }}
                </template>
              </span>
              
              <!-- Points score badge (Only for Non-Sentence modes) -->
              <span 
                v-if="quizStore.questionType !== 'sentences' && !quizStore.sentenceStats"
                class="text-xs font-bold px-1.5 py-0.5 rounded" 
                :class="{ 
                  'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300': answer.pointsEarned === 4, 
                  'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300': answer.pointsEarned >= 2 && answer.pointsEarned < 4, 
                  'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300': answer.pointsEarned === 1, 
                  'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300': answer.pointsEarned === 0 
                }"
              >
                {{ answer.pointsEarned }}/4 poin
              </span>

              <!-- Typo badge -->
              <span v-if="answer.isTypo" class="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.5 rounded">
                Salah Ketik
              </span>

              <!-- Hints badge -->
              <span v-if="answer.hintsUsed > 0" class="text-xs font-bold bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Lightbulb class="w-3 h-3 text-violet-800 dark:text-violet-300" />
                <span>{{ answer.hintsUsed }} Petunjuk</span>
              </span>

              <!-- Kana reading badge -->
              <span v-if="answer.kana" class="text-xs font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-100/50 dark:border-indigo-800">
                {{ answer.kana }}
              </span>
            </div>

            <span class="text-xs text-gray-700 dark:text-slate-300 mt-1 leading-normal break-words">
              <template v-if="answer.isCorrect">
                {{ quizStore.isTypingMode ? 'Ketik:' : 'Pilih:' }} <code class="font-mono bg-gray-200/70 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs text-gray-900 dark:text-slate-100 font-medium">{{ answer.userRomaji }}</code>
              </template>
              <template v-else>
                {{ quizStore.isTypingMode ? 'Ketik:' : 'Pilih:' }} <code class="font-mono bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded text-xs font-medium">{{ answer.userRomaji }}</code> | Benar: <code class="font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded text-xs font-semibold">{{ answer.correctRomaji }}</code>
              </template>
            </span>
            <span v-if="answer.meaning" class="text-xs text-gray-500 dark:text-slate-400 italic mt-0.5 leading-snug break-words">
              Arti: {{ answer.meaning }}
            </span>
          </div>
        </li>
      </ul>
    </div>
    
    <!-- Fixed/Pinned Bottom Action Bar -->
    <div class="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 py-3.5 px-4 sm:px-6 flex justify-center items-center shadow-lg z-30 w-full animate-fadeIn">
      <div class="max-w-xs sm:max-w-sm w-full flex items-center justify-center gap-3">
        <!-- Home Button (Index 0) -->
        <button 
          class="p-2.5 rounded-xl transition-all shadow hover:-translate-y-0.5 cursor-pointer flex items-center justify-center w-11 h-11 flex-shrink-0 border"
          :class="[
            isKeyboardNav && focusedButtonIndex === 0
              ? 'ring-2 ring-indigo-400 dark:ring-indigo-400 border-indigo-400 bg-indigo-50 dark:bg-slate-700 scale-[1.05]'
              : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700'
          ]"
          @click="deactivateKeyboardNav(); emit('home');"
          title="Go to Home"
        >
          <Home class="w-5 h-5 text-gray-600 dark:text-slate-300" />
        </button>
        
        <!-- Try Again Button (Index 1) -->
        <button 
          class="flex-1 py-2.5 px-6 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer text-center"
          :class="[
            isKeyboardNav && focusedButtonIndex === 1
              ? 'ring-2 ring-indigo-400/90 dark:ring-indigo-300 border-indigo-400 scale-[1.02] bg-indigo-700'
              : ''
          ]"
          @click="deactivateKeyboardNav(); quizStore.restartQuiz();"
        >
          Main Lagi
        </button>

        <!-- Leaderboard Button (Index 2) -->
        <button 
          class="p-2.5 rounded-xl transition-all shadow hover:-translate-y-0.5 cursor-pointer flex items-center justify-center w-11 h-11 flex-shrink-0 border"
          :class="[
            isKeyboardNav && focusedButtonIndex === 2
              ? 'ring-2 ring-amber-400 dark:ring-amber-500 border-amber-400 bg-amber-200 dark:bg-amber-900/80 scale-[1.05]'
              : 'bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
          ]"
          @click="deactivateKeyboardNav(); emit('leaderboard');"
          title="View Leaderboard"
        >
          <Trophy class="w-5 h-5 text-amber-600 dark:text-amber-400" />
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
