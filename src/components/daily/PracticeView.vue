<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { 
  ChevronRight, ChevronLeft, Eye, CheckCircle2
} from '@lucide/vue';
import { useSpeechAnswer } from '../../composables/useSpeechAnswer';
import { useTextToSpeech } from '../../composables/useTextToSpeech';
import SpeakerButton from '../SpeakerButton.vue';
import FuriganaText from '../common/FuriganaText.vue';
import DailyActionInputBar from './DailyActionInputBar.vue';
import { tokenizeSentenceWithHints } from '../../utils/sentenceHints';
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

const actionInputBarRef = ref<{ focusInput: () => void } | null>(null);
const inputText = ref('');
const inputMethod = ref<'text' | 'voice'>('text');
const activeInputMode = ref<'voice' | 'keyboard'>('voice');
const isShaking = ref(false);
const lastAnswerGiven = ref('');

const { speak } = useTextToSpeech();

function focusInput() {
  nextTick(() => {
    actionInputBarRef.value?.focusInput();
  });
}

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

// ============================================================
// ANIMASI BLUR & FLUID MORPH RESIZE SAAT PERGANTIAN SOAL
// ============================================================
const isMorphing = ref(false);
const blurPillStyle = ref<Record<string, string>>({});
const containerHeightStyle = ref<Record<string, string>>({
  minHeight: 'auto',
  transition: 'none'
});

function onQuestionBeforeLeave(el: Element) {
  const htmlEl = el as HTMLElement;
  const rect = htmlEl.getBoundingClientRect();
  isMorphing.value = true;
  blurPillStyle.value = {
    width: `${rect.width + 48}px`,
    height: `${rect.height + 24}px`,
    opacity: '1',
    transition: 'none'
  };
  containerHeightStyle.value = {
    minHeight: `${rect.height}px`,
    transition: 'none'
  };
}

function onQuestionLeave(el: Element, done: () => void) {
  const htmlEl = el as HTMLElement;
  htmlEl.classList.add('question-blur-leave');
  setTimeout(() => {
    done();
  }, 150);
}

function onQuestionBeforeEnter(el: Element) {
  const htmlEl = el as HTMLElement;
  htmlEl.classList.add('question-blur-enter-prep');
}

function onQuestionEnter(el: Element, done: () => void) {
  const htmlEl = el as HTMLElement;

  // Ukur dimensi alami teks baru (kontainer tetap w-full max-w-3xl sehingga tidak menghimpit teks jadi 2 baris)
  const newRect = htmlEl.getBoundingClientRect();

  // Animasikan blur pill memanjang / memendek ke ukuran baru
  requestAnimationFrame(() => {
    blurPillStyle.value = {
      width: `${newRect.width + 48}px`,
      height: `${newRect.height + 24}px`,
      opacity: '0',
      transition: 'width 0.36s cubic-bezier(0.22, 1, 0.36, 1), height 0.36s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.36s ease-out'
    };

    containerHeightStyle.value = {
      minHeight: `${newRect.height}px`,
      transition: 'min-height 0.36s cubic-bezier(0.22, 1, 0.36, 1)'
    };

    htmlEl.classList.remove('question-blur-enter-prep');
    htmlEl.classList.add('question-blur-enter-active');

    setTimeout(() => {
      htmlEl.classList.remove('question-blur-enter-active');
      done();
    }, 360);
  });
}

