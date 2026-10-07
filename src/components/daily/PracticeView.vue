<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
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
  }>(),
  {
    allCompleted: false
  }
);

const emit = defineEmits<{
  (e: 'submit', text: string, inputMethod: 'text' | 'voice'): void;
  (e: 'next'): void;
  (e: 'prev'): void;
  (e: 'finish'): void;
  (e: 'toggleAutoKana'): void;
}>();

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
    }
  },
  { immediate: true }
);

// Munculkan toast HANYA saat baru saja menginput jawaban dan benar
watch(
  () => props.question.is_correct,
  (newVal, oldVal) => {
    if (newVal && !oldVal) {
      triggerAdvanceToast();
    }
  }
);

const isComposing = ref(false);
const kanaMode = ref<'hiragana' | 'katakana'>('hiragana');

function toggleKanaMode() {
  const nextMode = kanaMode.value === 'hiragana' ? 'katakana' : 'hiragana';
  kanaMode.value = nextMode;

  // Jika sudah ada teks di input, bantu ubah kana sesuai mode baru
  if (inputText.value && wanakanaModule) {
    try {
      if (nextMode === 'katakana') {
        inputText.value = wanakanaModule.toKatakana(inputText.value);
      } else {
        inputText.value = wanakanaModule.toHiragana(inputText.value);
      }
    } catch {}
  }
}

function convertRomaji(text: string): string {
  if (!wanakanaModule) return text;
  // Jika tidak mengandung huruf Latin (A-Z/a-z), jangan disentuh agar IME Jepang/Kanji tidak terganggu
  if (!/[a-zA-Z]/.test(text)) {
    return text;
  }

  try {
    if (kanaMode.value === 'katakana') {
      return wanakanaModule.toKatakana(text, { IMEMode: true });
    } else {
      // toKana: huruf kecil jadi hiragana, huruf besar jadi katakana, kanji & katakana asli tetap utuh
      return wanakanaModule.toKana(text, { IMEMode: true });
    }
  } catch {
    return text;
  }
}

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  let val = target.value;

  // Jika sedang proses composition IME (keyboard Jepang asli), jangan timpa input
  if (isComposing.value) {
    inputText.value = val;
    inputMethod.value = 'text';
    return;
  }

  if (props.autoKana && wanakanaModule) {
    val = convertRomaji(val);
  }

  inputText.value = val;
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
}

function handleSubmit() {
  let trimmed = inputText.value.trim();
  if (!trimmed || props.submitting || props.question.is_correct) return;

  // Pastikan huruf n di akhir atau karakter pending terkonversi sempurna jika masih ada romaji
  if (props.autoKana && wanakanaModule && /[a-zA-Z]/.test(trimmed)) {
    try {
      if (kanaMode.value === 'katakana') {
        trimmed = wanakanaModule.toKatakana(trimmed);
      } else {
        trimmed = wanakanaModule.toKana(trimmed);
      }
      inputText.value = trimmed;
    } catch {}
  }

  if (isListening.value) {
    stopListening();
  }

  lastAnswerGiven.value = trimmed;
  emit('submit', trimmed, inputMethod.value);
}

