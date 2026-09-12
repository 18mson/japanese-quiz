<script setup lang="ts">
import type { CounterCategoryItem } from '../../types/reference';
import { ChevronDown, ChevronUp } from '@lucide/vue';
import SpeakerButton from '../SpeakerButton.vue';
import { useTextToSpeech } from '../../composables/useTextToSpeech';

defineProps<{
  cat: CounterCategoryItem;
  isExpanded: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle'): void;
}>();

const { speak } = useTextToSpeech();

// Sound changes to highlight: sokuon (っ) or voiced rendaku (ば, び, ぶ, べ, ぼ, が, ぎ, ぐ, げ, ご, ざ, じ, ず, ぜ, ぞ)
const hasSoundChange = (valStr: string) => {
  return valStr.includes('っ') || valStr.includes('ば') || valStr.includes('び') || valStr.includes('が') || valStr.includes('ぞ');
};

const handleRowClick = (text: string) => {
  if (text) {
    speak(text);
  }
};
</script>

<template>
  <div 
    class="bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-gray-300 dark:hover:border-slate-700/80 transition-all duration-200 shadow-xs flex flex-col h-fit"
  >
    <!-- Card Header (Always Visible & Clickable) -->
    <button 
      type="button"
      @click="emit('toggle')"
      class="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-800/40 transition cursor-pointer select-none"
    >
      <div class="flex items-center gap-3 min-w-0">
        <!-- Counter Kanji Badge -->
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/10 to-indigo-600/15 dark:from-violet-600/20 dark:to-indigo-600/20 border border-violet-500/20 dark:border-violet-500/30 flex flex-col items-center justify-center text-center shrink-0 shadow-inner">
          <span class="text-xl font-black font-jp text-violet-700 dark:text-amber-300 leading-none">{{ cat.counter }}</span>
          <span class="text-[10px] font-bold text-gray-500 dark:text-slate-400 font-jp leading-tight mt-0.5">{{ cat.counter_reading }}</span>
        </div>

        <!-- Info & Speaker -->
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="text-sm sm:text-base font-bold text-gray-900 dark:text-white capitalize truncate">{{ cat.category }}</h4>
            <div @click.stop>
              <SpeakerButton :text="cat.counter_reading || cat.counter" size="sm" />
            </div>
          </div>
          <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">
            Contoh: <strong class="text-gray-700 dark:text-slate-300 font-medium">{{ cat.usage_example }}</strong>
          </p>
        </div>
      </div>

      <!-- Toggle Button & Indicator -->
      <div class="flex items-center gap-2 shrink-0 ml-2">
        <span class="text-[11px] text-violet-600 dark:text-violet-400 font-bold hidden sm:inline">
          {{ isExpanded ? 'Tutup' : 'Lihat' }}
        </span>
        <div class="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400 transition group-hover:text-gray-900 dark:group-hover:text-white">
          <ChevronUp v-if="isExpanded" class="w-4 h-4" />
          <ChevronDown v-else class="w-4 h-4" />
        </div>
      </div>
    </button>

    <!-- Expandable Values Table -->
    <div 
      v-if="isExpanded" 
      class="px-4 sm:px-5 pb-4 pt-1 border-t border-gray-100 dark:border-slate-800/60 animate-fadeIn space-y-3"
    >
      <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800/80 bg-gray-50/70 dark:bg-slate-950/60 shadow-inner">
        <table class="w-full text-left text-xs sm:text-sm">
          <thead class="bg-gray-100/90 dark:bg-slate-900/90 text-gray-500 dark:text-slate-400 text-[11px] uppercase border-b border-gray-200 dark:border-slate-800">
            <tr>
              <th class="px-3 py-2 w-14 text-cyan-700 dark:text-cyan-300 font-bold">Angka</th>
              <th class="px-3 py-2 text-amber-700 dark:text-amber-300 font-bold">Pengucapan</th>
              <th class="px-3 py-2 text-right text-gray-500 dark:text-slate-400 font-bold">Catatan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200/80 dark:divide-slate-800/50">
            <tr 
              v-for="val in cat.values" 
              :key="cat.category + '_' + val.value"
              @click="handleRowClick(val.japanese)"
              :class="[
                'hover:bg-gray-100/70 dark:hover:bg-slate-800/40 transition cursor-pointer group',
                hasSoundChange(val.japanese) ? 'bg-amber-500/10 dark:bg-amber-500/5 hover:bg-amber-500/15' : ''
              ]"
            >
              <td class="px-3 py-1.5 font-bold text-gray-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-300">
                {{ val.value }}
              </td>
              <td class="px-3 py-1.5 font-bold font-jp text-gray-900 dark:text-white text-sm sm:text-base group-hover:text-amber-600 dark:group-hover:text-amber-200">
                <div class="flex items-center gap-1.5">
                  <span>{{ val.japanese }}</span>
                  <div @click.stop>
                    <SpeakerButton :text="val.japanese" size="sm" />
                  </div>
                </div>
              </td>
              <td class="px-3 py-1.5 text-right">
                <span 
                  v-if="val.value === 20"
                  class="text-[10px] px-1.5 py-0.5 rounded font-black bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30"
                >
                  Bentuk Khusus
                </span>
                <span 
                  v-else-if="hasSoundChange(val.japanese)"
                  class="text-[10px] px-1.5 py-0.5 rounded font-black bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30"
                >
                  Pola Bunyi
                </span>
                <span v-else-if="val.value === '?'" class="text-[10px] px-1.5 py-0.5 rounded font-black bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
                  Tanya
                </span>
                <span v-else class="text-[11px] text-gray-400 dark:text-slate-500 font-medium">Normal</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Formula Guide for Combined Ages (21-99) -->
      <div v-if="cat.category === 'usia dan umur'" class="p-3 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30 text-xs text-violet-900 dark:text-violet-200 space-y-1.5">
        <div class="font-bold text-violet-800 dark:text-violet-300 flex items-center gap-1.5">
          <span>💡 Rumus Umur Gabungan (21–99 Tahun):</span>
        </div>
        <p class="leading-relaxed text-gray-700 dark:text-slate-300">
          Pola umum: <code class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 font-bold border border-violet-100 dark:border-slate-700">[Puluhan] + [Satuan 1–9]</code>
        </p>
        <ul class="list-disc list-inside space-y-0.5 text-[11px] text-gray-600 dark:text-slate-400 pl-1">
          <li>Berakhiran <strong>1</strong> ➔ selalu menjadi <span class="text-amber-700 dark:text-amber-300 font-jp font-bold">〜いっさい</span> (misal 21: にじゅういっさい, 31: さんじゅういっさい)</li>
          <li>Berakhiran <strong>8</strong> ➔ selalu menjadi <span class="text-amber-700 dark:text-amber-300 font-jp font-bold">〜はっさい</span> (misal 28: にじゅうはっさい, 38: さんじゅうはっさい)</li>
          <li>Kelipatan <strong>10</strong> ➔ selalu berakhiran <span class="text-amber-700 dark:text-amber-300 font-jp font-bold">〜じゅっさい</span> (30: さんじゅっさい, 40: よんじゅっさい, dst.)</li>
          <li>Pengecualian khusus hanya <strong>20 tahun = はたち (hatachi)</strong> dan <strong>100 tahun = ひゃくさい (hyakusai)</strong>.</li>
        </ul>
      </div>
    </div>
  </div>
</template>
