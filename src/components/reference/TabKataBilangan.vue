<script setup lang="ts">
import { ref, computed } from 'vue';
import type { KataBilanganData } from '../../types/reference';
import { Search, AlertTriangle, Hash, Sparkles } from '@lucide/vue';
import SpeakerButton from '../SpeakerButton.vue';
import { useTextToSpeech } from '../../composables/useTextToSpeech';

const props = defineProps<{
  data: KataBilanganData;
}>();

const { speak } = useTextToSpeech();

const searchQuery = ref('');
const activeCategory = ref<'all' | 'satuan' | 'puluhan' | 'ratusan' | 'ribuan' | 'besar' | 'desimal_pecahan'>('all');

// Irregular patterns to highlight
const irregularUnits = new Set([300, 600, 800, 3000, 8000]);

const isIrregular = (val: number | string) => {
  return typeof val === 'number' && irregularUnits.has(val);
};

// Romaji mapping for clarity and pronunciation guidance
const getRomaji = (val: number | string): string => {
  const map: Record<string, string> = {
    '0': 'zero / rei',
    '1': 'ichi',
    '2': 'ni',
    '3': 'san',
    '4': 'yon / shi',
    '5': 'go',
    '6': 'roku',
    '7': 'nana / shichi',
    '8': 'hachi',
    '9': 'kyuu / ku',
    '10': 'juu',
    '11': 'juuichi',
    '12': 'juuni',
    '13': 'juusan',
    '14': 'juuyon / juushi',
    '15': 'juugo',
    '16': 'juuroku',
    '17': 'juunana / juushichi',
    '18': 'juuhachi',
    '19': 'juukyuu / juuku',
    '20': 'nijuu',
    '30': 'sanjuu',
    '40': 'yonjuu',
    '50': 'gojuu',
    '60': 'rokujuu',
    '70': 'nanajuu / shichijuu',
    '80': 'hachijuu',
    '90': 'kyuujuu',
    '100': 'hyaku',
    '200': 'nihyaku',
    '300': 'sanbyaku',
    '400': 'yonhyaku',
    '500': 'gohyaku',
    '600': 'roppyaku',
    '700': 'nanahyaku',
    '800': 'happyaku',
    '900': 'kyuuhyaku',
    '1000': 'sen',
    '2000': 'nisen',
    '3000': 'sanzen',
    '4000': 'yonsen',
    '5000': 'gosen',
    '6000': 'rokusen',
    '7000': 'nanasen',
    '8000': 'hassen',
    '9000': 'kyuusen',
    '10000': 'ichiman',
    '100000': 'juuman',
    '1000000': 'hyakuman',
    '10000000': 'senman',
    '100000000': 'ichioku',
  };
  return map[String(val)] || '';
};

// Filtered units for search
const filteredUnits = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.data.units;
  return props.data.units.filter(u => 
    String(u.value).includes(q) || 
    u.japanese.toLowerCase().includes(q) ||
    getRomaji(u.value).toLowerCase().includes(q)
  );
});

// Grouped sections
const satuan = computed(() => props.data.units.filter(u => u.value >= 0 && u.value <= 9));
const belasan = computed(() => props.data.units.filter(u => u.value >= 10 && u.value <= 19));
const puluhan = computed(() => props.data.units.filter(u => u.value >= 20 && u.value <= 90));
const ratusan = computed(() => props.data.units.filter(u => u.value >= 100 && u.value <= 900));
const ribuan = computed(() => props.data.units.filter(u => u.value >= 1000 && u.value <= 9000));
const jutaanPlus = computed(() => props.data.units.filter(u => u.value >= 10000));

const filteredDecimals = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.data.decimal_examples;
  return props.data.decimal_examples.filter(d => 
    d.value.includes(q) || d.japanese.toLowerCase().includes(q)
  );
});

const filteredFractions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.data.fraction_examples;
  return props.data.fraction_examples.filter(f => 
    f.value.includes(q) || f.japanese.toLowerCase().includes(q)
  );
});

