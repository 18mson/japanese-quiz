<script setup lang="ts">
// BattlegroundRound.vue
// Layar typing aktif dengan indikator kesiapan mengetik & 1s typo penalty cooldown.

import {
  ref, computed, watch, onMounted, onUnmounted, nextTick
} from 'vue';
import { useBattlegroundStore } from '../../stores/battlegroundStore';
import {
  isMuted, toggleMute, getAudioContext,
  playCountdownBeep, playPowerUpGain,
  playPenaltyError, startRoundBgm, stopRoundBgm
} from '../../utils/battleSoundManager';
import { ShieldX, CheckCircle2, Clock, Zap, PlayCircle, Volume2, VolumeX, Loader2 } from '@lucide/vue';
import VirtualKeyboard from '../VirtualKeyboard.vue';
import { useSentenceUnits, type Unit, type ActiveSentenceDef } from '../../composables/battleground/useSentenceUnits';
import { useBattlegroundPowerUps } from '../../composables/battleground/useBattlegroundPowerUps';
import { useLiveMarkers } from '../../composables/battleground/useLiveMarkers';
import BattlegroundOverlays from './BattlegroundOverlays.vue';
import BattlegroundPlayersPanel from './BattlegroundPlayersPanel.vue';

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
const keyboardHeight = ref(0);

function onViewportResize() {
  if (!window.visualViewport) return;
  const vv = window.visualViewport;
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
const currentSentenceIndex = ref(0);

const activeSentence = computed<ActiveSentenceDef | null>(() => {
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

const { units } = useSentenceUnits(activeSentence);

// ── Typing Matching State ─────────────────────────────────────
const activeUnitIndex = ref(0);
const activeSubIndex = ref(0);
const currentUnit = computed<Unit | null>(() => units.value[activeUnitIndex.value] ?? null);
const lockedAccepted = ref<string | null>(null);

const myProgressPct = computed(() => Math.round((activeUnitIndex.value / Math.max(1, units.value.length)) * 100));

// ── Power-Up System State ──────────────────────────────────────
const {
  powerUpUnitIndex,
  powerUpType,
  failedPowerUpUnits,
  claimedPowerUpUnits,
  isFrozen,
  freezeCountdown,
  isStormActive,
  stormCountdown,
  lightningFlashActive,
  isRewindingGlitch,
  initSentencePowerUp,
  resetState: resetPowerUpState,
} = useBattlegroundPowerUps({
  units,
  currentSentenceIndex,
  onRewind: () => {
    activeUnitIndex.value = Math.max(0, activeUnitIndex.value - 3);
    activeSubIndex.value = 0;
    lockedAccepted.value = null;
  },
  onFreezeEnd: () => {
    focusInput();
  }
});

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
    lockedAccepted.value = null;
    correctCharsCount.value = 0;
    wrongCharsCount.value = 0;
    resetPowerUpState();
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
const unitsCount = computed(() => units.value.length);
const {
  sameSentenceMarkers,
  leftEdgeMarkers,
  rightEdgeMarkers,
  setUnitRef,
  handleMarkerResize,
  getMarkerPositionStyle,
} = useLiveMarkers(currentSentenceIndex, unitsCount);

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
          class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
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

    <!-- MOBILE ONLY: Compact Horizontal Player Avatar Bar -->
    <BattlegroundPlayersPanel mode="mobile" :my-progress-pct="myProgressPct" />

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

          <!-- Same Sentence Live Player Markers -->
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
              <span v-if="idx < activeUnitIndex" class="text-emerald-400 font-extrabold font-jp">{{ unit.kana }}</span>

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
            <span v-if="idx < activeUnitIndex" class="text-emerald-400 font-bold">{{ unit.acceptedRomaji[0] }}</span>

            <span v-else-if="idx === activeUnitIndex" class="inline-flex items-center">
              <span class="text-white font-bold">{{ (lockedAccepted ?? '').slice(0, activeSubIndex) }}</span>
              <span class="text-amber-300 underline underline-offset-4 bg-amber-400/25 px-1 sm:px-1.5 py-0.5 rounded-lg font-black animate-pulse text-xl sm:text-2xl md:text-3xl shadow-sm shadow-amber-400/30">
                {{ (lockedAccepted ?? unit.acceptedRomaji[0])[activeSubIndex] ?? '' }}
              </span>
            </span>
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
      <BattlegroundPlayersPanel mode="desktop" :my-progress-pct="myProgressPct" />

    </div>

    <!-- All Fullscreen Overlays (Freeze, Rewind, Storm, Countdown, Typo Penalty) -->
    <BattlegroundOverlays
      :is-frozen="isFrozen"
      :freeze-countdown="freezeCountdown"
      :is-rewinding-glitch="isRewindingGlitch"
      :is-storm-active="isStormActive"
      :storm-countdown="stormCountdown"
      :lightning-flash-active="lightningFlashActive"
      :is-preparing="store.phase === 'round_preparing' && (store.activeRound?.round_number ?? 1) <= 1"
      :prep-countdown-seconds="prepCountdownSeconds"
      :is-penalty-active="isPenaltyActive"
      :penalty-time-left="penaltyTimeLeft"
    />

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
</style>
