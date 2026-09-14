<script setup lang="ts">
import { computed } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import QuizActionNavbar from './common/QuizActionNavbar.vue';

defineProps<{
  quizStarted: boolean;
}>();

const quizStore = useQuizStore();

const isShow = computed(() => {
  return !quizStore.quizCompleted && (quizStore.isTypingMode || quizStore.selectedAnswer !== null);
});

const navMode = computed(() => {
  return quizStore.selectedAnswer === null && quizStore.isTypingMode ? 'typing' : 'proceed';
});

const isLast = computed(() => {
  return quizStore.currentQuestionIndex >= quizStore.questions.length - 1;
});
</script>

<template>
  <QuizActionNavbar
    v-if="quizStarted"
    :show="isShow"
    :mode="navMode"
    :is-last="isLast"
    :submit-disabled="quizStore.userInput.trim() === ''"
    :label="isLast ? 'Selesai' : 'Selanjutnya'"
    status="neutral"
    @proceed="quizStore.nextQuestion"
    @submit="quizStore.submitAnswer(quizStore.userInput)"
    @skip="quizStore.submitAnswer('')"
  />
</template>

