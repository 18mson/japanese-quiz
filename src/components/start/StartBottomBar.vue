<script setup lang="ts">
import { computed } from 'vue';
import { 
  Zap, Swords, Sparkles, Layers, Keyboard, PenTool, Calculator, BookOpen
} from '@lucide/vue';
import { useQuizStore } from '../../stores/quizStore';
import type { HitunganWaveDef } from '../../data/hitunganWaves';
import { modesList, type QuizModeDef, type QuizModeSubType } from './modesConfig';

const props = defineProps<{
  isKeyboardNav: boolean;
  focusedSection: string;
  activeModeId: string;
  selectedLevel: string;
  characterType: string;
  selectedKanaCategory: string;
  currentHitunganWave: HitunganWaveDef;
  selectedHitunganDirection: string;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'start'): void;
  (e: 'start-subtype', subKey: string): void;
  (e: 'interact'): void;
}>();

const quizStore = useQuizStore();

const activeMode = computed<QuizModeDef | undefined>(() => {
  return modesList.find(m => m.id === props.activeModeId);
});

// Menentukan apakah mode ini memiliki multi sub-menu di tombol mulai
const hasMultipleSubTypes = computed(() => {
  if (!activeMode.value?.subTypes) return false;
  // Kanji hanya memiliki 1 subType (writing), jadi tetap tombol tunggal
  if (props.activeModeId === 'kanji') return false;
  return activeMode.value.subTypes.length > 1;
});

// Pemetaan sub-menu untuk Kotoba (dikelompokkan agar tampilan sangat rapi)
const kotobaVocabSubTypes = computed(() => {
  if (props.activeModeId !== 'kotoba') return [];
  return activeMode.value?.subTypes?.filter(s => ['words', 'words_meaning', 'meaning_to_words'].includes(s.key)) || [];
});

const kotobaSentenceSubTypes = computed(() => {
  if (props.activeModeId !== 'kotoba') return [];
  return activeMode.value?.subTypes?.filter(s => ['renshuu', 'kaiwa'].includes(s.key)) || [];
});

const standardSubTypes = computed<QuizModeSubType[]>(() => {
  if (props.activeModeId === 'kotoba') return [];
  return activeMode.value?.subTypes || [];
});

const getButtonThemeClass = (modeId: string, subKey?: string) => {
  if (modeId === 'online_game') {
    return 'bg-gradient-to-r from-rose-600 via-pink-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 shadow-rose-500/25';
  }
  if (modeId === 'daily') {
    return 'bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-800 hover:from-amber-500 hover:to-indigo-700 shadow-amber-500/25';
  }
  if (modeId === 'lainnya') {
    return 'bg-gradient-to-r from-matcha via-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-emerald-600/30';
  }
  if (modeId === 'kanji') {
    return 'bg-gradient-to-r from-matcha-dark via-matcha to-emerald-700 hover:from-matcha hover:to-emerald-600 shadow-emerald-600/25';
  }
  if (modeId === 'kotoba') {
    if (subKey === 'renshuu' || subKey === 'kaiwa') {
      return 'bg-gradient-to-r from-slate-800 via-aizome to-aizome-hover hover:from-slate-700 hover:to-aizome dark:from-slate-800 dark:via-rose-700 dark:to-amber-700 shadow-aizome/25';
    }
    return 'bg-aizome hover:bg-aizome-hover dark:bg-gradient-to-r dark:from-amber-600 dark:via-orange-600 dark:to-rose-700 dark:hover:from-amber-500 dark:hover:to-rose-600 shadow-aizome/20 dark:shadow-amber-500/25';
  }
  // Hiragana & Katakana
  return 'bg-aizome hover:bg-aizome-hover dark:bg-torii dark:hover:bg-torii-hover shadow-aizome/20 dark:shadow-torii/30';
};

