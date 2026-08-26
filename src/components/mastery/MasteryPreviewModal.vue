<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useQuizStore } from '../../stores/quizStore';
import KanjiAnimator from '../KanjiAnimator.vue';
import { 
  X, 
  Sparkles, 
  Volume2, 
  ChevronLeft, 
  ChevronRight,
  PenTool,
  Type
} from '@lucide/vue';

const props = defineProps<{
  item: any;
  currentIndex: number;
  totalItems: number;
  category: 'hiragana' | 'katakana' | 'words';
}>();

const emit = defineEmits(['close', 'prev', 'next']);
const quizStore = useQuizStore();
const viewMode = ref<'stroke' | 'text'>('text');

const playAudio = () => {
  if (!props.item) return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const textToSpeak = props.item.kana || props.item.character || '';
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close');
  } else if (e.key === 'ArrowLeft') {
    emit('prev');
  } else if (e.key === 'ArrowRight') {
    emit('next');
  } else if (e.key === ' ' || e.key === 'v' || e.key === 'V') {
    playAudio();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  playAudio();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
});
</script>

<template>
  <div 
    class="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[60] flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    @click.self="emit('close')"
  >
    <div class="max-w-md w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 text-center shadow-2xl relative flex flex-col items-center animate-scaleUp">
      
      <!-- Header / Category Badge & Mode Switcher -->
      <div class="w-full flex items-center justify-between mb-3.5">
        <div class="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 rounded-full text-indigo-700 dark:text-indigo-300 text-xs font-bold capitalize">
          <Sparkles class="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>{{ category === 'words' ? (item.lesson || 'Kanji & Kotoba') : (category + ' ' + (item.type === 'basic' ? 'Dasar' : item.type === 'dakuten' ? 'Dakuten' : item.type === 'combination' ? 'Kombinasi' : '')) }}</span>
        </div>

        <div class="flex items-center gap-1.5">
          <!-- Toggle View Mode Button -->
          <div class="flex items-center bg-gray-100 dark:bg-slate-800 p-0.5 rounded-xl border border-gray-200 dark:border-slate-700">
            <button
              type="button"
              @click="viewMode = 'stroke'"
              :class="[
                'p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-bold',
                viewMode === 'stroke' 
                  ? 'bg-amber-500 text-slate-950 shadow-xs' 
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              ]"
              title="Animasi Urutan Goresan (Stroke Order)"
            >
              <PenTool class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Goresan</span>
            </button>
            <button
              type="button"
              @click="viewMode = 'text'"
              :class="[
                'p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-bold',
                viewMode === 'text' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              ]"
              title="Teks Statis Besar"
            >
              <Type class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Teks</span>
            </button>
          </div>

          <button 
            @click="emit('close')"
            class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
            title="Tutup (Esc)"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Main Character Card Container -->
      <div class="w-full bg-gray-50 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700/70 rounded-2xl p-4 sm:p-5 flex flex-col items-center shadow-inner relative">
        
        <!-- Mode 1: Animated Stroke Order -->
        <div v-if="viewMode === 'stroke'" class="w-full py-1">
          <KanjiAnimator 
            :text="item.character"
            :speed="800"
            :autoplay="true"
          />
        </div>

        <!-- Mode 2: Static Large Character Display -->
        <div 
          v-else
          class="font-black text-gray-900 dark:text-amber-300 drop-shadow-sm my-4 font-jp leading-tight text-center select-all animate-fadeIn"
          :class="(item.character || '').length > 6 ? 'text-3xl sm:text-4xl' : ((item.character || '').length > 3 ? 'text-4xl sm:text-5xl' : 'text-6xl sm:text-7xl')"
        >
          {{ item.character }}
        </div>

        <!-- Furigana / Kana reading -->
        <div 
          v-if="item.kana && item.kana !== item.character"
          class="text-lg sm:text-xl font-bold text-gray-600 dark:text-slate-300 font-jp tracking-wider mb-1"
        >
          {{ item.kana }}
        </div>

        <!-- Romaji & Audio Speaker -->
        <div class="flex items-center justify-center gap-2.5 my-1 flex-wrap">
          <span class="text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
            {{ Array.isArray(item.romaji) ? item.romaji.join(' / ') : item.romaji }}
          </span>
          <button 
            @click="playAudio"
            class="p-1.5 rounded-full bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/40 text-indigo-600 dark:text-indigo-300 transition active:scale-95 cursor-pointer shadow-xs"
            title="Dengarkan Suara (Spasi)"
          >
            <Volume2 class="w-4 h-4" />
          </button>
        </div>

        <!-- Indonesian Meaning for Vocabulary / Kanji -->
        <div v-if="item.meaning" class="mt-3 w-full px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-center shadow-xs">
          <span class="text-[11px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">Arti:</span>
          <p class="text-sm sm:text-base text-emerald-900 dark:text-emerald-200 font-bold italic">
            "{{ item.meaning }}"
          </p>
        </div>

        <!-- Mastery Status Badge & Details -->
        <div class="mt-3 flex items-center justify-center gap-2 flex-wrap">
          <span 
            class="text-xs px-2.5 py-1 rounded-full font-extrabold flex items-center gap-1 border"
            :class="[
              quizStore.getMasteryTier(item.character) === 'crown'
                ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                : quizStore.getMasteryTier(item.character) === 'mastered'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                : quizStore.getMasteryTier(item.character) === 'learning'
                ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700'
            ]"
          >
            <span>{{ 
              quizStore.getMasteryTier(item.character) === 'crown' ? '💎 Crown (Streak ' + quizStore.getMasteryStreak(item.character) + ')' :
              quizStore.getMasteryTier(item.character) === 'mastered' ? '✓ Hafal (Streak ' + quizStore.getMasteryStreak(item.character) + ')' :
              quizStore.getMasteryTier(item.character) === 'learning' ? '⚡ Proses (Streak ' + quizStore.getMasteryStreak(item.character) + ')' :
              '○ Belum Dipelajari (Streak 0)'
            }}</span>
          </span>

          <span v-if="item.category_word" class="text-xs px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-500/30">
            {{ item.category_word }}
          </span>
        </div>

      </div>

      <!-- Navigation Bar -->
      <div class="mt-4 pt-2 w-full flex items-center justify-between gap-2">
        <button
          @click="emit('prev')"
          :disabled="currentIndex <= 0"
          class="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-700"
          title="Karakter Sebelumnya (←)"
        >
          <ChevronLeft class="w-4 h-4" />
          <span class="hidden sm:inline">Sebelumnya</span>
        </button>

        <span class="text-xs font-bold text-gray-500 dark:text-slate-400">
          {{ currentIndex + 1 }} / {{ totalItems }}
        </span>

        <button
          @click="emit('next')"
          :disabled="currentIndex >= totalItems - 1"
          class="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-700"
          title="Karakter Berikutnya (→)"
        >
          <span class="hidden sm:inline">Berikutnya</span>
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>

      <!-- Bottom Close Button -->
      <button
        @click="emit('close')"
        class="w-full mt-3 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer"
      >
        Selesai / Tutup
      </button>

    </div>
  </div>
</template>
