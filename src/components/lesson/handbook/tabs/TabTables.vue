<script setup lang="ts">
import { Table2 } from '@lucide/vue';
import type { LessonGrammarChapter } from '../../../../data/lessonGrammarBook';

defineProps<{
  tables?: LessonGrammarChapter['tables'];
}>();
</script>

<template>
  <section class="flex flex-col gap-6">
    <div v-if="!tables || tables.length === 0" class="py-12 px-4 text-center bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-300">
      <Table2 class="w-8 h-8 mx-auto mb-2 opacity-60" aria-hidden="true" />
      <p class="text-sm font-bold text-slate-800 dark:text-slate-100">Tidak ada lampiran khusus untuk bab ini.</p>
      <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Bab ini berfokus pada pola kalimat utama dan partikel tanpa tabel referensi khusus.</p>
    </div>

    <div
      v-else
      v-for="(tbl, tIdx) in tables"
      :key="tIdx"
      class="bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4"
    >
      <div>
        <h3 class="text-base sm:text-lg font-bold text-indigo-800 dark:text-indigo-200">{{ tbl.title }}</h3>
        <p v-if="tbl.description" class="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{{ tbl.description }}</p>
      </div>

      <div class="max-h-[62vh] overflow-auto rounded-xl border border-gray-200 dark:border-slate-800">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10">
            <tr>
              <th v-for="col in tbl.columns" :key="col.key" scope="col" class="px-4 py-3 whitespace-nowrap">
                {{ col.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-800/70">
            <tr
              v-for="(row, rIdx) in tbl.rows"
              :key="rIdx"
              class="odd:bg-white even:bg-slate-50/50 dark:odd:bg-slate-850 dark:even:bg-slate-900/40 hover:bg-indigo-50/40 dark:hover:bg-slate-800/60 transition-colors"
            >
              <td v-for="col in tbl.columns" :key="col.key" class="px-4 py-3 text-slate-800 dark:text-slate-100 leading-relaxed">
                {{ row[col.key] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
