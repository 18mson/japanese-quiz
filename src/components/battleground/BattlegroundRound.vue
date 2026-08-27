<script setup lang="ts">
// BattlegroundRound.vue
// Layar typing aktif dengan indikator kesiapan mengetik & 1s typo penalty cooldown.

import {
  ref, computed, watch, onMounted, onUnmounted, nextTick
} from 'vue';
import { toRomaji } from 'wanakana';
import { useBattlegroundStore } from '../../stores/battlegroundStore';
import {
  isMuted, toggleMute, getAudioContext,
  playCountdownBeep, playPowerUpGain, playLightningStrike,
  playFreezeSound, playPenaltyError, startRoundBgm, stopRoundBgm
} from '../../utils/battleSoundManager';
import { ShieldX, CheckCircle2, Clock, Zap, AlertTriangle, PlayCircle, Lock, Volume2, VolumeX, Loader2 } from '@lucide/vue';
import VirtualKeyboard from '../VirtualKeyboard.vue';
import { getPlayerColor, type PlayerColorDef } from '../../utils/playerColors';

const store = useBattlegroundStore();

const soundMuted = ref(isMuted());

function handleToggleSound() {
  soundMuted.value = toggleMute();
  getAudioContext();
}

// ── Input State ───────────────────────────────────────────────
const inputRef = ref<HTMLInputElement | null>(null);
const userInput = ref('');
const hasError = ref(false);
const isSubmitted = ref(false);

// ── Scoring Counters ──────────────────────────────────────────
const correctCharsCount = ref(0);
const wrongCharsCount = ref(0);

// ── Mobile Keyboard Handling ────────────────────────────────
// Gunakan visualViewport API untuk mendeteksi munculnya keyboard on-screen.
// Saat keyboard muncul, viewport height mengecil. Selisihnya = tinggi keyboard.
// Kita pakai selisih ini sebagai padding-bottom agar konten tidak tertutup.
const keyboardHeight = ref(0);

function onViewportResize() {
  if (!window.visualViewport) return;
  const vv = window.visualViewport;
  // offsetTop: berapa piksel viewport telah di-scroll (e.g. browser chrome yang hilang)
  const keyboard = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
  keyboardHeight.value = keyboard;
}

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
  }
});
function getRainStyle(n: number) {
  const left = (n * 2.5) % 100;
  const delay = (n * 0.08) % 1.0;
  const duration = 0.3 + (n % 4) * 0.1;
  const height = 50 + (n % 5) * 25;
  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    height: `${height}px`,
  };
}

function getSnowStyle(n: number) {
  const angleRad = (n * 137.5 * Math.PI) / 180;
  const distanceVw = 32 + (n % 6) * 7.5;
  const distanceVh = 32 + (n % 6) * 7.5;
  const dx = Math.cos(angleRad) * distanceVw;
  const dy = Math.sin(angleRad) * distanceVh;

  const size = 3.5 + (n % 4) * 1.5;
  const duration = 1.5 + (n % 5) * 0.3;
  const delay = (n % 8) * 0.2;

  return {
    '--dx': `${dx.toFixed(1)}vw`,
    '--dy': `${dy.toFixed(1)}vh`,
    width: `${size}px`,
    height: `${size}px`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
  };
}
const victimPowerUpAttacker = ref('');

function applyVictimPowerUp(type: 'freeze' | 'backward' | 'storm', senderName: string) {
  victimPowerUpAttacker.value = senderName;
  if (type === 'freeze') {
    playFreezeSound();
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
    playLightningStrike();
    isRewindingGlitch.value = true;
    setTimeout(() => (isRewindingGlitch.value = false), 1000);
    activeUnitIndex.value = Math.max(0, activeUnitIndex.value - 3);
    activeSubIndex.value = 0;
    lockedAccepted.value = null;
  } else if (type === 'storm') {
    playLightningStrike();
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
      playLightningStrike();
      setTimeout(() => {
        lightningFlashActive.value = false;
      }, 350);
    }, 1400);
  }
}

watch(prepCountdownSeconds, (val, oldVal) => {
  if (store.phase === 'round_preparing' && val !== oldVal && val >= 0) {
    playCountdownBeep(val === 0);
  }
});

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
    startRoundBgm();
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
    correctCharsCount.value = 0;
    wrongCharsCount.value = 0;
    initSentencePowerUp();
    autoSkipHyphens();
    focusInput();
  } else {
    stopRoundBgm();
  }
}, { immediate: true });

