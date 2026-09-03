<script setup lang="ts">
import { ref, computed } from 'vue';
import type { KataBantuBilanganData } from '../../types/reference';
import { Layers, ChevronDown, ChevronUp, AlertCircle, Search } from '@lucide/vue';
import SpeakerButton from '../SpeakerButton.vue';

const props = defineProps<{
  data: KataBantuBilanganData;
}>();

const searchQuery = ref('');
const expandedCategories = ref<Record<string, boolean>>({});

// Initialize all cards as collapsed or allow toggle
const toggleCategory = (catName: string) => {
  expandedCategories.value[catName] = !expandedCategories.value[catName];
};

const isExpanded = (catName: string) => {
  // If user is searching, expand all matching cards automatically
  if (searchQuery.value.trim()) return true;
  return !!expandedCategories.value[catName];
};

const expandAll = () => {
  props.data.categories.forEach(c => {
    expandedCategories.value[c.category] = true;
  });
};

const collapseAll = () => {
  props.data.categories.forEach(c => {
    expandedCategories.value[c.category] = false;
  });
};

// Check if all are expanded
const areAllExpanded = computed(() => {
  return props.data.categories.every(c => expandedCategories.value[c.category]);
});

// Sound changes to highlight: sokuon (っ) or voiced rendaku (ば, び, ぶ, べ, ぼ, が, ぎ, ぐ, げ, ご, ざ, じ, ず, ぜ, ぞ)
const hasSoundChange = (valStr: string) => {
  return valStr.includes('っ') || valStr.includes('ば') || valStr.includes('び') || valStr.includes('が') || valStr.includes('ぞ');
};

// Filter categories based on search
const filteredCategories = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.data.categories;
  return props.data.categories.filter(c => 
    c.category.toLowerCase().includes(q) ||
    c.counter.toLowerCase().includes(q) ||
    c.counter_reading.toLowerCase().includes(q) ||
    c.usage_example.toLowerCase().includes(q) ||
    c.values.some(v => v.japanese.toLowerCase().includes(q) || String(v.value).includes(q))
  );
});
</script>

