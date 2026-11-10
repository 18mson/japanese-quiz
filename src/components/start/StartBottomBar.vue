<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { 
  Zap, Swords, Sparkles, Layers, Keyboard, PenTool, Calculator, BookOpen, Shuffle, Dices,
  ChevronLeft, ChevronRight, CheckCircle2
} from '@lucide/vue';
import { useQuizStore } from '../../stores/quizStore';
import { HITUNGAN_WAVES, type HitunganWaveDef } from '../../data/hitunganWaves';
import { modesList, type QuizModeDef, type QuizModeSubType } from './modesConfig';

const props = defineProps<{
  isKeyboardNav: boolean;
  focusedSection: string;
  activeModeId: string;
  selectedLevel: string;
  characterType: string;
  selectedKanaCategory: string;
  currentHitunganWave: HitunganWaveDef;
  selectedHitunganDirection: string;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'start'): void;
  (e: 'start-subtype', subKey: string): void;
  (e: 'start-hitungan-wave', wave: HitunganWaveDef): void;
  (e: 'interact'): void;
}>();

const quizStore = useQuizStore();

// Responsive screen detection for mobile-specific layouts
const isMobile = ref(false);
const updateResponsive = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 640;
  }
};

onMounted(() => {
  updateResponsive();
  window.addEventListener('resize', updateResponsive);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateResponsive);
});

const activeMode = computed<QuizModeDef | undefined>(() => {
  return modesList.find(m => m.id === props.activeModeId);
});

// Menentukan apakah mode ini memiliki multi sub-menu di tombol mulai
const hasMultipleSubTypes = computed(() => {
  if (!activeMode.value?.subTypes) return false;
  // Kanji, Kotoba, dan Lainnya memiliki custom start layout
  if (props.activeModeId === 'kanji' || props.activeModeId === 'kotoba' || props.activeModeId === 'lainnya') return false;
  // Khusus mobile app: mode hiragana dan katakana digabung menjadi 1 tombol mulai saja
  if (isMobile.value && ['hiragana', 'katakana'].includes(props.activeModeId)) return false;
  return activeMode.value.subTypes.length > 1;
});

// Opsi kuis untuk Mix Kana pada Mode Lainnya
const mixKanaSubTypes = [
  { key: 'multiple_choice', label: 'Pilihan Ganda' },
  { key: 'keyboard_typing', label: 'Ketik Kana' },
  { key: 'writing', label: 'Tulis Huruf' },
];

// Gelombang hitungan yang sesuai dengan sub-menu yang aktif pada mode Lainnya
const hitunganWavesForMode = computed(() => {
  if (props.characterType === 'angka') {
    return HITUNGAN_WAVES.filter(w => w.type === 'number_range');
  }
  if (props.characterType === 'counter') {
    return HITUNGAN_WAVES.filter(w => w.type === 'counter');
  }
  if (props.characterType === 'campuran') {
    return HITUNGAN_WAVES.filter(w => w.type === 'mixed');
  }
  return [];
});

// Paginasi tombol wave pada navbar bawah (3 item per tampilan)
const hitunganWaveStartIndex = ref(0);
const hitunganPageSize = computed(() => 3);

watch(() => props.characterType, () => {
  hitunganWaveStartIndex.value = 0;
});

const canPrevHitunganWaves = computed(() => hitunganWaveStartIndex.value > 0);
const canNextHitunganWaves = computed(() => {
  return hitunganWaveStartIndex.value + hitunganPageSize.value < hitunganWavesForMode.value.length;
});

const prevHitunganWaves = () => {
  emit('interact');
  hitunganWaveStartIndex.value = Math.max(0, hitunganWaveStartIndex.value - hitunganPageSize.value);
};

const nextHitunganWaves = () => {
  emit('interact');
  if (canNextHitunganWaves.value) {
    hitunganWaveStartIndex.value = Math.min(
      hitunganWavesForMode.value.length - hitunganPageSize.value,
      hitunganWaveStartIndex.value + hitunganPageSize.value
    );
  }
};

const visibleHitunganWaves = computed(() => {
  return hitunganWavesForMode.value.slice(
    hitunganWaveStartIndex.value,
    hitunganWaveStartIndex.value + hitunganPageSize.value
  );
});

