<script setup lang="ts">
import { ref, computed } from 'vue';
import { Eye } from '@lucide/vue';
import SpeakerButton from '../../SpeakerButton.vue';
import FuriganaText from '../../common/FuriganaText.vue';
import type { DailyQuestionData } from '../../../stores/dailyPracticeStore';

const props = defineProps<{
  question: DailyQuestionData;
  revealedAnswer: string | null;
  displayedSpeakableText: string;
  lastAnswerGiven: string;
}>();

const hasVisibleAnswer = computed(() => {
  return (props.question.is_correct || !!props.revealedAnswer || props.question.attempts >= 3) && !!props.displayedSpeakableText;
});

const answerKey = computed(() => {
  return `${props.question.daily_question_id}-${props.question.is_correct ? 'c' : 'r'}-${props.displayedSpeakableText}`;
});

// ============================================================
// ANIMASI BLUR & FLUID MORPH RESIZE SAAT PERGANTIAN/MUNCUL/HILANG JAWABAN
// ============================================================
const isAnswerMorphing = ref(false);
const answerBlurPillStyle = ref<Record<string, string>>({});
const answerContainerHeightStyle = ref<Record<string, string>>({
  maxHeight: (props.question.is_correct || !!props.revealedAnswer) ? 'none' : '0px',
  marginTop: (props.question.is_correct || !!props.revealedAnswer) ? '1.25rem' : '0px',
  overflow: (props.question.is_correct || !!props.revealedAnswer) ? 'visible' : 'hidden',
  transition: 'none'
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
</script>

<template>
  <!-- Answer Morphing Container dengan Animasi Memanjang / Memendek & Efek Blur -->
  <div 
    class="answer-morph-wrapper relative mx-auto flex items-center justify-center max-w-5xl lg:max-w-6xl xl:max-w-7xl w-full"
    :style="answerContainerHeightStyle"
  >
    <!-- Dynamic Ambient Blur saat transisi pergantian/muncul/hilang jawaban -->
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
</template>

<style scoped>
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

.morph-backdrop-glow {
  transform-origin: center center;
  will-change: width, height, opacity;
  -webkit-mask-image: radial-gradient(ellipse at center, rgba(0, 0, 0, 1) 35%, rgba(0, 0, 0, 0) 80%);
  mask-image: radial-gradient(ellipse at center, rgba(0, 0, 0, 1) 35%, rgba(0, 0, 0, 0) 80%);
}
</style>
