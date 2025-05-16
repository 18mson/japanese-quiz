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

const goToHome = () => {
  quizStarted.value = false;
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 text-gray-800">
    <StartScreen v-if="!quizStarted" @start="startQuiz" />
    <div v-else class="max-w-4xl mx-auto p-4 flex flex-col">
      <QuizHeader />
      
      <main class="bg-white rounded-lg shadow-md p-8 mb-8 flex flex-col items-center" v-if="!quizStore.quizCompleted">
        <QuizQuestion />
        <QuizOptions />
      </main>
      
      <QuizResults v-else />
      <footer v-if="quizStarted && quizStore.quizCompleted" class="py-4 text-center h-full">
        <button 
          class="px-6 py-3 bg-indigo-600 text-white rounded-lg text-lg font-semibold cursor-pointer transition-transform hover:bg-indigo-700"
          @click="goToHome"
        >
          Go to Home
        </button>
      </footer>
    </div>
  </div>
</template>
