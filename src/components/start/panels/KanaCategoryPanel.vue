<script setup lang="ts">
import { computed } from 'vue';

export type KanaCategoryType = 'all' | 'basic' | 'dakuten' | 'combination';

const props = defineProps<{
  characterType: string;
  modelValue: KanaCategoryType;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: KanaCategoryType): void;
  (e: 'interact'): void;
}>();

const kanaCategoryOptions = [
  { key: 'all', label: 'Semua', badge: '✨', desc: 'Semua variasi huruf' },
  { key: 'basic', label: 'Dasar', badge: 'あ', desc: '46 huruf dasar (seion)' },
  { key: 'dakuten', label: 'Dakuten', badge: 'が', desc: '25 huruf ga, za, da, ba, pa' },
  { key: 'combination', label: 'Kombinasi', badge: 'きゃ', desc: '33/36 huruf gabungan (youon)' },
] as const;

const selectedCategoryDesc = computed(() => {
  const opt = kanaCategoryOptions.find(o => o.key === props.modelValue);
  return opt ? opt.desc : 'Semua variasi huruf';
});

const selectCategory = (key: KanaCategoryType) => {
  emit('interact');
  emit('update:modelValue', key);
};
</script>

<template>
  <div class="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 rounded-2xl p-3 sm:p-3.5 flex flex-col gap-2 w-full animate-fadeIn">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
          {{ modelValue === 'all' ? '✨' : (modelValue === 'basic' ? 'あ' : (modelValue === 'dakuten' ? 'が' : 'きゃ')) }}
        </div>
        <div>
          <div class="text-xs font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>Kategori Huruf:</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
              {{ characterType === 'hiragana' ? 'Hiragana' : (characterType === 'katakana' ? 'Katakana' : 'Mix Kana') }}
            </span>
          </div>
          <div class="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
            {{ selectedCategoryDesc }}
          </div>
        </div>
      </div>
    </div>

    <!-- 4 Category Filter Pills -->
    <div class="grid grid-cols-4 gap-1.5 pt-0.5">
      <button
        v-for="cat in kanaCategoryOptions"
        :key="cat.key"
        type="button"
        @click.stop="selectCategory(cat.key)"
        :class="[
          'py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer border flex flex-col sm:flex-row items-center justify-center gap-1 shadow-2xs',
          modelValue === cat.key
            ? 'bg-indigo-600 text-white border-indigo-500 font-black shadow-xs scale-[1.02]'
            : 'bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border-gray-200/80 dark:border-slate-700/80'
        ]"
      >
        <span class="font-jp text-xs opacity-90">{{ cat.badge }}</span>
        <span class="text-[11px] sm:text-xs truncate">{{ cat.label }}</span>
      </button>
    </div>
  </div>
</template>
