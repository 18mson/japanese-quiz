<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Volume2, ArrowRight, Sparkles, Eye } from '@lucide/vue';
import { useQuizStore } from '../../stores/quizStore';
import KanjiAnimator from '../KanjiAnimator.vue';

const quizStore = useQuizStore();

const currentCardIndex = ref(0);

const itemsToPreview = computed(() => {
  if (quizStore.showMicroPreviewModal && quizStore.microPreviewItem) {
    return [quizStore.microPreviewItem];
  }
  return quizStore.currentWaveItems || [];
});

const currentItem = computed(() => itemsToPreview.value[currentCardIndex.value] || null);

const charText = computed(() => {
  if (!currentItem.value) return '';
  return currentItem.value.character || currentItem.value.japanese || currentItem.value.kana || '';
});

const isLastCard = computed(() => {
  return currentCardIndex.value >= itemsToPreview.value.length - 1;
});

const playAudioHint = () => {
  if (!currentItem.value) return;
  // Audio playback via SpeechSynthesis
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      setTimeout(() => {
        const textToSpeak = currentItem.value?.kana || currentItem.value?.character || currentItem.value?.japanese || '';
        if (!textToSpeak) return;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }, 50);
    } catch (e) {
      console.warn('TTS playback error:', e);
    }
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
    // Play sound immediately on next card
    setTimeout(() => {
      playAudioHint();
    }, 80);
  }
};

let modalMountedAt = 0;

const handleKeydown = (e: KeyboardEvent) => {
  if (!quizStore.isWavePreviewActive && !quizStore.showMicroPreviewModal) return;
  if (Date.now() - modalMountedAt < 300) return; // Prevent accidental skip on launch
  if (e.key === 'Enter' || e.key === 'ArrowRight') {
    e.preventDefault();
    handleNextCard();
  } else if (e.key === ' ' || e.key === 'v' || e.key === 'V') {
    e.preventDefault();
    playAudioHint();
  }
};

// Watch for modal visibility changes and card index updates
watch(
  [
    () => quizStore.isWavePreviewActive, 
    () => quizStore.showMicroPreviewModal, 
    () => currentCardIndex.value,
    () => currentItem.value
  ],
  ([waveActive, microActive]) => {
    if (waveActive || microActive) {
      setTimeout(() => {
        playAudioHint();
      }, 120);
    }
  },
  { immediate: true }
);

onMounted(() => {
  modalMountedAt = Date.now();
  window.addEventListener('keydown', handleKeydown);
  if (quizStore.isWavePreviewActive || quizStore.showMicroPreviewModal) {
    setTimeout(() => {
      playAudioHint();
    }, 150);
  }
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
    v-if="quizStore.isWavePreviewActive || quizStore.showMicroPreviewModal"
    class="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn"
  >
    <div class="max-w-md w-full max-h-[90vh] overflow-y-auto bg-slate-900/90 border border-slate-700/80 rounded-3xl p-4 sm:p-5 text-center shadow-2xl relative flex flex-col items-center">
      
      <!-- Top Mode Badge -->
      <div class="flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
        <Sparkles class="w-3.5 h-3.5 text-amber-400" />
        <span v-if="quizStore.showMicroPreviewModal">Micro Preview ({{ quizStore.questionType === 'words' ? 'Kanji Baru' : 'Huruf Baru' }})</span>
        <span v-else>Preview {{ quizStore.questionType === 'words' ? 'Kanji' : 'Gelombang' }} {{ quizStore.currentWaveIndex + 1 }}</span>
      </div>

      <!-- Card Display Container -->
      <div v-if="currentItem" class="w-full bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 flex flex-col items-center shadow-inner relative">
        
        <!-- Animated Stroke Order Display -->
        <div class="w-full py-1">
          <KanjiAnimator 
            :text="charText"
            :speed="650"
            :autoplay="true"
          />
        </div>

        <!-- Furigana / Kana reading if different from character -->
        <div 
          v-if="currentItem.kana && currentItem.kana !== charText"
          class="text-base sm:text-lg font-bold text-slate-300 font-jp tracking-wider mb-0.5 mt-1"
        >
          {{ currentItem.kana }}
        </div>

        <!-- Romaji & Pronunciation -->
        <div class="flex items-center justify-center gap-2.5 my-1 flex-wrap">
          <span class="text-sm sm:text-base font-extrabold text-indigo-400 tracking-wider uppercase">
            {{ Array.isArray(currentItem.romaji) ? currentItem.romaji.join(' / ') : currentItem.romaji }}
          </span>
          <button 
            @click="playAudioHint"
            class="p-1.5 rounded-full bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 transition active:scale-95 cursor-pointer shadow-xs"
            title="Dengarkan Pengucapan (Spasi / V)"
          >
            <Volume2 class="w-4 h-4" />
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
