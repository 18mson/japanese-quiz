<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useBattlegroundStore } from '../../stores/battlegroundStore';
import QuizBlitzInterimPodium from './QuizBlitzInterimPodium.vue';
import { Zap, Clock, CheckCircle2, XCircle, Sparkles } from '@lucide/vue';
import { playCorrectSound, playIncorrectSound } from '../../utils/battleSoundManager';

const store = useBattlegroundStore();

const selectedOptionIndex = ref<number | null>(null);
const answered = ref(false);
const pointsEarned = ref<number | null>(null);
const localTimerMs = ref<number>(10000);
let questionInterval: ReturnType<typeof setInterval> | null = null;

const question = computed(() => store.activeRound?.question_data ?? null);

const isReviewPhase = computed(() => store.phase === 'round_result');

const isQuestionActive = computed(() =>
  store.phase === 'round_active' && !answered.value && !isReviewPhase.value
);

const isPreparing = computed(() => store.phase === 'round_preparing');

// Master 5-minute timer formatted MM:SS
const formattedMasterTime = computed(() => {
  const totalSec = Math.max(0, store.masterTimeRemainingSeconds);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
});

// Category label
const categoryLabel = computed(() => {
  const cat = store.quizCategory;
  if (cat === 'hiragana') return 'Hiragana';
  if (cat === 'katakana') return 'Katakana';
  if (cat === 'mix') return 'Mix Kana';
  return '📖 Kotoba & Kanji N5';
});

// Start local 10s smooth timer
function startQuestionTimer() {
  if (questionInterval) clearInterval(questionInterval);
  localTimerMs.value = 10000;
  const startAt = Date.now();

  questionInterval = setInterval(() => {
    const elapsed = Date.now() - startAt;
    const remaining = Math.max(0, 10000 - elapsed);
    localTimerMs.value = remaining;

    if (remaining <= 0) {
      if (questionInterval) clearInterval(questionInterval);
      if (!answered.value && store.phase === 'round_active') {
        handleOptionSelect(-1, 'TIMEOUT');
      }
    }
  }, 25);
}

// Reset when new round prepares
watch(
  () => store.phase,
  (newPhase) => {
    if (newPhase === 'round_preparing') {
      selectedOptionIndex.value = null;
      answered.value = false;
      pointsEarned.value = null;
      localTimerMs.value = 10000;
    } else if (newPhase === 'round_active') {
      startQuestionTimer();
    } else if (newPhase === 'round_result') {
      if (questionInterval) clearInterval(questionInterval);
    }
  },
  { immediate: true }
);

function handleOptionSelect(idx: number, optValue: string) {
  if (answered.value || !isQuestionActive.value) return;
  answered.value = true;
  selectedOptionIndex.value = idx;

  if (questionInterval) clearInterval(questionInterval);

  const isCorrect = idx === question.value?.correctOptionIndex;

  if (isCorrect) {
    playCorrectSound();
    // Speed scoring: Max 200 pts at 10s, down to 10 pts at 0.1s
    const pts = Math.max(10, Math.round((localTimerMs.value / 10000) * 200));
    pointsEarned.value = pts;
  } else {
    playIncorrectSound();
    pointsEarned.value = 0;
  }

  store.submitQuizBlitzAnswer({
    selectedOptionIndex: idx,
    selectedAnswer: optValue,
    isCorrect,
  });
}

// Keyboard shortcuts (1–6)
function handleKeydown(e: KeyboardEvent) {
  if (!isQuestionActive.value || !question.value) return;
  const keyNum = parseInt(e.key);
  if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= question.value.options.length) {
    e.preventDefault();
    const idx = keyNum - 1;
    handleOptionSelect(idx, question.value.options[idx]);
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  if (store.phase === 'round_active') startQuestionTimer();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  if (questionInterval) clearInterval(questionInterval);
});

const progressPct = computed(() => {
  return Math.min(100, Math.max(0, (localTimerMs.value / 10000) * 100));
});

const remainingSecFormatted = computed(() => {
  return (localTimerMs.value / 1000).toFixed(1);
});
</script>

