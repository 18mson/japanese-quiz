<script setup lang="ts">
import { computed } from 'vue';
import { BookOpen } from '@lucide/vue';

export type KotobaSubModeType = 'words' | 'words_meaning' | 'meaning_to_words';

const props = defineProps<{
  modelValue: KotobaSubModeType;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: KotobaSubModeType): void;
  (e: 'interact'): void;
}>();

const options = [
  {
    key: 'words' as const,
    label: 'Jepang → Romaji',
    desc: 'Soal tulisan Jepang — ketik romaji'
  },
  {
    key: 'words_meaning' as const,
    label: 'Jepang → Arti',
    desc: 'Soal tulisan Jepang — ketik arti bahasa Indonesia'
  },
  {
    key: 'meaning_to_words' as const,
    label: 'Arti → Jepang',
    desc: 'Soal arti Indonesia — ketik Kanji, Kana, atau Romaji'
  }
] as const;

const selectedDesc = computed(() => {
  const opt = options.find(o => o.key === props.modelValue);
  return opt ? opt.desc : 'Pilih jenis kuis kosakata';
});

const selectMode = (key: KotobaSubModeType) => {
  emit('interact');
  emit('update:modelValue', key);
};
</script>

<template>
  <div class="bg-slate-50/80 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 flex flex-col gap-2 w-full animate-fadeIn">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-7 h-7 rounded-lg bg-aizome dark:bg-amber-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
          <BookOpen class="w-3.5 h-3.5" />
        </div>
        <div>
          <div class="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>Sub-menu Kotoba:</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-aizome/10 dark:bg-slate-800 text-aizome dark:text-amber-400 border border-aizome/15 dark:border-slate-700">
              {{ options.find(o => o.key === modelValue)?.label || 'Kotoba' }}
            </span>
          </div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {{ selectedDesc }}
          </div>
        </div>
      </div>
    </div>

    <!-- 3 Sub-menu Selector Pills -->
    <div class="grid grid-cols-3 gap-1.5 pt-0.5">
      <button
        v-for="opt in options"
        :key="opt.key"
        type="button"
        @click.stop="selectMode(opt.key)"
        :class="[
          'py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer border flex flex-col sm:flex-row items-center justify-center gap-1 shadow-2xs',
          modelValue === opt.key
            ? 'bg-aizome dark:bg-torii text-white border-aizome dark:border-torii font-black shadow-xs scale-[1.02]'
            : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200/90 dark:border-slate-700/80'
        ]"
      >
        <span class="text-[11px] sm:text-xs truncate text-center">{{ opt.label }}</span>
      </button>
    </div>
  </div>
</template>

