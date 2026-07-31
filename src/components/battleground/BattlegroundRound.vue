<script setup lang="ts">
// BattlegroundRound.vue
// Layar typing aktif dengan indikator kesiapan mengetik & 1s typo penalty cooldown.

import {
  ref, computed, watch, onMounted, onUnmounted, nextTick
} from 'vue';
import { toRomaji } from 'wanakana';
import { useBattlegroundStore } from '../../stores/battlegroundStore';
import { ShieldX, CheckCircle2, Clock, Zap, AlertTriangle, PlayCircle, Lock } from '@lucide/vue';

const store = useBattlegroundStore();

// ── Input State ───────────────────────────────────────────────
const inputRef = ref<HTMLInputElement | null>(null);
const userInput = ref('');
const hasError = ref(false);
const isSubmitted = ref(false);

// ── Typo Penalty State (1 Second Cooldown) ────────────────────
const isPenaltyActive = ref(false);
const penaltyTimeLeft = ref('1.0');
let penaltyInterval: ReturnType<typeof setInterval> | null = null;

// ── Progress Broadcast Throttle ───────────────────────────────
let progressThrottle: ReturnType<typeof setTimeout> | null = null;

// ── Timer ─────────────────────────────────────────────────────
const timerWidth = computed(() => {
  const dur = (store.activeRound?.duration_seconds ?? 30);
  const pct = Math.max(0, Math.min(100, (store.countdownSeconds / dur) * 100));
  return `${pct}%`;
});

const timerColor = computed(() => {
  if (store.countdownSeconds <= 5) return 'bg-rose-500';
  if (store.countdownSeconds <= 10) return 'bg-amber-500';
  return 'bg-emerald-500';
});

// ── Sentence Parsing & Multi-Sentence Support ──────────────────
interface Unit { kana: string; acceptedRomaji: string[] }

const currentSentenceIndex = ref(0);

const activeSentence = computed(() => {
  const r = store.activeRound;
  if (!r) return null;
  if (r.sentences && r.sentences.length > 0) {
    return r.sentences[currentSentenceIndex.value] ?? r.sentences[0];
  }
  return {
    id: r.sentence_id,
    japanese: r.sentence_japanese,
    romaji_variants: r.sentence_romaji_variants,
    word_spans: r.sentence_word_spans,
    meaning: r.sentence_meaning ?? '',
  };
});

const totalSentencesCount = computed(() => store.activeRound?.sentences?.length ?? 1);

const yoonSmallKana = ['ゃ','ゅ','ょ','ぁ','ぃ','ぅ','ぇ','ぉ','ャ','ュ','ョ','ァ','ィ','ゥ','ェ','ォ'];
const isSokuon = (c: string) => c === 'っ' || c === 'ッ';

const units = computed<Unit[]>(() => {
  const s = activeSentence.value;
  if (!s) return [];

  const japanese = s.japanese;
  const variants: string[][] = s.romaji_variants;
  const wordSpans: number[] | null = s.word_spans ?? null;
  const result: Unit[] = [];

  if (wordSpans && wordSpans.length > 0) {
    let charIdx = 0;
    let vIdx = 0;

    for (const span of wordSpans) {
      if (vIdx >= variants.length) break;
      const wordVariants = variants.slice(vIdx, vIdx + span);
      let wordCharCount = 0;
      for (let i = 0; i < wordVariants.length; i++) {
        const remaining = japanese.slice(charIdx + wordCharCount);
        const nextV = wordVariants[i + 1];
        const isNextU = nextV && nextV.some((r: string) => r === 'u');
        let matchedLen = 1;
        if (isSokuon(remaining[0])) {
          matchedLen = (remaining.length >= 3 && yoonSmallKana.includes(remaining[2])) ? 3 : 2;
        } else if (remaining.length >= 2 && yoonSmallKana.includes(remaining[1])) {
          if (remaining.length >= 3 && (remaining[2] === 'う' || remaining[2] === 'ウ') && !isNextU) matchedLen = 3;
          else matchedLen = 2;
        }
        wordCharCount += matchedLen;
      }
      const kana = japanese.slice(charIdx, charIdx + wordCharCount);
      charIdx += wordCharCount;
      vIdx += span;
      let combos: string[] = [''];
      for (const varOpts of wordVariants) {
        const next: string[] = [];
        const opts = varOpts.length > 0 ? varOpts : [toRomaji(kana)];
        for (const c of combos) for (const o of opts) next.push(c + o);
        combos = next;
      }
      result.push({ kana, acceptedRomaji: Array.from(new Set(combos)) });
    }
  } else {
    // Fallback: simple unit-per-variant
    let charIdx2 = 0;
    for (let vIdx = 0; vIdx < variants.length; vIdx++) {
      const v = variants[vIdx];
      if (charIdx2 >= japanese.length) break;
      const remaining = japanese.slice(charIdx2);
      let matchedLen = 1;
      const nextVar = variants[vIdx + 1];
      const isNextU = nextVar && nextVar.some((r: string) => r === 'u');
      if (isSokuon(remaining[0])) {
        matchedLen = (remaining.length >= 3 && yoonSmallKana.includes(remaining[2])) ? 3 : 2;
      } else if (remaining.length >= 2 && yoonSmallKana.includes(remaining[1])) {
        if ((remaining[2] === 'う' || remaining[2] === 'ウ') && !isNextU) matchedLen = 3;
        else matchedLen = 2;
      }
      const kana = remaining.slice(0, matchedLen);
      charIdx2 += matchedLen;
      const rawAccepted = v && v.length > 0 ? [...v] : [toRomaji(kana)];
      result.push({ kana, acceptedRomaji: rawAccepted });
    }
  }

  // Sanitize acceptedRomaji: remove stray '-' or 'ー' so dash never shows up in romaji display
  result.forEach(u => {
    u.acceptedRomaji = u.acceptedRomaji
      .map(r => r.replace(/[-ー]/g, ''))
      .filter(r => r.length > 0);
    if (u.acceptedRomaji.length === 0) u.acceptedRomaji = [''];
  });

  return result;
});

