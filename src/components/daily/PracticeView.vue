<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { 
  Mic, MicOff, Send, X, AlertCircle, 
  ChevronRight, ChevronLeft, Eye,
  CheckCircle2, Sparkles, Keyboard
} from '@lucide/vue';
import { useSpeechAnswer } from '../../composables/useSpeechAnswer';
import SpeakerButton from '../SpeakerButton.vue';
import FuriganaText from '../common/FuriganaText.vue';
import { tokenizeSentenceWithHints } from '../../utils/sentenceHints';
import { computeAnswerDiff } from '../../utils/answerDiff';
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
const activeInputMode = ref<'voice' | 'keyboard'>('voice');
const isShaking = ref(false);
const lastAnswerGiven = ref('');

// Tokenized segments dengan word hints untuk kalimat bahasa Indonesia
const activeHintIndex = ref<number | null>(null);
const sentenceSegments = computed(() => tokenizeSentenceWithHints(props.question.id_text));

function toggleHint(idx: number) {
  activeHintIndex.value = activeHintIndex.value === idx ? null : idx;
}

function handleGlobalPointerDown(e: MouseEvent | TouchEvent) {
  if (activeHintIndex.value !== null) {
    const target = e.target as HTMLElement | null;
    if (target && !target.closest('.hint-container')) {
      activeHintIndex.value = null;
    }
  }
}

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
  interimTranscript,
  error: speechError,
  startListening,
  stopListening,
  resetTranscript,
} = useSpeechAnswer();

const isSpinningMic = ref(false);
let autoSubmitTimer: ReturnType<typeof setTimeout> | null = null;

// Pola regex penutup kalimat bahasa Jepang (predikat sopan, bentuk lampau, ajakan, permohonan, dsb.)
const JAPANESE_SENTENCE_ENDING_REGEX = /(です|でした|ですか|でしたか|ではありません|じゃありません|じゃありませんでした|ではありませんでした|ます|ました|ますか|ましたか|ません|ませんでした|ましょう|ましょうか|てください|ないでください|たいです|たくないです|だ|だった)[。！？.,!?\s]*$/;

// Computed Diff Karakter untuk Toleransi 1 Kata Salah:
// Huruf benar diwarnai biru/primary, huruf salah diwarnai hitam tanpa outline.
const answerDiffSegments = computed(() => {
  if (!props.question.is_correct || !props.question.is_tolerance) return [];
  const userAns = props.question.user_answer || lastAnswerGiven.value || '';
  const targetAns = props.question.matched_target || props.question.correct_answer || speakableText.value || '';
  return computeAnswerDiff(userAns, targetAns);
});

function switchToKeyboardMode() {
  if (isListening.value) {
    stopListening();
  }
  activeInputMode.value = 'keyboard';
  nextTick(() => {
    inputRef.value?.focus();
  });
}

function switchToVoiceMode() {
  isSpinningMic.value = true;
  setTimeout(() => {
    isSpinningMic.value = false;
  }, 450);
  activeInputMode.value = 'voice';
}

/**
 * Deteksi akhir kalimat Jepang secara instan:
 * Jika ucapan pengguna berakhiran predikat penutup kalimat Jepang (misal: です, でした, ます, dll.)
 * langsung kirim jawaban dalam 250ms tanpa menunggu jeda hening selesai!
 */
function checkAndTriggerSentenceEndingAutoSubmit(text: string) {
  if (activeInputMode.value !== 'voice' || props.question.is_correct || props.submitting) return;
  const clean = text.trim();
  if (clean.length >= 3 && JAPANESE_SENTENCE_ENDING_REGEX.test(clean)) {
    if (autoSubmitTimer) clearTimeout(autoSubmitTimer);
    autoSubmitTimer = setTimeout(() => {
      if (activeInputMode.value === 'voice' && !props.question.is_correct && !props.submitting) {
        if (isListening.value) {
          stopListening();
        }
        handleSubmit();
      }
    }, 250);
  }
}

// Auto submit setelah pengguna selesai berbicara di voice mode (fallback silence detection)
watch(isListening, (listening, wasListening) => {
  if (wasListening && !listening) {
    if (activeInputMode.value === 'voice' && inputText.value.trim() && !props.question.is_correct && !props.submitting) {
      if (autoSubmitTimer) clearTimeout(autoSubmitTimer);
      autoSubmitTimer = setTimeout(() => {
        handleSubmit();
      }, 500);
    }
  }
});

