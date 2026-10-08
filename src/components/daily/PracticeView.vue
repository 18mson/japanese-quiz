<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { 
  Mic, MicOff, Send, X, AlertCircle, 
  ChevronRight, ChevronLeft, Eye,
  CheckCircle2, Sparkles
} from '@lucide/vue';
import { useSpeechAnswer } from '../../composables/useSpeechAnswer';
import SpeakerButton from '../SpeakerButton.vue';
import FuriganaText from '../common/FuriganaText.vue';
import type { DailyQuestionData } from '../../stores/dailyPracticeStore';

const props = withDefaults(
  defineProps<{
    question: DailyQuestionData;
    questionIndex: number;
    totalQuestions: number;
    allCompleted?: boolean;
    submitting: boolean;
    revealedAnswer: string | null;
    autoKana: boolean;
    isReviewing?: boolean;
  }>(),
  {
    allCompleted: false,
    isReviewing: false
  }
);

const emit = defineEmits<{
  (e: 'submit', text: string, inputMethod: 'text' | 'voice'): void;
  (e: 'next'): void;
  (e: 'prev'): void;
  (e: 'finish'): void;
  (e: 'toggleAutoKana'): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const inputText = ref('');
const inputMethod = ref<'text' | 'voice'>('text');
const isShaking = ref(false);
const lastAnswerGiven = ref('');

// Lazy loaded wanakana instance
let wanakanaModule: any = null;
onMounted(async () => {
  try {
    wanakanaModule = await import('wanakana');
  } catch (e) {
    console.warn('Wanakana dynamic import failed:', e);
  }
});

// Composable Speech Recognition
const {
  isSupported: isSpeechSupported,
  isListening,
  transcript,
  error: speechError,
  startListening,
  stopListening,
  resetTranscript,
} = useSpeechAnswer();

// Ketika transcript dari mic berubah, masukkan langsung ke input text agar bisa diedit
watch(transcript, (newVal) => {
  if (newVal) {
    inputText.value = newVal;
    inputMethod.value = 'voice';
  }
});

const showAdvanceToast = ref(false);
let toastTimeout: ReturnType<typeof setTimeout> | null = null;

function triggerAdvanceToast() {
  showAdvanceToast.value = true;
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    showAdvanceToast.value = false;
  }, 2000);
}

// Reset / restore input saat berganti soal atau saat memuat soal
watch(
  () => props.question.daily_question_id,
  () => {
    inputMethod.value = 'text';
    resetTranscript();
    showAdvanceToast.value = false;
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      toastTimeout = null;
    }
    if (props.question.is_correct) {
      const ans = props.question.correct_answer || props.revealedAnswer || '';
      inputText.value = ans;
      lastAnswerGiven.value = ans;
    } else {
      inputText.value = '';
      lastAnswerGiven.value = '';
      nextTick(() => {
        inputRef.value?.focus();
      });
    }
  },
  { immediate: true }
);

// Munculkan toast HANYA saat baru saja menginput jawaban dan benar
watch(
  () => props.question.is_correct,
  (newVal, oldVal) => {
    if (newVal && !oldVal && !props.isReviewing) {
      triggerAdvanceToast();
    }
  }
);

const isComposing = ref(false);

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  inputText.value = target.value;
  inputMethod.value = 'text';
}

function handleCompositionStart() {
  isComposing.value = true;
}

function handleCompositionEnd(e: CompositionEvent) {
  isComposing.value = false;
  const target = e.target as HTMLInputElement;
  inputText.value = target.value;
}

function toggleMic() {
  if (isListening.value) {
    stopListening();
  } else {
    resetTranscript();
    startListening();
  }
}

function handleClear() {
  inputText.value = '';
  resetTranscript();
  nextTick(() => {
    inputRef.value?.focus();
  });
}

function handleSubmit() {
  const trimmed = inputText.value.trim();
  if (!trimmed || props.submitting || props.question.is_correct) return;

  // Jika user mengetik huruf alfabet latin (romaji), konversikan ke kana untuk validasi ke backend
  let answerToSend = trimmed;
  if (wanakanaModule && /[a-zA-Z]/.test(trimmed)) {
    try {
      answerToSend = wanakanaModule.toKana(trimmed);
    } catch {}
  }

  if (isListening.value) {
    stopListening();
  }

  lastAnswerGiven.value = trimmed;
  emit('submit', answerToSend, inputMethod.value);
}

// Trigger efek getar (shake) dan pulihkan fokus ke input jika salah
watch(
  () => props.question.attempts,
  (newAttempts, oldAttempts) => {
    if (newAttempts > oldAttempts && !props.question.is_correct) {
      isShaking.value = true;
      setTimeout(() => {
        isShaking.value = false;
      }, 500);
      nextTick(() => {
        inputRef.value?.focus();
      });
    }
  }
);

