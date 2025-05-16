<script setup lang="ts">
import { computed } from 'vue';
import { useQuizStore } from '../stores/quizStore';

const quizStore = useQuizStore();

const questionNumber = computed(() => {
  return quizStore.currentQuestionIndex + 1;
});

const totalQuestions = computed(() => {
  return quizStore.questions.length;
});

</script>

<template>
  <header class="quiz-header">
    <h1 class="quiz-title">Japanese Quiz</h1>
    <div class="quiz-stats">
      <span class="quiz-progress">Question {{ questionNumber }} of {{ totalQuestions }}</span>
      <span class="quiz-score">Score: {{ quizStore.score }}</span>
    </div>
    <div class="progress-container">
      <div class="progress-bar" :style="{ width: `${quizStore.progress}%` }"></div>
    </div>
  </header>
</template>

<style scoped>
.quiz-header {
  padding: 1.5rem;
  text-align: center;
  position: relative;
}

.quiz-title {
  font-size: 2.25rem;
  color: #4F46E5;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.quiz-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #4B5563;
  font-size: 1rem;
}

.quiz-score {
  font-weight: 600;
  color: #4F46E5;
}

.progress-container {
  width: 100%;
  height: 8px;
  background-color: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #4F46E5;
  transition: width 0.3s ease-in-out;
}

@media (max-width: 768px) {
  .quiz-title {
    font-size: 1.75rem;
  }
  
  .quiz-stats {
    font-size: 0.875rem;
  }
}
</style>