<script setup lang="ts">
// src/components/battleground/BattlegroundAvatar.vue
import { ref, computed } from 'vue';

const props = withDefaults(
  defineProps<{
    seed?: string | null;
    name: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    customClass?: string;
    borderClass?: string;
  }>(),
  {
    seed: null,
    size: 'sm',
    customClass: '',
    borderClass: '',
  }
);

const imgError = ref(false);

const sizeClasses = {
  xs: 'w-6 h-6 rounded-md text-[9px]',
  sm: 'w-8 h-8 rounded-lg text-xs',
  md: 'w-10 h-10 rounded-xl text-sm',
  lg: 'w-12 h-12 rounded-xl text-base',
  xl: 'w-14 h-14 rounded-2xl text-lg',
};

const avatarUrl = computed(() => {
  const base = props.seed || props.name.replace(/^[\p{Emoji}\p{Symbol}\s]+/gu, '').trim() || props.name || 'player';
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(base)}`;
});

const initials = computed(() => {
  if (!props.name) return '??';
  const clean = props.name.replace(/^[\p{Emoji}\p{Symbol}\s\-_()]+/gu, '').trim();
  const source = clean.length > 0 ? clean : props.name;
  return source.slice(0, 2).toUpperCase();
});

const bgColor = computed(() => {
  const code = (props.name || '?').charCodeAt(0) || 65;
  return `hsl(${(code * 47) % 360}, 60%, 40%)`;
});
</script>

<template>
  <div
    :class="[
      customClass || sizeClasses[size],
      borderClass || 'border border-white/20',
      'relative flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md select-none bg-slate-800'
    ]"
  >
    <!-- DiceBear Bottts SVG Avatar (Mode Online Quiz) -->
    <img
      v-if="!imgError"
      :src="avatarUrl"
      :alt="name"
      class="w-full h-full object-cover"
      loading="lazy"
      @error="imgError = true"
    />

    <!-- Fallback Inisial Nama Bersih -->
    <div
      v-else
      class="w-full h-full flex items-center justify-center font-black text-white"
      :style="{ background: bgColor }"
    >
      <span>{{ initials }}</span>
    </div>
  </div>
</template>
