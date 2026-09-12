<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Trophy, Medal, ArrowUpRight } from '@lucide/vue';
import { supabase } from '../../../lib/supabaseClient';
import { hiraganaData } from '../../../data/hiragana';
import { katakanaData } from '../../../data/katakana';
import { wordsData } from '../../../data/words';
import { kanjiN5Data } from '../../../data/kanji';
import { useQuizStore } from '../../../stores/quizStore';
import { useAuthStore } from '../../../stores/authStore';

const emit = defineEmits<{
  (e: 'openLeaderboard'): void;
}>();

const quizStore = useQuizStore();
const authStore = useAuthStore();

const activeTab = ref<'cumulative' | 'speed' | 'mastery'>('cumulative');
const cumulativeList = ref<any[]>([]);
const speedList = ref<any[]>([]);
const masteryList = ref<any[]>([]);
const loading = ref(false);

const TOTAL_CHARACTERS = hiraganaData.length + katakanaData.length + wordsData.length + kanjiN5Data.length;

const formatUsername = (name: string | null | undefined): string => {
  if (!name) return 'Pemain';
  return name.includes('@') ? name.split('@')[0] : name;
};

const isCurrentPlayer = (player: any): boolean => {
  if (!authStore.user?.id) return false;
  return player.user_id === authStore.user.id || player.id === authStore.user.id;
};

const fetchCumulative = async () => {
  const { data, error } = await supabase
    .from('leaderboard_cumulative')
    .select('*')
    .limit(5);

  if (error) throw error;
  cumulativeList.value = data || [];
};

const fetchSpeed = async () => {
  const { data, error } = await supabase
    .from('leaderboard_speed')
    .select('*')
    .limit(5);

  if (error) throw error;
  speedList.value = data || [];
};

const fetchMastery = async () => {
  try {
    const { data: usersData } = await supabase.from('users').select('id, username');
    const userMap: Record<string, string> = {};
    if (usersData) {
      usersData.forEach((u: any) => {
        if (u.id && u.username) userMap[u.id] = u.username;
      });
    }

    const { data: streaksData, error } = await supabase
      .from('user_streaks')
      .select('user_id, character, streak')
      .gte('streak', 3);

    if (error && error.code !== 'PGRST116') {
      console.warn('Could not fetch user_streaks:', error);
    }

    const userMasteredMap: Record<string, Set<string>> = {};
    if (streaksData) {
      streaksData.forEach((item: any) => {
        if (!userMasteredMap[item.user_id]) {
          userMasteredMap[item.user_id] = new Set();
        }
        userMasteredMap[item.user_id].add(item.character);
      });
    }

    const result: Array<{ id: string; username: string; percentage: number; isCurrentUser?: boolean }> = [];
    const currentUserId = authStore.user?.id;
    let currentUserAdded = false;

    Object.entries(userMasteredMap).forEach(([uid, charSet]) => {
      const count = charSet.size;
      const pct = Math.min(100, Math.round((count / TOTAL_CHARACTERS) * 100));
      const username = (currentUserId === uid ? authStore.displayUsername : null) || userMap[uid] || 'Pemain';
      const isCurrentUser = uid === currentUserId;
      if (isCurrentUser) currentUserAdded = true;
      result.push({
        id: uid,
        username,
        percentage: pct,
        isCurrentUser,
      });
    });

    const localMasteredCount = [...hiraganaData, ...katakanaData, ...wordsData, ...kanjiN5Data].filter(
      item => quizStore.getMasteryStreak(item.character) >= 3
    ).length;
    const localPct = Math.min(100, Math.round((localMasteredCount / TOTAL_CHARACTERS) * 100));

    if (!currentUserAdded && (localPct > 0 || currentUserId)) {
      result.push({
        id: currentUserId || 'local_user',
        username: authStore.displayUsername || 'Kamu',
        percentage: localPct,
        isCurrentUser: true,
      });
    } else if (currentUserAdded) {
      const cur = result.find(r => r.isCurrentUser);
      if (cur) {
        cur.percentage = Math.max(cur.percentage, localPct);
      }
    }

    result.sort((a, b) => b.percentage - a.percentage);
    masteryList.value = result.slice(0, 5);
  } catch (err: any) {
    console.error('Error loading mastery leaderboard:', err);
    masteryList.value = [];
  }
};