function onQuestionAfterEnter() {
  isMorphing.value = false;
  containerHeightStyle.value = {
    minHeight: 'auto',
    transition: 'none'
  };
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

let autoSubmitTimer: ReturnType<typeof setTimeout> | null = null;
const JAPANESE_SENTENCE_ENDING_REGEX = /(です|でした|ですか|でしたか|ではありません|じゃありません|じゃありませんでした|ではありませんでした|ます|ました|ますか|ましたか|ません|ませんでした|ましょう|ましょうか|てください|ないでください|たいです|たくないです|だ|だった)[。！？.,!?\s]*$/;

// Soal dianggap selesai jika sudah dijawab benar, sudah 3x salah, atau kunci jawaban terbuka
const isQuestionCompleted = computed(() => {
  return props.question.is_correct || props.question.attempts >= 3 || !!props.revealedAnswer;
});

// State dan aksi tombol utama yang bertransformasi (Lanjut / Kirim / Mic)
const mainActionState = computed<'advance' | 'send' | 'mic'>(() => {
  if (isQuestionCompleted.value) return 'advance';
  if (activeInputMode.value === 'keyboard') return 'send';
  return 'mic';
});



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
        focusInput();
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

watch(activeInputMode, (mode) => {
  if (mode === 'keyboard' && isListening.value) {
    stopListening();
  }
});

watch(inputText, () => {
  if (activeInputMode.value === 'keyboard') {
    inputMethod.value = 'text';
  }
});

function toggleMic() {
  if (isListening.value) {
    stopListening();
  } else {
    inputText.value = '';
    resetTranscript();
    startListening();
  }
}

const displayedVoiceTranscript = computed(() => {
  return (interimTranscript.value || transcript.value || inputText.value || '').trim();
});

function handleClear() {
  inputText.value = '';
  resetTranscript();
  focusInput();
}

function handleSubmit() {
  const trimmed = inputText.value.trim();
  if (!trimmed || props.submitting || isQuestionCompleted.value) return;

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
    if (newAttempts > (oldAttempts || 0) && !props.question.is_correct && !isQuestionCompleted.value) {
      isShaking.value = true;
      setTimeout(() => {
        isShaking.value = false;
      }, 500);
      focusInput();
    }
  }
);

// Pastikan saat request submit selesai dan jawaban belum benar, input langsung kembali fokus
watch(
  () => props.submitting,
  (isSubmitting, wasSubmitting) => {
    if (wasSubmitting && !isSubmitting && !isQuestionCompleted.value) {
      focusInput();
    }
  }
);

