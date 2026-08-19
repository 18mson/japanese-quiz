<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useBattlegroundStore } from '../../stores/battlegroundStore';
import { useAuthStore } from '../../stores/authStore';
import { isMuted, toggleMute, getAudioContext, startLobbyBgm, stopLobbyBgm } from '../../utils/battleSoundManager';
import {
  Users,
  Plus,
  LogIn,
  Crown,
  AlertCircle,
  Loader2,
  Swords,
  Copy,
  Check,
  Globe,
  Lock,
  RotateCcw,
  User,
  Volume2,
  VolumeX,
  Zap,
  Clock,
  Trophy,
  Flame,
  BookOpen
} from '@lucide/vue';
import type { GameMode, QuizCategory } from '../../stores/battleground/types';

const store = useBattlegroundStore();
const authStore = useAuthStore();

const soundMuted = ref(isMuted());

function handleToggleSound() {
  soundMuted.value = toggleMute();
  getAudioContext();
  if (soundMuted.value) {
    stopLobbyBgm();
  } else {
    startLobbyBgm();
  }
}

// ── Local State ──────────────────────────────────────────────
const mode = ref<'create' | 'join'>('create');
const isPublicRoom = ref(true);
const selectedGameMode = ref<GameMode>(store.gameMode || 'quiz_blitz');
const selectedQuizCategory = ref<QuizCategory>(store.quizCategory || 'kotoba_kanji');
const inputPlayerName = ref('');
const inputRoomCode = ref('');
const codeCopied = ref(false);

// Sync initial values from store
watch(
  () => [store.gameMode, store.quizCategory] as const,
  ([gMode, qCat]) => {
    if (gMode) selectedGameMode.value = gMode;
    if (qCat) selectedQuizCategory.value = qCat;
  },
  { immediate: true }
);

// Prefill & autofill name from authStore / store
watch(
  () => [authStore.displayUsername, store.myPlayerName],
  () => {
    const defaultName = authStore.displayUsername || store.myPlayerName;
    if (defaultName && defaultName !== 'Player' && (!inputPlayerName.value || inputPlayerName.value === 'Player')) {
      inputPlayerName.value = defaultName;
    }
  },
  { immediate: true }
);

watch(mode, (newMode) => {
  if (newMode === 'join') {
    store.fetchPublicRooms();
  }
});

onMounted(() => {
  startLobbyBgm();
  if (mode.value === 'join') {
    store.fetchPublicRooms();
  }
});

onUnmounted(() => {
  stopLobbyBgm();
});

// ── Computed ─────────────────────────────────────────────────
const canStart = computed(() =>
  store.isHost && store.alivePlayers.length >= 2 && !store.isLoading
);

const nameError = ref<string | null>(null);
const nameInputRef = ref<HTMLInputElement | null>(null);

function validateName(): boolean {
  nameError.value = null;
  store.error = null;
  const trimmed = inputPlayerName.value.trim();
  if (trimmed.length < 2) {
    nameError.value = 'Harap isi nama kamu (minimal 2 karakter) sebelum bergabung!';
    nameInputRef.value?.focus();
    return false;
  }
  return true;
}

// ── Actions ──────────────────────────────────────────────────
async function handleCreate() {
  getAudioContext();
  if (!validateName()) return;
  await store.createRoom(
    inputPlayerName.value.trim(),
    isPublicRoom.value,
    selectedGameMode.value,
    selectedQuizCategory.value
  );
}

async function handleJoin(targetCode?: string) {
  getAudioContext();
  if (!validateName()) return;
  const codeToJoin = targetCode ?? inputRoomCode.value.trim();
  if (codeToJoin.length !== 6) {
    store.error = 'Masukkan 6 karakter kode room!';
    return;
  }
  await store.joinRoom(codeToJoin, inputPlayerName.value.trim());
}

async function copyCode() {
  if (!store.roomCode) return;
  await navigator.clipboard.writeText(store.roomCode);
  codeCopied.value = true;
  setTimeout(() => (codeCopied.value = false), 2000);
}

const emit = defineEmits<{ exit: [] }>();
</script>

