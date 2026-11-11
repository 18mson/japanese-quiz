<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuizStore } from '../../stores/quizStore';
import { kanjiGroups } from '../../data/kanji';
import { kanjiN4Groups } from '../../data/kanjiN4';
import {
  filterKanjiForWorksheet,
  loadWorksheetStrokeData,
  getGroupLabel,
  type WorksheetKanjiItem
} from '../../services/kanjiWorksheetService';
import {
  Printer,
  X,
  RotateCcw,
  BookOpen
} from '@lucide/vue';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    initialCategory?: 'kanji' | 'kanji_n4';
    initialGroup?: string;
    initialStatusFilter?: string;
    initialKanjiList?: string[];
  }>(),
  {
    initialCategory: 'kanji',
    initialGroup: 'all',
    initialStatusFilter: 'all'
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const quizStore = useQuizStore();

// Filter States
const currentCategory = ref<'kanji' | 'kanji_n4'>(props.initialCategory || 'kanji');
const currentGroup = ref<string>(props.initialGroup || 'all');
const currentStatusFilter = ref<string>(props.initialStatusFilter || 'all');
const specificKanjiList = ref<string[] | undefined>(props.initialKanjiList);
const showStrokeOrder = ref<boolean>(true);

// Reset / Sync states on prop changes
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      currentCategory.value = props.initialCategory || 'kanji';
      currentGroup.value = props.initialGroup || 'all';
      currentStatusFilter.value = props.initialStatusFilter || 'all';
      specificKanjiList.value = props.initialKanjiList;
      loadStrokes();
    }
  }
);

watch(
  () => [currentCategory.value, currentGroup.value, currentStatusFilter.value],
  () => {
    loadStrokes();
  }
);

// Group options based on active category
const availableGroups = computed(() => {
  return currentCategory.value === 'kanji' ? kanjiGroups : kanjiN4Groups;
});

// Master tier getter
const getMasteryTier = (char: string) => {
  return quizStore.getMasteryTier?.(char) || 'new';
};

// Filtered kanji items
const worksheetItems = computed<WorksheetKanjiItem[]>(() => {
  return filterKanjiForWorksheet({
    category: currentCategory.value,
    group: currentGroup.value,
    statusFilter: currentStatusFilter.value,
    selectedKanjiList: specificKanjiList.value,
    getMasteryTier
  });
});

// Paginate 8 kanji per page (optimal for larger practice boxes on A4)
const ITEMS_PER_PAGE = 8;
const paginatedPages = computed(() => {
  const pages: WorksheetKanjiItem[][] = [];
  const items = worksheetItems.value;
  for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
    pages.push(items.slice(i, i + ITEMS_PER_PAGE));
  }
  return pages;
});

const totalPages = computed(() => Math.max(1, paginatedPages.value.length));

// Active group label
const activeGroupLabel = computed(() => {
  if (currentGroup.value === 'all') return 'Semua Kelompok';
  return getGroupLabel(currentCategory.value, currentGroup.value);
});

// Pre-load SVG strokes in background
const isLoadingStrokes = ref(false);
const loadStrokes = async () => {
  const items = worksheetItems.value;
  if (!items || items.length === 0) return;
  isLoadingStrokes.value = true;
  try {
    await loadWorksheetStrokeData(items);
  } finally {
    isLoadingStrokes.value = false;
  }
};

const handlePrint = () => {
  window.print();
};

