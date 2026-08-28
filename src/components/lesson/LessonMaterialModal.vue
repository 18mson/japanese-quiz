<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { BookOpen, MessageSquare, ArrowRight, ArrowLeft, Play, Sparkles, ChevronDown, ChevronUp } from '@lucide/vue';
import { useQuizStore } from '../../stores/quizStore';
import LessonReferenceModal from './LessonReferenceModal.vue';

const quizStore = useQuizStore();

const currentCardIndex = ref(0);
const touchStartX = ref(0);
const showAllExamples = ref(false);
const isReferenceModalOpen = ref(false);

const isRenshuu = computed(() => quizStore.questionType === 'renshuu');
const isKaiwa = computed(() => quizStore.questionType === 'kaiwa');

const bunkeiItems = computed(() => quizStore.bunkeiList || []);
const totalBunkei = computed(() => bunkeiItems.value.length);
const currentBunkei = computed(() => bunkeiItems.value[currentCardIndex.value] || null);

const isLastBunkei = computed(() => currentCardIndex.value >= totalBunkei.value - 1);

const handleStartPractice = () => {
  quizStore.showLessonMaterial = false;
  quizStore.isLessonMaterialCompleted = true;
};

const handleNext = () => {
  if (isLastBunkei.value) {
    handleStartPractice();
  } else {
    currentCardIndex.value++;
    showAllExamples.value = false;
  }
};

const handlePrev = () => {
  if (currentCardIndex.value > 0) {
    currentCardIndex.value--;
    showAllExamples.value = false;
  }
};

// Touch swipe support
const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length > 0) {
    touchStartX.value = e.touches[0].clientX;
  }
};

const handleTouchEnd = (e: TouchEvent) => {
  if (e.changedTouches.length > 0) {
    const diffX = touchStartX.value - e.changedTouches[0].clientX;
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (!quizStore.showLessonMaterial || isReferenceModalOpen.value) return;
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    handleNext();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    handlePrev();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (isKaiwa.value || isLastBunkei.value) {
      handleStartPractice();
    } else {
      handleNext();
    }
  }
};

