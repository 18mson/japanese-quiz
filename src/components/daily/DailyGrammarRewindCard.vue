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

// Pagination State (1 = Pola & Rumus, 2 = Contoh Kalimat & Audio)
const currentPage = ref<number>(1);
const totalPages = 2;

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
      class="w-full bg-gradient-to-br from-amber-500/10 via-torii/10 to-orange-500/5 dark:from-amber-950/40 dark:via-slate-900/90 dark:to-orange-950/20 border border-amber-300/60 dark:border-amber-600/30 rounded-3xl p-3.5 sm:p-4 shadow-sm relative overflow-hidden transition-all duration-300 select-text flex flex-col justify-between min-h-[210px]"
    >
      <!-- Background Ambient Glow -->
      <div class="absolute -top-10 -right-10 w-28 h-28 bg-amber-400/15 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <!-- Header: Badge, Bab, & Pagination Arrows -->
      <div class="w-full flex items-center justify-between gap-1.5 mb-2.5">
        <div class="flex items-center gap-1.5 min-w-0">
          <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 dark:bg-amber-500/25 border border-amber-400/40 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-2xs">
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

        <!-- Pagination Controls Header -->
        <div class="flex items-center gap-1 bg-white/70 dark:bg-slate-800/80 p-0.5 rounded-xl border border-amber-200/60 dark:border-slate-700">
          <button
            type="button"
            @click="prevPage"
            class="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
          </button>
          
          <span class="text-[10px] font-black px-1 text-amber-700 dark:text-amber-300">
            {{ currentPage }}/{{ totalPages }}
          </span>

          <button
            type="button"
            @click="nextPage"
            class="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
            title="Halaman Berikutnya"
          >
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Slide Container (Transition Content Only) -->
      <div class="flex-1 min-h-[110px] flex flex-col justify-center">
        <Transition name="fade-slide" mode="out-in">
          <!-- Slide 1: Pola & Rumus Tata Bahasa -->
          <div v-if="currentPage === 1" key="page-pattern" class="bg-white/80 dark:bg-slate-900/85 backdrop-blur-xs border border-amber-200/80 dark:border-slate-700/80 rounded-2xl p-2.5 sm:p-3 shadow-2xs">
            <h4 class="font-jp font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 tracking-wide line-clamp-2">
              {{ dailyHighlight.pattern }}
            </h4>
            
            <p class="text-xs font-bold text-amber-700 dark:text-amber-300 mt-0.5 truncate">
              {{ dailyHighlight.meaning }}
            </p>

            <div v-if="dailyHighlight.formula" class="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-300/50 dark:border-amber-700/40 text-[10px] sm:text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300 truncate max-w-full">
              {{ dailyHighlight.formula }}
            </div>

            <p v-if="dailyHighlight.explanation" class="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2 leading-snug">
              {{ dailyHighlight.explanation }}
            </p>
          </div>

          <!-- Slide 2: Contoh Kalimat & Audio -->
          <div v-else key="page-example" class="bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-400/40 dark:border-emerald-600/30 rounded-2xl p-2.5 sm:p-3 shadow-2xs">
            <div class="flex items-center justify-between gap-1 mb-1">
              <span class="text-[9px] uppercase tracking-wider font-black text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles class="w-2.5 h-2.5 text-amber-500" />
                <span>Contoh Kalimat</span>
              </span>

              <button
                type="button"
                @click.stop="playSentenceAudio"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-slate-700 text-[10px] font-bold shadow-2xs transition cursor-pointer"
                title="Dengarkan Pelafalan"
              >
                <Volume2 class="w-3 h-3" />
                <span>Dengar</span>
              </button>
            </div>

            <!-- Japanese Text -->
            <p class="font-jp font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug tracking-wide line-clamp-2">
              {{ dailyHighlight.example.japanese }}
            </p>

            <!-- Romaji -->
            <p class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 truncate mt-0.5">
              {{ dailyHighlight.example.romaji }}
            </p>

            <!-- Meaning -->
            <p class="text-[11px] font-bold text-slate-700 dark:text-slate-200 italic mt-0.5 line-clamp-2">
              "{{ dailyHighlight.example.meaning }}"
            </p>
          </div>
        </Transition>
      </div>

      <!-- Shared Bottom Footer: Dots & Next/Jump Action Button -->
      <div class="w-full flex items-center justify-between pt-2 mt-1 border-t border-amber-200/50 dark:border-slate-800">
        <!-- Pagination Dots -->
        <div class="flex items-center gap-1.5">
          <button 
            type="button" 
            @click="setPage(1)" 
            class="h-2 rounded-full transition-all cursor-pointer" 
            :class="currentPage === 1 ? 'bg-amber-500 w-4' : 'bg-slate-300 dark:bg-slate-700 w-2 hover:bg-slate-400'"
            title="Halaman 1: Pola & Rumus"
          ></button>
          <button 
            type="button" 
            @click="setPage(2)" 
            class="h-2 rounded-full transition-all cursor-pointer" 
            :class="currentPage === 2 ? 'bg-amber-500 w-4' : 'bg-slate-300 dark:bg-slate-700 w-2 hover:bg-slate-400'"
            title="Halaman 2: Contoh Kalimat"
          ></button>
        </div>

        <!-- Dynamic Action Button based on page -->
        <button
          v-if="currentPage === 1"
          type="button"
          @click="setPage(2)"
          class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition cursor-pointer"
        >
          <span>Contoh Kalimat</span>
          <ArrowRight class="w-3 h-3" />
        </button>

        <button
          v-else-if="showJumpButton"
          type="button"
          @click="handleJump"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-amber-600 dark:hover:bg-amber-400 text-white dark:text-slate-900 text-[11px] font-bold transition-all shadow-xs cursor-pointer"
        >
          <BookOpen class="w-3 h-3" />
          <span>Buka Bab {{ dailyHighlight.lessonNumber }}</span>
          <ArrowRight class="w-3 h-3" />
        </button>
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
  transition: all 0.2s ease-out;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