const handleRowClick = (text: string) => {
  if (text) {
    speak(text);
  }
};
</script>

<template>
  <div class="space-y-5 animate-fadeIn text-slate-100">
    <!-- Header Controls & Search Bar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/70 p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-md">
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <div class="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
          <Hash class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm sm:text-base font-bold text-white tracking-tight">Daftar Kata Bilangan (数)</h3>
          <p class="text-xs text-slate-400">Pola angka terstruktur dengan pengucapan audio interaktif</p>
        </div>
      </div>

      <!-- Search Box -->
      <div class="relative w-full sm:w-72">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari angka, romaji, atau bacaan..."
          class="w-full pl-9 pr-3.5 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition"
        />
      </div>
    </div>

    <!-- Category Filter Pills (When Not Searching) -->
    <div 
      v-if="!searchQuery.trim()" 
      class="flex items-center gap-2 overflow-x-auto pt-1 pb-3 px-1 text-xs filter-scroll-track"
    >
      <button
        type="button"
        @click="activeCategory = 'all'"
        :class="[
          'px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 border',
          activeCategory === 'all'
            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-xs'
            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
        ]"
      >
        Semua Kategori
      </button>

      <button
        type="button"
        @click="activeCategory = 'satuan'"
        :class="[
          'px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 border',
          activeCategory === 'satuan'
            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-xs'
            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
        ]"
      >
        Satuan & Belasan (0-19)
      </button>

      <button
        type="button"
        @click="activeCategory = 'puluhan'"
        :class="[
          'px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 border',
          activeCategory === 'puluhan'
            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-xs'
            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
        ]"
      >
        Puluhan (20-90)
      </button>

      <button
        type="button"
        @click="activeCategory = 'ratusan'"
        :class="[
          'px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 border',
          activeCategory === 'ratusan'
            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-xs'
            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
        ]"
      >
        Ratusan (100-900)
      </button>

      <button
        type="button"
        @click="activeCategory = 'ribuan'"
        :class="[
          'px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 border',
          activeCategory === 'ribuan'
            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-xs'
            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
        ]"
      >
        Ribuan (1.000-9.000)
      </button>

      <button
        type="button"
        @click="activeCategory = 'besar'"
        :class="[
          'px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 border',
          activeCategory === 'besar'
            ? 'bg-violet-500/20 border-violet-500/40 text-violet-300 shadow-xs'
            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
        ]"
      >
        Puluhan Ribu+ (万/億)
      </button>

      <button
        type="button"
        @click="activeCategory = 'desimal_pecahan'"
        :class="[
          'px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 border',
          activeCategory === 'desimal_pecahan'
            ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-xs'
            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
        ]"
      >
        Desimal & Pecahan
      </button>
    </div>

    <!-- Active Search Results Table View -->
    <div v-if="searchQuery.trim()" class="space-y-3">
      <div class="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Hasil pencarian "{{ searchQuery }}": <strong>{{ filteredUnits.length + filteredDecimals.length + filteredFractions.length }}</strong> ditemukan</span>
        <button @click="searchQuery = ''" class="text-amber-400 hover:underline cursor-pointer">Reset pencarian</button>
      </div>

      <div v-if="filteredUnits.length > 0" class="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md">
        <table class="w-full text-left text-xs sm:text-sm">
          <thead class="bg-slate-950/90 text-slate-400 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th class="px-4 py-3 w-28 sm:w-36 text-cyan-300">Nilai Angka</th>
              <th class="px-4 py-3 text-amber-300">Bahasa Jepang (Hiragana)</th>
              <th class="px-4 py-3 hidden sm:table-cell text-slate-400">Romaji</th>
              <th class="px-4 py-3 text-right w-16 text-slate-400">Suara</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <tr
              v-for="u in filteredUnits"
              :key="'search_u_' + u.value"
              @click="handleRowClick(u.japanese)"
              :class="[
                'hover:bg-slate-800/60 transition cursor-pointer group',
                isIrregular(u.value) ? 'bg-amber-500/5 hover:bg-amber-500/10' : ''
              ]"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span class="font-extrabold text-sm sm:text-base text-slate-200 group-hover:text-amber-300 transition">
                    {{ u.value.toLocaleString('id-ID') }}
                  </span>
                  <span 
                    v-if="isIrregular(u.value)" 
                    class="text-[10px] px-1.5 py-0.5 rounded font-black bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  >
                    Khusus
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="font-bold font-jp text-base sm:text-lg text-white group-hover:text-amber-200 transition">
                  {{ u.japanese }}
                </div>
                <div class="text-[11px] text-slate-400 font-mono sm:hidden mt-0.5">
                  {{ getRomaji(u.value) }}
                </div>
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <span class="text-xs font-mono text-slate-300">{{ getRomaji(u.value) }}</span>
              </td>
              <td class="px-4 py-3 text-right" @click.stop>
                <SpeakerButton :text="u.japanese" size="sm" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="filteredDecimals.length === 0 && filteredFractions.length === 0" class="py-12 text-center text-slate-400 text-sm">
        Tidak ada angka atau bacaan yang cocok dengan kata kunci pencarian.
      </div>
    </div>

    <!-- Structured Standard Vertical Tables View (when search is empty) -->
    <div v-else class="space-y-6">
      
      <!-- ============================================================ -->
      <!-- SECTION 1: SATUAN (0-9) & BELASAN (10-19)                     -->
      <!-- 2 Kolom Tabel Seimbang Berdampingan di Desktop                -->
      <!-- ============================================================ -->
      <div v-if="activeCategory === 'all' || activeCategory === 'satuan'" class="space-y-3">
        <div class="flex items-center gap-2 px-1">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <h4 class="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
            1. Satuan & Belasan (0 - 19)
          </h4>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Tabel Satuan (0 - 9) -->
          <div class="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-md">
            <div class="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-300">
              <span>Satuan (0 s/d 9)</span>
              <span class="text-[11px] text-slate-400 font-normal">10 angka</span>
            </div>
            <table class="w-full text-left text-xs sm:text-sm">
              <tbody class="divide-y divide-slate-800/60">
                <tr 
                  v-for="u in satuan" 
                  :key="'satuan_' + u.value"
                  @click="handleRowClick(u.japanese)"
                  class="hover:bg-slate-800/60 transition cursor-pointer group"
                >
                  <td class="px-4 py-2.5 w-16 font-extrabold text-slate-300 group-hover:text-emerald-300">
                    {{ u.value }}
                  </td>
                  <td class="px-4 py-2.5">
                    <div class="font-bold font-jp text-sm sm:text-base text-white group-hover:text-emerald-200">
                      {{ u.japanese }}
                    </div>
                    <div class="text-[11px] text-slate-400 font-mono">
                      {{ getRomaji(u.value) }}
                    </div>
                  </td>
                  <td class="px-4 py-2.5 text-right w-14" @click.stop>
                    <SpeakerButton :text="u.japanese" size="sm" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tabel Belasan (10 - 19) -->
          <div class="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-md">
            <div class="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-300">
              <span>Belasan (10 s/d 19)</span>
              <span class="text-[11px] text-slate-400 font-normal">10 angka</span>
            </div>
            <table class="w-full text-left text-xs sm:text-sm">
              <tbody class="divide-y divide-slate-800/60">
                <tr 
                  v-for="u in belasan" 
                  :key="'belasan_' + u.value"
                  @click="handleRowClick(u.japanese)"
                  class="hover:bg-slate-800/60 transition cursor-pointer group"
                >
                  <td class="px-4 py-2.5 w-16 font-extrabold text-slate-300 group-hover:text-emerald-300">
                    {{ u.value }}
                  </td>
                  <td class="px-4 py-2.5">
                    <div class="font-bold font-jp text-sm sm:text-base text-white group-hover:text-emerald-200">
                      {{ u.japanese }}
                    </div>
                    <div class="text-[11px] text-slate-400 font-mono">
                      {{ getRomaji(u.value) }}
                    </div>
                  </td>
                  <td class="px-4 py-2.5 text-right w-14" @click.stop>
                    <SpeakerButton :text="u.japanese" size="sm" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SECTION 2: PULUHAN (20 - 90)                                 -->
      <!-- Tabel Vertikal ke Bawah                                      -->
      <!-- ============================================================ -->
      <div v-if="activeCategory === 'all' || activeCategory === 'puluhan'" class="space-y-3">
        <div class="flex items-center gap-2 px-1">
          <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
          <h4 class="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
            2. Puluhan (20 - 90)
          </h4>
        </div>

        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-md">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-950/90 text-slate-400 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th class="px-4 py-3 w-24 sm:w-32 text-indigo-300">Nilai</th>
                <th class="px-4 py-3 text-white">Bahasa Jepang (Hiragana)</th>
                <th class="px-4 py-3 hidden sm:table-cell text-slate-400">Romaji</th>
                <th class="px-4 py-3 text-right w-16 text-slate-400">Suara</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr 
                v-for="u in puluhan" 
                :key="'p_' + u.value"
                @click="handleRowClick(u.japanese)"
                class="hover:bg-slate-800/60 transition cursor-pointer group"
              >
                <td class="px-4 py-2.5 font-extrabold text-sm sm:text-base text-slate-300 group-hover:text-indigo-300">
                  {{ u.value }}
                </td>
                <td class="px-4 py-2.5">
                  <div class="font-bold font-jp text-sm sm:text-base text-white group-hover:text-indigo-200">
                    {{ u.japanese }}
                  </div>
                  <div class="text-[11px] text-slate-400 font-mono sm:hidden mt-0.5">
                    {{ getRomaji(u.value) }}
                  </div>
                </td>
                <td class="px-4 py-2.5 hidden sm:table-cell">
                  <span class="text-xs font-mono text-slate-300">{{ getRomaji(u.value) }}</span>
                </td>
                <td class="px-4 py-2.5 text-right" @click.stop>
                  <SpeakerButton :text="u.japanese" size="sm" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SECTION 3: RATUSAN (100 - 900)                               -->
      <!-- Tabel Vertikal ke Bawah dengan Highlight Pola Khusus        -->
      <!-- ============================================================ -->
      <div v-if="activeCategory === 'all' || activeCategory === 'ratusan'" class="space-y-3">
        <div class="flex items-center justify-between px-1 flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            <h4 class="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
              3. Ratusan (100 - 900)
            </h4>
          </div>
          <span class="text-[11px] text-amber-300 font-bold bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
            ⚠️ 300, 600, 800 pola tidak beraturan (音便)
          </span>
        </div>

        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-md">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-950/90 text-slate-400 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th class="px-4 py-3 w-28 sm:w-36 text-amber-300">Nilai</th>
                <th class="px-4 py-3 text-white">Bahasa Jepang (Hiragana)</th>
                <th class="px-4 py-3 hidden sm:table-cell text-slate-400">Romaji</th>
                <th class="px-4 py-3 text-right w-16 text-slate-400">Suara</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr 
                v-for="u in ratusan" 
                :key="'r_' + u.value"
                @click="handleRowClick(u.japanese)"
                :class="[
                  'hover:bg-slate-800/60 transition cursor-pointer group',
                  isIrregular(u.value) ? 'bg-amber-500/10 hover:bg-amber-500/15' : ''
                ]"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span class="font-extrabold text-sm sm:text-base text-slate-200 group-hover:text-amber-300">
                      {{ u.value }}
                    </span>
                    <span 
                      v-if="isIrregular(u.value)" 
                      class="text-[10px] px-1.5 py-0.5 rounded font-black bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    >
                      Pola Khusus
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="font-bold font-jp text-base sm:text-lg text-white group-hover:text-amber-200">
                    {{ u.japanese }}
                  </div>
                  <div class="text-[11px] text-slate-400 font-mono sm:hidden mt-0.5">
                    {{ getRomaji(u.value) }}
                  </div>
                </td>
                <td class="px-4 py-3 hidden sm:table-cell">
                  <span :class="['text-xs font-mono', isIrregular(u.value) ? 'text-amber-300 font-bold' : 'text-slate-300']">
                    {{ getRomaji(u.value) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right" @click.stop>
                  <SpeakerButton :text="u.japanese" size="sm" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SECTION 4: RIBUAN (1.000 - 9.000)                            -->
      <!-- Tabel Vertikal ke Bawah dengan Highlight Pola Khusus        -->
      <!-- ============================================================ -->
      <div v-if="activeCategory === 'all' || activeCategory === 'ribuan'" class="space-y-3">
        <div class="flex items-center justify-between px-1 flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-rose-400"></span>
            <h4 class="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
              4. Ribuan (1.000 - 9.000)
            </h4>
          </div>
          <span class="text-[11px] text-rose-300 font-bold bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-full">
            ⚠️ 3.000 & 8.000 pola tidak beraturan (音便)
          </span>
        </div>

        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-md">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-950/90 text-slate-400 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th class="px-4 py-3 w-28 sm:w-36 text-rose-300">Nilai</th>
                <th class="px-4 py-3 text-white">Bahasa Jepang (Hiragana)</th>
                <th class="px-4 py-3 hidden sm:table-cell text-slate-400">Romaji</th>
                <th class="px-4 py-3 text-right w-16 text-slate-400">Suara</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr 
                v-for="u in ribuan" 
                :key="'rib_' + u.value"
                @click="handleRowClick(u.japanese)"
                :class="[
                  'hover:bg-slate-800/60 transition cursor-pointer group',
                  isIrregular(u.value) ? 'bg-amber-500/10 hover:bg-amber-500/15' : ''
                ]"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span class="font-extrabold text-sm sm:text-base text-slate-200 group-hover:text-rose-300">
                      {{ u.value.toLocaleString('id-ID') }}
                    </span>
                    <span 
                      v-if="isIrregular(u.value)" 
                      class="text-[10px] px-1.5 py-0.5 rounded font-black bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    >
                      Pola Khusus
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="font-bold font-jp text-base sm:text-lg text-white group-hover:text-rose-200">
                    {{ u.japanese }}
                  </div>
                  <div class="text-[11px] text-slate-400 font-mono sm:hidden mt-0.5">
                    {{ getRomaji(u.value) }}
                  </div>
                </td>
                <td class="px-4 py-3 hidden sm:table-cell">
                  <span :class="['text-xs font-mono', isIrregular(u.value) ? 'text-rose-300 font-bold' : 'text-slate-300']">
                    {{ getRomaji(u.value) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right" @click.stop>
                  <SpeakerButton :text="u.japanese" size="sm" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SECTION 5: PULUHAN RIBU KE ATAS (万 / 億)                    -->
      <!-- Tabel Vertikal ke Bawah                                      -->
      <!-- ============================================================ -->
      <div v-if="activeCategory === 'all' || activeCategory === 'besar'" class="space-y-3">
        <div class="flex items-center gap-2 px-1">
          <span class="w-2 h-2 rounded-full bg-violet-400"></span>
          <h4 class="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
            5. Puluhan Ribu ke Atas (万 / 億)
          </h4>
        </div>

        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-md">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-950/90 text-slate-400 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th class="px-4 py-3 w-36 sm:w-44 text-violet-300">Nilai</th>
                <th class="px-4 py-3 text-white">Bahasa Jepang (Hiragana)</th>
                <th class="px-4 py-3 hidden sm:table-cell text-slate-400">Romaji</th>
                <th class="px-4 py-3 text-right w-16 text-slate-400">Suara</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr 
                v-for="u in jutaanPlus" 
                :key="'jut_' + u.value"
                @click="handleRowClick(u.japanese)"
                class="hover:bg-slate-800/60 transition cursor-pointer group"
              >
                <td class="px-4 py-3 font-extrabold text-sm sm:text-base text-violet-300">
                  {{ u.value.toLocaleString('id-ID') }}
                </td>
                <td class="px-4 py-3">
                  <div class="font-bold font-jp text-base sm:text-lg text-white group-hover:text-violet-200">
                    {{ u.japanese }}
                  </div>
                  <div class="text-[11px] text-slate-400 font-mono sm:hidden mt-0.5">
                    {{ getRomaji(u.value) }}
                  </div>
                </td>
                <td class="px-4 py-3 hidden sm:table-cell">
                  <span class="text-xs font-mono text-slate-300">{{ getRomaji(u.value) }}</span>
                </td>
                <td class="px-4 py-3 text-right" @click.stop>
                  <SpeakerButton :text="u.japanese" size="sm" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SECTION 6: DESIMAL & PECAHAN                                 -->
      <!-- 2 Kolom Tabel Vertikal Berdampingan di Desktop               -->
      <!-- ============================================================ -->
      <div v-if="activeCategory === 'all' || activeCategory === 'desimal_pecahan'" class="space-y-3">
        <div class="flex items-center gap-2 px-1">
          <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
          <h4 class="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
            6. Contoh Desimal & Pecahan
          </h4>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Tabel Desimal -->
          <div class="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-md">
            <div class="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center gap-2 text-xs font-bold text-cyan-300">
              <Sparkles class="w-4 h-4 text-cyan-400" />
              <span>Desimal (小数 - Shousuu)</span>
            </div>
            <table class="w-full text-left text-xs sm:text-sm">
              <tbody class="divide-y divide-slate-800/60">
                <tr 
                  v-for="d in filteredDecimals" 
                  :key="'dec_' + d.value"
                  @click="handleRowClick(d.japanese)"
                  class="hover:bg-slate-800/60 transition cursor-pointer group"
                >
                  <td class="px-4 py-3 w-20 font-black text-cyan-400 text-sm sm:text-base">
                    {{ d.value }}
                  </td>
                  <td class="px-4 py-3 font-bold text-white font-jp text-sm sm:text-base group-hover:text-cyan-200">
                    {{ d.japanese }}
                  </td>
                  <td class="px-4 py-3 text-right w-14" @click.stop>
                    <SpeakerButton :text="d.japanese" size="sm" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tabel Pecahan -->
          <div class="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-md">
            <div class="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Sparkles class="w-4 h-4 text-indigo-400" />
              <span>Pecahan (分数 - Bunsuu)</span>
            </div>
            <table class="w-full text-left text-xs sm:text-sm">
              <tbody class="divide-y divide-slate-800/60">
                <tr 
                  v-for="f in filteredFractions" 
                  :key="'frac_' + f.value"
                  @click="handleRowClick(f.japanese)"
                  class="hover:bg-slate-800/60 transition cursor-pointer group"
                >
                  <td class="px-4 py-3 w-20 font-black text-indigo-400 text-sm sm:text-base">
                    {{ f.value }}
                  </td>
                  <td class="px-4 py-3 font-bold text-white font-jp text-sm sm:text-base group-hover:text-indigo-200">
                    {{ f.japanese }}
                  </td>
                  <td class="px-4 py-3 text-right w-14" @click.stop>
                    <SpeakerButton :text="f.japanese" size="sm" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Irregular Pattern Warning / Info Box -->
    <div v-if="data.note_irregular" class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs sm:text-sm text-amber-200 shadow-sm">
      <AlertTriangle class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div class="space-y-1">
        <span class="font-extrabold text-amber-300 block">Catatan Pola Tidak Beraturan (音便 - Onbin):</span>
        <p class="leading-relaxed text-amber-200/90">{{ data.note_irregular }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-scroll-track {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
}
.filter-scroll-track::-webkit-scrollbar {
  height: 6px;
}
.filter-scroll-track::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 9999px;
  margin: 0 4px;
}
.filter-scroll-track::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.45);
  border-radius: 9999px;
}
.filter-scroll-track::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.7);
}
</style>
