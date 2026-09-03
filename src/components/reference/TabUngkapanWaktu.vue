<script setup lang="ts">
import { ref, computed } from 'vue';
import type { UngkapanWaktuData } from '../../types/reference';
import { Clock, Calendar, Search, AlertTriangle } from '@lucide/vue';

const props = defineProps<{
  data: UngkapanWaktuData;
}>();

const activeSubTab = ref<'kalender' | 'durasi'>('kalender');
const searchQuery = ref('');

// Irregular duration highlights
const isDurationIrregular = (type: string, val: number | string) => {
  if (type === 'jam' && val === 4) return true;
  if (type === 'hari' && (val === 2 || val === 1)) return true;
  if (type === 'bulan' && (val === 6)) return true;
  if (type === 'tahun' && (val === 4)) return true;
  return false;
};

// Search filter for Calendar entries
const searchMatchesCalendar = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return null;

  const result: { group: string; japanese: string; meaning: string }[] = [];
  const groups = ['hari', 'pagi', 'malam', 'minggu', 'bulan', 'tahun'] as const;
  for (const g of groups) {
    for (const item of props.data.kalender[g]) {
      if (item.japanese.toLowerCase().includes(q) || item.meaning.toLowerCase().includes(q)) {
        result.push({ group: g, japanese: item.japanese, meaning: item.meaning });
      }
    }
  }
  return result;
});

// Search filter for Duration entries
const searchMatchesDuration = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return null;

  const result: { group: string; value: string | number; japanese: string }[] = [];
  props.data.durasi.jam_menit.jam.forEach(j => {
    if (String(j.value).includes(q) || j.japanese.toLowerCase().includes(q)) {
      result.push({ group: 'jam', value: j.value, japanese: j.japanese });
    }
  });
  props.data.durasi.jam_menit.menit.forEach(m => {
    if (String(m.value).includes(q) || m.japanese.toLowerCase().includes(q)) {
      result.push({ group: 'menit', value: m.value, japanese: m.japanese });
    }
  });
  const jangkaKeys = ['hari', 'minggu', 'bulan', 'tahun'] as const;
  for (const k of jangkaKeys) {
    props.data.durasi.jangka_waktu[k].forEach(item => {
      if (String(item.value).includes(q) || item.japanese.toLowerCase().includes(q)) {
        result.push({ group: k, value: item.value, japanese: item.japanese });
      }
    });
  }
  return result;
});
</script>

