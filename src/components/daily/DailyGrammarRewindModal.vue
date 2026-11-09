<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  X, 
  Sparkles, 
  RotateCcw, 
  Volume2, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight 
} from '@lucide/vue';
import { useDailyGrammarRewind } from '../../composables/useDailyGrammarRewind';
import { useTextToSpeech } from '../../composables/useTextToSpeech';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'jumpToChapter', lessonNumber: number): void;
}>();

const { dailyHighlight } = useDailyGrammarRewind();
const { speak } = useTextToSpeech();

const currentPage = ref<number>(1);
const totalPages = 3;

const setPage = (page: number) => {
  if (page >= 1 && page <= totalPages) {
    currentPage.value = page;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages) {
    currentPage.value++;
  } else {
    currentPage.value = 1;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  } else {
    currentPage.value = totalPages;
  }
};

// Touch swipe gesture handling
const touchStartX = ref<number>(0);
const touchEndX = ref<number>(0);

const onTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.changedTouches[0].clientX;
};

const onTouchEnd = (e: TouchEvent) => {
  touchEndX.value = e.changedTouches[0].clientX;
  const diff = touchEndX.value - touchStartX.value;
  if (diff < -35) {
    nextPage();
  } else if (diff > 35) {
    prevPage();
  }
};

const playSentenceAudio = () => {
  if (dailyHighlight.value?.example?.japanese) {
    speak(dailyHighlight.value.example.japanese);
  }
};

const handleJump = () => {
  if (dailyHighlight.value?.lessonNumber) {
    emit('jumpToChapter', dailyHighlight.value.lessonNumber);
    emit('close');
  }
};

const formattedDate = computed(() => {
  try {
    const today = new Date();
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short'
    }).format(today);
  } catch (e) {
    return '';
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div 
        v-if="isOpen && dailyHighlight"
        class="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
        @click.self="emit('close')"
      >
        <div 
          @touchstart="onTouchStart"
          @touchend="onTouchEnd"
          class="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[290px] animate-scaleUp"
        >
          <!-- Background Ambient Glow -->
          <div class="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/20 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Header -->
          <div class="w-full flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 dark:bg-amber-500/25 border border-amber-400/40 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
                <RotateCcw class="w-3 h-3 text-amber-600 dark:text-amber-400 animate-spin-slow" />
                <span>Rewind Harian</span>
              </div>
              <span class="text-xs font-black px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700">
                Bab {{ dailyHighlight.lessonNumber }}
              </span>
            </div>

            <button 
              type="button" 
              @click="emit('close')"
              class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Tutup (Esc)"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Slide Container (Whole-Slide Sliding Track) -->
          <div class="w-full overflow-hidden my-3">
            <div 
              class="flex transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] w-full"
              :style="{ transform: `translateX(-${(currentPage - 1) * 100}%)` }"
            >
              <!-- Slide 1: Pola & Rumus -->
              <div class="w-full shrink-0 flex flex-col justify-center gap-2 px-1">
                <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                  {{ formattedDate }} • 1. Rumus Pola Kalimat
                </span>

                <h3 class="font-jp font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-wide leading-snug">
                  {{ dailyHighlight.pattern }}
                </h3>

                <p class="text-sm font-bold text-amber-700 dark:text-amber-300">
                  {{ dailyHighlight.meaning }}
                </p>

                <div class="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 italic">
                  <span>👈 Geser ke kiri untuk lihat penjelasan</span>
                </div>
              </div>

              <!-- Slide 2: Penjelasan Singkat -->
              <div class="w-full shrink-0 flex flex-col justify-center gap-2 px-1">
                <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                  2. Fungsi & Penjelasan
                </span>

                <div class="p-3 bg-slate-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 rounded-2xl">
                  <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {{ dailyHighlight.explanation || dailyHighlight.meaning }}
                  </p>
                </div>

                <div class="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 italic">
                  <span>👈 Geser untuk lihat contoh kalimat</span>
                </div>
              </div>

              <!-- Slide 3: Contoh Kalimat & Audio -->
              <div class="w-full shrink-0 flex flex-col justify-center gap-2 px-1">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Sparkles class="w-3 h-3 text-amber-500" />
                    <span>3. Contoh Kalimat Hari Ini</span>
                  </span>

                  <button
                    type="button"
                    @click.stop="playSentenceAudio"
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-200 border border-amber-300/60 dark:border-amber-600/40 text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    <Volume2 class="w-3.5 h-3.5" />
                    <span>Dengar Suara</span>
                  </button>
                </div>

                <div class="p-3 bg-slate-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 rounded-2xl flex flex-col gap-1">
                  <p class="font-jp font-black text-base sm:text-lg text-slate-900 dark:text-white leading-relaxed">
                    {{ dailyHighlight.example.japanese }}
                  </p>
                  <p class="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300 mt-1">
                    "{{ dailyHighlight.example.meaning }}"
                  </p>
                </div>

                <!-- Jump Button -->
                <button
                  type="button"
                  @click="handleJump"
                  class="mt-1 w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <BookOpen class="w-3.5 h-3.5" />
                  <span>Buka Bab {{ dailyHighlight.lessonNumber }} di Buku Materi</span>
                  <ArrowRight class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Footer Navigation & Pagination -->
          <div class="w-full flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
            <!-- Dots -->
            <div class="flex items-center gap-1.5">
              <button 
                type="button" 
                @click="setPage(1)" 
                class="h-2 rounded-full transition-all cursor-pointer" 
                :class="currentPage === 1 ? 'bg-amber-500 w-5' : 'bg-slate-300 dark:bg-slate-700 w-2 hover:bg-slate-400'"
                title="Slide 1: Pola"
              ></button>
              <button 
                type="button" 
                @click="setPage(2)" 
                class="h-2 rounded-full transition-all cursor-pointer" 
                :class="currentPage === 2 ? 'bg-amber-500 w-5' : 'bg-slate-300 dark:bg-slate-700 w-2 hover:bg-slate-400'"
                title="Slide 2: Penjelasan"
              ></button>
              <button 
                type="button" 
                @click="setPage(3)" 
                class="h-2 rounded-full transition-all cursor-pointer" 
                :class="currentPage === 3 ? 'bg-amber-500 w-5' : 'bg-slate-300 dark:bg-slate-700 w-2 hover:bg-slate-400'"
                title="Slide 3: Contoh"
              ></button>
              <span class="text-xs text-slate-400 dark:text-slate-500 ml-1">
                {{ currentPage }}/3
              </span>
            </div>

            <!-- Page Buttons -->
            <div class="flex items-center gap-2">
              <button
                v-if="currentPage > 1"
                type="button"
                @click="prevPage"
                class="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer flex items-center gap-0.5"
              >
                <ChevronLeft class="w-3.5 h-3.5" />
                <span>{{ currentPage === 3 ? 'Penjelasan' : 'Pola' }}</span>
              </button>

              <button
                v-if="currentPage < 3"
                type="button"
                @click="nextPage"
                class="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span>{{ currentPage === 1 ? 'Penjelasan' : 'Contoh' }}</span>
                <ChevronRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.animate-spin-slow {
  animation: spin 8s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-scaleUp {
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
