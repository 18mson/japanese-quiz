<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { RenshuuSessionQuestion } from '../types/lesson';
import { normalizeRomajiForComparison, checkIsCorrect, checkIsTypo } from '../utils/quizHelpers';
import { playCorrectSound, playIncorrectSound } from '../utils/battleSoundManager';
import {
  Layers,
  Image as ImageIcon,
  MessageSquare,
  Check,
  X,
  ArrowRight,
  Sparkles,
  HelpCircle,
  User
} from '@lucide/vue';
import VirtualKeyboard from './VirtualKeyboard.vue';

const quizStore = useQuizStore();

const currentQuestionIndex = ref(0);
const userInput = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const showHint = ref(false);
const isTypoInInput = ref(false);
const isEvaluating = ref(false);
const feedbackState = ref<'none' | 'correct' | 'incorrect'>('none');
const selectedOptionKey = ref<string | null>(null);

const questions = computed<RenshuuSessionQuestion[]>(() => {
  return quizStore.renshuuSessionQuestions || [];
});

const totalQuestions = computed(() => questions.value.length);
const currentQuestion = computed<RenshuuSessionQuestion | null>(() => {
  return questions.value[currentQuestionIndex.value] || null;
});

const isTypingQuestion = computed(() => {
  if (!currentQuestion.value) return false;
  return currentQuestion.value.type === 'renshuu_a' || currentQuestion.value.type === 'renshuu_b';
});

const focusInput = () => {
  nextTick(() => {
    if (inputRef.value) inputRef.value.focus();
  });
};

const handleVirtualKey = (key: string) => {
  if (isEvaluating.value || feedbackState.value !== 'none') return;
  if (key === 'BACKSPACE') {
    userInput.value = userInput.value.slice(0, -1);
  } else if (key === 'ENTER' || key === 'SPACE') {
    submitTypingAnswer();
  } else {
    userInput.value += key.toLowerCase();
  }
  evaluateLiveTypo();
};

const evaluateLiveTypo = () => {
  if (!currentQuestion.value || !isTypingQuestion.value) return;
  const target = currentQuestion.value.type === 'renshuu_a'
    ? currentQuestion.value.renshuuA?.targetRomaji || ''
    : currentQuestion.value.renshuuB?.targetRomaji || '';

  const clean = userInput.value.trim();
  if (clean.length > 0 && !normalizeRomajiForComparison(target).startsWith(normalizeRomajiForComparison(clean))) {
    isTypoInInput.value = true;
  } else {
    isTypoInInput.value = false;
  }
};

const submitTypingAnswer = () => {
  if (!currentQuestion.value || isEvaluating.value || feedbackState.value !== 'none') return;
  if (userInput.value.trim().length === 0) return;

  isEvaluating.value = true;
  const rawInput = userInput.value.trim();
  const targetRomaji = currentQuestion.value.type === 'renshuu_a'
    ? currentQuestion.value.renshuuA?.targetRomaji || ''
    : currentQuestion.value.renshuuB?.targetRomaji || '';

  const targetJapanese = currentQuestion.value.type === 'renshuu_a'
    ? currentQuestion.value.renshuuA?.targetJapanese || ''
    : currentQuestion.value.renshuuB?.targetJapanese || '';

  const meaning = currentQuestion.value.type === 'renshuu_a'
    ? currentQuestion.value.renshuuA?.meaning || ''
    : currentQuestion.value.renshuuB?.meaning || '';

  const isCorrect = checkIsCorrect(rawInput, targetRomaji);

  if (isCorrect) {
    playCorrectSound();
    feedbackState.value = 'correct';
    quizStore.score += 10;
  } else {
    playIncorrectSound();
    feedbackState.value = 'incorrect';
  }

  // Record atomic progress
  if (currentQuestion.value.atomicId) {
    quizStore.recordRenshuuAnswer(currentQuestion.value.atomicId, currentQuestion.value.itemType || 'a', isCorrect);
  }

  quizStore.userAnswers.push({
    character: targetJapanese,
    correctRomaji: targetRomaji,
    userRomaji: rawInput,
    isCorrect,
    meaning,
    pointsEarned: isCorrect ? 10 : 0,
    maxPoints: 10,
    isTypo: checkIsTypo(rawInput, targetRomaji),
    hintsUsed: showHint.value ? 1 : 0
  });

  setTimeout(() => {
    advanceToNextQuestion();
  }, 1100);
};