// ── Typing Matching State ─────────────────────────────────────
const activeUnitIndex = ref(0);
const activeSubIndex = ref(0);
const currentUnit = computed<Unit | null>(() => units.value[activeUnitIndex.value] ?? null);
const lockedAccepted = ref<string | null>(null);

// ── Input Handler ─────────────────────────────────────────────
function focusInput() {
  if (store.phase !== 'round_active' || isPenaltyActive.value || isSubmitted.value) return;
  nextTick(() => inputRef.value?.focus());
}

function autoSkipHyphens() {
  while (currentUnit.value) {
    const unit = currentUnit.value;
    const currentExpected = (lockedAccepted.value ?? unit.acceptedRomaji[0])[activeSubIndex.value];
    if (currentExpected === '-' || currentExpected === 'ー') {
      if (lockedAccepted.value === null) {
        lockedAccepted.value = unit.acceptedRomaji[0];
      }
      activeSubIndex.value++;
      if (activeSubIndex.value >= lockedAccepted.value!.length) {
        activeUnitIndex.value++;
        activeSubIndex.value = 0;
        lockedAccepted.value = null;
      }
    } else {
      break;
    }
  }
}

const prepCountdownSeconds = ref(5);
let prepTimer: ReturnType<typeof setInterval> | null = null;

function updatePrepCountdown() {
  const startAt = store.activeRound?.start_at;
  if (!startAt) {
    prepCountdownSeconds.value = 5;
    return;
  }
  const startMs = new Date(startAt).getTime();
  const remainingMs = startMs - Date.now();
  prepCountdownSeconds.value = Math.max(0, Math.ceil(remainingMs / 1000));
}

// ── Power-Up System State ──────────────────────────────────────
const powerUpUnitIndex = ref(0);
const powerUpType = ref<'freeze' | 'backward' | 'storm'>('freeze');
const failedPowerUpUnits = ref<Set<number>>(new Set());
const claimedPowerUpUnits = ref<Set<number>>(new Set());

// Sender Animation State
const senderPowerUpNotice = ref<string | null>(null);
const isShootingBeam = ref(false);

// Victim Power-Up Effects State
const isFrozen = ref(false);
const freezeCountdown = ref(3.0);
let freezeTimer: ReturnType<typeof setInterval> | null = null;

const isStormActive = ref(false);
const stormCountdown = ref(5.0);
const lightningFlashActive = ref(false);
let stormTimer: ReturnType<typeof setInterval> | null = null;
let lightningInterval: ReturnType<typeof setInterval> | null = null;

const isRewindingGlitch = ref(false);

function initSentencePowerUp() {
  failedPowerUpUnits.value.clear();
  claimedPowerUpUnits.value.clear();
  const unitCount = units.value.length;
  if (unitCount > 0) {
    powerUpUnitIndex.value = Math.floor(Math.random() * unitCount);
    const types: Array<'freeze' | 'backward' | 'storm'> = ['freeze', 'backward', 'storm'];
    powerUpType.value = types[Math.floor(Math.random() * types.length)];
  }
}

watch(currentSentenceIndex, () => {
  initSentencePowerUp();
});

watch(() => store.latestPowerUpEvent, (evt) => {
  if (!evt) return;
  if (evt.senderId !== store.myPlayerId) {
    applyVictimPowerUp(evt.type, evt.senderName);
  } else {
    triggerSenderBeamAnimation(evt.type);
  }
});

