<script setup lang="ts">
import { ref, computed } from 'vue';
import type { KonjugasiKataKerjaData, VerbItem } from '../../types/reference';
import { BookOpen, Search, Info } from '@lucide/vue';

const props = defineProps<{
  data: KonjugasiKataKerjaData;
}>();

const selectedGroup = ref<'all' | 'kelompok_1' | 'kelompok_2' | 'kelompok_3'>('all');
const searchQuery = ref('');
const selectedLessonFilter = ref<string>('all');

// Available lessons for dropdown (extracted from all verbs)
const allVerbsWithGroup = computed(() => {
  const list: (VerbItem & { groupName: string })[] = [];
  props.data.kelompok_1.verbs.forEach(v => list.push({ ...v, groupName: 'Kelompok I' }));
  props.data.kelompok_2.verbs.forEach(v => list.push({ ...v, groupName: 'Kelompok II' }));
  props.data.kelompok_3.verbs.forEach(v => list.push({ ...v, groupName: 'Kelompok III' }));
  return list;
});

const availableLessons = computed(() => {
  const lessons = Array.from(new Set(allVerbsWithGroup.value.map(v => v.pelajaran))).filter(Boolean);
  return lessons.sort((a, b) => a - b);
});

// Current active group description
const currentGroupDescription = computed(() => {
  if (selectedGroup.value === 'kelompok_1') return props.data.kelompok_1.description;
  if (selectedGroup.value === 'kelompok_2') return props.data.kelompok_2.description;
  if (selectedGroup.value === 'kelompok_3') return props.data.kelompok_3.description;
  return 'Daftar lengkap 154 kata kerja bahasa Jepang dari 25 pelajaran Minna no Nihongo, terbagi menjadi Kelompok I (Godan), Kelompok II (Ichidan), dan Kelompok III (Fukisoku).';
});

// Filtered verbs based on group, search query, and lesson filter
const filteredVerbs = computed(() => {
  let list = allVerbsWithGroup.value;

  // 1. Group Filter
  if (selectedGroup.value === 'kelompok_1') {
    list = list.filter(v => v.groupName === 'Kelompok I');
  } else if (selectedGroup.value === 'kelompok_2') {
    list = list.filter(v => v.groupName === 'Kelompok II');
  } else if (selectedGroup.value === 'kelompok_3') {
    list = list.filter(v => v.groupName === 'Kelompok III');
  }

  // 2. Lesson Filter
  if (selectedLessonFilter.value !== 'all') {
    if (selectedLessonFilter.value.startsWith('range_')) {
      const [, minStr, maxStr] = selectedLessonFilter.value.split('_');
      const min = parseInt(minStr);
      const max = parseInt(maxStr);
      list = list.filter(v => v.pelajaran >= min && v.pelajaran <= max);
    } else {
      const lessonNum = parseInt(selectedLessonFilter.value);
      list = list.filter(v => v.pelajaran === lessonNum);
    }
  }

  // 3. Search Query (Bilingual: Japanese Kanji, Reading, or Indonesian meaning)
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter(v => 
      v.masu.toLowerCase().includes(q) ||
      v.masu_reading.toLowerCase().includes(q) ||
      v.te.toLowerCase().includes(q) ||
      v.kamus.toLowerCase().includes(q) ||
      v.nai.toLowerCase().includes(q) ||
      v.ta.toLowerCase().includes(q) ||
      v.meaning.toLowerCase().includes(q)
    );
  }

  return list;
});
</script>

