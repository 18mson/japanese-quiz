<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { Trophy, Award } from '@lucide/vue';
import { hiraganaData } from '../data/hiragana';
import { katakanaData } from '../data/katakana';
import { wordsData } from '../data/words';
import { kanjiN5Data } from '../data/kanji';
import { useQuizStore } from '../stores/quizStore';
import { useAuthStore } from '../stores/authStore';
import BaseModal from './common/BaseModal.vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close']);

const quizStore = useQuizStore();
const authStore = useAuthStore();

const activeTab = ref<'cumulative' | 'speed' | 'mastery'>('cumulative');
const tabIndex = computed(() => {
  if (activeTab.value === 'speed') return 1;
  if (activeTab.value === 'mastery') return 2;
  return 0;
});
const cumulativeList = ref<any[]>([]);
const speedList = ref<any[]>([]);
const masteryList = ref<any[]>([]);
const loading = ref(false);
const errorMsg = ref<string | null>(null);

const TOTAL_CHARACTERS = hiraganaData.length + katakanaData.length + wordsData.length + kanjiN5Data.length;

const formatUsername = (name: string | null | undefined): string => {
  if (!name) return 'Pemain';
  return name.includes('@') ? name.split('@')[0] : name;
};

const fetchCumulative = async () => {
  const { data, error } = await supabase
    .from('leaderboard_cumulative')
    .select('*')
    .limit(10);
    
  if (error) throw error;
  cumulativeList.value = data || [];
};

const fetchSpeed = async () => {
  const { data, error } = await supabase
    .from('leaderboard_speed')
    .select('*')
    .limit(10);
    
  if (error) throw error;
  speedList.value = data || [];
};

const fetchMastery = async () => {
  try {
    // 1. Fetch user names
    const { data: usersData } = await supabase.from('users').select('id, username');
    const userMap: Record<string, string> = {};
    if (usersData) {
      usersData.forEach((u: any) => {
        if (u.id && u.username) userMap[u.id] = u.username;
      });
    }

    // 2. Fetch streaks with streak >= 3
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

    // Calculate current local user mastery
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

    // Sort by percentage descending
    result.sort((a, b) => b.percentage - a.percentage);
    masteryList.value = result.slice(0, 10);
  } catch (err: any) {
    console.error('Error loading mastery leaderboard:', err);
    masteryList.value = [];
  }
};

const loadLeaderboardData = async () => {
  loading.value = true;
  errorMsg.value = null;
  try {
    if (activeTab.value === 'cumulative') {
      await fetchCumulative();
    } else if (activeTab.value === 'speed') {
      await fetchSpeed();
    } else if (activeTab.value === 'mastery') {
      await fetchMastery();
    }
  } catch (err: any) {
    console.error('Error loading leaderboard:', err);
    errorMsg.value = 'Failed to load leaderboard data. Please try again.';
  } finally {
    loading.value = false;
  }
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadLeaderboardData();
  }
});

watch(activeTab, () => {
  loadLeaderboardData();
});
</script>