// Pastikan saat request submit selesai dan jawaban belum benar, input langsung kembali fokus
watch(
  () => props.submitting,
  (isSubmitting, wasSubmitting) => {
    if (wasSubmitting && !isSubmitting && !props.question.is_correct) {
      nextTick(() => {
        inputRef.value?.focus();
      });
    }
  }
);

// Teks yang akan dibunyikan oleh TTS (hanya jika benar atau di-reveal)
const speakableText = computed(() => {
  if (props.revealedAnswer) {
    return props.revealedAnswer;
  }
  if (props.question.correct_answer) {
    return props.question.correct_answer;
  }
  if (props.question.is_correct) {
    return lastAnswerGiven.value || inputText.value;
  }
  return '';
});

const canShowAudio = computed(() => {
  return (props.question.is_correct || !!props.revealedAnswer) && !!speakableText.value;
});

const isLastQuestion = computed(() => props.questionIndex >= props.totalQuestions - 1);
const canAdvance = computed(() => {
  if (props.isReviewing) {
    return true;
  }
  return props.question.is_correct || props.question.attempts >= 3;
});

function handleAdvance() {
  if (props.isReviewing) {
    if (isLastQuestion.value) {
      emit('finish');
    } else {
      emit('next');
    }
    return;
  }
  if (isLastQuestion.value && props.allCompleted) {
    emit('finish');
  } else {
    emit('next');
  }
}

function handleInputEnter() {
  if (props.question.is_correct) {
    handleAdvance();
  } else {
    handleSubmit();
  }
}

