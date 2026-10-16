<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { X, BookOpen, Flag, Lightbulb, CheckCircle2, Layers } from '@lucide/vue';
import { 
  type KanjiDetail, 
  loadKanjiInfo, 
  extractKanjiFromWord, 
  reportKanjiExplanation 
} from '../services/kanjiInfoService';

const props = withDefaults(defineProps<{
  isOpen: boolean;
  targetWord?: string;
  initialKanji?: string;
}>(), {
  targetWord: '',
  initialKanji: ''
});

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const modalRef = ref<HTMLElement | null>(null);
const closeButtonRef = ref<HTMLButtonElement | null>(null);
const isLoading = ref(true);
const kanjiDataMap = ref<Record<string, KanjiDetail>>({});
const activeKanji = ref<string>('');
const reportedKanji = ref<Set<string>>(new Set());

// Ekstrak kanji unik dari kata target
const kanjiList = computed(() => {
  const extracted = extractKanjiFromWord(props.targetWord);
  if (extracted.length > 0) return extracted;
  if (props.initialKanji) return [props.initialKanji];
  return [];
});

// Detail untuk kanji yang sedang aktif ditab
const currentKanjiDetail = computed<KanjiDetail | null>(() => {
  if (!activeKanji.value) return null;
  return kanjiDataMap.value[activeKanji.value] || null;
});

// Jenis pembentukan terjemahan Indonesia
const formationTypeLabel = computed(() => {
  const type = currentKanjiDetail.value?.formation_type;
  switch (type) {
    case 'pictograph':
      return { label: 'Piktograf (Bentuk Benda)', desc: 'Berasal dari gambar langsung objek fisik.' };
    case 'ideograph_simple':
      return { label: 'Ideograf Sederhana (Simbol Abstrak)', desc: 'Menggambarkan konsep abstrak atau petunjuk posisi.' };
    case 'compound_meaning':
      return { label: 'Gabungan Makna (Kaii)', desc: 'Penggabungan dua atau lebih bagian untuk membentuk makna baru.' };
    case 'phono_semantic':
      return { label: 'Pikto-Fonetik (Keisei)', desc: 'Satu komponen penanda arti dan satu komponen penanda bunyi.' };
    default:
      return { label: 'Belum Diketahui / Campuran', desc: 'Struktur komponen kanji.' };
  }
});

// Label lencana keyakinan
const confidenceBadge = computed(() => {
  const conf = currentKanjiDetail.value?.etymology_confidence;
  switch (conf) {
    case 'established':
      return {
        text: 'Diterima luas',
        classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
      };
    case 'traditional':
      return {
        text: 'Penjelasan tradisional',
        classes: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800'
      };
    case 'uncertain':
    default:
      return {
        text: 'Belum pasti',
        classes: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
      };
  }
});

// Muat data saat modal dibuka
const loadData = async () => {
  if (!props.isOpen) return;
  isLoading.value = true;
  try {
    const data = await loadKanjiInfo();
    kanjiDataMap.value = data;

    // Tentukan kanji aktif pertama
    if (props.initialKanji && kanjiList.value.includes(props.initialKanji)) {
      activeKanji.value = props.initialKanji;
    } else if (kanjiList.value.length > 0) {
      activeKanji.value = kanjiList.value[0];
    }
  } catch (err) {
    console.error('Gagal memuat detail kanji:', err);
  } finally {
    isLoading.value = false;
  }
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadData();
    nextTick(() => {
      closeButtonRef.value?.focus();
    });
  }
});

watch(() => props.targetWord, () => {
  if (props.isOpen) {
    loadData();
  }
});

const handleReport = (kanji: string) => {
  reportKanjiExplanation(kanji);
  reportedKanji.value.add(kanji);
};