<template>
  <BaseModal
    :is-open="isOpen"
    max-width="lg"
    :show-close-button="false"
    @close="emit('close')"
  >
    <template #header>
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/40 flex items-center justify-between flex-shrink-0">
        <h3 class="text-lg font-extrabold text-gray-800 dark:text-slate-100 flex items-center gap-2">
          <Trophy class="w-5 h-5 text-amber-500" /> <span>Leaderboard</span>
        </h3>
        <button 
          @click="emit('close')"
          class="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 transition cursor-pointer text-xl"
        >
          &times;
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="relative flex border-b border-gray-100 dark:border-slate-800 flex-shrink-0 bg-gray-50/40 dark:bg-slate-900/40">
        <!-- Sliding Underline Indicator -->
        <div 
          class="absolute bottom-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
          :style="{
            width: 'calc(100% / 3)',
            transform: `translateX(${tabIndex * 100}%)`
          }"
        ></div>

        <button 
          class="relative z-10 flex-1 py-3 text-center text-xs font-bold transition-colors duration-200 cursor-pointer uppercase tracking-wider select-none"
          :class="activeTab === 'cumulative' ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200'"
          @click="activeTab = 'cumulative'"
        >
          Total Score
        </button>
        <button 
          class="relative z-10 flex-1 py-3 text-center text-xs font-bold transition-colors duration-200 cursor-pointer uppercase tracking-wider select-none"
          :class="activeTab === 'speed' ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200'"
          @click="activeTab = 'speed'"
        >
          Fastest Speed
        </button>
        <button 
          class="relative z-10 flex-1 py-3 text-center text-xs font-bold transition-colors duration-200 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1 select-none"
          :class="activeTab === 'mastery' ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200'"
          @click="activeTab = 'mastery'"
        >
          <Award class="w-3.5 h-3.5 text-amber-500" />
          <span>Huruf</span>
        </button>
      </div>
    </template>

      <!-- Content Area -->
      <div class="p-6 flex-1 overflow-y-auto">
        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
          <span class="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></span>
          <p class="text-xs text-gray-500 dark:text-slate-400 mt-3 font-semibold">Loading leaderboard...</p>
        </div>

        <div v-else-if="errorMsg" class="text-center py-8 text-rose-500 dark:text-rose-400 text-sm">
          {{ errorMsg }}
        </div>

        <Transition v-else name="tab-fade" mode="out-in">
          <div :key="activeTab">
            <!-- Cumulative Rankings -->
            <table v-if="activeTab === 'cumulative'" class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-gray-100 dark:border-slate-800 text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                <th class="pb-3 w-12">Rank</th>
                <th class="pb-3">Player</th>
                <th class="pb-3 text-right">Total Pts</th>
                <th class="pb-3 text-right">Games</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(row, idx) in cumulativeList" 
                :key="idx" 
                class="border-b border-gray-50 dark:border-slate-800/60 last:border-none hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td class="py-3.5 font-extrabold text-sm text-gray-500 dark:text-slate-400">
                  <div class="flex items-center">
                    <Medal v-if="idx === 0" class="w-5 h-5 text-amber-500 fill-amber-500/20" />
                    <Medal v-else-if="idx === 1" class="w-5 h-5 text-slate-400 fill-slate-400/20" />
                    <Medal v-else-if="idx === 2" class="w-5 h-5 text-amber-700 fill-amber-700/20" />
                    <span v-else>#{{ idx + 1 }}</span>
                  </div>
                </td>
                <td class="py-3.5 font-bold text-sm text-gray-800 dark:text-slate-100">
                  {{ formatUsername(row.username) }}
                </td>
                <td class="py-3.5 font-mono text-sm text-indigo-600 dark:text-indigo-400 font-extrabold text-right">
                  {{ row.total_score }}
                </td>
                <td class="py-3.5 font-mono text-xs text-gray-500 dark:text-slate-400 text-right">
                  {{ row.games_played }}
                </td>
              </tr>
              <tr v-if="cumulativeList.length === 0">
                <td colspan="4" class="text-center py-12 text-gray-400 dark:text-slate-500 text-xs font-semibold">
                  No records yet. Be the first to secure a spot!
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Speed Rankings -->
          <table v-else-if="activeTab === 'speed'" class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-gray-100 dark:border-slate-800 text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                <th class="pb-3 w-12">Rank</th>
                <th class="pb-3">Player</th>
                <th class="pb-3 text-right">Time</th>
                <th class="pb-3 text-right">Score</th>
                <th class="pb-3 text-right">Mode</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(row, idx) in speedList" 
                :key="row.id" 
                class="border-b border-gray-50 dark:border-slate-800/60 last:border-none hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td class="py-3.5 font-extrabold text-sm text-gray-500 dark:text-slate-400">
                  <div class="flex items-center">
                    <Zap v-if="idx === 0" class="w-5 h-5 text-amber-500 fill-amber-500/20" />
                    <span v-else>#{{ idx + 1 }}</span>
                  </div>
                </td>
                <td class="py-3.5 font-bold text-sm text-gray-800 dark:text-slate-100">
                  {{ formatUsername(row.username) }}
                </td>
                <td class="py-3.5 font-mono text-sm text-teal-600 dark:text-teal-400 font-extrabold text-right">
                  {{ row.duration_seconds.toFixed(1) }}s
                </td>
                <td class="py-3.5 font-mono text-xs text-gray-500 dark:text-slate-400 text-right">
                  {{ row.score }} pts
                </td>
                <td class="py-3.5 text-xs text-gray-500 dark:text-slate-400 text-right font-medium">
                  <span class="capitalize">{{ row.quiz_type }}</span> ({{ row.quiz_level }})
                </td>
              </tr>
              <tr v-if="speedList.length === 0">
                <td colspan="5" class="text-center py-12 text-gray-400 dark:text-slate-500 text-xs font-semibold">
                  No records yet. Be the first to secure a spot!
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Character Mastery Rankings -->
          <table v-else-if="activeTab === 'mastery'" class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-gray-100 dark:border-slate-800 text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                <th class="pb-3 w-12">Rank</th>
                <th class="pb-3">User</th>
                <th class="pb-3 text-right">Penguasaan</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(row, idx) in masteryList" 
                :key="row.id || idx" 
                class="border-b border-gray-50 dark:border-slate-800/60 last:border-none hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td class="py-3.5 font-extrabold text-sm text-gray-500 dark:text-slate-400">
                  <div class="flex items-center">
                    <Medal v-if="idx === 0" class="w-5 h-5 text-amber-500 fill-amber-500/20" />
                    <Medal v-else-if="idx === 1" class="w-5 h-5 text-slate-400 fill-slate-400/20" />
                    <Medal v-else-if="idx === 2" class="w-5 h-5 text-amber-700 fill-amber-700/20" />
                    <span v-else>#{{ idx + 1 }}</span>
                  </div>
                </td>
                <td class="py-3.5 font-bold text-sm text-gray-800 dark:text-slate-100">
                  <div class="flex items-center gap-2">
                    <span>{{ formatUsername(row.username) }}</span>
                    <span v-if="row.isCurrentUser" class="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-extrabold">Kamu</span>
                  </div>
                </td>
                <td class="py-3.5 text-right">
                  <div class="inline-flex items-center justify-end gap-2">
                    <div class="w-16 sm:w-24 bg-gray-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden hidden sm:block">
                      <div class="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full" :style="{ width: `${row.percentage}%` }"></div>
                    </div>
                    <span class="font-mono text-sm font-black text-indigo-600 dark:text-indigo-400">{{ row.percentage }}%</span>
                  </div>
                </td>
              </tr>
              <tr v-if="masteryList.length === 0">
                <td colspan="3" class="text-center py-12 text-gray-400 dark:text-slate-500 text-xs font-semibold">
                  Belum ada data penguasaan. Mulai kuis untuk meningkatkan penguasaan hurufmu!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Transition>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="px-6 py-4 bg-gray-50 dark:bg-slate-800/40 border-t border-gray-100 dark:border-slate-800 flex justify-end flex-shrink-0">
        <button 
          @click="emit('close')" 
          class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md hover:shadow-lg"
        >
          Tutup
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
