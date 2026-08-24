<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Volume2, ArrowRight, Sparkles, Eye } from '@lucide/vue';
import { useQuizStore } from '../../stores/quizStore';

const quizStore = useQuizStore();

const currentCardIndex = ref(0);

const itemsToPreview = computed(() => {
  if (quizStore.showMicroPreviewModal && quizStore.microPreviewItem) {
    return [quizStore.microPreviewItem];
  }
  return quizStore.currentWaveItems || [];
});

const currentItem = computed(() => itemsToPreview.value[currentCardIndex.value] || null);

const isLastCard = computed(() => {
  return currentCardIndex.value >= itemsToPreview.value.length - 1;
});

const playAudioHint = () => {
  if (!currentItem.value) return;
  // Audio playback fallback via SpeechSynthesis if available
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(currentItem.value.kana || currentItem.value.character || '');
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  }
};

const handleNextCard = () => {
  if (isLastCard.value) {
    if (quizStore.showMicroPreviewModal) {
      quizStore.completeMicroPreview();
    } else {
      quizStore.completeWavePreview();
    }
    currentCardIndex.value = 0;
  } else {
    currentCardIndex.value++;
  }
};

let modalMountedAt = 0;

const handleKeydown = (e: KeyboardEvent) => {
  if (!quizStore.isWavePreviewActive && !quizStore.showMicroPreviewModal) return;
  if (Date.now() - modalMountedAt < 300) return; // Prevent accidental skip on launch
  if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
    e.preventDefault();
    handleNextCard();
  }
};

onMounted(() => {
  modalMountedAt = Date.now();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div 
    v-if="quizStore.isWavePreviewActive || quizStore.showMicroPreviewModal"
    class="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50 animate-fadeIn"
  >
    <div class="max-w-md w-full bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden flex flex-col items-center">
      
      <!-- Top Mode Badge -->
      <div class="flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
        <Sparkles class="w-3.5 h-3.5 text-amber-400" />
        <span v-if="quizStore.showMicroPreviewModal">Micro Preview ({{ quizStore.questionType === 'words' ? 'Kanji Baru' : 'Huruf Baru' }})</span>
        <span v-else>Preview {{ quizStore.questionType === 'words' ? 'Kanji' : 'Gelombang' }} {{ quizStore.currentWaveIndex + 1 }}</span>
      </div>

      <!-- Card Display Container -->
      <div v-if="currentItem" class="w-full bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 sm:p-6 flex flex-col items-center shadow-inner relative">
        
        <!-- Large Character / Kanji -->
        <div 
          class="font-black text-amber-300 drop-shadow-lg mb-1 font-jp leading-tight text-center"
          :class="(currentItem.character || currentItem.japanese || '').length > 6 ? 'text-3xl sm:text-4xl' : ((currentItem.character || currentItem.japanese || '').length > 3 ? 'text-4xl sm:text-5xl' : 'text-6xl sm:text-7xl')"
        >
          {{ currentItem.character || currentItem.japanese }}
        </div>

        <!-- Furigana / Kana reading if different from character -->
        <div 
          v-if="currentItem.kana && currentItem.kana !== (currentItem.character || currentItem.japanese)"
          class="text-lg sm:text-xl font-bold text-slate-300 font-jp tracking-wider mb-1"
        >
          {{ currentItem.kana }}
        </div>

        <!-- Romaji & Pronunciation -->
        <div class="flex items-center justify-center gap-3 my-1.5 flex-wrap">
          <span class="text-xl sm:text-2xl font-black text-indigo-400 tracking-wider uppercase">
            {{ Array.isArray(currentItem.romaji) ? currentItem.romaji.join(' / ') : currentItem.romaji }}
          </span>
          <button 
            @click="playAudioHint"
            class="p-2 rounded-full bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 transition active:scale-95 cursor-pointer"
            title="Dengarkan Pengucapan"
          >
            <Volume2 class="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <!-- Meaning / Arti Bahasa Indonesia -->
        <div v-if="currentItem.meaning" class="mt-2.5 w-full px-4 py-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-center shadow-inner">
          <span class="text-[11px] uppercase tracking-wider font-bold text-emerald-400 block mb-0.5">Arti:</span>
          <p class="text-sm sm:text-base text-emerald-200 font-semibold italic">
            "{{ currentItem.meaning }}"
          </p>
        </div>

        <!-- Tags / Badges for Lesson & Category -->
        <div v-if="currentItem.lesson || currentItem.category_word" class="mt-2.5 flex items-center justify-center gap-2 flex-wrap">
          <span v-if="currentItem.lesson" class="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
            {{ currentItem.lesson }}
          </span>
          <span v-if="currentItem.category_word" class="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            {{ currentItem.category_word }}
          </span>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-700/50 w-full flex justify-between items-center text-xs text-slate-400 font-semibold">
          <span class="flex items-center gap-1">
            <Eye class="w-3.5 h-3.5 text-teal-400" /> Flashcard {{ currentCardIndex + 1 }} dari {{ itemsToPreview.length }}
          </span>
          <span class="text-slate-500">Tekan Enter ↵</span>
        </div>
      </div>

      <!-- Bottom Progress Bar for Wave -->
      <div class="w-full h-1.5 bg-slate-800 rounded-full my-4 overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-amber-400 to-indigo-500 transition-all duration-300"
          :style="{ width: `${((currentCardIndex + 1) / itemsToPreview.length) * 100}%` }"
        ></div>
      </div>

      <!-- Action Button -->
      <button 
        @click="handleNextCard"
        class="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30 hover:scale-[1.02] cursor-pointer"
      >
        <span>{{ isLastCard ? 'Mulai Quiz Soal Ini 🚀' : 'Lanjut Flashcard Berikutnya' }}</span>
        <ArrowRight class="w-4 h-4" />
      </button>

    </div>
  </div>
</template>
