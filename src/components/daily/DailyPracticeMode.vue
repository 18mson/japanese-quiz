<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  ArrowLeft, CalendarDays, Lock, LogIn, RotateCcw, 
  AlertTriangle, Sparkles 
} from '@lucide/vue';
import { useDailyPracticeStore } from '../../stores/dailyPracticeStore';
import { useAuthStore } from '../../stores/authStore';
import ChapterPicker from './ChapterPicker.vue';
import PracticeView from './PracticeView.vue';
import QuotaExhaustedView from './QuotaExhaustedView.vue';
import PoolLowAlert from './PoolLowAlert.vue';
import { getChapterTitle } from '../../constants/dailyChapters';

const emit = defineEmits<{
  (e: 'exit'): void;
  (e: 'openAuth'): void;
}>();

const dailyStore = useDailyPracticeStore();
const authStore = useAuthStore();

const isReviewing = ref(false);
const isAddingSecondChapter = ref(false);
const isChapterCompletionScreen = ref(false);

onMounted(async () => {
  if (authStore.user) {
    await dailyStore.checkTodaySession();
  }
});

async function handleStartChapterSession(chapterIds: number[]) {
  const success = await dailyStore.startNewSession(chapterIds);
  if (success) {
    isReviewing.value = false;
    isAddingSecondChapter.value = false;
    isChapterCompletionScreen.value = false;
  }
}

async function handleAddSecondChapter(chapterIds: number[]) {
  const newChapter = chapterIds[0];
  if (!newChapter) return;
  const currentChapters = dailyStore.session?.chapter_ids || [];
  const updatedChapters = [...currentChapters, newChapter];
  const success = await dailyStore.startNewSession(updatedChapters);
  if (success) {
    isAddingSecondChapter.value = false;
    isReviewing.value = false;
    isChapterCompletionScreen.value = false;
  }
}

async function handleSubmit(text: string, inputMethod: 'text' | 'voice') {
  await dailyStore.submitCurrentAnswer(text, inputMethod);
}

const allQuestionsCompleted = computed(() => {
  return dailyStore.questions.length > 0 && dailyStore.questions.every(q => q.is_correct);
});

function handleNext() {
  if (dailyStore.currentIndex < dailyStore.totalQuestions - 1) {
    dailyStore.nextQuestion();
  } else if (allQuestionsCompleted.value) {
    isChapterCompletionScreen.value = true;
    if (!dailyStore.canAddChapter) {
      dailyStore.quotaExhausted = true;
    }
  }
}

function handleFinish() {
  if (!dailyStore.canAddChapter) {
    dailyStore.quotaExhausted = true;
  } else {
    isChapterCompletionScreen.value = true;
  }
}

function handleRetry() {
  dailyStore.checkTodaySession();
}
</script>

