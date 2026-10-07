<script setup lang="ts">
import { computed } from 'vue';
import { parseFuriganaSegments } from '../../utils/furiganaParser';

const props = withDefaults(
  defineProps<{
    text: string;
    showFurigana?: boolean;
    customClass?: string;
    rtClass?: string;
  }>(),
  {
    showFurigana: true,
    customClass: '',
    rtClass: 'text-[0.42em] sm:text-[0.45em] font-semibold text-indigo-600/90 dark:text-torii-light/90',
  }
);

const segments = computed(() => {
  return parseFuriganaSegments(props.text);
});
</script>

<template>
  <span :class="['inline-flex flex-wrap items-baseline font-japanese leading-normal', customClass]">
    <template v-for="(seg, idx) in segments" :key="idx">
      <ruby v-if="seg.isRuby && showFurigana" class="ruby-word select-text">
        {{ seg.text }}
        <rt :class="['select-none leading-none tracking-normal font-sans', rtClass]">
          {{ seg.reading }}
        </rt>
      </ruby>
      <span v-else>{{ seg.text }}</span>
    </template>
  </span>
</template>

<style scoped>
ruby {
  ruby-position: over;
}
rt {
  user-select: none;
}
</style>
