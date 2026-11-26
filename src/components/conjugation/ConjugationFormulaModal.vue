<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { X, BookOpen, AlertTriangle, CheckCircle2 } from '@lucide/vue';
import type { ConjugationQuestion } from '../../stores/conjugationQuizStore';
import { buildConjugationExplanation } from '../../utils/conjugationExplanation';

const props = defineProps<{
  isOpen: boolean;
  question: ConjugationQuestion | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const explanation = computed(() => {
  if (!props.question) return null;
  return buildConjugationExplanation({
    category: props.question.category,
    baseWord: props.question.baseWord,
    baseReading: props.question.baseReading,
    targetFormKey: props.question.targetFormKey,
    correctAnswer: props.question.correctAnswer,
    verbGroup: props.question.verbGroup,
    adjType: props.question.adjType,
    lesson: props.question.lesson
  });
});

function handleKeyDown(e: KeyboardEvent) {
  if (props.isOpen && e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    emit('close');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && question && explanation"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="conjugation-formula-modal-title"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-2xl max-h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 shrink-0">
          <div class="flex items-start gap-3 min-w-0">
            <span class="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen class="w-5 h-5" aria-hidden="true" />
            </span>
            <div class="min-w-0">
              <h3 id="conjugation-formula-modal-title" class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                Penjelasan & Rumus Konjugasi
              </h3>
              <div class="flex flex-wrap items-center gap-2 mt-1">
                <span class="text-xs font-bold text-amber-700 dark:text-amber-300">
                  {{ question.targetFormLabel }}
                </span>
                <span class="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  {{ explanation.lessonRef }}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            @click="emit('close')"
            class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            aria-label="Tutup penjelasan rumus"
          >
            <X class="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 overflow-y-auto space-y-5 text-sm">
          <!-- Specific Rule Breakdown for this Question -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80 dark:border-slate-800">
              <div class="flex items-center gap-2 font-jp">
                <span class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {{ question.baseWord }}
                </span>
                <span v-if="question.baseReading && question.baseReading !== question.baseWord" class="text-xs text-slate-500 dark:text-slate-400">
                  ({{ question.baseReading }})
                </span>
                <span class="text-slate-400">→</span>
                <span class="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-300">
                  {{ question.correctAnswer }}
                </span>
              </div>
              <span class="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60">
                {{ explanation.groupLabel }}
              </span>
            </div>

            <div class="space-y-1.5">
              <div class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Rumus yang Berlaku
              </div>
              <p class="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-slate-100">
                {{ explanation.specificRule }}
              </p>
              <code class="inline-block px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-jp font-bold text-sm text-amber-700 dark:text-amber-300">
                {{ explanation.stepByStep }}
              </code>
            </div>

            <!-- Special Note / Exception Warning -->
            <div
              v-if="explanation.specialNote"
              class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5 text-xs sm:text-sm text-amber-900 dark:text-amber-200"
            >
              <AlertTriangle class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
              <p class="leading-relaxed">{{ explanation.specialNote }}</p>
            </div>
          </div>

          <!-- Reference Table -->
          <div class="space-y-2.5">
            <h4 class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">
              {{ explanation.tableTitle }}
            </h4>
            <div class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table class="w-full text-left text-xs sm:text-sm">
                <thead class="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th class="px-3.5 py-2.5">Kelompok / Jenis</th>
                    <th class="px-3.5 py-2.5">Aturan</th>
                    <th class="px-3.5 py-2.5">Contoh</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/70">
                  <tr
                    v-for="(row, idx) in explanation.tableRows"
                    :key="idx"
                    :class="row.isMatched
                      ? 'bg-amber-50/90 dark:bg-amber-950/35 text-slate-900 dark:text-white font-semibold'
                      : 'bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'"
                  >
                    <td class="px-3.5 py-2.5 font-bold whitespace-nowrap">
                      <span class="inline-flex items-center gap-1.5">
                        <CheckCircle2
                          v-if="row.isMatched"
                          class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{{ row.group }}</span>
                      </span>
                    </td>
                    <td class="px-3.5 py-2.5">{{ row.rule }}</td>
                    <td class="px-3.5 py-2.5 font-jp whitespace-nowrap">{{ row.example }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0 bg-slate-50/60 dark:bg-slate-950/40">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-bold hover:opacity-90 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
