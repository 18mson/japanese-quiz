<script setup lang="ts">
import { computed } from 'vue';
import { parseFuriganaSegments } from '../../utils/furiganaParser';
import { computeTargetMatchIndices } from '../../utils/answerDiff';

const props = withDefaults(
  defineProps<{
    text: string;
    showFurigana?: boolean;
    customClass?: string;
    rtClass?: string;
    diffUserAnswer?: string;
    isAllCorrect?: boolean;
  }>(),
  {
    showFurigana: true,
    customClass: '',
    rtClass: 'text-[0.42em] sm:text-[0.45em] font-semibold text-indigo-600/90 dark:text-torii-light/90',
    diffUserAnswer: '',
    isAllCorrect: false,
  }
);

interface HighlightedPart {
  text: string;
  isMatched: boolean;
}

const processedSegments = computed(() => {
  const baseSegments = parseFuriganaSegments(props.text);
  if (!props.diffUserAnswer) {
    return baseSegments.map((seg) => ({
      isRuby: seg.isRuby,
      reading: seg.reading,
      rubyText: seg.text,
      isRubyMatched: false,
      parts: [{ text: seg.text, isMatched: false }]
    }));
  }

  const matchIndices = computeTargetMatchIndices(props.diffUserAnswer, props.text);
  let charIdx = 0;

  return baseSegments.map((seg) => {
    const segLen = seg.text.length;
    const segMatches = matchIndices.slice(charIdx, charIdx + segLen);
    charIdx += segLen;

    if (seg.isRuby) {
      const allMatched = segMatches.length > 0 && segMatches.every(Boolean);
      return {
        isRuby: true,
        reading: seg.reading,
        rubyText: seg.text,
        isRubyMatched: allMatched,
        parts: []
      };
    }

    const parts: HighlightedPart[] = [];
    if (seg.text.length > 0) {
      let currText = '';
      let currMatched = segMatches[0] ?? false;

      for (let k = 0; k < seg.text.length; k++) {
        const isM = segMatches[k] ?? false;
        if (isM === currMatched) {
          currText += seg.text[k];
        } else {
          if (currText) {
            parts.push({ text: currText, isMatched: currMatched });
          }
          currText = seg.text[k];
          currMatched = isM;
        }
      }
      if (currText) {
        parts.push({ text: currText, isMatched: currMatched });
      }
    }

    return {
      isRuby: false,
      reading: undefined,
      rubyText: undefined,
      isRubyMatched: false,
      parts
    };
  });
});
</script>

<template>
  <span :class="['inline-flex flex-wrap items-baseline font-japanese leading-normal', customClass]">
    <template v-for="(seg, idx) in processedSegments" :key="idx">
      <!-- Ruby Segments (Kanji dengan Furigana) -->
      <ruby 
        v-if="seg.isRuby && showFurigana" 
        :class="[
          'ruby-word select-text transition-colors duration-200',
          isAllCorrect
            ? 'text-blue-600 dark:text-blue-400'
            : (diffUserAnswer 
                ? (seg.isRubyMatched ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100')
                : '')
        ]"
      >
        {{ seg.rubyText }}
        <rt :class="['select-none leading-none tracking-normal font-sans', isAllCorrect ? 'text-blue-500/90 dark:text-blue-300/90' : rtClass]">
          {{ seg.reading }}
        </rt>
      </ruby>

      <!-- Non-ruby Segments (Kana / Simbol) -->
      <template v-else>
        <span 
          v-for="(part, pIdx) in seg.parts" 
          :key="pIdx"
          :class="[
            'transition-colors duration-200',
            isAllCorrect
              ? 'text-blue-600 dark:text-blue-400'
              : (diffUserAnswer 
                  ? (part.isMatched ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100')
                  : '')
          ]"
        >{{ part.text }}</span>
      </template>
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
