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
    const utterance = new SpeechSynthesisUtterance(currentItem.value.character || currentItem.value.kana || '');
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

const handleKeydown = (e: KeyboardEvent) => {
  if (!quizStore.isWavePreviewActive && !quizStore.showMicroPreviewModal) return;
  if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
    e.preventDefault();
    handleNextCard();
  }
};

onMounted(() => {
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
        <span v-if="quizStore.showMicroPreviewModal">Micro Preview (Huruf Baru)</span>
        <span v-else>Preview Gelombang {{ quizStore.currentWaveIndex + 1 }}</span>
      </div>

      <!-- Card Display Container -->
      <div v-if="currentItem" class="w-full bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 flex flex-col items-center shadow-inner relative">
        
        <!-- Large Character -->
        <div class="text-7xl sm:text-8xl font-black text-amber-300 drop-shadow-lg mb-2 font-jp">
          {{ currentItem.character || currentItem.japanese }}
        </div>

        <!-- Romaji & Pronunciation -->
        <div class="flex items-center justify-center gap-3 my-2">
          <span class="text-2xl font-black text-indigo-400 tracking-wider uppercase">
            {{ Array.isArray(currentItem.romaji) ? currentItem.romaji.join(' / ') : currentItem.romaji }}
          </span>
          <button 
            @click="playAudioHint"
            class="p-2 rounded-full bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 transition active:scale-95 cursor-pointer"
            title="Dengarkan Pengucapan"
          >
            <Volume2 class="w-5 h-5" />
          </button>
        </div>

        <!-- Meaning / Hint if available -->
        <p v-if="currentItem.meaning" class="text-sm text-slate-300 font-medium italic mt-1">
          "{{ currentItem.meaning }}"
        </p>

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
