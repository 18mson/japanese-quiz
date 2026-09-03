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

const { isCurrentTextSpeaking, isSupported, hasJapaneseVoice, speak, stop } = useTextToSpeech();

const isPlaying = computed(() => isCurrentTextSpeaking(props.text));
const isAvailable = computed(() => isSupported.value && hasJapaneseVoice.value);

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
      'relative inline-flex items-center justify-center rounded-xl transition cursor-pointer flex-shrink-0 select-none',
      'bg-indigo-100 dark:bg-indigo-500/30 border border-indigo-500 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-400/50 shadow-md shadow-indigo-500/20 active:scale-95',
      size === 'sm' ? 'w-6 h-6 p-1' : 'w-8 h-8 p-1.5',
      customClass
    ]"
    aria-label="Hentikan suara"
  >
    <!-- Ripple animation ring -->
    <span class="absolute -inset-0.5 rounded-xl bg-indigo-400/30 animate-ping pointer-events-none"></span>
    <Volume2 :class="[size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4', 'animate-pulse text-indigo-700 dark:text-indigo-300 relative z-10']" />
  </button>

  <!-- Idle State -->
  <button
    v-else
    type="button"
    @click="handleClick"
    title="Dengarkan Pengucapan"
    :class="[
      'inline-flex items-center justify-center rounded-xl transition cursor-pointer flex-shrink-0 select-none',
      'bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/30 dark:active:bg-indigo-500/40 text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200 border border-indigo-200 dark:border-indigo-500/25 shadow-xs active:scale-95',
      size === 'sm' ? 'w-6 h-6 p-1' : 'w-8 h-8 p-1.5',
      customClass
    ]"
    aria-label="Dengarkan pengucapan"
  >
    <Volume2 :class="size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'" />
  </button>
</template>
