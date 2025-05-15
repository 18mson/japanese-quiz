<script setup lang="ts">
import { useQuizStore } from '../stores/quizStore';

const quizStore = useQuizStore();

const submitOption = (option: string) => {
  quizStore.submitAnswer(option);
};

const getOptionClass = (option: string) => {
  if (quizStore.selectedAnswer === null) return '';
  
  if (option === quizStore.currentQuestion?.romaji) {
    return 'option-correct';
  }
  
  if (option === quizStore.selectedAnswer && option !== quizStore.currentQuestion?.romaji) {
    return 'option-incorrect';
  }
  
  return 'option-inactive';
};
</script>

<template>
  <div class="grid grid-cols-3 gap-4">
    <div class="feedback-message" v-if="quizStore.selectedAnswer !== null"> 
      <div v-if="quizStore.isAnswerCorrect" class="correct-message">
        <span>Correct! 🎉</span>
      </div>
      <div v-else class="incorrect-message">
        <span>Incorrect. The correct answer is "{{ quizStore.currentQuestion?.romaji }}"</span>
      </div>
    </div>
    <button 
      v-for="option in quizStore.options" 
      :key="option"
      class="option-button"
      :class="getOptionClass(option)"
      @click="submitOption(option)"
      :disabled="quizStore.selectedAnswer !== null"
    >
      {{ option }}
    </button>
    
    <div class="feedback-message" v-if="quizStore.selectedAnswer !== null">
      <button class="next-button w-full" @click="quizStore.nextQuestion">
        {{ quizStore.currentQuestionIndex < quizStore.questions.length - 1 ? 'Next' : 'See Results' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.options-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  /* margin: 1.5rem 0; */
  max-width: 600px;
  width: 100%;
}

.option-button {
  padding: 1rem;
  font-size: 1.125rem;
  background-color: white;
  border: 2px solid #D1D5DB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 64px;
}

.option-button:hover:not(:disabled):not(.option-correct):not(.option-incorrect):not(.option-inactive) {
  border-color: #4F46E5;
  background-color: #EEF2FF;
}

.option-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3);
}

.option-correct {
  border-color: #10B981;
  background-color: #ECFDF5;
  color: #065F46;
}

.option-incorrect {
  border-color: #EF4444;
  background-color: #FEF2F2;
  color: #991B1B;
}

.option-inactive {
  opacity: 0.6;
  cursor: not-allowed;
}

.feedback-message {
  grid-column: span 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.correct-message, .incorrect-message {
  font-size: 1.125rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  width: 100%;
  text-align: center;
}

.correct-message {
  background-color: #ECFDF5;
  color: #065F46;
}

.incorrect-message {
  background-color: #FEF2F2;
  color: #991B1B;
}

.next-button {
  background-color: #4F46E5;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.next-button:hover {
  background-color: #4338CA;
}

@media (max-width: 768px) {
  .options-container {
    grid-template-columns: 1fr;
  }
  
  .feedback-message {
    grid-column: span 1;
  }
  
  .option-button {
    font-size: 1rem;
    min-height: 56px;
  }
}
</style>