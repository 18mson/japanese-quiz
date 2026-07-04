<script setup lang="ts">
import { ref } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { hiraganaData } from '../data/hiragana';
import { katakanaData } from '../data/katakana';

const quizStore = useQuizStore();
const questionCount = ref(10);
const characterTypes = ref('hiragana');
const selectedLevel = ref<'basic' | 'n5'>('basic');
const showAllHiragana = ref(false);
const showAllKatakana = ref(false);
const showCharts = ref(false);

const emit = defineEmits(['start']);

const startQuiz = async () => {
  await quizStore.startQuiz(questionCount.value, characterTypes.value, selectedLevel.value);
  emit('start');
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 md:p-6 flex flex-col items-center text-center animate-fadeIn h-full overflow-y-auto w-full">
    <h1 class="text-3xl md:text-4xl bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2 font-extrabold tracking-tight flex-shrink-0">
      Japanese Kana & Vocab Quiz
    </h1>
    <p class="text-sm md:text-base text-gray-600 mb-6 max-w-2xl font-medium leading-relaxed flex-shrink-0">
      Learn and master Japanese Hiragana and Katakana characters, or level up your N5 vocabulary with interactive keyboard typing challenges.
    </p>

    <!-- Step 1: Choose Difficulty Level -->
    <div class="w-full max-w-3xl mb-6 flex-shrink-0">
      <h2 class="text-lg font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
        <span class="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">1</span>
        Choose Your Difficulty Level
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Basic Level Card -->
        <div 
          @click="selectedLevel = 'basic'"
          :class="[
            'border-2 rounded-2xl p-4 text-left cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between h-full relative overflow-hidden',
            selectedLevel === 'basic' 
              ? 'border-indigo-600 bg-gradient-to-br from-indigo-50/40 to-white ring-4 ring-indigo-600/10' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          ]"
        >
          <div v-if="selectedLevel === 'basic'" class="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl -mr-6 -mt-6"></div>
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xl font-bold text-gray-900">Basic Level</h3>
              <span 
                :class="[
                  'text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider',
                  selectedLevel === 'basic' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                ]"
              >
                Multiple Choice
              </span>
            </div>
            <p class="text-sm text-gray-600 leading-relaxed mb-2">
              Practice reading phonetic characters (Hiragana & Katakana) and everyday vocabulary by matching them with standard multiple-choice Romaji options.
            </p>
          </div>
          <div class="flex items-center gap-2 text-xs font-bold text-gray-500 flex-wrap">
            <span class="bg-gray-100 px-2.5 py-1 rounded-md">Hiragana</span>
            <span class="bg-gray-100 px-2.5 py-1 rounded-md">Katakana</span>
            <span class="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md">Everyday Words</span>
          </div>
        </div>

        <!-- N5 Level Card -->
        <div 
          @click="selectedLevel = 'n5'"
          :class="[
            'border-2 rounded-2xl p-4 text-left cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between h-full relative overflow-hidden',
            selectedLevel === 'n5' 
              ? 'border-violet-600 bg-gradient-to-br from-violet-50/40 to-white ring-4 ring-violet-600/10' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          ]"
        >
          <div v-if="selectedLevel === 'n5'" class="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-xl -mr-6 -mt-6"></div>
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xl font-bold text-gray-900">JLPT N5 Level</h3>
              <span 
                :class="[
                  'text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider',
                  selectedLevel === 'n5' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'
                ]"
              >
                Keyboard Typing
              </span>
            </div>
            <p class="text-sm text-gray-600 leading-relaxed mb-2">
              Challenge yourself by typing characters or everyday vocabulary. No multiple-choice options, answers are input directly in Romaji.
            </p>
          </div>
          <div class="flex items-center gap-2 text-xs font-bold text-gray-500 flex-wrap">
            <span class="bg-gray-100 px-2.5 py-1 rounded-md">Hiragana</span>
            <span class="bg-gray-100 px-2.5 py-1 rounded-md">Katakana</span>
            <span class="bg-violet-100 text-violet-700 px-2.5 py-1 rounded-md">Everyday Words</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Select Quiz Content -->
    <div class="w-full max-w-3xl mb-6 flex-shrink-0">
      <h2 class="text-lg font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
        <span class="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">2</span>
        Select Quiz Content
      </h2>
      <div class="flex justify-center gap-3 flex-wrap">
        <button 
          v-for="type in ['hiragana', 'katakana', 'words']"
          :key="type" 
          :class="[
            'capitalize px-4 py-2.5 border-2 rounded-2xl text-base font-bold cursor-pointer transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md flex items-center gap-2',
            characterTypes === type 
              ? (selectedLevel === 'n5' ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-200' : 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200')
              : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700 hover:border-gray-300'
          ]"
          @click="characterTypes = type"
        >
          <span>
            {{ type === 'words' ? 'Everyday Words' : type }}
          </span>
          <span v-if="type === 'words'" class="text-xs bg-amber-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">New</span>
        </button>
      </div>
    </div>

    <!-- Step 3: Select Question Count -->
    <div class="w-full max-w-lg mb-6 flex-shrink-0">
      <h2 class="text-lg font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
        <span class="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">3</span>
        Number of Questions
      </h2>
      <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <button 
          v-for="count in [5, 10, 20, 30, 60, 100]" 
          :key="count"
          :class="[
            'px-3 py-2 border-2 rounded-xl text-base font-bold cursor-pointer transition-all duration-200 shadow-sm',
            questionCount === count 
              ? (selectedLevel === 'n5' ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-100' : 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100') 
              : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600 hover:border-gray-300'
          ]"
          @click="questionCount = count"
        >
          {{ count }}
        </button>
      </div>
    </div>
    
    <button 
      class="px-8 py-3 bg-gradient-to-r text-white border-none rounded-2xl text-lg font-bold cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 mb-6 flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed disabled:translate-y-0 flex-shrink-0"
      :class="selectedLevel === 'n5' ? 'from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-violet-200 hover:shadow-violet-300' : 'from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 shadow-indigo-200 hover:shadow-indigo-300'"
      @click="startQuiz"
      :disabled="quizStore.isLoading"
    >
      <span v-if="quizStore.isLoading" class="flex items-center gap-2">
        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading Questions...
      </span>
      <template v-else>
        <span>Start Quiz</span>
        <span class="text-lg">⚡</span>
      </template>
    </button>
    
    <!-- Collapsible Reference Section -->
    <div class="w-full max-w-2xl mt-4 flex-shrink-0">
      <button 
        @click="showCharts = !showCharts" 
        class="w-full py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
      >
        <span>{{ showCharts ? 'Hide Reference Charts' : '📖 Show Reference Charts' }}</span>
        <span class="text-xs">{{ showCharts ? '▲' : '▼' }}</span>
      </button>
      
      <div v-if="showCharts" class="mt-4 space-y-6 animate-fadeIn text-left">
        <!-- Hiragana Chart Card -->
        <div class="bg-gray-100 rounded-xl p-6 w-full">
          <h2 class="text-xl text-gray-800 mb-3 font-semibold">About Hiragana</h2>
          <p class="text-gray-600 leading-relaxed text-sm">
            Hiragana is one of the Japanese writing systems. It's a phonetic alphabet where each character represents a syllable. 
            Learning Hiragana is the first step to reading and writing Japanese.
          </p>
          <div class="mt-6">
            <h2 class="text-lg text-gray-800 mb-3 font-semibold">Hiragana Chart</h2>
            <div class="grid grid-cols-5 md:gap-4 gap-2">
              <div 
                v-for="(char, index) in (showAllHiragana ? hiraganaData : hiraganaData.slice(0, 5))" 
                :key="index" 
                class="flex flex-col items-center py-3 bg-white border border-gray-300 rounded-lg shadow-sm"
              >
                <span class="md:text-xl text-base font-bold text-gray-800">{{ char.character }}</span>
                <span class="text-xs text-gray-500">{{ char.romaji }}</span>
              </div>
            </div>
            <button 
              class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold cursor-pointer transition-transform hover:bg-indigo-700"
              @click="showAllHiragana = !showAllHiragana"
            >
              {{ showAllHiragana ? 'Show Less' : 'Show All' }}
            </button>
          </div>
        </div>

        <!-- Katakana Chart Card -->
        <div class="bg-gray-100 rounded-xl p-6 w-full mt-6">
          <h2 class="text-xl text-gray-800 mb-3 font-semibold">About Katakana</h2>
          <p class="text-gray-600 leading-relaxed text-sm">
            Katakana is another Japanese writing system, primarily used for foreign words and names. 
            It consists of characters that are angular and sharp, making it visually distinct from Hiragana.
          </p>
          <div class="mt-6">
            <h2 class="text-lg text-gray-800 mb-3 font-semibold">Katakana Chart</h2>
            <div class="grid grid-cols-5 md:gap-4 gap-2">
              <div 
                v-for="(char, index) in (showAllKatakana ? katakanaData : katakanaData.slice(0, 5))" 
                :key="index" 
                class="flex flex-col items-center py-3 bg-white border border-gray-300 rounded-lg shadow-sm"
              >
                <span class="md:text-xl text-base font-bold text-gray-800">{{ char.character }}</span>
                <span class="text-xs text-gray-500">{{ char.romaji }}</span>
              </div>
            </div>
            <button 
              class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold cursor-pointer transition-transform hover:bg-indigo-700"
              @click="showAllKatakana = !showAllKatakana"
            >
              {{ showAllKatakana ? 'Show Less' : 'Show All' }}
            </button>
          </div>
        </div>
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