function triggerSenderBeamAnimation(type: 'freeze' | 'backward' | 'storm') {
  isShootingBeam.value = true;
  const nameMap = { freeze: 'FREEZE ❄️', backward: 'BACKWARD ⏪', storm: 'STORM ⚡' };
  senderPowerUpNotice.value = `SERANGAN ${nameMap[type]} BERHASIL DILUNCURKAN!`;
  setTimeout(() => {
    isShootingBeam.value = false;
  }, 1200);
  setTimeout(() => {
    senderPowerUpNotice.value = null;
  }, 2500);
}

const victimPowerUpAttacker = ref('');

function applyVictimPowerUp(type: 'freeze' | 'backward' | 'storm', senderName: string) {
  victimPowerUpAttacker.value = senderName;
  if (type === 'freeze') {
    isFrozen.value = true;
    freezeCountdown.value = 3.0;
    if (freezeTimer) clearInterval(freezeTimer);
    freezeTimer = setInterval(() => {
      freezeCountdown.value = Math.max(0, +(freezeCountdown.value - 0.1).toFixed(1));
      if (freezeCountdown.value <= 0) {
        if (freezeTimer) clearInterval(freezeTimer);
        freezeTimer = null;
        isFrozen.value = false;
        focusInput();
      }
    }, 100);
  } else if (type === 'backward') {
    isRewindingGlitch.value = true;
    setTimeout(() => (isRewindingGlitch.value = false), 1000);
    activeUnitIndex.value = Math.max(0, activeUnitIndex.value - 3);
    activeSubIndex.value = 0;
    lockedAccepted.value = null;
  } else if (type === 'storm') {
    isStormActive.value = true;
    stormCountdown.value = 5.0;
    if (stormTimer) clearInterval(stormTimer);
    if (lightningInterval) clearInterval(lightningInterval);

    stormTimer = setInterval(() => {
      stormCountdown.value = Math.max(0, +(stormCountdown.value - 0.1).toFixed(1));
      if (stormCountdown.value <= 0) {
        if (stormTimer) clearInterval(stormTimer);
        stormTimer = null;
        if (lightningInterval) clearInterval(lightningInterval);
        lightningInterval = null;
        isStormActive.value = false;
        lightningFlashActive.value = false;
      }
    }, 100);

    lightningInterval = setInterval(() => {
      lightningFlashActive.value = true;
      setTimeout(() => {
        lightningFlashActive.value = false;
      }, 350);
    }, 1400);
  }
}

watch(() => store.phase, (p) => {
  if (p === 'round_preparing') {
    updatePrepCountdown();
    if (prepTimer) clearInterval(prepTimer);
    prepTimer = setInterval(() => {
      updatePrepCountdown();
      if (prepCountdownSeconds.value <= 0 && prepTimer) {
        clearInterval(prepTimer);
        prepTimer = null;
      }
    }, 100);
  } else {
    if (prepTimer) {
      clearInterval(prepTimer);
      prepTimer = null;
    }
  }

  if (p === 'round_active') {
    currentSentenceIndex.value = 0;
    activeUnitIndex.value = 0;
    activeSubIndex.value = 0;
    userInput.value = '';
    hasError.value = false;
    isSubmitted.value = false;
    isPenaltyActive.value = false;
    isFrozen.value = false;
    isStormActive.value = false;
    lockedAccepted.value = null;
    initSentencePowerUp();
    autoSkipHyphens();
    focusInput();
  }
}, { immediate: true });

onMounted(() => {
  initSentencePowerUp();
  autoSkipHyphens();
  focusInput();
});
onUnmounted(() => {
  if (progressThrottle) clearTimeout(progressThrottle);
  if (penaltyInterval) clearInterval(penaltyInterval);
  if (prepTimer) clearInterval(prepTimer);
  if (freezeTimer) clearInterval(freezeTimer);
  if (stormTimer) clearInterval(stormTimer);
  if (lightningInterval) clearInterval(lightningInterval);
});

function handleInput(event: Event) {
  if (isSubmitted.value || !store.iAmAlive || isPenaltyActive.value || isFrozen.value || store.phase !== 'round_active') return;
  const input = event.target as HTMLInputElement;
  const typed = input.value;
  processTyped(typed);
  input.value = '';
}

function processTyped(typed: string) {
  if (!currentUnit.value || !store.activeRound || isPenaltyActive.value || isFrozen.value) return;

  autoSkipHyphens();

  for (const char of typed) {
    if (!currentUnit.value || isPenaltyActive.value || isFrozen.value) return;

    if (char === ' ') {
      const unit = currentUnit.value;
      const expected = (lockedAccepted.value ?? unit.acceptedRomaji[0])[activeSubIndex.value];
      if (expected !== ' ') {
        continue;
      }
    }

    advanceChar(char);
    autoSkipHyphens();

    if (hasError.value || isPenaltyActive.value || isFrozen.value) return;
  }
}

