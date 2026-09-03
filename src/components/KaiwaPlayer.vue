<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { KaiwaLine } from '../types/lesson';
import { normalizeRomajiForComparison, checkIsCorrect, checkIsTypo } from '../utils/quizHelpers';
import { playCorrectSound, playIncorrectSound } from '../utils/battleSoundManager';
import { Check, X, ArrowRight, RotateCcw, HelpCircle, Trophy } from '@lucide/vue';
import VirtualKeyboard from './VirtualKeyboard.vue';
import SpeakerButton from './SpeakerButton.vue';

const quizStore = useQuizStore();

const currentLineIndex = ref(0);
const userInput = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const completedLines = ref<Array<{
  line: KaiwaLine;
  userRomaji: string;
  isCorrect: boolean;
  score: number;
}>>([]);

const showHint = ref(false);
const isTypoInInput = ref(false);
const isEvaluating = ref(false);
const dialogueFinished = ref(false);

const lines = computed<KaiwaLine[]>(() => {
  return quizStore.kaiwaData?.lines || [];
});

const totalLines = computed(() => lines.value.length);
const currentLine = computed<KaiwaLine | null>(() => lines.value[currentLineIndex.value] || null);

// Speaker color styling mapping
const getSpeakerTheme = (speaker: string) => {
  const s = speaker.trim();
  if (s === '佐藤') {
    return {
      align: 'left',
      bgBubble: 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-200',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      avatarBg: 'bg-amber-600 text-slate-950 font-black',
      avatarLabel: '佐'
    };
  }
  if (s === '山田') {
    return {
      align: 'left',
      bgBubble: 'bg-gradient-to-br from-indigo-500/20 to-blue-500/10 border-indigo-500/30 text-indigo-200',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      avatarBg: 'bg-indigo-600 text-white font-black',
      avatarLabel: '山'
    };
  }
  // Miller or other
  return {
    align: 'right',
    bgBubble: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-200',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    avatarBg: 'bg-emerald-600 text-white font-black',
    avatarLabel: 'ミ'
  };
};

const focusInput = () => {
  nextTick(() => {
    if (inputRef.value) inputRef.value.focus();
  });
};

const handleVirtualKey = (key: string) => {
  if (isEvaluating.value || dialogueFinished.value) return;
  if (key === 'BACKSPACE') {
    userInput.value = userInput.value.slice(0, -1);
  } else if (key === 'ENTER' || key === 'SPACE') {
    submitCurrentLine();
  } else {
    userInput.value += key.toLowerCase();
  }
  evaluateLiveTypo();
};

const evaluateLiveTypo = () => {
  if (!currentLine.value) return;
  const target = currentLine.value.romaji;
  const clean = userInput.value.trim();
  if (clean.length > 0 && !normalizeRomajiForComparison(target).startsWith(normalizeRomajiForComparison(clean))) {
    isTypoInInput.value = true;
  } else {
    isTypoInInput.value = false;
  }
};

const submitCurrentLine = () => {
  if (!currentLine.value || isEvaluating.value || dialogueFinished.value) return;
  if (userInput.value.trim().length === 0) return;

  isEvaluating.value = true;
  const line = currentLine.value;
  const rawInput = userInput.value.trim();
  const targetRomaji = line.romaji;

  const isCorrect = checkIsCorrect(rawInput, targetRomaji);

  if (isCorrect) {
    playCorrectSound();
  } else {
    playIncorrectSound();
  }

  completedLines.value.push({
    line,
    userRomaji: rawInput,
    isCorrect,
    score: isCorrect ? 10 : 0
  });

  // Record into store for stats
  quizStore.userAnswers.push({
    character: line.japanese,
    correctRomaji: line.romaji,
    userRomaji: rawInput,
    isCorrect,
    meaning: line.meaning,
    pointsEarned: isCorrect ? 10 : 0,
    maxPoints: 10,
    isTypo: checkIsTypo(rawInput, targetRomaji),
    hintsUsed: showHint.value ? 1 : 0
  });

  if (isCorrect) {
    quizStore.score += 10;
  }

  setTimeout(() => {
    if (currentLineIndex.value < totalLines.value - 1) {
      currentLineIndex.value++;
      userInput.value = '';
      showHint.value = false;
      isTypoInInput.value = false;
      isEvaluating.value = false;
      focusInput();
    } else {
      // Completed all lines
      dialogueFinished.value = true;
      isEvaluating.value = false;
      quizStore.quizCompleted = true;
    }
  }, 900);
};

const handleInputKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitCurrentLine();
  }
};

const totalCorrect = computed(() => completedLines.value.filter(l => l.isCorrect).length);
const accuracyPercentage = computed(() => {
  if (completedLines.value.length === 0) return 0;
  return Math.round((totalCorrect.value / completedLines.value.length) * 100);
});

