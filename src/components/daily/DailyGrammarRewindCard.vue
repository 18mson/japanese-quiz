<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  ChevronLeft,
  ChevronRight,
  Volume2, 
  RotateCcw
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

// Infinite Carousel Track: [Clone 3, Slide 1, Slide 2, Slide 3, Clone 1]
// Index: 0 = Clone Slide 3, 1 = Slide 1, 2 = Slide 2, 3 = Slide 3, 4 = Clone Slide 1
const totalPages = 3;
const trackIndex = ref<number>(1);
const isTransitioning = ref<boolean>(true);

// Active page for outside dots: 1, 2, or 3
const currentPage = computed(() => {
  if (trackIndex.value === 0) return 3;
  if (trackIndex.value === 4) return 1;
  return trackIndex.value;
});

const nextSlide = () => {
  if (!isTransitioning.value) isTransitioning.value = true;
  trackIndex.value++;
};

const prevSlide = () => {
  if (!isTransitioning.value) isTransitioning.value = true;
  trackIndex.value--;
};

const setPage = (page: number) => {
  isTransitioning.value = true;
  trackIndex.value = page;
};

const onTransitionEnd = () => {
  if (trackIndex.value >= 4) {
    // Seamless teleport from Clone 1 (index 4) to Original 1 (index 1)
    isTransitioning.value = false;
    trackIndex.value = 1;
  } else if (trackIndex.value <= 0) {
    // Seamless teleport from Clone 3 (index 0) to Original 3 (index 3)
    isTransitioning.value = false;
    trackIndex.value = 3;
  }
};

// Mouse Drag & Touch Swipe Support (Infinite)
const isDragging = ref<boolean>(false);
const dragStartX = ref<number>(0);
const dragOffset = ref<number>(0);
const hasMovedSignificantly = ref<boolean>(false);

const onPointerDown = (e: PointerEvent) => {
  if (e.button !== 0 && e.pointerType === 'mouse') return;
  const target = e.target as HTMLElement;
  if (target.closest('button') || target.closest('a')) return;

  isDragging.value = true;
  isTransitioning.value = false;
  dragStartX.value = e.clientX;
  dragOffset.value = 0;
  hasMovedSignificantly.value = false;

  try {
    (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId);
  } catch {
    // ignore
  }
};

const onPointerMove = (e: PointerEvent) => {
  if (!isDragging.value) return;
  const diff = e.clientX - dragStartX.value;

  if (Math.abs(diff) > 5) {
    hasMovedSignificantly.value = true;
  }

  // Infinite scroll: bebas ditarik tanpa batas damping
  dragOffset.value = diff;
};

const onPointerUp = (e: PointerEvent) => {
  if (!isDragging.value) return;
  isDragging.value = false;
  isTransitioning.value = true;

  try {
    (e.currentTarget as HTMLElement)?.releasePointerCapture?.(e.pointerId);
  } catch {
    // ignore
  }

  const diff = dragOffset.value;
  const threshold = 35;

  if (diff < -threshold) {
    nextSlide();
  } else if (diff > threshold) {
    prevSlide();
  }

  dragOffset.value = 0;
};

const onPointerCancel = () => {
  isDragging.value = false;
  isTransitioning.value = true;
  dragOffset.value = 0;
};

const playSentenceAudio = () => {
  if (hasMovedSignificantly.value) return;
  if (dailyHighlight.value?.example?.japanese) {
    speak(dailyHighlight.value.example.japanese);
  }
};