// Detail deskripsi kategori huruf untuk Session Info Pill bawah
const detailedKanaCategoryLabel = computed(() => {
  const isKatakana = props.activeModeId === 'katakana';
  const isMix = props.activeModeId === 'lainnya';

  if (isMobile.value && ['hiragana', 'katakana'].includes(props.activeModeId)) {
    return 'Kuis Campuran: Pilihan Ganda • Ketik Kana • Tulis Huruf';
  }

  if (isMix) {
    if (props.selectedKanaCategory === 'basic') return 'Kategori: 46 Huruf Dasar (Hiragana & Katakana)';
    if (props.selectedKanaCategory === 'dakuten') return 'Kategori: 25 Huruf Dakuten & Handakuten (Campuran)';
    if (props.selectedKanaCategory === 'combination') return 'Kategori: 33 Huruf Kombinasi / Youon (Campuran)';
    return 'Kategori: Semua Variasi Huruf (Campuran Hiragana & Katakana)';
  }

  if (isKatakana) {
    if (props.selectedKanaCategory === 'basic') return 'Kategori: 46 Huruf Dasar Seion (ア - ン)';
    if (props.selectedKanaCategory === 'dakuten') return 'Kategori: 25 Huruf Dakuten & Handakuten (ガ - パ)';
    if (props.selectedKanaCategory === 'combination') return 'Kategori: 33 Huruf Kombinasi / Youon (キャ - リョ)';
    return 'Kategori: Semua Variasi Huruf (104 Huruf Katakana)';
  }

  // Hiragana
  if (props.selectedKanaCategory === 'basic') return 'Kategori: 46 Huruf Dasar Seion (あ - ん)';
  if (props.selectedKanaCategory === 'dakuten') return 'Kategori: 25 Huruf Dakuten & Handakuten (が - ぱ)';
  if (props.selectedKanaCategory === 'combination') return 'Kategori: 33 Huruf Kombinasi / Youon (きゃ - りょ)';
  return 'Kategori: Semua Variasi Huruf (104 Huruf Hiragana)';
});

const standardSubTypes = computed<QuizModeSubType[]>(() => {
  if (props.activeModeId === 'kotoba') return [];
  return activeMode.value?.subTypes || [];
});

const getButtonThemeClass = (modeId: string, subKey?: string) => {
  if (modeId === 'online_game') {
    return 'bg-gradient-to-r from-rose-600 via-pink-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 shadow-rose-500/25';
  }
  if (modeId === 'daily') {
    return 'bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-800 hover:from-amber-500 hover:to-indigo-700 shadow-amber-500/25';
  }
  if (modeId === 'lainnya') {
    return 'bg-gradient-to-r from-matcha via-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-emerald-600/30';
  }
  if (modeId === 'kanji') {
    return 'bg-gradient-to-r from-matcha-dark via-matcha to-emerald-700 hover:from-matcha hover:to-emerald-600 shadow-emerald-600/25';
  }
  if (modeId === 'kotoba') {
    if (subKey === 'renshuu') {
      return 'bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 hover:from-indigo-600 hover:to-indigo-700 shadow-indigo-500/25';
    }
    if (subKey === 'kaiwa') {
      return 'bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 shadow-purple-500/25';
    }
    return 'bg-aizome hover:bg-aizome-hover dark:bg-gradient-to-r dark:from-amber-600 dark:via-orange-600 dark:to-rose-700 dark:hover:from-amber-500 dark:hover:to-rose-600 shadow-aizome/20 dark:shadow-amber-500/25';
  }
  // Hiragana & Katakana
  return 'bg-aizome hover:bg-aizome-hover dark:bg-torii dark:hover:bg-torii-hover shadow-aizome/20 dark:shadow-torii/30';
};

const getSubTypeIcon = (subKey: string) => {
  switch (subKey) {
    case 'multiple_choice': return Layers;
    case 'keyboard_typing': return Keyboard;
    case 'writing': return PenTool;
    case 'words_mixed': return Shuffle;
    case 'words': return Zap;
    case 'words_meaning': return BookOpen;
    case 'meaning_to_words': return Keyboard;
    case 'renshuu': return Sparkles;
    case 'kaiwa': return Sparkles;
    case 'battleground': return Swords;
    case 'quiz_blitz': return Zap;
    case 'angka': return Calculator;
    case 'counter': return Calculator;
    case 'campuran': return Calculator;
    case 'mix': return Layers;
    default: return Zap;
  }
};

const handleSubClick = (subKey: string) => {
  emit('interact');
  emit('start-subtype', subKey);
};
</script>

