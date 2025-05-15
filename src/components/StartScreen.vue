<script setup lang="ts">
import { ref } from 'vue';
import { useQuizStore } from '../stores/quizStore';

const quizStore = useQuizStore();
const questionCount = ref(10);

const emit = defineEmits(['start']);

const startQuiz = () => {
  quizStore.startQuiz(questionCount.value);
  emit('start');
};
</script>

<template>
  <div class="start-screen">
    <h1 class="title">Hiragana Quiz</h1>
    <p class="description">
      Test your knowledge of Japanese Hiragana characters. 
      Match each Hiragana to its correct romaji (alphabetic) equivalent.
    </p>
    
    <div class="question-count">
      <label for="question-count">Number of questions:</label>
      <div class="count-selector">
        <button 
          v-for="count in [5, 10, 15, 20, 25, 50]" 
          :key="count"
          :class="{ active: questionCount === count }"
          class="count-button"
          @click="questionCount = count"
        >
          {{ count }}
        </button>
      </div>
    </div>
    
    <button class="start-button" @click="startQuiz">
      Start Quiz
    </button>
    
    <div class="info-section">
      <h2 class="info-title">About Hiragana</h2>
      <p class="info-text">
        Hiragana is one of the Japanese writing systems. It's a phonetic alphabet where each character represents a syllable. 
        Learning Hiragana is the first step to reading and writing Japanese.
      </p>
    </div>
  </div>
</template>

<style scoped>
.start-screen {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.title {
  font-size: 3rem;
  color: #4F46E5;
  margin-bottom: 1rem;
  font-weight: 700;
}

.description {
  font-size: 1.25rem;
  color: #4B5563;
  margin-bottom: 2.5rem;
  max-width: 600px;
}

.question-count {
  margin-bottom: 2.5rem;
  width: 100%;
  max-width: 500px;
}

.question-count label {
  display: block;
  margin-bottom: 0.75rem;
  font-size: 1.125rem;
  color: #374151;
}

.count-selector {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.count-button {
  padding: 0.5rem 1rem;
  background-color: #F3F4F6;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.count-button.active {
  background-color: #4F46E5;
  color: white;
  border-color: #4F46E5;
}

.count-button:hover:not(.active) {
  background-color: #E5E7EB;
}

.start-button {
  padding: 1rem 2.5rem;
  background-color: #4F46E5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  margin-bottom: 3rem;
}

.start-button:hover {
  background-color: #4338CA;
  transform: translateY(-2px);
}

.info-section {
  background-color: #F3F4F6;
  border-radius: 12px;
  padding: 1.5rem;
  width: 100%;
  max-width: 600px;
}

.info-title {
  font-size: 1.5rem;
  color: #1F2937;
  margin-bottom: 0.75rem;
}

.info-text {
  color: #4B5563;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .start-screen {
    padding: 1.5rem;
  }
  
  .title {
    font-size: 2.25rem;
  }
  
  .description {
    font-size: 1rem;
  }
  
  .count-button {
    padding: 0.375rem 0.75rem;
  }
  
  .start-button {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  }
  
  .info-title {
    font-size: 1.25rem;
  }
}
</style>