// Ketika transcript dari mic berubah, masukkan langsung ke input text dan cek deteksi akhir kalimat
watch(transcript, (newVal) => {
  if (newVal) {
    inputText.value = newVal;
    inputMethod.value = 'voice';
    checkAndTriggerSentenceEndingAutoSubmit(newVal);
  }
});

// Cek juga interim transcript secara live agar submit secepat kilat begitu kata akhir selesai diucapkan
watch(interimTranscript, (newVal) => {
  if (newVal && activeInputMode.value === 'voice') {
    checkAndTriggerSentenceEndingAutoSubmit(newVal);
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
    activeHintIndex.value = null;
    if (autoSubmitTimer) {
      clearTimeout(autoSubmitTimer);
      autoSubmitTimer = null;
    }
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
      if (isSpeechSupported.value) {
        activeInputMode.value = 'voice';
      } else {
        activeInputMode.value = 'keyboard';
        nextTick(() => {
          inputRef.value?.focus();
        });
      }
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
  window.addEventListener('pointerdown', handleGlobalPointerDown);
  if (!isSpeechSupported.value) {
    activeInputMode.value = 'keyboard';
  }
  if (!props.question.is_correct && activeInputMode.value === 'keyboard') {
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
});

onUnmounted(() => {
  if (autoSubmitTimer) {
    clearTimeout(autoSubmitTimer);
    autoSubmitTimer = null;
  }
  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }
  stopListening();
  window.removeEventListener('keydown', handleGlobalKeydown);
  window.removeEventListener('pointerdown', handleGlobalPointerDown);
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
        <h2 class="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-relaxed max-w-3xl mx-auto break-words">
          <template v-for="(seg, idx) in sentenceSegments" :key="idx">
            <!-- Segmen Kata yang Memiliki Hint (Clickable) -->
            <span 
              v-if="seg.hint"
              class="relative inline-block hint-container"
            >
              <button
                type="button"
                @click.stop="toggleHint(idx)"
                :class="[
                  'inline transition-all font-inherit text-inherit pb-0.5 cursor-pointer rounded-lg px-1 -mx-0.5 border-b-2 border-dashed align-baseline',
                  activeHintIndex === idx
                    ? 'text-indigo-600 dark:text-torii border-indigo-600 dark:border-torii bg-indigo-50/80 dark:bg-indigo-950/70 shadow-xs'
                    : 'border-indigo-300/80 dark:border-indigo-600/70 hover:text-indigo-600 dark:hover:text-torii hover:border-indigo-500 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                ]"
                :title="`Klik untuk melihat petunjuk terjemahan: ${seg.text}`"
              >
                {{ seg.text }}
              </button>

              <!-- Popover / Toast di Atas Kata -->
              <transition name="hint-pop">
                <div 
                  v-if="activeHintIndex === idx"
                  class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 sm:mb-2.5 z-50 pointer-events-auto"
                  @click.stop
                >
                  <div class="bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-md rounded-2xl px-3.5 py-2 shadow-2xl border border-slate-700/80 flex items-center gap-2.5 whitespace-nowrap">
                    <div class="flex flex-col items-center">
                      <span class="text-base sm:text-xl font-japanese font-black tracking-wide text-amber-300">
                        {{ seg.hint.japanese }}
                      </span>
                      <span v-if="seg.hint.romaji || (seg.hint.kana !== seg.hint.japanese)" class="text-[11px] sm:text-xs text-slate-300 font-sans font-medium">
                        {{ seg.hint.romaji || seg.hint.kana }}
                      </span>
                    </div>
                    <!-- Audio speaker button mini -->
                    <SpeakerButton :text="seg.hint.japanese" size="sm" class="shrink-0" />
                  </div>
                  <!-- Arrow tip pointing down to word -->
                  <div class="w-0 h-0 border-x-5 border-x-transparent border-t-5 border-t-slate-900/95 dark:border-t-slate-800/95 mx-auto"></div>
                </div>
              </transition>
            </span>

            <!-- Segmen Teks Biasa -->
            <span v-else>{{ seg.text }}</span>
          </template>
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
        class="mt-3.5 sm:mt-6 flex flex-col items-center justify-center gap-2.5 sm:gap-4 px-1 sm:px-3 max-w-4xl w-full animate-fadeIn"
      >
        <!-- Jika toleransi 1 kata: Highlight huruf benar (biru) vs salah (hitam tanpa outline) -->
        <div 
          v-if="question.is_tolerance && answerDiffSegments.length > 0" 
          class="flex flex-col items-center gap-1 mb-1 text-center"
        >
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Jawaban Anda:</span>
          <div class="text-xl sm:text-3xl md:text-4xl font-japanese font-black tracking-wide leading-relaxed break-words">
            <span 
              v-for="(seg, idx) in answerDiffSegments" 
              :key="idx"
              :class="seg.isCorrect ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100'"
            >{{ seg.text }}</span>
          </div>
        </div>

        <div class="flex items-center justify-center gap-2.5 sm:gap-4 w-full">
          <SpeakerButton :text="speakableText" size="md" class="shrink-0" />
          <span class="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-japanese font-black text-slate-900 dark:text-slate-100 tracking-wide leading-relaxed break-words text-center sm:text-left">
            <FuriganaText :text="speakableText" />
          </span>
        </div>
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

    <!-- Bottom Input & Controls Container - Hidden in Review Mode -->
    <div 
      v-if="!isReviewing"
      class="w-full max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto flex flex-col items-center gap-3 transition-all duration-300 relative z-20 pb-2"
    >
      <!-- STATE 1: JIKA SOAL SUDAH TERJAWAB BENAR (question.is_correct) -->
      <div v-if="question.is_correct" class="w-full flex justify-center animate-fadeIn">
        <button
          type="button"
          @click="handleAdvance"
          class="h-12 sm:h-14 px-8 sm:px-12 rounded-2xl font-black text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none shadow-lg bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95 ring-4 ring-emerald-400/40"
        >
          <span>{{ isLastQuestion && allCompleted ? 'Selesaikan Latihan' : 'Lanjut ke Soal Berikutnya' }}</span>
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>

      <!-- STATE 2: LATIHAN BERJALAN (SOAL BELUM BENAR) -->
      <div v-else class="w-full flex flex-col items-center gap-2.5 sm:gap-3 transition-all duration-300">
        
        <!-- ================= SLOT ATAS ================= -->
        <!-- Mode Voice: Tombol icon keyboard kecil (berada di atas tombol mic) -->
        <button
          v-if="activeInputMode === 'voice'"
          type="button"
          @click="switchToKeyboardMode"
          class="group px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200/90 dark:border-slate-700/90 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer animate-fadeIn"
          title="Beralih ke ketik keyboard"
        >
          <Keyboard class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-torii transition-colors" />
          <span>Ketik Jawaban</span>
        </button>

        <!-- Mode Keyboard: Tombol mic kecil (berada di atas card input) -->
        <button
          v-else-if="isSpeechSupported"
          type="button"
          @click="switchToVoiceMode"
          class="group px-3.5 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer animate-fadeIn"
          title="Beralih kembali ke mode suara"
        >
          <Mic class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-torii group-hover:rotate-12 transition-transform duration-300" />
          <span>Mode Suara</span>
        </button>


        <!-- ================= SLOT BAWAH ================= -->
        <!-- Mode Voice: Tombol Mic Utama (Besar) + Live Transcript + Status -->
        <div 
          v-if="activeInputMode === 'voice'" 
          class="w-full flex flex-col items-center gap-2.5 animate-fadeIn"
        >
          <!-- Live Transcript Card (jika sedang merekam atau ada teks ucapan) -->
          <div 
            v-if="transcript || interimTranscript || inputText" 
            class="max-w-md w-full px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-indigo-100 dark:border-slate-800 shadow-md backdrop-blur-md flex items-center justify-between gap-3 text-center transition-all animate-fadeIn"
          >
            <div class="flex items-center gap-2 overflow-hidden text-left flex-1 min-w-0">
              <span class="text-[11px] font-bold text-indigo-600 dark:text-torii uppercase shrink-0">Suara:</span>
              <span class="font-japanese font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 truncate">
                {{ transcript || interimTranscript || inputText }}
              </span>
            </div>
            <!-- Tombol submit manual cepat jika tidak sabar menunggu auto-submit / lingkungan berisik -->
            <button
              v-if="inputText.trim() && !submitting"
              type="button"
              @click="handleSubmit"
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-torii dark:hover:bg-torii-hover text-white flex items-center justify-center shrink-0 cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
              title="Kirim Sekarang"
              aria-label="Kirim Jawaban"
            >
              <Send class="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5" />
            </button>
          </div>

          <!-- Tombol Mic Utama (Besar & Prominen) -->
          <div class="relative flex flex-col items-center justify-center my-1">
            <!-- Ripple Wave Animation saat isListening -->
            <div v-if="isListening" class="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-rose-500/20 animate-ping pointer-events-none"></div>
            <div v-if="isListening" class="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-500/30 animate-pulse pointer-events-none"></div>

            <button
              type="button"
              @click="toggleMic"
              :disabled="submitting"
              :class="[
                'w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer relative z-10 select-none',
                isSpinningMic ? 'animate-micSpin' : '',
                isListening
                  ? 'bg-rose-500 hover:bg-rose-600 text-white ring-4 sm:ring-8 ring-rose-400/40 shadow-rose-500/30 scale-105'
                  : 'bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 dark:from-torii dark:to-torii-hover text-white hover:scale-105 active:scale-95 ring-4 ring-indigo-500/20 dark:ring-torii/20'
              ]"
              :title="isListening ? 'Hentikan rekaman mic' : 'Tekan untuk berbicara bahasa Jepang'"
            >
              <Mic v-if="!isListening" class="w-7 h-7 sm:w-9 sm:h-9" />
              <MicOff v-else class="w-7 h-7 sm:w-9 sm:h-9 text-white animate-pulse" />
            </button>
          </div>

          <!-- Label Status Voice Mode -->
          <div class="text-center text-xs font-medium">
            <span v-if="isListening" class="text-rose-500 dark:text-rose-400 font-bold flex items-center gap-1.5 justify-center animate-pulse">
              <span class="w-2 h-2 rounded-full bg-rose-500"></span>
              Mendengarkan... Silakan bicara kalimat Jepang
            </span>
            <span v-else-if="submitting" class="text-indigo-600 dark:text-torii font-bold flex items-center gap-1.5 justify-center">
              <div class="w-3.5 h-3.5 border-2 border-indigo-600 dark:border-torii border-t-transparent rounded-full animate-spin"></div>
              Memeriksa jawaban...
            </span>
            <span v-else-if="speechError" class="text-rose-500 dark:text-rose-400 flex items-center gap-1.5 justify-center">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" />
              <span>{{ speechError }}</span>
            </span>
            <span v-else class="text-slate-400 dark:text-slate-500">
              Tekan mic untuk berbicara bahasa Jepang
            </span>
          </div>
        </div>

        <!-- Mode Keyboard: Card Content Input (Melebar di Bawah) -->
        <div 
          v-else 
          class="w-full max-w-xl sm:max-w-3xl md:max-w-4xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg sm:shadow-xl p-2 sm:p-4 flex flex-col gap-2 transition-all duration-200 animate-cardExpandIn"
        >
          <!-- Input bar with Clear button & Submit Button -->
          <div class="relative flex items-center gap-1.5 sm:gap-2.5 md:gap-3 w-full">
            <!-- Dynamic Auto-Expanding Input Container -->
            <div class="relative inline-grid items-center flex-1 min-w-0 max-w-full">
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
                :readonly="submitting"
                placeholder="Ketik kalimat bahasa Jepang..."
                class="col-start-1 row-start-1 w-full pl-3 pr-8 py-2.5 sm:pl-4 sm:pr-11 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal placeholder:font-sans placeholder:text-base sm:placeholder:text-xl md:placeholder:text-2xl placeholder:tracking-normal font-normal text-base sm:text-xl md:text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-torii/50 transition-all font-japanese leading-relaxed"
              />

              <!-- Clear button -->
              <button
                v-if="inputText"
                type="button"
                @click="handleClear"
                class="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition z-10"
                title="Hapus ketikan"
              >
                <X class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <!-- Submit Button (Icon-only di Mobile, Teks di Desktop) -->
            <button
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
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }

@keyframes micSpin {
  0% { transform: scale(0.6) rotate(-180deg); }
  60% { transform: scale(1.1) rotate(15deg); }
  100% { transform: scale(1) rotate(0deg); }
}
.animate-micSpin {
  animation: micSpin 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes cardExpandIn {
  from { opacity: 0; transform: translateY(14px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-cardExpandIn {
  animation: cardExpandIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

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

.hint-pop-enter-active,
.hint-pop-leave-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.hint-pop-enter-from,
.hint-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, 6px) scale(0.92);
}

input::placeholder {
  font-weight: 400 !important;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
  letter-spacing: normal !important;
}
</style>