onMounted(() => {
  initSentencePowerUp();
  autoSkipHyphens();
  focusInput();
  window.visualViewport?.addEventListener('resize', onViewportResize);
  window.visualViewport?.addEventListener('scroll', onViewportResize);
  window.addEventListener('resize', handleMarkerResize);
});
onUnmounted(() => {
  if (progressThrottle) clearTimeout(progressThrottle);
  if (penaltyInterval) clearInterval(penaltyInterval);
  if (prepTimer) clearInterval(prepTimer);
  if (freezeTimer) clearInterval(freezeTimer);
  if (stormTimer) clearInterval(stormTimer);
  if (lightningInterval) clearInterval(lightningInterval);
  window.visualViewport?.removeEventListener('resize', onViewportResize);
  window.visualViewport?.removeEventListener('scroll', onViewportResize);
  window.removeEventListener('resize', handleMarkerResize);
});

function handleInput(event: Event) {
  if (isSubmitted.value || !store.iAmAlive || isPenaltyActive.value || isFrozen.value || store.phase !== 'round_active') return;
  const input = event.target as HTMLInputElement;
  const typed = input.value;
  processTyped(typed);
  input.value = '';
}

function processTyped(typed: string) {
  focusInput();
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
  correctCharsCount.value++;
  throttledProgressBroadcast();

  if (activeSubIndex.value >= lockedAccepted.value!.length) {
    const justCompletedUnitIndex = activeUnitIndex.value;
    activeUnitIndex.value++;
    activeSubIndex.value = 0;
    lockedAccepted.value = null;

    if (justCompletedUnitIndex === powerUpUnitIndex.value) {
      if (!failedPowerUpUnits.value.has(justCompletedUnitIndex) && !claimedPowerUpUnits.value.has(justCompletedUnitIndex)) {
        claimedPowerUpUnits.value.add(justCompletedUnitIndex);
        playPowerUpGain();
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

  playPenaltyError();
  failedPowerUpUnits.value.add(activeUnitIndex.value);
  hasError.value = true;
  isPenaltyActive.value = true;
  penaltyTimeLeft.value = '1.0';
  wrongCharsCount.value++;
  throttledProgressBroadcast();

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
    correctChars: correctCharsCount.value,
    wrongChars: wrongCharsCount.value,
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
      sentenceIndex: currentSentenceIndex.value,
      activeUnitIndex: activeUnitIndex.value,
      completedSentences: currentSentenceIndex.value,
      totalSentences: totalCount,
      progressPercentage: overallPct,
      correctChars: correctCharsCount.value,
      wrongChars: wrongCharsCount.value,
    });
    progressThrottle = null;
  }, 100);
}

// ── Live Progress Markers Logic ──────────────────────────────
interface LiveMarker {
  playerId: string;
  playerName: string;
  colorDef: PlayerColorDef;
  sentenceIndex: number;
  activeUnitIndex: number;
  isSameSentence: boolean;
  isBehind: boolean;
  isAhead: boolean;
  stackIndex: number;
}

const liveMarkers = computed<LiveMarker[]>(() => {
  if (!store.alivePlayers || store.alivePlayers.length === 0) return [];
  const myId = store.myPlayerId;
  const currentSentIdx = currentSentenceIndex.value;

  const result: LiveMarker[] = [];
  const stackMap = new Map<string, number>();

  for (const player of store.alivePlayers) {
    if (player.player_id === myId) continue;

    const pProgress = store.playerProgress.get(player.player_id);
    const sentIdx = pProgress?.sentenceIndex ?? 0;
    const unitIdx = pProgress?.activeUnitIndex ?? 0;
    const colorDef = getPlayerColor(player.player_id, store.players);

    const isSameSentence = sentIdx === currentSentIdx;
    const isBehind = sentIdx < currentSentIdx;
    const isAhead = sentIdx > currentSentIdx;

    let posKey = '';
    if (isSameSentence) {
      posKey = `unit_${unitIdx}`;
    } else if (isBehind) {
      posKey = 'edge_left';
    } else {
      posKey = 'edge_right';
    }

    const currentStack = stackMap.get(posKey) ?? 0;
    stackMap.set(posKey, currentStack + 1);

    result.push({
      playerId: player.player_id,
      playerName: player.player_name,
      colorDef,
      sentenceIndex: sentIdx,
      activeUnitIndex: unitIdx,
      isSameSentence,
      isBehind,
      isAhead,
      stackIndex: currentStack,
    });
  }

  return result;
});

