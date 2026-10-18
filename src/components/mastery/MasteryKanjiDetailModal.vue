<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useQuizStore } from '../../stores/quizStore';
import { useTextToSpeech } from '../../composables/useTextToSpeech';
import { 
  type KanjiDetail, 
  getKanjiDetail 
} from '../../services/kanjiInfoService';
import KanjiAnimator from '../KanjiAnimator.vue';
import SpeakerButton from '../SpeakerButton.vue';
import {
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  PenTool,
  Type,
  Crown,
  CheckCircle2,
  Circle,
  Lightbulb,
  Layers,
  BookOpen
} from '@lucide/vue';

const props = withDefaults(
  defineProps<{
    item: any;
    currentIndex: number;
    totalItems: number;
    category?: string;
  }>(),
  {
    category: 'kanji'
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'prev'): void;
  (e: 'next'): void;
}>();

const quizStore = useQuizStore();
const { speak, stop } = useTextToSpeech();

const viewMode = ref<'stroke' | 'text'>('stroke');
const isLoadingDetail = ref<boolean>(true);
const kanjiDetail = ref<KanjiDetail | null>(null);

// Ambil data etimologi & komponen pembentuk dari kanjiInfo
const loadDetailForCurrentChar = async () => {
  const char = props.item?.character;
  if (!char) {
    kanjiDetail.value = null;
    isLoadingDetail.value = false;
    return;
  }

  isLoadingDetail.value = true;
  try {
    const detail = await getKanjiDetail(char);
    kanjiDetail.value = detail;
  } catch (err) {
    console.error('Gagal memuat detail kanji:', err);
    kanjiDetail.value = null;
  } finally {
    isLoadingDetail.value = false;
  }
};

watch(() => props.item?.character, (newChar, oldChar) => {
  loadDetailForCurrentChar();
  if (oldChar && newChar !== oldChar) {
    playAudio();
  }
}, { immediate: true });

// Teks pengucapan suara audio
const textToSpeak = computed(() => {
  if (!props.item) return '';
  return props.item.kunyomi?.[0] || props.item.onyomi?.[0] || props.item.character || '';
});

const playAudio = () => {
  if (textToSpeak.value) {
    speak(textToSpeak.value);
  }
};

// Jenis pembentukan kanji dalam bahasa Indonesia
const formationTypeLabel = computed(() => {
  const type = kanjiDetail.value?.formation_type;
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
      return { label: 'Struktur Komponen Kanji', desc: 'Pembentukan komponen kanji.' };
  }
});

