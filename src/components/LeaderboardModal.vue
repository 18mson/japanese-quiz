<script setup lang="ts">
import { ref, watch } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { Trophy, Medal, Zap } from '@lucide/vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const activeTab = ref<'cumulative' | 'speed'>('cumulative');
const cumulativeList = ref<any[]>([]);
const speedList = ref<any[]>([]);
const loading = ref(false);
const errorMsg = ref<string | null>(null);

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

const loadLeaderboardData = async () => {
  loading.value = true;
  errorMsg.value = null;
  try {
    if (activeTab.value === 'cumulative') {
      await fetchCumulative();
    } else {
      await fetchSpeed();
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
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300"
    @click.self="emit('close')"
  >
    <div 
      class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-300 scale-100 border border-gray-100 flex flex-col max-h-[85vh]"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0">
        <h3 class="text-lg font-extrabold text-gray-800 flex items-center gap-2">
          <Trophy class="w-5 h-5 text-amber-500" /> <span>Leaderboard</span>
        </h3>
        <button 
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 transition cursor-pointer text-xl"
        >
          &times;
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex border-b border-gray-100 flex-shrink-0">
        <button 
          class="flex-1 py-3 text-center text-xs font-bold border-b-2 transition-all cursor-pointer uppercase tracking-wider"
          :class="activeTab === 'cumulative' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'"
          @click="activeTab = 'cumulative'"
        >
          Total Score
        </button>
        <button 
          class="flex-1 py-3 text-center text-xs font-bold border-b-2 transition-all cursor-pointer uppercase tracking-wider"
          :class="activeTab === 'speed' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'"
          @click="activeTab = 'speed'"
        >
          Fastest Speed
        </button>
      </div>

      <!-- Content Area -->
      <div class="p-6 flex-1 overflow-y-auto">
        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
          <span class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></span>
          <p class="text-xs text-gray-500 mt-3 font-semibold">Loading scores...</p>
        </div>

        <div v-else-if="errorMsg" class="text-center py-8 text-rose-500 text-sm">
          {{ errorMsg }}
        </div>

        <div v-else>
          <!-- Cumulative Rankings -->
          <table v-if="activeTab === 'cumulative'" class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
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
                class="border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors"
              >
                <td class="py-3.5 font-extrabold text-sm text-gray-500">
                  <div class="flex items-center">
                    <Medal v-if="idx === 0" class="w-5 h-5 text-amber-500 fill-amber-500/20" />
                    <Medal v-else-if="idx === 1" class="w-5 h-5 text-slate-400 fill-slate-400/20" />
                    <Medal v-else-if="idx === 2" class="w-5 h-5 text-amber-700 fill-amber-700/20" />
                    <span v-else>#{{ idx + 1 }}</span>
                  </div>
                </td>
                <td class="py-3.5 font-bold text-sm text-gray-800">
                  {{ row.username }}
                </td>
                <td class="py-3.5 font-mono text-sm text-indigo-600 font-extrabold text-right">
                  {{ row.total_score }}
                </td>
                <td class="py-3.5 font-mono text-xs text-gray-500 text-right">
                  {{ row.games_played }}
                </td>
              </tr>
              <tr v-if="cumulativeList.length === 0">
                <td colspan="4" class="text-center py-12 text-gray-400 text-xs font-semibold">
                  No records yet. Be the first to secure a spot!
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Speed Rankings -->
          <table v-else class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
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
                class="border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors"
              >
                <td class="py-3.5 font-extrabold text-sm text-gray-500">
                  <div class="flex items-center">
                    <Zap v-if="idx === 0" class="w-5 h-5 text-amber-500 fill-amber-500/20" />
                    <span v-else>#{{ idx + 1 }}</span>
                  </div>
                </td>
                <td class="py-3.5 font-bold text-sm text-gray-800">
                  {{ row.username }}
                </td>
                <td class="py-3.5 font-mono text-sm text-teal-600 font-extrabold text-right">
                  {{ row.duration_seconds.toFixed(1) }}s
                </td>
                <td class="py-3.5 font-mono text-xs text-gray-500 text-right">
                  {{ row.score }} pts
                </td>
                <td class="py-3.5 text-xs text-gray-500 text-right font-medium">
                  <span class="capitalize">{{ row.quiz_type }}</span> ({{ row.quiz_level }})
                </td>
              </tr>
              <tr v-if="speedList.length === 0">
                <td colspan="5" class="text-center py-12 text-gray-400 text-xs font-semibold">
                  No records yet. Be the first to secure a spot!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end flex-shrink-0">
        <button 
          @click="emit('close')"
          class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md hover:shadow-lg"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
