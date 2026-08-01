<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useBattlegroundStore } from '../../stores/battlegroundStore';
import { useAuthStore } from '../../stores/authStore';
import { isMuted, toggleMute, getAudioContext, startLobbyBgm, stopLobbyBgm } from '../../utils/battleSoundManager';
import { Users, Plus, LogIn, Crown, AlertCircle, Loader2, Swords, Copy, Check, Globe, Lock, RotateCcw, User, Volume2, VolumeX } from '@lucide/vue';

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
const mode = ref<'choose' | 'create' | 'join'>('choose');
const isPublicRoom = ref(true);
const inputPlayerName = ref('');
const inputRoomCode = ref('');
const codeCopied = ref(false);

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
  await store.createRoom(inputPlayerName.value.trim(), isPublicRoom.value);
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
  <div class="min-h-full flex flex-col items-center justify-start p-4 md:p-8 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white relative">

    <!-- Audio Mute Toggle Button -->
    <button
      @click="handleToggleSound"
      class="absolute top-4 left-4 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
      :title="soundMuted ? 'Aktifkan Suara' : 'Matikan Suara'"
    >
      <VolumeX v-if="soundMuted" class="w-4 h-4 text-rose-400" />
      <Volume2 v-else class="w-4 h-4 text-indigo-400" />
    </button>

    <!-- Header -->
    <div class="w-full max-w-lg mb-8 text-center mt-2">
      <div class="flex items-center justify-center gap-3 mb-3">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
          <Swords class="w-6 h-6 text-white" />
        </div>
        <div class="text-left">
          <h1 class="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
            Typing Battleground
          </h1>
          <p class="text-xs text-slate-400">Battle royale mengetik kalimat Jepang</p>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="store.error" class="w-full max-w-lg mb-4 bg-rose-500/20 border border-rose-500/40 rounded-xl p-3 flex items-start gap-2 text-rose-300 text-sm">
      <AlertCircle class="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>{{ store.error }}</span>
    </div>

    <!-- PRE-LOBBY: Choose action -->
    <template v-if="store.phase === 'idle'">
      <div class="w-full max-w-lg">

        <!-- Player Name Input -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-bold text-slate-300">
              Nama Pemain <span class="text-rose-400">*</span>
            </label>
            <span v-if="authStore.user" class="text-xs text-indigo-300 font-semibold flex items-center gap-1.5 bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-500/30">
              <User class="w-3.5 h-3.5 text-indigo-400" /> 
            </span>
          </div>
          <input
            ref="nameInputRef"
            v-model="inputPlayerName"
            type="text"
            maxlength="30"
            placeholder="Masukkan nama kamu..."
            :class="[
              'w-full bg-white/10 border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition text-sm',
              nameError
                ? 'border-rose-500 ring-2 ring-rose-500/40 bg-rose-500/10'
                : 'border-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30'
            ]"
            @input="nameError = null"
          />
          <p v-if="nameError" class="text-rose-400 text-xs mt-1.5 font-bold flex items-center gap-1">
            <AlertCircle class="w-3.5 h-3.5 flex-shrink-0" />
            <span>{{ nameError }}</span>
          </p>
        </div>

        <!-- Create / Join Grid -->
        <div class="grid grid-cols-2 gap-3 mb-6">
          <!-- Create Room -->
          <div
            @click="mode = 'create'"
            :class="[
              'rounded-2xl p-5 border cursor-pointer transition-all duration-200 flex flex-col items-center gap-3',
              mode === 'create'
                ? 'border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/20'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
            ]"
          >
            <div class="w-10 h-10 rounded-xl bg-indigo-500/30 flex items-center justify-center">
              <Plus class="w-5 h-5 text-indigo-300" />
            </div>
            <div class="text-center">
              <div class="font-bold text-sm">Buat Room</div>
              <div class="text-xs text-slate-400 mt-0.5">Jadi Host</div>
            </div>
          </div>

          <!-- Join Room -->
          <div
            @click="mode = 'join'"
            :class="[
              'rounded-2xl p-5 border cursor-pointer transition-all duration-200 flex flex-col items-center gap-3',
              mode === 'join'
                ? 'border-violet-500 bg-violet-500/20 shadow-lg shadow-violet-500/20'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
            ]"
          >
            <div class="w-10 h-10 rounded-xl bg-violet-500/30 flex items-center justify-center">
              <LogIn class="w-5 h-5 text-violet-300" />
            </div>
            <div class="text-center">
              <div class="font-bold text-sm">Join Room</div>
              <div class="text-xs text-slate-400 mt-0.5">Cari Public / Kode</div>
            </div>
          </div>
        </div>

        <!-- CREATE MODE: Room Access Options (Public / Private) -->
        <div v-if="mode === 'create'" class="mb-6 bg-white/5 border border-white/10 rounded-2xl p-4">
          <label class="block text-sm font-bold text-slate-300 mb-3">Tipe Privasi Room</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="isPublicRoom = true"
              :class="[
                'p-3 rounded-xl border flex flex-col items-center text-center transition cursor-pointer',
                isPublicRoom
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
              ]"
            >
              <Globe class="w-5 h-5 mb-1 text-emerald-400" />
              <span class="text-xs font-bold">Public Room</span>
              <span class="text-[10px] text-slate-400 font-normal mt-0.5">Muncul di daftar room</span>
            </button>

            <button
              type="button"
              @click="isPublicRoom = false"
              :class="[
                'p-3 rounded-xl border flex flex-col items-center text-center transition cursor-pointer',
                !isPublicRoom
                  ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
              ]"
            >
              <Lock class="w-5 h-5 mb-1 text-amber-400" />
              <span class="text-xs font-bold">Private Room</span>
              <span class="text-[10px] text-slate-400 font-normal mt-0.5">Khusus via Kode 6-digit</span>
            </button>
          </div>
        </div>

        <!-- JOIN MODE: Public Rooms List & Private Code Input -->
        <div v-if="mode === 'join'" class="space-y-6 mb-6">
          
          <!-- Public Rooms List -->
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-slate-300 flex items-center gap-1.5">
                <Globe class="w-4 h-4 text-emerald-400" />
                Daftar Public Room Active
              </h3>
              <button
                @click="store.fetchPublicRooms()"
                :disabled="store.isLoadingPublicRooms"
                class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                title="Refresh Public Rooms"
              >
                <RotateCcw :class="['w-3.5 h-3.5', store.isLoadingPublicRooms ? 'animate-spin' : '']" />
              </button>
            </div>

            <div v-if="store.isLoadingPublicRooms" class="py-6 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 class="w-5 h-5 animate-spin text-violet-400" />
              <span class="text-xs">Mencari public room...</span>
            </div>

            <div v-else-if="store.publicRooms.length === 0" class="py-6 text-center text-slate-400 text-xs bg-white/[0.02] rounded-xl border border-white/5">
              Belum ada Public Room aktif.<br />Buat room baru atau masukkan kode private di bawah!
            </div>

            <div v-else class="space-y-2 max-h-48 overflow-y-auto pr-1">
              <div
                v-for="room in store.publicRooms"
                :key="room.id"
                class="bg-white/5 border border-white/10 hover:border-violet-500/50 rounded-xl p-3 flex items-center justify-between gap-3 transition"
              >
                <div class="min-w-0">
                  <div class="text-sm font-bold text-white truncate flex items-center gap-1.5">
                    <span>Host: {{ room.host_name }}</span>
                  </div>
                  <div class="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span class="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[11px] font-bold text-violet-300">{{ room.code }}</span>
                    <span>• {{ room.player_count }} / {{ room.max_players }} pemain</span>
                  </div>
                </div>

                <button
                  @click="handleJoin(room.code)"
                  :disabled="store.isLoading || room.player_count >= room.max_players"
                  class="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xs transition cursor-pointer flex-shrink-0 flex items-center gap-1.5"
                >
                  <Loader2 v-if="store.isLoading" class="w-3.5 h-3.5 animate-spin" />
                  <span v-else>Gabung</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Private Code Input -->
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
            <label class="block text-sm font-bold text-slate-300 mb-2 items-center gap-1.5">
              <Lock class="w-4 h-4 text-amber-400" />
              Atau Masukkan Kode Room Private
            </label>
            <div class="flex gap-2">
              <input
                v-model="inputRoomCode"
                type="text"
                maxlength="6"
                placeholder="Contoh: X8K2M9"
                class="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-400 transition text-sm uppercase tracking-widest font-mono"
                @input="inputRoomCode = inputRoomCode.toUpperCase()"
              />
              <button
                @click="handleJoin()"
                :disabled="store.isLoading || inputRoomCode.trim().length !== 6"
                class="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Loader2 v-if="store.isLoading" class="w-4 h-4 animate-spin" />
                <LogIn v-else class="w-4 h-4" />
                Join
              </button>
            </div>
          </div>

        </div>

        <!-- Action Button (Create Mode Only) -->
        <button
          v-if="mode === 'create'"
          @click="handleCreate"
          :disabled="store.isLoading"
          class="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30 cursor-pointer"
        >
          <Loader2 v-if="store.isLoading" class="w-4 h-4 animate-spin" />
          <Plus v-else class="w-4 h-4" />
          Buat {{ isPublicRoom ? 'Public' : 'Private' }} Room
        </button>

        <!-- Back Button -->
        <button
          @click="emit('exit')"
          class="w-full mt-3 py-2.5 text-slate-400 hover:text-white text-sm font-medium transition cursor-pointer"
        >
          ← Kembali ke Menu
        </button>
      </div>
    </template>

    <!-- LOBBY: In room, waiting for host to start -->
    <template v-else-if="store.phase === 'lobby'">
      <div class="w-full max-w-lg">

        <!-- Room Code Banner -->
        <div class="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-400 font-medium mb-1">Kode Room</div>
            <div class="text-3xl font-black tracking-widest font-mono text-white">{{ store.roomCode }}</div>
          </div>
          <button
            @click="copyCode"
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-bold transition cursor-pointer"
          >
            <Check v-if="codeCopied" class="w-4 h-4 text-green-400" />
            <Copy v-else class="w-4 h-4" />
            {{ codeCopied ? 'Tersalin!' : 'Salin' }}
          </button>
        </div>

        <!-- Players List -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-bold text-sm text-slate-300 flex items-center gap-1.5">
              <Users class="w-4 h-4" />
              Pemain ({{ store.players.length }}/8)
            </h2>
            <span class="text-xs text-slate-500">Menunggu host...</span>
          </div>

          <div class="space-y-2">
            <div
              v-for="player in store.players"
              :key="player.player_id"
              class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 transition-all animate-fadeIn"
            >
              <!-- Avatar -->
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 shadow-inner"
                :style="`background: hsl(${(player.player_name.charCodeAt(0) * 47) % 360}, 60%, 40%)`"
              >
                {{ player.player_name.slice(0, 2).toUpperCase() }}
              </div>

              <div class="flex-1 min-w-0">
                <div class="font-bold text-sm flex items-center gap-1.5 truncate">
                  {{ player.player_name }}
                  <span v-if="player.player_id === store.myPlayerId" class="text-xs bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded-lg font-normal">Kamu</span>
                </div>
              </div>

              <!-- Host badge -->
              <Crown
                v-if="player.player_id === store.hostPlayerId"
                class="w-4 h-4 text-amber-400 flex-shrink-0"
              />

              <!-- Online dot -->
              <div class="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 shadow-sm shadow-emerald-400/50"></div>
            </div>

            <!-- Empty slots -->
            <div
              v-for="i in Math.max(0, 2 - store.players.length)"
              :key="`empty-${i}`"
              class="flex items-center gap-3 border border-dashed border-white/10 rounded-xl p-3 opacity-40"
            >
              <div class="w-9 h-9 rounded-xl bg-white/5 border border-white/10"></div>
              <span class="text-xs text-slate-500">Menunggu pemain...</span>
            </div>
          </div>
        </div>

        <!-- Start Button (Host only) -->
        <button
          v-if="store.isHost"
          @click="store.startGame()"
          :disabled="!canStart"
          class="w-full py-3.5 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/30 text-base cursor-pointer"
        >
          <Loader2 v-if="store.isLoading" class="w-4 h-4 animate-spin" />
          <Swords v-else class="w-4 h-4" />
          Mulai Battle!
          <span v-if="store.alivePlayers.length < 2" class="text-xs font-normal opacity-70">(min. 2 pemain)</span>
        </button>

        <div v-else class="w-full py-3 text-center text-slate-400 text-sm font-medium bg-white/5 rounded-xl border border-dashed border-white/10">
          ⏳ Menunggu host memulai game...
        </div>

        <!-- Leave -->
        <button
          @click="store.leaveRoom(); emit('exit')"
          class="w-full mt-3 py-2.5 text-slate-500 hover:text-rose-400 text-sm font-medium transition cursor-pointer"
        >
          Keluar Room
        </button>
      </div>
    </template>

  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
</style>