<template>
  <div class="space-y-6 animate-fadeIn text-slate-100">
    <!-- Header Controls & Filters -->
    <div class="flex flex-col gap-3 bg-slate-900/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800/80">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 w-full sm:w-auto">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <BookOpen class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-sm sm:text-base font-bold text-white">Konjugasi Kata Kerja (動詞の活用)</h3>
            <p class="text-xs text-slate-400">Tabel 5 bentuk konjugasi (ます, て, Kamus, ない, た)</p>
          </div>
        </div>

        <!-- Group Selector Tabs -->
        <div class="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-bold w-full sm:w-auto justify-between overflow-x-auto">
          <button 
            @click="selectedGroup = 'all'"
            :class="[
              'px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0',
              selectedGroup === 'all' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            Semua ({{ allVerbsWithGroup.length }})
          </button>
          <button 
            @click="selectedGroup = 'kelompok_1'"
            :class="[
              'px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0',
              selectedGroup === 'kelompok_1' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            Kelompok I ({{ data.kelompok_1.verbs.length }})
          </button>
          <button 
            @click="selectedGroup = 'kelompok_2'"
            :class="[
              'px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0',
              selectedGroup === 'kelompok_2' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            Kelompok II ({{ data.kelompok_2.verbs.length }})
          </button>
          <button 
            @click="selectedGroup = 'kelompok_3'"
            :class="[
              'px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0',
              selectedGroup === 'kelompok_3' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            Kelompok III ({{ data.kelompok_3.verbs.length }})
          </button>
        </div>
      </div>

      <!-- Secondary Filter Row: Search + Lesson Filter Dropdown -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1 border-t border-slate-800/60">
        <!-- Search Input -->
        <div class="relative w-full sm:flex-1">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cari kata Jepang (kanji/bacaan) atau arti bahasa Indonesia (misal: makan, bertemu, pergi)..."
            class="w-full pl-9 pr-3.5 py-1.5 bg-slate-950/70 border border-slate-700/70 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-400/40 transition"
          />
        </div>

        <!-- Filter Lesson Dropdown -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <div class="relative w-full sm:w-48">
            <select 
              v-model="selectedLessonFilter"
              class="w-full px-3 py-1.5 bg-slate-950/80 border border-slate-700/70 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-400/60 cursor-pointer"
            >
              <option value="all">Semua Pelajaran (1-25)</option>
              <option value="range_1_5">Pelajaran 1 - 5</option>
              <option value="range_6_10">Pelajaran 6 - 10</option>
              <option value="range_11_15">Pelajaran 11 - 15</option>
              <option value="range_16_20">Pelajaran 16 - 20</option>
              <option value="range_21_25">Pelajaran 21 - 25</option>
              <option disabled>──────────</option>
              <option v-for="l in availableLessons" :key="'opt_l_' + l" :value="String(l)">
                Pelajaran {{ l }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Group Explanation Box -->
    <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-xs sm:text-sm text-emerald-200">
      <Info class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
      <div class="space-y-0.5">
        <span class="font-extrabold text-emerald-300 block">
          {{ selectedGroup === 'all' ? 'Panduan Umum Konjugasi:' : (selectedGroup === 'kelompok_1' ? data.kelompok_1.title : selectedGroup === 'kelompok_2' ? data.kelompok_2.title : data.kelompok_3.title) }}
        </span>
        <p class="leading-relaxed text-emerald-200/90 text-xs">{{ currentGroupDescription }}</p>
      </div>
    </div>

    <!-- Verbs Table -->
    <div class="space-y-2">
      <div class="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Menampilkan <strong>{{ filteredVerbs.length }}</strong> kata kerja</span>
        <span v-if="searchQuery || selectedLessonFilter !== 'all'">
          <button @click="searchQuery = ''; selectedLessonFilter = 'all';" class="text-emerald-400 hover:underline">Reset Filter</button>
        </span>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md">
        <table class="w-full text-left text-xs sm:text-sm">
          <thead class="bg-slate-950/90 text-slate-300 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th class="px-3.5 py-3 text-emerald-400">Bentuk ます (Masu)</th>
              <th class="px-3 py-3 text-cyan-300">Bentuk て (Te)</th>
              <th class="px-3 py-3 text-indigo-300">Bentuk Kamus (Jisho)</th>
              <th class="px-3 py-3 text-rose-300">Bentuk ない (Nai)</th>
              <th class="px-3 py-3 text-amber-300">Bentuk た (Ta)</th>
              <th class="px-3.5 py-3 text-slate-300 min-w-[140px]">Arti Indonesia</th>
              <th class="px-2.5 py-3 text-center w-16 text-slate-400">Bab</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <tr 
              v-for="(v, idx) in filteredVerbs" 
              :key="v.masu + '_' + idx"
              class="hover:bg-slate-800/50 transition group"
            >
              <!-- Bentuk Masu + Reading -->
              <td class="px-3.5 py-2.5">
                <div class="font-extrabold text-white font-jp text-sm sm:text-base group-hover:text-emerald-300 transition">
                  {{ v.masu }}
                </div>
                <div class="text-[11px] text-slate-400 font-jp mt-0.5">
                  {{ v.masu_reading }}
                </div>
              </td>

              <!-- Bentuk Te -->
              <td class="px-3 py-2.5">
                <span class="font-bold text-cyan-200 font-jp text-xs sm:text-sm bg-cyan-950/40 px-2 py-1 rounded-lg border border-cyan-800/40 inline-block">
                  {{ v.te }}
                </span>
              </td>

              <!-- Bentuk Kamus -->
              <td class="px-3 py-2.5">
                <span class="font-bold text-indigo-200 font-jp text-xs sm:text-sm bg-indigo-950/40 px-2 py-1 rounded-lg border border-indigo-800/40 inline-block">
                  {{ v.kamus }}
                </span>
              </td>

              <!-- Bentuk Nai -->
              <td class="px-3 py-2.5">
                <span class="font-bold text-rose-200 font-jp text-xs sm:text-sm bg-rose-950/40 px-2 py-1 rounded-lg border border-rose-800/40 inline-block">
                  {{ v.nai }}
                </span>
              </td>

              <!-- Bentuk Ta -->
              <td class="px-3 py-2.5">
                <span class="font-bold text-amber-200 font-jp text-xs sm:text-sm bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-800/40 inline-block">
                  {{ v.ta }}
                </span>
              </td>

              <!-- Arti -->
              <td class="px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 font-medium">
                {{ v.meaning }}
              </td>

              <!-- Bab Badge -->
              <td class="px-2.5 py-2.5 text-center">
                <span class="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-300 border border-slate-700/80">
                  L{{ v.pelajaran }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty Filter State -->
      <div v-if="filteredVerbs.length === 0" class="py-14 text-center text-slate-400 text-sm">
        Tidak ada kata kerja yang cocok dengan filter atau kata pencarian.
      </div>
    </div>
  </div>
</template>