const selectOption = (optKey: string) => {
  if (!currentQuestion.value || isEvaluating.value || feedbackState.value !== 'none') return;
  isEvaluating.value = true;
  selectedOptionKey.value = optKey;

  playCorrectSound();
  feedbackState.value = 'correct';
  quizStore.score += 10;

  // Record atomic progress for Renshuu C
  if (currentQuestion.value.atomicId) {
    quizStore.recordRenshuuAnswer(currentQuestion.value.atomicId, 'c', true);
  }

  const selectedOpt = currentQuestion.value.renshuuC?.options.find(o => o.key === optKey);
  const resolvedJapanese = selectedOpt?.resolvedLines.map(l => `${l.speaker}: ${l.japanese}`).join(' / ') || 'Role-play Renshuu C';

  quizStore.userAnswers.push({
    character: resolvedJapanese,
    correctRomaji: optKey,
    userRomaji: optKey,
    isCorrect: true,
    meaning: 'Role-play Percakapan Renshuu C',
    pointsEarned: 10,
    maxPoints: 10,
    isTypo: false,
    hintsUsed: 0
  });

  setTimeout(() => {
    advanceToNextQuestion();
  }, 1400);
};

const advanceToNextQuestion = () => {
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    currentQuestionIndex.value++;
    userInput.value = '';
    showHint.value = false;
    isTypoInInput.value = false;
    isEvaluating.value = false;
    feedbackState.value = 'none';
    selectedOptionKey.value = null;
    focusInput();
  } else {
    isEvaluating.value = false;
    quizStore.quizCompleted = true;
  }
};

const handleInputKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitTypingAnswer();
  }
};

const progressPercent = computed(() => {
  if (totalQuestions.value === 0) return 0;
  return Math.round(((currentQuestionIndex.value) / totalQuestions.value) * 100);
});

watch(currentQuestionIndex, () => {
  focusInput();
});

onMounted(() => {
  focusInput();
});
</script>

