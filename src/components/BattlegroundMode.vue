<script setup lang="ts">
// BattlegroundMode.vue
// Main orchestrator. Renders the correct sub-screen based on store.phase.

import { computed } from 'vue';
import { useBattlegroundStore } from '../stores/battlegroundStore';
import BattlegroundLobby from './battleground/BattlegroundLobby.vue';
import BattlegroundRound from './battleground/BattlegroundRound.vue';
import BattlegroundRoundResult from './battleground/BattlegroundRoundResult.vue';
import BattlegroundGameOver from './battleground/BattlegroundGameOver.vue';
import { ShieldOff, Loader2 } from '@lucide/vue';

const store = useBattlegroundStore();
const emit = defineEmits<{ exit: [] }>();

// When game is over we let the child emit exit.
// Also handle ESC key for exit from lobby/idle.
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && (store.phase === 'idle' || store.phase === 'lobby')) {
    handleExit();
  }
}

function handleExit() {
  store.leaveRoom();
  emit('exit');
}

// Spectator overlay — shown when player is eliminated but round is still active
const isSpectating = computed(() =>
  !store.iAmAlive && (store.phase === 'round_active' || store.phase === 'round_preparing')
);

</script>

<template>
  <div
    class="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white overflow-hidden"
    tabindex="-1"
    @keydown="handleKeydown"
  >
    <!-- Loading overlay -->
    <div
      v-if="store.isLoading && store.phase === 'idle'"
      class="absolute inset-0 bg-slate-950/80 flex items-center justify-center z-50"
    >
      <div class="flex flex-col items-center gap-3">
        <Loader2 class="w-8 h-8 text-indigo-400 animate-spin" />
        <span class="text-slate-400 text-sm font-bold">Loading...</span>
      </div>
    </div>

    <!-- Spectator overlay (shown on top of round screen) -->
    <div
      v-if="isSpectating"
      class="absolute top-0 left-0 right-0 z-30 flex items-center justify-center py-2 bg-gradient-to-r from-slate-900/90 via-indigo-900/90 to-slate-900/90 backdrop-blur-sm"
    >
      <div class="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-sm font-bold text-slate-400">
        <ShieldOff class="w-4 h-4 text-rose-500" />
        Kamu sedang SPECTATING
        <span class="text-slate-600">·</span>
        <span class="text-rose-400">{{ store.myPlayer?.elimination_reason ?? 'Gugur' }}</span>
      </div>
    </div>

    <!-- Phase-based screen rendering -->
    <transition name="phase-fade" mode="out-in">

      <!-- idle + lobby: handled together in BattlegroundLobby -->
      <BattlegroundLobby
        v-if="store.phase === 'idle' || store.phase === 'lobby'"
        key="lobby"
        @exit="handleExit"
      />

      <!-- round_preparing + round_active: both show the typing screen -->
      <!-- The BattlegroundRound itself handles the pre-countdown display -->
      <BattlegroundRound
        v-else-if="store.phase === 'round_preparing' || store.phase === 'round_active'"
        key="round"
      />

      <!-- round_result -->
      <BattlegroundRoundResult
        v-else-if="store.phase === 'round_result'"
        key="result"
      />

      <!-- game_over -->
      <BattlegroundGameOver
        v-else-if="store.phase === 'game_over'"
        key="game-over"
        @exit="handleExit"
      />

    </transition>

    <!-- Floating exit button (lobby/idle only, top-right) -->
    <button
      v-if="store.phase === 'idle' || store.phase === 'lobby'"
      @click="handleExit"
      class="absolute top-3 right-3 z-40 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
      title="Keluar (Esc)"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

  </div>
</template>

<style scoped>
.phase-fade-enter-active,
.phase-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.phase-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.phase-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
