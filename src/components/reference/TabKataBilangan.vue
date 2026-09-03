<script setup lang="ts">
import { ref, computed } from 'vue';
import type { KataBilanganData } from '../../types/reference';
import { Search, AlertTriangle, Hash, Sparkles } from '@lucide/vue';

const props = defineProps<{
  data: KataBilanganData;
}>();

const searchQuery = ref('');

// Irregular patterns to highlight
const irregularUnits = new Set([300, 600, 800, 3000, 8000]);

const isIrregular = (val: number | string) => {
  return typeof val === 'number' && irregularUnits.has(val);
};

// Filtered units
const filteredUnits = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.data.units;
  return props.data.units.filter(u => 
    String(u.value).includes(q) || 
    u.japanese.toLowerCase().includes(q)
  );
});

// Grouped sections for structured display when not actively searching
const satuanBelasan = computed(() => props.data.units.filter(u => u.value >= 0 && u.value <= 19));
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
</script>

<template>
  <div class="space-y-6 animate-fadeIn text-slate-100">
    <!-- Header Controls & Search Bar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800/80">
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
          <Hash class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm sm:text-base font-bold text-white">Daftar Kata Bilangan (数)</h3>
          <p class="text-xs text-slate-400">Angka dasar, puluhan, ratusan, ribuan, pecahan & desimal</p>
        </div>
      </div>

      <!-- Search Box -->
      <div class="relative w-full sm:w-64">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari angka atau bacaan..."
          class="w-full pl-9 pr-3.5 py-1.5 bg-slate-950/70 border border-slate-700/70 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition"
        />
      </div>
    </div>

    <!-- Active Search Results View -->
    <div v-if="searchQuery.trim()" class="space-y-4">
      <div class="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Hasil pencarian "{{ searchQuery }}": <strong>{{ filteredUnits.length + filteredDecimals.length + filteredFractions.length }}</strong> ditemukan</span>
        <button @click="searchQuery = ''" class="text-indigo-400 hover:underline">Reset pencarian</button>
      </div>

      <div v-if="filteredUnits.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        <div 
          v-for="u in filteredUnits" 
          :key="'search_u_' + u.value"
          :class="[
            'p-3 rounded-xl border flex flex-col items-center justify-center text-center transition',
            isIrregular(u.value)
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          ]"
        >
          <div class="flex items-center gap-1">
            <span class="text-sm font-extrabold text-slate-300">{{ u.value.toLocaleString('id-ID') }}</span>
            <span v-if="isIrregular(u.value)" class="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-bold border border-amber-500/30">Pola Khusus</span>
          </div>
          <span class="text-base sm:text-lg font-bold font-jp mt-0.5 text-white">{{ u.japanese }}</span>
        </div>
      </div>

      <div v-else-if="filteredDecimals.length === 0 && filteredFractions.length === 0" class="py-12 text-center text-slate-400 text-sm">
        Tidak ada angka atau bacaan yang cocok dengan kata kunci pencarian.
      </div>
    </div>

    <!-- Structured Standard View (when search is empty) -->
    <div v-else class="space-y-6">
      <!-- Section 1: Satuan & Belasan (0-19) -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-2 px-1">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <h4 class="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">Satuan & Belasan (0 - 19)</h4>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2 sm:gap-2.5">
          <div 
            v-for="u in satuanBelasan" 
            :key="'u_' + u.value"
            class="p-2.5 sm:p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 flex flex-col items-center justify-center text-center transition"
          >
            <span class="text-xs font-semibold text-slate-400">{{ u.value }}</span>
            <span class="text-sm sm:text-base font-bold font-jp mt-0.5 text-white">{{ u.japanese }}</span>
          </div>
        </div>
      </div>

      <!-- Section 2: Puluhan (20 - 90) -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-2 px-1">
          <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
          <h4 class="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">Puluhan (20 - 90)</h4>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5">
          <div 
            v-for="u in puluhan" 
            :key="'p_' + u.value"
            class="p-2.5 sm:p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 flex flex-col items-center justify-center text-center transition"
          >
            <span class="text-xs font-semibold text-slate-400">{{ u.value }}</span>
            <span class="text-sm sm:text-base font-bold font-jp mt-0.5 text-white">{{ u.japanese }}</span>
          </div>
        </div>
      </div>

      <!-- Section 3: Ratusan (100 - 900) -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            <h4 class="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">Ratusan (100 - 900)</h4>
          </div>
          <span class="text-[11px] text-amber-400 font-medium">⚠️ 300, 600, 800 tidak beraturan</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-2 sm:gap-2.5">
          <div 
            v-for="u in ratusan" 
            :key="'r_' + u.value"
            :class="[
              'p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center text-center transition',
              isIrregular(u.value)
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-950/30'
                : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700/80'
            ]"
          >
            <div class="flex items-center gap-1">
              <span class="text-xs font-semibold text-slate-300">{{ u.value }}</span>
              <span v-if="isIrregular(u.value)" class="text-[9px] px-1 bg-amber-500/20 text-amber-300 rounded font-bold">★</span>
            </div>
            <span class="text-sm sm:text-base font-bold font-jp mt-0.5 text-white">{{ u.japanese }}</span>
          </div>
        </div>
      </div>

      <!-- Section 4: Ribuan (1.000 - 9.000) -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-rose-400"></span>
            <h4 class="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">Ribuan (1.000 - 9.000)</h4>
          </div>
          <span class="text-[11px] text-amber-400 font-medium">⚠️ 3.000 & 8.000 tidak beraturan</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-2 sm:gap-2.5">
          <div 
            v-for="u in ribuan" 
            :key="'rib_' + u.value"
            :class="[
              'p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center text-center transition',
              isIrregular(u.value)
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-950/30'
                : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700/80'
            ]"
          >
            <div class="flex items-center gap-1">
              <span class="text-xs font-semibold text-slate-300">{{ u.value.toLocaleString('id-ID') }}</span>
              <span v-if="isIrregular(u.value)" class="text-[9px] px-1 bg-amber-500/20 text-amber-300 rounded font-bold">★</span>
            </div>
            <span class="text-sm sm:text-base font-bold font-jp mt-0.5 text-white">{{ u.japanese }}</span>
          </div>
        </div>
      </div>

      <!-- Section 5: Puluhan Ribu ke Atas (10.000 s/d 100.000.000) -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-2 px-1">
          <span class="w-2 h-2 rounded-full bg-violet-400"></span>
          <h4 class="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">Puluhan Ribu ke Atas (万 / 億)</h4>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5">
          <div 
            v-for="u in jutaanPlus" 
            :key="'jut_' + u.value"
            class="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 flex flex-col items-center justify-center text-center transition"
          >
            <span class="text-xs font-semibold text-violet-300">{{ u.value.toLocaleString('id-ID') }}</span>
            <span class="text-base sm:text-lg font-bold font-jp mt-0.5 text-white">{{ u.japanese }}</span>
          </div>
        </div>
      </div>

      <!-- Section 6: Desimal & Pecahan -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <!-- Desimal -->
        <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2.5">
          <div class="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
            <Sparkles class="w-4 h-4 text-cyan-400" />
            <span>Contoh Desimal (小数)</span>
          </div>
          <div class="space-y-2">
            <div 
              v-for="d in filteredDecimals" 
              :key="'dec_' + d.value"
              class="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800"
            >
              <span class="font-black text-cyan-400 text-sm">{{ d.value }}</span>
              <span class="font-bold text-white font-jp text-sm">{{ d.japanese }}</span>
            </div>
          </div>
        </div>

        <!-- Pecahan -->
        <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2.5">
          <div class="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
            <Sparkles class="w-4 h-4 text-indigo-400" />
            <span>Contoh Pecahan (分数)</span>
          </div>
          <div class="space-y-2">
            <div 
              v-for="f in filteredFractions" 
              :key="'frac_' + f.value"
              class="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800"
            >
              <span class="font-black text-indigo-400 text-sm">{{ f.value }}</span>
              <span class="font-bold text-white font-jp text-sm">{{ f.japanese }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Irregular Pattern Warning / Info Box -->
    <div v-if="data.note_irregular" class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs sm:text-sm text-amber-200">
      <AlertTriangle class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div class="space-y-1">
        <span class="font-extrabold text-amber-300 block">Catatan Pola Tidak Beraturan (音便):</span>
        <p class="leading-relaxed text-amber-200/90">{{ data.note_irregular }}</p>
      </div>
    </div>
  </div>
</template>
