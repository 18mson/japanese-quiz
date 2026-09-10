<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { ArrowRight, Sparkles, Eye, BookMarked } from '@lucide/vue';
import { useQuizStore } from '../../stores/quizStore';
import KanjiAnimator from '../KanjiAnimator.vue';
import SpeakerButton from '../SpeakerButton.vue';
import { useTextToSpeech } from '../../composables/useTextToSpeech';

const quizStore = useQuizStore();
const { speak, stop } = useTextToSpeech();

const currentCardIndex = ref(0);

const itemsToPreview = computed(() => {
  if (quizStore.showMicroPreviewModal && quizStore.microPreviewItem) {
    return [quizStore.microPreviewItem];
  }
  return quizStore.currentWaveItems || [];
});

const currentItem = computed(() => itemsToPreview.value[currentCardIndex.value] || null);

const hasExamples = computed(() => {
  return !!(currentItem.value?.examples && currentItem.value.examples.length > 0);
});

const charText = computed(() => {
  if (!currentItem.value) return '';
  return currentItem.value.character || currentItem.value.japanese || currentItem.value.kana || '';
});

const textToSpeak = computed(() => {
  if (!currentItem.value) return '';
  return currentItem.value.kana || currentItem.value.character || currentItem.value.japanese || '';
});

const isLastCard = computed(() => {
  return currentCardIndex.value >= itemsToPreview.value.length - 1;
});

const playAudioHint = () => {
  if (textToSpeak.value) {
    speak(textToSpeak.value);
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
  stop();
});
</script>

