<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed, defineAsyncComponent } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { Check, X, AlertTriangle, HelpCircle, Volume2 } from '@lucide/vue';
import VirtualKeyboard from './VirtualKeyboard.vue';
import TierTransitionBadge from './common/TierTransitionBadge.vue';
import { extractKanjiFromWord } from '../services/kanjiInfoService';
import { useTextToSpeech } from '../composables/useTextToSpeech';

const KanjiInfoPopup = defineAsyncComponent(() => import('./KanjiInfoPopup.vue'));
import * as wanakana from 'wanakana';

const quizStore = useQuizStore();
const userInput = computed({
  get: () => quizStore.userInput,
  set: (val) => quizStore.userInput = val
});
const inputRef = ref<HTMLInputElement | null>(null);

const isTouchDevice = ref(false);

// Mode Input Huruf Jepang (Hiragana vs Katakana) khusus untuk meaning_to_words
const kanaInputMode = ref<'hiragana' | 'katakana'>('hiragana');

const isTargetKatakana = (word: any): boolean => {
  if (!word) return false;
  const katakanaRegex = /[\u30a1-\u30f6]/;
  const hiraganaRegex = /[\u3040-\u309f]/;
  const kanjiRegex = /[\u4e00-\u9faf]/;
  const char = word.character || '';
  const kana = word.kana || '';
  if (katakanaRegex.test(char) && !hiraganaRegex.test(char) && !kanjiRegex.test(char)) return true;
  if (katakanaRegex.test(kana) && !hiraganaRegex.test(kana)) return true;
  return false;
};

const setKanaMode = (mode: 'hiragana' | 'katakana') => {
  if (isAnswered.value) return;
  kanaInputMode.value = mode;
  if (userInput.value) {
    userInput.value = mode === 'katakana'
      ? wanakana.toKatakana(userInput.value)
      : wanakana.toHiragana(userInput.value);
  }
  focusInput();
};

const convertInputToKana = (val: string): string => {
  if (quizStore.activeQuestionType !== 'meaning_to_words') return val;
  return kanaInputMode.value === 'katakana'
    ? wanakana.toKatakana(val, { IMEMode: true })
    : wanakana.toHiragana(val, { IMEMode: true });
};

const handleInput = (event: Event) => {
  if (quizStore.interceptWarningMessage) {
    quizStore.clearInterceptWarning();
  }
  const target = event.target as HTMLInputElement;
  if (quizStore.activeQuestionType === 'meaning_to_words') {
    const converted = convertInputToKana(target.value);
    userInput.value = converted;
    target.value = converted;
  }
};

const focusInput = () => {
  nextTick(() => {
    if (inputRef.value && quizStore.selectedAnswer === null) {
      inputRef.value.focus();
    }
  });
};

const submitAnswer = () => {
  if (userInput.value.trim() === '') return;
  let finalAnswer = userInput.value.trim();
  if (quizStore.activeQuestionType === 'meaning_to_words') {
    // Finalize trailing single consonants like 'n' -> 'ん' / 'ン'
    finalAnswer = kanaInputMode.value === 'katakana'
      ? wanakana.toKatakana(finalAnswer)
      : wanakana.toHiragana(finalAnswer);
    userInput.value = finalAnswer;
  }
  quizStore.submitAnswer(finalAnswer);
};

const handleEnter = () => {
  if (quizStore.isWavePreviewActive || quizStore.showMicroPreviewModal || quizStore.justClosedPreview) return;
  if (Date.now() - quizStore.previewClosedTimestamp < 500) return;
  if (quizStore.selectedAnswer === null) {
    if (userInput.value.trim() !== '') {
      submitAnswer();
    } else {
      quizStore.submitAnswer(''); // Skip if empty on Enter
    }
  } else {
    quizStore.nextQuestion();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (quizStore.quizCompleted || quizStore.isWavePreviewActive || quizStore.showMicroPreviewModal || quizStore.justClosedPreview) return;
  if (Date.now() - quizStore.previewClosedTimestamp < 300) return;

  const target = event.target as HTMLElement | null;
  if (target && target !== inputRef.value && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
    return;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    handleEnter();
    return;
  }

  // Auto-focus and capture characters when user types directly on physical keyboard (MacBook/PC)
  if (quizStore.selectedAnswer === null) {
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      if (document.activeElement !== inputRef.value) {
        inputRef.value?.focus();
        if (quizStore.activeQuestionType === 'meaning_to_words') {
          userInput.value = convertInputToKana(userInput.value + event.key.toLowerCase());
        } else {
          userInput.value += event.key;
        }
        event.preventDefault();
      }
    } else if (event.key === 'Backspace' && document.activeElement !== inputRef.value) {
      if (userInput.value.length > 0) {
        userInput.value = userInput.value.slice(0, -1);
      }
      inputRef.value?.focus();
      event.preventDefault();
    }
  }
};

