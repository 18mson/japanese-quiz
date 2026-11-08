<script setup lang="ts">
import { computed } from 'vue';
import { 
  Sparkles, 
  BookOpen, 
  Volume2, 
  ChevronDown, 
  ChevronUp, 
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
  isCollapsed, 
  toggleCollapsed, 
  hasLearnedLessons, 
  dailyHighlight 
} = useDailyGrammarRewind();

const { speak } = useTextToSpeech();

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
      month: 'long',
      year: 'numeric'
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
      class="w-full bg-gradient-to-br from-amber-500/10 via-torii/10 to-orange-500/5 dark:from-amber-950/40 dark:via-slate-900/90 dark:to-orange-950/20 border border-amber-300/60 dark:border-amber-600/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm relative overflow-hidden transition-all duration-300 mb-3 sm:mb-4 select-text"
    >
      <!-- Background Ambient Glow -->
      <div class="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/15 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <!-- Header Row: Badge & Action Toggle -->
      <div class="w-full flex items-center justify-between gap-2 mb-2 sm:mb-3">
        <div class="flex items-center gap-2 flex-wrap min-w-0">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 dark:bg-amber-500/25 border border-amber-400/40 text-amber-800 dark:text-amber-300 text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-2xs">
            <RotateCcw class="w-3 h-3 text-amber-600 dark:text-amber-400 animate-spin-slow" />
            <span>Rewind Harian</span>
          </div>

          <span class="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
            {{ formattedDate }}
          </span>

          <span class="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs">
            Bab {{ dailyHighlight.lessonNumber }}
          </span>
        </div>

        <button
          type="button"
          @click="toggleCollapsed"
          class="p-1 sm:p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer shrink-0"
          :title="isCollapsed ? 'Tampilkan Lengkap' : 'Perkecil Kartu'"
        >
          <ChevronDown v-if="isCollapsed" class="w-4 h-4 sm:w-5 sm:h-5" />
          <ChevronUp v-else class="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <!-- Collapsed Compact View (Summary Only) -->
      <div 
        v-if="isCollapsed" 
        @click="toggleCollapsed" 
        class="w-full flex items-center justify-between gap-2 pt-1 cursor-pointer group"
      >
        <div class="min-w-0">
          <p class="font-jp font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {{ dailyHighlight.pattern }}
          </p>
          <p class="text-xs text-slate-600 dark:text-slate-300 truncate">
            {{ dailyHighlight.meaning }}
          </p>
        </div>
        <span class="text-[11px] font-bold text-amber-600 dark:text-amber-400 shrink-0 flex items-center gap-0.5">
          <span>Lihat Contoh</span>
          <ArrowRight class="w-3 h-3" />
        </span>
      </div>

      <!-- Expanded Full Content View -->
      <div v-else class="w-full space-y-2.5 sm:space-y-3.5 animate-fadeIn">
        <!-- Grammar Pattern & Formula Box -->
        <div class="w-full bg-white/80 dark:bg-slate-900/85 backdrop-blur-xs border border-amber-200/80 dark:border-slate-700/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xs">
          <div class="flex items-baseline justify-between gap-2 flex-wrap mb-1">
            <h4 class="font-jp font-black text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-wide">
              {{ dailyHighlight.pattern }}
            </h4>
            <span class="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300">
              {{ dailyHighlight.meaning }}
            </span>
          </div>

          <!-- Formula / Rumus Visual -->
          <div v-if="dailyHighlight.formula" class="inline-block mt-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300/50 dark:border-amber-700/40 text-[11px] sm:text-xs font-mono font-bold text-amber-800 dark:text-amber-300">
            {{ dailyHighlight.formula }}
          </div>

          <!-- Penjelasan Ringkas -->
          <p v-if="dailyHighlight.explanation" class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            {{ dailyHighlight.explanation }}
          </p>
        </div>

        <!-- Generated Daily Example Sentence Box -->
        <div class="w-full bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-400/40 dark:border-emerald-600/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xs relative">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="text-[10px] sm:text-[11px] uppercase tracking-wider font-black text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
              <Sparkles class="w-3 h-3 text-amber-500" />
              <span>Contoh Kalimat Hari Ini</span>
            </span>

            <button
              type="button"
              @click.stop="playSentenceAudio"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-slate-700 text-[11px] font-bold shadow-2xs transition cursor-pointer"
              title="Dengarkan Pelafalan Kalimat"
            >
              <Volume2 class="w-3.5 h-3.5" />
              <span>Dengar</span>
            </button>
          </div>

          <!-- Japanese Sentence -->
          <p class="font-jp font-black text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-relaxed tracking-wide">
            {{ dailyHighlight.example.japanese }}
          </p>

          <!-- Romaji -->
          <p class="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
            {{ dailyHighlight.example.romaji }}
          </p>

          <!-- Indonesian Meaning -->
          <p class="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mt-1 italic">
            "{{ dailyHighlight.example.meaning }}"
          </p>

          <!-- Optional Note -->
          <p v-if="dailyHighlight.example.note" class="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 pt-1.5 border-t border-emerald-200/60 dark:border-emerald-800/40">
            Catatan: {{ dailyHighlight.example.note }}
          </p>
        </div>

        <!-- Action Jump Button -->
        <div v-if="showJumpButton" class="w-full flex items-center justify-end pt-1">
          <button
            type="button"
            @click="handleJump"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-amber-600 dark:hover:bg-amber-400 text-white dark:text-slate-900 text-xs sm:text-sm font-bold transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <BookOpen class="w-3.5 h-3.5" />
            <span>Buka Bab {{ dailyHighlight.lessonNumber }} di Buku Materi</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
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
  transform: translateY(-8px);
}
</style>