<template>
  <div class="min-h-screen h-full w-full bg-slate-50 dark:bg-slate-950 flex flex-col justify-between overflow-y-auto text-slate-900 dark:text-slate-100 transition-colors duration-200">
    <!-- Top Global App Bar for Daily Mode -->
    <header class="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-xs flex-shrink-0 z-20">
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Back button -->
        <button
          type="button"
          @click="emit('exit')"
          class="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
          title="Kembali ke Beranda"
        >
          <ArrowLeft class="w-4 h-4" />
          <span class="hidden sm:inline">Kembali</span>
        </button>

        <!-- Brand / Mode Title -->
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/20 dark:border-amber-400/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <CalendarDays class="w-4 h-4" />
          </div>
          <div>
            <h1 class="text-xs sm:text-sm font-black tracking-tight leading-none text-slate-900 dark:text-slate-100">
              Latihan Kalimat Harian
            </h1>
            <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              日課 • Maks 2 Bab per Hari
            </span>
          </div>
        </div>
      </div>

      <!-- Right Header: Chapter Topics (Keterangan bab, ringkas di mobile) -->
      <div class="flex items-center gap-1 sm:gap-1.5 max-w-[140px] sm:max-w-none justify-end">
        <template v-if="dailyStore.session">
          <div 
            v-for="ch in dailyStore.session.chapter_ids" 
            :key="ch"
            class="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs truncate"
            :title="`Bab ${ch}: ${getChapterTitle(ch)}`"
          >
            <span class="hidden sm:inline truncate">{{ getChapterTitle(ch) }}</span>
            <span class="sm:hidden font-black">Bab {{ ch }}</span>
          </div>
        </template>
      </div>
    </header>

    <!-- Main Content Area (Centered vertically between header and footer) -->
    <main class="flex-1 w-full max-w-5xl lg:max-w-6xl mx-auto px-1.5 sm:px-6 py-2 sm:py-4 flex flex-col justify-center items-center relative">
      <!-- 1. NOT AUTHENTICATED -->
      <div v-if="!authStore.user" class="my-auto w-full max-w-md mx-auto bg-white/90 dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 flex flex-col items-center text-center animate-fadeIn">
        <div class="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
          <Lock class="w-7 h-7" />
        </div>
        <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mb-2">
          Masuk untuk Latihan Harian
        </h2>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          Fitur Latihan Kalimat Harian memerlukan akun terdaftar agar kuota harian dan progres kalimat kamu tersimpan secara aman di cloud.
        </p>
        <button
          type="button"
          @click="emit('openAuth')"
          class="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 dark:bg-torii dark:hover:bg-torii-hover text-white font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition active:scale-95"
        >
          <LogIn class="w-4 h-4" />
          <span>Masuk / Daftar Akun Sekarang</span>
        </button>
      </div>

      <!-- 2. LOADING STATE -->
      <div v-else-if="dailyStore.loading" class="my-auto flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
        <div class="w-10 h-10 border-4 border-indigo-600 dark:border-torii border-t-transparent rounded-full animate-spin mb-3"></div>
        <span class="text-xs sm:text-sm font-bold">Menyiapkan Latihan Kalimat Harian...</span>
      </div>

      <!-- 3. ERROR STATE -->
      <div v-else-if="dailyStore.error" class="my-auto w-full max-w-md mx-auto bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-3xl p-6 text-center animate-fadeIn">
        <AlertTriangle class="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 class="text-base font-bold text-rose-900 dark:text-rose-200 mb-1">
          Gagal Memuat Latihan
        </h3>
        <p class="text-xs text-rose-700 dark:text-rose-300 mb-4">
          {{ dailyStore.error }}
        </p>
        <button
          type="button"
          @click="handleRetry"
          class="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition flex items-center gap-1.5 mx-auto cursor-pointer shadow-xs"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Coba Lagi</span>
        </button>
      </div>

      <!-- 4. CHAPTER PICKER UNTUK BAB KE-2 / BAB TAMBAHAN -->
      <ChapterPicker
        v-else-if="isAddingSecondChapter"
        :loading="dailyStore.loading"
        :existing-chapters="dailyStore.session?.chapter_ids || []"
        :is-adding-extra="true"
        @start="handleAddSecondChapter"
        @cancel="isAddingSecondChapter = false"
      />

      <!-- 5. QUOTA EXHAUSTED / CHAPTER COMPLETED VIEW -->
      <QuotaExhaustedView
        v-else-if="(dailyStore.quotaExhausted || isChapterCompletionScreen || (allQuestionsCompleted && !isReviewing)) && !isReviewing"
        :resets-at="dailyStore.resetsAt"
        :total-questions="dailyStore.totalQuestions"
        :correct-count="dailyStore.correctCount"
        :can-add-chapter="dailyStore.canAddChapter"
        :chapters-used="dailyStore.session?.chapter_ids || []"
        @exit="emit('exit')"
        @review="() => { isReviewing = true; isChapterCompletionScreen = false; }"
        @add-chapter="isAddingSecondChapter = true"
      />

      <!-- 6. CHAPTER PICKER AWAL (BELUM ADA SESI) -->
      <ChapterPicker
        v-else-if="!dailyStore.session"
        :loading="dailyStore.loading"
        @start="handleStartChapterSession"
      />

      <!-- 6. ACTIVE SESSION / PRACTICE RUNNER (OR REVIEW MODE) -->
      <div v-else-if="dailyStore.currentQuestion" class="flex-1 w-full flex flex-col justify-between">
        <!-- Review Mode Banner -->
        <div v-if="isReviewing" class="w-full max-w-2xl mx-auto mb-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
          <div class="flex items-center gap-2">
            <Sparkles class="w-4 h-4 text-indigo-500" />
            <span>Mode Tinjau Soal Selesai</span>
          </div>
          <button
            type="button"
            @click="isReviewing = false"
            class="text-xs text-indigo-600 dark:text-torii underline cursor-pointer"
          >
            Kembali ke Status Kuota
          </button>
        </div>

        <!-- Alert: Pool Low / Recycled -->
        <PoolLowAlert 
          :pool-low="dailyStore.poolLowWarning" 
          :recycled="dailyStore.recycledNotice" 
        />

        <!-- Question Dots Progress Strip (Compact & responsive on mobile) -->
        <div class="w-full max-w-2xl mx-auto mb-2 sm:mb-3 flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto py-1 px-1">
          <button
            v-for="(q, idx) in dailyStore.questions"
            :key="q.daily_question_id"
            type="button"
            @click="dailyStore.jumpToQuestion(idx)"
            :class="[
              'h-7 w-7 sm:h-8 sm:w-8 min-w-[26px] sm:min-w-[32px] p-0 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center cursor-pointer select-none border shrink-0',
              dailyStore.currentIndex === idx
                ? 'ring-2 ring-indigo-500/70 dark:ring-torii scale-110 shadow-xs'
                : 'opacity-80 hover:opacity-100',
              q.is_correct
                ? 'bg-emerald-500 text-white border-emerald-600'
                : (q.attempts > 0 
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700')
            ]"
            :title="`Soal ${idx + 1}: ${q.is_correct ? 'Benar' : (q.attempts > 0 ? 'Salah' : 'Belum Dijawab')}`"
          >
            {{ idx + 1 }}
          </button>
        </div>

        <!-- Main Question Card & Input Area -->
        <PracticeView
          :question="dailyStore.currentQuestion"
          :question-index="dailyStore.currentIndex"
          :total-questions="dailyStore.totalQuestions"
          :all-completed="allQuestionsCompleted"
          :submitting="dailyStore.submitting"
          :revealed-answer="dailyStore.currentRevealedAnswer"
          :auto-kana="dailyStore.autoKana"
          :is-reviewing="isReviewing"
          @submit="handleSubmit"
          @next="handleNext"
          @prev="dailyStore.prevQuestion"
          @finish="isReviewing ? (isReviewing = false) : handleFinish()"
          @toggle-auto-kana="dailyStore.toggleAutoKana"
        />
      </div>
    </main>

    <!-- Tatoeba Attribution Footer (Selalu di paling bawah layar) -->
    <footer class="w-full mt-auto py-3.5 px-4 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-[11px] text-slate-400 dark:text-slate-500 select-none shrink-0 bg-transparent">
      Sebagian kalimat latihan bersumber dari data terbuka 
      <a 
        href="https://tatoeba.org" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="underline hover:text-slate-600 dark:hover:text-slate-300 transition"
      >
        Tatoeba Project
      </a> 
      (lisensi CC BY 2.0 FR).
    </footer>
  </div>
</template>

<style scoped>
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-fadeIn { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>
