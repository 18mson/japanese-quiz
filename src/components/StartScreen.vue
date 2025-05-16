<script setup lang="ts">
import { ref } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { hiraganaData, type HiraganaCharacter } from '../data/hiragana';
import { katakanaData } from '../data/katakana';

const quizStore = useQuizStore();
const questionCount = ref(10);
const characterTypes = ref('hiragana');
const showAllHiragana = ref(false);
const showAllKatakana = ref(false);

const emit = defineEmits(['start']);

const startQuiz = () => {
  quizStore.startQuiz(questionCount.value, characterTypes.value);
  emit('start');
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-8 flex flex-col items-center text-center animate-fadeIn">
    <h1 class="text-4xl text-indigo-600 mb-4 font-bold">Japanese Quiz</h1>
    <p class="text-lg text-gray-600 mb-10 max-w-2xl">
      Test your knowledge of Japanese Hiragana and Katakana characters. 
      Match each Hiragana or Katakana to its correct romaji (alphabetic) equivalent.
    </p>
    <div class="flex justify-center gap-2 flex-wrap mb-6">
      <button 
        v-for="type in ['hiragana', 'katakana']"
        :key="type" 
        :class="['capitalize px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg text-base cursor-pointer transition-all', characterTypes === type ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-200']"
        @click="characterTypes = type"
      >
        {{ type }}
      </button>
    </div>
    <div class="mb-10 w-full max-w-lg">
      <label for="question-count" class="block mb-3 text-lg text-gray-700">Number of questions:</label>
      <div class="grid grid-cols-3 gap-4">
        <button 
          v-for="count in [5, 10, 15, 20, 25, 50]" 
          :key="count"
          :class="['px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg text-base cursor-pointer transition-all', questionCount === count ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-200']"
          @click="questionCount = count"
        >
          {{ count }}
        </button>
      </div>
    </div>
    
    <button 
      class="px-10 py-4 bg-indigo-600 text-white border-none rounded-lg text-lg font-semibold cursor-pointer transition-transform hover:bg-indigo-700 hover:-translate-y-1 mb-12" 
      @click="startQuiz"
    >
      Start Quiz
    </button>
    
    <div class="bg-gray-100 rounded-xl p-6 w-full max-w-2xl">
      <h2 class="text-xl text-gray-800 mb-3">About Hiragana</h2>
      <p class="text-gray-600 leading-relaxed">
        Hiragana is one of the Japanese writing systems. It's a phonetic alphabet where each character represents a syllable. 
        Learning Hiragana is the first step to reading and writing Japanese.
      </p>
      <div class="mt-6">
        <h2 class="text-xl text-gray-800 mb-3">Hiragana Chart</h2>
        <div class="grid grid-cols-5 gap-4">
          <div 
            v-for="(char, index) in (showAllHiragana ? hiraganaData : hiraganaData.slice(0, 5))" 
            :key="index" 
            class="flex flex-col items-center p-4 bg-white border border-gray-300 rounded-lg shadow-sm"
              >
            <span class="text-2xl font-bold text-gray-800">{{ char.character }}</span>
            <span class="text-sm text-gray-600">{{ char.romaji }}</span>
          </div>
        </div>
        <button 
          class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium cursor-pointer transition-transform hover:bg-indigo-700"
          @click="showAllHiragana = !showAllHiragana"
        >
          {{ showAllHiragana ? 'Show Less' : 'Show All' }}
        </button>
      </div>
    </div>
    <div class="bg-gray-100 rounded-xl p-6 w-full max-w-2xl mt-6">
      <h2 class="text-xl text-gray-800 mb-3">About Katakana</h2>
      <p class="text-gray-600 leading-relaxed">
        Katakana is another Japanese writing system, primarily used for foreign words and names. 
        It consists of characters that are angular and sharp, making it visually distinct from Hiragana.
      </p>
      <div class="mt-6">
        <h2 class="text-xl text-gray-800 mb-3">Katakana Chart</h2>
        <div class="grid grid-cols-5 gap-4">
          <div 
            v-for="(char, index) in (showAllKatakana ? katakanaData : katakanaData.slice(0, 5))" 
            :key="index" 
            class="flex flex-col items-center p-4 bg-white border border-gray-300 rounded-lg shadow-sm"
          >
            <span class="text-2xl font-bold text-gray-800">{{ char.character }}</span>
            <span class="text-sm text-gray-600">{{ char.romaji }}</span>
          </div>
        </div>
        <button 
          class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium cursor-pointer transition-transform hover:bg-indigo-700"
          @click="showAllKatakana = !showAllKatakana"
        >
          {{ showAllKatakana ? 'Show Less' : 'Show All' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
