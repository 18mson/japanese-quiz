<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  Sparkles, 
  BookOpen, 
  Volume2, 
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ArrowRight
} from '@lucide/vue';
import { useDailyGrammarRewind } from '../../composables/useDailyGrammarRewind';
import { useTextToSpeech } from '../../composables/useTextToSpeech';

withDefaults(defineProps<{
  showJumpButton?: boolean;
}>(), {
  showJumpButton: true
});

const emit = defineEmits<{
  (e: 'jumpToChapter', lessonNumber: number): void;
}>();

const { 
  hasLearnedLessons, 
  dailyHighlight 
} = useDailyGrammarRewind();

const { speak } = useTextToSpeech();

// Pagination State (3 Slides: 1 = Pola & Arti, 2 = Penjelasan, 3 = Contoh & Audio)
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

// Touch swipe support (Swipe kartu ke kiri/kanan)
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
  <Transition name="fade-slide">
    <div 
      v-if="hasLearnedLessons && dailyHighlight"
      class="w-full relative overflow-hidden rounded-2xl select-text shadow-sm"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <!-- Whole-Card Slider Track (Kartu utuh meluncur horizontal) -->
      <div 
        class="flex transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] w-full"
        :style="{ transform: `translateX(-${(currentPage - 1) * 100}%)` }"
      >
        <!-- SLIDE CARD 1: Pola & Rumus -->
        <div class="w-full shrink-0 bg-gradient-to-br from-amber-500/10 via-torii/10 to-orange-500/5 dark:from-amber-950/40 dark:via-slate-900/90 dark:to-orange-950/20 border border-amber-300/60 dark:border-amber-600/30 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between min-h-[142px] relative overflow-hidden">
          <div class="absolute -top-8 -right-8 w-24 h-24 bg-amber-400/15 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <!-- Header -->
          <div class="w-full flex items-center justify-between gap-1.5 mb-1.5">
            <div class="flex items-center gap-1.5 min-w-0">
              <div class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 dark:bg-amber-500/25 border border-amber-400/40 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                <RotateCcw class="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 animate-spin-slow" />
                <span>Rewind</span>
              </div>
              <span class="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs">
                Bab {{ dailyHighlight.lessonNumber }}
              </span>
              <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {{ formattedDate }}
              </span>
            </div>
            <span class="text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-500/15 dark:bg-amber-500/20 px-1.5 py-0.5 rounded-md">
              1. Pola
            </span>
          </div>

          <!-- Content: Pola & Arti -->
          <div class="flex-1 flex flex-col justify-center py-0.5">
            <h4 class="font-jp font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 tracking-wide line-clamp-2 leading-snug">
              {{ dailyHighlight.pattern }}
            </h4>
            <p class="text-[11px] sm:text-xs font-bold text-amber-700 dark:text-amber-300 mt-0.5 line-clamp-1">
              {{ dailyHighlight.meaning }}
            </p>
          </div>

          <!-- Footer -->
          <div class="w-full flex items-center justify-between pt-1.5 mt-1 border-t border-amber-200/50 dark:border-slate-800/80">
            <!-- 3 Dots Indicator -->
            <div class="flex items-center gap-1.5">
              <button 
                type="button" 
                @click="setPage(1)" 
                class="h-1.5 rounded-full transition-all cursor-pointer bg-amber-500 w-4" 
                title="Slide 1: Pola"
              ></button>
              <button 
                type="button" 
                @click="setPage(2)" 
                class="h-1.5 rounded-full transition-all cursor-pointer bg-slate-300 dark:bg-slate-700 w-1.5 hover:bg-slate-400" 
                title="Slide 2: Penjelasan"
              ></button>
              <button 
                type="button" 
                @click="setPage(3)" 
                class="h-1.5 rounded-full transition-all cursor-pointer bg-slate-300 dark:bg-slate-700 w-1.5 hover:bg-slate-400" 
                title="Slide 3: Contoh"
              ></button>
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1">
                1/3
              </span>
            </div>

            <button
              type="button"
              @click="nextPage"
              class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition cursor-pointer"
            >
              <span>Penjelasan</span>
              <ArrowRight class="w-3 h-3" />
            </button>
          </div>
        </div>

        <!-- SLIDE CARD 2: Penjelasan Singkat -->
        <div class="w-full shrink-0 bg-gradient-to-br from-amber-500/10 via-torii/10 to-orange-500/5 dark:from-amber-950/40 dark:via-slate-900/90 dark:to-orange-950/20 border border-amber-300/60 dark:border-amber-600/30 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between min-h-[142px] relative overflow-hidden">
          <div class="absolute -top-8 -right-8 w-24 h-24 bg-amber-400/15 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <!-- Header -->
          <div class="w-full flex items-center justify-between gap-1.5 mb-1.5">
            <div class="flex items-center gap-1.5 min-w-0">
              <div class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 dark:bg-amber-500/25 border border-amber-400/40 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                <RotateCcw class="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 animate-spin-slow" />
                <span>Rewind</span>
              </div>
              <span class="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs">
                Bab {{ dailyHighlight.lessonNumber }}
              </span>
            </div>
            <span class="text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-500/15 dark:bg-amber-500/20 px-1.5 py-0.5 rounded-md">
              2. Penjelasan
            </span>
          </div>

          <!-- Content: Penjelasan / Catatan -->
          <div class="flex-1 flex flex-col justify-center py-0.5">
            <p class="text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 leading-snug line-clamp-3">
              {{ dailyHighlight.explanation || dailyHighlight.meaning }}
            </p>
          </div>

          <!-- Footer -->
          <div class="w-full flex items-center justify-between pt-1.5 mt-1 border-t border-amber-200/50 dark:border-slate-800/80">
            <!-- 3 Dots Indicator -->
            <div class="flex items-center gap-1.5">
              <button 
                type="button" 
                @click="setPage(1)" 
                class="h-1.5 rounded-full transition-all cursor-pointer bg-slate-300 dark:bg-slate-700 w-1.5 hover:bg-slate-400" 
                title="Slide 1: Pola"
              ></button>
              <button 
                type="button" 
                @click="setPage(2)" 
                class="h-1.5 rounded-full transition-all cursor-pointer bg-amber-500 w-4" 
                title="Slide 2: Penjelasan"
              ></button>
              <button 
                type="button" 
                @click="setPage(3)" 
                class="h-1.5 rounded-full transition-all cursor-pointer bg-slate-300 dark:bg-slate-700 w-1.5 hover:bg-slate-400" 
                title="Slide 3: Contoh"
              ></button>
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1">
                2/3
              </span>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="prevPage"
                class="inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <ChevronLeft class="w-3 h-3" />
                <span>Pola</span>
              </button>
              <button
                type="button"
                @click="nextPage"
                class="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition cursor-pointer"
              >
                <span>Contoh</span>
                <ChevronRight class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <!-- SLIDE CARD 3: Contoh Kalimat & Audio -->
        <div class="w-full shrink-0 bg-gradient-to-br from-amber-500/10 via-torii/10 to-orange-500/5 dark:from-amber-950/40 dark:via-slate-900/90 dark:to-orange-950/20 border border-amber-300/60 dark:border-amber-600/30 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between min-h-[142px] relative overflow-hidden">
          <div class="absolute -top-8 -right-8 w-24 h-24 bg-amber-400/15 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <!-- Header -->
          <div class="w-full flex items-center justify-between gap-1.5 mb-1.5">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-500/15 dark:bg-amber-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <Sparkles class="w-2.5 h-2.5 text-amber-500" />
                <span>3. Contoh</span>
              </span>
            </div>

            <!-- Audio Speaker Button -->
            <button
              type="button"
              @click.stop="playSentenceAudio"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-slate-700 text-[10px] font-bold shadow-2xs transition cursor-pointer"
              title="Dengarkan Pelafalan"
            >
              <Volume2 class="w-3 h-3" />
              <span>Dengar</span>
            </button>
          </div>

          <!-- Content: Contoh Kalimat -->
          <div class="flex-1 flex flex-col justify-center py-0.5">
            <p class="font-jp font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug tracking-wide line-clamp-2">
              {{ dailyHighlight.example.japanese }}
            </p>
            <p class="text-[10px] sm:text-[11px] font-semibold text-amber-700 dark:text-amber-400 truncate">
              {{ dailyHighlight.example.romaji }}
            </p>
            <p class="text-[10px] sm:text-[11px] font-medium text-slate-700 dark:text-slate-300 italic truncate">
              "{{ dailyHighlight.example.meaning }}"
            </p>
          </div>

          <!-- Footer -->
          <div class="w-full flex items-center justify-between pt-1.5 mt-1 border-t border-amber-200/50 dark:border-slate-800/80">
            <!-- 3 Dots Indicator -->
            <div class="flex items-center gap-1.5">
              <button 
                type="button" 
                @click="setPage(1)" 
                class="h-1.5 rounded-full transition-all cursor-pointer bg-slate-300 dark:bg-slate-700 w-1.5 hover:bg-slate-400" 
                title="Slide 1: Pola"
              ></button>
              <button 
                type="button" 
                @click="setPage(2)" 
                class="h-1.5 rounded-full transition-all cursor-pointer bg-slate-300 dark:bg-slate-700 w-1.5 hover:bg-slate-400" 
                title="Slide 2: Penjelasan"
              ></button>
              <button 
                type="button" 
                @click="setPage(3)" 
                class="h-1.5 rounded-full transition-all cursor-pointer bg-amber-500 w-4" 
                title="Slide 3: Contoh"
              ></button>
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1">
                3/3
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                @click="prevPage"
                class="inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <ChevronLeft class="w-3 h-3" />
                <span>Kembali</span>
              </button>

              <button
                v-if="showJumpButton"
                type="button"
                @click="handleJump"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-amber-600 dark:hover:bg-amber-400 text-white dark:text-slate-900 text-[10px] sm:text-[11px] font-bold transition-all shadow-xs cursor-pointer"
              >
                <BookOpen class="w-3 h-3" />
                <span>Bab {{ dailyHighlight.lessonNumber }}</span>
                <ArrowRight class="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.animate-spin-slow {
  animation: spin 8s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease-out;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
