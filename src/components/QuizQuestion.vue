<script setup lang="ts">
import { computed } from 'vue';
import { useQuizStore } from '../stores/quizStore';

const quizStore = useQuizStore();

const character = computed(() => {
  return quizStore.currentQuestion?.character || '';
});
</script>

<template>
  <div class="question-container">
    <div class="hiragana-display">
      <span class="hiragana-character">{{ character }}</span>
    </div>
    <p class="question-prompt">What is the romaji (alphabetic) equivalent?</p>
  </div>
</template>

<style scoped>
.question-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
}

.hiragana-display {
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F3F4F6;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hiragana-display:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.hiragana-character {
  font-size: 6rem;
  color: #1F2937;
  font-weight: 500;
}

.question-prompt {
  font-size: 1.25rem;
  color: #4B5563;
  margin: 0;
  text-align: center;
}

@media (max-width: 768px) {
  .hiragana-display {
    width: 120px;
    height: 120px;
  }
  
  .hiragana-character {
    font-size: 4rem;
  }
  
  .question-prompt {
    font-size: 1rem;
  }
}
</style>