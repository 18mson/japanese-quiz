<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { CheckCircle2 } from '@lucide/vue';
import SpeakerButton from '../../SpeakerButton.vue';
import { tokenizeSentenceWithHints } from '../../../utils/sentenceHints';
import type { DailyQuestionData } from '../../../stores/dailyPracticeStore';

const props = defineProps<{
  question: DailyQuestionData;
  questionIndex: number;
  totalQuestions: number;
  isShaking: boolean;
}>();

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

watch(
  () => props.question.daily_question_id,
  () => {
    activeHintIndex.value = null;
  }
);

onMounted(() => {
  window.addEventListener('pointerdown', handleGlobalPointerDown);
});

onUnmounted(() => {
  window.removeEventListener('pointerdown', handleGlobalPointerDown);
});

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
  const newRect = htmlEl.getBoundingClientRect();

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
</script>

<template>
  <div 
    :class="[
      'w-full flex flex-col items-center text-center transition-all duration-300 py-2 sm:py-5 relative',
      isShaking ? 'animate-shake' : ''
    ]"
  >
    <!-- Popup Toast Jawaban Benar (Floating di atas seperti popup hints) -->
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
        <!-- Dynamic Ambient Blur saat transisi pergantian soal -->
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
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}
.animate-shake { animation: shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }

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
</style>