function handleGlobalKeydown(e: KeyboardEvent) {
  if (props.isReviewing) {
    if (e.key === 'ArrowRight' || e.key === 'Enter') {
      e.preventDefault();
      handleAdvance();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (props.questionIndex > 0) emit('prev');
    }
    return;
  }

  // Hanya trigger tombol selanjutnya jika soalnya SUDAH terjawab benar
  if (e.key === 'Enter' && props.question.is_correct && !props.submitting) {
    e.preventDefault();
    handleAdvance();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
  if (!props.question.is_correct) {
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
});

onUnmounted(() => {
  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }
  window.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<template>
  <div class="w-full max-w-4xl lg:max-w-5xl mx-auto flex flex-col gap-3 sm:gap-6 animate-fadeIn my-auto relative px-10 sm:px-16 lg:px-20">
    <!-- Left Navigation Paddle (Fixed at Left Edge) -->
    <button
      type="button"
      @click="emit('prev')"
      :disabled="questionIndex === 0"
      class="fixed left-1.5 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white/95 dark:bg-slate-800/95 shadow-md sm:shadow-2xl border border-slate-200/90 dark:border-slate-700/90 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-110 active:scale-95 disabled:opacity-20 disabled:pointer-events-none transition-all z-30 cursor-pointer backdrop-blur-md"
      title="Soal Sebelumnya"
      aria-label="Soal Sebelumnya"
    >
      <ChevronLeft class="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7" />
    </button>

    <!-- Right Navigation Paddle (Fixed at Right Edge) with Toast Popup (Muncul 2s saat baru saja benar) -->
    <div class="fixed right-1.5 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-end">
      <!-- Toast Popup Floating Above Right Paddle -->
      <transition name="toast-pop">
        <div 
          v-if="showAdvanceToast"
          class="absolute bottom-full mb-2 sm:mb-3 right-0 flex flex-col items-end pointer-events-none select-none z-40 whitespace-nowrap"
        >
          <div class="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-black text-[11px] sm:text-xs shadow-xl flex items-center gap-1 sm:gap-1.5 border border-emerald-400/40">
            <Sparkles class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-200" />
            <span>{{ isLastQuestion && allCompleted ? 'Selesai! (Enter)' : 'Lanjut (Enter)' }}</span>
            <ChevronRight class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <!-- Little arrow pointing down to button -->
          <div class="w-0 h-0 border-x-4 sm:border-x-6 border-x-transparent border-t-4 sm:border-t-6 border-t-emerald-600 dark:border-t-emerald-500 mr-2 sm:mr-5"></div>
        </div>
      </transition>

      <button
        type="button"
        @click="handleAdvance"
        :disabled="!isReviewing && questionIndex >= totalQuestions - 1 && !(isLastQuestion && allCompleted)"
        :class="[
          'w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full shadow-md sm:shadow-2xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md hover:scale-110 active:scale-95',
          canAdvance
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white ring-2 sm:ring-4 ring-emerald-400/50 shadow-emerald-500/30 border border-emerald-400'
            : 'bg-white/95 dark:bg-slate-800/95 border border-slate-200/90 dark:border-slate-700/90 text-slate-700 dark:text-slate-200 disabled:opacity-20 disabled:pointer-events-none'
        ]"
        :title="isReviewing ? (isLastQuestion ? 'Selesai Tinjau' : 'Soal Berikutnya') : (isLastQuestion && allCompleted ? 'Selesaikan Latihan' : 'Soal Berikutnya')"
        :aria-label="isReviewing ? (isLastQuestion ? 'Selesai Tinjau' : 'Soal Berikutnya') : (isLastQuestion && allCompleted ? 'Selesaikan Latihan' : 'Soal Berikutnya')"
      >
        <ChevronRight class="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7" />
      </button>
    </div>

    <!-- Question Content (Expansive full-width text) -->
    <div 
      :class="[
        'w-full flex flex-col items-center text-center transition-all duration-300 py-2 sm:py-5',
        isShaking ? 'animate-shake' : ''
      ]"
    >
      <!-- Question meta row -->
      <div class="flex items-center justify-center gap-2 mb-2 sm:mb-4">
        <span class="text-[11px] sm:text-xs font-bold text-slate-400">
          Soal {{ questionIndex + 1 }} dari {{ totalQuestions }}
        </span>
        <!-- Attempts badge -->
        <span 
          v-if="!question.is_correct" 
          :class="[
            'px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border',
            question.attempts >= 2 
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
              : (question.attempts === 1 
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700')
          ]"
        >
          Percobaan {{ question.attempts }}/3
        </span>
      </div>

      <!-- Indonesian prompt text (Hero Typography) -->
      <div class="my-1.5 sm:my-3 px-1 sm:px-3 w-full">
        <span class="text-[11px] sm:text-xs md:text-sm font-black text-indigo-600 dark:text-torii uppercase tracking-widest block mb-1.5 sm:mb-3">
          Terjemahkan ke Bahasa Jepang
        </span>
        <h2 class="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug max-w-3xl mx-auto break-words">
          {{ question.id_text }}
        </h2>
      </div>

      <!-- Penanda Jawaban Benar (Banner Sukses Eksplisit) -->
      <transition name="toast-pop">
        <div 
          v-if="question.is_correct" 
          class="mt-2.5 sm:mt-4 flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-emerald-500 text-white font-black text-xs sm:text-base shadow-md sm:shadow-lg shadow-emerald-500/25 border border-emerald-400/60"
        >
          <CheckCircle2 class="w-4 h-4 sm:w-6 sm:h-6 shrink-0" />
          <span>Jawaban Anda Benar! (正解)</span>
        </div>
      </transition>

      <!-- Audio playback banner & Answer text -->
      <div 
        v-if="canShowAudio" 
        class="mt-3.5 sm:mt-6 flex items-center justify-center gap-2.5 sm:gap-4 px-1 sm:px-3 max-w-4xl w-full animate-fadeIn"
      >
        <SpeakerButton :text="speakableText" size="md" class="shrink-0" />
        <span class="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-japanese font-black text-slate-900 dark:text-slate-100 tracking-wide leading-relaxed break-words text-center sm:text-left">
          <FuriganaText :text="speakableText" />
        </span>
      </div>

      <!-- Revealed Answer -->
      <div 
        v-else-if="revealedAnswer" 
        class="mt-3.5 sm:mt-6 flex flex-col items-center justify-center gap-1.5 sm:gap-2 px-1 sm:px-3 max-w-4xl w-full animate-fadeIn"
      >
        <div class="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">
          <Eye class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Kunci Jawaban Terbuka:</span>
          <SpeakerButton :text="revealedAnswer" size="sm" />
        </div>
        <div class="text-2xl sm:text-4xl md:text-5xl font-japanese font-black text-slate-900 dark:text-slate-100 tracking-wide leading-relaxed break-words text-center">
          <FuriganaText :text="revealedAnswer" />
        </div>
        <div class="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          Pelajari struktur kalimat di atas, lalu lanjutkan ke soal berikutnya.
        </div>
      </div>
    </div>

    <!-- Bottom Input & Controls Container (Mobile-Optimized & Responsive) - Hidden in Review Mode -->
    <div 
      v-if="!isReviewing"
      class="w-full max-w-xl sm:max-w-3xl md:max-w-4xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg sm:shadow-xl p-2 sm:p-4 flex flex-col gap-2 transition-all duration-150"
    >
      <!-- Input bar with Clear button, Mic & Submit/Advance Button -->
      <div class="relative flex items-center gap-1.5 sm:gap-2.5 md:gap-3 w-full">
        <!-- Dynamic Auto-Expanding Input Container (min-w-0 agar fleksibel menyusut di HP) -->
        <div class="relative inline-grid items-center flex-1 min-w-0 max-w-full">
          <!-- Invisible Mirror Span to expand the grid with input text length -->
          <span
            aria-hidden="true"
            class="invisible col-start-1 row-start-1 whitespace-pre pl-3 pr-8 py-2.5 sm:pl-4 sm:pr-11 sm:py-3.5 md:py-4 text-base sm:text-xl md:text-2xl font-normal font-japanese pointer-events-none select-none max-w-full overflow-hidden"
          >
            {{ inputText }}
          </span>

          <input
            ref="inputRef"
            type="text"
            :value="inputText"
            @input="handleInput"
            @compositionstart="handleCompositionStart"
            @compositionend="handleCompositionEnd"
            @keydown.enter.prevent="handleInputEnter"
            :disabled="question.is_correct"
            :readonly="submitting"
            :placeholder="question.is_correct ? 'Soal sudah terjawab benar' : (isListening ? 'Mendengarkan...' : 'Ketik kalimat atau tekan mic...')"
            class="col-start-1 row-start-1 w-full pl-3 pr-8 py-2.5 sm:pl-4 sm:pr-11 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal placeholder:font-sans placeholder:text-base sm:placeholder:text-xl md:placeholder:text-2xl placeholder:tracking-normal font-normal text-base sm:text-xl md:text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-torii/50 transition-all font-japanese leading-relaxed"
          />

          <!-- Clear button -->
          <button
            v-if="inputText && !question.is_correct"
            type="button"
            @click="handleClear"
            class="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition z-10"
            title="Hapus ketikan"
          >
            <X class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>


        <!-- Mic Button -->
        <button
          v-if="isSpeechSupported"
          type="button"
          @click="toggleMic"
          :disabled="question.is_correct || submitting"
          :class="[
            'h-10 w-9.5 sm:h-auto sm:w-auto p-2 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl border transition-all duration-200 flex items-center justify-center cursor-pointer flex-shrink-0 select-none shadow-2xs min-w-[36px] sm:min-w-[48px]',
            isListening
              ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600 ring-2 sm:ring-4 ring-rose-400/30 animate-pulse'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          ]"
          :title="isListening ? 'Hentikan rekaman mic' : 'Rekam suara (ja-JP)'"
        >
          <Mic v-if="!isListening" class="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-torii" />
          <MicOff v-else class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>

        <!-- Submit or Advance Button (Icon-only di Mobile, Teks di Desktop) -->
        <button
          v-if="!question.is_correct"
          type="button"
          @click="handleSubmit"
          :disabled="!inputText.trim() || submitting"
          :class="[
            'h-10 sm:h-auto px-3 sm:px-6 py-2 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl font-extrabold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer flex-shrink-0 select-none shadow-xs min-w-[40px] sm:min-w-[100px]',
            inputText.trim() && !submitting
              ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-torii dark:hover:bg-torii-hover text-white active:scale-95'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-300/40 dark:border-slate-700/40'
          ]"
          title="Kirim Jawaban"
        >
          <div v-if="submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <Send v-else class="w-4 h-4" />
          <span class="hidden sm:inline">Kirim</span>
        </button>

        <!-- Ketika Benar: Tombol berubah jadi Lanjut (Hijau, Icon-only di Mobile) -->
        <button
          v-else
          type="button"
          @click="handleAdvance"
          class="h-10 sm:h-auto px-3 sm:px-6 py-2 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl font-extrabold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer flex-shrink-0 select-none shadow-md min-w-[40px] sm:min-w-[100px] bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95 ring-2 ring-emerald-400/40"
          :title="isLastQuestion && allCompleted ? 'Selesai' : 'Lanjut'"
        >
          <span class="hidden sm:inline">{{ isLastQuestion && allCompleted ? 'Selesai' : 'Lanjut' }}</span>
          <ChevronRight class="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <!-- Speech Error Notice & Listening indicator -->
      <div v-if="speechError || isListening" class="flex items-center justify-between text-xs px-1">
        <span v-if="speechError" class="text-rose-500 dark:text-rose-400 flex items-center gap-1.5 animate-fadeIn">
          <AlertCircle class="w-3.5 h-3.5 flex-shrink-0" />
          <span>{{ speechError }}</span>
        </span>
        <span v-if="isListening" class="inline-flex items-center gap-1.5 font-bold text-rose-500 animate-pulse ml-auto">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          Merekam suara...
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}
.animate-shake { animation: shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }

.toast-pop-enter-active,
.toast-pop-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-pop-enter-from,
.toast-pop-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
}

input::placeholder {
  font-weight: 400 !important;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
  letter-spacing: normal !important;
}
</style>