// Lencana keyakinan etimologi
const confidenceBadge = computed(() => {
  const conf = kanjiDetail.value?.etymology_confidence;
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

// Gabungan kosakata terkait: dari kanjiInfo.words dan fallback ke item.examples
const combinedWords = computed(() => {
  const list: Array<{ jp: string; kana?: string; meaning: string }> = [];

  if (kanjiDetail.value?.words && kanjiDetail.value.words.length > 0) {
    for (const w of kanjiDetail.value.words) {
      list.push({ jp: w.jp, kana: w.kana, meaning: w.meaning });
    }
  }

  // Jika di kanjiInfo sedikit atau kosong, tambahkan dari item.examples jika belum ada
  if (props.item?.examples && props.item.examples.length > 0) {
    for (const ex of props.item.examples) {
      // Format ex sering berupa "多い (Banyak)"
      const match = ex.match(/^([^\(]+)(?:\((.+)\))?$/);
      const jp = match ? match[1].trim() : ex;
      const meaning = match && match[2] ? match[2].trim() : '';
      if (!list.some(existing => existing.jp === jp)) {
        list.push({ jp, meaning });
      }
    }
  }

  return list;
});

// Shortcut keyboard
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close');
  } else if (e.key === 'ArrowLeft') {
    emit('prev');
  } else if (e.key === 'ArrowRight') {
    emit('next');
  } else if (e.key === ' ' || e.key === 'v' || e.key === 'V') {
    playAudio();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  playAudio();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  stop();
});
</script>

<template>
  <div 
    class="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[65] flex items-center justify-center p-2 sm:p-4 md:p-6"
    @click.self="emit('close')"
  >
    <!-- Modal Container: Hampir Full-Screen Responsif (Max-W-5xl / 6xl) -->
    <div 
      class="modal-panel w-full max-w-5xl h-[92vh] sm:h-[88vh] max-h-[880px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 relative"
      @click.stop
    >
      <!-- ================= HEADER ATAS ================= -->
      <div class="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-850 shrink-0">
        <div class="flex items-center gap-2 flex-wrap min-w-0">
          <div class="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-torii/15 border border-indigo-200 dark:border-torii/30 rounded-full text-indigo-700 dark:text-torii-light text-xs font-black">
            <BookOpen class="w-3.5 h-3.5 text-torii shrink-0" />
            <span>Bedah Karakter Kanji</span>
          </div>

          <!-- Quick facts pills -->
          <div class="hidden sm:flex items-center gap-1.5 text-xs font-semibold">
            <span v-if="kanjiDetail?.jlpt" class="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold">
              JLPT N{{ kanjiDetail.jlpt }}
            </span>
            <span v-if="kanjiDetail?.stroke_count" class="px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold">
              {{ kanjiDetail.stroke_count }} Goresan
            </span>
            <span v-if="kanjiDetail?.grade" class="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold">
              Kelas {{ kanjiDetail.grade }}
            </span>
          </div>
        </div>

        <!-- Controls: Goresan vs Teks & Close Button -->
        <div class="flex items-center gap-2 shrink-0">
          <!-- Toggle View Mode Button -->
          <div class="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-300/60 dark:border-slate-700">
            <button
              type="button"
              @click="viewMode = 'stroke'"
              :class="[
                'px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs font-bold',
                viewMode === 'stroke' 
                  ? 'bg-aizome dark:bg-torii text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              ]"
              title="Animasi Urutan Goresan (Stroke Order)"
            >
              <PenTool class="w-3.5 h-3.5" />
              <span>Goresan</span>
            </button>
            <button
              type="button"
              @click="viewMode = 'text'"
              :class="[
                'px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs font-bold',
                viewMode === 'text' 
                  ? 'bg-aizome dark:bg-torii text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              ]"
              title="Teks Statis Besar"
            >
              <Type class="w-3.5 h-3.5" />
              <span>Teks</span>
            </button>
          </div>

          <!-- Close Button -->
          <button 
            type="button"
            @click="emit('close')"
            class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition cursor-pointer border border-slate-200/80 dark:border-slate-700"
            title="Tutup (Esc)"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- ================= CONTENT BODY (2-COLUMN GRID ON DESKTOP) ================= -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        <!-- ================= KOLOM KIRI (VISUAL, AUDIO, BACAAN, ARTI, STATUS) ================= -->
        <div class="lg:col-span-5 flex flex-col gap-3.5 w-full">
          <!-- Card Canvas Display (Stroke Animator / Text) -->
          <div class="w-full bg-gradient-to-br from-indigo-50/50 via-slate-50 to-white dark:from-slate-800/80 dark:via-slate-800 dark:to-slate-850 border border-indigo-100/90 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col items-center shadow-xs relative">
            
            <!-- Mode 1: Animated Stroke Order -->
            <div v-if="viewMode === 'stroke'" class="w-full flex flex-col items-center py-1">
              <KanjiAnimator 
                :text="item.character"
                :speed="800"
                :autoplay="true"
              />
              <div class="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span class="font-jp font-bold text-slate-700 dark:text-slate-300">{{ item.character }}</span>
                <span>({{ kanjiDetail?.stroke_count || '6' }} Goresan)</span>
              </div>
            </div>

            <!-- Mode 2: Static Large Character Display -->
            <div 
              v-else
              class="w-full py-4 min-h-[180px] sm:min-h-[220px] flex items-center justify-center select-all animate-fadeIn"
            >
              <span class="text-8xl sm:text-9xl font-black font-jp text-aizome dark:text-amber-300 drop-shadow-sm leading-none">
                {{ item.character }}
              </span>
            </div>

            <!-- Speaker Audio Button & Quick Pronunciation -->
            <div class="w-full mt-2.5 pt-2.5 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-center gap-2">
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Dengarkan Pengucapan:</span>
              <SpeakerButton :text="textToSpeak" size="md" />
            </div>
          </div>

          <!-- Indonesian Meaning Card (Arti) -->
          <div class="w-full px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 rounded-2xl text-center shadow-2xs">
            <span class="text-[10px] uppercase tracking-wider font-extrabold text-emerald-700 dark:text-emerald-400 block mb-0.5">
              Arti:
            </span>
            <p class="text-base sm:text-lg text-emerald-950 dark:text-emerald-200 font-black italic tracking-wide">
              "{{ item.meaning || kanjiDetail?.meaning?.join(', ') }}"
            </p>
          </div>

          <!-- Kunyomi & Onyomi Readings -->
          <div class="w-full flex flex-col gap-2">
            <!-- Kunyomi Card -->
            <div class="flex items-center justify-between px-3.5 py-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs">
              <div class="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Kunyomi (Kun):</span>
              </div>
              <span class="font-black font-jp text-amber-950 dark:text-amber-200 text-sm tracking-wide">
                {{ item.kunyomi?.length ? item.kunyomi.join('、') : (kanjiDetail?.kun?.join('、') || '-') }}
              </span>
            </div>

            <!-- Onyomi Card -->
            <div class="flex items-center justify-between px-3.5 py-2.5 bg-indigo-50 dark:bg-torii/15 rounded-xl border border-indigo-200 dark:border-torii/30 text-xs">
              <div class="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-torii">
                <span class="w-2 h-2 rounded-full bg-indigo-500 dark:bg-torii"></span>
                <span>Onyomi (On):</span>
              </div>
              <span class="font-black font-jp text-indigo-950 dark:text-torii-light text-sm tracking-wide">
                {{ item.onyomi?.length ? item.onyomi.join('、') : (kanjiDetail?.on?.join('、') || '-') }}
              </span>
            </div>
          </div>

          <!-- Status Penguasaan Streak -->
          <div class="w-full flex items-center justify-center p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80">
            <span 
              class="text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 border shadow-2xs"
              :class="[
                quizStore.getMasteryTier(item.character) === 'crown'
                  ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/80'
                  : quizStore.getMasteryTier(item.character) === 'mastered'
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/80'
                  : quizStore.getMasteryTier(item.character) === 'learning'
                  ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/80'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              ]"
            >
              <Crown v-if="quizStore.getMasteryTier(item.character) === 'crown'" class="w-3.5 h-3.5 fill-amber-400/30 text-amber-500 shrink-0" />
              <CheckCircle2 v-else-if="quizStore.getMasteryTier(item.character) === 'mastered'" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <Sparkles v-else-if="quizStore.getMasteryTier(item.character) === 'learning'" class="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <Circle v-else class="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{{ 
                quizStore.getMasteryTier(item.character) === 'crown' ? 'Mahkota (Streak ' + quizStore.getMasteryStreak(item.character) + ')' :
                quizStore.getMasteryTier(item.character) === 'mastered' ? 'Hafal (Streak ' + quizStore.getMasteryStreak(item.character) + ')' :
                quizStore.getMasteryTier(item.character) === 'learning' ? 'Sedang Belajar (Streak ' + quizStore.getMasteryStreak(item.character) + ')' :
                'Belum Dipelajari (Streak 0)'
              }}</span>
            </span>
          </div>

        </div>

        <!-- ================= KOLOM KANAN (BEDAH ETIMOLOGI, RADIKAL, MNEMONIK, KOSAKATA TERKAIT) ================= -->
        <div class="lg:col-span-7 flex flex-col gap-4 w-full">
          
          <!-- 1. Asal-Usul & Formasi Huruf (Etymology Card) -->
          <div class="rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2.5">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <div class="flex items-center gap-1.5 text-xs font-black text-indigo-700 dark:text-torii-light">
                <Layers class="w-4 h-4 text-torii" />
                <span>{{ formationTypeLabel.label }}</span>
              </div>
              
              <!-- Confidence Badge -->
              <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs" :class="confidenceBadge.classes">
                {{ confidenceBadge.text }}
              </span>
            </div>

            <p class="text-xs text-slate-500 dark:text-slate-400 leading-snug">
              {{ formationTypeLabel.desc }}
            </p>

            <!-- Penjelasan Asal-usul -->
            <div class="pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <h5 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <span>Asal-usul & Makna Komponen:</span>
              </h5>
              <p class="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                {{ kanjiDetail?.etymology_id || 'Penjelasan asal-usul kanji ini belum tersedia di katalog offline.' }}
              </p>
            </div>
          </div>

          <!-- 2. Komponen Pembentuk (Radikal) -->
          <div v-if="kanjiDetail?.components?.length" class="space-y-2">
            <h5 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>Komponen Pembentuk (Radikal)</span>
            </h5>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div 
                v-for="(comp, cIdx) in kanjiDetail.components"
                :key="cIdx"
                class="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs"
              >
                <div class="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-lg font-black font-jp text-slate-900 dark:text-white shrink-0">
                  {{ comp.part }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="font-bold text-slate-800 dark:text-slate-100 truncate">
                    {{ comp.meaning_id }}
                  </div>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {{ comp.role === 'meaning' ? 'Makna' : (comp.role === 'phonetic' ? 'Penanda Bunyi' : 'Bentuk Visual') }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Mnemonic Box (Cara Mengingat / Jembatan Keledai) -->
          <div class="rounded-2xl p-4 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-1.5 shadow-2xs">
            <div class="flex items-center gap-1.5 text-xs font-black text-amber-900 dark:text-amber-300">
              <Lightbulb class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Jembatan Keledai / Pengingat</span>
            </div>
            <p class="text-sm font-medium text-amber-950 dark:text-amber-100 leading-relaxed">
              {{ kanjiDetail?.mnemonic_id || 'Ingatlah bentuk karakter dan komponen penyusunnya saat menulis kanji ini.' }}
            </p>
            <p v-if="kanjiDetail?.note_id" class="text-xs text-amber-800 dark:text-amber-300/80 pt-1 border-t border-amber-200/60 dark:border-amber-800/40 italic">
              Catatan: {{ kanjiDetail.note_id }}
            </p>
          </div>

          <!-- 4. Kosakata Terkait di Minna no Nihongo -->
          <div v-if="combinedWords.length > 0" class="space-y-2">
            <h5 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles class="w-3.5 h-3.5 text-amber-500" />
              <span>Kosakata Terkait di Minna no Nihongo</span>
            </h5>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div 
                v-for="(w, wIdx) in combinedWords" 
                :key="wIdx"
                class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2 shadow-2xs"
              >
                <div class="min-w-0">
                  <div class="flex items-baseline gap-1.5">
                    <span class="font-black font-jp text-sm text-slate-900 dark:text-white">{{ w.jp }}</span>
                    <span v-if="w.kana" class="text-xs text-slate-500 dark:text-slate-400 font-jp">（{{ w.kana }}）</span>
                  </div>
                  <div class="text-xs text-emerald-700 dark:text-emerald-400 font-semibold truncate">
                    {{ w.meaning }}
                  </div>
                </div>

                <SpeakerButton :text="w.kana || w.jp" size="sm" class="shrink-0" />
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- ================= FOOTER BAWAH (STICKY NAVIGATION) ================= -->
      <div class="px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-850/90 flex items-center justify-between gap-3 shrink-0">
        <!-- Tombol Sebelumnya -->
        <button
          type="button"
          @click="emit('prev')"
          :disabled="currentIndex <= 0"
          class="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 border-gray-300 dark:border-slate-700 shadow-2xs active:scale-95"
          title="Karakter Sebelumnya (←)"
        >
          <ChevronLeft class="w-4 h-4" />
          <span class="hidden sm:inline">Sebelumnya</span>
        </button>

        <!-- Indikator Posisi -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-extrabold text-slate-700 dark:text-slate-300">
            {{ currentIndex + 1 }} / {{ totalItems }}
          </span>
          <span class="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
            (Gunakan tombol panah ← / → di keyboard)
          </span>
        </div>

        <!-- Tombol Berikutnya & Tutup -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="emit('next')"
            :disabled="currentIndex >= totalItems - 1"
            class="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 border-gray-300 dark:border-slate-700 shadow-2xs active:scale-95"
            title="Karakter Berikutnya (→)"
          >
            <span class="hidden sm:inline">Berikutnya</span>
            <ChevronRight class="w-4 h-4" />
          </button>

          <button
            type="button"
            @click="emit('close')"
            class="px-3.5 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-xs active:scale-95"
          >
            Tutup
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