const restartKaiwa = () => {
  currentLineIndex.value = 0;
  completedLines.value = [];
  userInput.value = '';
  showHint.value = false;
  isTypoInInput.value = false;
  isEvaluating.value = false;
  dialogueFinished.value = false;
  quizStore.userAnswers = [];
  quizStore.score = 0;
  quizStore.quizCompleted = false;
  focusInput();
};

watch(
  () => currentLineIndex.value,
  () => {
    focusInput();
  }
);

onMounted(() => {
  focusInput();
});
</script>

<template>
  <div class="w-full flex flex-col items-center select-none py-2">
    <!-- Dialogue Header Bar -->
    <div class="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 mb-3 flex items-center justify-between shadow-lg text-slate-100">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
          💬
        </div>
        <div class="truncate">
          <div class="text-xs font-bold text-slate-300 truncate">
            {{ quizStore.kaiwaData?.title }} · <span class="text-indigo-400 font-semibold">{{ quizStore.kaiwaData?.title_meaning }}</span>
          </div>
          <div class="text-[11px] text-slate-400 truncate">
            Baris {{ Math.min(currentLineIndex + 1, totalLines) }} dari {{ totalLines }}
          </div>
        </div>
      </div>

      <!-- Progress bar pill -->
      <div class="flex items-center gap-1.5 flex-shrink-0">
        <div class="w-20 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
          <div 
            class="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
            :style="{ width: `${((currentLineIndex) / Math.max(1, totalLines)) * 100}%` }"
          ></div>
        </div>
        <span class="text-[11px] font-extrabold text-indigo-400">{{ Math.round(((currentLineIndex) / Math.max(1, totalLines)) * 100) }}%</span>
      </div>
    </div>

    <!-- Active Chat Flow Container -->
    <div class="w-full max-w-xl flex flex-col gap-3 min-h-[260px] max-h-[420px] overflow-y-auto pr-1 pb-2">
      <!-- Past Completed Lines -->
      <TransitionGroup name="list">
        <div 
          v-for="(item, idx) in completedLines" 
          :key="`completed-${idx}`"
          :class="[
            'flex gap-2.5 items-end max-w-[85%] transition-all duration-300',
            getSpeakerTheme(item.line.speaker).align === 'right' ? 'self-end flex-row-reverse' : 'self-start flex-row'
          ]"
        >
          <!-- Speaker Avatar -->
          <div 
            :class="[
              'w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 shadow-sm border border-white/10',
              getSpeakerTheme(item.line.speaker).avatarBg
            ]"
          >
            {{ getSpeakerTheme(item.line.speaker).avatarLabel }}
          </div>

          <!-- Bubble -->
          <div 
            :class="[
              'rounded-2xl p-3 border text-left shadow-md flex flex-col gap-1',
              getSpeakerTheme(item.line.speaker).bgBubble
            ]"
          >
            <div class="flex items-center justify-between gap-3 text-[10px] font-bold">
              <span :class="['px-1.5 py-0.5 rounded border', getSpeakerTheme(item.line.speaker).badgeBg]">
                {{ item.line.speaker }}
              </span>
              <span :class="item.isCorrect ? 'text-emerald-400 font-extrabold' : 'text-rose-400 font-extrabold'">
                {{ item.isCorrect ? '✓ Benar' : '✗ Salah' }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <div class="text-sm font-black font-jp">{{ item.line.japanese }}</div>
              <SpeakerButton :text="item.line.japanese" size="sm" />
            </div>
            <div class="text-[11px] text-slate-300 italic">"{{ item.line.meaning }}"</div>
          </div>
        </div>
      </TransitionGroup>

      <!-- Current Active Line Bubble -->
      <div 
        v-if="currentLine && !dialogueFinished"
        :class="[
          'flex gap-2.5 items-end max-w-[90%] transition-all duration-300 animate-fadeIn',
          getSpeakerTheme(currentLine.speaker).align === 'right' ? 'self-end flex-row-reverse' : 'self-start flex-row'
        ]"
      >
        <!-- Speaker Avatar -->
        <div 
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 shadow-md border-2 border-white/20 animate-pulse',
            getSpeakerTheme(currentLine.speaker).avatarBg
          ]"
        >
          {{ getSpeakerTheme(currentLine.speaker).avatarLabel }}
        </div>

        <!-- Active Bubble -->
        <div 
          :class="[
            'rounded-2xl p-3.5 border-2 shadow-xl flex flex-col gap-1.5 text-left w-full ring-2 ring-violet-500/20',
            getSpeakerTheme(currentLine.speaker).bgBubble
          ]"
        >
          <div class="flex items-center justify-between gap-2">
            <span :class="['px-2 py-0.5 rounded-md border text-[11px] font-black', getSpeakerTheme(currentLine.speaker).badgeBg]">
              {{ currentLine.speaker }}
            </span>
            <button 
              type="button"
              @click="showHint = !showHint" 
              class="text-[11px] font-bold text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition"
            >
              <HelpCircle class="w-3.5 h-3.5" />
              <span>{{ showHint ? 'Tutup Bantuan' : 'Lihat Bantuan' }}</span>
            </button>
          </div>

          <!-- Japanese Prompt with Speaker -->
          <div class="flex items-center justify-between gap-2">
            <div class="text-lg sm:text-xl font-black text-amber-300 font-jp tracking-wide">
              {{ currentLine.japanese }}
            </div>
            <SpeakerButton :text="currentLine.japanese" size="sm" />
          </div>

          <!-- Meaning -->
          <div class="text-xs text-slate-300 font-medium">
            "{{ currentLine.meaning }}"
          </div>

          <!-- Romaji Hint if requested -->
          <div v-if="showHint" class="mt-1 px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 rounded-lg text-xs font-bold text-amber-200">
            Ketik: <span class="underline font-mono">{{ currentLine.romaji }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Input Box (When dialogue is in progress) -->
    <div v-if="!dialogueFinished" class="w-full max-w-xl mt-3 flex flex-col gap-2">
      <div class="relative w-full">
        <input
          ref="inputRef"
          type="text"
          v-model="userInput"
          @input="evaluateLiveTypo"
          @keydown="handleInputKeydown"
          :disabled="isEvaluating"
          placeholder="Ketik romaji baris percakapan ini..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          :class="[
            'w-full py-3.5 pl-4 pr-12 rounded-2xl text-sm sm:text-base font-bold bg-slate-900 border-2 transition-all shadow-inner outline-none',
            isTypoInInput
              ? 'border-rose-500 text-rose-300 ring-2 ring-rose-500/30 bg-rose-950/20'
              : 'border-indigo-500/50 focus:border-indigo-400 text-slate-100 ring-2 ring-indigo-500/20'
          ]"
        />

        <button
          type="button"
          @click="submitCurrentLine"
          :disabled="userInput.trim().length === 0 || isEvaluating"
          :class="[
            'absolute right-2 top-2 bottom-2 px-3.5 rounded-xl text-xs font-black transition flex items-center justify-center cursor-pointer shadow-md',
            userInput.trim().length > 0 && !isEvaluating
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          ]"
        >
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>

      <!-- Live Typo Helper Text -->
      <div v-if="isTypoInInput" class="text-[11px] text-rose-400 font-bold px-2 flex items-center gap-1">
        <X class="w-3.5 h-3.5" />
        <span>Ejaan romaji belum sesuai target</span>
      </div>

      <!-- Virtual Keyboard for Mobile Only -->
      <div class="block sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800">
        <VirtualKeyboard
          @key="handleVirtualKey"
          :show-next="true"
          :is-correct="false"
        />
      </div>
    </div>

    <!-- Final Summary Card (When finished) -->
    <div 
      v-else
      class="w-full max-w-md bg-slate-900/95 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-fadeIn my-4 text-slate-100"
    >
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center font-black text-2xl mb-3 shadow-lg shadow-indigo-600/30">
        <Trophy class="w-7 h-7" />
      </div>

      <h3 class="text-xl sm:text-2xl font-black text-white mb-1">
        Percakapan Selesai! 🎉
      </h3>
      <p class="text-xs text-slate-400 mb-4">
        Kamu telah menyelesaikan semua dialog pada {{ quizStore.kaiwaData?.title }}.
      </p>

      <!-- Score Metrics Grid -->
      <div class="grid grid-cols-2 gap-3 w-full mb-5">
        <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col items-center">
          <span class="text-[11px] font-bold text-slate-400 uppercase">Baris Benar</span>
          <span class="text-2xl font-black text-emerald-400">{{ totalCorrect }} / {{ totalLines }}</span>
        </div>
        <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col items-center">
          <span class="text-[11px] font-bold text-slate-400 uppercase">Akurasi</span>
          <span class="text-2xl font-black text-indigo-400">{{ accuracyPercentage }}%</span>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-3 w-full">
        <button
          type="button"
          @click="restartKaiwa"
          class="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <RotateCcw class="w-4 h-4" />
          <span>Ulangi Dialog</span>
        </button>

        <button
          type="button"
          @click="quizStore.quizCompleted = true"
          class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
        >
          <Check class="w-4 h-4" />
          <span>Lihat Hasil</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
</style>