function advanceChar(char: string) {
  const unit = currentUnit.value;
  if (!unit || isFrozen.value) return;

  const lc = char.toLowerCase();

  if (lockedAccepted.value === null) {
    const match = unit.acceptedRomaji.find(r => r[0] === lc);
    if (!match) {
      triggerError();
      return;
    }
    lockedAccepted.value = match;
    activeSubIndex.value = 0;
  }

  const expected = lockedAccepted.value![activeSubIndex.value];
  if (lc !== expected) {
    const newMatch = unit.acceptedRomaji.find(r => r[activeSubIndex.value] === lc);
    if (newMatch && newMatch.slice(0, activeSubIndex.value) === lockedAccepted.value!.slice(0, activeSubIndex.value)) {
      lockedAccepted.value = newMatch;
    } else {
      triggerError();
      return;
    }
  }

  activeSubIndex.value++;

  if (activeSubIndex.value >= lockedAccepted.value!.length) {
    const justCompletedUnitIndex = activeUnitIndex.value;
    activeUnitIndex.value++;
    activeSubIndex.value = 0;
    lockedAccepted.value = null;

    if (justCompletedUnitIndex === powerUpUnitIndex.value) {
      if (!failedPowerUpUnits.value.has(justCompletedUnitIndex) && !claimedPowerUpUnits.value.has(justCompletedUnitIndex)) {
        claimedPowerUpUnits.value.add(justCompletedUnitIndex);
        store.triggerPowerUp(powerUpType.value);
      }
    }

    throttledProgressBroadcast();

    if (activeUnitIndex.value >= units.value.length) {
      // Current sentence complete! Check if more sentences remain in this round
      if (currentSentenceIndex.value < totalSentencesCount.value - 1) {
        currentSentenceIndex.value++;
        activeUnitIndex.value = 0;
        activeSubIndex.value = 0;
        lockedAccepted.value = null;
        autoSkipHyphens();
        focusInput();
      } else {
        handleComplete();
      }
    }
  } else {
    throttledProgressBroadcast();
  }
}

function triggerError() {
  if (isPenaltyActive.value || isSubmitted.value || !store.iAmAlive) return;

  failedPowerUpUnits.value.add(activeUnitIndex.value);
  hasError.value = true;
  isPenaltyActive.value = true;
  penaltyTimeLeft.value = '1.0';

  // Flash current unit & reset candidate lock so player can retry
  lockedAccepted.value = null;
  activeSubIndex.value = 0;

  const startTime = Date.now();
  const penaltyMs = 1000;

  if (penaltyInterval) clearInterval(penaltyInterval);

  penaltyInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, penaltyMs - elapsed);
    penaltyTimeLeft.value = (remaining / 1000).toFixed(1);

    if (remaining <= 0) {
      if (penaltyInterval) clearInterval(penaltyInterval);
      penaltyInterval = null;
      isPenaltyActive.value = false;
      hasError.value = false;
      focusInput();
    }
  }, 50);
}

async function handleComplete() {
  isSubmitted.value = true;
  await store.submitRound({
    typedInput: 'COMPLETE',
    isValid: true,
    completedSentences: totalSentencesCount.value,
    totalSentences: totalSentencesCount.value,
    progressPercentage: 100,
  });
}

function throttledProgressBroadcast() {
  if (progressThrottle) return;
  progressThrottle = setTimeout(() => {
    const totalCount = totalSentencesCount.value;
    const sentProgress = currentSentenceIndex.value;
    const unitProgress = activeUnitIndex.value / Math.max(1, units.value.length);
    const overallPct = +(Math.min(100, ((sentProgress + unitProgress) / totalCount) * 100)).toFixed(2);

    store.broadcastProgress({
      completedSentences: currentSentenceIndex.value,
      totalSentences: totalCount,
      progressPercentage: overallPct,
    });
    progressThrottle = null;
  }, 100);
}

// ── Player Panel ──────────────────────────────────────────────
function getProgress(playerId: string): number {
  const p = store.playerProgress.get(playerId);
  if (!p) return 0;
  return p.progressPercentage;
}

function avatarColor(name: string): string {
  return `hsl(${(name.charCodeAt(0) * 47) % 360}, 60%, 40%)`;
}

function preventPaste(e: ClipboardEvent) {
  e.preventDefault();
}
</script>