const handleJump = () => {
  if (hasMovedSignificantly.value) return;
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
      class="w-full flex flex-col"
    >
      <!-- Carousel Viewport Container with Hover Nav, Mouse Drag, & Touch Support -->
      <div
        class="group w-full relative overflow-hidden rounded-2xl shadow-sm touch-pan-y"
        :class="isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerCancel"
      >
        <!-- Whole-Card Slider Track (5-Slide Infinite Looping Track) -->
        <div 
          class="flex w-full will-change-transform"
          :style="{ 
            transform: `translateX(calc(-${trackIndex * 100}% + ${dragOffset}px))`,
            transition: isDragging || !isTransitioning ? 'none' : 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }"
          @transitionend="onTransitionEnd"
        >
          <!-- INDEX 0: Clone of Slide 3 (Contoh Kalimat) -->
          <div class="w-full shrink-0 bg-gradient-to-br from-amber-500/10 via-torii/10 to-orange-500/5 dark:from-amber-950/40 dark:via-slate-900/90 dark:to-orange-950/20 border border-amber-300/60 dark:border-amber-600/30 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between min-h-[110px] relative overflow-hidden">
            <div class="absolute -top-8 -right-8 w-24 h-24 bg-amber-400/15 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div class="w-full flex items-center justify-between gap-1.5 mb-1">
              <div class="flex items-center gap-1.5 min-w-0">
                <div class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 dark:bg-amber-500/25 border border-amber-400/40 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                  <RotateCcw class="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 animate-spin-slow" />
                  <span>Rewind</span>
                </div>
                <button
                  type="button"
                  @click.stop="handleJump"
                  class="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs transition cursor-pointer"
                  title="Buka Bab di Buku Materi"
                >
                  Bab {{ dailyHighlight.lessonNumber }}
                </button>
              </div>

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

            <div class="flex-1 flex flex-col justify-center py-0.5">
              <p class="font-jp font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug tracking-wide line-clamp-2">
                {{ dailyHighlight.example.japanese }}
              </p>
              <p class="text-[11px] sm:text-xs font-bold text-amber-700 dark:text-amber-300 line-clamp-2 mt-1">
                "{{ dailyHighlight.example.meaning }}"
              </p>
            </div>
          </div>

          <!-- INDEX 1: SLIDE 1 (Pola & Rumus) -->
          <div class="w-full shrink-0 bg-gradient-to-br from-amber-500/10 via-torii/10 to-orange-500/5 dark:from-amber-950/40 dark:via-slate-900/90 dark:to-orange-950/20 border border-amber-300/60 dark:border-amber-600/30 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between min-h-[110px] relative overflow-hidden">
            <div class="absolute -top-8 -right-8 w-24 h-24 bg-amber-400/15 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div class="w-full flex items-center justify-between gap-1.5 mb-1">
              <div class="flex items-center gap-1.5 min-w-0">
                <div class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 dark:bg-amber-500/25 border border-amber-400/40 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                  <RotateCcw class="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 animate-spin-slow" />
                  <span>Rewind</span>
                </div>
                <button
                  type="button"
                  @click.stop="handleJump"
                  class="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs transition cursor-pointer"
                  title="Buka Bab di Buku Materi"
                >
                  Bab {{ dailyHighlight.lessonNumber }}
                </button>
                <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  {{ formattedDate }}
                </span>
              </div>
            </div>

            <div class="flex-1 flex flex-col justify-center py-0.5">
              <h4 class="font-jp font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 tracking-wide line-clamp-2 leading-snug">
                {{ dailyHighlight.pattern }}
              </h4>
              <p class="text-[11px] sm:text-xs font-bold text-amber-700 dark:text-amber-300 mt-1 line-clamp-1">
                {{ dailyHighlight.meaning }}
              </p>
            </div>
          </div>

          <!-- INDEX 2: SLIDE 2 (Penjelasan Singkat) -->
          <div class="w-full shrink-0 bg-gradient-to-br from-amber-500/10 via-torii/10 to-orange-500/5 dark:from-amber-950/40 dark:via-slate-900/90 dark:to-orange-950/20 border border-amber-300/60 dark:border-amber-600/30 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between min-h-[110px] relative overflow-hidden">
            <div class="absolute -top-8 -right-8 w-24 h-24 bg-amber-400/15 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div class="w-full flex items-center justify-between gap-1.5 mb-1">
              <div class="flex items-center gap-1.5 min-w-0">
                <div class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 dark:bg-amber-500/25 border border-amber-400/40 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                  <RotateCcw class="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 animate-spin-slow" />
                  <span>Rewind</span>
                </div>
                <button
                  type="button"
                  @click.stop="handleJump"
                  class="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs transition cursor-pointer"
                  title="Buka Bab di Buku Materi"
                >
                  Bab {{ dailyHighlight.lessonNumber }}
                </button>
                <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  {{ formattedDate }}
                </span>
              </div>
            </div>

            <div class="flex-1 flex flex-col justify-center py-0.5">
              <p class="text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 leading-snug line-clamp-3">
                {{ dailyHighlight.explanation || dailyHighlight.meaning }}
              </p>
            </div>
          </div>

          <!-- INDEX 3: SLIDE 3 (Contoh Kalimat) -->
          <div class="w-full shrink-0 bg-gradient-to-br from-amber-500/10 via-torii/10 to-orange-500/5 dark:from-amber-950/40 dark:via-slate-900/90 dark:to-orange-950/20 border border-amber-300/60 dark:border-amber-600/30 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between min-h-[110px] relative overflow-hidden">
            <div class="absolute -top-8 -right-8 w-24 h-24 bg-amber-400/15 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div class="w-full flex items-center justify-between gap-1.5 mb-1">
              <div class="flex items-center gap-1.5 min-w-0">
                <div class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 dark:bg-amber-500/25 border border-amber-400/40 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                  <RotateCcw class="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 animate-spin-slow" />
                  <span>Rewind</span>
                </div>
                <button
                  type="button"
                  @click.stop="handleJump"
                  class="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs transition cursor-pointer"
                  title="Buka Bab di Buku Materi"
                >
                  Bab {{ dailyHighlight.lessonNumber }}
                </button>
              </div>

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

            <div class="flex-1 flex flex-col justify-center py-0.5">
              <p class="font-jp font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug tracking-wide line-clamp-2">
                {{ dailyHighlight.example.japanese }}
              </p>
              <p class="text-[11px] sm:text-xs font-bold text-amber-700 dark:text-amber-300 line-clamp-2 mt-1">
                "{{ dailyHighlight.example.meaning }}"
              </p>
            </div>
          </div>

          <!-- INDEX 4: Clone of Slide 1 (Pola & Rumus) -->
          <div class="w-full shrink-0 bg-gradient-to-br from-amber-500/10 via-torii/10 to-orange-500/5 dark:from-amber-950/40 dark:via-slate-900/90 dark:to-orange-950/20 border border-amber-300/60 dark:border-amber-600/30 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between min-h-[110px] relative overflow-hidden">
            <div class="absolute -top-8 -right-8 w-24 h-24 bg-amber-400/15 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div class="w-full flex items-center justify-between gap-1.5 mb-1">
              <div class="flex items-center gap-1.5 min-w-0">
                <div class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 dark:bg-amber-500/25 border border-amber-400/40 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                  <RotateCcw class="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 animate-spin-slow" />
                  <span>Rewind</span>
                </div>
                <button
                  type="button"
                  @click.stop="handleJump"
                  class="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs transition cursor-pointer"
                  title="Buka Bab di Buku Materi"
                >
                  Bab {{ dailyHighlight.lessonNumber }}
                </button>
                <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  {{ formattedDate }}
                </span>
              </div>
            </div>

            <div class="flex-1 flex flex-col justify-center py-0.5">
              <h4 class="font-jp font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 tracking-wide line-clamp-2 leading-snug">
                {{ dailyHighlight.pattern }}
              </h4>
              <p class="text-[11px] sm:text-xs font-bold text-amber-700 dark:text-amber-300 mt-1 line-clamp-1">
                {{ dailyHighlight.meaning }}
              </p>
            </div>
          </div>
        </div>

        <!-- Hover Navigation: Tombol Prev (Icon Saja, Muncul dari Kiri saat Hover) -->
        <button
          type="button"
          @click.stop="prevSlide"
          class="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-slate-900/60 hover:bg-slate-900/90 dark:bg-slate-800/70 dark:hover:bg-slate-700/90 text-white backdrop-blur-xs flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto active:scale-90"
          title="Slide Sebelumnya"
          aria-label="Slide Sebelumnya"
        >
          <ChevronLeft class="w-4 h-4 stroke-[2.5]" />
        </button>

        <!-- Hover Navigation: Tombol Next (Icon Saja, Muncul dari Kanan saat Hover) -->
        <button
          type="button"
          @click.stop="nextSlide"
          class="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-slate-900/60 hover:bg-slate-900/90 dark:bg-slate-800/70 dark:hover:bg-slate-700/90 text-white backdrop-blur-xs flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto active:scale-90"
          title="Slide Berikutnya"
          aria-label="Slide Berikutnya"
        >
          <ChevronRight class="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      <!-- OUTSIDE PAGINATION (Di luar card di bawah) -->
      <div class="w-full flex items-center justify-center gap-1.5 pt-2">
        <button 
          v-for="p in totalPages" 
          :key="p"
          type="button" 
          @click="setPage(p)" 
          class="h-1.5 rounded-full transition-all duration-300 cursor-pointer" 
          :class="currentPage === p ? 'bg-amber-500 w-5 shadow-xs' : 'bg-slate-300 dark:bg-slate-700 w-1.5 hover:bg-slate-400 dark:hover:bg-slate-600'" 
          :title="`Slide ${p}`"
        ></button>
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