// Auto-play audio pengucapan benar otomatis saat salah 3x atau kunci terbuka
watch(
  () => [props.question.attempts, props.revealedAnswer, props.question.is_correct],
  ([attempts, revealed, isCorrect], oldVals) => {
    const oldAttempts = oldVals ? (oldVals[0] as number) : 0;
    if (!isCorrect && ((attempts as number) >= 3 || !!revealed)) {
      if ((attempts as number) > oldAttempts || !!revealed) {
        const audioText = (revealed as string) || props.question.correct_answer || '';
        if (audioText) {
          speak(audioText);
        }
      }
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

// Cache teks jawaban agar saat transisi keluar (slide down saat next soal), teks tidak kosong tiba-tiba
const displayedSpeakableText = ref('');
watch(
  speakableText,
  (val) => {
    if (val) {
      displayedSpeakableText.value = val;
    }
  },
  { immediate: true }
);



// ============================================================
// ANIMASI BLUR & FLUID MORPH RESIZE SAAT PERGANTIAN/MUNCUL/HILANG JAWABAN
// (Sama persis dengan animasi soal)
// ============================================================
const isAnswerMorphing = ref(false);
const answerBlurPillStyle = ref<Record<string, string>>({});
const answerContainerHeightStyle = ref<Record<string, string>>({
  maxHeight: (props.question.is_correct || !!props.revealedAnswer) ? 'none' : '0px',
  marginTop: (props.question.is_correct || !!props.revealedAnswer) ? '1.25rem' : '0px',
  overflow: (props.question.is_correct || !!props.revealedAnswer) ? 'visible' : 'hidden',
  transition: 'none'
});

const hasVisibleAnswer = computed(() => {
  return (props.question.is_correct || !!props.revealedAnswer || props.question.attempts >= 3) && !!speakableText.value;
});

const answerKey = computed(() => {
  return `${props.question.daily_question_id}-${props.question.is_correct ? 'c' : 'r'}-${displayedSpeakableText.value}`;
});

function onAnswerBeforeLeave(el: Element) {
  const htmlEl = el as HTMLElement;
  const rect = htmlEl.getBoundingClientRect();
  isAnswerMorphing.value = true;
  answerBlurPillStyle.value = {
    width: `${rect.width + 48}px`,
    height: `${rect.height + 28}px`,
    opacity: '1',
    transition: 'none'
  };
  answerContainerHeightStyle.value = {
    maxHeight: `${rect.height}px`,
    marginTop: '1.25rem',
    overflow: 'hidden',
    transition: 'none'
  };
}

function onAnswerLeave(el: Element, done: () => void) {
  const htmlEl = el as HTMLElement;
  if (!hasVisibleAnswer.value) {
    // "ADA JADI HILANG" -> transisi ke soal yang BELUM dijawab
    htmlEl.classList.add('answer-blur-leave-collapse');
    requestAnimationFrame(() => {
      answerBlurPillStyle.value = {
        width: '60px',
        height: '20px',
        opacity: '0',
        transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)'
      };
      answerContainerHeightStyle.value = {
        maxHeight: '0px',
        marginTop: '0px',
        overflow: 'hidden',
        transition: 'max-height 0.32s cubic-bezier(0.22, 1, 0.36, 1), margin-top 0.32s cubic-bezier(0.22, 1, 0.36, 1)'
      };
    });
    setTimeout(() => {
      done();
    }, 320);
  } else {
    // "ADA JADI BERUBAH" -> transisi ke soal lain yang SUDAH dijawab
    htmlEl.classList.add('answer-blur-leave');
    setTimeout(() => {
      done();
    }, 150);
  }
}

function onAnswerAfterLeave() {
  if (!hasVisibleAnswer.value) {
    isAnswerMorphing.value = false;
    answerContainerHeightStyle.value = {
      maxHeight: '0px',
      marginTop: '0px',
      overflow: 'hidden',
      transition: 'none'
    };
  }
}

function onAnswerBeforeEnter(el: Element) {
  const htmlEl = el as HTMLElement;
  htmlEl.classList.add('answer-blur-enter-prep');
  
  // Jika sebelumnya belum aktif (HILANG JADI ADA)
  if (!isAnswerMorphing.value) {
    isAnswerMorphing.value = true;
    answerBlurPillStyle.value = {
      width: '100px',
      height: '36px',
      opacity: '0.8',
      transition: 'none'
    };
    answerContainerHeightStyle.value = {
      maxHeight: '0px',
      marginTop: '0px',
      overflow: 'hidden',
      transition: 'none'
    };
  }
}

function onAnswerEnter(el: Element, done: () => void) {
  const htmlEl = el as HTMLElement;
  const newRect = htmlEl.getBoundingClientRect();
  const targetWidth = newRect.width > 0 ? newRect.width + 48 : 280;
  const targetHeight = newRect.height > 0 ? newRect.height + 28 : 80;

  requestAnimationFrame(() => {
    answerBlurPillStyle.value = {
      width: `${targetWidth}px`,
      height: `${targetHeight}px`,
      opacity: '0',
      transition: 'width 0.38s cubic-bezier(0.22, 1, 0.36, 1), height 0.38s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.38s ease-out'
    };

    answerContainerHeightStyle.value = {
      maxHeight: `${targetHeight + 20}px`,
      marginTop: '1.25rem',
      overflow: 'hidden',
      transition: 'max-height 0.38s cubic-bezier(0.16, 1, 0.3, 1), margin-top 0.38s cubic-bezier(0.16, 1, 0.3, 1)'
    };

    htmlEl.classList.remove('answer-blur-enter-prep');
    htmlEl.classList.add('answer-blur-enter-active');

    setTimeout(() => {
      htmlEl.classList.remove('answer-blur-enter-active');
      done();
    }, 380);
  });
}

function onAnswerAfterEnter() {
  isAnswerMorphing.value = false;
  answerContainerHeightStyle.value = {
    maxHeight: 'none',
    marginTop: '1.25rem',
    overflow: 'visible',
    transition: 'none'
  };
}


const isLastQuestion = computed(() => props.questionIndex >= props.totalQuestions - 1);
const canAdvance = computed(() => {
  if (props.isReviewing) {
    return true;
  }
  return isQuestionCompleted.value;
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
    focusInput();
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
  <div class="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto flex flex-col gap-3 sm:gap-6 animate-fadeIn my-auto relative px-4 sm:px-8 lg:px-12">
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
        'w-full flex flex-col items-center text-center transition-all duration-300 py-2 sm:py-5 relative',
        isShaking ? 'animate-shake' : ''
      ]"
    >
      <!-- Popup Toast Jawaban Benar (Floating di atas seperti popup hints, tidak menggeser layout di bawahnya) -->
      <transition name="toast-pop-top">
        <div 
          v-if="question.is_correct" 
          class="absolute -top-3 sm:-top-5 md:-top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none select-none flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-emerald-500 text-white font-black text-[11px] sm:text-xs md:text-sm shadow-xl shadow-emerald-500/25 border border-emerald-400/60 whitespace-nowrap"
        >
          <CheckCircle2 class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Jawaban Anda Benar! (正解)</span>
        </div>
      </transition>

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
      <div class="my-1.5 sm:my-3 px-1 sm:px-3 w-full flex flex-col items-center">
        <span class="text-[11px] sm:text-xs md:text-sm font-black text-indigo-600 dark:text-torii uppercase tracking-widest block mb-1.5 sm:mb-3 select-none">
          Terjemahkan ke Bahasa Jepang
        </span>

        <!-- Morphing Container dengan Animasi Memanjang / Memendek & Efek Blur -->
        <div 
          class="question-morph-wrapper relative mx-auto flex items-center justify-center max-w-4xl xl:max-w-5xl w-full"
          :style="containerHeightStyle"
        >
          <!-- Dynamic Ambient Blur saat transisi pergantian soal (Menyatu mulus dengan background) -->
          <div 
            v-if="isMorphing" 
            class="morph-backdrop-glow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-100/60 dark:bg-slate-900/50 backdrop-blur-xl pointer-events-none"
            :style="blurPillStyle"
          ></div>

          <transition 
            name="question-blur-morph" 
            mode="out-in"
            @before-leave="onQuestionBeforeLeave"
            @leave="onQuestionLeave"
            @before-enter="onQuestionBeforeEnter"
            @enter="onQuestionEnter"
            @after-enter="onQuestionAfterEnter"
          >
            <h2 
              :key="question.daily_question_id"
              class="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-relaxed max-w-4xl xl:max-w-5xl mx-auto break-words text-center w-full"
            >
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
          </transition>
        </div>
      </div>



      <!-- Answer Morphing Container dengan Animasi Memanjang / Memendek & Efek Blur (Sama Persis dengan Soal) -->
      <div 
        class="answer-morph-wrapper relative mx-auto flex items-center justify-center max-w-5xl lg:max-w-6xl xl:max-w-7xl w-full"
        :style="answerContainerHeightStyle"
      >
        <!-- Dynamic Ambient Blur saat transisi pergantian/muncul/hilang jawaban (Menyatu mulus dengan background) -->
        <div 
          v-if="isAnswerMorphing" 
          class="morph-backdrop-glow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-100/60 dark:bg-slate-900/50 backdrop-blur-xl pointer-events-none z-0"
          :style="answerBlurPillStyle"
        ></div>

        <transition 
          name="answer-blur-morph" 
          mode="out-in"
          @before-leave="onAnswerBeforeLeave"
          @leave="onAnswerLeave"
          @after-leave="onAnswerAfterLeave"
          @before-enter="onAnswerBeforeEnter"
          @enter="onAnswerEnter"
          @after-enter="onAnswerAfterEnter"
        >
          <!-- ELEMEN JAWABAN (Muncul jika soal sudah benar atau kunci terbuka) -->
          <div
            v-if="hasVisibleAnswer"
            :key="answerKey"
            class="answer-content-inner relative z-10 flex flex-col items-center justify-center px-1 sm:px-3 max-w-5xl lg:max-w-6xl xl:max-w-7xl w-full"
          >
            <!-- Konten Jawaban Terjawab Benar -->
            <div 
              v-if="question.is_correct || !revealedAnswer"
              class="flex items-center justify-center gap-2.5 sm:gap-4 w-full"
            >
              <SpeakerButton :text="displayedSpeakableText" size="md" class="shrink-0" />
              <span class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem] font-japanese font-black text-slate-900 dark:text-slate-100 tracking-wide leading-snug sm:leading-normal break-words text-center sm:text-left">
                <FuriganaText 
                  :text="displayedSpeakableText" 
                  :is-all-correct="question.is_correct && !question.is_tolerance"
                  :diff-user-answer="question.is_tolerance ? (question.user_answer || lastAnswerGiven || '') : ''"
                />
              </span>
            </div>

            <!-- Konten Kunci Jawaban Terbuka -->
            <div 
              v-else
              class="flex flex-col items-center justify-center gap-1.5 sm:gap-2 w-full"
            >
              <div class="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">
                <Eye class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Kunci Jawaban Terbuka:</span>
                <SpeakerButton :text="revealedAnswer || question.correct_answer || ''" size="sm" />
              </div>
              <div class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem] font-japanese font-black text-slate-900 dark:text-slate-100 tracking-wide leading-snug sm:leading-normal break-words text-center">
                <FuriganaText :text="revealedAnswer || question.correct_answer || ''" />
              </div>
              <div class="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Pelajari struktur kalimat di atas, lalu lanjutkan ke soal berikutnya.
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Bottom Input & Controls Container (Reusable Action Bar) - Hidden in Review Mode -->
    <DailyActionInputBar
      v-if="!isReviewing"
      ref="actionInputBarRef"
      v-model="inputText"
      :input-mode="activeInputMode"
      :action-state="mainActionState"
      :is-listening="isListening"
      :submitting="submitting"
      :is-completed="isQuestionCompleted"
      :is-last-question="isLastQuestion"
      :all-completed="allCompleted"
      :voice-transcript="displayedVoiceTranscript"
      :voice-error="speechError"
      :is-speech-supported="isSpeechSupported"
      @update:input-mode="(mode) => activeInputMode = mode"
      @submit="handleSubmit"
      @advance="handleAdvance"
      @toggle-mic="toggleMic"
      @clear="handleClear"
    />
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

.toast-pop-top-enter-active,
.toast-pop-top-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-pop-top-enter-from,
.toast-pop-top-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px) scale(0.92);
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

