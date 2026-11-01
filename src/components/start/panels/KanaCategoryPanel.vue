<script setup lang="ts">
import { Sparkles } from '@lucide/vue';

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
  { key: 'all' as const, label: 'Semua' },
  { key: 'basic' as const, label: 'Dasar' },
  { key: 'dakuten' as const, label: 'Dakuten' },
  { key: 'combination' as const, label: 'Kombinasi' },
];

const getCategoryBadge = (catKey: KanaCategoryType) => {
  if (catKey === 'all') return '全';
  if (props.characterType === 'katakana') {
    if (catKey === 'basic') return 'ア';
    if (catKey === 'dakuten') return 'ガ';
    if (catKey === 'combination') return 'キャ';
  }
  if (catKey === 'basic') return 'あ';
  if (catKey === 'dakuten') return 'が';
  return 'きゃ';
};

const selectCategory = (key: KanaCategoryType) => {
  emit('interact');
  emit('update:modelValue', key);
};
</script>

<template>
  <!-- 4 Category Filter Pills (Tanpa Border/Header Atas, Bersih & Langsung) -->
  <div class="grid grid-cols-4 gap-1.5 pt-1 w-full animate-fadeIn">
    <button
      v-for="cat in kanaCategoryOptions"
      :key="cat.key"
      type="button"
      @click.stop="selectCategory(cat.key)"
      :class="[
        'py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer border flex flex-col sm:flex-row items-center justify-center gap-1 shadow-2xs',
        modelValue === cat.key
          ? 'bg-aizome dark:bg-torii text-white border-aizome dark:border-torii font-black shadow-xs scale-[1.02]'
          : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200/90 dark:border-slate-700/80'
      ]"
    >
      <Sparkles v-if="cat.key === 'all'" class="w-3.5 h-3.5 shrink-0 opacity-90" />
      <span v-else class="font-jp text-xs opacity-90 font-bold">{{ getCategoryBadge(cat.key) }}</span>
      <span class="text-[11px] sm:text-xs truncate">{{ cat.label }}</span>
    </button>
  </div>
</template>