const sameSentenceMarkers = computed(() => {
  return liveMarkers.value.filter((m) => m.isSameSentence);
});

const leftEdgeMarkers = computed(() => {
  return liveMarkers.value.filter((m) => m.isBehind);
});

const rightEdgeMarkers = computed(() => {
  return liveMarkers.value.filter((m) => m.isAhead);
});

// Dynamic Marker Positioning & Transition across units
const unitElMap = ref<Map<number, HTMLElement>>(new Map());
const layoutTick = ref(0);

function setUnitRef(el: any, idx: number) {
  if (el) {
    unitElMap.value.set(idx, el as HTMLElement);
  } else {
    unitElMap.value.delete(idx);
  }
}

function handleMarkerResize() {
  layoutTick.value++;
}

function getMarkerPositionStyle(marker: LiveMarker) {
  void layoutTick.value;
  const el = unitElMap.value.get(marker.activeUnitIndex);

  if (!el) {
    const total = Math.max(1, units.value.length);
    const pct = Math.min(95, Math.max(5, ((marker.activeUnitIndex + 0.5) / total) * 100));
    return {
      left: `${pct.toFixed(2)}%`,
      top: '0px',
      transform: `translate(-50%, -100%) translateY(${-(marker.stackIndex * 22)}px)`,
    };
  }

  const left = el.offsetLeft + el.offsetWidth / 2;
  const top = el.offsetTop - (marker.stackIndex * 22);

  return {
    left: `${left}px`,
    top: `${top}px`,
    transform: 'translate(-50%, -100%) translateY(10px)',
  };
}

function getPowerUpHighlightClass(type: string, isActive: boolean): string {
  const baseActive = isActive ? 'underline underline-offset-4 sm:underline-offset-8 font-black ' : 'font-bold ';
  if (type === 'freeze') {
    return baseActive + 'bg-cyan-500/40 text-cyan-200 border-2 border-cyan-400/90 shadow-[0_0_18px_rgba(6,182,212,0.8)] ring-2 ring-cyan-400/30 animate-pulse rounded-lg sm:rounded-xl px-1.5 sm:px-2 py-0.5';
  } else if (type === 'backward') {
    return baseActive + 'bg-rose-500/40 text-rose-200 border-2 border-rose-400/90 shadow-[0_0_18px_rgba(244,63,94,0.8)] ring-2 ring-rose-400/30 animate-pulse rounded-lg sm:rounded-xl px-1.5 sm:px-2 py-0.5';
  } else {
    return baseActive + 'bg-amber-500/40 text-amber-200 border-2 border-amber-400/90 shadow-[0_0_18px_rgba(245,158,11,0.8)] ring-2 ring-amber-400/30 animate-pulse rounded-lg sm:rounded-xl px-1.5 sm:px-2 py-0.5';
  }
}

// ── Player Panel ──────────────────────────────────────────────
function getProgress(playerId: string): number {
  const p = store.playerProgress.get(playerId);
  if (!p) return 0;
  return p.progressPercentage;
}

function avatarColor(playerId: string): string {
  return getPlayerColor(playerId, store.players).hex;
}

function preventPaste(e: ClipboardEvent) {
  e.preventDefault();
}
</script>