const getSubTypeIcon = (subKey: string) => {
  switch (subKey) {
    case 'multiple_choice': return Layers;
    case 'keyboard_typing': return Keyboard;
    case 'writing': return PenTool;
    case 'words': return Zap;
    case 'words_meaning': return BookOpen;
    case 'meaning_to_words': return Keyboard;
    case 'renshuu': return Sparkles;
    case 'kaiwa': return Sparkles;
    case 'battleground': return Swords;
    case 'quiz_blitz': return Zap;
    case 'angka': return Calculator;
    case 'counter': return Calculator;
    case 'campuran': return Calculator;
    case 'mix': return Layers;
    default: return Zap;
  }
};

const handleSubClick = (subKey: string) => {
  emit('interact');
  emit('start-subtype', subKey);
};
</script>

<template>
  <div 
    @click="emit('interact')"
    :class="[
      'fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all duration-200 p-2.5 sm:p-4 shadow-lg flex flex-col items-center justify-center cursor-pointer',
      isKeyboardNav && focusedSection === 'duration'
        ? 'border-t-2 border-t-torii dark:border-t-torii shadow-md'
        : 'border-t border-gray-200/80 dark:border-slate-800 shadow-lg'
    ]"
  >
    <!-- Start Button Container (Max Width 3xl) -->
    <div class="w-full max-w-3xl flex flex-col items-center gap-1.5 sm:gap-2">
      <!-- Session Info Pill -->
      <div 
        v-if="activeModeId !== 'online_game'" 
        class="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium"
      >
        <span v-if="['hiragana', 'katakana'].includes(activeModeId) || (activeModeId === 'lainnya' && characterType === 'mix')" class="text-aizome dark:text-torii-light font-bold">
          Kategori: {{ selectedKanaCategory === 'all' ? 'Semua Huruf' : (selectedKanaCategory === 'basic' ? 'Dasar' : (selectedKanaCategory === 'dakuten' ? 'Dakuten' : 'Kombinasi')) }}
        </span>
        <span v-else-if="activeModeId === 'kanji'" class="text-matcha dark:text-matcha font-bold">
          Target: {{ quizStore.currentKanjiLessonLabel }} ({{ quizStore.currentKanjiLessonStats.total }} Kanji N5)
        </span>
        <span v-else-if="activeModeId === 'daily'" class="text-amber-600 dark:text-amber-400 font-bold">
          Tantangan Harian (Audio & Suara)
        </span>
        <span v-else-if="activeModeId === 'lainnya' && ['angka', 'counter', 'campuran'].includes(characterType)" class="text-emerald-600 dark:text-emerald-400 font-bold">
          Wave: {{ currentHitunganWave.title }} • {{ selectedHitunganDirection === 'number_to_kana' ? 'Ketik Kana' : 'Numpad Touch' }}
        </span>
        <span v-else class="text-slate-400 font-bold">
          Pilih sub-menu untuk langsung mulai kuis
        </span>
      </div>

      <!-- KONDISI A: MODE KOTOBA (Dikelompokkan Kosakata & Pola Kalimat) -->
      <div v-if="activeModeId === 'kotoba'" class="flex flex-col gap-1.5 w-full">
        <!-- 3 Tombol Varian Kosakata -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2.5 w-full">
          <button
            v-for="sub in kotobaVocabSubTypes"
            :key="sub.key"
            type="button"
            :disabled="isLoading"
            @click.stop="handleSubClick(sub.key)"
            :class="[
              'py-3 sm:py-3.5 px-3 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold cursor-pointer transition-all duration-200 ease-out shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 active:scale-[0.98] border border-white/10 overflow-hidden',
              getButtonThemeClass(activeModeId, sub.key)
            ]"
          >
            <component :is="getSubTypeIcon(sub.key)" class="w-4 h-4 text-amber-300 shrink-0" />
            <span class="truncate">{{ sub.label }}</span>
          </button>
        </div>

        <!-- 2 Tombol Pola Kalimat (Renshuu & Kaiwa) -->
        <div class="grid grid-cols-2 gap-1.5 sm:gap-2.5 w-full">
          <button
            v-for="sub in kotobaSentenceSubTypes"
            :key="sub.key"
            type="button"
            :disabled="isLoading"
            @click.stop="handleSubClick(sub.key)"
            :class="[
              'py-2.5 sm:py-3 px-3 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold cursor-pointer transition-all duration-200 ease-out shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98] border border-white/10 overflow-hidden',
              getButtonThemeClass(activeModeId, sub.key)
            ]"
          >
            <component :is="getSubTypeIcon(sub.key)" class="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span class="truncate">{{ sub.label }}</span>
            <span v-if="sub.beta" class="text-[8px] sm:text-[9px] font-black px-1 rounded bg-amber-400 text-amber-950 uppercase shrink-0">Beta</span>
          </button>
        </div>
      </div>

      <!-- KONDISI B: MODE LAIN YANG MEMILIKI MULTI SUB-MENU (Hiragana, Katakana, Online Game, Lainnya) -->
      <div 
        v-else-if="hasMultipleSubTypes" 
        :class="[
          'w-full gap-1.5 sm:gap-2.5',
          standardSubTypes.length === 2 
            ? 'grid grid-cols-1 sm:grid-cols-2' 
            : (standardSubTypes.length === 3 
                ? 'grid grid-cols-1 sm:grid-cols-3' 
                : 'grid grid-cols-2 sm:grid-cols-4')
        ]"
      >
        <button
          v-for="sub in standardSubTypes"
          :key="sub.key"
          type="button"
          :disabled="isLoading"
          @click.stop="handleSubClick(sub.key)"
          :class="[
            'py-3 sm:py-3.5 px-3 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold cursor-pointer transition-all duration-200 ease-out shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 active:scale-[0.98] border border-white/10 overflow-hidden',
            getButtonThemeClass(activeModeId, sub.key)
          ]"
        >
          <component :is="getSubTypeIcon(sub.key)" class="w-4 h-4 text-amber-300 shrink-0" />
          <span class="truncate">{{ sub.label }}</span>
        </button>
      </div>

      <!-- KONDISI C: MODE TUNGGAL / TANPA SUB-MENU (Kanji N5, Daily Practice) -->
      <button 
        v-else
        type="button"
        :class="[
          'w-full py-3.5 sm:py-4 text-white rounded-2xl text-base sm:text-lg font-extrabold cursor-pointer transition-all duration-300 ease-out shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed overflow-hidden active:scale-[0.99]',
          getButtonThemeClass(activeModeId),
          isKeyboardNav && focusedSection === 'duration' ? 'ring-2 ring-aizome/60 dark:ring-torii-light/60 shadow-lg' : ''
        ]"
        @click.stop="emit('interact'); emit('start');"
        :disabled="isLoading"
      >
        <Transition name="btn-content-fade" mode="out-in">
          <div v-if="isLoading" key="loading" class="flex items-center justify-center gap-2 w-full">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
          <div v-else-if="activeModeId === 'kanji'" key="kanji" class="flex items-center justify-center gap-2 w-full">
            <span>Mulai Tulis Huruf (Goresan)</span>
            <Zap class="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-300" />
          </div>
          <div v-else-if="activeModeId === 'daily'" key="daily" class="flex items-center justify-center gap-2 w-full">
            <span>Mulai Latihan Harian</span>
            <Zap class="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-300" />
          </div>
          <div v-else key="normal" class="flex items-center justify-center gap-2 w-full">
            <span>Mulai Kuis</span>
            <Zap class="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-300" />
          </div>
        </Transition>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Button Content Smooth Vertical Transition */
.btn-content-fade-enter-active,
.btn-content-fade-leave-active {
  transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-content-fade-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}

.btn-content-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}
</style>

<style scoped>
/* Button Content Smooth Vertical Transition */
.btn-content-fade-enter-active,
.btn-content-fade-leave-active {
  transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-content-fade-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}

.btn-content-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}
</style>
