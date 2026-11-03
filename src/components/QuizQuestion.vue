<script setup lang="ts">
import { computed, watch } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { Lightbulb, BookOpen, RotateCcw, Volume2 } from '@lucide/vue';
import { useTextToSpeech } from '../composables/useTextToSpeech';
import { decomposeWordToSegments } from '../utils/furiganaParser';

const quizStore = useQuizStore();
const { speak } = useTextToSpeech();

const showReadingHint = computed({
  get: () => quizStore.showReadingHint,
  set: (val) => quizStore.showReadingHint = val
});
const showMeaningHint = computed({
  get: () => quizStore.showMeaningHint,
  set: (val) => {
    if (val) quizStore.openMeaningHint();
    else quizStore.showMeaningHint = false;
  }
});

const character = computed(() => {
  return quizStore.currentQuestion?.character || '';
});

const isWord = computed(() => {
  return quizStore.currentQuestion?.type === 'word';
});

const currentKana = computed(() => {
  return (quizStore.currentQuestion as any)?.kana || '';
});

const wordSegments = computed(() => {
  if (!character.value) return [];
  return decomposeWordToSegments(character.value, currentKana.value || '');
});

const hasValidReadingHint = computed(() => {
  const kana = currentKana.value.trim();
  if (!kana) return false;
  // Hide hint if it contains any Latin characters (Romaji)
  return !/[a-zA-Z]/.test(kana);
});

const currentMeaning = computed(() => {
  return (quizStore.currentQuestion as any)?.meaning || '';
});

const firstCharKana = computed(() => {
  const kana = currentKana.value || character.value;
  return kana ? kana.charAt(0) : '';
});

const firstCharRomaji = computed(() => {
  const rom = Array.isArray(quizStore.currentQuestion?.romaji) 
    ? quizStore.currentQuestion.romaji[0] 
    : quizStore.currentQuestion?.romaji || '';
  return rom ? rom.charAt(0).toUpperCase() : '';
});

const playWordAudio = () => {
  const text = currentKana.value || character.value;
  if (text) speak(text);
};

// Putar otomatis pelafalan kata kotoba secara instan ketika jawaban salah
watch(() => quizStore.selectedAnswer, (ans) => {
  if (ans !== null && quizStore.isAnswerCorrect === false) {
    const text = currentKana.value || character.value;
    if (text) {
      setTimeout(() => {
        // Pastikan masih di state yang sama
        if (quizStore.selectedAnswer !== null && quizStore.isAnswerCorrect === false) {
          playWordAudio();
        }
      }, 180);
    }
  }
});

const reasonLabel = computed(() => {
  return (quizStore.currentQuestion as any)?.reasonLabel || '';
});

const questionReason = computed(() => {
  return (quizStore.currentQuestion as any)?.questionReason || 'weak';
});

const romajiList = computed<string[]>(() => {
  const current = quizStore.currentQuestion;
  if (!current) return [];
  if (Array.isArray(current.romaji)) return current.romaji;
  return current.romaji ? [current.romaji] : [];
});

const correctRomajiDisplay = computed(() => {
  const current = quizStore.currentQuestion;
  if (!current) return '';
  return Array.isArray(current.romaji) 
    ? current.romaji.join(' atau ') 
    : (current.romaji || '');
});

const isTypo = computed(() => {
  return quizStore.isAnswerTypo;
});

const instructionText = computed(() => {
  if (quizStore.questionType === 'words_meaning') {
    return 'Ketik arti bahasa Indonesia dari kata ini!';
  }
  if (quizStore.questionType === 'meaning_to_words') {
    return 'Ketik dalam bahasa Jepang (Kanji, Kana, atau Romaji)!';
  }
  if (quizStore.isTypingMode) {
    return isWord.value 
      ? 'Ketik romaji dari kata ini!' 
      : 'Ketik romaji dari karakter ini!';
  } else {
    return 'Pilih romaji yang tepat untuk karakter ini!';
  }
});
</script>