<template>
  <div class="flex flex-col h-full bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white overflow-hidden relative select-none">
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

      <!-- Header Right: Timer & Audio Toggle -->
      <div class="flex items-center gap-3">
        <button
          @click="handleToggleSound"
          class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          :title="soundMuted ? 'Aktifkan Suara' : 'Matikan Suara'"
        >
          <VolumeX v-if="soundMuted" class="w-3.5 h-3.5 text-rose-400" />
          <Volume2 v-else class="w-3.5 h-3.5 text-indigo-400" />
        </button>

        <div v-if="store.phase === 'round_active'" class="flex items-center gap-1 text-xs sm:text-sm font-mono font-bold" :class="store.countdownSeconds <= 5 ? 'text-rose-400' : 'text-slate-300'">
          <Clock class="w-3.5 h-3.5" />
          {{ String(store.countdownSeconds).padStart(2, '0') }}s
        </div>
        <div v-else class="flex items-center gap-1 text-xs text-amber-400 font-bold animate-pulse">
          <Loader2 class="w-3.5 h-3.5 animate-spin" />
        </div>
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
    <div class="px-3 pt-2 pb-1 text-center flex-shrink-0 z-1 flex flex-col items-center gap-0.5">
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
        class="flex-1 flex flex-col items-center justify-start md:justify-center px-3 pb-3 pt-8 sm:px-6 sm:pt-10 overflow-y-auto cursor-pointer relative"
        :style="keyboardHeight > 0 ? { paddingBottom: keyboardHeight + 'px' } : { paddingBottom: '1.5rem' }"
      >

        <!-- Sentence (Japanese) display with active character pointer, Power-Up Highlight & Live Progress Markers -->
        <div class="pt-7 sm:pt-9 mb-3 sm:mb-6 text-2xl sm:text-4xl md:text-5xl font-bold tracking-wide text-center flex flex-wrap items-center justify-center gap-x-1.5 sm:gap-x-2 gap-y-7 sm:gap-y-9 min-h-[60px] sm:min-h-[80px] w-full max-w-xl relative overflow-visible font-jp">
          <!-- Left Edge Markers (Players on previous sentences - Opacity 50%) -->
          <div v-if="leftEdgeMarkers.length > 0" class="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-25 opacity-50 transition-opacity pointer-events-none">
            <div
              v-for="marker in leftEdgeMarkers"
              :key="marker.playerId"
              class="w-5 sm:w-6 h-5 sm:h-6 rounded-full flex items-center justify-center shadow-md transition-all duration-300 animate-bounce border-2 border-white/90"
              :class="marker.colorDef.bgClass"
              :style="{ transform: `translateY(-${marker.stackIndex * 20}px)` }"
              :title="`${marker.playerName} (Kalimat Sebelum)`"
            >
              <span class="text-[9px] sm:text-[10px] font-black text-white leading-none uppercase">
                {{ marker.playerName.charAt(0) }}
              </span>
            </div>
          </div>

          <!-- Right Edge Markers (Players on future sentences - Opacity 50%) -->
          <div v-if="rightEdgeMarkers.length > 0" class="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-25 opacity-50 transition-opacity pointer-events-none">
            <div
              v-for="marker in rightEdgeMarkers"
              :key="marker.playerId"
              class="w-5 sm:w-6 h-5 sm:h-6 rounded-full flex items-center justify-center shadow-md transition-all duration-300 animate-bounce border-2 border-white/90"
              :class="marker.colorDef.bgClass"
              :style="{ transform: `translateY(-${marker.stackIndex * 20}px)` }"
              :title="`${marker.playerName} (Kalimat Depan)`"
            >
              <span class="text-[9px] sm:text-[10px] font-black text-white leading-none uppercase">
                {{ marker.playerName.charAt(0) }}
              </span>
            </div>
          </div>

          <!-- Same Sentence Live Player Markers (animated smooth movement across units) -->
          <TransitionGroup name="marker-anim">
            <div
              v-for="marker in sameSentenceMarkers"
              :key="marker.playerId"
              class="absolute pointer-events-none z-25 transition-all duration-400 cubic-bezier(0.34,1.56,0.64,1) flex flex-col items-center"
              :style="getMarkerPositionStyle(marker)"
            >
              <div
                class="w-5 sm:w-6 h-5 sm:h-6 rounded-full flex items-center justify-center shadow-lg animate-bounce border-2 border-white/90 flex-shrink-0"
                :class="[marker.colorDef.bgClass, marker.colorDef.glowClass]"
                :title="`${marker.playerName} (Karakter ${marker.activeUnitIndex + 1})`"
              >
                <span class="text-[9px] sm:text-[10px] font-black text-white leading-none select-none uppercase shadow-sm">
                  {{ marker.playerName.charAt(0) }}
                </span>
              </div>
            </div>
          </TransitionGroup>

          <template v-for="(unit, idx) in units" :key="idx">
            <div
              :ref="(el) => setUnitRef(el, idx)"
              class="relative inline-flex flex-col items-center font-jp"
            >
              <!-- Completed Japanese character/word -->
              <span v-if="idx < activeUnitIndex" class="text-emerald-400 font-extrabold font-jp">{{ unit.kana }}</span>

              <!-- Current active Japanese character/word pointer (Custom highlight if power-up) -->
              <span
                v-else-if="idx === activeUnitIndex"
                :class="[
                  idx === powerUpUnitIndex && !claimedPowerUpUnits.has(idx) && !failedPowerUpUnits.has(idx)
                    ? getPowerUpHighlightClass(powerUpType, true)
                    : 'text-amber-300 font-black bg-amber-400/25 px-1.5 sm:px-2 py-0.5 rounded-lg sm:rounded-xl animate-pulse shadow-lg shadow-amber-400/20 underline underline-offset-4 sm:underline-offset-8 decoration-amber-400',
                  'font-jp'
                ]"
              >
                {{ unit.kana }}
              </span>

              <!-- Upcoming Japanese character/word (Custom highlight if power-up) -->
              <span
                v-else
                :class="[
                  idx === powerUpUnitIndex && !claimedPowerUpUnits.has(idx) && !failedPowerUpUnits.has(idx)
                    ? getPowerUpHighlightClass(powerUpType, false)
                    : 'text-slate-400/70 font-medium',
                  'font-jp'
                ]"
              >
                {{ unit.kana }}
              </span>
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
          inputmode="none"
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
    <div v-if="isFrozen" class="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-center bg-cyan-950/75 border-4 sm:border-8 border-cyan-400/40 animate-fadeIn overflow-hidden">
      <!-- Ice caustics texture background -->
      <img src="/battle/water_caustics_a.png" class="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-screen" style="filter: hue-rotate(180deg) brightness(2) saturate(3);" />
      
      <!-- Snow particles bursting/floating outwards from center to all sides -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div v-for="n in 45" :key="n" class="snow-particle" :style="getSnowStyle(n)"></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 flex flex-col items-center">
        <div class="text-center px-4">
          <div class="text-[10px] sm:text-xs text-cyan-300 font-extrabold tracking-widest uppercase mb-1">SERANGAN LAWAN • FREEZE!</div>
          <h2 class="text-2xl sm:text-3xl font-black text-white drop-shadow-md">LAYAR BEKU — INPUT TERKUNCI!</h2>
          <div class="mt-3 sm:mt-4 inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-cyan-950/90 border border-cyan-400/50 font-mono text-cyan-300 font-black text-lg sm:text-xl shadow-xl">
            <Clock class="w-4 sm:w-5 h-4 sm:h-5 animate-spin text-cyan-300" />
            <span>{{ freezeCountdown.toFixed(1) }}s</span>
          </div>
        </div>
      </div>
    </div>

    <!-- VICTIM BACKWARD REWIND OVERLAY ⏪ -->
    <div v-if="isRewindingGlitch" class="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-center bg-rose-950/85 overflow-hidden animate-glitch-screen">
      <!-- Right-to-Left sweeping laser/light beams & Glitch Slice overlays -->
      <div class="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        <!-- Wide gradient light beam sweeping right to left -->
        <div class="absolute inset-y-0 w-[120vw] bg-gradient-to-l from-transparent via-rose-500/50 to-transparent mix-blend-screen animate-rewind-sweep-1"></div>
        <div class="absolute inset-y-0 w-[80vw] bg-gradient-to-l from-transparent via-red-400/60 to-transparent mix-blend-screen animate-rewind-sweep-2"></div>
        
        <!-- Glitch Scanlines & Chromatic Slices -->
        <div class="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.4)_50%,rgba(0,0,0,0.4))] bg-[length:100%_4px] pointer-events-none opacity-40"></div>
        <div class="absolute inset-0 bg-cyan-500/20 mix-blend-screen animate-glitch-slice-1"></div>
        <div class="absolute inset-0 bg-rose-500/30 mix-blend-screen animate-glitch-slice-2"></div>

        <!-- Horizontal Cone Beams moving right to left -->
        <img src="/battle/cone_c_blur.png" class="absolute top-1/2 right-0 -translate-y-1/2 w-[120vh] h-[220vw] object-fill opacity-50 mix-blend-screen -rotate-90 animate-rewind-cone-1" style="filter: hue-rotate(320deg) brightness(3.5) saturate(3);" />
        <img src="/battle/cone_c_blur.png" class="absolute top-1/2 right-0 -translate-y-1/2 w-[90vh] h-[180vw] object-fill opacity-35 mix-blend-screen -rotate-90 animate-rewind-cone-2" style="filter: hue-rotate(330deg) brightness(4) saturate(3);" />
      </div>

      <!-- Content (Icon removed, Glitch text active) -->
      <div class="relative z-10 flex flex-col items-center animate-glitch-shake px-4 text-center">
        <div class="text-xs sm:text-sm text-rose-300 font-extrabold uppercase tracking-widest mb-2 glitch-text-sm">
          TIME REWIND ATTACK!
        </div>
        <h2 class="text-2xl sm:text-4xl font-black text-white tracking-wider glitch-text">
          TERLEMPAR MUNDUR -3 KATA!
        </h2>
      </div>
    </div>

    <!-- VICTIM STORM OVERLAY ⚡ -->
    <div v-if="isStormActive" class="fixed inset-0 pointer-events-none z-40 bg-slate-950/75 overflow-hidden flex flex-col items-center justify-start pt-12 sm:pt-16">
      <!-- CSS Rain Drops Overlay (Dense vertical falling lines) -->
      <div class="absolute inset-0 w-full h-full pointer-events-none opacity-90">
        <div class="rain-drop-container">
          <div v-for="n in 40" :key="n" class="rain-line" :style="getRainStyle(n)"></div>
        </div>
      </div>

      <!-- Lightning streaks -->
      <img src="/battle/streaks_composed_b.png" class="absolute inset-0 w-full h-full object-cover mix-blend-screen animate-lightning-streak" style="filter: hue-rotate(40deg) brightness(5) saturate(3);" />

      <!-- Lightning flash -->
      <div v-if="lightningFlashActive" class="absolute inset-0 bg-amber-200/35 mix-blend-screen transition-opacity duration-75"></div>

      <!-- Content -->
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

    <!-- MOBILE VIRTUAL KEYBOARD -->
    <div
      v-if="store.phase === 'round_active' && !isSubmitted && store.iAmAlive && !isPenaltyActive && !isFrozen"
      class="block sm:hidden fixed bottom-0 left-0 right-0 z-30"
    >
      <VirtualKeyboard theme="dark" :show-enter="false" @key="processTyped" />
    </div>

  </div>