<template>
  <div class="w-full h-full min-h-screen overflow-y-auto p-3 sm:p-5 lg:p-6 bg-gradient-to-br from-slate-950 via-indigo-950/80 to-violet-950 text-white flex flex-col items-center select-none relative">
    
    <!-- Audio Mute Toggle Button -->
    <button
      @click="handleToggleSound"
      class="absolute top-3 left-3 sm:top-4 sm:left-4 z-40 p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
      :title="soundMuted ? 'Aktifkan Suara' : 'Matikan Suara'"
    >
      <VolumeX v-if="soundMuted" class="w-4 h-4 text-rose-400" />
      <Volume2 v-else class="w-4 h-4 text-indigo-400" />
    </button>

    <!-- Header Title -->
    <div class="w-full max-w-5xl flex items-center justify-between mb-4 sm:mb-6 pt-2 pl-12 pr-12 sm:px-0">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
          <Flame v-if="selectedGameMode === 'quiz_blitz'" class="w-6 h-6 text-white animate-pulse" />
          <Swords v-else class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-rose-300 to-indigo-200 bg-clip-text text-transparent">
            Arena Online Multiplayer
          </h1>
          <p class="text-xs text-slate-400 font-medium">Bermain bersama teman atau lawan publik secara realtime</p>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="store.error" class="w-full max-w-5xl mb-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl p-3 flex items-start gap-2 text-rose-300 text-xs sm:text-sm animate-fadeIn">
      <AlertCircle class="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>{{ store.error }}</span>
    </div>

    <!-- ════════════════════════════════════════════════════════════════════ -->
    <!-- PRE-LOBBY SCREEN: IDLE / CONFIGURING ROOM                            -->
    <!-- ════════════════════════════════════════════════════════════════════ -->
    <div v-if="store.phase === 'idle'" class="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
      
      <!-- ── LEFT COLUMN: COMPACT FORM CONFIGURATION (Col 7/12) ── -->
      <div class="lg:col-span-7 bg-slate-900/90 border border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col gap-3.5 sm:gap-4">
        
        <!-- 1. Player Name Input -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User class="w-3.5 h-3.5 text-indigo-400" />
              Nama Pemain <span class="text-rose-400">*</span>
            </label>
            <span v-if="authStore.user" class="text-[10px] text-indigo-300 font-semibold bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
              Akun: {{ authStore.displayUsername }}
            </span>
          </div>
          <input
            ref="nameInputRef"
            v-model="inputPlayerName"
            type="text"
            maxlength="30"
            placeholder="Masukkan nickname kamu..."
            :class="[
              'w-full bg-slate-950/80 border rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none transition text-sm font-semibold',
              nameError
                ? 'border-rose-500 ring-2 ring-rose-500/40 bg-rose-500/10'
                : 'border-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30'
            ]"
            @input="nameError = null"
          />
          <p v-if="nameError" class="text-rose-400 text-xs mt-1 font-bold flex items-center gap-1">
            <AlertCircle class="w-3.5 h-3.5 flex-shrink-0" />
            <span>{{ nameError }}</span>
          </p>
        </div>

        <!-- 2. Segmented Mode Switcher (Buat Room vs Join Room) -->
        <div class="grid grid-cols-2 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            @click="mode = 'create'"
            :class="[
              'py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer',
              mode === 'create'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            <Plus class="w-4 h-4" />
            <span>Buat Room</span>
          </button>

          <button
            type="button"
            @click="mode = 'join'"
            :class="[
              'py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer',
              mode === 'join'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            <LogIn class="w-4 h-4" />
            <span>Join Room</span>
          </button>
        </div>

        <!-- ── CREATE ROOM OPTIONS ── -->
        <template v-if="mode === 'create'">
          
          <!-- Submode Online: Quiz Blitz vs Battleground -->
          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Pilih Submode</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="selectedGameMode = 'quiz_blitz'"
                :class="[
                  'p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5',
                  selectedGameMode === 'quiz_blitz'
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300 ring-2 ring-amber-500/30'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                ]"
              >
                <div class="w-8 h-8 rounded-lg bg-amber-500/30 flex items-center justify-center text-amber-300 text-base flex-shrink-0">
                  🔥
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-black text-white truncate">Quiz Blitz</div>
                  <div class="text-[10px] text-slate-400 truncate">Pilihan Ganda 5 Menit</div>
                </div>
              </button>

              <button
                type="button"
                @click="selectedGameMode = 'battleground'"
                :class="[
                  'p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5',
                  selectedGameMode === 'battleground'
                    ? 'border-rose-500 bg-rose-500/20 text-rose-300 ring-2 ring-rose-500/30'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                ]"
              >
                <div class="w-8 h-8 rounded-lg bg-rose-500/30 flex items-center justify-center text-rose-300 text-base flex-shrink-0">
                  ⚔️
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-black text-white truncate">Battleground</div>
                  <div class="text-[10px] text-slate-400 truncate">Typing Royale Eliminasi</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Category Selector (only when Quiz Blitz is active) -->
          <div v-if="selectedGameMode === 'quiz_blitz'" class="animate-fadeIn">
            <label class="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Kategori Soal Quiz Blitz</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                @click="selectedQuizCategory = 'hiragana'"
                :class="[
                  'py-2 px-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5',
                  selectedQuizCategory === 'hiragana'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-black'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 font-bold'
                ]"
              >
                <span class="text-xs">あ</span>
                <span class="text-[11px] truncate">Hiragana</span>
              </button>

              <button
                type="button"
                @click="selectedQuizCategory = 'katakana'"
                :class="[
                  'py-2 px-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5',
                  selectedQuizCategory === 'katakana'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-black'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 font-bold'
                ]"
              >
                <span class="text-xs">ア</span>
                <span class="text-[11px] truncate">Katakana</span>
              </button>

              <button
                type="button"
                @click="selectedQuizCategory = 'mix'"
                :class="[
                  'py-2 px-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5',
                  selectedQuizCategory === 'mix'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-black'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 font-bold'
                ]"
              >
                <span class="text-xs">あ/ア</span>
                <span class="text-[11px] truncate">Mix Kana</span>
              </button>

              <button
                type="button"
                @click="selectedQuizCategory = 'kotoba_kanji'"
                :class="[
                  'py-2 px-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5',
                  selectedQuizCategory === 'kotoba_kanji'
                    ? 'border-amber-400 bg-amber-500/30 text-amber-200 font-black ring-1 ring-amber-400/50'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 font-bold'
                ]"
              >
                <span class="text-xs">📖</span>
                <span class="text-[11px] truncate">Kotoba & Kanji</span>
              </button>
            </div>
          </div>

          <!-- Room Privacy Options -->
          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Tipe Privasi</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="isPublicRoom = true"
                :class="[
                  'p-2 rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer',
                  isPublicRoom
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                ]"
              >
                <Globe class="w-4 h-4 text-emerald-400" />
                <span class="text-xs">Public Room</span>
              </button>

              <button
                type="button"
                @click="isPublicRoom = false"
                :class="[
                  'p-2 rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer',
                  !isPublicRoom
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                ]"
              >
                <Lock class="w-4 h-4 text-amber-400" />
                <span class="text-xs">Private (Kode 6-digit)</span>
              </button>
            </div>
          </div>

          <!-- Create Action Button -->
          <button
            @click="handleCreate"
            :disabled="store.isLoading"
            class="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 rounded-2xl font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 text-sm cursor-pointer mt-1"
          >
            <Loader2 v-if="store.isLoading" class="w-4 h-4 animate-spin" />
            <Plus v-else class="w-4 h-4" />
            <span>Buat {{ isPublicRoom ? 'Public' : 'Private' }} Room</span>
          </button>
        </template>

        <!-- ── JOIN ROOM OPTIONS ── -->
        <template v-else-if="mode === 'join'">
          
          <!-- Public Room List -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Globe class="w-3.5 h-3.5 text-emerald-400" />
                Daftar Public Room
              </span>
              <button
                @click="store.fetchPublicRooms()"
                :disabled="store.isLoadingPublicRooms"
                class="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer text-xs flex items-center gap-1 px-2"
                title="Refresh"
              >
                <RotateCcw :class="['w-3 h-3', store.isLoadingPublicRooms ? 'animate-spin' : '']" />
                <span>Refresh</span>
              </button>
            </div>

            <div v-if="store.isLoadingPublicRooms" class="py-5 flex flex-col items-center justify-center text-slate-400 gap-1.5 bg-slate-950/50 rounded-2xl border border-slate-800">
              <Loader2 class="w-5 h-5 animate-spin text-violet-400" />
              <span class="text-xs">Mencari room aktif...</span>
            </div>

            <div v-else-if="store.publicRooms.length === 0" class="py-5 text-center text-slate-400 text-xs bg-slate-950/50 rounded-2xl border border-slate-800">
              Belum ada Public Room aktif.<br />Buat room baru di tab sebelah!
            </div>

            <div v-else class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              <div
                v-for="room in store.publicRooms"
                :key="room.id"
                class="bg-slate-950/80 border border-slate-800 hover:border-violet-500/50 rounded-xl p-2.5 flex items-center justify-between gap-2 transition"
              >
                <div class="min-w-0">
                  <div class="text-xs font-bold text-white truncate flex items-center gap-1.5">
                    <span>{{ room.host_name }}</span>
                    <span v-if="room.game_mode === 'quiz_blitz'" class="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      🔥 Quiz Blitz
                    </span>
                    <span v-else class="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      ⚔️ Battleground
                    </span>
                  </div>
                  <div class="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span class="font-mono bg-white/10 px-1 rounded text-[10px] font-bold text-violet-300">{{ room.code }}</span>
                    <span>• {{ room.player_count }}/{{ room.max_players }} pemain</span>
                  </div>
                </div>

                <button
                  @click="handleJoin(room.code)"
                  :disabled="store.isLoading || room.player_count >= room.max_players"
                  class="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg font-bold text-xs transition cursor-pointer flex-shrink-0"
                >
                  Join
                </button>
              </div>
            </div>
          </div>

          <!-- Private Code Input -->
          <div class="pt-2 border-t border-slate-800">
            <label class="text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Lock class="w-3.5 h-3.5 text-amber-400" />
              Kode Room Private (6 Karakter)
            </label>
            <div class="flex gap-2">
              <input
                v-model="inputRoomCode"
                type="text"
                maxlength="6"
                placeholder="Contoh: X8K2M9"
                class="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-400 transition text-sm uppercase tracking-widest font-mono font-bold"
                @input="inputRoomCode = inputRoomCode.toUpperCase()"
              />
              <button
                @click="handleJoin()"
                :disabled="store.isLoading || inputRoomCode.trim().length !== 6"
                class="px-4 py-2 bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-500 hover:to-rose-500 disabled:opacity-50 rounded-xl font-bold text-white text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Loader2 v-if="store.isLoading" class="w-4 h-4 animate-spin" />
                <LogIn v-else class="w-4 h-4" />
                <span>Masuk</span>
              </button>
            </div>
          </div>
        </template>

        <!-- Back to Main Menu Button -->
        <button
          @click="emit('exit')"
          class="w-full text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer py-1.5 text-center mt-1"
        >
          ← Kembali ke Menu Utama
        </button>

      </div>

      <!-- ── RIGHT COLUMN: DYNAMIC DESCRIPTIONS & PREVIEW PANEL (Col 5/12) ── -->
      <div class="lg:col-span-5 bg-gradient-to-b from-slate-900/95 via-indigo-950/60 to-slate-950/95 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between gap-4">
        
        <!-- Dynamic Header based on Game Mode -->
        <div>
          <!-- Quiz Blitz Mode Showcase -->
          <div v-if="selectedGameMode === 'quiz_blitz'" class="animate-fadeIn">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-lg font-black shadow-inner">
                🔥
              </div>
              <div>
                <h2 class="text-base font-black text-amber-300">Mode: Quiz Blitz</h2>
                <p class="text-[11px] text-slate-400">Pilihan Ganda Berwaktu Tanpa Eliminasi</p>
              </div>
            </div>

            <!-- Rules Highlight List -->
            <div class="space-y-2 mb-4">
              <div class="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/50 border border-slate-800">
                <Clock class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div class="text-xs font-bold text-white">Durasi 5 Menit Non-Stop</div>
                  <div class="text-[11px] text-slate-400">Maraton adu pengetahuan selama 300 detik.</div>
                </div>
              </div>

              <div class="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/50 border border-slate-800">
                <Zap class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div class="text-xs font-bold text-white">10 Detik & Skor Kecepatan</div>
                  <div class="text-[11px] text-slate-400">Makin cepat menjawab, makin tinggi poin (hingga 200 pts/soal).</div>
                </div>
              </div>

              <div class="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/50 border border-slate-800">
                <Trophy class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div class="text-xs font-bold text-white">Podium Top 3 Realtime (5s)</div>
                  <div class="text-[11px] text-slate-400">Animasi overtake susul-menyusul skor di setiap jeda soal.</div>
                </div>
              </div>
            </div>

            <!-- Dynamic Category Preview Card -->
            <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <div class="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <BookOpen class="w-3.5 h-3.5" />
                Preview Kategori: {{ selectedQuizCategory === 'kotoba_kanji' ? 'Kotoba & Kanji N5' : selectedQuizCategory }}
              </div>
              
              <div v-if="selectedQuizCategory === 'kotoba_kanji'" class="flex items-center justify-between bg-slate-950/80 px-3 py-2 rounded-xl border border-amber-500/20">
                <div>
                  <div class="text-base font-black text-white">学校 <span class="text-xs font-normal text-amber-300">(がっこう)</span></div>
                  <div class="text-xs text-slate-400">JLPT N5 Kosakata & Kanji</div>
                </div>
                <div class="text-right">
                  <div class="text-xs font-bold text-emerald-400">➔ Sekolah</div>
                  <div class="text-[10px] text-slate-500">Pilihan Arti ID</div>
                </div>
              </div>

              <div v-else-if="selectedQuizCategory === 'hiragana'" class="flex items-center justify-between bg-slate-950/80 px-3 py-2 rounded-xl border border-amber-500/20">
                <div class="text-base font-black text-white">あ / か / さ / た</div>
                <div class="text-xs font-bold text-emerald-400">➔ Romaji: a / ka / sa / ta</div>
              </div>

              <div v-else-if="selectedQuizCategory === 'katakana'" class="flex items-center justify-between bg-slate-950/80 px-3 py-2 rounded-xl border border-amber-500/20">
                <div class="text-base font-black text-white">ア / カ / サ / タ</div>
                <div class="text-xs font-bold text-emerald-400">➔ Romaji: a / ka / sa / ta</div>
              </div>

              <div v-else class="flex items-center justify-between bg-slate-950/80 px-3 py-2 rounded-xl border border-amber-500/20">
                <div class="text-base font-black text-white">あ / ア (Mix)</div>
                <div class="text-xs font-bold text-emerald-400">➔ Campuran Hiragana & Katakana</div>
              </div>
            </div>
          </div>

          <!-- Battleground Mode Showcase -->
          <div v-else class="animate-fadeIn">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center text-lg font-black shadow-inner">
                ⚔️
              </div>
              <div>
                <h2 class="text-base font-black text-rose-300">Mode: Battleground</h2>
                <p class="text-[11px] text-slate-400">Typing Battle Royale Eliminasi</p>
              </div>
            </div>

            <!-- Rules Highlight List -->
            <div class="space-y-2 mb-4">
              <div class="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/50 border border-slate-800">
                <Swords class="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div class="text-xs font-bold text-white">Multiplayer 2–8 Pemain</div>
                  <div class="text-[11px] text-slate-400">Adu kecepatan mengetik kalimat Jepang secara realtime.</div>
                </div>
              </div>

              <div class="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/50 border border-slate-800">
                <AlertCircle class="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div class="text-xs font-bold text-white">Sistem Eliminasi Bertahap</div>
                  <div class="text-[11px] text-slate-400">Pemain terlambat / salah ketik di tiap ronde akan langsung gugur.</div>
                </div>
              </div>

              <div class="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/50 border border-slate-800">
                <Crown class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div class="text-xs font-bold text-white">Pemenang Survivor Terakhir</div>
                  <div class="text-[11px] text-slate-400">Pemain terakhir yang bertahan menjadi Juara Arena!</div>
                </div>
              </div>
            </div>

            <!-- Typing Preview Box -->
            <div class="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs">
              <div class="text-[10px] text-rose-400 font-extrabold uppercase tracking-wider mb-1">
                Contoh Kalimat Mengetik
              </div>
              <div class="text-sm font-bold text-white mb-0.5">こんにちは、元気ですか？</div>
              <div class="text-xs font-mono text-slate-400">konnichiha, genkidesuka?</div>
            </div>
          </div>
        </div>

        <!-- Quick Summary Footer Tag -->
        <div class="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Koneksi: <strong class="text-emerald-400">Supabase Realtime</strong></span>
          <span>Max Pemain: <strong class="text-white">8 Orang</strong></span>
        </div>

      </div>

    </div>

    <!-- ════════════════════════════════════════════════════════════════════ -->
    <!-- IN-ROOM LOBBY SCREEN (Waiting for players & host to start)           -->
    <!-- ════════════════════════════════════════════════════════════════════ -->
    <div v-else-if="store.phase === 'lobby'" class="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl flex flex-col gap-4 sm:gap-5 animate-fadeIn">
      
      <!-- Room Code Banner -->
      <div class="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <div class="text-xs text-slate-400 font-semibold mb-0.5">Kode Room Anda</div>
          <div class="text-3xl font-black tracking-widest font-mono text-amber-300">{{ store.roomCode }}</div>
        </div>
        <button
          @click="copyCode"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-bold transition cursor-pointer"
        >
          <Check v-if="codeCopied" class="w-4 h-4 text-green-400" />
          <Copy v-else class="w-4 h-4" />
          <span>{{ codeCopied ? 'Tersalin!' : 'Salin Kode' }}</span>
        </button>
      </div>

      <!-- Mode & Category Info Badge -->
      <div class="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <span v-if="store.gameMode === 'quiz_blitz'" class="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black flex items-center gap-1">
            🔥 Quiz Blitz · {{ store.quizCategory === 'kotoba_kanji' ? 'Kotoba & Kanji N5' : store.quizCategory }}
          </span>
          <span v-else class="px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-black flex items-center gap-1">
            ⚔️ Typing Battleground
          </span>
        </div>
        <span class="text-slate-400 font-medium">Durasi: {{ store.gameMode === 'quiz_blitz' ? '5 Menit (10s/soal)' : 'Eliminasi' }}</span>
      </div>

      <!-- Player List (2-8 slots) -->
      <div>
        <div class="flex items-center justify-between mb-2.5">
          <h2 class="font-bold text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
            <Users class="w-4 h-4 text-indigo-400" />
            Daftar Pemain ({{ store.players.length }}/8)
          </h2>
          <span class="text-xs text-slate-500">Minimal 2 pemain</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div
            v-for="player in store.players"
            :key="player.player_id"
            class="flex items-center gap-2.5 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 transition animate-fadeIn"
          >
            <div
              class="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 shadow-inner"
              :style="`background: hsl(${(player.player_name.charCodeAt(0) * 47) % 360}, 60%, 40%)`"
            >
              {{ player.player_name.slice(0, 2).toUpperCase() }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="font-bold text-xs sm:text-sm flex items-center gap-1.5 truncate">
                <span>{{ player.player_name }}</span>
                <span v-if="player.player_id === store.myPlayerId" class="text-[10px] bg-indigo-500/30 text-indigo-300 px-1 py-0.2 rounded font-normal">Kamu</span>
              </div>
            </div>

            <Crown v-if="player.player_id === store.hostPlayerId" class="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div class="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 shadow-sm shadow-emerald-400/50" />
          </div>

          <!-- Empty Slot Placeholder -->
          <div
            v-for="i in Math.max(0, 2 - store.players.length)"
            :key="`empty-${i}`"
            class="flex items-center gap-2.5 border border-dashed border-slate-800 rounded-xl p-2.5 opacity-40"
          >
            <div class="w-8 h-8 rounded-xl bg-slate-800/40 border border-slate-700/50" />
            <span class="text-xs text-slate-500">Menunggu teman bergabung...</span>
          </div>
        </div>
      </div>

      <!-- Start Game Button (Host Only) -->
      <div class="w-full flex flex-col gap-2 pt-2">
        <template v-if="store.isHost">
          <button
            @click="store.startGame()"
            :disabled="!canStart"
            class="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/30 text-base cursor-pointer"
          >
            <Loader2 v-if="store.isLoading" class="w-4 h-4 animate-spin" />
            <Swords v-else class="w-5 h-5" />
            <span>Mulai Pertandingan!</span>
            <span v-if="store.alivePlayers.length < 2" class="text-xs font-normal opacity-70">(butuh 2 pemain)</span>
          </button>
        </template>
        <template v-else>
          <div class="w-full py-3 text-center text-slate-400 text-xs sm:text-sm font-medium bg-slate-950/60 rounded-2xl border border-dashed border-slate-800">
            ⏳ Menunggu Host memulai pertandingan...
          </div>
        </template>

        <button
          @click="store.leaveRoom(); emit('exit')"
          class="w-full py-2 text-slate-500 hover:text-rose-400 text-xs font-semibold transition cursor-pointer text-center"
        >
          Keluar Room
        </button>
      </div>

    </div>

  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
