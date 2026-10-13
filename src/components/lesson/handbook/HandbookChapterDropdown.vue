<script setup lang="ts">
import { BookOpen, X } from '@lucide/vue';
import { lessonGrammarBookData } from '../../../data/lessonGrammarBook';

defineProps<{
  isOpen: boolean;
  currentLessonNumber: number;
}>();

const emit = defineEmits<{
  (e: 'select', num: number): void;
  (e: 'close'): void;
}>();
</script>

<template>
  <!-- Dropdown Chapter Picker Grid (Muncul ke bawah tepat di bawah header) -->
  <Transition name="dropdown-slide">
    <div
      v-if="isOpen"
      class="fixed sm:absolute top-[59px] left-1/2 -translate-x-1/2 w-[calc(100vw-16px)] sm:w-[500px] max-w-lg bg-white dark:bg-slate-900 border border-gray-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-2xl z-50 flex flex-col max-h-[calc(100vh-76px)] sm:max-h-[520px] text-slate-900 dark:text-slate-100"
    >
      <div class="flex items-center justify-between pb-2.5 border-b border-gray-200/80 dark:border-slate-800 mb-2.5">
        <div class="flex items-center gap-2">
          <BookOpen class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 class="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">Pilih Bab Pelajaran (1 - 25)</h3>
        </div>
        <button
          type="button"
          @click="emit('close')"
          class="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center justify-center cursor-pointer active:scale-95 transition"
          title="Tutup"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Chapter Grid 1-25 -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 overflow-y-auto pr-1 flex-1">
        <button
          v-for="ch in lessonGrammarBookData"
          :key="ch.lessonNumber"
          type="button"
          @click="emit('select', ch.lessonNumber)"
          :class="[
            'p-2 sm:p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 cursor-pointer active:scale-95',
            currentLessonNumber === ch.lessonNumber
              ? 'bg-indigo-50 dark:bg-indigo-600/25 border-indigo-400 dark:border-indigo-500 text-indigo-700 dark:text-indigo-200 ring-2 ring-indigo-400/40 shadow-xs'
              : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-750'
          ]"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-black font-jp text-torii">第{{ ch.lessonNumber }}課</span>
            <span class="text-[10px] font-bold text-slate-400">Bab {{ ch.lessonNumber }}</span>
          </div>
          <div class="text-[11px] font-medium text-slate-600 dark:text-slate-300 line-clamp-1 truncate">
            {{ ch.title.split(':')[1]?.trim() || ch.title }}
          </div>
        </button>
      </div>
    </div>
  </Transition>

  <!-- BACKDROP GELAP UNTUK DROPDOWN BAB (Hanya menggelapkan halaman di bawah header, header tetap terang) -->
  <Transition name="fade-overlay">
    <div
      v-if="isOpen"
      class="fixed inset-x-0 bottom-0 top-[59px] z-30 bg-slate-950/50 dark:bg-slate-950/70 backdrop-blur-xs cursor-pointer"
      @click="emit('close')"
    />
  </Transition>
</template>

<style scoped>
.dropdown-slide-enter-active,
.dropdown-slide-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-slide-enter-from,
.dropdown-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px) scale(0.97);
}
.dropdown-slide-enter-to,
.dropdown-slide-leave-from {
  opacity: 1;
  transform: translate(-50%, 0) scale(1);
}

.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.25s ease;
}
.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}
</style>
