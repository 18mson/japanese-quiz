<script setup lang="ts">
import { ref } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { Zap, Target } from '@lucide/vue';

const quizStore = useQuizStore();
const targetDurationMinutes = ref<number>(1);
const characterTypes = ref('hiragana');
const selectedLevel = ref<'basic' | 'n5'>('basic');

const selectModeAndContent = (level: 'basic' | 'n5', type: string) => {
  selectedLevel.value = level;
  characterTypes.value = type;
};

const getDurationDesc = (minutes: number) => {
  if (characterTypes.value === 'sentences') {
    if (minutes === 1) return '⚡ Kilat (4 kalimat)';
    if (minutes === 3) return '🔥 Fokus (10 kalimat)';
    if (minutes === 5) return '🏆 Maraton (16 kalimat)';
  } else if (characterTypes.value === 'words') {
    if (minutes === 1) return '⚡ Kilat (8 kata)';
    if (minutes === 3) return '🔥 Fokus (24 kata)';
    if (minutes === 5) return '🏆 Maraton (40 kata)';
  } else {
    if (minutes === 1) return '⚡ Kilat (16 soal)';
    if (minutes === 3) return '🔥 Fokus (48 soal)';
    if (minutes === 5) return '🏆 Maraton (78 soal)';
  }
  return '';
};

const emit = defineEmits(['start', 'openMasteryGrid']);

