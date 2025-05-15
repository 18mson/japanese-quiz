<script setup lang="ts">
import { useQuizStore } from '../stores/quizStore';

const quizStore = useQuizStore();

const getScoreMessage = () => {
  const score = quizStore.finalScore;
  
  if (score >= 90) return 'Outstanding! You\'re a Hiragana master!';
  if (score >= 70) return 'Great job! You\'re getting very good at this!';
  if (score >= 50) return 'Nice work! Keep practicing to improve!';
  return 'Good effort! With more practice, you\'ll improve quickly!';
};
</script>

<template>
  <div class="results-container" v-if="quizStore.quizCompleted">
    <h2 class="results-title">Quiz Results</h2>
    
    <div class="score-display">
      <div class="score-circle">
        <span class="score-number">{{ Math.round(quizStore.finalScore) }}%</span>
      </div>
      <p class="score-message">{{ getScoreMessage() }}</p>
    </div>
    
    <div class="answers-summary">
      <h3 class="summary-title">Question Summary</h3>
      <ul class="answers-list">
        <li 
          v-for="(answer, index) in quizStore.userAnswers" 
          :key="index"
          class="answer-item"
          :class="{ 'correct': answer.isCorrect, 'incorrect': !answer.isCorrect }"
        >
          <div class="character">{{ answer.character }}</div>
          <div class="answer-details">
            <span class="answer-status">{{ answer.isCorrect ? 'Correct' : 'Incorrect' }}</span>
            <span class="romaji-info">
              <template v-if="answer.isCorrect">
                You answered: {{ answer.userRomaji }}
              </template>
              <template v-else>
                You answered: {{ answer.userRomaji }} | Correct: {{ answer.correctRomaji }}
              </template>
            </span>
          </div>
        </li>
      </ul>
    </div>
    
    <button class="restart-button" @click="quizStore.restartQuiz">
      Try Again
    </button>
  </div>
</template>

<style scoped>
.results-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.results-title {
  font-size: 2rem;
  color: #1F2937;
  text-align: center;
  margin-bottom: 2rem;
}

.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 3rem;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4F46E5, #F9A8D4);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.5);
}

.score-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}

.score-message {
  font-size: 1.25rem;
  color: #4B5563;
  text-align: center;
  max-width: 500px;
}

.answers-summary {
  background-color: #F9FAFB;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.summary-title {
  font-size: 1.25rem;
  color: #1F2937;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.answers-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.answer-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.answer-item.correct {
  border-left: 4px solid #10B981;
}

.answer-item.incorrect {
  border-left: 4px solid #EF4444;
}

.character {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  background-color: #F3F4F6;
  border-radius: 8px;
}

.answer-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.answer-status {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.answer-item.correct .answer-status {
  color: #059669;
}

.answer-item.incorrect .answer-status {
  color: #DC2626;
}

.romaji-info {
  font-size: 0.875rem;
  color: #6B7280;
}

.restart-button {
  display: block;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  padding: 0.875rem 1.5rem;
  background-color: #4F46E5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: center;
}

.restart-button:hover {
  background-color: #4338CA;
}

@media (max-width: 768px) {
  .results-container {
    padding: 1rem;
  }
  
  .results-title {
    font-size: 1.5rem;
  }
  
  .score-circle {
    width: 120px;
    height: 120px;
  }
  
  .score-number {
    font-size: 2rem;
  }
  
  .score-message {
    font-size: 1rem;
  }
  
  .character {
    font-size: 1.5rem;
    width: 50px;
    height: 50px;
  }
}
</style>