// Keyboard Accessibility: Escape key & focus trapping
const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.isOpen) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    emit('close');
    return;
  }

  if (e.key === 'Tab') {
    if (!modalRef.value) return;
    const focusable = modalRef.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href]'
    );
    if (focusable.length === 0) return;

    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        @click.self="emit('close')"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kanji-popup-title"
      >
        <!-- Modal Card / Bottom Sheet Container -->
        <div 
          ref="modalRef"
          class="w-full sm:max-w-xl max-h-[88vh] sm:max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/80 dark:border-slate-800 transition-all duration-300 animate-sheetUp sm:animate-scaleIn"
        >
          <!-- Mobile Pull Handle -->
          <div class="sm:hidden w-full flex justify-center pt-3 pb-1">
            <div class="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
          </div>

          <!-- Header Bar -->
          <div class="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850">
            <div class="flex items-center gap-2">
              <span class="p-1.5 rounded-lg bg-indigo-50 dark:bg-torii/15 text-indigo-600 dark:text-torii">
                <BookOpen class="w-4 h-4" />
              </span>
              <div>
                <h3 id="kanji-popup-title" class="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Bedah Kanji Kotoba
                </h3>
                <p v-if="targetWord" class="text-xs text-slate-600 dark:text-slate-300 font-jp">
                  Kata: <span class="font-bold text-slate-800 dark:text-slate-200">{{ targetWord }}</span>
                </p>
              </div>
            </div>

            <button
              ref="closeButtonRef"
              type="button"
              class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              @click="emit('close')"
              aria-label="Tutup jendela penjelasan kanji"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Multiple Kanji Tabs (jika kata memiliki > 1 kanji) -->
          <div 
            v-if="kanjiList.length > 1" 
            class="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/90 px-4 pt-2 gap-2 overflow-x-auto scrollbar-none"
          >
            <button
              v-for="k in kanjiList"
              :key="k"
              type="button"
              class="px-4 py-2 font-jp font-bold text-base sm:text-lg border-b-2 transition-all cursor-pointer flex items-center gap-1.5"
              :class="activeKanji === k 
                ? 'border-indigo-600 dark:border-torii text-indigo-700 dark:text-torii-light bg-white dark:bg-slate-800 rounded-t-lg shadow-xs' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
              @click="activeKanji = k"
            >
              <span class="text-xl leading-none">{{ k }}</span>
              <span v-if="kanjiDataMap[k]?.meaning?.[0]" class="text-xs font-sans font-normal opacity-75 hidden sm:inline">
                ({{ kanjiDataMap[k]?.meaning[0] }})
              </span>
            </button>
          </div>

          <!-- Main Scrollable Content Body -->
          <div class="p-5 overflow-y-auto space-y-5 flex-1 text-slate-800 dark:text-slate-100">
            <!-- Loading State -->
            <div v-if="isLoading" class="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div class="w-8 h-8 border-3 border-indigo-600 dark:border-torii border-t-transparent rounded-full animate-spin"></div>
              <span class="text-xs font-medium">Memuat data asal-usul kanji...</span>
            </div>

            <!-- Not Found State -->
            <div v-else-if="!currentKanjiDetail" class="py-10 text-center text-slate-500 dark:text-slate-400">
              <p class="text-sm">Data kanji belum tersedia di katalog offline.</p>
            </div>

            <!-- Content Detail -->
            <template v-else>
              <!-- 1. Top Section: Kanji Hero & Facts -->
              <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-slate-50 dark:from-slate-800/80 dark:to-slate-850 border border-indigo-100/80 dark:border-slate-700/60">
                <!-- Large Kanji Character Display -->
                <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-slate-700 shadow-md flex items-center justify-center shrink-0">
                  <span class="text-5xl sm:text-6xl font-black font-jp text-slate-900 dark:text-white select-all">
                    {{ currentKanjiDetail.kanji }}
                  </span>
                </div>

                <!-- Basic Facts & Readings -->
                <div class="flex-1 text-center sm:text-left space-y-2">
                  <div>
                    <h4 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      {{ currentKanjiDetail.meaning?.slice(0, 4).join(', ') || '-' }}
                    </h4>
                    <div class="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-1.5 text-xs font-semibold">
                      <span v-if="currentKanjiDetail.jlpt" class="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        JLPT N{{ currentKanjiDetail.jlpt }}
                      </span>
                      <span v-if="currentKanjiDetail.stroke_count" class="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                        {{ currentKanjiDetail.stroke_count }} Goresan
                      </span>
                      <span v-if="currentKanjiDetail.grade" class="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                        Kelas {{ currentKanjiDetail.grade }}
                      </span>
                    </div>
                  </div>

                  <!-- On & Kun Readings -->
                  <div class="pt-1 text-xs space-y-1 text-slate-600 dark:text-slate-300 font-jp">
                    <p v-if="currentKanjiDetail.on?.length">
                      <span class="font-bold text-slate-500 font-sans">Onyomi:</span> 
                      <span class="font-semibold text-slate-800 dark:text-slate-200 ml-1">{{ currentKanjiDetail.on.join(', ') }}</span>
                    </p>
                    <p v-if="currentKanjiDetail.kun?.length">
                      <span class="font-bold text-slate-500 font-sans">Kunyomi:</span> 
                      <span class="font-semibold text-slate-800 dark:text-slate-200 ml-1">{{ currentKanjiDetail.kun.join(', ') }}</span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- 2. Formation Type & Etymology Card -->
              <div class="rounded-2xl p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <div class="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-torii-light">
                    <Layers class="w-4 h-4" />
                    <span>{{ formationTypeLabel.label }}</span>
                  </div>
                  <!-- Confidence Badge -->
                  <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border" :class="confidenceBadge.classes">
                    {{ confidenceBadge.text }}
                  </span>
                </div>

                <p class="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  {{ formationTypeLabel.desc }}
                </p>

                <!-- Penjelasan Asal-usul -->
                <div class="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  <h5 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Asal-usul & Makna Komponen
                  </h5>
                  <p class="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    {{ currentKanjiDetail.etymology_id }}
                  </p>
                </div>
              </div>

              <!-- 3. Components Breakdown -->
              <div v-if="currentKanjiDetail.components?.length" class="space-y-2">
                <h5 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>Komponen Pembentuk (Radikal)</span>
                </h5>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div 
                    v-for="(comp, cIdx) in currentKanjiDetail.components"
                    :key="cIdx"
                    class="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div class="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-lg font-black font-jp text-slate-900 dark:text-white shrink-0">
                      {{ comp.part }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="font-bold text-slate-800 dark:text-slate-100 truncate">
                        {{ comp.meaning_id }}
                      </div>
                      <span class="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {{ comp.role === 'meaning' ? 'Makna' : (comp.role === 'phonetic' ? 'Penanda Bunyi' : 'Bentuk Visual') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 4. Mnemonic Box (Cara Mengingat) -->
              <div class="rounded-2xl p-4 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-1.5">
                <div class="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                  <Lightbulb class="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Jembatan Keledai / Pengingat</span>
                </div>
                <p class="text-sm font-medium text-amber-950 dark:text-amber-100 leading-relaxed">
                  {{ currentKanjiDetail.mnemonic_id }}
                </p>
                <p v-if="currentKanjiDetail.note_id" class="text-xs text-amber-800 dark:text-amber-300/80 pt-1 border-t border-amber-200/60 dark:border-amber-800/40 italic">
                  Catatan: {{ currentKanjiDetail.note_id }}
                </p>
              </div>

              <!-- 5. Related Vocabulary in Project -->
              <div v-if="currentKanjiDetail.words?.length" class="space-y-2">
                <h5 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Kosakata Terkait di Minna no Nihongo
                </h5>
                <ul class="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                  <li 
                    v-for="(w, wIdx) in currentKanjiDetail.words" 
                    :key="wIdx"
                    class="p-2.5 flex items-center justify-between gap-2 flex-wrap"
                  >
                    <div class="flex items-baseline gap-2">
                      <span class="font-bold font-jp text-sm text-slate-900 dark:text-white">{{ w.jp }}</span>
                      <span class="text-slate-500 dark:text-slate-400 font-jp">（{{ w.kana }}）</span>
                    </div>
                    <div class="text-right flex items-center gap-2">
                      <span class="text-slate-700 dark:text-slate-300 font-medium">{{ w.meaning }}</span>
                      <span v-if="w.lesson" class="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {{ w.lesson }}
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- 6. Footer Feedback & Report Button -->
              <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span class="text-[11px] text-slate-600 dark:text-slate-400">
                  Data EDRDG (CC BY-SA 4.0) • Pembentukan AI
                </span>

                <button
                  type="button"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-semibold text-xs"
                  :class="reportedKanji.has(currentKanjiDetail.kanji)
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'"
                  :disabled="reportedKanji.has(currentKanjiDetail.kanji)"
                  @click="handleReport(currentKanjiDetail.kanji)"
                >
                  <CheckCircle2 v-if="reportedKanji.has(currentKanjiDetail.kanji)" class="w-3.5 h-3.5 text-emerald-600" />
                  <Flag v-else class="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {{ reportedKanji.has(currentKanjiDetail.kanji) ? 'Laporan Terkirim' : 'Laporkan penjelasan ini' }}
                  </span>
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
@keyframes sheetUp {
  from {
    transform: translateY(100%);
    opacity: 0.5;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-sheetUp {
  animation: sheetUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-scaleIn {
  animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
