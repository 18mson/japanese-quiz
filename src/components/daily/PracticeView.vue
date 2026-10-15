<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useVoiceAnswer } from '../../composables/useVoiceAnswer';
import { useTextToSpeech } from '../../composables/useTextToSpeech';
import DailyNavPaddles from './practice/DailyNavPaddles.vue';
import DailyQuestionPrompt from './practice/DailyQuestionPrompt.vue';
import DailyAnswerDisplay from './practice/DailyAnswerDisplay.vue';
import DailyActionInputBar from './DailyActionInputBar.vue';
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

// Lazy loaded wanakana instance
let wanakanaModule: any = null;
onMounted(async () => {
  try {
    wanakanaModule = await import('wanakana');
  } catch (e) {
    console.warn('Wanakana dynamic import failed:', e);
  }
});

// Composable Voice Recognition (Whisper + Web Speech Fallback)
const {
  isSupported: isSpeechSupported,
  isRecording,
  isProcessing,
  hasSpoken,
  transcript,
  interimTranscript,
  error: voiceError,
  mode: voiceMode,
  startRecording,
  stopRecording,
  cancelRecording,
  reset: resetVoice,
} = useVoiceAnswer();

function handleCancelVoice() {
  cancelRecording();
  inputText.value = '';
}

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
 * Deteksi akhir kalimat Jepang secara instan (Web Speech Mode):
 * Jika ucapan pengguna berakhiran predikat penutup kalimat Jepang
 * langsung kirim jawaban dalam 250ms tanpa menunggu jeda hening selesai
 */
function checkAndTriggerSentenceEndingAutoSubmit(text: string) {
  if (activeInputMode.value !== 'voice' || props.question.is_correct || props.submitting) return;
  const clean = text.trim();
  if (clean.length >= 3 && JAPANESE_SENTENCE_ENDING_REGEX.test(clean)) {
    if (autoSubmitTimer) clearTimeout(autoSubmitTimer);
    autoSubmitTimer = setTimeout(() => {
      if (activeInputMode.value === 'voice' && !props.question.is_correct && !props.submitting) {
        if (isRecording.value) {
          stopRecording();
        }
        handleSubmit();
      }
    }, 250);
  }
}

// Auto submit setelah pengguna selesai berbicara di voice mode (fallback silence detection untuk Web Speech)
watch(isRecording, (recording, wasRecording) => {
  if (wasRecording && !recording) {
    if (voiceMode.value === 'webspeech' && activeInputMode.value === 'voice' && inputText.value.trim() && !props.question.is_correct && !props.submitting) {
      if (autoSubmitTimer) clearTimeout(autoSubmitTimer);
      autoSubmitTimer = setTimeout(() => {
        handleSubmit();
      }, 500);
    }
  }
});

// Ketika transcript dari mic/whisper berubah, masukkan ke input text dan submit
watch(transcript, (newVal) => {
  if (newVal) {
    inputText.value = newVal;
    inputMethod.value = 'voice';
    if (voiceMode.value === 'whisper') {
      // Pada mode Whisper, hasil rekaman sudah final -> submit langsung
      handleSubmit();
    } else {
      checkAndTriggerSentenceEndingAutoSubmit(newVal);
    }
  }
});

// Cek juga interim transcript secara live pada Web Speech mode
watch(interimTranscript, (newVal) => {
  if (newVal && activeInputMode.value === 'voice' && voiceMode.value === 'webspeech') {
    checkAndTriggerSentenceEndingAutoSubmit(newVal);
  }
});

// Reset / restore input saat berganti soal atau saat memuat soal
watch(
  () => props.question.daily_question_id,
  () => {
    if (autoSubmitTimer) {
      clearTimeout(autoSubmitTimer);
      autoSubmitTimer = null;
    }
    inputMethod.value = 'text';
    resetVoice();
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

watch(activeInputMode, (mode) => {
  if (mode === 'keyboard' && isRecording.value) {
    stopRecording();
  }
});

watch(inputText, () => {
  if (activeInputMode.value === 'keyboard') {
    inputMethod.value = 'text';
  }
});

function toggleMic() {
  if (isRecording.value) {
    stopRecording();
  } else {
    inputText.value = '';
    resetVoice();
    const excludeAnswers = props.question.jp_answers || (props.question.correct_answer ? [props.question.correct_answer] : []);
    startRecording(props.question.chapter_id, excludeAnswers);
  }
}

const displayedVoiceTranscript = computed(() => {
  return (interimTranscript.value || transcript.value || inputText.value || '').trim();
});

function handleClear() {
  inputText.value = '';
  resetVoice();
  focusInput();
}

function handleSubmit() {
  const trimmed = inputText.value.trim();
  if (!trimmed || props.submitting || isQuestionCompleted.value) return;

  // Jika user mengetik huruf alfabet latin (romaji), konversikan ke kana
  let answerToSend = trimmed;
  if (wanakanaModule && /[a-zA-Z]/.test(trimmed)) {
    try {
      answerToSend = wanakanaModule.toKana(trimmed);
    } catch {}
  }

  if (isRecording.value) {
    stopRecording();
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

// Cache teks jawaban agar saat transisi keluar, teks tidak kosong tiba-tiba
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
  cancelRecording();
  window.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<template>
  <div class="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto flex flex-col gap-3 sm:gap-6 animate-fadeIn my-auto relative px-4 sm:px-8 lg:px-12">
    <!-- Left & Right Navigation Paddles -->
    <DailyNavPaddles
      :question-index="questionIndex"
      :total-questions="totalQuestions"
      :can-advance="canAdvance"
      :is-reviewing="isReviewing"
      :is-last-question="isLastQuestion"
      :all-completed="allCompleted"
      @prev="emit('prev')"
      @advance="handleAdvance"
    />

    <!-- Question Content (Indonesian Prompt & Word Hints) -->
    <DailyQuestionPrompt
      :question="question"
      :question-index="questionIndex"
      :total-questions="totalQuestions"
      :is-shaking="isShaking"
    />

    <!-- Answer Display Area (Furigana, Diff, Revealed) -->
    <DailyAnswerDisplay
      :question="question"
      :revealed-answer="revealedAnswer"
      :displayed-speakable-text="displayedSpeakableText"
      :last-answer-given="lastAnswerGiven"
    />

    <!-- Bottom Input & Controls Container - Hidden in Review Mode -->
    <DailyActionInputBar
      v-if="!isReviewing"
      ref="actionInputBarRef"
      v-model="inputText"
      :input-mode="activeInputMode"
      :action-state="mainActionState"
      :is-listening="isRecording"
      :has-spoken="hasSpoken"
      :is-processing="isProcessing"
      :voice-mode="voiceMode"
      :submitting="submitting"
      :is-completed="isQuestionCompleted"
      :is-last-question="isLastQuestion"
      :all-completed="allCompleted"
      :voice-transcript="displayedVoiceTranscript"
      :voice-error="voiceError"
      :is-speech-supported="isSpeechSupported"
      @update:input-mode="(mode) => activeInputMode = mode"
      @submit="handleSubmit"
      @advance="handleAdvance"
      @toggle-mic="toggleMic"
      @cancel-voice="handleCancelVoice"
      @clear="handleClear"
    />
  </div>
</template>

<style scoped>
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
</style>