const handleGlobalClick = (event: MouseEvent) => {
  if (quizStore.selectedAnswer === null && !quizStore.isWavePreviewActive && !quizStore.showMicroPreviewModal) {
    const target = event.target as HTMLElement | null;
    if (target && !target.closest('button') && !target.closest('a') && !target.closest('.interactive-control')) {
      focusInput();
    }
  }
};

onMounted(() => {
  isTouchDevice.value = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  focusInput();
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('click', handleGlobalClick);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('click', handleGlobalClick);
});

// Refocus input, clear, and initialize kana input mode on next question
watch(() => quizStore.currentQuestionIndex, () => {
  userInput.value = '';
  if (quizStore.activeQuestionType === 'meaning_to_words') {
    kanaInputMode.value = isTargetKatakana(quizStore.currentQuestion) ? 'katakana' : 'hiragana';
  } else {
    kanaInputMode.value = 'hiragana';
  }
  focusInput();
}, { immediate: true });

// Watch preview modal dismissals to refocus input automatically
watch(
  [
    () => quizStore.isWavePreviewActive, 
    () => quizStore.showMicroPreviewModal, 
    () => quizStore.justClosedPreview
  ], 
  ([waveActive, microActive, justClosed]) => {
    if (waveActive || microActive) {
      inputRef.value?.blur();
    } else if (!justClosed) {
      setTimeout(() => {
        focusInput();
      }, 80);
    }
  }
);

const handleVirtualKey = (char: string) => {
  if (isAnswered.value) return;
  if (quizStore.activeQuestionType === 'meaning_to_words') {
    userInput.value = convertInputToKana(userInput.value + char.toLowerCase());
  } else {
    userInput.value += char;
  }
  focusInput();
};

const handleVirtualBackspace = () => {
  if (isAnswered.value) return;
  userInput.value = userInput.value.slice(0, -1);
  focusInput();
};

const handleVirtualEnter = () => {
  if (isAnswered.value) return;
  handleEnter();
  focusInput();
};

const { speak } = useTextToSpeech();

const playWordAudio = () => {
  const current = currentWord.value;
  if (!current) return;
  const text = (current as any).kana || current.character;
  if (text) speak(text);
};

// Mobile Scramble/Bubble Input Mode State
const mobileInputMode = ref<'qwerty' | 'scramble'>('qwerty');

onMounted(() => {
  try {
    const saved = localStorage.getItem('nihongo_mobile_input_mode');
    if (saved === 'scramble' || saved === 'qwerty') {
      mobileInputMode.value = saved;
    }
  } catch {}
});

const toggleMobileInputMode = () => {
  mobileInputMode.value = mobileInputMode.value === 'qwerty' ? 'scramble' : 'qwerty';
  try {
    localStorage.setItem('nihongo_mobile_input_mode', mobileInputMode.value);
  } catch {}
};

const activeTargetAnswer = computed(() => {
  const current = currentWord.value;
  if (!current) return '';
  if (quizStore.activeQuestionType === 'words_meaning') {
    return (current as any).meaning || '';
  }
  if (quizStore.activeQuestionType === 'meaning_to_words') {
    return (current as any).kana || current.character || '';
  }
  if (Array.isArray(current.romaji)) {
    return current.romaji[0] || '';
  }
  return current.romaji || '';
});

const activeScrambleMode = computed<'romaji' | 'kana' | 'meaning'>(() => {
  if (quizStore.activeQuestionType === 'words_meaning') return 'meaning';
  if (quizStore.activeQuestionType === 'meaning_to_words') return 'kana';
  return 'romaji';
});