<template>
  <div class="flex flex-col items-center my-2 w-full flex-shrink-0">
    <!-- Reason Badge (Only shown for retry/perbaikan questions) -->
    <div 
      v-if="questionReason === 'repeat' && reasonLabel" 
      class="mb-2 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border bg-white/95 text-rose-700 border-rose-300/90 dark:bg-slate-900/95 dark:text-rose-300 dark:border-rose-700/80 animate-fadeIn select-none"
    >
      <RotateCcw class="w-3.5 h-3.5 text-rose-500 shrink-0" />
      <span>{{ reasonLabel.replace(/^[\p{Emoji}\p{Symbol}\s]+/gu, '') }}</span>
    </div>

    <!-- Question Character / Word Area -->
    <div
      :class="[
        'flex flex-col items-center justify-start bg-transparent border-0 shadow-none px-4 pt-2 pb-1 mb-2',
        isWord 
          ? 'w-full max-w-xl md:max-w-3xl lg:max-w-4xl' 
          : 'w-full max-w-xs sm:max-w-sm'
      ]"
    >
      <transition name="question-blur" mode="out-in">
        <div :key="quizStore.currentQuestionIndex" class="flex flex-col items-center text-center w-full">
          <!-- Mode 1: Meaning to Words (Prompt is the Indonesian Meaning) -->
          <template v-if="quizStore.questionType === 'meaning_to_words'">
            <span class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight leading-snug select-none px-2 max-w-2xl lg:max-w-3xl">
              {{ currentMeaning }}
            </span>

            <!-- Hints for Meaning to Words Mode -->
            <div v-if="quizStore.selectedAnswer === null" class="mt-3 sm:mt-4 flex gap-2.5 sm:gap-3 flex-wrap justify-center items-center min-h-[36px]">
              <!-- Audio Speech Hint -->
              <button 
                type="button"
                class="text-xs sm:text-sm font-semibold px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-indigo-600 dark:text-torii-light rounded-full border border-gray-200 dark:border-slate-700 transition-all duration-200 cursor-pointer focus:outline-none flex items-center gap-1.5 active:scale-95"
                @click="playWordAudio"
                title="Dengarkan pelafalan bahasa Jepang"
              >
                <Volume2 class="w-4 h-4 text-indigo-600 dark:text-torii shrink-0" />
                <span>Dengar Pelafalan</span>
              </button>

              <!-- First Letter Hint -->
              <button 
                v-if="!showReadingHint"
                type="button"
                class="text-xs sm:text-sm font-semibold px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-indigo-600 dark:text-torii-light rounded-full border border-gray-200 dark:border-slate-700 transition-all duration-200 cursor-pointer focus:outline-none flex items-center gap-1.5 active:scale-95"
                @click="showReadingHint = true"
              >
                <Lightbulb class="w-4 h-4 text-indigo-600 dark:text-torii shrink-0" />
                <span>Petunjuk Huruf</span>
              </button>
              <span v-else class="text-xs sm:text-sm font-bold text-indigo-700 dark:text-torii-light bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full animate-hintPop">
                Awal: <span class="font-jp">{{ firstCharKana }}</span> ({{ firstCharRomaji }}...)
              </span>
            </div>
          </template>

          <!-- Mode 2 & Standard: Display Japanese Character/Word with Furigana -->
          <template v-else>
            <span 
              :class="[
                'text-gray-900 dark:text-slate-100 font-black tracking-wide font-jp whitespace-nowrap select-none inline-block text-center',
                isWord 
                  ? (character.length > 6 ? 'text-3xl sm:text-4xl' : (character.length > 3 ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl'))
                  : (character.length >= 2 ? 'text-5xl sm:text-6xl' : 'text-6xl sm:text-7xl')
              ]"
            ><template v-for="(seg, idx) in wordSegments" :key="idx"><ruby v-if="seg.isRuby" class="ruby-word">{{ seg.text }}<rt 
                    :class="[
                      'text-[0.52em] font-bold tracking-tight transition-opacity duration-300 select-none pointer-events-none text-rose-500 dark:text-torii-light',
                      quizStore.selectedAnswer !== null 
                        ? 'opacity-100' 
                        : 'opacity-0'
                    ]"
                  >{{ seg.reading }}</rt></ruby><template v-else>{{ seg.text }}</template></template></span>
            
            <!-- Interactive Hints (Only for Words when not answered yet) -->
            <div v-if="isWord && quizStore.selectedAnswer === null" class="mt-3 sm:mt-4 flex gap-2.5 sm:gap-3 flex-wrap justify-center items-center min-h-[36px]">
              <!-- Reading Hint Button/Pill (Available in both words and words_meaning) -->
              <template v-if="hasValidReadingHint">
                <button 
                  v-if="!showReadingHint"
                  class="text-xs sm:text-sm font-semibold px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-indigo-600 dark:text-torii-light rounded-full border border-gray-200 dark:border-slate-700 transition-all duration-200 cursor-pointer focus:outline-none flex items-center gap-1.5 active:scale-95"
                  @click="showReadingHint = true"
                >
                  <Lightbulb class="w-4 h-4 text-indigo-600 dark:text-torii shrink-0" />
                  <span>Reading Hint</span>
                </button>
                <span v-else class="text-xs sm:text-sm font-bold text-indigo-700 dark:text-torii-light bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full animate-hintPop">
                  Reading: <span class="font-jp">{{ currentKana }}</span>
                </span>
              </template>

              <!-- Meaning Hint Button/Pill (Only in standard words mode, NOT words_meaning) -->
              <template v-if="currentMeaning && quizStore.questionType !== 'words_meaning'">
                <button 
                  v-if="!showMeaningHint"
                  class="text-xs sm:text-sm font-semibold px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-indigo-600 dark:text-torii-light rounded-full border border-gray-200 dark:border-slate-700 transition-all duration-200 cursor-pointer focus:outline-none flex items-center gap-1.5 active:scale-95"
                  @click="quizStore.openMeaningHint()"
                >
                  <BookOpen class="w-4 h-4 text-indigo-600 dark:text-torii shrink-0" />
                  <span>Petunjuk Arti</span>
                </button>
                <span v-else class="text-xs sm:text-sm font-bold text-teal-800 dark:text-matcha bg-teal-50 dark:bg-slate-800 border border-teal-200 dark:border-slate-700 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full animate-hintPop">
                  Arti: {{ currentMeaning }}
                </span>
              </template>
            </div>
          </template>
        </div>
      </transition>
    </div>
    
    <!-- Answer Feedback directly below the question (Shown on answered state) -->
    <div 
      v-if="quizStore.selectedAnswer !== null" 
      class="flex flex-col items-center justify-center gap-1.5 text-center px-2 sm:px-4 animate-fadeIn mt-0.5 mb-2 w-full max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto"
    >
      <template v-if="quizStore.questionType === 'words_meaning'">
        <!-- Romaji: muncul setelah submit di bawah soal tanpa highlight seperti jawaban -->
        <div v-if="romajiList.length > 0" class="mt-1 flex items-center justify-center gap-1.5 flex-wrap w-full max-w-2xl md:max-w-3xl lg:max-w-4xl">
          <span class="text-xs sm:text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Romaji:</span>
          <span class="text-base sm:text-lg font-mono font-bold text-gray-800 dark:text-slate-200 inline-flex items-center flex-wrap justify-center">
            <template v-for="(rom, idx) in romajiList" :key="idx">
              <span>{{ rom }}</span>
              <span 
                v-if="idx < romajiList.length - 1" 
                class="inline-flex items-center mx-2 px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-slate-600 select-none tracking-normal not-italic"
              >
                atau
              </span>
            </template>
          </span>
        </div>

        <!-- Jawaban arti yang benar (hanya jika salah atau typo) -->
        <template v-if="!quizStore.isAnswerCorrect || isTypo">
          <span class="text-xs sm:text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mt-1">Artinya yang benar:</span>
          <span class="text-base sm:text-xl md:text-2xl font-bold bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-slate-700 px-5 sm:px-8 py-2 sm:py-2.5 rounded-2xl text-indigo-700 dark:text-torii-light w-auto max-w-full md:max-w-3xl lg:max-w-4xl break-words">
            {{ currentMeaning }}
          </span>
        </template>
      </template>

      <template v-else-if="quizStore.questionType === 'meaning_to_words'">
        <template v-if="!quizStore.isAnswerCorrect || isTypo">
          <span class="text-xs sm:text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Jawaban yang benar:</span>
          <div class="inline-flex items-center gap-2 flex-wrap justify-center w-auto max-w-full md:max-w-3xl lg:max-w-4xl">
            <span class="text-xl sm:text-2xl md:text-3xl font-black bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-slate-700 px-4 py-1.5 rounded-xl text-indigo-700 dark:text-torii-light font-jp">
              {{ character }}
            </span>
            <span v-if="currentKana && currentKana !== character" class="text-base sm:text-xl text-gray-500 dark:text-slate-400 font-jp">
              （{{ currentKana }}）
            </span>
            <span class="text-sm sm:text-lg font-mono font-bold text-indigo-600 dark:text-torii-light inline-flex items-center flex-wrap justify-center">
              <span class="text-slate-400 dark:text-slate-500 mx-1">/</span>
              <template v-for="(rom, idx) in romajiList" :key="idx">
                <span>{{ rom }}</span>
                <span 
                  v-if="idx < romajiList.length - 1" 
                  class="inline-flex items-center mx-2 px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-slate-600 select-none tracking-normal not-italic"
                >
                  atau
                </span>
              </template>
            </span>
          </div>
        </template>
      </template>

      <template v-else>
        <!-- Romaji yang benar: Hanya muncul jika salah atau typo -->
        <template v-if="!quizStore.isAnswerCorrect || isTypo">
          <div class="flex items-center justify-center gap-2">
            <span class="text-xs sm:text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Romaji yang benar:</span>
            <button
              type="button"
              class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md text-indigo-600 dark:text-torii-light hover:bg-indigo-50 dark:hover:bg-slate-800 transition cursor-pointer"
              @click="playWordAudio"
              title="Dengarkan pelafalan suara lagi"
            >
              <Volume2 class="w-3.5 h-3.5" />
              <span>🔊</span>
            </button>
          </div>
          <span 
            :class="[
              'font-black font-mono bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-slate-700 px-5 sm:px-8 py-2.5 sm:py-3 rounded-2xl text-indigo-700 dark:text-torii-light tracking-wider inline-flex items-center justify-center flex-wrap w-auto max-w-full md:max-w-3xl lg:max-w-4xl break-words',
              correctRomajiDisplay.length > 30 
                ? 'text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed' 
                : 'text-xl sm:text-2xl md:text-3xl'
            ]"
          >
            <template v-for="(rom, idx) in romajiList" :key="idx">
              <span>{{ rom }}</span>
              <span 
                v-if="idx < romajiList.length - 1" 
                class="inline-flex items-center mx-2 px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-slate-600 select-none tracking-normal not-italic"
              >
                atau
              </span>
            </template>
          </span>
        </template>

        <!-- Artinya: dipindah ke bawah romaji di atas input -->
        <div v-if="currentMeaning" class="mt-1.5 flex items-center justify-center gap-2 flex-wrap w-full max-w-2xl md:max-w-3xl lg:max-w-4xl">
          <span class="text-xs sm:text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Artinya:</span>
          <span class="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-slate-100">{{ currentMeaning }}</span>
        </div>
      </template>
    </div>

    <!-- Instruction Text (Only visible before answering / submitting) -->
    <p 
      v-else-if="quizStore.selectedAnswer === null" 
      class="text-sm text-gray-500 dark:text-slate-400 m-0 text-center font-medium"
    >
      {{ instructionText }}
    </p>
  </div>
</template>

<style scoped>
@keyframes hintPop {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-hintPop {
  animation: hintPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}

ruby {
  ruby-position: over;
  ruby-align: center;
}

rt {
  user-select: none;
  font-family: inherit;
  line-height: 1;
  text-align: center;
}
</style>