/* Efek Blur & Unblur saat berganti soal */
.question-blur-leave {
  filter: blur(14px);
  opacity: 0.15;
  transform: scale(0.98);
  transition: filter 0.15s ease-in, opacity 0.15s ease-in, transform 0.15s ease-in;
}

.question-blur-enter-prep {
  filter: blur(14px);
  opacity: 0;
  transform: scale(0.98);
}

.question-blur-enter-active {
  filter: blur(0px);
  opacity: 1;
  transform: scale(1);
  transition: filter 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease-out, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Morph container styling */
.question-morph-wrapper {
  transform-origin: center center;
  will-change: min-height;
}

.morph-backdrop-glow {
  transform-origin: center center;
  will-change: width, height, opacity;
  -webkit-mask-image: radial-gradient(ellipse at center, rgba(0, 0, 0, 1) 35%, rgba(0, 0, 0, 0) 80%);
  mask-image: radial-gradient(ellipse at center, rgba(0, 0, 0, 1) 35%, rgba(0, 0, 0, 0) 80%);
}

/* Answer blur animation (Sama persis dengan soal) */
.answer-blur-leave {
  filter: blur(14px);
  opacity: 0;
  transform: scale(0.97);
  transition: filter 0.15s ease-in, opacity 0.15s ease-in, transform 0.15s ease-in;
}

.answer-blur-leave-collapse {
  filter: blur(16px);
  opacity: 0;
  transform: translateY(16px) scale(0.95);
  transition: filter 0.22s ease-in, opacity 0.22s ease-in, transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.answer-blur-enter-prep {
  filter: blur(16px);
  opacity: 0;
  transform: scale(0.96);
}

.answer-blur-enter-active {
  filter: blur(0px);
  opacity: 1;
  transform: scale(1);
  transition: 
    filter 0.36s cubic-bezier(0.16, 1, 0.3, 1), 
    opacity 0.3s ease-out, 
    transform 0.36s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Answer morph container styling */
.answer-morph-wrapper {
  transform-origin: center top;
  will-change: max-height, margin-top;
}

/* Input expand from left transition */
.input-slide-expand-enter-active {
  transition: max-width 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out, transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: right center;
}
.input-slide-expand-leave-active {
  transition: max-width 0.24s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.18s ease-in, transform 0.24s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: right center;
}
.input-slide-expand-enter-from,
.input-slide-expand-leave-to {
  max-width: 0 !important;
  opacity: 0;
  transform: scaleX(0.9) translateX(12px);
  overflow: hidden;
}
.input-slide-expand-enter-to,
.input-slide-expand-leave-from {
  max-width: 600px;
  opacity: 1;
  transform: scaleX(1) translateX(0);
}

/* Button inner content crossfade */
.btn-content-swap-enter-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.btn-content-swap-leave-active {
  transition: opacity 0.14s ease-in, transform 0.14s ease-in;
}
.btn-content-swap-enter-from {
  opacity: 0;
  transform: scale(0.85);
}
.btn-content-swap-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

/* Mode toggle switcher label swap */
.mode-toggle-swap-enter-active {
  transition: opacity 0.2s ease-out, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.mode-toggle-swap-leave-active {
  transition: opacity 0.12s ease-in, transform 0.12s ease-in;
}
.mode-toggle-swap-enter-from {
  opacity: 0;
  transform: translateY(-4px) scale(0.95);
}
.mode-toggle-swap-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.95);
}

/* Fade collapse for switcher and transcript card */
.fade-collapse-enter-active,
.fade-collapse-leave-active {
  transition: opacity 0.2s ease-out, max-height 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s ease-out;
  overflow: hidden;
}
.fade-collapse-enter-from,
.fade-collapse-leave-to {
  opacity: 0;
  max-height: 0 !important;
  transform: translateY(-6px);
}
.fade-collapse-enter-to,
.fade-collapse-leave-from {
  opacity: 1;
  max-height: 80px;
  transform: translateY(0);
}

/* Voice status caption smooth fade & collapse */
.caption-fade-enter-active {
  transition: opacity 0.22s ease-out, max-height 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}
.caption-fade-leave-active {
  transition: opacity 0.18s ease-in, max-height 0.22s cubic-bezier(0.4, 0, 0.2, 1), transform 0.18s ease-in;
  overflow: hidden;
}
.caption-fade-enter-from,
.caption-fade-leave-to {
  opacity: 0;
  max-height: 0 !important;
  transform: translateY(-4px);
}
.caption-fade-enter-to,
.caption-fade-leave-from {
  opacity: 1;
  max-height: 36px;
  transform: translateY(0);
}

/* Caption inner text swap */
.caption-swap-enter-active {
  transition: opacity 0.18s ease-out, transform 0.18s ease-out;
}
.caption-swap-leave-active {
  transition: opacity 0.12s ease-in, transform 0.12s ease-in;
}
.caption-swap-enter-from {
  opacity: 0;
  transform: translateY(-2px);
}
.caption-swap-leave-to {
  opacity: 0;
  transform: translateY(2px);
}

/* Voice popup floating transcript animation (zero layout shift) */
.voice-popup-scale-enter-active {
  transition: opacity 0.22s ease-out, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.voice-popup-scale-leave-active {
  transition: opacity 0.16s ease-in, transform 0.16s cubic-bezier(0.4, 0, 1, 1);
}
.voice-popup-scale-enter-from,
.voice-popup-scale-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
.voice-popup-scale-enter-to,
.voice-popup-scale-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