const handleAppendChunk = ({ text, isMultiWord }: { text: string; isMultiWord: boolean }) => {
  if (isAnswered.value) return;
  if (isMultiWord) {
    if (userInput.value.length > 0 && !userInput.value.endsWith(' ')) {
      userInput.value += ' ' + text;
    } else {
      userInput.value += text;
    }
  } else {
    userInput.value += text;
  }
  focusInput();
};

const handleUndoChunk = ({ text, isMultiWord }: { text: string; isMultiWord: boolean }) => {
  if (isAnswered.value) return;
  if (isMultiWord) {
    const trimmed = userInput.value.trimEnd();
    const lastSpace = trimmed.lastIndexOf(' ');
    if (lastSpace >= 0) {
      userInput.value = trimmed.slice(0, lastSpace);
    } else {
      userInput.value = '';
    }
  } else {
    if (userInput.value.endsWith(text)) {
      userInput.value = userInput.value.slice(0, -text.length);
    } else {
      userInput.value = userInput.value.slice(0, -1);
    }
  }
  focusInput();
};

const handleClearInput = () => {
  if (isAnswered.value) return;
  userInput.value = '';
  focusInput();
};

const isAnswered = computed(() => quizStore.selectedAnswer !== null);

const currentWord = computed(() => quizStore.currentQuestion);

const placeholderText = computed(() => {
  if (quizStore.activeQuestionType === 'words_meaning') {
    return 'Ketik artinya...';
  }
  if (quizStore.activeQuestionType === 'meaning_to_words') {
    return kanaInputMode.value === 'katakana' 
      ? 'Ketik dalam Katakana (atau Kanji)...' 
      : 'Ketik dalam Hiragana (atau Kanji)...';
  }
  return 'Ketik romaji di sini...';
});

const inputModeInfo = computed(() => {
  const mode = quizStore.activeQuestionType;
  if (mode === 'words_meaning') {
    return {
      type: 'indonesia',
      label: 'ID',
      title: 'Target jawaban: Bahasa Indonesia',
      inputBorderClass: 'border-rose-300/90 dark:border-rose-900/70 focus:border-rose-500 dark:focus:border-rose-400 focus:ring-rose-100/60 dark:focus:ring-rose-950/40',
      badgeBg: 'bg-rose-50/90 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/90 dark:border-rose-800/80'
    };
  }
  if (mode === 'meaning_to_words') {
    return {
      type: 'japan',
      label: 'JP',
      title: 'Target jawaban: Bahasa Jepang (Kanji atau Kana)',
      inputBorderClass: 'border-indigo-300/90 dark:border-indigo-900/70 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-100/60 dark:focus:ring-indigo-950/40',
      badgeBg: 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/90 dark:border-indigo-800/80'
    };
  }
  return {
    type: 'romaji',
    label: 'RO',
    title: 'Target jawaban: Romaji (Huruf Latin)',
    inputBorderClass: 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-100/60 dark:focus:ring-indigo-950/40',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  };
});

import { useMasteryStore } from '../stores/masteryStore';

const masteryStore = useMasteryStore();

const isTypo = computed(() => {
  const lastAns = quizStore.userAnswers[quizStore.userAnswers.length - 1];
  return lastAns && lastAns.character === currentWord.value?.character && lastAns.isTypo;
});

const typoStatusMessage = computed(() => {
  if (!isTypo.value) return '';
  const char = currentWord.value?.character;
  const currentStreak = char ? (masteryStore.userStreaks[char] || 0) : 0;
  if (quizStore.latestTierTransition && quizStore.latestTierTransition.direction === 'down') {
    return 'Turun ke Hafal (Streak -1)';
  }
  if (currentStreak >= 6) {
    return 'Tetap Mahkota (Streak -1)';
  }
  if (currentStreak >= 3) {
    return 'Status Hafal aman (Streak tetap)';
  }
  return 'Salah ketik (+3 Poin, Streak tetap)';
});

// Kanji Details Popup State
const showKanjiPopup = ref(false);

const currentWordKanji = computed(() => {
  return extractKanjiFromWord(currentWord.value?.character || '');
});

const hasKanjiDetails = computed(() => {
  return currentWordKanji.value.length > 0;
});

watch(() => quizStore.currentQuestionIndex, () => {
  showKanjiPopup.value = false;
});

// Efek getar perangkat (haptics) saat jawaban salah
watch(() => quizStore.isAnswerCorrect, (isCorrect) => {
  if (isCorrect === false) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([50, 40, 50]);
      } catch {}
    }
  }
});