<template>
  <div 
    v-if="quizStore.isWavePreviewActive || quizStore.showMicroPreviewModal"
    class="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn"
  >
    <div 
      :class="[
        'w-full max-h-[92vh] overflow-y-auto bg-slate-900/95 border border-slate-700/80 rounded-3xl p-4 sm:p-6 text-center shadow-2xl relative flex flex-col items-center transition-all duration-300',
        hasExamples ? 'max-w-md md:max-w-2xl lg:max-w-3xl' : 'max-w-md'
      ]"
    >
      
      <!-- Top Mode & Lesson Badges -->
      <div class="flex items-center justify-center gap-2 flex-wrap mb-3">
        <div class="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles class="w-3.5 h-3.5 text-amber-400" />
          <span v-if="quizStore.showMicroPreviewModal">Micro Preview ({{ quizStore.questionType === 'words' ? 'Kanji Baru' : (quizStore.questionType === 'kanji' ? 'Kanji N5 Baru' : 'Huruf Baru') }})</span>
          <span v-else>Preview {{ quizStore.questionType === 'words' ? 'Kosakata Baru' : (quizStore.questionType === 'kanji' ? 'Kanji N5 Baru' : 'Huruf Baru') }}</span>
        </div>

        <span 
          v-if="currentItem?.type && quizStore.questionType !== 'words' && quizStore.questionType !== 'kanji'" 
          class="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 capitalize"
        >
          {{ currentItem.type === 'basic' ? 'Dasar' : currentItem.type === 'dakuten' ? 'Dakuten' : currentItem.type === 'combination' ? 'Kombinasi' : currentItem.type }}
        </span>

        <span 
          v-if="currentItem?.lesson" 
          class="text-xs px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 font-bold border border-violet-500/30"
        >
          {{ currentItem.lesson }}
        </span>
        <span 
          v-if="currentItem?.category_word" 
          class="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
        >
          {{ currentItem.category_word }}
        </span>
      </div>

      <!-- Card Display Container -->
      <div v-if="currentItem" class="w-full bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 flex flex-col items-center shadow-inner relative">
        
        <!-- 2-Column Responsive Layout for Kanji with Examples -->
        <div v-if="hasExamples" class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 w-full items-stretch">
          <!-- Left Column: Kanji Stroke Order, Readings & Meaning -->
          <div class="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-slate-900/60 rounded-2xl border border-slate-700/50 text-center">
            <!-- Animated Stroke Order Display -->
            <div class="w-full py-1 flex justify-center">
              <KanjiAnimator 
                :text="charText"
                :speed="850"
                :autoplay="true"
              />
            </div>

            <!-- Furigana / Kana reading if different from character -->
            <div 
              v-if="currentItem.kana && currentItem.kana !== charText"
              class="text-lg sm:text-xl font-bold text-slate-200 font-jp tracking-wider mb-0.5 mt-1.5"
            >
              {{ currentItem.kana }}
            </div>

            <!-- Onyomi & Kunyomi box for Kanji -->
            <div v-if="currentItem.onyomi || currentItem.kunyomi" class="flex flex-col gap-1 w-full mt-2">
              <div v-if="currentItem.onyomi && currentItem.onyomi.length > 0" class="flex items-center justify-center gap-1.5 text-xs text-slate-300">
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">On</span>
                <span class="font-jp font-bold">{{ currentItem.onyomi.join(', ') }}</span>
              </div>
              <div v-if="currentItem.kunyomi && currentItem.kunyomi.length > 0" class="flex items-center justify-center gap-1.5 text-xs text-slate-300">
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">Kun</span>
                <span class="font-jp font-bold">{{ currentItem.kunyomi.join(', ') }}</span>
              </div>
            </div>

            <!-- Meaning / Arti Bahasa Indonesia -->
            <div v-if="currentItem.meaning" class="mt-2.5 w-full px-4 py-2 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-center shadow-inner">
              <span class="text-[10px] uppercase tracking-wider font-bold text-emerald-400 block mb-0.5">Arti:</span>
              <p class="text-sm sm:text-base text-emerald-200 font-semibold italic">
                "{{ currentItem.meaning }}"
              </p>
            </div>
          </div>

          <!-- Right Column: Contoh Kotoba (Kosakata) di Sebelahnya pada Mode Desktop -->
          <div class="flex flex-col justify-between p-3.5 sm:p-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-left h-full">
            <div>
              <div class="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span class="flex items-center gap-1.5">
                  <BookMarked class="w-3.5 h-3.5 text-amber-400" />
                  <span>Contoh Kotoba:</span>
                </span>
                <span class="text-[10px] text-slate-400 font-normal">Klik untuk dengar 🔊</span>
              </div>
              <div class="space-y-2">
                <div 
                  v-for="(ex, idx) in currentItem.examples" 
                  :key="idx"
                  @click="speak(ex.word)"
                  class="flex items-center justify-between text-xs bg-slate-800/90 hover:bg-slate-750 p-2.5 rounded-xl border border-slate-700/60 cursor-pointer transition group gap-2 shadow-2xs hover:border-indigo-500/50"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="font-black text-white font-jp text-sm sm:text-base group-hover:text-indigo-300 transition-colors shrink-0">{{ ex.word }}</span>
                    <span class="text-slate-400 font-jp text-xs truncate">({{ ex.kana }})</span>
                  </div>
                  <span class="text-emerald-300 font-semibold text-xs truncate shrink-0 max-w-[140px] sm:max-w-[190px] text-right">{{ ex.meaning }}</span>
                </div>
              </div>
            </div>

            <div class="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Kosakata kontekstual N5</span>
              <span class="text-indigo-400 font-medium">Uji urutan goresan</span>
            </div>
          </div>
        </div>

        <!-- Single-Column Centered Layout for Standard Kana without Examples -->
        <div v-else class="flex flex-col items-center w-full">
          <!-- Animated Stroke Order Display -->
          <div class="w-full py-1">
            <KanjiAnimator 
              :text="charText"
              :speed="850"
              :autoplay="true"
            />
          </div>

          <!-- Furigana / Kana reading if different from character -->
          <div 
            v-if="currentItem.kana && currentItem.kana !== charText"
            class="text-lg sm:text-xl font-bold text-slate-200 font-jp tracking-wider mb-0.5 mt-1.5"
          >
            {{ currentItem.kana }}
          </div>

          <!-- Romaji & Pronunciation (when not kanji or as fallback) -->
          <div class="flex items-center justify-center gap-2.5 my-1 flex-wrap">
            <span class="text-sm sm:text-base font-extrabold text-indigo-400 tracking-wider uppercase">
              {{ Array.isArray(currentItem.romaji) ? currentItem.romaji.join(' / ') : currentItem.romaji }}
            </span>
            <SpeakerButton :text="textToSpeak" size="md" />
          </div>

          <!-- Meaning / Arti Bahasa Indonesia -->
          <div v-if="currentItem.meaning" class="mt-2.5 w-full px-4 py-2 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-center shadow-inner">
            <span class="text-[11px] uppercase tracking-wider font-bold text-emerald-400 block mb-0.5">Arti:</span>
            <p class="text-sm sm:text-base text-emerald-200 font-semibold italic">
              "{{ currentItem.meaning }}"
            </p>
          </div>
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
        <span>{{ isLastCard ? 'Mulai Quiz Soal Ini' : 'Lanjut Flashcard Berikutnya' }}</span>
        <ArrowRight class="w-4 h-4" />
      </button>

    </div>
  </div>
</template>