const loadActiveTabData = async (force = false) => {
  loading.value = true;
  try {
    if (activeTab.value === 'cumulative' && (force || cumulativeList.value.length === 0)) {
      await fetchCumulative();
    } else if (activeTab.value === 'speed' && (force || speedList.value.length === 0)) {
      await fetchSpeed();
    } else if (activeTab.value === 'mastery' && (force || masteryList.value.length === 0)) {
      await fetchMastery();
    }
  } catch (err) {
    console.error('Desktop leaderboard load error:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadActiveTabData();
});

watch(activeTab, () => {
  loadActiveTabData(true);
});
</script>

<template>
  <div class="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-3.5 sm:p-5 shadow-sm flex flex-col gap-4 text-slate-800 dark:text-slate-100 transition-all">
    <!-- Header: Title & Icon -->
    <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base shadow-2xs">
          <Trophy class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Papan Peringkat
          </h3>
          <div class="text-sm font-black text-gray-900 dark:text-slate-100">
            Top 5 Pemain
          </div>
        </div>
      </div>

      <button
        type="button"
        @click="emit('openLeaderboard')"
        class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
        title="Buka Peringkat Penuh"
      >
        <span>Detail</span>
        <ArrowUpRight class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Category Tabs -->
    <div class="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-slate-950 p-1 rounded-2xl border border-gray-200/70 dark:border-slate-800/80">
      <button
        type="button"
        @click="activeTab = 'cumulative'"
        class="py-1.5 px-1 rounded-xl text-[11px] font-black transition-all cursor-pointer text-center"
        :class="activeTab === 'cumulative' 
          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs' 
          : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
      >
        Skor
      </button>
      <button
        type="button"
        @click="activeTab = 'speed'"
        class="py-1.5 px-1 rounded-xl text-[11px] font-black transition-all cursor-pointer text-center"
        :class="activeTab === 'speed' 
          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs' 
          : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
      >
        Speed
      </button>
      <button
        type="button"
        @click="activeTab = 'mastery'"
        class="py-1.5 px-1 rounded-xl text-[11px] font-black transition-all cursor-pointer text-center"
        :class="activeTab === 'mastery' 
          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs' 
          : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
      >
        Huruf
      </button>
    </div>

    <!-- Rankings List -->
    <div class="flex flex-col gap-2 min-h-[220px]">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-slate-500">
        <div class="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <span class="text-xs font-semibold">Memuat peringkat...</span>
      </div>

      <!-- Cumulative Tab Content -->
      <template v-else-if="activeTab === 'cumulative'">
        <div 
          v-for="(player, idx) in cumulativeList" 
          :key="player.user_id || player.id || idx"
          class="flex items-center justify-between p-2.5 rounded-2xl transition-all"
          :class="[
            isCurrentPlayer(player) 
              ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800' 
              : 'bg-slate-50/70 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/70 hover:border-gray-200 dark:hover:border-slate-700'
          ]"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0"
              :class="[
                idx === 0 ? 'text-amber-500 bg-amber-500/15' :
                idx === 1 ? 'text-slate-400 bg-slate-400/15' :
                idx === 2 ? 'text-amber-700 bg-amber-700/15' :
                'text-slate-400 font-mono text-[11px]'
              ]"
            >
              <Medal v-if="idx < 3" class="w-4 h-4 fill-current" />
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <span class="text-xs font-bold text-gray-800 dark:text-slate-200 truncate">
              {{ formatUsername(player.username) }}
              <span v-if="isCurrentPlayer(player)" class="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal ml-0.5">(Kamu)</span>
            </span>
          </div>

          <div class="text-right shrink-0">
            <span class="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400">
              {{ player.total_score?.toLocaleString() || 0 }}
            </span>
            <span class="text-[10px] text-slate-400 block -mt-0.5">pts</span>
          </div>
        </div>

        <div v-if="cumulativeList.length === 0" class="text-center py-8 text-xs text-gray-400 dark:text-slate-500">
          Belum ada data peringkat.
        </div>
      </template>

      <!-- Speed Tab Content -->
      <template v-else-if="activeTab === 'speed'">
        <div 
          v-for="(player, idx) in speedList" 
          :key="player.user_id || player.id || idx"
          class="flex items-center justify-between p-2.5 rounded-2xl transition-all"
          :class="[
            isCurrentPlayer(player) 
              ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800' 
              : 'bg-slate-50/70 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/70 hover:border-gray-200 dark:hover:border-slate-700'
          ]"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0"
              :class="[
                idx === 0 ? 'text-amber-500 bg-amber-500/15' :
                idx === 1 ? 'text-slate-400 bg-slate-400/15' :
                idx === 2 ? 'text-amber-700 bg-amber-700/15' :
                'text-slate-400 font-mono text-[11px]'
              ]"
            >
              <Medal v-if="idx < 3" class="w-4 h-4 fill-current" />
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <span class="text-xs font-bold text-gray-800 dark:text-slate-200 truncate">
              {{ formatUsername(player.username) }}
              <span v-if="isCurrentPlayer(player)" class="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal ml-0.5">(Kamu)</span>
            </span>
          </div>

          <div class="text-right shrink-0">
            <span class="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
              {{ player.speed_seconds }}s
            </span>
            <span class="text-[10px] text-slate-400 block -mt-0.5">{{ player.score }} pts</span>
          </div>
        </div>

        <div v-if="speedList.length === 0" class="text-center py-8 text-xs text-gray-400 dark:text-slate-500">
          Belum ada data speed quiz.
        </div>
      </template>

      <!-- Mastery Tab Content -->
      <template v-else-if="activeTab === 'mastery'">
        <div 
          v-for="(player, idx) in masteryList" 
          :key="player.id || idx"
          class="flex items-center justify-between p-2.5 rounded-2xl transition-all"
          :class="[
            Boolean(authStore.user?.id && player.isCurrentUser) 
              ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800' 
              : 'bg-slate-50/70 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/70 hover:border-gray-200 dark:hover:border-slate-700'
          ]"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0"
              :class="[
                idx === 0 ? 'text-amber-500 bg-amber-500/15' :
                idx === 1 ? 'text-slate-400 bg-slate-400/15' :
                idx === 2 ? 'text-amber-700 bg-amber-700/15' :
                'text-slate-400 font-mono text-[11px]'
              ]"
            >
              <Medal v-if="idx < 3" class="w-4 h-4 fill-current" />
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <span class="text-xs font-bold text-gray-800 dark:text-slate-200 truncate">
              {{ formatUsername(player.username) }}
              <span v-if="authStore.user?.id && player.isCurrentUser" class="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal ml-0.5">(Kamu)</span>
            </span>
          </div>

          <div class="text-right shrink-0">
            <span class="text-xs font-black font-mono text-purple-600 dark:text-purple-400">
              {{ player.percentage }}%
            </span>
            <span class="text-[10px] text-slate-400 block -mt-0.5">dikuasai</span>
          </div>
        </div>

        <div v-if="masteryList.length === 0" class="text-center py-8 text-xs text-gray-400 dark:text-slate-500">
          Belum ada data penguasaan.
        </div>
      </template>
    </div>

    <!-- CTA Button to Open Full Leaderboard Modal -->
    <button
      type="button"
      @click="emit('openLeaderboard')"
      class="w-full py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200/80 dark:border-amber-800/80 flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs active:scale-[0.98]"
    >
      <Trophy class="w-4 h-4" />
      <span>Buka Leaderboard Penuh</span>
    </button>
  </div>
</template>