// Efek getar dan auto-select teks saat terjadi Smart Intercept salah mode
watch(() => quizStore.isInputShaking, (shaking) => {
  if (shaking) {
    nextTick(() => {
      inputRef.value?.focus();
      inputRef.value?.select();
    });
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 30, 40]);
      } catch {}
    }
  }
});
</script>

<template>
  <div class="w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto flex flex-col items-center pb-36 sm:pb-0">
    <!-- Smart Intercept Warning Banner (Anti-Salah Mode) -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-2 scale-95"
    >
      <div 
        v-if="quizStore.interceptWarningMessage" 
        class="w-full mb-3 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/80 border-2 border-amber-400 dark:border-amber-600 shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100 text-center animate-shake z-30"
        role="alert"
      >
        <AlertTriangle class="w-4 h-4 text-amber-500 shrink-0" />
        <span>{{ quizStore.interceptWarningMessage }}</span>
      </div>
    </transition>

    <!-- Typing Area -->
    <div class="w-full mb-6 relative">
      <!-- Input Mode / Flag Badge on the Left -->
      <div 
        v-if="!isAnswered" 
        class="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 flex items-center select-none pointer-events-none z-10"
        :title="inputModeInfo.title"
      >
        <div 
          class="flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-bold shadow-2xs transition-all duration-200"
          :class="inputModeInfo.badgeBg"
        >
          <!-- Indonesia Flat Flag SVG -->
          <svg 
            v-if="inputModeInfo.type === 'indonesia'"
            class="w-4 h-3 rounded-[2.5px] overflow-hidden border border-black/15 dark:border-white/20 shrink-0" 
            viewBox="0 0 20 14" 
            fill="none"
          >
            <rect width="20" height="7" fill="#E11D48" />
            <rect y="7" width="20" height="7" fill="#FFFFFF" />
          </svg>

          <!-- Japan Flat Flag SVG -->
          <svg 
            v-else-if="inputModeInfo.type === 'japan'"
            class="w-4 h-3 rounded-[2.5px] overflow-hidden border border-black/15 dark:border-white/20 shrink-0" 
            viewBox="0 0 20 14" 
            fill="none"
          >
            <rect width="20" height="14" fill="#FFFFFF" />
            <circle cx="10" cy="7" r="4.2" fill="#BC002D" />
          </svg>

          <!-- Romaji Flat Badge Icon -->
          <div 
            v-else
            class="w-4 h-3 rounded-[2.5px] bg-slate-200 dark:bg-slate-700 flex items-center justify-center border border-black/15 dark:border-white/20 shrink-0"
          >
            <span class="text-[9px] font-black font-mono leading-none text-slate-700 dark:text-slate-200">A</span>
          </div>

          <span class="text-[11px] font-extrabold font-mono tracking-tight">{{ inputModeInfo.label }}</span>
        </div>
      </div>

      <input
        ref="inputRef"
        v-model="userInput"
        type="text"
        :inputmode="isTouchDevice ? 'none' : 'text'"
        :placeholder="placeholderText"
        class="w-full pl-20 sm:pl-24 py-4 text-xl font-bold text-center bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-2 rounded-xl transition-all duration-300 outline-none focus:ring-4 disabled:bg-gray-50 dark:disabled:bg-slate-900 disabled:text-gray-500 dark:disabled:text-slate-500 disabled:cursor-not-allowed"
        :class="[
          quizStore.activeQuestionType === 'meaning_to_words' ? 'pr-20 sm:pr-24' : 'pr-20 sm:pr-24',
          !isAnswered ? inputModeInfo.inputBorderClass : '',
          {
            'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/40 focus:ring-emerald-100/50': isAnswered && quizStore.isAnswerCorrect,
            'border-rose-500 bg-rose-50/30 dark:bg-rose-950/40 focus:ring-rose-100/50 animate-shake': isAnswered && !quizStore.isAnswerCorrect,
            '!border-amber-500 !bg-amber-50/40 dark:!bg-amber-950/40 !ring-4 !ring-amber-200/60 dark:!ring-amber-900/60 animate-shake': quizStore.isInputShaking
          }
        ]"
        :disabled="isAnswered"
        @input="handleInput"
        @keydown.enter.stop="handleEnter"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
      />
      <!-- Right Side Controls inside Input (Hanya Switch Hiragana/Katakana untuk mode Indo -> Jepang) -->
      <div v-if="!isAnswered && quizStore.activeQuestionType === 'meaning_to_words'" class="absolute right-3 sm:right-3.5 top-1/2 -translate-y-1/2 flex items-center z-20">
        <!-- Switch Hiragana / Katakana khusus mode Kotoba Indonesia -> Jepang -->
        <div 
          class="inline-flex items-center p-0.5 rounded-lg bg-gray-100 dark:bg-slate-700/80 border border-gray-200/90 dark:border-slate-600/80 shadow-2xs"
          role="group"
          aria-label="Pilih mode huruf Jepang"
        >
          <button
            type="button"
            class="px-2 py-0.5 text-xs font-bold rounded-md transition-all duration-150 cursor-pointer select-none font-jp active:scale-95"
            :class="kanaInputMode === 'hiragana' 
              ? 'bg-indigo-600 text-white shadow-xs dark:bg-torii' 
              : 'text-gray-500 dark:text-slate-300 hover:text-gray-800 dark:hover:text-white'"
            @click.stop="setKanaMode('hiragana')"
            title="Ubah ke mode Hiragana (あ)"
          >
            あ
          </button>
          <button
            type="button"
            class="px-2 py-0.5 text-xs font-bold rounded-md transition-all duration-150 cursor-pointer select-none font-jp active:scale-95"
            :class="kanaInputMode === 'katakana' 
              ? 'bg-indigo-600 text-white shadow-xs dark:bg-torii' 
              : 'text-gray-500 dark:text-slate-300 hover:text-gray-800 dark:hover:text-white'"
            @click.stop="setKanaMode('katakana')"
            title="Ubah ke mode Katakana (ア)"
          >
            ア
          </button>
        </div>
      </div>
    </div>

    <!-- Actions are rendered globally in bottom navbar -->

    <!-- Post-Answer Detailed Feedback (Animate Slide Up) -->
    <div v-if="isAnswered" class="w-full flex flex-col items-center animate-slideUp">
      <!-- Status Card -->
      <div 
        class="w-full rounded-2xl p-4 sm:p-5 mb-4 text-center border transition-all duration-300 animate-pulse-subtle"
        :class="[
          quizStore.isAnswerCorrect 
            ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
            : (isTypo 
              ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200' 
              : 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200')
        ]"
      >
        <div class="flex flex-col items-center gap-2">
          <!-- Checkmark/cross icon & Mastery Tier Transition Toast Row -->
          <div class="flex items-center justify-center gap-2.5 sm:gap-3 mb-2 flex-wrap">
            <div 
              class="w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform scale-100 duration-500 animate-icon-pop shrink-0"
              :class="quizStore.isAnswerCorrect ? 'bg-emerald-500' : (isTypo ? 'bg-amber-500' : 'bg-rose-500')"
            >
              <Check v-if="quizStore.isAnswerCorrect" class="w-6 h-6 stroke-[3px]" />
              <AlertTriangle v-else-if="isTypo" class="w-6 h-6 stroke-[2.5px]" />
              <X v-else class="w-6 h-6 stroke-[3px]" />
            </div>

            <!-- Tier Transition Badge (Hafal / Crown / Proses / Turun) beside the result icon -->
            <TierTransitionBadge :transition="quizStore.latestTierTransition" />
          </div>

          <h3 class="text-2xl font-bold tracking-tight">
            <template v-if="quizStore.isAnswerCorrect">Benar!</template>
            <template v-else-if="isTypo">Hampir! Salah ketik (+3 Poin)</template>
            <template v-else>Salah</template>
          </h3>
          <p 
            v-if="isTypo && typoStatusMessage"
            class="text-xs font-semibold text-amber-700 dark:text-amber-300 mt-0.5"
          >
            {{ typoStatusMessage }}
          </p>
        </div>

        <!-- Tombol Aksi Tambahan Saat Jawaban Salah: Dengar Pelafalan & Bedah Kanji -->
        <div v-if="!quizStore.isAnswerCorrect" class="mt-3 pt-3 border-t border-dashed border-gray-300/50 dark:border-slate-700/60 flex items-center justify-center gap-2 flex-wrap">
          <button
            type="button"
            id="btn-play-word-audio-input"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer border bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-700 dark:text-torii-light border-indigo-200 dark:border-slate-700 active:scale-95"
            @click="playWordAudio"
            title="Dengarkan pelafalan bahasa Jepang lagi"
          >
            <Volume2 class="w-3.5 h-3.5 text-indigo-600 dark:text-torii shrink-0" />
            <span>Dengar Pelafalan</span>
          </button>

          <button
            v-if="hasKanjiDetails"
            type="button"
            id="btn-kanji-detail-input"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer border bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700 ring-2 ring-rose-400/40 animate-pulse-subtle"
            @click="showKanjiPopup = true"
            :title="`Bedah komponen & arti kanji ${currentWord?.character}`"
          >
            <HelpCircle class="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Bedah Kanji</span>
          </button>
        </div>
      </div>

      <!-- Popup Detail Kanji -->
      <KanjiInfoPopup
        :is-open="showKanjiPopup"
        :target-word="currentWord?.character"
        @close="showKanjiPopup = false"
      />

      <!-- Next button is rendered globally in bottom navbar -->
    </div>
  </div>

  <!-- Mobile Virtual Keyboard -->
  <div v-if="!isAnswered" class="block sm:hidden fixed bottom-0 left-0 right-0 z-40">
    <VirtualKeyboard
      theme="auto"
      enter-label="SUBMIT"
      :disabled="isAnswered"
      :enable-scramble="true"
      :input-mode="mobileInputMode"
      :target-answer="activeTargetAnswer"
      :scramble-mode="activeScrambleMode"
      @key="handleVirtualKey"
      @backspace="handleVirtualBackspace"
      @enter="handleVirtualEnter"
      @append="handleAppendChunk"
      @undo-chunk="handleUndoChunk"
      @clear="handleClearInput"
    >
      <template #top>
        <!-- Tombol Skip (Kiri) -->
        <button
          type="button"
          class="px-3.5 py-1.5 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 font-bold rounded-lg text-xs transition border border-gray-300 dark:border-slate-600 flex items-center gap-1 cursor-pointer select-none active:scale-95 touch-manipulation"
          @touchstart.prevent="quizStore.submitAnswer('')"
          @mousedown.prevent="quizStore.submitAnswer('')"
        >
          <span>Skip</span>
          <span class="text-[10px]">⏭</span>
        </button>

        <!-- Tombol Switch Mode Input (Di seberang tombol Skip / Kanan) -->
        <button
          type="button"
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer select-none active:scale-95 touch-manipulation"
          :class="mobileInputMode === 'scramble' 
            ? 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 ring-2 ring-amber-400/30' 
            : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-700 dark:text-torii-light border-indigo-200 dark:border-slate-700'"
          @touchstart.prevent="toggleMobileInputMode"
          @mousedown.prevent="toggleMobileInputMode"
          :title="mobileInputMode === 'scramble' ? 'Beralih ke Keyboard Ketik Biasa' : 'Beralih ke Mode Susun Kata/Huruf'"
        >
          <span v-if="mobileInputMode === 'scramble'">🧩 Mode Susun</span>
          <span v-else>⌨️ Mode Ketik</span>
        </button>
      </template>
    </VirtualKeyboard>
  </div>
</template>

<style scoped>
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes iconPop {
  0% {
    transform: scale(0.6);
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1.0);
  }
}

.animate-slideUp {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-icon-pop {
  animation: iconPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  15%, 45%, 75% {
    transform: translateX(-7px);
  }
  30%, 60%, 90% {
    transform: translateX(7px);
  }
}

.animate-shake {
  animation: shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
</style>
