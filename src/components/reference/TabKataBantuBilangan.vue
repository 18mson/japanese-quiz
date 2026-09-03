<script setup lang="ts">
import { ref, computed } from 'vue';
import type { KataBantuBilanganData } from '../../types/reference';
import { Layers, ChevronDown, ChevronUp, AlertCircle, Search } from '@lucide/vue';
import CounterCategoryCard from './CounterCategoryCard.vue';

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

// Split categories into two independent vertical columns for desktop masonry (No vertical grid gaps!)
const leftCategories = computed(() => filteredCategories.value.filter((_, i) => i % 2 === 0));
const rightCategories = computed(() => filteredCategories.value.filter((_, i) => i % 2 === 1));
</script>

<template>
  <div class="space-y-6 animate-fadeIn text-slate-100">
    <!-- Header Controls & Actions -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800/80 shadow-sm">
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
          class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
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

    <!-- Category Cards: 2-Column Masonry on Desktop, 1-Column on Mobile -->
    <div v-if="filteredCategories.length > 0">
      <!-- Mobile Layout: Single sequential column -->
      <div class="block md:hidden space-y-4">
        <CounterCategoryCard
          v-for="cat in filteredCategories"
          :key="'m_cat_' + cat.category"
          :cat="cat"
          :is-expanded="isExpanded(cat.category)"
          @toggle="toggleCategory(cat.category)"
        />
      </div>

      <!-- Desktop Layout: 2 Independent Columns (Zero Awkward Gaps) -->
      <div class="hidden md:grid md:grid-cols-2 gap-4 items-start">
        <!-- Kolom Kiri -->
        <div class="flex flex-col gap-4">
          <CounterCategoryCard
            v-for="cat in leftCategories"
            :key="'d_left_' + cat.category"
            :cat="cat"
            :is-expanded="isExpanded(cat.category)"
            @toggle="toggleCategory(cat.category)"
          />
        </div>

        <!-- Kolom Kanan -->
        <div class="flex flex-col gap-4">
          <CounterCategoryCard
            v-for="cat in rightCategories"
            :key="'d_right_' + cat.category"
            :cat="cat"
            :is-expanded="isExpanded(cat.category)"
            @toggle="toggleCategory(cat.category)"
          />
        </div>
      </div>
    </div>

    <!-- Empty Search State -->
    <div v-else class="py-12 text-center text-slate-400 text-sm">
      Tidak ada counter word yang sesuai dengan pencarian "{{ searchQuery }}".
    </div>

    <!-- Note Box -->
    <div v-if="data.note" class="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-3 text-xs sm:text-sm text-indigo-200 shadow-sm">
      <AlertCircle class="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
      <div class="space-y-1">
        <span class="font-extrabold text-indigo-300 block">Keterangan Tambahan Counter:</span>
        <p class="leading-relaxed text-indigo-200/90">{{ data.note }}</p>
      </div>
    </div>
  </div>
</template>
