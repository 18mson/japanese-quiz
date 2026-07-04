<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useQuizStore } from './stores/quizStore';
import QuizHeader from './components/QuizHeader.vue';
import QuizQuestion from './components/QuizQuestion.vue';
import QuizOptions from './components/QuizOptions.vue';
import QuizWordInput from './components/QuizWordInput.vue';
import QuizResults from './components/QuizResults.vue';
import StartScreen from './components/StartScreen.vue';

const quizStore = useQuizStore();
const quizStarted = ref(false);

const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (!quizStarted.value || quizStore.quizCompleted) return;
  
  if (event.key === 'Enter') {
    if (quizStore.selectedAnswer !== null) {
      quizStore.nextQuestion();
      event.preventDefault();
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
  // Initialize the quiz but don't start it yet
  quizStore.startQuiz(10);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});

const startQuiz = () => {
  quizStarted.value = true;
};

const goToHome = () => {
  quizStarted.value = false;
};
</script>

<template>
  <div class="h-screen max-h-screen overflow-hidden flex flex-col bg-gray-50 text-gray-800">
    <StartScreen v-if="!quizStarted" @start="startQuiz" />
    <div v-else class="max-w-2xl w-full mx-auto p-4 flex flex-col h-full overflow-hidden relative" :class="{ 'pb-20': quizStore.isTypingMode || quizStore.selectedAnswer !== null }">
      <QuizHeader class="flex-shrink-0" />
      
      <main class="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center w-full border border-gray-100 flex-1 overflow-hidden mb-4" v-if="!quizStore.quizCompleted">
        <QuizQuestion class="flex-shrink-0" />
        <div class="w-full flex-1 flex flex-col justify-start items-center overflow-y-auto py-2">
          <QuizWordInput v-if="quizStore.isTypingMode" />
          <QuizOptions v-else />
        </div>
      </main>
      
      <QuizResults v-else class="flex-1 overflow-hidden" />
      
      <!-- Fixed/Pinned Bottom Action Navbar (Full Viewport Width) -->
      <div 
        v-if="quizStarted && !quizStore.quizCompleted && (quizStore.isTypingMode || quizStore.selectedAnswer !== null)" 
        class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3.5 px-6 flex justify-center items-center shadow-lg z-30 w-full animate-fadeIn"
      >
        <div class="max-w-md w-full flex justify-center gap-4">
          <!-- Pre-answer actions (Only in typing mode) -->
          <template v-if="quizStore.selectedAnswer === null">
            <template v-if="quizStore.isTypingMode">
              <button 
                class="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-xl transition duration-200 hover:bg-gray-300 cursor-pointer shadow-sm text-sm"
                @click="quizStore.submitAnswer('')"
              >
                Skip
              </button>
              <button 
                class="px-8 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl transition duration-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm flex-1 max-w-[200px]"
                :disabled="quizStore.userInput.trim() === ''"
                @click="quizStore.submitAnswer(quizStore.userInput)"
              >
                Submit
              </button>
            </template>
          </template>
          
          <!-- Post-answer Action (Next / See Results) -->
          <template v-else>
            <button 
              class="w-full sm:w-56 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-2.5 shadow-md hover:shadow-lg transition duration-200 flex justify-center items-center gap-2 cursor-pointer text-sm"
              @click="quizStore.nextQuestion"
            >
              <span>{{ quizStore.currentQuestionIndex < quizStore.questions.length - 1 ? 'Next Question' : 'See Results' }}</span>
              <span class="text-xs bg-indigo-500/50 px-2 py-0.5 rounded border border-indigo-400/30 font-mono">Enter</span>
            </button>
          </template>
        </div>
      </div>

      <footer v-if="quizStarted && quizStore.quizCompleted" class="py-2 text-center flex-shrink-0">
        <button 
          class="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-base font-semibold cursor-pointer transition-transform hover:bg-indigo-700"
          @click="goToHome"
        >
          Go to Home
        </button>
      </footer>
    </div>
  </div>
</template>