</template>

<style scoped>
/* Snow Burst Radial Particles from Center (Freeze Effect) */
@keyframes snow-burst-outward {
  0% {
    transform: translate(-50%, -50%) translate(0, 0) scale(0.2);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  75% {
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(1.3);
    opacity: 0;
  }
}

.snow-particle {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  background: radial-gradient(circle, #ffffff 0%, rgba(186, 230, 253, 0.95) 50%, rgba(56, 189, 248, 0) 100%);
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.9), 0 0 10px rgba(56, 189, 248, 0.7);
  animation: snow-burst-outward linear infinite;
  pointer-events: none;
}

/* Right-to-Left Rewind Sweeps (Rewind Effect) */
@keyframes rewind-sweep-rtl-1 {
  0%   { transform: translateX(100vw); opacity: 0; }
  25%  { opacity: 0.85; }
  75%  { opacity: 0.85; }
  100% { transform: translateX(-100vw); opacity: 0; }
}
@keyframes rewind-sweep-rtl-2 {
  0%   { transform: translateX(120vw); opacity: 0; }
  20%  { opacity: 0.9; }
  80%  { opacity: 0.9; }
  100% { transform: translateX(-120vw); opacity: 0; }
}
.animate-rewind-sweep-1 {
  animation: rewind-sweep-rtl-1 0.7s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.animate-rewind-sweep-2 {
  animation: rewind-sweep-rtl-2 0.45s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.animate-rewind-cone-1 {
  animation: rewind-sweep-rtl-1 0.6s linear infinite;
}
.animate-rewind-cone-2 {
  animation: rewind-sweep-rtl-2 0.38s linear infinite;
}

/* Digital Glitch Animations for Backward Effect */
@keyframes glitch-shake {
  0% { transform: translate(0, 0) skew(0deg); }
  10% { transform: translate(-4px, 2px) skew(-2deg); }
  20% { transform: translate(4px, -1px) skew(3deg); }
  30% { transform: translate(-2px, -3px) skew(0deg); }
  40% { transform: translate(5px, 1px) skew(-3deg); }
  50% { transform: translate(-1px, 4px) skew(1deg); }
  60% { transform: translate(3px, -3px) skew(-1deg); }
  70% { transform: translate(-5px, 0px) skew(2deg); }
  80% { transform: translate(2px, -2px) skew(-2deg); }
  90% { transform: translate(-1px, 3px) skew(1deg); }
  100% { transform: translate(0, 0) skew(0deg); }
}
.animate-glitch-shake {
  animation: glitch-shake 0.2s infinite;
}
.animate-glitch-screen {
  animation: glitch-shake 0.12s infinite;
}

@keyframes glitch-slice-1 {
  0% { clip-path: inset(20% 0 60% 0); transform: translate(-12px, 3px); }
  20% { clip-path: inset(70% 0 10% 0); transform: translate(12px, -3px); }
  40% { clip-path: inset(10% 0 80% 0); transform: translate(-14px, 4px); }
  60% { clip-path: inset(50% 0 35% 0); transform: translate(8px, -2px); }
  80% { clip-path: inset(85% 0 5% 0); transform: translate(-6px, 3px); }
  100% { clip-path: inset(30% 0 50% 0); transform: translate(7px, -4px); }
}
@keyframes glitch-slice-2 {
  0% { clip-path: inset(40% 0 45% 0); transform: translate(14px, -4px); }
  25% { clip-path: inset(5% 0 85% 0); transform: translate(-10px, 3px); }
  50% { clip-path: inset(65% 0 15% 0); transform: translate(11px, 2px); }
  75% { clip-path: inset(15% 0 70% 0); transform: translate(-8px, -3px); }
  100% { clip-path: inset(75% 0 10% 0); transform: translate(9px, 4px); }
}
.animate-glitch-slice-1 {
  animation: glitch-slice-1 0.18s steps(2, start) infinite;
}
.animate-glitch-slice-2 {
  animation: glitch-slice-2 0.14s steps(2, start) infinite;
}

.glitch-text {
  text-shadow: -4px 0 #00ffff, 4px 0 #ff0055;
  animation: glitch-text-anim 0.15s infinite;
}
.glitch-text-sm {
  text-shadow: -2px 0 #00ffff, 2px 0 #ff0055;
  animation: glitch-text-anim 0.2s infinite;
}
@keyframes glitch-text-anim {
  0% { text-shadow: -4px 0 #00ffff, 4px 0 #ff0055; }
  25% { text-shadow: 4px 0 #00ffff, -4px 0 #ff0055; }
  50% { text-shadow: -3px 3px #00ffff, 3px -3px #ff0055; }
  75% { text-shadow: 3px -3px #00ffff, -3px 3px #ff0055; }
  100% { text-shadow: -4px 0 #00ffff, 4px 0 #ff0055; }
}

/* Individual falling rain drops (Storm Effect) */
.rain-drop-container {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.rain-line {
  position: absolute;
  top: -100px;
  width: 1.5px;
  background: linear-gradient(to bottom, transparent, rgba(251, 191, 36, 0.8), rgba(255, 255, 255, 0.95));
  animation: drop-fall linear infinite;
  box-shadow: 0 0 4px rgba(251, 191, 36, 0.7);
}
@keyframes drop-fall {
  0% {
    transform: translateY(-100px);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    transform: translateY(105vh);
    opacity: 0;
  }
}

@keyframes lightning-flicker {
  0%, 85%, 100% { opacity: 0; }
  86%            { opacity: 0.55; }
  87%            { opacity: 0.1; }
  88%            { opacity: 0.6; }
  89%            { opacity: 0.05; }
}
.animate-lightning-streak {
  animation: lightning-flicker 3.5s steps(1, end) infinite;
}

/* Beam ring burst untuk Sender powerup */
@keyframes beam-ring-expand {
  0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 0.9; }
  100% { transform: translate(-50%, -50%) scale(1.3); opacity: 0; }
}
.animate-beam-ring {
  animation: beam-ring-expand 0.7s ease-out forwards;
}

/* Slow spin */
@keyframes spin-slow {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 12s linear infinite;
}

/* Fade in untuk overlay */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}

/* Marker Enter/Leave Transitions */
.marker-anim-enter-active,
.marker-anim-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.marker-anim-enter-from,
.marker-anim-leave-to {
  opacity: 0;
  transform: translate(-50%, -100%) scale(0.5);
}

/* No scrollbar utility */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
