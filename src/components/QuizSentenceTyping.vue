<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { toRomaji } from 'wanakana';
import { AlertCircle } from '@lucide/vue';
import correctSoundFile from '../assets/sound/correct.wav';
import incorrectSoundFile from '../assets/sound/incorrect.wav';

const quizStore = useQuizStore();
const correctAudio = new Audio(correctSoundFile);
const incorrectAudio = new Audio(incorrectSoundFile);

const inputRef = ref<HTMLInputElement | null>(null);
const currentSentenceIndex = ref(0);
const userInput = ref('');
const activeUnitIndex = ref(0);
const revealedHints = ref<Record<number, boolean>>({});

const toggleHint = (index: number) => {
  revealedHints.value[index] = !revealedHints.value[index];
  focusInput();
};

watch(currentSentenceIndex, () => {
  revealedHints.value = {};
});

// Stats tracking
const totalKeystrokes = ref(0);
const correctKeystrokes = ref(0);
const errorCount = ref(0);
const startTime = ref(0);
const elapsedTimeSeconds = ref(0);
let timerInterval: any = null;

const currentSentence = computed(() => {
  return quizStore.questions[currentSentenceIndex.value] || null;
});

const totalSentences = computed(() => quizStore.questions.length);

const units = computed(() => {
  if (!currentSentence.value) return [];
  const japanese = currentSentence.value.japanese || '';
  const variants: string[][] = currentSentence.value?.romaji_variants || [];
  const wordSpans: number[] = currentSentence.value?.word_spans || [];
  const yoonSmallKana = ['ゃ','ゅ','ょ','ぁ','ぃ','ぅ','ぇ','ぉ', 'ャ','ュ','ョ','ァ','ィ','ゥ','ェ','ォ'];
  const isSokuon = (c: string) => c === 'っ' || c === 'ッ';

  const result: Array<{ kana: string; acceptedRomaji: string[] }> = [];

  if (wordSpans && wordSpans.length > 0) {
    let charIdx = 0;
    let vIdx = 0;

    for (const span of wordSpans) {
      if (vIdx >= variants.length) break;

      const firstChar = japanese[charIdx];
      if (['、', '。', '？', '?', '！', '!', ' '].includes(firstChar)) {
        result.push({
          kana: firstChar,
          acceptedRomaji: firstChar === '、' ? [',', ' ', ''] : (firstChar === '。' ? ['.', ''] : [firstChar])
        });
        charIdx++;
      }

      const wordVariants = variants.slice(vIdx, vIdx + span);
      
      let wordCharCount = 0;
      for (let i = 0; i < wordVariants.length; i++) {
        const remaining = japanese.slice(charIdx + wordCharCount);
        const nextV = wordVariants[i + 1];
        const isNextU = nextV && nextV.some((r: string) => r === 'u');

        let matchedLen = 1;
        if (isSokuon(remaining[0])) {
          if (remaining.length >= 3 && yoonSmallKana.includes(remaining[2])) {
            matchedLen = 3;
          } else if (remaining.length >= 2) {
            matchedLen = 2;
          }
        } else if (remaining.length >= 3 && yoonSmallKana.includes(remaining[1])) {
          if ((remaining[2] === 'う' || remaining[2] === 'ウ') && !isNextU) {
            matchedLen = 3;
          } else {
            matchedLen = 2;
          }
        } else if (remaining.length >= 2 && yoonSmallKana.includes(remaining[1])) {
          matchedLen = 2;
        }

        wordCharCount += matchedLen;
      }

      const kana = japanese.slice(charIdx, charIdx + wordCharCount);
      charIdx += wordCharCount;
      vIdx += span;

      let combinations: string[] = [''];
      for (const varOptions of wordVariants) {
        const nextCombos: string[] = [];
        const opts = varOptions.length > 0 ? varOptions : [toRomaji(kana)];
        for (const c of combinations) {
          for (const opt of opts) {
            if (opt === 'ー') {
              nextCombos.push(c + '-');
              nextCombos.push(c + 'ー');
              nextCombos.push(c + '_');
            } else {
              nextCombos.push(c + opt);
            }
          }
        }
        combinations = nextCombos;
      }

      const acceptedRomaji = Array.from(new Set(combinations));

      result.push({
        kana,
        acceptedRomaji
      });
    }

    while (charIdx < japanese.length) {
      const currentChar = japanese[charIdx];
      result.push({
        kana: currentChar,
        acceptedRomaji: [currentChar]
      });
      charIdx++;
    }

    return result;
  }

  let charIdx = 0;
  for (let vIdx = 0; vIdx < variants.length; vIdx++) {
    const v = variants[vIdx];
    if (charIdx >= japanese.length) break;

    const currentChar = japanese[charIdx];
    if (['、', '。', '？', '?', '！', '!', ' '].includes(currentChar)) {
      const isPunctVariant = v && v.some((r: string) => r === ',' || r === '.' || r === '?' || r === '!' || r === ' ');
      if (!isPunctVariant) {
        result.push({
          kana: currentChar,
          acceptedRomaji: currentChar === '、' ? [',', ' ', ''] : (currentChar === '。' ? ['.', ''] : [currentChar])
        });
        charIdx++;
        vIdx--;
        continue;
      }
    }

    let matchedLen = 1;
    const remainingChars = japanese.slice(charIdx);
    
    const nextVar = variants[vIdx + 1];
    const isNextVarU = nextVar && nextVar.some((r: string) => r === 'u');

    if (remainingChars.length >= 2 && isSokuon(remainingChars[1]) && nextVar) {
      let sokuonNextLen = 1;
      const afterSokuon = remainingChars.slice(2);
      if (afterSokuon.length >= 2 && yoonSmallKana.includes(afterSokuon[1])) {
        sokuonNextLen = 1 + 2;
      } else if (afterSokuon.length >= 1) {
        sokuonNextLen = 1 + 1;
      }

      matchedLen = 1 + sokuonNextLen;
      const kana = remainingChars.slice(0, matchedLen);
      charIdx += matchedLen;

      const acceptedRomaji: string[] = [];
      for (const r1 of v) {
        for (const r2 of nextVar) {
          const combined = (r1 + r2).toLowerCase();
          if (!acceptedRomaji.includes(combined)) {
            acceptedRomaji.push(combined);
          }
        }
      }

      result.push({
        kana,
        acceptedRomaji
      });

      vIdx++;
      continue;
    }
    
    if (isSokuon(remainingChars[0])) {
      if (remainingChars.length >= 3 && yoonSmallKana.includes(remainingChars[2])) {
        matchedLen = 3;
      } else if (remainingChars.length >= 2) {
        matchedLen = 2;
      }
    } else if (remainingChars.length >= 3 && yoonSmallKana.includes(remainingChars[1])) {
      if ((remainingChars[2] === 'う' || remainingChars[2] === 'ウ') && !isNextVarU) {
        matchedLen = 3;
      } else {
        matchedLen = 2;
      }
    } else if (remainingChars.length >= 2 && yoonSmallKana.includes(remainingChars[1])) {
      matchedLen = 2;
    }
    
    const kana = remainingChars.slice(0, matchedLen);
    charIdx += matchedLen;

    const rawAccepted = v && v.length > 0 ? [...v] : [toRomaji(kana)];
    const acceptedRomaji: string[] = [];
    for (const r of rawAccepted) {
      if (r === 'ー') {
        if (!acceptedRomaji.includes('-')) acceptedRomaji.push('-');
        if (!acceptedRomaji.includes('ー')) acceptedRomaji.push('ー');
        if (!acceptedRomaji.includes('_')) acceptedRomaji.push('_');
      } else {
        if (!acceptedRomaji.includes(r)) acceptedRomaji.push(r);
      }
    }
    if (kana === 'ー' && !acceptedRomaji.includes('-')) {
      acceptedRomaji.push('-', 'ー', '_');
    }

    result.push({
      kana,
      acceptedRomaji
    });
  }

  while (charIdx < japanese.length) {
    const currentChar = japanese[charIdx];
    result.push({
      kana: currentChar,
      acceptedRomaji: currentChar === '、' ? [',', ' ', ''] : (currentChar === '。' ? ['.', ''] : (currentChar === 'ー' ? ['-', 'ー', '_'] : [currentChar]))
    });
    charIdx++;
  }

  return result;
});

