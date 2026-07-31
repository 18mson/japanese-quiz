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
      const firstChar = japanese[charIdx];
      if (['、','。','？','?','！','!',' '].includes(firstChar)) {
        result.push({
          kana: firstChar,
          acceptedRomaji: firstChar === '、' ? [',',' ',''] : (firstChar === '。' ? ['.','']: [firstChar])
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

watch(() => store.phase, (p) => {
  if (p === 'round_active') {
    currentSentenceIndex.value = 0;
    activeUnitIndex.value = 0;
    activeSubIndex.value = 0;
    userInput.value = '';
    hasError.value = false;
    isSubmitted.value = false;
    isPenaltyActive.value = false;
    lockedAccepted.value = null;
    autoSkipHyphens();
    focusInput();
  }
});

onMounted(() => {
  autoSkipHyphens();
  focusInput();
});
onUnmounted(() => {
  if (progressThrottle) clearTimeout(progressThrottle);
  if (penaltyInterval) clearInterval(penaltyInterval);
});

function handleInput(event: Event) {
  if (isSubmitted.value || !store.iAmAlive || isPenaltyActive.value || store.phase !== 'round_active') return;
  const input = event.target as HTMLInputElement;
  const typed = input.value;
  processTyped(typed);
  input.value = '';
}

function processTyped(typed: string) {
  if (!currentUnit.value || !store.activeRound || isPenaltyActive.value) return;

  autoSkipHyphens();

  for (const char of typed) {
    if (!currentUnit.value || isPenaltyActive.value) return;

    if (char === ' ') {
      const unit = currentUnit.value;
      const expected = (lockedAccepted.value ?? unit.acceptedRomaji[0])[activeSubIndex.value];
      if (expected !== ' ') {
        continue;
      }
    }

    advanceChar(char);
    autoSkipHyphens();

    if (hasError.value || isPenaltyActive.value) return;
  }
}

function advanceChar(char: string) {
  const unit = currentUnit.value;
  if (!unit) return;

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
    activeUnitIndex.value++;
    activeSubIndex.value = 0;
    lockedAccepted.value = null;

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
  const fullInput = units.value.map(u => u.acceptedRomaji[0]).join('');
  await store.submitRound(fullInput);
}

function throttledProgressBroadcast() {
  if (progressThrottle) return;
  progressThrottle = setTimeout(() => {
    const totalCount = totalSentencesCount.value;
    const sentProgress = currentSentenceIndex.value;
    const unitProgress = activeUnitIndex.value / Math.max(1, units.value.length);
    const overallPct = Math.round(((sentProgress + unitProgress) / totalCount) * 100);

    store.broadcastProgress(overallPct, 100);
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
  <div class="flex flex-col h-full bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white overflow-hidden relative">

    <!-- Round Header Bar -->
    <div class="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10 flex-shrink-0 z-10">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-rose-500/30 flex items-center justify-center">
          <Zap class="w-3.5 h-3.5 text-rose-400" />
        </div>
        <span class="font-extrabold text-sm">Ronde {{ store.activeRound?.round_number ?? '?' }}</span>
      </div>
      
      <!-- Readiness Status Badge -->
      <div class="flex items-center gap-2">
        <div v-if="store.phase === 'round_preparing'" class="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
          <Lock class="w-3.5 h-3.5 text-amber-400" />
          Menunggu Start...
        </div>
        <div v-else-if="store.phase === 'round_active' && !isPenaltyActive && !isSubmitted" class="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          🟢 SIAP MENGETIK — KETIK SEKARANG!
        </div>
      </div>

      <div class="flex items-center gap-1.5 text-sm font-mono font-bold" :class="store.countdownSeconds <= 5 ? 'text-rose-400' : 'text-slate-300'">
        <Clock class="w-4 h-4" />
        {{ String(store.countdownSeconds).padStart(2, '0') }}s
      </div>
    </div>

    <!-- Timer Bar -->
    <div class="h-1.5 bg-white/10 flex-shrink-0 z-10">
      <div
        class="h-full transition-all duration-500"
        :class="timerColor"
        :style="{ width: timerWidth }"
      ></div>
    </div>

    <!-- Sentence Counter & Meaning Hint -->
    <div class="px-4 pt-3 pb-1 text-center flex-shrink-0 z-10 flex flex-col items-center gap-1">
      <div v-if="totalSentencesCount > 1" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-extrabold shadow-sm">
        <span>Kalimat {{ currentSentenceIndex + 1 }} dari {{ totalSentencesCount }}</span>
      </div>
      <span class="text-xs text-slate-400 font-medium">{{ activeSentence?.meaning ?? '' }}</span>
    </div>

    <!-- Main Content: Sentence + Input + Players Panel -->
    <div class="flex-1 flex overflow-hidden relative">

      <!-- CENTER: Typing area (clicking anywhere focuses input) -->
      <div
        @click="focusInput"
        class="flex-1 flex flex-col items-center justify-center px-4 md:px-8 overflow-auto cursor-pointer relative"
      >

        <!-- Sentence (Japanese) display with active character pointer -->
        <div class="mb-6 text-4xl md:text-5xl font-bold tracking-wide text-center flex flex-wrap items-center justify-center gap-1 min-h-[60px]">
          <template v-for="(unit, idx) in units" :key="idx">
            <!-- Completed Japanese character/word -->
            <span v-if="idx < activeUnitIndex" class="text-emerald-400 font-extrabold">{{ unit.kana }}</span>

            <!-- Current active Japanese character/word pointer -->
            <span v-else-if="idx === activeUnitIndex" class="text-amber-300 font-black bg-amber-400/25 px-2 py-0.5 rounded-xl animate-pulse shadow-lg shadow-amber-400/20 underline underline-offset-8 decoration-amber-400">
              {{ unit.kana }}
            </span>

            <!-- Upcoming Japanese character/word -->
            <span v-else class="text-slate-400/70 font-medium">{{ unit.kana }}</span>
          </template>
        </div>

        <!-- Typed romaji display (shows completed characters + ONLY 1 upcoming character) -->
        <div
          :class="[
            'w-full max-w-lg mb-5 bg-white/5 rounded-2xl p-5 min-h-[70px] flex flex-wrap items-center justify-center gap-x-0.5 gap-y-1 font-mono text-2xl md:text-3xl transition-all duration-200 relative tracking-wider',
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
              <span class="text-amber-300 underline underline-offset-4 bg-amber-400/25 px-1.5 py-0.5 rounded-lg font-black animate-pulse text-3xl shadow-sm shadow-amber-400/30">
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
          :disabled="isSubmitted || !store.iAmAlive || store.phase !== 'round_active' || isPenaltyActive"
          @input="handleInput"
          @paste.prevent="preventPaste"
          @keydown.prevent.space=""
        />

        <!-- Typing status button indicator -->
        <div class="mt-2">
          <button
            v-if="store.phase === 'round_active' && !isPenaltyActive && !isSubmitted"
            @click.stop="focusInput"
            class="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/50 rounded-xl text-sm font-extrabold text-white transition shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer animate-pulse"
          >
            <PlayCircle class="w-4 h-4" />
            <span>Ketik Sekarang! (Keyboard Aktif)</span>
          </button>
        </div>

        <!-- Submission feedback -->
        <div v-if="isSubmitted && store.mySubmissionStatus" class="mt-4 flex items-center gap-2 text-sm font-bold">
          <template v-if="store.mySubmissionStatus === 'success'">
            <CheckCircle2 class="w-5 h-5 text-emerald-400" />
            <span class="text-emerald-400">Berhasil! {{ store.myCompletionTimeMs ? (store.myCompletionTimeMs / 1000).toFixed(2) + 's' : '' }}</span>
          </template>
          <template v-else-if="store.mySubmissionStatus === 'typo'">
            <ShieldX class="w-5 h-5 text-rose-400" />
            <span class="text-rose-400">Waktu habis sebelum selesai!</span>
          </template>
          <template v-else>
            <span class="text-slate-400">Menunggu validasi server...</span>
          </template>
        </div>

        <!-- Spectator notice -->
        <div v-if="!store.iAmAlive" class="mt-4 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 text-sm font-bold flex items-center gap-2">
          <ShieldX class="w-4 h-4" />
          Kamu sedang spectating. Tidak bisa mengetik.
        </div>
      </div>

      <!-- RIGHT PANEL: Players progress -->
      <div class="w-40 md:w-48 flex-shrink-0 border-l border-white/10 overflow-y-auto p-3 flex flex-col gap-2">
        <div class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Pemain</div>

        <div
          v-for="player in store.alivePlayers"
          :key="player.player_id"
          class="bg-white/5 rounded-xl p-2.5"
        >
          <div class="flex items-center gap-1.5 mb-1.5">
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

    <!-- PRE-ROUND COUNTDOWN OVERLAY (phase === 'round_preparing') -->
    <div
      v-if="store.phase === 'round_preparing'"
      class="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn"
    >
      <div class="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-4 text-amber-300 shadow-xl shadow-amber-500/20">
        <Lock class="w-8 h-8 text-amber-400" />
      </div>
      <h2 class="text-2xl font-black text-white mb-2">Persiapkan Diri! 🚀</h2>
      <p class="text-slate-400 text-sm mb-6 max-w-sm">Ronde akan dimulai. Ketik kalimat romaji begitu countdown selesai!</p>
      
      <div class="text-6xl font-black font-mono text-amber-400 mb-2 animate-bounce">
        {{ store.countdownSeconds }}
      </div>
      <span class="text-xs text-slate-500 font-bold uppercase tracking-widest">Detik Lagi...</span>
    </div>

    <!-- TYPO PENALTY 1-SECOND COOLDOWN OVERLAY (isPenaltyActive === true) -->
    <div
      v-if="isPenaltyActive"
      class="absolute inset-0 z-50 bg-rose-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn"
    >
      <div class="w-20 h-20 rounded-3xl bg-rose-500/30 border-2 border-rose-500/60 flex items-center justify-center mb-4 text-rose-300 shadow-2xl shadow-rose-600/40 animate-pulse">
        <AlertTriangle class="w-10 h-10 text-rose-400" />
      </div>
      <h2 class="text-3xl font-black text-white mb-1">TYPO DETECTED! ⚠️</h2>
      <p class="text-rose-200 text-sm mb-6 font-bold">Penalti 1 Detik Cooldown — Dilarang Mengetik!</p>
      
      <div class="text-7xl font-black font-mono text-white mb-2 tracking-tight">
        {{ penaltyTimeLeft }}s
      </div>
      <span class="text-xs text-rose-300/80 font-bold uppercase tracking-widest">Tunggu Cooldown Selesai...</span>
    </div>

  </div>
</template>
