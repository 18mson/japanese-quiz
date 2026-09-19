<script setup lang="ts">
// src/components/battleground/BattlegroundPlayersPanel.vue
import { useBattlegroundStore } from '../../stores/battlegroundStore';
import { CheckCircle2, ShieldX } from '@lucide/vue';
import BattlegroundAvatar from './BattlegroundAvatar.vue';

defineProps<{
  mode: 'mobile' | 'desktop';
  myProgressPct: number;
}>();

const store = useBattlegroundStore();

function getProgress(playerId: string): number {
  const p = store.playerProgress.get(playerId);
  if (!p) return 0;
  return p.progressPercentage;
}
</script>

<template>
  <!-- MOBILE COMPACT AVATAR BAR -->
  <div
    v-if="mode === 'mobile'"
    class="md:hidden flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border-b border-white/10 overflow-x-auto flex-shrink-0 z-10 no-scrollbar"
  >
    <div
      v-for="player in store.alivePlayers"
      :key="player.player_id"
      class="flex items-center gap-1.5 bg-white/5 rounded-full px-2 py-0.5 border border-white/10 flex-shrink-0 text-[10px]"
    >
      <BattlegroundAvatar
        :seed="player.avatar_seed"
        :name="player.player_name"
        custom-class="w-4 h-4 rounded-full text-[7px]"
        border-class="border border-white/30"
      />
      <span
        class="font-bold max-w-[60px] truncate"
        :class="player.player_id === store.myPlayerId ? 'text-amber-300' : 'text-slate-300'"
      >
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
        {{ player.player_id === store.myPlayerId ? `${myProgressPct}%` : `${getProgress(player.player_id)}%` }}
      </span>
    </div>
  </div>

  <!-- DESKTOP VERTICAL SIDEBAR -->
  <div
    v-else
    class="hidden md:flex w-48 flex-shrink-0 border-l border-white/10 overflow-y-auto p-3 flex-col gap-2"
  >
    <div class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Pemain</div>

    <div
      v-for="player in store.alivePlayers"
      :key="player.player_id"
      class="bg-white/5 rounded-xl p-2.5 relative"
    >
      <div class="flex items-center gap-1.5 mb-1">
        <BattlegroundAvatar
          :seed="player.avatar_seed"
          :name="player.player_name"
          size="xs"
          border-class="border border-white/20"
        />
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
          :style="{ width: player.player_id === store.myPlayerId ? `${myProgressPct}%` : `${getProgress(player.player_id)}%` }"
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
          <BattlegroundAvatar
            :seed="player.avatar_seed"
            :name="player.player_name"
            size="xs"
            border-class="border border-white/10"
          />
          <span class="text-xs text-slate-500 truncate flex-1">{{ player.player_name }}</span>
          <ShieldX class="w-3 h-3 text-rose-800 flex-shrink-0" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
