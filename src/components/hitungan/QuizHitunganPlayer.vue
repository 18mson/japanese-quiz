<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useHitunganQuiz } from '../../composables/useHitunganQuiz';
import { HITUNGAN_WAVES, type HitunganWaveDef } from '../../data/hitunganWaves';
import HitunganTutorialModal from './HitunganTutorialModal.vue';
import NumberKeypad from './NumberKeypad.vue';
import VirtualKeyboard from '../VirtualKeyboard.vue';
import SpeakerButton from '../SpeakerButton.vue';
import * as wanakana from 'wanakana';
import { 
  Flame, 
  BookOpen, 
  ArrowRight, 
  RotateCcw, 
  Home, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  LogOut,
  Trophy
} from '@lucide/vue';
import { useTextToSpeech } from '../../composables/useTextToSpeech';

const props = defineProps<{
  initialWave: HitunganWaveDef;
  initialDirection: 'number_to_kana' | 'kana_to_number';
  unlockedWaveKeys?: string[];
}>();

const emit = defineEmits<{
  (e: 'exit'): void;
}>();

const { speak } = useTextToSpeech();
const isTutorialOpen = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

const {
  currentWave,
  direction,
  currentQuestion,
  questionNumber,
  totalQuestions,
  streak,
  correctCount,
  userInput,
  isAnswerChecked,
  isCorrect,
  isQuizFinished,
  startSession,
  submitAnswer,
  handleProceed,
} = useHitunganQuiz(props.initialWave, props.initialDirection, props.unlockedWaveKeys || []);

// Auto focus text input on number_to_kana (only on desktop to prevent mobile keyboard popups)
const focusTextInput = () => {
  nextTick(() => {
    if (direction.value === 'number_to_kana' && inputRef.value && !isAnswerChecked.value) {
      if (typeof window !== 'undefined' && window.innerWidth >= 640) {
        inputRef.value.focus();
      }
    }
  });
};

// Handle physical keyboard input with IMEMode to correctly process 'n' vs 'na', 'ni', etc.
const handleTextInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  userInput.value = wanakana.toHiragana(target.value.toLowerCase(), { IMEMode: true });
  target.value = userInput.value;
};

// Handle mobile VirtualKeyboard input with IMEMode
const handleVirtualKey = (char: string) => {
  if (isAnswerChecked.value) return;
  userInput.value = wanakana.toHiragana(userInput.value + char.toLowerCase(), { IMEMode: true });
  if (inputRef.value) {
    inputRef.value.value = userInput.value;
  }
};

const handleVirtualBackspace = () => {
  if (isAnswerChecked.value) return;
  if (userInput.value.length > 0) {
    userInput.value = userInput.value.slice(0, -1);
    if (inputRef.value) {
      inputRef.value.value = userInput.value;
    }
  }
};

const handleVirtualEnter = () => {
  if (isAnswerChecked.value) return;
  handleFormSubmit();
};

const handleClearInput = () => {
  if (isAnswerChecked.value) return;
  userInput.value = '';
  if (inputRef.value) {
    inputRef.value.value = '';
  }
};

const handleFormSubmit = () => {
  if (isAnswerChecked.value) {
    handleProceed();
    focusTextInput();
  } else {
    // Finalize kana conversion on submit (e.g. resolve trailing 'n' to 'ん')
    if (userInput.value) {
      userInput.value = wanakana.toHiragana(userInput.value.trim().toLowerCase());
      if (inputRef.value) {
        inputRef.value.value = userInput.value;
      }
    }
    submitAnswer(userInput.value);
  }
};

// Global keyboard shortcuts (Enter / Space to advance when checked)
const handleGlobalKeyDown = (e: KeyboardEvent) => {
  if (isTutorialOpen.value) return;

  if (isAnswerChecked.value) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleProceed();
      focusTextInput();
    }
  } else if (direction.value === 'number_to_kana') {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFormSubmit();
    }
  }
};

// Next wave index
const nextWaveDef = computed(() => {
  const currentIdx = HITUNGAN_WAVES.findIndex(w => w.wave_key === currentWave.value.wave_key);
  if (currentIdx !== -1 && currentIdx < HITUNGAN_WAVES.length - 1) {
    return HITUNGAN_WAVES[currentIdx + 1];
  }
  return null;
});

const handlePlayNextWave = () => {
  if (nextWaveDef.value) {
    startSession(nextWaveDef.value, direction.value);
    focusTextInput();
  }
};

const handleRestart = () => {
  startSession(currentWave.value, direction.value);
  focusTextInput();
};

watch(currentQuestion, () => {
  focusTextInput();
});

onMounted(() => {
  startSession(props.initialWave, props.initialDirection);
  focusTextInput();
  window.addEventListener('keydown', handleGlobalKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown);
});
</script>