<template>
  <div class="space-y-6 animate-fadeIn text-slate-100">
    <!-- Header & Subtab Switcher -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800/80">
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <div class="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
          <Clock class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm sm:text-base font-bold text-white">Ungkapan Waktu (時 / 日 / 間)</h3>
          <p class="text-xs text-slate-400">Kalender relatif dan durasi jangka waktu</p>
        </div>
      </div>

      <!-- Search & Sub-tabs Group -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-between">
        <!-- Sub-tabs -->
        <div class="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button 
            @click="activeSubTab = 'kalender'"
            :class="[
              'px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5',
              activeSubTab === 'kalender' 
                ? 'bg-cyan-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            <Calendar class="w-3.5 h-3.5" />
            <span>Kalender</span>
          </button>
          <button 
            @click="activeSubTab = 'durasi'"
            :class="[
              'px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5',
              activeSubTab === 'durasi' 
                ? 'bg-cyan-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            <Clock class="w-3.5 h-3.5" />
            <span>Durasi</span>
          </button>
        </div>

        <!-- Search Box -->
        <div class="relative w-full sm:w-56">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cari waktu..."
            class="w-full pl-9 pr-3.5 py-1.5 bg-slate-950/70 border border-slate-700/70 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/40 transition"
          />
        </div>
      </div>
    </div>

    <!-- Search Matches View -->
    <div v-if="searchQuery.trim()" class="space-y-4">
      <div class="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Hasil pencarian "{{ searchQuery }}":</span>
        <button @click="searchQuery = ''" class="text-cyan-400 hover:underline">Reset pencarian</button>
      </div>

      <div v-if="(searchMatchesCalendar?.length || 0) + (searchMatchesDuration?.length || 0) > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <!-- Calendar Results -->
        <div 
          v-for="(item, idx) in (searchMatchesCalendar || [])" 
          :key="'srch_cal_' + idx"
          class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
        >
          <div class="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span class="capitalize px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/60 font-semibold">{{ item.group }}</span>
            <span class="text-cyan-400 font-bold">Kalender</span>
          </div>
          <span class="text-base font-bold font-jp text-white">{{ item.japanese }}</span>
          <span class="text-xs text-slate-300 mt-1 italic">"{{ item.meaning }}"</span>
        </div>

        <!-- Duration Results -->
        <div 
          v-for="(item, idx) in (searchMatchesDuration || [])" 
          :key="'srch_dur_' + idx"
          class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
        >
          <div class="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span class="capitalize px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/60 font-semibold">{{ item.group }} ({{ item.value }})</span>
            <span class="text-amber-400 font-bold">Durasi</span>
          </div>
          <span class="text-base font-bold font-jp text-white">{{ item.japanese }}</span>
        </div>
      </div>

      <div v-else class="py-12 text-center text-slate-400 text-sm">
        Tidak ditemukan ungkapan waktu yang cocok dengan kata kunci "{{ searchQuery }}".
      </div>
    </div>

    <!-- SUB-TAB 1: KALENDER -->
    <div v-else-if="activeSubTab === 'kalender'" class="space-y-6">
      <!-- Tabel 1: Hari / Pagi / Malam (3 Kolom Berdampingan) -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-2 px-1">
          <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
          <h4 class="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
            1. Perubahan Harian: Hari, Pagi, Malam
          </h4>
        </div>

        <div class="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-extrabold border-b border-slate-800">
              <tr>
                <th class="px-4 py-3 text-cyan-300">Hari (日)</th>
                <th class="px-4 py-3 text-amber-300">Pagi (朝)</th>
                <th class="px-4 py-3 text-indigo-300">Malam (晩 / 夜)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr 
                v-for="i in 6" 
                :key="'row_day_' + i"
                class="hover:bg-slate-800/40 transition"
              >
                <!-- Hari -->
                <td class="px-4 py-3">
                  <div class="font-bold text-white font-jp text-sm sm:text-base">{{ data.kalender.hari[i-1]?.japanese }}</div>
                  <div class="text-[11px] sm:text-xs text-slate-400">{{ data.kalender.hari[i-1]?.meaning }}</div>
                </td>
                <!-- Pagi -->
                <td class="px-4 py-3">
                  <div class="font-bold text-white font-jp text-sm sm:text-base">{{ data.kalender.pagi[i-1]?.japanese }}</div>
                  <div class="text-[11px] sm:text-xs text-slate-400">{{ data.kalender.pagi[i-1]?.meaning }}</div>
                </td>
                <!-- Malam -->
                <td class="px-4 py-3">
                  <div class="font-bold text-white font-jp text-sm sm:text-base">{{ data.kalender.malam[i-1]?.japanese }}</div>
                  <div class="text-[11px] sm:text-xs text-slate-400">{{ data.kalender.malam[i-1]?.meaning }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tabel 2: Minggu / Bulan / Tahun (3 Kolom Berdampingan) -->
      <div class="space-y-2.5 pt-2">
        <div class="flex items-center gap-2 px-1">
          <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
          <h4 class="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
            2. Perubahan Periode: Minggu, Bulan, Tahun
          </h4>
        </div>

        <div class="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-extrabold border-b border-slate-800">
              <tr>
                <th class="px-4 py-3 text-violet-300">Minggu (週)</th>
                <th class="px-4 py-3 text-emerald-300">Bulan (月)</th>
                <th class="px-4 py-3 text-rose-300">Tahun (年)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr 
                v-for="i in 6" 
                :key="'row_period_' + i"
                class="hover:bg-slate-800/40 transition"
              >
                <!-- Minggu -->
                <td class="px-4 py-3">
                  <div class="font-bold text-white font-jp text-sm sm:text-base">{{ data.kalender.minggu[i-1]?.japanese }}</div>
                  <div class="text-[11px] sm:text-xs text-slate-400">{{ data.kalender.minggu[i-1]?.meaning }}</div>
                </td>
                <!-- Bulan -->
                <td class="px-4 py-3">
                  <div class="font-bold text-white font-jp text-sm sm:text-base">{{ data.kalender.bulan[i-1]?.japanese }}</div>
                  <div class="text-[11px] sm:text-xs text-slate-400">{{ data.kalender.bulan[i-1]?.meaning }}</div>
                </td>
                <!-- Tahun -->
                <td class="px-4 py-3">
                  <div class="font-bold text-white font-jp text-sm sm:text-base">{{ data.kalender.tahun[i-1]?.japanese }}</div>
                  <div class="text-[11px] sm:text-xs text-slate-400">{{ data.kalender.tahun[i-1]?.meaning }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 2: DURASI -->
    <div v-else-if="activeSubTab === 'durasi'" class="space-y-6">
      <!-- Tabel Jam & Menit Berdampingan -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Jam (時間) -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between px-1">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-400"></span>
              <h4 class="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">Durasi Jam (〜時間)</h4>
            </div>
            <span class="text-[11px] text-amber-400 font-medium">⚠️ 4 jam = よじかん</span>
          </div>

          <div class="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-slate-950/80 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th class="px-3 py-2.5 w-16">Nilai</th>
                  <th class="px-3 py-2.5">Pengucapan Jepang</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                <tr 
                  v-for="j in data.durasi.jam_menit.jam" 
                  :key="'jam_' + j.value"
                  :class="[
                    'hover:bg-slate-800/40 transition',
                    isDurationIrregular('jam', j.value) ? 'bg-amber-500/10' : ''
                  ]"
                >
                  <td class="px-3 py-2 font-bold text-slate-300">
                    {{ j.value === '?' ? 'Berapa?' : j.value + ' Jam' }}
                  </td>
                  <td class="px-3 py-2 font-bold font-jp text-sm sm:text-base text-white flex items-center gap-1.5">
                    <span>{{ j.japanese }}</span>
                    <span v-if="isDurationIrregular('jam', j.value)" class="text-[10px] px-1.5 bg-amber-500/20 text-amber-300 rounded font-bold">Khusus</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Menit (分) -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between px-1">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
              <h4 class="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">Durasi Menit (〜分)</h4>
            </div>
            <span class="text-[11px] text-slate-400">Pola 〜ふん / 〜ぷん</span>
          </div>

          <div class="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-slate-950/80 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th class="px-3 py-2.5 w-16">Nilai</th>
                  <th class="px-3 py-2.5">Pengucapan Jepang</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                <tr 
                  v-for="m in data.durasi.jam_menit.menit" 
                  :key="'menit_' + m.value"
                  class="hover:bg-slate-800/40 transition"
                >
                  <td class="px-3 py-2 font-bold text-slate-300">
                    {{ m.value === '?' ? 'Berapa?' : m.value + ' Menit' }}
                  </td>
                  <td class="px-3 py-2 font-bold font-jp text-sm sm:text-base text-white">
                    {{ m.japanese }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tabel Jangka Waktu (Hari, Minggu, Bulan, Tahun) -->
      <div class="space-y-2.5 pt-2">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <h4 class="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
              Jangka Waktu Hari, Minggu, Bulan, dan Tahun
            </h4>
          </div>
          <span class="text-[11px] text-amber-400 font-medium">⚠️ 1 hari = いちにち, 2 hari = ふつか, 4 th = よねん</span>
        </div>

        <div class="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-extrabold border-b border-slate-800">
              <tr>
                <th class="px-3 py-3 text-slate-400 w-16">Jangka</th>
                <th class="px-3 py-3 text-cyan-300">Hari (〜日間)</th>
                <th class="px-3 py-3 text-violet-300">Minggu (〜週間)</th>
                <th class="px-3 py-3 text-emerald-300">Bulan (〜ヶ月間)</th>
                <th class="px-3 py-3 text-amber-300">Tahun (〜年間)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr 
                v-for="idx in 11" 
                :key="'jangka_row_' + idx"
                class="hover:bg-slate-800/40 transition"
              >
                <!-- Label / Value -->
                <td class="px-3 py-2 font-black text-slate-400">
                  {{ idx <= 10 ? idx : '?' }}
                </td>
                <!-- Hari -->
                <td class="px-3 py-2">
                  <div class="font-bold text-white font-jp text-sm sm:text-base">
                    {{ data.durasi.jangka_waktu.hari[idx-1]?.japanese }}
                  </div>
                </td>
                <!-- Minggu -->
                <td class="px-3 py-2">
                  <div class="font-bold text-white font-jp text-sm sm:text-base">
                    {{ data.durasi.jangka_waktu.minggu[idx-1]?.japanese }}
                  </div>
                </td>
                <!-- Bulan -->
                <td class="px-3 py-2">
                  <div class="font-bold text-white font-jp text-sm sm:text-base">
                    {{ data.durasi.jangka_waktu.bulan[idx-1]?.japanese }}
                  </div>
                </td>
                <!-- Tahun -->
                <td class="px-3 py-2">
                  <div class="font-bold text-white font-jp text-sm sm:text-base">
                    {{ data.durasi.jangka_waktu.tahun[idx-1]?.japanese }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Irregular Pattern Warning / Info Box -->
    <div v-if="data.durasi.note_irregular" class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs sm:text-sm text-amber-200">
      <AlertTriangle class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div class="space-y-1">
        <span class="font-extrabold text-amber-300 block">Catatan Pola Khusus Durasi:</span>
        <p class="leading-relaxed text-amber-200/90">{{ data.durasi.note_irregular }}</p>
      </div>
    </div>
  </div>
</template>
