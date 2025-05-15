<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuizStore } from './stores/quizStore';
import QuizHeader from './components/QuizHeader.vue';
import QuizQuestion from './components/QuizQuestion.vue';
import QuizOptions from './components/QuizOptions.vue';
import QuizResults from './components/QuizResults.vue';
import StartScreen from './components/StartScreen.vue';

const quizStore = useQuizStore();
const quizStarted = ref(false);

onMounted(() => {
  // Initialize the quiz but don't start it yet
  quizStore.startQuiz(10);
});

const startQuiz = () => {
  quizStarted.value = true;
};
</script>

<template>
  <div class="app-container">
    <StartScreen v-if="!quizStarted" @start="startQuiz" />
    
    <div v-else class="quiz-container">
      <QuizHeader />
      
      <main class="quiz-main" v-if="!quizStore.quizCompleted">
        <QuizQuestion />
        <QuizOptions />
      </main>
      
      <QuizResults v-else />
    </div>
  </div>
</template>

<style>
:root {
  --primary-color: #4F46E5;
  --secondary-color: #F9A8D4;
  --accent-color: #0D9488;
  --success-color: #10B981;
  --warning-color: #F59E0B;
  --error-color: #EF4444;
  --background-color: #F9FAFB;
  --card-background: #FFFFFF;
  --text-primary: #1F2937;
  --text-secondary: #4B5563;
  --text-tertiary: #6B7280;
  --border-color: #E5E7EB;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--background-color);
  color: var(--text-primary);
  line-height: 1.5;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.quiz-container {
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.quiz-main {
  background-color: var(--card-background);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

button {
  font-family: inherit;
}

@media (max-width: 768px) {
  .quiz-main {
    padding: 1.25rem;
  }
}
</style>