<template>
  <div 
    class="w-full max-w-2xl mx-auto flex flex-col items-center justify-between text-slate-800 dark:text-slate-100 animate-fadeIn min-h-[460px] select-none transition-all"
    :class="direction === 'number_to_kana' && !isAnswerChecked && !isQuizFinished ? 'pb-60 sm:pb-6' : 'pb-6'"
  >
    <!-- Tutorial Modal (Opened anytime via "Lihat Pola") -->
    <HitunganTutorialModal 
      :is-open="isTutorialOpen" 
      :wave="currentWave" 
      @close="isTutorialOpen = false" 
      @start="isTutorialOpen = false" 
    />

    <!-- Top Status Bar -->
    <div class="w-full flex items-center justify-between gap-3 mb-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xs">
      <!-- Wave Title & Badge -->
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-xs font-black px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 uppercase tracking-wider flex-shrink-0">
          {{ currentWave.badge }}
        </span>
        <span class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
          {{ currentWave.title }}
        </span>
      </div>

      <!-- Right Controls: Streak, Tutorial & Exit -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <!-- Streak Counter -->
        <div v-if="streak > 0" class="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded-xl border border-amber-200 dark:border-amber-800/80 animate-pulse">
          <Flame class="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{{ streak }}</span>
        </div>

        <!-- Tutorial Button -->
        <button 
          type="button"
          @click="isTutorialOpen = true"
          class="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl transition flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700"
          title="Lihat Pola & Rumus Materi"
        >
          <BookOpen class="w-3.5 h-3.5 text-amber-500" />
          <span class="hidden xs:inline">Pola</span>
        </button>

        <!-- Exit Button -->
        <button 
          type="button"
          @click="emit('exit')"
          class="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
          title="Keluar ke Menu"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- MAIN ACTIVE QUIZ VIEW -->
    <div v-if="!isQuizFinished && currentQuestion" class="w-full flex-1 flex flex-col justify-between items-center gap-4">
      <!-- 1. Question Card Display -->
      <div class="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm text-center relative flex flex-col items-center justify-center min-h-[160px] sm:min-h-[190px]">
        <!-- Direction Badge -->
        <div class="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
          {{ direction === 'number_to_kana' ? 'Angka ➔ Ketik Kana' : 'Kana ➔ Numpad Angka' }}
        </div>

        <!-- Main Prompt -->
        <div class="text-3xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-wide font-jp my-1 flex items-center justify-center gap-3">
          <span>{{ currentQuestion.displayPrompt }}</span>
          <!-- Audio button on prompt for kana_to_number -->
          <button 
            v-if="direction === 'kana_to_number'"
            type="button"
            @click="speak(currentQuestion.expectedKana)"
            class="p-2 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition cursor-pointer"
            title="Dengarkan Ulang"
          >
            <Volume2 class="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <!-- Subprompt / Clue -->
        <div v-if="currentQuestion.displaySubprompt" class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
          {{ currentQuestion.displaySubprompt }}
        </div>
      </div>

      <!-- 2. Input / Numpad Section -->
      <div class="w-full flex flex-col items-center justify-center">
        <!-- MODE A: Number to Kana (Text Input with WanaKana conversion) -->
        <div v-if="direction === 'number_to_kana'" class="w-full max-w-md flex flex-col items-center gap-2.5">
          <div class="relative w-full">
            <input 
              ref="inputRef"
              type="text"
              inputmode="none"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              :value="userInput"
              @input="handleTextInput"
              :disabled="isAnswerChecked"
              placeholder="Ketik romaji (contoh: yon, juu, hyaku)..."
              class="w-full px-4 py-3.5 text-center text-lg sm:text-xl font-bold bg-white dark:bg-slate-900 border-2 rounded-2xl transition-all focus:outline-none shadow-sm placeholder:text-slate-400 font-jp"
              :class="[
                isAnswerChecked
                  ? isCorrect 
                    ? 'border-emerald-500 text-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-rose-500 text-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
                  : 'border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400'
              ]"
            />

            <!-- Clear button -->
            <button
              v-if="userInput && !isAnswerChecked"
              type="button"
              @click="handleClearInput"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition rounded-lg cursor-pointer"
              title="Hapus input"
            >
              <RotateCcw class="w-4 h-4" />
            </button>
          </div>

          <!-- Desktop Submit button (hidden on mobile, handled by VirtualKeyboard on mobile) -->
          <button 
            v-if="!isAnswerChecked"
            type="button"
            @click="handleFormSubmit"
            :disabled="!userInput.trim()"
            class="hidden sm:flex w-full py-3 px-6 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-slate-950 shadow-md transition cursor-pointer active:scale-[0.99] items-center justify-center gap-2"
          >
            <span>Kirim Jawaban (Enter)</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>

        <!-- MODE B: Kana to Number (Custom Onscreen NumberKeypad) -->
        <div v-else class="w-full flex flex-col items-center">
          <NumberKeypad 
            v-model="userInput"
            :disabled="isAnswerChecked"
            @submit="handleFormSubmit"
          />
        </div>
      </div>

      <!-- 3. Visual Answer Feedback Banner -->
      <div 
        v-if="isAnswerChecked" 
        class="w-full rounded-2xl p-4 transition-all duration-300 flex flex-col gap-2 shadow-sm animate-scaleUp"
        :class="isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800'"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <CheckCircle2 v-if="isCorrect" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <XCircle v-else class="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span class="text-sm font-black" :class="isCorrect ? 'text-emerald-800 dark:text-emerald-200' : 'text-rose-800 dark:text-rose-200'">
              {{ isCorrect ? 'Bagus Sekali! Benar! 🎉' : 'Kurang Tepat' }}
            </span>
          </div>

          <SpeakerButton :text="currentQuestion.expectedKana" size="sm" />
        </div>

        <!-- Explanation of expected answer -->
        <div class="text-xs text-slate-700 dark:text-slate-300 font-medium">
          <span>Bacaan resmi: </span>
          <span class="font-extrabold text-amber-600 dark:text-amber-400 font-jp text-sm">
            {{ currentQuestion.expectedKana }}
          </span>
          <span v-if="currentQuestion.acceptedKanaList.length > 1" class="text-[11px] text-slate-400 ml-1">
            (Boleh juga: {{ currentQuestion.acceptedKanaList.slice(1).join(', ') }})
          </span>
        </div>

        <!-- Advance Button -->
        <button 
          type="button"
          @click="handleProceed"
          class="w-full mt-1 py-2.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          :class="isCorrect ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'"
        >
          <span>{{ questionNumber >= totalQuestions ? 'Lihat Hasil Akhir →' : 'Lanjut Soal Berikutnya (Enter / Spasi)' }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- 4. QUIZ COMPLETED / RESULTS SCREEN -->
    <div 
      v-else-if="isQuizFinished" 
      class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 text-center shadow-lg animate-scaleUp flex flex-col items-center gap-4 my-auto"
    >
      <div class="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-2xl shadow-inner">
        <Trophy class="w-8 h-8 text-amber-500" />
      </div>

      <div>
        <h3 class="text-xl font-black text-slate-900 dark:text-slate-100">
          Sesi Wave Selesai!
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {{ currentWave.title }} ({{ direction === 'number_to_kana' ? 'Angka ➔ Kana' : 'Kana ➔ Angka' }})
        </p>
      </div>

      <!-- Score Box -->
      <div class="w-full bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 flex items-center justify-around">
        <div class="flex flex-col">
          <span class="text-[11px] font-bold text-slate-400 uppercase">Benar</span>
          <span class="text-2xl font-black text-emerald-500">{{ correctCount }} / {{ totalQuestions }}</span>
        </div>
        <div class="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
        <div class="flex flex-col">
          <span class="text-[11px] font-bold text-slate-400 uppercase">Akurasi</span>
          <span class="text-2xl font-black text-amber-500">{{ Math.round((correctCount / totalQuestions) * 100) }}%</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="w-full flex flex-col gap-2 pt-2">
        <button 
          v-if="nextWaveDef"
          type="button"
          @click="handlePlayNextWave"
          class="w-full py-3 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <span>Lanjut ke Wave Berikutnya ({{ nextWaveDef.shortTitle }})</span>
          <ArrowRight class="w-4 h-4" />
        </button>

        <button 
          type="button"
          @click="handleRestart"
          class="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Ulangi Wave Ini</span>
        </button>

        <button 
          type="button"
          @click="emit('exit')"
          class="w-full py-2.5 rounded-xl font-bold text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home class="w-3.5 h-3.5" />
          <span>Kembali ke Menu Utama</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile Virtual Keyboard for number_to_kana mode -->
  <div 
    v-if="direction === 'number_to_kana' && !isAnswerChecked && !isQuizFinished" 
    class="block sm:hidden fixed bottom-0 left-0 right-0 z-40"
  >
    <VirtualKeyboard
      theme="auto"
      enter-label="SUBMIT"
      :disabled="isAnswerChecked"
      @key="handleVirtualKey"
      @backspace="handleVirtualBackspace"
      @enter="handleVirtualEnter"
    >
      <template #top>
        <button
          type="button"
          class="px-3 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs transition border border-slate-300 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
          @click="handleClearInput"
        >
          <span>Hapus</span>
          <RotateCcw class="w-3 h-3" />
        </button>

        <span class="text-[11px] font-medium text-slate-400 dark:text-slate-400">
          Ketik romaji ➔ otomatis jadi kana
        </span>
      </template>
    </VirtualKeyboard>
  </div>
</template>

<style scoped>
@keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.animate-scaleUp { animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
</style>