<template>
  <div class="w-full flex flex-col items-center select-none py-1">
    <!-- Question Header Bar -->
    <div class="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-2xl p-3 mb-3 flex items-center justify-between shadow-lg text-slate-100">
      <div class="flex items-center gap-2.5 min-w-0">
        <div 
          :class="[
            'w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs flex-shrink-0',
            currentQuestion?.type === 'renshuu_a'
              ? 'bg-violet-600/30 border-violet-500/40 text-violet-300'
              : currentQuestion?.type === 'renshuu_b'
                ? 'bg-amber-600/30 border-amber-500/40 text-amber-300'
                : 'bg-emerald-600/30 border-emerald-500/40 text-emerald-300'
          ]"
        >
          <Layers v-if="currentQuestion?.type === 'renshuu_a'" class="w-4 h-4" />
          <ImageIcon v-else-if="currentQuestion?.type === 'renshuu_b'" class="w-4 h-4" />
          <MessageSquare v-else class="w-4 h-4" />
        </div>
        <div class="truncate">
          <div class="text-xs font-black text-slate-200 truncate">
            {{ currentQuestion?.sectionTitle || 'Renshuu Pola Kalimat' }}
          </div>
          <div class="text-[11px] text-slate-400 truncate">
            Soal {{ currentQuestionIndex + 1 }} dari {{ totalQuestions }}
          </div>
        </div>
      </div>

      <!-- Progress bar pill -->
      <div class="flex items-center gap-1.5 flex-shrink-0">
        <div class="w-16 sm:w-24 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
          <div 
            class="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
        <span class="text-[11px] font-extrabold text-violet-400">{{ progressPercent }}%</span>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- TIPE 1: RENSHUU A (SUBSTITUSI TEKS)                          -->
    <!-- ============================================================ -->
    <div 
      v-if="currentQuestion?.type === 'renshuu_a' && currentQuestion.renshuuA"
      class="w-full max-w-xl bg-slate-900/95 border border-violet-500/30 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col gap-3.5 animate-fadeIn text-slate-100"
    >
      <!-- Reference Base Example -->
      <div class="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 sm:p-4 text-left">
        <div class="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-violet-400 mb-1">
          📌 Pola Contoh Acuan:
        </div>
        <div class="text-base sm:text-lg font-black text-slate-200 font-jp">
          {{ currentQuestion.renshuuA.baseExample }}
        </div>
      </div>

      <!-- Substitution Word Prompt -->
      <div class="bg-violet-950/30 border border-violet-500/30 rounded-2xl p-4 text-center">
        <div class="text-xs font-bold text-slate-400 mb-1">
          Ganti bagian kata dengan:
        </div>
        <div class="text-xl sm:text-2xl font-black text-amber-300 font-jp tracking-wider">
          「 {{ currentQuestion.renshuuA.substitutionWord }} 」
        </div>
        <div class="text-xs text-slate-400 mt-1 italic">
          {{ currentQuestion.renshuuA.meaning }}
        </div>
      </div>

      <!-- Hint button -->
      <div class="flex items-center justify-between px-1">
        <button 
          type="button"
          @click="showHint = !showHint"
          class="text-[11px] font-bold text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition"
        >
          <HelpCircle class="w-3.5 h-3.5" />
          <span>{{ showHint ? 'Tutup Bantuan' : 'Lihat Bantuan Target' }}</span>
        </button>

        <span v-if="showHint" class="text-xs font-bold text-amber-300 font-mono">
          Ketik: {{ currentQuestion.renshuuA.targetRomaji }}
        </span>
      </div>

      <!-- Typing Input Box -->
      <div class="relative w-full">
        <input
          ref="inputRef"
          type="text"
          v-model="userInput"
          @input="evaluateLiveTypo"
          @keydown="handleInputKeydown"
          :disabled="isEvaluating"
          placeholder="Ketik kalimat hasil substitusi dalam romaji..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          :class="[
            'w-full py-3.5 pl-4 pr-12 rounded-2xl text-sm sm:text-base font-bold bg-slate-950 border-2 transition-all shadow-inner outline-none',
            feedbackState === 'correct'
              ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20'
              : feedbackState === 'incorrect'
                ? 'border-rose-500 text-rose-300 bg-rose-950/20'
                : isTypoInInput
                  ? 'border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                  : 'border-violet-500/50 focus:border-violet-400 text-slate-100 ring-2 ring-violet-500/20'
          ]"
        />

        <button
          type="button"
          @click="submitTypingAnswer"
          :disabled="userInput.trim().length === 0 || isEvaluating"
          :class="[
            'absolute right-2 top-2 bottom-2 px-3.5 rounded-xl text-xs font-black transition flex items-center justify-center cursor-pointer shadow-md',
            userInput.trim().length > 0 && !isEvaluating
              ? 'bg-violet-600 hover:bg-violet-500 text-white'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          ]"
        >
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>

      <!-- Feedback Banner -->
      <div v-if="feedbackState !== 'none'" class="animate-fadeIn">
        <div 
          :class="[
            'p-3 rounded-2xl border text-left flex items-start gap-2 text-xs font-bold',
            feedbackState === 'correct'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          ]"
        >
          <Check v-if="feedbackState === 'correct'" class="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <X v-else class="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <div class="font-jp font-black text-sm">{{ currentQuestion.renshuuA.targetJapanese }}</div>
            <div class="text-[11px] opacity-80">{{ currentQuestion.renshuuA.targetRomaji }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- TIPE 2: RENSHUU B (DRILL GAMBAR KARAKTER)                    -->
    <!-- ============================================================ -->
    <div 
      v-else-if="currentQuestion?.type === 'renshuu_b' && currentQuestion.renshuuB"
      class="w-full max-w-xl bg-slate-900/95 border border-amber-500/30 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col gap-3.5 animate-fadeIn text-slate-100"
    >
      <!-- Character Card (Image + Attributes) -->
      <div class="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 sm:p-4 flex items-center gap-4">
        <!-- Character Portrait Image from Supabase Storage -->
        <div class="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border border-amber-500/40 bg-slate-900 flex-shrink-0 shadow-md relative">
          <img 
            v-if="currentQuestion.renshuuB.character.image_url"
            :src="currentQuestion.renshuuB.character.image_url" 
            :alt="currentQuestion.renshuuB.character.name"
            class="w-full h-full object-cover object-top"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-slate-600">
            <User class="w-8 h-8" />
          </div>
        </div>

        <!-- Info Badges -->
        <div class="flex-1 flex flex-col gap-1.5 text-left min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-lg sm:text-xl font-black text-amber-300 font-jp">
              {{ currentQuestion.renshuuB.character.name }}
            </span>
            <span class="text-xs text-slate-400 font-semibold">
              ({{ currentQuestion.renshuuB.character.romaji_name }})
            </span>
          </div>

          <div class="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span v-if="currentQuestion.renshuuB.character.country" class="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
              🌏 {{ currentQuestion.renshuuB.character.country }}
            </span>
            <span v-if="currentQuestion.renshuuB.character.profession" class="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
              💼 {{ currentQuestion.renshuuB.character.profession }}
            </span>
            <span v-if="currentQuestion.renshuuB.character.age" class="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
              🎂 {{ currentQuestion.renshuuB.character.age }} th
            </span>
            <span v-if="currentQuestion.renshuuB.character.company" class="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
              🏢 {{ currentQuestion.renshuuB.character.company }}
            </span>
          </div>
        </div>
      </div>

      <!-- Prompt Question if exists (e.g. for yes_no / also_question) -->
      <div v-if="currentQuestion.renshuuB.promptQuestion" class="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3 text-center">
        <div class="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-0.5">Pertanyaan:</div>
        <div class="text-base sm:text-lg font-black text-amber-200 font-jp">
          {{ currentQuestion.renshuuB.promptQuestion }}
        </div>
      </div>

      <!-- Meaning target -->
      <div class="text-xs text-slate-300 text-left px-1 font-medium">
        🎯 Pola jawaban: <span class="font-bold text-slate-200">"{{ currentQuestion.renshuuB.meaning }}"</span>
      </div>

      <!-- Hint toggle -->
      <div class="flex items-center justify-between px-1">
        <button 
          type="button"
          @click="showHint = !showHint"
          class="text-[11px] font-bold text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition"
        >
          <HelpCircle class="w-3.5 h-3.5" />
          <span>{{ showHint ? 'Tutup Bantuan' : 'Lihat Bantuan Romaji' }}</span>
        </button>

        <span v-if="showHint" class="text-xs font-bold text-amber-300 font-mono">
          Ketik: {{ currentQuestion.renshuuB.targetRomaji }}
        </span>
      </div>

      <!-- Typing Input Box -->
      <div class="relative w-full">
        <input
          ref="inputRef"
          type="text"
          v-model="userInput"
          @input="evaluateLiveTypo"
          @keydown="handleInputKeydown"
          :disabled="isEvaluating"
          placeholder="Ketik kalimat romaji yang tepat..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          :class="[
            'w-full py-3.5 pl-4 pr-12 rounded-2xl text-sm sm:text-base font-bold bg-slate-950 border-2 transition-all shadow-inner outline-none',
            feedbackState === 'correct'
              ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20'
              : feedbackState === 'incorrect'
                ? 'border-rose-500 text-rose-300 bg-rose-950/20'
                : isTypoInInput
                  ? 'border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                  : 'border-amber-500/50 focus:border-amber-400 text-slate-100 ring-2 ring-amber-500/20'
          ]"
        />

        <button
          type="button"
          @click="submitTypingAnswer"
          :disabled="userInput.trim().length === 0 || isEvaluating"
          :class="[
            'absolute right-2 top-2 bottom-2 px-3.5 rounded-xl text-xs font-black transition flex items-center justify-center cursor-pointer shadow-md',
            userInput.trim().length > 0 && !isEvaluating
              ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          ]"
        >
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>

      <!-- Feedback Banner -->
      <div v-if="feedbackState !== 'none'" class="animate-fadeIn">
        <div 
          :class="[
            'p-3 rounded-2xl border text-left flex items-start gap-2 text-xs font-bold',
            feedbackState === 'correct'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          ]"
        >
          <Check v-if="feedbackState === 'correct'" class="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <X v-else class="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <div class="font-jp font-black text-sm">{{ currentQuestion.renshuuB.targetJapanese }}</div>
            <div class="text-[11px] opacity-80">{{ currentQuestion.renshuuB.targetRomaji }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- TIPE 3: RENSHUU C (ROLE-PLAY PILIHAN GANDA)                  -->
    <!-- ============================================================ -->
    <div 
      v-else-if="currentQuestion?.type === 'renshuu_c' && currentQuestion.renshuuC"
      class="w-full max-w-xl bg-slate-900/95 border border-emerald-500/30 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col gap-3.5 animate-fadeIn text-slate-100"
    >
      <!-- Dialogue Template with Slot Highlights -->
      <div class="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5 text-left shadow-inner">
        <div class="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 mb-0.5 flex items-center gap-1">
          <Sparkles class="w-3.5 h-3.5" />
          <span>Lengkapi Slot Dialog (Role-play):</span>
        </div>

        <div 
          v-for="(line, lIdx) in currentQuestion.renshuuC.template"
          :key="lIdx"
          class="flex items-start gap-2 text-sm sm:text-base font-bold"
        >
          <span class="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-black text-emerald-400 flex-shrink-0">
            {{ line.speaker }}
          </span>
          <div>
            <div class="font-jp text-slate-100 leading-relaxed font-black">
              {{ line.japanese }}
            </div>
            <div class="text-[11px] text-slate-400 italic">
              {{ line.meaning }}
            </div>
          </div>
        </div>
      </div>

      <!-- Multiple Choice Options Grid -->
      <div class="flex flex-col gap-2 pt-1">
        <div class="text-xs font-bold text-slate-400 text-left px-1">
          Pilih kombinasi slot yang tepat:
        </div>

        <button
          v-for="opt in currentQuestion.renshuuC.options"
          :key="opt.key"
          type="button"
          @click="selectOption(opt.key)"
          :disabled="isEvaluating"
          :class="[
            'p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-2 cursor-pointer shadow-md',
            selectedOptionKey === opt.key
              ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-400/40 text-emerald-200'
              : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-200'
          ]"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-emerald-400 flex-shrink-0">
              {{ opt.key }}
            </span>
            <div class="truncate text-xs sm:text-sm font-bold font-jp">
              {{ opt.label }}
            </div>
          </div>

          <div v-if="selectedOptionKey === opt.key" class="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs flex-shrink-0">
            <Check class="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      <!-- Feedback Resolved Dialogue -->
      <div v-if="selectedOptionKey" class="mt-1 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3 text-left animate-fadeIn">
        <div class="text-[11px] font-bold text-emerald-400 mb-1 flex items-center gap-1">
          <Check class="w-3.5 h-3.5" />
          <span>Dialog Lengkap Terisi:</span>
        </div>
        <div 
          v-for="(resLine, rIdx) in (currentQuestion.renshuuC.options.find(o => o.key === selectedOptionKey)?.resolvedLines || [])"
          :key="rIdx"
          class="text-xs font-bold font-jp text-slate-200"
        >
          <span class="text-emerald-300">{{ resLine.speaker }}:</span> {{ resLine.japanese }}
        </div>
      </div>
    </div>

    <!-- Virtual Keyboard for Mobile Only -->
    <div v-if="isTypingQuestion" class="block sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800">
      <VirtualKeyboard
        @key="handleVirtualKey"
        :show-next="true"
        :is-correct="feedbackState === 'correct'"
      />
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>
