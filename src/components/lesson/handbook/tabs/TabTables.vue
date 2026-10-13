<script setup lang="ts">
import type { LessonGrammarChapter } from '../../../../data/lessonGrammarBook';

defineProps<{
  tables?: LessonGrammarChapter['tables'];
}>();
</script>

<template>
  <section class="flex flex-col gap-6">
    <div
      v-for="(tbl, tIdx) in tables"
      :key="tIdx"
      class="bg-white dark:bg-slate-850/90 border border-gray-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs dark:shadow-md flex flex-col gap-3"
    >
      <div>
        <h3 class="text-base font-black text-cyan-700 dark:text-cyan-300">{{ tbl.title }}</h3>
        <p v-if="tbl.description" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ tbl.description }}</p>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-800">
        <table class="w-full text-left text-xs">
          <thead class="bg-gray-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-gray-200 dark:border-slate-800">
            <tr>
              <th v-for="col in tbl.columns" :key="col.key" class="p-3">
                {{ col.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-800/60 font-medium">
            <tr v-for="(row, rIdx) in tbl.rows" :key="rIdx" class="hover:bg-gray-50/80 dark:hover:bg-slate-850/50">
              <td v-for="col in tbl.columns" :key="col.key" class="p-3 text-slate-800 dark:text-slate-200">
                {{ row[col.key] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
