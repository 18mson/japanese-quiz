<script setup lang="ts">
import { ref } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { Zap, Award, Target } from '@lucide/vue';

const quizStore = useQuizStore();
const targetDurationMinutes = ref<number>(1);
const characterTypes = ref('hiragana');
const selectedLevel = ref<'basic' | 'n5'>('basic');

const selectLevel = (level: 'basic' | 'n5') => {
  selectedLevel.value = level;
  if (level === 'basic' && characterTypes.value === 'words') {
    characterTypes.value = 'hiragana';
  }
};

const selectContent = (type: string) => {
  if (type === 'words' && selectedLevel.value === 'basic') return;
  characterTypes.value = type;
};

const emit = defineEmits(['start', 'openMasteryGrid']);

const startQuiz = async () => {
  await quizStore.startQuiz(targetDurationMinutes.value, characterTypes.value, selectedLevel.value);
  emit('start');
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 md:p-6 flex flex-col items-center text-center animate-fadeIn h-full overflow-y-auto w-full">
    <h1 class="text-3xl md:text-4xl bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2 font-extrabold tracking-tight flex-shrink-0">
      Japanese Kana & Vocab Quiz
    </h1>
    <p class="text-sm md:text-base text-gray-600 mb-5 max-w-2xl font-medium leading-relaxed flex-shrink-0">
      Learn and master Japanese Hiragana and Katakana characters, or level up your N5 vocabulary with interactive keyboard typing challenges.
    </p>

    <!-- Overall Mastery Hero Card -->
    <div 
      @click="emit('openMasteryGrid')"
      class="w-full max-w-3xl mb-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-5 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-indigo-400/20 relative overflow-hidden group flex flex-col md:flex-row items-center justify-between gap-4 text-left flex-shrink-0"
    >
      <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl group-hover:scale-125 transition-all"></div>
      
      <div class="flex items-center gap-4 relative z-10">
        <div class="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner flex-shrink-0">
          <Award class="w-7 h-7" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-indigo-950 px-2 py-0.5 rounded-full">Progress</span>
            <span class="text-xs text-indigo-200 font-semibold">{{ quizStore.overallMasteryStats.mastered }} / {{ quizStore.overallMasteryStats.total }} Total Dikuasai</span>
          </div>
          <h3 class="text-lg font-black text-white mt-1">Peta Penguasaan Huruf</h3>
          <p class="text-xs text-indigo-200">Hiragana: <strong class="text-white">{{ quizStore.hiraganaMasteryStats.percentage }}%</strong> | Katakana: <strong class="text-white">{{ quizStore.katakanaMasteryStats.percentage }}%</strong> | Words: <strong class="text-white">{{ quizStore.wordsMasteryStats.percentage }}%</strong></p>
        </div>
      </div>

      <div class="flex items-center gap-3 relative z-10 w-full md:w-auto justify-between md:justify-end">
        <div class="flex flex-col text-right">
          <span class="text-2xl font-black text-amber-300">{{ quizStore.overallMasteryStats.percentage }}%</span>
          <span class="text-[10px] text-indigo-200 uppercase font-bold tracking-wider">Overall Mastered</span>
        </div>
        <button 
          class="px-4 py-2.5 bg-white text-indigo-900 group-hover:bg-amber-400 group-hover:text-indigo-950 rounded-xl font-extrabold text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1.5 cursor-pointer flex-shrink-0"
        >
          <span>Lihat Grid</span>
          <Target class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Step 1: Choose Quiz Mode -->
    <div class="w-full max-w-3xl mb-6 flex-shrink-0">
      <h2 class="text-lg font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
        <span class="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">1</span>
        Choose Your Game Mode
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Multiple Choice Card -->
        <div 
          @click="selectLevel('basic')"
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
              <h3 class="text-xl font-bold text-gray-900">Multiple Choice</h3>
              <span 
                :class="[
                  'text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider',
                  selectedLevel === 'basic' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                ]"
              >
                Basic Level
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2 text-xs font-bold text-gray-500 flex-wrap">
            <span class="bg-gray-100 px-2.5 py-1 rounded-md">Hiragana</span>
            <span class="bg-gray-100 px-2.5 py-1 rounded-md">Katakana</span>
          </div>
        </div>

        <!-- Keyboard Typing Card -->
        <div 
          @click="selectLevel('n5')"
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
              <h3 class="text-xl font-bold text-gray-900">Keyboard Typing</h3>
              <span 
                :class="[
                  'text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider',
                  selectedLevel === 'n5' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'
                ]"
              >
                Road to N5
              </span>
            </div>
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
          :disabled="type === 'words' && selectedLevel === 'basic'"
          :title="type === 'words' && selectedLevel === 'basic' ? 'Everyday Words is only available in Keyboard Typing mode' : ''"
          :class="[
            'capitalize px-4 py-2.5 border-2 rounded-2xl text-base font-bold transition-all duration-200 shadow-sm flex items-center gap-2',
            type === 'words' && selectedLevel === 'basic'
              ? 'bg-gray-100 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed shadow-none'
              : characterTypes === type 
                ? (selectedLevel === 'n5' ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-200 cursor-pointer hover:-translate-y-0.5' : 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 cursor-pointer hover:-translate-y-0.5')
                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700 hover:border-gray-300 cursor-pointer hover:-translate-y-0.5'
          ]"
          @click="selectContent(type)"
        >
          <span>
            {{ type === 'words' ? 'Everyday Words' : type }}
          </span>
          <span v-if="type === 'words' && selectedLevel === 'n5'" class="text-xs bg-amber-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">New</span>
          <span v-if="type === 'words' && selectedLevel === 'basic'" class="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-semibold">Typing Only</span>
        </button>
      </div>
    </div>

    <!-- Step 3: Select Target Duration -->
    <div class="w-full max-w-xl mb-6 flex-shrink-0">
      <h2 class="text-lg font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
        <span class="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">3</span>
        Target Session Duration
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button 
          v-for="d in [
            { min: 1, label: '1 Menit', desc: '⚡ Kilat (~8 soal)' },
            { min: 3, label: '3 Menit', desc: '🔥 Fokus (~22 soal)' },
            { min: 5, label: '5 Menit', desc: '🏆 Maraton (~35 soal)' }
          ]" 
          :key="d.min"
          :class="[
            'p-3 border-2 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm flex flex-col items-center justify-center text-center',
            targetDurationMinutes === d.min 
              ? (selectedLevel === 'n5' ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-100 ring-2 ring-violet-400/30' : 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 ring-2 ring-indigo-400/30') 
              : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700 hover:border-gray-300'
          ]"
          @click="targetDurationMinutes = d.min"
        >
          <span class="text-base font-black">{{ d.label }}</span>
          <span :class="['text-[11px] font-semibold mt-0.5', targetDurationMinutes === d.min ? 'text-indigo-100' : 'text-gray-500']">{{ d.desc }}</span>
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
        <Zap class="w-5 h-5 text-amber-300" />
      </template>
    </button>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