<template>
  <div class="relative w-full h-full max-w-2xl mx-auto flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden">
    
    <!-- ── HEADER TOP BAR (Master Timer, Category, Round & Score) ── -->
    <div class="w-full flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md backdrop-blur-md flex-shrink-0 mb-3 sm:mb-4">
      
      <!-- Category & Round Number -->
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-md shadow-amber-500/20 flex-shrink-0">
          #{{ store.activeRound?.round_number ?? 1 }}
        </div>
        <div class="truncate">
          <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quiz Blitz</div>
          <div class="text-xs sm:text-sm font-black text-white truncate">{{ categoryLabel }}</div>
        </div>
      </div>

      <!-- Master Session 5-Min Timer -->
      <div class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 text-xs sm:text-sm font-black flex-shrink-0">
        <Clock class="w-3.5 h-3.5 text-amber-400" />
        <span>{{ formattedMasterTime }}</span>
      </div>

      <!-- Player Live Score -->
      <div class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-black flex-shrink-0">
        <Zap class="w-3.5 h-3.5 fill-amber-400" />
        <span>{{ store.myPlayer?.score ?? 0 }} pts</span>
      </div>
    </div>

    <!-- ── 10-SECOND QUESTION COUNTDOWN TIMER BAR ── -->
    <div v-if="!isReviewPhase && !isPreparing" class="w-full flex flex-col gap-1 mb-3 sm:mb-4 flex-shrink-0">
      <div class="flex justify-between items-center text-xs font-black">
        <span class="text-slate-400 flex items-center gap-1">
          <Clock class="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Sisa Waktu
        </span>
        <span :class="['font-mono', localTimerMs < 3000 ? 'text-rose-400 animate-ping' : 'text-amber-400']">
          {{ remainingSecFormatted }}s
        </span>
      </div>
      <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden shadow-inner">
        <div
          :class="[
            'h-full transition-all duration-75 ease-linear rounded-full shadow-md',
            localTimerMs > 5000
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-emerald-500/30'
              : localTimerMs > 2500
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-amber-500/30'
              : 'bg-gradient-to-r from-rose-500 to-red-600 shadow-rose-500/40 animate-pulse'
          ]"
          :style="{ width: `${progressPct}%` }"
        />
      </div>
    </div>

    <!-- ── MAIN CONTENT AREA ── -->
    <div class="w-full flex-1 flex flex-col items-center justify-center min-h-0">
      
      <!-- PRE-ROUND COUNTDOWN (3.. 2.. 1..) -->
      <div v-if="isPreparing" class="flex flex-col items-center justify-center gap-3 animate-fadeIn my-auto">
        <div class="text-xs sm:text-sm uppercase tracking-widest text-slate-400 font-extrabold">Bersiap Soal Ronde {{ store.activeRound?.round_number }}</div>
        <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-amber-500 to-rose-500 p-1 flex items-center justify-center shadow-2xl shadow-indigo-500/30 animate-pulse">
          <div class="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center">
            <span class="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-300 to-white font-mono">
              {{ store.countdownSeconds > 0 ? Math.min(3, store.countdownSeconds) : 'GO!' }}
            </span>
          </div>
        </div>
      </div>

      <!-- REVIEW PHASE: LIVE TOP 3 INTERIM PODIUM WITH OVERTAKE ANIMATION -->
      <div v-else-if="isReviewPhase && store.lastRoundResult?.quizBlitzScores" class="w-full h-full flex items-center justify-center">
        <QuizBlitzInterimPodium
          :scores="store.lastRoundResult.quizBlitzScores"
          :my-player-id="store.myPlayerId"
          :round-number="store.lastRoundResult.roundNumber"
          :next-round-in-seconds="store.lastRoundResult.nextRoundInSeconds ?? 5"
        />
      </div>

      <!-- QUESTION ACTIVE PHASE -->
      <div v-else-if="question" class="w-full flex flex-col items-center justify-between h-full min-h-0">
        
        <!-- Big Japanese Prompt Card -->
        <div class="w-full relative p-5 sm:p-7 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col items-center justify-center text-center mb-3 sm:mb-4 flex-shrink-0">
          
          <!-- Speed Points Earned Floating Badge -->
          <div
            v-if="answered && pointsEarned !== null"
            :class="[
              'absolute -top-3.5 px-3 py-1 rounded-full text-xs sm:text-sm font-black flex items-center gap-1 shadow-lg',
              pointsEarned > 0
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/40'
                : 'bg-rose-500 text-white shadow-rose-500/40'
            ]"
          >
            <Sparkles v-if="pointsEarned > 0" class="w-4 h-4 fill-slate-950" />
            <span>{{ pointsEarned > 0 ? `+${pointsEarned} Poin Kecepatan!` : 'Salah (0 pts)' }}</span>
          </div>

          <div class="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">
            {{ question.questionText }}
          </div>

          <!-- Japanese Main Prompt (Large & High Contrast) -->
          <div class="text-4xl sm:text-6xl font-black text-white tracking-wide my-1.5 drop-shadow-md font-jp">
            {{ question.prompt }}
          </div>

          <!-- SubPrompt / Reading Hint if available -->
          <div v-if="question.subPrompt" class="text-xs sm:text-sm font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700 mt-1 font-jp">
            {{ question.subPrompt }}
          </div>
        </div>

        <!-- 4–6 Responsive Choice Buttons -->
        <div :class="[
          'w-full grid gap-2 sm:gap-3 flex-1 min-h-0',
          question.options.length > 4 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
        ]">
          <button
            v-for="(opt, idx) in question.options"
            :key="idx"
            type="button"
            @click="handleOptionSelect(idx, opt)"
            :disabled="answered || !isQuestionActive"
            :class="[
              'relative p-3.5 sm:p-4 rounded-2xl font-black text-sm sm:text-base transition-all duration-150 flex items-center justify-between border shadow-sm cursor-pointer select-none text-left min-h-[52px] sm:min-h-[60px]',
              answered
                ? idx === question.correctOptionIndex
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/50'
                  : idx === selectedOptionIndex
                  ? 'bg-rose-500/20 border-rose-400 text-rose-300 ring-2 ring-rose-400/50'
                  : 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60'
                : 'bg-slate-900 hover:bg-indigo-950/60 active:scale-[0.98] border-slate-800 hover:border-indigo-500 text-slate-100'
            ]"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-6 h-6 rounded-lg bg-white/10 text-slate-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {{ idx + 1 }}
              </span>
              <span class="truncate">{{ opt }}</span>
            </div>

            <!-- Result Feedback Icon -->
            <div v-if="answered" class="flex-shrink-0 ml-2">
              <CheckCircle2 v-if="idx === question.correctOptionIndex" class="w-5 h-5 text-emerald-400" />
              <XCircle v-else-if="idx === selectedOptionIndex" class="w-5 h-5 text-rose-400" />
            </div>
          </button>
        </div>

      </div>
    </div>

  </div>
</template>