// Live metrics
const cpm = computed(() => {
  if (elapsedTimeSeconds.value === 0) return 0;
  return Math.round((correctKeystrokes.value / elapsedTimeSeconds.value) * 60);
});

const wpm = computed(() => Math.round(cpm.value / 5));

const accuracy = computed(() => {
  const totalAttempted = correctKeystrokes.value + errorCount.value;
  if (totalAttempted === 0) return 100;
  return Math.max(0, Math.min(100, Math.round((correctKeystrokes.value / totalAttempted) * 100)));
});

const isTypoInInput = ref(false);

const focusInput = () => {
  nextTick(() => {
    if (inputRef.value) inputRef.value.focus();
  });
};

onMounted(() => {
  startTime.value = Date.now();
  timerInterval = setInterval(() => {
    elapsedTimeSeconds.value = Math.max(1, Math.floor((Date.now() - startTime.value) / 1000));
  }, 1000);
  focusInput();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

const evaluateInput = () => {
  if (units.value.length === 0) return;

  const rawInput = userInput.value;
  const cleanInput = rawInput.toLowerCase();
  
  let inputOffset = 0;
  let newActiveIdx = 0;
  let typoFound = false;

  for (let i = 0; i < units.value.length; i++) {
    const unit = units.value[i];
    const acceptedList = unit.acceptedRomaji;
    const remainingInput = cleanInput.slice(inputOffset);

    if (remainingInput.length === 0) {
      newActiveIdx = i;
      typoFound = false;
      break;
    }

    const sortedVariants = [...acceptedList].sort((a, b) => b.length - a.length);
    const hasEmptyFallback = acceptedList.includes('');

    let matchedVariant: string | null = null;
    for (const v of sortedVariants) {
      const vLower = v.toLowerCase();
      if (vLower !== '' && remainingInput.startsWith(vLower)) {
        if (remainingInput === vLower) {
          const hasLongerVariant = acceptedList.some(other => 
            other.toLowerCase().length > vLower.length && other.toLowerCase().startsWith(vLower)
          );
          if (hasLongerVariant) {
            newActiveIdx = i;
            typoFound = false;
            break;
          }
        }
        matchedVariant = vLower;
        break;
      }
    }

    if (matchedVariant === null && hasEmptyFallback) {
      if (i < units.value.length - 1) {
        const nextUnit = units.value[i + 1];
        const isNextMatch = nextUnit.acceptedRomaji.some(v => 
          v.toLowerCase() !== '' && (v.toLowerCase().startsWith(remainingInput) || remainingInput.startsWith(v.toLowerCase()))
        );
        if (isNextMatch) {
          matchedVariant = '';
        }
      }
    }

    if (matchedVariant !== null) {
      inputOffset += matchedVariant.length;
      newActiveIdx = i + 1;
      if (i === units.value.length - 1 && inputOffset >= cleanInput.length) {
        newActiveIdx = units.value.length;
        typoFound = false;
        break;
      }
    } else {
      const isPrefix = acceptedList.some(v => v.toLowerCase().startsWith(remainingInput));
      if (isPrefix) {
        newActiveIdx = i;
        typoFound = false;
        break;
      } else {
        newActiveIdx = i;
        typoFound = true;
        break;
      }
    }
  }

  activeUnitIndex.value = Math.min(newActiveIdx, units.value.length - 1);
  correctKeystrokes.value = inputOffset;

  if (typoFound && !isTypoInInput.value) {
    errorCount.value++;
    incorrectAudio.play().catch(() => {});
  }
  isTypoInInput.value = typoFound;

  if (newActiveIdx >= units.value.length && !typoFound) {
    // Sentence completed!
    correctAudio.play().catch(() => {});
    const fullRomaji = currentSentence.value.romaji || 
      (currentSentence.value.romaji_variants ? currentSentence.value.romaji_variants.map((v: string[]) => v[0]).join('') : '');

    quizStore.userAnswers.push({
      character: currentSentence.value.japanese,
      correctRomaji: fullRomaji,
      userRomaji: fullRomaji,
      isCorrect: true,
      meaning: currentSentence.value.meaning || currentSentence.value.meaning_id,
      pointsEarned: 4,
      maxPoints: 4,
      isTypo: false,
      hintsUsed: 0
    });

    if (currentSentenceIndex.value < totalSentences.value - 1) {
      currentSentenceIndex.value++;
      activeUnitIndex.value = 0;
      userInput.value = '';
      isTypoInInput.value = false;
    } else {
      // Quiz complete!
      clearInterval(timerInterval);
      quizStore.finishSentenceQuiz({
        wpm: wpm.value,
        cpm: cpm.value,
        accuracy: accuracy.value,
        errorCount: errorCount.value,
        totalKeystrokes: totalKeystrokes.value
      });
    }
  }
};

const handleInput = () => {
  totalKeystrokes.value++;
  evaluateInput();
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    userInput.value = '';
    evaluateInput();
  }
};
</script>

<template>
  <div class="w-full max-w-2xl mx-auto flex flex-col items-center p-2 sm:p-4">
    <!-- Live Header Stats Bar -->
    <div class="w-full bg-slate-900 text-white rounded-2xl p-3 sm:p-4 mb-5 shadow-lg grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center items-center">
      <div class="flex flex-col">
        <span class="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Progress</span>
        <span class="text-sm sm:text-base font-extrabold text-amber-400">
          {{ currentSentenceIndex + 1 }} / {{ totalSentences }} Kalimat
        </span>
      </div>
      <div class="flex flex-col border-l sm:border-l-0 sm:border-x border-slate-800">
        <span class="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Kecepatan</span>
        <span class="text-sm sm:text-base font-extrabold text-indigo-300">
          {{ cpm }} <span class="text-xs text-slate-400 font-normal">CPM</span>
        </span>
      </div>
      <div class="flex flex-col">
        <span class="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Akurasi</span>
        <span class="text-sm sm:text-base font-extrabold" :class="accuracy >= 90 ? 'text-emerald-400' : 'text-amber-300'">
          {{ accuracy }}%
        </span>
      </div>
      <div class="flex flex-col border-l border-slate-800">
        <span class="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Waktu</span>
        <span class="text-sm sm:text-base font-extrabold text-slate-200">
          {{ elapsedTimeSeconds }}s
        </span>
      </div>
    </div>

    <!-- Sentence Typing Card -->
    <div class="w-full bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md flex flex-col items-center text-center relative overflow-hidden mb-6">
      
      <!-- Meaning / Indonesian Translation Hint -->
      <div class="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
        <span>💡 {{ currentSentence?.meaning || 'Kalimat Bahasa Jepang' }}</span>
      </div>

      <!-- Japanese Sentence Display with Character-by-Character Highlight -->
      <div class="flex items-center justify-center flex-wrap gap-1 sm:gap-2 my-4 min-h-[70px]">
        <div
          v-for="(unit, idx) in units"
          :key="idx"
          @click="toggleHint(Number(idx))"
          title="Klik untuk melihat hint romaji"
          class="flex flex-col items-center transition-all duration-200 px-1.5 py-1 rounded-xl cursor-pointer hover:bg-indigo-50/70 select-none"
          :class="[
            Number(idx) < activeUnitIndex 
              ? 'text-emerald-600 font-extrabold scale-95' 
              : (Number(idx) === activeUnitIndex 
                ? 'text-indigo-600 font-black scale-110 border-b-2 border-indigo-600 bg-indigo-50/50 shadow-xs' 
                : 'text-gray-400 font-medium opacity-60')
          ]"
        >
          <span class="text-3xl sm:text-4xl leading-tight">{{ unit.kana }}</span>
          <span 
            class="text-[10px] font-mono mt-1 font-bold uppercase tracking-tighter transition-all duration-200"
            :class="[
              revealedHints[Number(idx)] ? 'opacity-100' : 'opacity-0 select-none',
              Number(idx) < activeUnitIndex ? 'text-emerald-600' : (Number(idx) === activeUnitIndex ? 'text-indigo-600' : 'text-gray-400')
            ]"
          >
            {{ unit.acceptedRomaji[0] }}
          </span>
        </div>
      </div>

      <!-- Real-time Typing Input Box -->
      <div class="w-full max-w-md mt-4 relative">
        <input
          ref="inputRef"
          v-model="userInput"
          type="text"
          placeholder="Ketik romaji karakter di atas..."
          class="w-full px-5 py-3.5 text-lg font-mono text-center bg-gray-50 border-2 rounded-2xl transition-all duration-200 outline-none focus:bg-white shadow-inner"
          :class="[
            isTypoInInput 
              ? 'border-red-500 text-red-600 bg-red-50/50 focus:ring-4 focus:ring-red-100' 
              : 'border-indigo-300 text-gray-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100'
          ]"
          @input="handleInput"
          @keydown="handleKeyDown"
          @blur="focusInput"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        />
        <div v-if="isTypoInInput" class="text-xs font-bold text-red-500 mt-2 flex items-center justify-center gap-1">
          <AlertCircle class="w-3.5 h-3.5" />
          <span>Salah ketik! Tekan backspace atau ketik romaji yang benar.</span>
        </div>
      </div>
    </div>
  </div>
</template>