<template>
  <div 
    @click="emit('interact')"
    :class="[
      'fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all duration-200 p-2.5 sm:p-4 shadow-lg flex flex-col items-center justify-center cursor-pointer',
      isKeyboardNav && focusedSection === 'duration'
        ? 'border-t-2 border-t-torii dark:border-t-torii shadow-md'
        : 'border-t border-gray-200/80 dark:border-slate-800 shadow-lg'
    ]"
    style="padding-bottom: max(0.625rem, env(safe-area-inset-bottom));"
  >
    <!-- Start Button Container (Max Width 3xl) -->
    <div class="w-full max-w-3xl flex flex-col items-center gap-1.5 sm:gap-2">
      <!-- Session Info Pill -->
      <div 
        v-if="activeModeId !== 'online_game'" 
        class="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium"
      >
        <span v-if="['hiragana', 'katakana'].includes(activeModeId) || (activeModeId === 'lainnya' && characterType === 'mix')" class="text-aizome dark:text-torii-light font-bold">
          {{ detailedKanaCategoryLabel }}
        </span>
        <span v-else-if="activeModeId === 'kanji'" class="text-matcha dark:text-matcha font-bold">
          Target: {{ quizStore.currentKanjiLessonLabel }} • {{ quizStore.currentKanjiLessonStats.mastered }} / {{ quizStore.currentKanjiLessonStats.total }} Kanji Dikuasai ({{ quizStore.currentKanjiLessonStats.percentage }}%)
        </span>
        <span v-else-if="activeModeId === 'kotoba' && characterType === 'renshuu'" class="text-indigo-600 dark:text-indigo-400 font-bold">
          Pelajaran {{ quizStore.currentLessonNumber }}: {{ quizStore.renshuuProgressStats.masteredCount }} / {{ quizStore.renshuuProgressStats.totalCount }} Soal Dikuasai ({{ quizStore.renshuuProgressStats.progressPercent }}%)
        </span>
        <span v-else-if="activeModeId === 'kotoba' && characterType === 'kaiwa'" class="text-purple-600 dark:text-purple-400 font-bold">
          Pelajaran {{ quizStore.currentLessonNumber }}: Dialog Percakapan N5
        </span>
        <span v-else-if="activeModeId === 'kotoba'" class="text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center gap-1.5 flex-wrap text-center">
          <span class="text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Dices class="w-4 h-4 shrink-0 text-amber-500" />
            <span>Soal Acak:</span>
          </span>
          <span>Jepang ➔ Romaji • Jepang ➔ Indonesia • Indonesia ➔ Jepang</span>
        </span>
        <span v-else-if="activeModeId === 'daily'" class="text-amber-600 dark:text-amber-400 font-bold">
          Tantangan Harian (Audio & Suara)
        </span>
        <span v-else-if="activeModeId === 'lainnya' && characterType === 'angka'" class="text-emerald-600 dark:text-emerald-400 font-bold">
          Level Angka N5 (1–10.000) • Arah: {{ selectedHitunganDirection === 'number_to_kana' ? 'Angka ➔ かな' : 'かな ➔ Angka' }}
        </span>
        <span v-else-if="activeModeId === 'lainnya' && characterType === 'counter'" class="text-emerald-600 dark:text-emerald-400 font-bold">
          9 Variasi Kata Bantu Hitung (助数詞) • Arah: {{ selectedHitunganDirection === 'number_to_kana' ? 'Counter ➔ かな' : 'かな ➔ Counter' }}
        </span>
        <span v-else-if="activeModeId === 'lainnya' && characterType === 'campuran'" class="text-emerald-600 dark:text-emerald-400 font-bold">
          Review Campuran Angka & Counter • Arah: {{ selectedHitunganDirection === 'number_to_kana' ? 'Campuran ➔ かな' : 'かな ➔ Angka' }}
        </span>
        <span v-else class="text-slate-400 font-bold">
          Pilih sub-menu untuk langsung mulai kuis
        </span>
      </div>

      <!-- KONDISI A: MODE KOTOBA -->
      <div v-if="activeModeId === 'kotoba'" class="w-full">
        <!-- Sub-menu 1: Kotoba (Kosakata) -> Tombol Mulai Tunggal (Semua Mode Acak) -->
        <div v-if="characterType === 'words' || ['words_meaning', 'meaning_to_words', 'words_mixed'].includes(characterType)" class="flex flex-col gap-2 w-full">
          <button
            type="button"
            :disabled="isLoading"
            @click.stop="emit('interact'); emit('start');"
            :class="[
              'w-full py-3.5 sm:py-4 text-white rounded-2xl text-base sm:text-lg font-extrabold cursor-pointer transition-all duration-300 ease-out shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed overflow-hidden active:scale-[0.99]',
              getButtonThemeClass(activeModeId, 'words')
            ]"
          >
            <span>Mulai Kuis Kotoba</span>
            <Zap class="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-300" />
          </button>
        </div>

        <!-- Sub-menu 2: Renshuu -> Tombol Mulai Tunggal -->
        <div v-else-if="characterType === 'renshuu'" class="flex flex-col gap-2 w-full">
          <button
            type="button"
            :disabled="isLoading"
            @click.stop="emit('interact'); emit('start');"
            :class="[
              'w-full py-3.5 sm:py-4 text-white rounded-2xl text-base sm:text-lg font-extrabold cursor-pointer transition-all duration-300 ease-out shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed overflow-hidden active:scale-[0.99]',
              getButtonThemeClass(activeModeId, 'renshuu')
            ]"
          >
            <span>Mulai Sesi Berikutnya (10 Soal)</span>
            <Zap class="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-300" />
          </button>
        </div>

        <!-- Sub-menu 3: Kaiwa -> Tombol Mulai Tunggal -->
        <button
          v-else-if="characterType === 'kaiwa'"
          type="button"
          :disabled="isLoading"
          @click.stop="emit('interact'); emit('start');"
          :class="[
            'w-full py-3.5 sm:py-4 text-white rounded-2xl text-base sm:text-lg font-extrabold cursor-pointer transition-all duration-300 ease-out shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed overflow-hidden active:scale-[0.99]',
            getButtonThemeClass(activeModeId, 'kaiwa')
          ]"
        >
          <span>Mulai Percakapan Kaiwa</span>
          <Zap class="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-300" />
        </button>
      </div>

      <!-- KONDISI B: MODE LAINNYA (Angka, Counter, Campuran -> Paginated Waves; Mix -> 3 Sub-mode Kana) -->
      <div v-else-if="activeModeId === 'lainnya'" class="w-full">
        <!-- Jika Sub-menu Angka / Counter / Campuran: Paginated Wave Action Buttons -->
        <div v-if="['angka', 'counter', 'campuran'].includes(characterType)" class="flex items-center gap-1.5 sm:gap-2.5 w-full">
          <!-- Prev Button -->
          <button
            v-if="hitunganWavesForMode.length > hitunganPageSize"
            type="button"
            @click.stop="prevHitunganWaves"
            :disabled="!canPrevHitunganWaves || isLoading"
            class="min-h-[44px] min-w-[44px] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer shrink-0 shadow-sm flex items-center justify-center active:scale-95"
            title="Sebelumnya"
          >
            <ChevronLeft class="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <!-- Wave Action Buttons -->
          <div 
            :class="[
              'grid gap-1.5 sm:gap-2.5 flex-1 min-w-0',
              visibleHitunganWaves.length === 1 
                ? 'grid-cols-1' 
                : (visibleHitunganWaves.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3')
            ]"
          >
            <button
              v-for="wave in visibleHitunganWaves"
              :key="wave.wave_key"
              type="button"
              :disabled="isLoading"
              @click.stop="emit('interact'); emit('start-hitungan-wave', wave)"
              :class="[
                'min-h-[44px] py-3 sm:py-3.5 px-3 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold cursor-pointer transition-all duration-200 ease-out shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 active:scale-[0.98] border border-white/10 overflow-hidden',
                getButtonThemeClass(activeModeId)
              ]"
            >
              <Calculator class="w-4 h-4 text-emerald-200 shrink-0" />
              <span class="truncate">{{ wave.shortTitle }}</span>
              <CheckCircle2 
                v-if="quizStore.hitunganProgressMap[wave.wave_key]?.tutorial_seen"
                class="w-3.5 h-3.5 text-emerald-200 shrink-0" 
              />
              <Zap class="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
            </button>
          </div>

          <!-- Next Button -->
          <button
            v-if="hitunganWavesForMode.length > hitunganPageSize"
            type="button"
            @click.stop="nextHitunganWaves"
            :disabled="!canNextHitunganWaves || isLoading"
            class="min-h-[44px] min-w-[44px] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer shrink-0 shadow-sm flex items-center justify-center active:scale-95"
            title="Berikutnya"
          >
            <ChevronRight class="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <!-- Jika Sub-menu Mix Kana: 3 Tombol Kuis (Pilihan Ganda, Ketik Kana, Tulis Huruf) -->
        <div v-else-if="characterType === 'mix'" class="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2.5 w-full">
          <button
            v-for="sub in mixKanaSubTypes"
            :key="sub.key"
            type="button"
            :disabled="isLoading"
            @click.stop="handleSubClick(sub.key)"
            :class="[
              'py-3 sm:py-3.5 px-3 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold cursor-pointer transition-all duration-200 ease-out shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 active:scale-[0.98] border border-white/10 overflow-hidden',
              getButtonThemeClass(activeModeId, sub.key)
            ]"
          >
            <component :is="getSubTypeIcon(sub.key)" class="w-4 h-4 text-amber-300 shrink-0" />
            <span class="truncate">{{ sub.label }}</span>
            <Zap class="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
          </button>
        </div>
      </div>

      <!-- KONDISI B: MODE LAIN YANG MEMILIKI MULTI SUB-MENU (Hiragana, Katakana, Online Game, Lainnya) -->
      <div 
        v-else-if="hasMultipleSubTypes" 
        :class="[
          'w-full gap-1.5 sm:gap-2.5',
          standardSubTypes.length === 2 
            ? 'grid grid-cols-1 sm:grid-cols-2' 
            : (standardSubTypes.length === 3 
                ? 'grid grid-cols-1 sm:grid-cols-3' 
                : 'grid grid-cols-2 sm:grid-cols-4')
        ]"
      >
        <button
          v-for="sub in standardSubTypes"
          :key="sub.key"
          type="button"
          :disabled="isLoading"
          @click.stop="handleSubClick(sub.key)"
          :class="[
            'py-3 sm:py-3.5 px-3 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold cursor-pointer transition-all duration-200 ease-out shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 active:scale-[0.98] border border-white/10 overflow-hidden',
            getButtonThemeClass(activeModeId, sub.key)
          ]"
        >
          <component :is="getSubTypeIcon(sub.key)" class="w-4 h-4 text-amber-300 shrink-0" />
          <span class="truncate">{{ sub.label }}</span>
        </button>
      </div>

      <!-- KONDISI C: MODE TUNGGAL / TANPA SUB-MENU (Kanji N5, Daily Practice) -->
      <button 
        v-else
        type="button"
        :class="[
          'w-full py-3.5 sm:py-4 text-white rounded-2xl text-base sm:text-lg font-extrabold cursor-pointer transition-all duration-300 ease-out shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed overflow-hidden active:scale-[0.99]',
          getButtonThemeClass(activeModeId),
          isKeyboardNav && focusedSection === 'duration' ? 'ring-2 ring-aizome/60 dark:ring-torii-light/60 shadow-lg' : ''
        ]"
        @click.stop="emit('interact'); emit('start');"
        :disabled="isLoading"
      >
        <Transition name="btn-content-fade" mode="out-in">
          <div v-if="isLoading" key="loading" class="flex items-center justify-center gap-2 w-full">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
          <div v-else-if="activeModeId === 'kanji'" key="kanji" class="flex items-center justify-center gap-2 w-full">
            <span>Mulai Tulis Huruf (Goresan)</span>
            <Zap class="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-300" />
          </div>
          <div v-else-if="activeModeId === 'daily'" key="daily" class="flex items-center justify-center gap-2 w-full">
            <span>Mulai Latihan Harian</span>
            <Zap class="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-300" />
          </div>
          <div v-else-if="['hiragana', 'katakana'].includes(activeModeId)" key="kana-single" class="flex items-center justify-center gap-2 w-full">
            <span>Mulai Kuis {{ activeMode?.title }}</span>
            <Zap class="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-300" />
          </div>
          <div v-else key="normal" class="flex items-center justify-center gap-2 w-full">
            <span>Mulai Kuis</span>
            <Zap class="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-300" />
          </div>
        </Transition>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Button Content Smooth Vertical Transition */
.btn-content-fade-enter-active,
.btn-content-fade-leave-active {
  transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-content-fade-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}

.btn-content-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}
</style>

<style scoped>
/* Button Content Smooth Vertical Transition */
.btn-content-fade-enter-active,
.btn-content-fade-leave-active {
  transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-content-fade-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}

.btn-content-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}
</style>