// Trigger efek getar (shake) jika salah
watch(
  () => props.question.attempts,
  (newAttempts, oldAttempts) => {
    if (newAttempts > oldAttempts && !props.question.is_correct) {
      isShaking.value = true;
      setTimeout(() => {
        isShaking.value = false;
      }, 500);
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
const canAdvance = computed(() => props.question.is_correct || props.question.attempts >= 3);

function handleAdvance() {
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
  // Hanya trigger tombol selanjutnya jika soalnya SUDAH terjawab benar
  if (e.key === 'Enter' && props.question.is_correct && !props.submitting) {
    e.preventDefault();
    handleAdvance();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
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
  <div class="w-full max-w-4xl lg:max-w-5xl mx-auto flex flex-col gap-6 animate-fadeIn my-auto relative px-2 sm:px-4">
    <!-- Left Navigation Paddle (Fixed at Left Edge) -->
    <button
      type="button"
      @click="emit('prev')"
      :disabled="questionIndex === 0"
      class="fixed left-2 sm:left-5 lg:left-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/95 dark:bg-slate-800/95 shadow-2xl border border-slate-200/90 dark:border-slate-700/90 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-110 active:scale-95 disabled:opacity-20 disabled:pointer-events-none transition-all z-30 cursor-pointer backdrop-blur-md"
      title="Soal Sebelumnya"
      aria-label="Soal Sebelumnya"
    >
      <ChevronLeft class="w-6 h-6 sm:w-7 sm:h-7" />
    </button>

    <!-- Right Navigation Paddle (Fixed at Right Edge) with Toast Popup (Muncul 2s saat baru saja benar) -->
    <div class="fixed right-2 sm:right-5 lg:right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-end">
      <!-- Toast Popup Floating Above Right Paddle -->
      <transition name="toast-pop">
        <div 
          v-if="showAdvanceToast"
          class="absolute bottom-full mb-3 right-0 flex flex-col items-end pointer-events-none select-none z-40 whitespace-nowrap"
        >
          <div class="px-3.5 py-1.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-black text-xs shadow-xl flex items-center gap-1.5 border border-emerald-400/40">
            <Sparkles class="w-3.5 h-3.5 text-amber-200" />
            <span>{{ isLastQuestion && allCompleted ? 'Selesai! Lihat Hasil (Enter)' : 'Lanjut (Enter)' }}</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </div>
          <!-- Little arrow pointing down to button -->
          <div class="w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-emerald-600 dark:border-t-emerald-500 mr-4 sm:mr-5"></div>
        </div>
      </transition>

      <button
        type="button"
        @click="handleAdvance"
        :disabled="questionIndex >= totalQuestions - 1 && !(isLastQuestion && allCompleted)"
        :class="[
          'w-11 h-11 sm:w-14 sm:h-14 rounded-full shadow-2xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md hover:scale-110 active:scale-95',
          canAdvance
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white ring-4 ring-emerald-400/50 shadow-emerald-500/30 border border-emerald-400'
            : 'bg-white/95 dark:bg-slate-800/95 border border-slate-200/90 dark:border-slate-700/90 text-slate-700 dark:text-slate-200 disabled:opacity-20 disabled:pointer-events-none'
        ]"
        :title="isLastQuestion && allCompleted ? 'Selesaikan Latihan' : 'Soal Berikutnya'"
        :aria-label="isLastQuestion && allCompleted ? 'Selesaikan Latihan' : 'Soal Berikutnya'"
      >
        <ChevronRight class="w-6 h-6 sm:w-7 sm:h-7" />
      </button>
    </div>

    <!-- Question Content (No enclosing card/container, expansive full-width text) -->
    <div 
      :class="[
        'w-full flex flex-col items-center text-center transition-all duration-300 py-3 sm:py-6',
        isShaking ? 'animate-shake' : ''
      ]"
    >
      <!-- Question meta row -->
      <div class="flex items-center justify-center gap-2.5 mb-3 sm:mb-5">
        <span class="text-xs font-bold text-slate-400">
          Soal {{ questionIndex + 1 }} dari {{ totalQuestions }}
        </span>
        <!-- Attempts badge -->
        <span 
          v-if="!question.is_correct" 
          :class="[
            'px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
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

      <!-- Indonesian prompt text (Hero Typography across screen) -->
      <div class="my-2 sm:my-4 px-3 w-full">
        <span class="text-xs sm:text-sm font-black text-indigo-600 dark:text-torii uppercase tracking-widest block mb-2 sm:mb-4">
          Terjemahkan ke Bahasa Jepang
        </span>
        <h2 class="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight max-w-4xl mx-auto break-words">
          {{ question.id_text }}
        </h2>
      </div>

      <!-- Penanda Jawaban Benar (Banner Sukses Eksplisit) -->
      <transition name="toast-pop">
        <div 
          v-if="question.is_correct" 
          class="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl bg-emerald-500 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-500/25 border border-emerald-400/60"
        >
          <CheckCircle2 class="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <span>Jawaban Anda Benar! (正解)</span>
        </div>
      </transition>

      <!-- Audio playback banner & Answer text (Tanpa card/border pembungkus) -->
      <div 
        v-if="canShowAudio" 
        class="mt-5 sm:mt-7 flex items-center justify-center gap-3 sm:gap-5 px-3 max-w-4xl w-full animate-fadeIn"
      >
        <SpeakerButton :text="speakableText" size="md" class="shrink-0" />
        <span class="text-3xl sm:text-5xl md:text-6xl font-japanese font-black text-slate-900 dark:text-slate-100 tracking-wide leading-relaxed break-words text-left">
          <FuriganaText :text="speakableText" />
        </span>
      </div>

      <!-- Revealed Answer (Tanpa container card tebal) -->
      <div 
        v-else-if="revealedAnswer" 
        class="mt-5 sm:mt-7 flex flex-col items-center justify-center gap-2 px-3 max-w-4xl w-full animate-fadeIn"
      >
        <div class="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">
          <Eye class="w-4 h-4" />
          <span>Kunci Jawaban Terbuka:</span>
          <SpeakerButton :text="revealedAnswer" size="sm" />
        </div>
        <div class="text-3xl sm:text-4xl md:text-5xl font-japanese font-black text-slate-900 dark:text-slate-100 tracking-wide leading-relaxed break-words">
          <FuriganaText :text="revealedAnswer" />
        </div>
        <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Pelajari struktur kalimat di atas, lalu lanjutkan ke soal berikutnya.
        </div>
      </div>
    </div>

    <!-- Bottom Input & Controls Container (Dynamic Auto-Expanding Width) -->
    <div class="w-fit min-w-[320px] sm:min-w-[440px] max-w-[calc(100vw-2.5rem)] sm:max-w-[calc(100vw-5rem)] md:max-w-5xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-3 sm:p-4.5 flex flex-col gap-2.5 transition-all duration-150">
      <!-- Input bar with Clear button, Mic & Submit/Advance Button -->
      <div class="relative flex items-center gap-2 sm:gap-3 w-full">
        <!-- Dynamic Auto-Expanding Input Container -->
        <div class="relative inline-grid items-center flex-1 min-w-[200px] sm:min-w-[280px] max-w-full">
          <!-- Invisible Mirror Span to expand the grid with input text length -->
          <span
            aria-hidden="true"
            class="invisible col-start-1 row-start-1 whitespace-pre pl-4 pr-11 py-3.5 sm:py-4 text-xl sm:text-2xl md:text-3xl font-normal font-japanese pointer-events-none select-none max-w-full overflow-hidden"
          >
            {{ inputText }}
          </span>

          <input
            type="text"
            :value="inputText"
            @input="handleInput"
            @compositionstart="handleCompositionStart"
            @compositionend="handleCompositionEnd"
            @keydown.enter.prevent="handleInputEnter"
            :disabled="question.is_correct || submitting"
            :placeholder="question.is_correct ? 'Soal sudah terjawab benar' : (isListening ? 'Mendengarkan...' : 'Ketik kalimat atau tekan mic...')"
            class="col-start-1 row-start-1 w-full pl-4 pr-11 py-3.5 sm:py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal placeholder:font-sans placeholder:text-sm sm:placeholder:text-base placeholder:tracking-normal font-normal text-xl sm:text-2xl md:text-3xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-torii/50 transition-all font-japanese leading-relaxed"
          />

          <!-- Clear button -->
          <button
            v-if="inputText && !question.is_correct"
            type="button"
            @click="handleClear"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 cursor-pointer transition z-10"
            title="Hapus ketikan"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Kana Mode Switcher (Hiragana あ / Katakana ア) -->
        <button
          type="button"
          @click="toggleKanaMode"
          :disabled="question.is_correct || submitting"
          :class="[
            'px-3 sm:px-3.5 py-3.5 sm:py-4 rounded-2xl border transition-all duration-200 flex items-center justify-center cursor-pointer flex-shrink-0 select-none shadow-xs font-japanese font-black text-base sm:text-lg min-w-[44px] sm:min-w-[50px]',
            kanaMode === 'katakana'
              ? 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/70 dark:hover:bg-amber-900/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 ring-2 ring-amber-400/30'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-700 dark:text-torii-light border-slate-200 dark:border-slate-700'
          ]"
          :title="`Mode Kana: ${kanaMode === 'katakana' ? 'Katakana (ア)' : 'Hiragana (あ)'} - Klik untuk ubah mode tulisan atau konversi teks`"
        >
          <span>{{ kanaMode === 'katakana' ? 'ア' : 'あ' }}</span>
        </button>

        <!-- Mic Button -->
        <button
          v-if="isSpeechSupported"
          type="button"
          @click="toggleMic"
          :disabled="question.is_correct || submitting"
          :class="[
            'p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex items-center justify-center cursor-pointer flex-shrink-0 select-none shadow-xs min-w-[48px] sm:min-w-[56px]',
            isListening
              ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600 ring-4 ring-rose-400/30 animate-pulse'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          ]"
          :title="isListening ? 'Hentikan rekaman mic' : 'Rekam suara (ja-JP)'"
        >
          <Mic v-if="!isListening" class="w-5 h-5 text-indigo-600 dark:text-torii" />
          <MicOff v-else class="w-5 h-5 text-white" />
        </button>

        <!-- Submit or Advance Button -->
        <button
          v-if="!question.is_correct"
          type="button"
          @click="handleSubmit"
          :disabled="!inputText.trim() || submitting"
          :class="[
            'py-3.5 sm:py-4 px-5 sm:px-7 rounded-2xl font-extrabold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0 select-none shadow-sm min-w-[92px] sm:min-w-[110px]',
            inputText.trim() && !submitting
              ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-torii dark:hover:bg-torii-hover text-white active:scale-95'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-300/40 dark:border-slate-700/40'
          ]"
        >
          <div v-if="submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <Send v-else class="w-4 h-4" />
          <span>Kirim</span>
        </button>

        <!-- Ketika Benar: Tombol berubah jadi Lanjut (Hijau) -->
        <button
          v-else
          type="button"
          @click="handleAdvance"
          class="py-3.5 sm:py-4 px-5 sm:px-7 rounded-2xl font-extrabold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0 select-none shadow-md min-w-[92px] sm:min-w-[110px] bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95 ring-2 ring-emerald-400/40"
        >
          <span>{{ isLastQuestion && allCompleted ? 'Selesai' : 'Lanjut' }}</span>
          <ChevronRight class="w-4 h-4" />
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
  font-size: 0.95rem !important;
  letter-spacing: normal !important;
}
@media (min-width: 640px) {
  input::placeholder {
    font-size: 1.05rem !important;
  }
}
</style>