<template>
  <div class="space-y-6 animate-fadeIn text-slate-100">
    <!-- Header Controls & Actions -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800/80">
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <div class="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
          <Layers class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm sm:text-base font-bold text-white">Kata Bantu Bilangan (助数詞)</h3>
          <p class="text-xs text-slate-400">8 kategori penghitung benda, frekuensi, tempat, dan hewan</p>
        </div>
      </div>

      <!-- Action buttons & Search -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
        <button
          @click="areAllExpanded ? collapseAll() : expandAll()"
          class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
        >
          <component :is="areAllExpanded ? ChevronUp : ChevronDown" class="w-3.5 h-3.5" />
          <span>{{ areAllExpanded ? 'Tutup Semua' : 'Buka Semua' }}</span>
        </button>

        <div class="relative w-full sm:w-56">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cari counter / benda..."
            class="w-full pl-9 pr-3.5 py-1.5 bg-slate-950/70 border border-slate-700/70 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/40 transition"
          />
        </div>
      </div>
    </div>

    <!-- Category Cards Grid -->
    <div v-if="filteredCategories.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div 
        v-for="cat in filteredCategories" 
        :key="'counter_cat_' + cat.category"
        class="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition shadow-md flex flex-col"
      >
        <!-- Card Header (Always Visible & Clickable) -->
        <button 
          type="button"
          @click="toggleCategory(cat.category)"
          class="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition cursor-pointer select-none"
        >
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 flex flex-col items-center justify-center text-center shrink-0">
              <span class="text-xl font-black font-jp text-amber-300 leading-none">{{ cat.counter }}</span>
              <span class="text-[10px] font-bold text-slate-400 font-jp leading-tight mt-0.5">{{ cat.counter_reading }}</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-sm sm:text-base font-bold text-white capitalize">{{ cat.category }}</h4>
                <SpeakerButton :text="cat.counter_reading || cat.counter" size="sm" />
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                Contoh: <strong class="text-slate-300">{{ cat.usage_example }}</strong>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-[11px] text-violet-400 font-bold hidden sm:inline">
              {{ isExpanded(cat.category) ? 'Tutup' : 'Lihat 1-10' }}
            </span>
            <div class="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
              <ChevronUp v-if="isExpanded(cat.category)" class="w-4 h-4" />
              <ChevronDown v-else class="w-4 h-4" />
            </div>
          </div>
        </button>

        <!-- Expandable Values Table -->
        <div 
          v-if="isExpanded(cat.category)" 
          class="px-4 sm:px-5 pb-4 pt-1 border-t border-slate-800/60 animate-fadeIn space-y-3"
        >
          <div class="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-slate-900 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th class="px-3 py-2 w-14">Angka</th>
                  <th class="px-3 py-2">Pengucapan</th>
                  <th class="px-3 py-2 text-right">Catatan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/50">
                <tr 
                  v-for="val in cat.values" 
                  :key="cat.category + '_' + val.value"
                  :class="[
                    'hover:bg-slate-800/30 transition',
                    hasSoundChange(val.japanese) ? 'bg-amber-500/5' : ''
                  ]"
                >
                  <td class="px-3 py-1.5 font-bold text-slate-300">
                    {{ val.value }}
                  </td>
                  <td class="px-3 py-1.5 font-bold font-jp text-white text-sm sm:text-base">
                    <div class="flex items-center gap-1.5">
                      <span>{{ val.japanese }}</span>
                      <SpeakerButton :text="val.japanese" size="sm" />
                    </div>
                  </td>
                  <td class="px-3 py-1.5 text-right">
                    <span 
                      v-if="val.value === 20"
                      class="text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    >
                      Bentuk Khusus
                    </span>
                    <span 
                      v-else-if="hasSoundChange(val.japanese)"
                      class="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    >
                      Pola Bunyi
                    </span>
                    <span v-else-if="val.value === '?'" class="text-[10px] px-1.5 py-0.2 rounded font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Tanya
                    </span>
                    <span v-else class="text-[11px] text-slate-500">Normal</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Formula Guide for Combined Ages (21-99) -->
          <div v-if="cat.category === 'usia dan umur'" class="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30 text-xs text-violet-200 space-y-1.5">
            <div class="font-bold text-violet-300 flex items-center gap-1.5">
              <span>💡 Rumus Umur Gabungan (21–99 Tahun):</span>
            </div>
            <p class="leading-relaxed text-slate-300">
              Pola umum: <code class="px-1.5 py-0.5 rounded bg-slate-800 text-violet-300 font-bold">[Puluhan] + [Satuan 1–9]</code>
            </p>
            <ul class="list-disc list-inside space-y-0.5 text-[11px] text-slate-400 pl-1">
              <li>Berakhiran <strong>1</strong> ➔ selalu menjadi <span class="text-amber-300 font-jp">〜いっさい</span> (misal 21: にじゅういっさい, 31: さんじゅういっさい)</li>
              <li>Berakhiran <strong>8</strong> ➔ selalu menjadi <span class="text-amber-300 font-jp">〜はっさい</span> (misal 28: にじゅうはっさい, 38: さんじゅうはっさい)</li>
              <li>Kelipatan <strong>10</strong> ➔ selalu berakhiran <span class="text-amber-300 font-jp">〜じゅっさい</span> (30: さんじゅっさい, 40: よんじゅっさい, dst.)</li>
              <li>Pengecualian khusus hanya <strong>20 tahun = はたち (hatachi)</strong> dan <strong>100 tahun = ひゃくさい (hyakusai)</strong>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Search State -->
    <div v-else class="py-12 text-center text-slate-400 text-sm">
      Tidak ada counter word yang sesuai dengan pencarian "{{ searchQuery }}".
    </div>

    <!-- Note Box -->
    <div v-if="data.note" class="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-3 text-xs sm:text-sm text-indigo-200">
      <AlertCircle class="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
      <div class="space-y-1">
        <span class="font-extrabold text-indigo-300 block">Keterangan Tambahan Counter:</span>
        <p class="leading-relaxed text-indigo-200/90">{{ data.note }}</p>
      </div>
    </div>
  </div>
</template>