watch(
  () => quizStore.showLessonMaterial,
  (val) => {
    if (val) {
      currentCardIndex.value = 0;
      showAllExamples.value = false;
    }
  }
);

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Transition name="fade-scale">
    <div 
      v-if="quizStore.showLessonMaterial" 
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <!-- Modal Content Card -->
      <div 
        class="w-full max-w-xl bg-slate-900/95 border border-violet-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-violet-950/60 flex flex-col justify-between relative overflow-hidden text-slate-100 max-h-[92vh]"
      >
        <!-- Background Neon Glows -->
        <div class="absolute -top-24 -right-24 w-60 h-60 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <!-- ============================================================ -->
        <!-- RENSHUU: BUNKEI POLA KALIMAT CAROUSEL                        -->
        <!-- ============================================================ -->
        <div v-if="isRenshuu && currentBunkei" class="flex flex-col flex-1 min-h-0">
          <!-- Card Header & Badge -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3.5 flex-shrink-0">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-bold text-sm shadow-xs">
                <BookOpen class="w-4 h-4" />
              </div>
              <span class="text-xs sm:text-sm font-extrabold text-violet-300 tracking-wide">
                📖 Pola {{ currentBunkei.point_number || (currentCardIndex + 1) }} / {{ totalBunkei }}
              </span>
            </div>

            <!-- Top Actions: Reference Modal Button & Carousel Pills -->
            <div class="flex items-center gap-2.5">
              <button
                type="button"
                @click="isReferenceModalOpen = true"
                class="px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Buka Kosakata & Referensi"
              >
                <span>📚 Referensi</span>
              </button>

              <div class="flex items-center gap-1">
                <span
                  v-for="(_, idx) in bunkeiItems"
                  :key="idx"
                  @click="currentCardIndex = idx; showAllExamples = false;"
                  :class="[
                    'h-2 rounded-full transition-all duration-300 cursor-pointer',
                    idx === currentCardIndex ? 'w-5 bg-violet-400 shadow-xs shadow-violet-400/50' : 'w-1.5 bg-slate-700 hover:bg-slate-600'
                  ]"
                ></span>
              </div>
            </div>
          </div>

          <!-- Main Scrollable Bunkei Card Display -->
          <div class="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[60vh]">
            <!-- 1. Pattern Box -->
            <div class="w-full bg-slate-950/70 border border-violet-500/30 rounded-2xl p-4 shadow-inner text-center">
              <div class="text-xs font-extrabold uppercase tracking-wider text-violet-400/80 mb-1">
                Rumus / Pola Kalimat
              </div>
              <div class="text-lg sm:text-xl font-black text-amber-300 font-jp tracking-wide leading-snug">
                {{ currentBunkei.pattern || currentBunkei.japanese }}
              </div>
            </div>

            <!-- 2. Sub-points (if hierarchical structure exists) -->
            <div v-if="currentBunkei.sub_points && currentBunkei.sub_points.length > 0" class="space-y-2.5">
              <div 
                v-for="(sub, sIdx) in currentBunkei.sub_points" 
                :key="sIdx"
                class="bg-slate-950/50 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2 text-left"
              >
                <!-- Subpoint Title -->
                <div class="text-xs sm:text-sm font-black text-violet-300 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                  <span>{{ sub.title }}</span>
                </div>

                <!-- Subpoint Explanation -->
                <div class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {{ sub.explanation }}
                </div>

                <!-- Subpoint Examples -->
                <div v-if="sub.example || (sub.examples && sub.examples.length > 0)" class="bg-violet-950/30 border border-violet-800/30 rounded-xl p-2.5 mt-0.5 space-y-1.5">
                  <div 
                    v-for="(ex, eIdx) in (sub.examples || [sub.example])" 
                    :key="eIdx"
                    class="text-xs"
                  >
                    <div class="font-bold text-amber-300 font-jp">{{ ex?.japanese }}</div>
                    <div class="text-slate-400">"{{ ex?.meaning }}"</div>
                  </div>
                </div>

                <!-- Subpoint Note (if present) -->
                <div v-if="sub.note" class="bg-amber-950/30 border border-amber-800/40 rounded-xl px-2.5 py-1.5 text-[11px] text-amber-200 flex items-start gap-1.5">
                  <span class="text-amber-400 font-bold flex-shrink-0">⚠️</span>
                  <span>{{ sub.note }}</span>
                </div>
              </div>
            </div>

            <!-- 3. Direct Explanation Box (if no sub-points) -->
            <div v-else-if="currentBunkei.explanation" class="bg-slate-950/50 border border-slate-800 rounded-2xl p-3.5 text-left">
              <div class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                💡 {{ currentBunkei.explanation }}
              </div>
            </div>

            <!-- 4. Direct Examples Box (if not already handled in sub_points) -->
            <div 
              v-if="(!currentBunkei.sub_points || currentBunkei.sub_points.length === 0) && currentBunkei.examples && currentBunkei.examples.length > 0"
              class="bg-violet-950/30 border border-violet-800/40 rounded-2xl p-3.5 text-left space-y-2"
            >
              <div class="text-[11px] font-extrabold uppercase tracking-wider text-violet-400/80">
                Contoh Kalimat:
              </div>

              <!-- Primary Example -->
              <div class="space-y-0.5">
                <div class="text-sm sm:text-base font-black text-amber-300 font-jp">
                  {{ currentBunkei.examples[0].japanese }}
                </div>
                <div class="text-xs sm:text-sm text-slate-300">
                  "{{ currentBunkei.examples[0].meaning }}"
                </div>
              </div>

              <!-- Additional Examples (Collapsible) -->
              <div v-if="currentBunkei.examples.length > 1">
                <button
                  type="button"
                  @click="showAllExamples = !showAllExamples"
                  class="text-[11px] font-bold text-violet-300 hover:text-violet-200 flex items-center gap-1 mt-1 transition cursor-pointer"
                >
                  <span>{{ showAllExamples ? 'Sembunyikan contoh lain' : `Lihat contoh lain (${currentBunkei.examples.length - 1})` }}</span>
                  <component :is="showAllExamples ? ChevronUp : ChevronDown" class="w-3.5 h-3.5" />
                </button>

                <div v-if="showAllExamples" class="mt-2 pt-2 border-t border-violet-800/30 space-y-2 animate-fadeIn">
                  <div 
                    v-for="(ex, exIdx) in currentBunkei.examples.slice(1)" 
                    :key="exIdx"
                    class="space-y-0.5 text-xs sm:text-sm"
                  >
                    <div class="font-bold text-amber-200 font-jp">{{ ex.japanese }}</div>
                    <div class="text-slate-400">"{{ ex.meaning }}"</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 5. Note / Warning Box -->
            <div v-if="currentBunkei.note" class="bg-amber-950/40 border border-amber-700/50 rounded-2xl p-3 text-left flex items-start gap-2 shadow-xs">
              <span class="text-amber-400 font-bold text-sm flex-shrink-0">⚠️</span>
              <div class="text-xs sm:text-sm text-amber-200/95 leading-relaxed">
                {{ currentBunkei.note }}
              </div>
            </div>
          </div>

          <!-- Footer Navigation / Start Button -->
          <div class="pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-3 mt-3 flex-shrink-0">
            <button
              type="button"
              @click="handlePrev"
              :disabled="currentCardIndex === 0"
              :class="[
                'px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer',
                currentCardIndex === 0
                  ? 'opacity-30 cursor-not-allowed text-slate-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              ]"
            >
              <ArrowLeft class="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <button
              v-if="!isLastBunkei"
              type="button"
              @click="handleNext"
              class="px-5 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-violet-600/30 cursor-pointer"
            >
              <span>Lanjut</span>
              <ArrowRight class="w-4 h-4" />
            </button>

            <button
              v-else
              type="button"
              @click="handleStartPractice"
              class="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition flex items-center gap-2 shadow-xl shadow-violet-600/40 cursor-pointer animate-pulse"
            >
              <Play class="w-4 h-4 fill-white" />
              <span>Mulai Latihan</span>
            </button>
          </div>
        </div>

        <!-- ============================================================ -->
        <!-- KAIWA: CONTEXT NOTE INTRO CARD                               -->
        <!-- ============================================================ -->
        <div v-else-if="isKaiwa && quizStore.kaiwaData" class="flex flex-col flex-1">
          <!-- Card Header & Badge -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm shadow-xs">
                <MessageSquare class="w-4 h-4" />
              </div>
              <div>
                <div class="text-[11px] font-bold text-slate-400">Pelajaran {{ quizStore.currentLessonNumber }}</div>
                <div class="text-xs sm:text-sm font-black text-indigo-300">
                  Percakapan (会話)
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="isReferenceModalOpen = true"
                class="px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Buka Kosakata & Referensi"
              >
                <span>📚 Referensi</span>
              </button>

              <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {{ quizStore.kaiwaData.lines?.length || 9 }} Baris Dialog
              </span>
            </div>
          </div>

          <!-- Dialog Title & Context Display -->
          <div class="flex-1 flex flex-col justify-center items-center text-center py-4 px-2 space-y-4">
            <!-- Japanese Title Box -->
            <div class="w-full bg-slate-950/70 border border-indigo-500/25 rounded-2xl p-4 sm:p-5 shadow-inner">
              <div class="text-2xl sm:text-3xl font-black text-indigo-300 font-jp tracking-wide mb-1">
                {{ quizStore.kaiwaData.title }}
              </div>
              <div v-if="quizStore.kaiwaData.title_romaji" class="text-xs sm:text-sm font-semibold text-slate-400">
                {{ quizStore.kaiwaData.title_romaji }}
              </div>
              <div v-if="quizStore.kaiwaData.title_meaning" class="text-xs sm:text-sm font-bold text-indigo-400 mt-1">
                "{{ quizStore.kaiwaData.title_meaning }}"
              </div>
            </div>

            <!-- Context Note Box -->
            <div v-if="quizStore.kaiwaData.context_note" class="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-3.5 max-w-md text-left">
              <div class="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
                <Sparkles class="w-3.5 h-3.5" />
                <span>Situasi / Konteks Percakapan:</span>
              </div>
              <div class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {{ quizStore.kaiwaData.context_note }}
              </div>
            </div>
          </div>

          <!-- Footer Start Button -->
          <div class="pt-4 border-t border-slate-800/80 flex items-center justify-end">
            <button
              type="button"
              @click="handleStartPractice"
              class="w-full sm:w-auto px-7 py-3 rounded-2xl text-sm font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white transition flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/40 cursor-pointer animate-pulse"
            >
              <Play class="w-4 h-4 fill-white" />
              <span>Mulai Mengetik Percakapan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Nested / Standalone Reference Modal -->
  <LessonReferenceModal 
    :is-open="isReferenceModalOpen" 
    @close="isReferenceModalOpen = false" 
  />
</template>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