<template>
  <div class="flex flex-col h-full bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white overflow-hidden relative select-none">

    <!-- Sender Notice Banner -->
    <div v-if="senderPowerUpNotice" class="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-slate-950 font-black text-[11px] sm:text-xs px-4 sm:px-5 py-2 rounded-full shadow-2xl shadow-orange-500/50 animate-bounce flex items-center gap-1.5 border border-amber-300">
      <Zap class="w-3.5 h-3.5 animate-spin text-slate-950" />
      <span>{{ senderPowerUpNotice }}</span>
    </div>

    <!-- Sender Beam Animation FX -->
    <div v-if="isShootingBeam" class="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <div class="absolute inset-0 bg-amber-400/10 animate-ping"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-amber-400/20 via-rose-500/20 to-violet-500/20 blur-3xl animate-pulse"></div>
    </div>

    <!-- Round Header Bar -->
    <div class="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border-b border-white/10 flex-shrink-0 z-10">
      <div class="flex items-center gap-1.5 sm:gap-2">
        <div class="w-6 sm:w-7 h-6 sm:h-7 rounded-lg bg-rose-500/30 flex items-center justify-center">
          <Zap class="w-3 sm:w-3.5 h-3 sm:h-3.5 text-rose-400" />
        </div>
        <span class="font-extrabold text-xs sm:text-sm">Ronde {{ store.activeRound?.round_number ?? '?' }}</span>
      </div>
      
      <!-- Readiness Status Badge -->
      <div class="flex items-center gap-2">
        <div v-if="store.phase === 'round_preparing'" class="px-2.5 sm:px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-bold flex items-center gap-1.5 animate-pulse">
          <Loader2 class="w-3 h-3 text-amber-400 animate-spin" />
          <span>Menunggu Ronde...</span>
        </div>
        <div v-else-if="store.phase === 'round_active' && !isPenaltyActive && !isSubmitted" class="px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
          <span class="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>🟢 SIAP MENGETIK!</span>
        </div>
      </div>

      <!-- Header Timer (Only shown when active) -->
      <div v-if="store.phase === 'round_active'" class="flex items-center gap-1 text-xs sm:text-sm font-mono font-bold" :class="store.countdownSeconds <= 5 ? 'text-rose-400' : 'text-slate-300'">
        <Clock class="w-3.5 h-3.5" />
        {{ String(store.countdownSeconds).padStart(2, '0') }}s
      </div>
      <div v-else class="flex items-center gap-1 text-xs text-amber-400 font-bold animate-pulse">
        <Loader2 class="w-3.5 h-3.5 animate-spin" />
      </div>
    </div>

    <!-- Timer Bar (Only shown when active) -->
    <div v-if="store.phase === 'round_active'" class="h-1 sm:h-1.5 bg-white/10 flex-shrink-0 z-10">
      <div
        class="h-full transition-all duration-500"
        :class="timerColor"
        :style="{ width: timerWidth }"
      ></div>
    </div>

    <!-- MOBILE ONLY: Compact Horizontal Player Avatar Bar (No vertical dividing line) -->
    <div class="md:hidden flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border-b border-white/10 overflow-x-auto flex-shrink-0 z-10 no-scrollbar">
      <div
        v-for="player in store.alivePlayers"
        :key="player.player_id"
        class="flex items-center gap-1.5 bg-white/5 rounded-full px-2 py-0.5 border border-white/10 flex-shrink-0 text-[10px]"
      >
        <div
          class="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white"
          :style="`background: ${avatarColor(player.player_name)}`"
        >{{ player.player_name.slice(0, 1).toUpperCase() }}</div>
        <span class="font-bold max-w-[60px] truncate" :class="player.player_id === store.myPlayerId ? 'text-amber-300' : 'text-slate-300'">
          {{ player.player_id === store.myPlayerId ? 'Kamu' : player.player_name }}
        </span>

        <!-- Active Powerup Badge on Enemy Avatar -->
        <span v-if="store.activePowerUpEvents.has(player.player_id)" class="text-[8px] font-black">
          <span v-if="store.activePowerUpEvents.get(player.player_id)?.type === 'freeze'">❄️</span>
          <span v-else-if="store.activePowerUpEvents.get(player.player_id)?.type === 'storm'">⚡</span>
          <span v-else>⏪</span>
        </span>

        <!-- Mini Progress -->
        <span class="font-mono text-[9px] text-indigo-300 font-bold ml-0.5">
          {{ player.player_id === store.myPlayerId
            ? `${Math.round((activeUnitIndex / Math.max(1, units.length)) * 100)}%`
            : `${getProgress(player.player_id)}%`
          }}
        </span>
      </div>
    </div>

    <!-- Sentence Counter & Meaning Hint -->
    <div class="px-3 pt-2 pb-1 text-center flex-shrink-0 z-10 flex flex-col items-center gap-0.5">
      <div v-if="totalSentencesCount > 1" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[11px] font-extrabold shadow-sm">
        <span>Kalimat {{ currentSentenceIndex + 1 }} dari {{ totalSentencesCount }}</span>
      </div>
      <span class="text-[11px] sm:text-xs text-slate-400 font-medium truncate max-w-xs sm:max-w-md">{{ activeSentence?.meaning ?? '' }}</span>
    </div>

    <!-- Main Content: Sentence + Input + Players Panel -->
    <div class="flex-1 flex overflow-hidden relative">

      <!-- CENTER: Typing area (clicking anywhere focuses input) -->
      <div
        @click="focusInput"
        class="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto cursor-pointer relative"
      >

        <!-- Sentence (Japanese) display with active character pointer & Power-Up Badge -->
        <div class="mb-3 sm:mb-6 text-2xl sm:text-4xl md:text-5xl font-bold tracking-wide text-center flex flex-wrap items-center justify-center gap-x-1.5 sm:gap-x-2 gap-y-3 sm:gap-y-6 min-h-[50px] sm:min-h-[70px] w-full max-w-xl">
          <template v-for="(unit, idx) in units" :key="idx">
            <div class="relative inline-flex flex-col items-center">

              <!-- Power-Up Badge Icon above target word unit (Hidden once claimed or hangus) -->
              <div
                v-if="idx === powerUpUnitIndex && !claimedPowerUpUnits.has(idx) && !failedPowerUpUnits.has(idx)"
                class="absolute -top-5 sm:-top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-wider uppercase shadow-md transition whitespace-nowrap z-20 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 animate-bounce"
              >
                <span v-if="powerUpType === 'freeze'">❄️ FREEZE</span>
                <span v-else-if="powerUpType === 'backward'">⏪ REWIND</span>
                <span v-else>⚡ STORM</span>
              </div>

              <!-- Completed Japanese character/word -->
              <span v-if="idx < activeUnitIndex" class="text-emerald-400 font-extrabold">{{ unit.kana }}</span>

              <!-- Current active Japanese character/word pointer -->
              <span v-else-if="idx === activeUnitIndex" class="text-amber-300 font-black bg-amber-400/25 px-1.5 sm:px-2 py-0.5 rounded-lg sm:rounded-xl animate-pulse shadow-lg shadow-amber-400/20 underline underline-offset-4 sm:underline-offset-8 decoration-amber-400">
                {{ unit.kana }}
              </span>

              <!-- Upcoming Japanese character/word -->
              <span v-else class="text-slate-400/70 font-medium">{{ unit.kana }}</span>
            </div>
          </template>
        </div>

        <!-- Typed romaji display (shows completed characters + ONLY 1 upcoming character) -->
        <div
          :class="[
            'w-full max-w-lg mb-3 sm:mb-5 bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-5 min-h-[50px] sm:min-h-[70px] flex flex-wrap items-center justify-center gap-x-0.5 gap-y-1 font-mono text-xl sm:text-2xl md:text-3xl transition-all duration-200 relative tracking-wider',
            isStormActive && !lightningFlashActive ? 'brightness-[0.05] opacity-10' : '',
            store.phase === 'round_active' && !isPenaltyActive && !isSubmitted
              ? 'border-2 border-emerald-500/80 bg-emerald-950/10 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/10'
              : 'border border-white/10'
          ]"
        >
          <template v-for="(unit, idx) in units" :key="idx">
            <!-- Completed units -->
            <span v-if="idx < activeUnitIndex" class="text-emerald-400 font-bold">{{ unit.acceptedRomaji[0] }}</span>

            <!-- Active unit: shows typed portion + ONLY 1 next upcoming character -->
            <span v-else-if="idx === activeUnitIndex" class="inline-flex items-center">
              <!-- Typed portion of current unit -->
              <span class="text-white font-bold">{{ (lockedAccepted ?? '').slice(0, activeSubIndex) }}</span>
              <!-- ONLY 1 next upcoming character to type -->
              <span class="text-amber-300 underline underline-offset-4 bg-amber-400/25 px-1 sm:px-1.5 py-0.5 rounded-lg font-black animate-pulse text-xl sm:text-2xl md:text-3xl shadow-sm shadow-amber-400/30">
                {{ (lockedAccepted ?? unit.acceptedRomaji[0])[activeSubIndex] ?? '' }}
              </span>
            </span>

            <!-- Future/pending units: hidden (only 1 upcoming letter is visible) -->
          </template>
        </div>

        <!-- Hidden input to capture keystrokes -->
        <input
          ref="inputRef"
          type="text"
          class="opacity-0 absolute w-0 h-0 pointer-events-none"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="none"
          spellcheck="false"
          :disabled="isSubmitted || !store.iAmAlive || store.phase !== 'round_active' || isPenaltyActive || isFrozen"
          @input="handleInput"
          @paste.prevent="preventPaste"
          @keydown.prevent.space=""
        />

        <!-- Typing status button indicator -->
        <div class="mt-1 sm:mt-2">
          <button
            v-if="store.phase === 'round_active' && !isPenaltyActive && !isSubmitted && !isFrozen"
            @click.stop="focusInput"
            class="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/50 rounded-xl text-xs sm:text-sm font-extrabold text-white transition shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer animate-pulse"
          >
            <PlayCircle class="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span>Ketik Sekarang! (Keyboard Aktif)</span>
          </button>
        </div>

        <!-- Submission feedback -->
        <div v-if="isSubmitted && store.mySubmissionStatus" class="mt-3 flex items-center gap-2 text-xs sm:text-sm font-bold">
          <template v-if="store.mySubmissionStatus === 'success'">
            <CheckCircle2 class="w-4 sm:w-5 h-4 sm:h-5 text-emerald-400" />
            <span class="text-emerald-400">Berhasil! {{ store.myCompletionTimeMs ? (store.myCompletionTimeMs / 1000).toFixed(2) + 's' : '' }}</span>
          </template>
          <template v-else-if="store.mySubmissionStatus === 'typo'">
            <ShieldX class="w-4 sm:w-5 h-4 sm:h-5 text-rose-400" />
            <span class="text-rose-400">Waktu habis sebelum selesai!</span>
          </template>
          <template v-else>
            <span class="text-slate-400">Menunggu validasi server...</span>
          </template>
        </div>

        <!-- Spectator notice -->
        <div v-if="!store.iAmAlive" class="mt-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 text-xs sm:text-sm font-bold flex items-center gap-2">
          <ShieldX class="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          Kamu sedang spectating. Tidak bisa mengetik.
        </div>
      </div>

      <!-- DESKTOP ONLY: Players progress Sidebar Panel -->
      <div class="hidden md:flex w-48 flex-shrink-0 border-l border-white/10 overflow-y-auto p-3 flex-col gap-2">
        <div class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Pemain</div>

        <div
          v-for="player in store.alivePlayers"
          :key="player.player_id"
          class="bg-white/5 rounded-xl p-2.5 relative"
        >
          <div class="flex items-center gap-1.5 mb-1">
            <div
              class="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
              :style="`background: ${avatarColor(player.player_name)}`"
            >{{ player.player_name.slice(0, 2).toUpperCase() }}</div>
            <span class="text-xs font-bold truncate flex-1 min-w-0">
              {{ player.player_id === store.myPlayerId ? 'Kamu' : player.player_name }}
            </span>
            <CheckCircle2
              v-if="store.playersWhoSubmitted.has(player.player_id)"
              class="w-3 h-3 text-emerald-400 flex-shrink-0"
            />
          </div>

          <!-- Active Powerup Badge on Enemy Avatar -->
          <div
            v-if="store.activePowerUpEvents.has(player.player_id)"
            class="mb-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded flex items-center justify-center gap-1 animate-pulse"
            :class="store.activePowerUpEvents.get(player.player_id)?.type === 'freeze'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : (store.activePowerUpEvents.get(player.player_id)?.type === 'storm'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40')"
          >
            <span v-if="store.activePowerUpEvents.get(player.player_id)?.type === 'freeze'">❄️ BEKU</span>
            <span v-else-if="store.activePowerUpEvents.get(player.player_id)?.type === 'storm'">⚡ BADAI</span>
            <span v-else>⏪ REWIND</span>
          </div>

          <!-- Progress bar -->
          <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
              :style="{ width: player.player_id === store.myPlayerId
                ? `${Math.round((activeUnitIndex / Math.max(1, units.length)) * 100)}%`
                : `${getProgress(player.player_id)}%`
              }"
            ></div>
          </div>
        </div>

        <!-- Eliminated players -->
        <div v-if="store.eliminatedPlayers.length > 0">
          <div class="text-[10px] text-slate-600 font-bold uppercase tracking-widest my-2">Gugur</div>
          <div
            v-for="player in store.eliminatedPlayers"
            :key="player.player_id"
            class="bg-white/[0.03] rounded-xl p-2.5 opacity-50"
          >
            <div class="flex items-center gap-1.5">
              <div class="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500 flex-shrink-0">
                {{ player.player_name.slice(0, 2).toUpperCase() }}
              </div>
              <span class="text-xs text-slate-500 truncate flex-1">{{ player.player_name }}</span>
              <ShieldX class="w-3 h-3 text-rose-800 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- VICTIM FREEZE OVERLAY ❄️ -->
    <div v-if="isFrozen" class="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-center bg-cyan-950/70 backdrop-blur-md border-4 sm:border-8 border-cyan-400/40 animate-fadeIn">
      <div class="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl sm:rounded-3xl bg-cyan-500/30 border border-cyan-300/50 flex items-center justify-center shadow-2xl shadow-cyan-500/50 mb-3 sm:mb-4 animate-bounce">
        <span class="text-4xl sm:text-5xl">❄️</span>
      </div>
      <div class="text-center px-4">
        <div class="text-[10px] sm:text-xs text-cyan-300 font-extrabold tracking-widest uppercase mb-1">SERANGAN LAWAN • FREEZE!</div>
        <h2 class="text-2xl sm:text-3xl font-black text-white drop-shadow-md">LAYAR BEKU — INPUT TERKUNCI!</h2>
        <div class="mt-3 sm:mt-4 inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-cyan-950/90 border border-cyan-400/50 font-mono text-cyan-300 font-black text-lg sm:text-xl shadow-xl">
          <Clock class="w-4 sm:w-5 h-4 sm:h-5 animate-spin text-cyan-300" />
          <span>{{ freezeCountdown.toFixed(1) }}s</span>
        </div>
      </div>
    </div>

    <!-- VICTIM BACKWARD REWIND OVERLAY ⏪ -->
    <div v-if="isRewindingGlitch" class="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-center bg-rose-950/70 backdrop-blur-md animate-pulse">
      <div class="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-rose-500/40 border border-rose-400/50 flex items-center justify-center text-3xl sm:text-4xl mb-3 animate-spin">
        ⏪
      </div>
      <div class="text-center">
        <div class="text-[10px] sm:text-xs text-rose-300 font-bold uppercase tracking-widest mb-1">TIME REWIND ATTACK!</div>
        <h2 class="text-xl sm:text-2xl font-black text-white">TERLEMPAR MUNDUR -3 KATA!</h2>
      </div>
    </div>

    <!-- VICTIM STORM OVERLAY ⚡ -->
    <div v-if="isStormActive" class="fixed inset-0 pointer-events-none z-40 bg-slate-950/85 flex flex-col items-center justify-start pt-12 sm:pt-16">
      <div v-if="lightningFlashActive" class="absolute inset-0 bg-amber-300/30 backdrop-brightness-200 transition-opacity"></div>
      <div class="relative z-10 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-slate-900/90 border border-amber-400/50 text-amber-300 font-extrabold text-xs sm:text-sm shadow-xl">
        <span class="text-base sm:text-lg">⚡</span>
        <span>BADAI PETIR • HINT TERANG SAAT PETIR!</span>
        <span class="font-mono text-white bg-amber-500/30 px-1.5 sm:px-2 py-0.5 rounded text-[11px] sm:text-xs ml-1">{{ stormCountdown.toFixed(1) }}s</span>
      </div>
    </div>

    <!-- PRE-ROUND COUNTDOWN OVERLAY (phase === 'round_preparing') -->
    <div
      v-if="store.phase === 'round_preparing'"
      class="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn"
    >
      <div class="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-3 sm:mb-4 text-amber-300 shadow-xl shadow-amber-500/20">
        <Lock class="w-7 sm:w-8 h-7 sm:h-8 text-amber-400" />
      </div>
      <h2 class="text-xl sm:text-2xl font-black text-white mb-2">Persiapkan Diri! 🚀</h2>
      <p class="text-slate-400 text-xs sm:text-sm mb-6 max-w-sm">Ronde akan dimulai. Ketik kalimat romaji begitu countdown selesai!</p>
      
      <div class="text-6xl sm:text-7xl font-black font-mono text-amber-400 mb-2 animate-bounce">
        {{ prepCountdownSeconds > 0 ? prepCountdownSeconds : 'SIAP!' }}
      </div>
      <span class="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">
        {{ prepCountdownSeconds > 0 ? 'Detik Lagi...' : 'Mulai Mengetik Sekarang! ⚡' }}
      </span>
    </div>

    <!-- TYPO PENALTY 1-SECOND COOLDOWN OVERLAY (isPenaltyActive === true) -->
    <div
      v-if="isPenaltyActive"
      class="absolute inset-0 z-50 bg-rose-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn"
    >
      <div class="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl sm:rounded-3xl bg-rose-500/30 border-2 border-rose-500/60 flex items-center justify-center mb-3 sm:mb-4 text-rose-300 shadow-2xl shadow-rose-600/40 animate-pulse">
        <AlertTriangle class="w-8 sm:w-10 h-8 sm:h-10 text-rose-400" />
      </div>
      <h2 class="text-2xl sm:text-3xl font-black text-white mb-1">TYPO DETECTED! ⚠️</h2>
      <p class="text-rose-200 text-xs sm:text-sm mb-6 font-bold">Penalti 1 Detik Cooldown — Dilarang Mengetik!</p>
      
      <div class="text-6xl sm:text-7xl font-black font-mono text-white mb-2 tracking-tight">
        {{ penaltyTimeLeft }}s
      </div>
      <span class="text-[10px] sm:text-xs text-rose-300/80 font-bold uppercase tracking-widest">Tunggu Cooldown Selesai...</span>
    </div>

  </div>
</template>