const startQuiz = async () => {
  await quizStore.startQuiz(targetDurationMinutes.value, characterTypes.value, selectedLevel.value);
  emit('start');
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 md:p-6 flex flex-col items-center animate-fadeIn h-full overflow-y-auto w-full">
    <h1 class="text-3xl md:text-4xl bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2 font-extrabold tracking-tight flex-shrink-0 text-center">
      Japanese Kana & Vocab Quiz
    </h1>
    <p class="text-sm md:text-base text-gray-600 mb-5 max-w-2xl font-medium leading-relaxed flex-shrink-0 text-center">
      Pelajari dan kuasai karakter Hiragana & Katakana Jepang, serta tingkatkan kosakata dan pengetikan kalimat N5 melalui tantangan interaktif.
    </p>

    <!-- Progress Header (1 Line) -->
    <div 
      @click="emit('openMasteryGrid')"
      class="w-full max-w-3xl mb-6 bg-white border border-gray-200 hover:border-indigo-300 rounded-2xl p-4 shadow-sm transition-all cursor-pointer flex items-center justify-between gap-4 flex-shrink-0"
    >
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
          <Target class="w-5 h-5" />
        </div>
        <div class="truncate">
          <div class="text-xs text-gray-500 font-medium">Peta penguasaan huruf</div>
          <div class="text-sm md:text-base font-bold text-gray-900 truncate">
            {{ quizStore.overallMasteryStats.mastered }} / {{ quizStore.overallMasteryStats.total }} Dikuasai
            <span class="text-indigo-600 font-extrabold ml-1.5">({{ quizStore.overallMasteryStats.percentage }}%)</span>
          </div>
        </div>
      </div>
      <button 
        type="button"
        class="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
      >
        <span>Lihat grid</span>
      </button>
    </div>

    <!-- Step 1: Mode & Content -->
    <div class="w-full max-w-3xl mb-6 flex-shrink-0">
      <h2 class="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span class="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">1</span>
        Pilih Mode & Konten Quiz
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Multiple Choice Card -->
        <div 
          @click="selectModeAndContent('basic', 'hiragana')"
          :class="[
            'rounded-2xl p-4 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer',
            selectedLevel === 'basic' && characterTypes !== 'sentences'
              ? 'border-2 border-indigo-600 bg-indigo-50/30 shadow-sm' 
              : 'border border-gray-200 bg-white hover:border-gray-300'
          ]"
        >
          <div>
            <div class="flex items-baseline justify-between mb-1">
              <h3 class="text-lg font-bold text-gray-900">
                Multiple Choice
                <span class="text-xs text-gray-500 font-normal ml-1">Basic</span>
              </h3>
            </div>
          </div>
          
          <div class="flex items-center gap-2 pt-2 border-t border-gray-100/80 flex-wrap">
            <button
              v-for="type in ['hiragana', 'katakana']"
              :key="type"
              type="button"
              @click.stop="selectModeAndContent('basic', type)"
              :class="[
                'capitalize px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                selectedLevel === 'basic' && characterTypes === type
                  ? 'bg-indigo-600 text-white border-2 border-indigo-600 shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              ]"
            >
              {{ type }}
            </button>
          </div>
        </div>

        <!-- Keyboard Typing Card -->
        <div 
          @click="selectModeAndContent('n5', 'hiragana')"
          :class="[
            'rounded-2xl p-4 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer',
            selectedLevel === 'n5' && characterTypes !== 'sentences'
              ? 'border-2 border-indigo-600 bg-indigo-50/30 shadow-sm' 
              : 'border border-gray-200 bg-white hover:border-gray-300'
          ]"
        >
          <div>
            <div class="flex items-baseline justify-between mb-1">
              <h3 class="text-lg font-bold text-gray-900">
                Keyboard Typing
                <span class="text-xs text-gray-500 font-normal ml-1">Kana & Words</span>
              </h3>
            </div>
          </div>
          
          <div class="flex items-center gap-1.5 pt-2 border-t border-gray-100/80 flex-wrap">
            <button
              v-for="type in ['hiragana', 'katakana', 'words']"
              :key="type"
              type="button"
              @click.stop="selectModeAndContent('n5', type)"
              :class="[
                'capitalize px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                selectedLevel === 'n5' && characterTypes === type
                  ? 'bg-indigo-600 text-white border-2 border-indigo-600 shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              ]"
            >
              <span>{{ type === 'words' ? 'Everyday Words' : type }}</span>
              <span v-if="type === 'words'" class="text-[10px] opacity-80 font-normal">(new)</span>
            </button>
          </div>
        </div>

        <!-- Sentence Typing Card -->
        <div 
          @click="selectModeAndContent('n5', 'sentences')"
          :class="[
            'rounded-2xl p-4 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer',
            characterTypes === 'sentences' 
              ? 'border-2 border-indigo-600 bg-indigo-50/30 shadow-sm' 
              : 'border border-gray-200 bg-white hover:border-gray-300'
          ]"
        >
          <div>
            <div class="flex items-baseline justify-between mb-1">
              <h3 class="text-lg font-bold text-gray-900">
                Sentence Typing
              </h3>
            </div>
            <p class="text-xs text-gray-500 mb-4">Latihan mengetik kalimat Jepang lengkap secara real-time.</p>
          </div>
          
          <div class="flex items-center gap-2 pt-2 border-t border-gray-100/80 flex-wrap">
            <button
              type="button"
              @click.stop="selectModeAndContent('n5', 'sentences')"
              :class="[
                'capitalize px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                characterTypes === 'sentences'
                  ? 'bg-indigo-600 text-white border-2 border-indigo-600 shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              ]"
            >
              <span>Kalimat N5</span>
              <span class="text-[10px] opacity-80 font-normal">(new)</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Select Target Duration -->
    <div class="w-full max-w-3xl mb-6 flex-shrink-0">
      <h2 class="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span class="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">2</span>
        Pilih Durasi Sesi
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button 
          v-for="min in [1, 3, 5]" 
          :key="min"
          type="button"
          :class="[
            'p-3.5 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-center',
            targetDurationMinutes === min 
              ? 'border-2 border-indigo-600 bg-indigo-50/40 text-indigo-950 shadow-sm' 
              : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:border-gray-300'
          ]"
          @click="targetDurationMinutes = min"
        >
          <span class="text-base font-extrabold" :class="targetDurationMinutes === min ? 'text-indigo-700' : 'text-gray-900'">{{ min }} Menit</span>
          <span class="text-xs font-medium mt-0.5" :class="targetDurationMinutes === min ? 'text-indigo-600' : 'text-gray-500'">{{ getDurationDesc(min) }}</span>
        </button>
      </div>
    </div>
    
    <!-- Full-Width Start Quiz Button -->
    <div class="w-full max-w-3xl mb-6 flex-shrink-0">
      <button 
        type="button"
        class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-base font-bold cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
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
          <Zap class="w-5 h-5 text-amber-300 fill-amber-300" />
        </template>
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>

