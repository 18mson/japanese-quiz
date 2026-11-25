<script setup lang="ts">
import { computed } from 'vue';
import { Volume2, VolumeX } from '@lucide/vue';
import { useTextToSpeech } from '../composables/useTextToSpeech';

const props = withDefaults(
  defineProps<{
    text: string;
    size?: 'sm' | 'md';
    customClass?: string;
  }>(),
  {
    size: 'md',
    customClass: ''
  }
);

const { isCurrentTextSpeaking, isSupported, speak, stop } = useTextToSpeech();

const isPlaying = computed(() => isCurrentTextSpeaking(props.text));
const isAvailable = computed(() => isSupported.value);

const handleClick = (e: MouseEvent) => {
  e.stopPropagation();
  if (!isAvailable.value) return;

  if (isPlaying.value) {
    stop();
  } else {
    speak(props.text);
  }
};
</script>

<template>
  <!-- Unavailable State -->
  <button
    v-if="!isAvailable"
    type="button"
    disabled
    :title="'Suara tidak tersedia di perangkat ini'"
    :class="[
      'inline-flex items-center justify-center rounded-xl transition cursor-not-allowed opacity-40 bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/30 flex-shrink-0 select-none',
      size === 'sm' ? 'w-6 h-6 p-1 text-xs' : 'w-8 h-8 p-1.5 text-sm',
      customClass
    ]"
    aria-label="Suara tidak tersedia"
  >
    <VolumeX :class="size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'" />
  </button>

  <!-- Active / Playing State -->
  <button
    v-else-if="isPlaying"
    type="button"
    @click="handleClick"
    title="Hentikan Suara"
    :class="[
      'relative inline-flex items-center justify-center rounded-xl transition cursor-pointer flex-shrink-0 select-none focus-visible:ring-2 focus-visible:ring-indigo-500',
      'bg-indigo-100 dark:bg-torii/25 border border-indigo-600 dark:border-torii text-indigo-800 dark:text-torii-light ring-2 ring-indigo-400/40 dark:ring-torii/40 active:scale-95',
      size === 'sm' ? 'w-9 h-9 p-1.5' : 'w-10 h-10 p-2',
      customClass
    ]"
    aria-label="Hentikan suara"
  >
    <Volume2 :class="[size === 'sm' ? 'w-4 h-4' : 'w-4 h-4', 'text-indigo-700 dark:text-torii-light relative z-10']" aria-hidden="true" />
  </button>

  <!-- Idle State -->
  <button
    v-else
    type="button"
    @click="handleClick"
    title="Dengarkan Pengucapan"
    :class="[
      'inline-flex items-center justify-center rounded-xl transition cursor-pointer flex-shrink-0 select-none focus-visible:ring-2 focus-visible:ring-indigo-500',
      'bg-slate-100 hover:bg-indigo-50 active:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-700 hover:text-indigo-800 dark:text-slate-200 dark:hover:text-torii-light border border-slate-200 dark:border-slate-700 active:scale-95',
      size === 'sm' ? 'w-9 h-9 p-1.5' : 'w-10 h-10 p-2',
      customClass
    ]"
    aria-label="Dengarkan pengucapan"
  >
    <Volume2 :class="size === 'sm' ? 'w-4 h-4' : 'w-4 h-4'" aria-hidden="true" />
  </button>
</template>