const handleResetFilter = () => {
  currentGroup.value = 'all';
  currentStatusFilter.value = 'all';
  specificKanjiList.value = undefined;
};
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-start p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:overflow-visible"
    >
      <!-- SCREEN ONLY: Header & Controls Toolbar -->
      <div class="print:hidden w-full max-w-5xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 sm:p-5 mb-4 sticky top-2 z-20">
        <div class="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-3 mb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-amber-400">
              <Printer class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
                Cetak Lembar Latihan Kanji
              </h2>
              <p class="text-xs text-gray-500 dark:text-slate-400">
                Format buku latihan standar Genkouyoushi A4 (8 kanji per halaman)
              </p>
            </div>
          </div>

          <!-- Actions: Print & Close -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="handlePrint"
              :disabled="worksheetItems.length === 0"
              class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer class="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
            <button
              type="button"
              @click="emit('close')"
              class="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Filter Controls Bar -->
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <!-- Category Switcher -->
          <div class="sm:col-span-3 flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              @click="currentCategory = 'kanji'; currentGroup = 'all';"
              :class="[
                'flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer',
                currentCategory === 'kanji'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900'
              ]"
            >
              Kanji N5
            </button>
            <button
              type="button"
              @click="currentCategory = 'kanji_n4'; currentGroup = 'all';"
              :class="[
                'flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer',
                currentCategory === 'kanji_n4'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900'
              ]"
            >
              Kanji N4
            </button>
          </div>

          <!-- Group/Bab Dropdown -->
          <div class="sm:col-span-4">
            <select
              v-model="currentGroup"
              class="w-full bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option v-for="g in availableGroups" :key="g.key" :value="g.key">
                {{ g.label }}
              </option>
            </select>
          </div>

          <!-- Status Filter Chips -->
          <div class="sm:col-span-5 flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              v-for="status in [
                { key: 'all', label: 'Semua' },
                { key: 'new', label: 'Belum' },
                { key: 'learning', label: 'Proses' },
                { key: 'mastered', label: 'Hafal' },
                { key: 'crown', label: 'Crown' }
              ]"
              :key="status.key"
              type="button"
              @click="currentStatusFilter = status.key"
              :class="[
                'px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap',
                currentStatusFilter === status.key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
              ]"
            >
              {{ status.label }}
            </button>
          </div>
        </div>

        <!-- Summary, Stroke Order Toggle & Reset -->
        <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 dark:text-slate-400 mt-3 pt-2.5 border-t border-gray-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <span>
              Menampilkan <strong class="text-indigo-600 dark:text-amber-400">{{ worksheetItems.length }} kanji</strong>
              ({{ totalPages }} lembar A4)
            </span>
            <span v-if="isLoadingStrokes" class="text-[11px] text-amber-500 animate-pulse">
              • Menyiapkan goresan...
            </span>
          </div>

          <div class="flex items-center gap-4">
            <!-- Toggle Stroke Order Numbering -->
            <label class="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                v-model="showStrokeOrder"
                class="rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span>Nomor Urutan Goresan (1, 2, 3...)</span>
            </label>

            <button
              v-if="currentGroup !== 'all' || currentStatusFilter !== 'all' || specificKanjiList"
              type="button"
              @click="handleResetFilter"
              class="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              <RotateCcw class="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>
      </div>

      <!-- PRINTABLE AREA (A4 Standard Container) -->
      <div class="kanji-worksheet-printable w-full max-w-[210mm] flex flex-col items-center">
        <!-- If Empty State -->
        <div
          v-if="worksheetItems.length === 0"
          class="w-full bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-slate-800 print:hidden"
        >
          <BookOpen class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 class="text-base font-bold text-gray-800 dark:text-slate-200">Tidak ada kanji yang sesuai filter</h3>
          <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">Coba ubah filter status penguasaan atau kelompok di atas.</p>
          <button
            type="button"
            @click="handleResetFilter"
            class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            Tampilkan Semua Kanji
          </button>
        </div>

        <!-- Page Loop (8 Kanji per Page with Enlarged Boxes) -->
        <div
          v-for="(pageItems, pageIdx) in paginatedPages"
          :key="pageIdx"
          class="worksheet-page w-[210mm] min-h-[297mm] bg-white text-slate-900 p-[6mm_10mm] shadow-2xl print:shadow-none mb-6 print:mb-0 relative flex flex-col justify-between"
          :class="{ 'page-break': pageIdx < paginatedPages.length - 1 }"
        >
          <!-- Page Header -->
          <div class="border-b-2 border-slate-900 pb-1 mb-1.5 flex items-end justify-between">
            <div class="flex items-baseline gap-2">
              <h1 class="text-sm font-black tracking-tight text-slate-900">
                NIHONGO MASTER
              </h1>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Lembar Latihan Menulis Kanji ({{ currentCategory === 'kanji' ? 'JLPT N5' : 'JLPT N4' }})
              </span>
            </div>
            <div class="flex items-baseline gap-3 text-[10px] font-semibold text-slate-600">
              <span>{{ activeGroupLabel }}</span>
              <span>Hal. {{ pageIdx + 1 }} / {{ totalPages }}</span>
            </div>
          </div>

          <!-- Kanji Rows List (8 Kanji Compact per Page) -->
          <div class="flex-1 flex flex-col justify-start gap-1.5">
            <div
              v-for="(item, rIdx) in pageItems"
              :key="item.character"
              class="kanji-entry-row border border-slate-400 rounded-sm p-1.5 flex items-stretch bg-white"
            >
              <!-- Left Column: Index & Master Kanji Box (74px x 74px) -->
              <div class="flex items-center gap-1.5 pr-2 border-r border-slate-300 shrink-0">
                <!-- Index -->
                <span class="text-[10px] font-bold text-slate-500 w-4 text-right">
                  {{ (pageIdx * ITEMS_PER_PAGE) + rIdx + 1 }}
                </span>

                <!-- Master Kanji Square with Stroke Order Markers -->
                <div class="w-[74px] h-[74px] border-2 border-slate-900 bg-white relative shrink-0 flex items-center justify-center">
                  <!-- Crosshairs Guidelines (+) -->
                  <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 109 109">
                    <line x1="0" y1="54.5" x2="109" y2="54.5" stroke="#cbd5e1" stroke-dasharray="2,2" stroke-width="0.8" />
                    <line x1="54.5" y1="0" x2="54.5" y2="109" stroke="#cbd5e1" stroke-dasharray="2,2" stroke-width="0.8" />
                    
                    <!-- Solid SVG stroke path -->
                    <template v-if="item.strokes && item.strokes.length > 0">
                      <path
                        v-for="(d, pIdx) in item.strokes"
                        :key="pIdx"
                        :d="d"
                        fill="none"
                        stroke="#0f172a"
                        stroke-width="5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />

                      <!-- Stroke order markers on Master Kanji (Garis mana dulu) -->
                      <g v-if="showStrokeOrder && item.strokePoints && item.strokePoints.length > 0">
                        <g
                          v-for="pt in item.strokePoints"
                          :key="'pt-' + pt.index"
                        >
                          <!-- Circle badge: Goresan pertama dipertegas -->
                          <circle
                            :cx="pt.x"
                            :cy="pt.y"
                            :r="pt.index === 1 ? 5.2 : 4.4"
                            :fill="pt.index === 1 ? '#0f172a' : '#475569'"
                            stroke="#ffffff"
                            stroke-width="1.2"
                          />
                          <!-- Number text inside badge -->
                          <text
                            :x="pt.x"
                            :y="pt.y + (pt.index === 1 ? 2.1 : 1.8)"
                            :font-size="pt.index === 1 ? '6.5' : '5.5'"
                            font-weight="900"
                            fill="#ffffff"
                            text-anchor="middle"
                            font-family="sans-serif"
                          >
                            {{ pt.index }}
                          </text>
                        </g>
                      </g>
                    </template>
                    <text
                      v-else
                      x="54.5"
                      y="78"
                      font-size="64"
                      text-anchor="middle"
                      fill="#0f172a"
                      font-family="'Hiragino Kaku Gothic Pro', 'Noto Sans JP', sans-serif"
                      font-weight="bold"
                    >
                      {{ item.character }}
                    </text>
                  </svg>
                </div>
              </div>

              <!-- Middle Column: Kunyomi, Onyomi, Meaning -->
              <div class="w-[135px] px-2 flex flex-col justify-center border-r border-slate-300 text-[9.5px] leading-tight shrink-0 overflow-hidden">
                <div class="mb-1 truncate">
                  <span class="font-bold text-slate-800">訓:</span>
                  <span class="ml-1 text-slate-700 font-medium font-japanese">{{ item.formattedKun }}</span>
                </div>
                <div class="mb-1 truncate">
                  <span class="font-bold text-slate-800">音:</span>
                  <span class="ml-1 text-slate-700 font-medium font-japanese">{{ item.formattedOn }}</span>
                </div>
                <div class="truncate text-slate-600">
                  <span class="font-bold text-slate-800">Arti:</span>
                  <span class="ml-1">{{ item.meaning }}</span>
                </div>
              </div>

              <!-- Right Column: Enlarged Practice Boxes & Examples Underneath -->
              <div class="flex-1 pl-2 flex flex-col justify-between overflow-hidden">
                <!-- Top Row: 8 Enlarged Practice Boxes (3 Tracing + 5 Blank) -->
                <div class="flex items-center gap-1.5 justify-start">
                  <!-- 3 Dashed Tracing Boxes (52px x 52px) -->
                  <div
                    v-for="bIdx in 3"
                    :key="'trace-' + bIdx"
                    class="w-[52px] h-[52px] border border-slate-400 bg-white relative shrink-0"
                  >
                    <svg class="w-full h-full" viewBox="0 0 109 109">
                      <!-- Crosshairs Guidelines (+) -->
                      <line x1="0" y1="54.5" x2="109" y2="54.5" stroke="#cbd5e1" stroke-dasharray="2,2" stroke-width="0.8" />
                      <line x1="54.5" y1="0" x2="54.5" y2="109" stroke="#cbd5e1" stroke-dasharray="2,2" stroke-width="0.8" />

                      <!-- Dashed stroke paths -->
                      <template v-if="item.strokes && item.strokes.length > 0">
                        <path
                          v-for="(d, pIdx) in item.strokes"
                          :key="pIdx"
                          :d="d"
                          fill="none"
                          stroke="#94a3b8"
                          stroke-width="4.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-dasharray="3,3"
                        />
                      </template>
                      <text
                        v-else
                        x="54.5"
                        y="78"
                        font-size="64"
                        text-anchor="middle"
                        fill="#94a3b8"
                        font-family="'Hiragino Kaku Gothic Pro', 'Noto Sans JP', sans-serif"
                        class="opacity-50"
                      >
                        {{ item.character }}
                      </text>
                    </svg>
                  </div>

                  <!-- 5 Blank Practice Boxes with Crosshairs (52px x 52px) -->
                  <div
                    v-for="bIdx in 5"
                    :key="'blank-' + bIdx"
                    class="w-[52px] h-[52px] border border-slate-400 bg-white relative shrink-0"
                  >
                    <svg class="w-full h-full" viewBox="0 0 109 109">
                      <line x1="0" y1="54.5" x2="109" y2="54.5" stroke="#cbd5e1" stroke-dasharray="2,2" stroke-width="0.8" />
                      <line x1="54.5" y1="0" x2="54.5" y2="109" stroke="#cbd5e1" stroke-dasharray="2,2" stroke-width="0.8" />
                    </svg>
                  </div>
                </div>

                <!-- Bottom Row: Context Examples with filled parentheses -->
                <div class="pt-1 mt-1 border-t border-slate-200 text-[10px] text-slate-700 leading-none truncate font-japanese">
                  <span class="font-bold text-slate-800 font-sans mr-1">Contoh:</span>
                  <span v-for="(ex, eIdx) in item.examples" :key="eIdx" class="mr-3">
                    {{ ex }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Page Footer -->
          <div class="border-t border-slate-300 pt-1 mt-1 flex items-center justify-between text-[8.5px] text-slate-500">
            <span>Nihongo Master Practice Worksheet</span>
            <span>Gunakan pensil / pulpen untuk menelusuri garis putus-putus dan berlatih di kotak kosong</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@media print {
  @page {
    size: A4 portrait;
    margin: 8mm 10mm;
  }

  body {
    background: white !important;
    color: black !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  /* Sembunyikan elemen non-printable */
  :global(#app > *:not(.kanji-worksheet-printable)),
  :global(header),
  :global(nav),
  :global(footer),
  .print\:hidden {
    display: none !important;
  }

  .kanji-worksheet-printable {
    display: block !important;
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .worksheet-page {
    box-shadow: none !important;
    margin: 0 !important;
    padding: 6mm 8mm !important;
    width: 100% !important;
    min-height: 275mm !important;
  }

  .page-break {
    page-break-after: always !important;
    break-after: page !important;
  }
}
</style>
