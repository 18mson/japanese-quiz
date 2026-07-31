<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import QuizHeader from './components/QuizHeader.vue';
import QuizQuestion from './components/QuizQuestion.vue';
import QuizOptions from './components/QuizOptions.vue';
import QuizWordInput from './components/QuizWordInput.vue';
import QuizSentenceTyping from './components/QuizSentenceTyping.vue';
import QuizResults from './components/QuizResults.vue';
import StartScreen from './components/StartScreen.vue';
import AuthModal from './components/AuthModal.vue';
import LeaderboardModal from './components/LeaderboardModal.vue';
import MasteryGridModal from './components/MasteryGridModal.vue';
import LevelUpModal from './components/LevelUpModal.vue';
import SyncConflictModal from './components/SyncConflictModal.vue';
import QuizBottomNav from './components/QuizBottomNav.vue';
import BattlegroundMode from './components/BattlegroundMode.vue';

import { useQuizStore } from './stores/quizStore';
import { useAuthStore } from './stores/authStore';
import { User, LogOut, Trophy } from '@lucide/vue';

const quizStore = useQuizStore();
const authStore = useAuthStore();

const quizStarted = ref(false);
const showAuthModal = ref(false);
const showLeaderboardModal = ref(false);
const showMasteryGridModal = ref(false);
const showBattleground = ref(false);

const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (!quizStarted.value || quizStore.quizCompleted) return;
  
  if (event.key === 'Enter') {
    if (quizStore.selectedAnswer !== null) {
      quizStore.nextQuestion();
      event.preventDefault();
    }
  }
};

onMounted(async () => {
  window.addEventListener('keydown', handleGlobalKeydown);
  await authStore.checkSession();
  quizStore.startQuiz(1);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});

const startQuiz = () => {
  quizStarted.value = true;
};

const handleStartWeakQuiz = async ({ type }: { type: string }) => {
  showMasteryGridModal.value = false;
  await quizStore.startWeakItemsQuiz(1, type);
  quizStarted.value = true;
};

const openBattleground = () => {
  showBattleground.value = true;
};

const goToHome = () => {
  quizStarted.value = false;
  quizStore.quizCompleted = false;
};
</script>

<template>
  <div class="h-full w-screen bg-slate-50 font-sans flex flex-col overflow-hidden select-none">
    <!-- Top Global App Bar -->
    <header class="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shadow-xs flex-shrink-0 z-20">
      <div class="flex items-center gap-2 cursor-pointer" @click="goToHome">
        <span class="text-xl">🇯🇵</span>
        <span class="font-extrabold text-gray-900 tracking-tight text-sm sm:text-base">Japanese Quiz</span>
      </div>

      <div class="flex items-center gap-2">
        <button 
          @click="showLeaderboardModal = true"
          class="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition flex items-center gap-1.5 text-xs font-bold border border-amber-200 cursor-pointer"
          title="Lihat Papan Peringkat"
        >
          <Trophy class="w-4 h-4 text-amber-500" />
          <span class="hidden sm:inline">Papan Peringkat</span>
        </button>

        <template v-if="authStore.user">
          <div class="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl">
            <User class="w-4 h-4 text-indigo-600" />
            <span class="text-xs font-bold text-indigo-900 truncate max-w-[100px]">
              {{ authStore.displayUsername }}
            </span>
          </div>
          <button 
            @click="authStore.logout"
            class="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
            title="Keluar"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </template>
        <template v-else>
          <button 
            @click="showAuthModal = true"
            class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Masuk / Daftar
          </button>
        </template>
      </div>
    </header>

    <!-- Modals -->
    <AuthModal 
      :is-open="showAuthModal" 
      @close="showAuthModal = false" 
    />
    <LeaderboardModal 
      :is-open="showLeaderboardModal" 
      @close="showLeaderboardModal = false" 
    />
    <MasteryGridModal 
      :is-open="showMasteryGridModal" 
      @close="showMasteryGridModal = false" 
      @start-weak-quiz="handleStartWeakQuiz"
    />
    <LevelUpModal />
    <SyncConflictModal
      :is-open="authStore.showSyncConflictModal"
      :local-count="authStore.pendingLocalCount"
      :server-count="authStore.pendingServerCount"
      :loading="authStore.syncConflictLoading"
      @resolve="authStore.resolveSyncConflict"
    />

    <!-- Main Screens -->
    <StartScreen v-if="!quizStarted" @start="startQuiz" @open-mastery-grid="showMasteryGridModal = true" @open-battleground="openBattleground" />
    <div v-else class="max-w-2xl w-full mx-auto p-4 flex flex-col min-h-full overflow-y-auto relative pb-24">
      <QuizHeader v-if="!quizStore.quizCompleted" class="flex-shrink-0" />
      
      <main class="bg-white rounded-2xl shadow-md p-4 sm:p-6 flex flex-col items-center justify-center w-full border border-gray-100 mb-4 flex-shrink-0 min-h-[300px]" v-if="!quizStore.quizCompleted">
        <div v-if="quizStore.isLoading" class="flex flex-col items-center justify-center py-12 text-gray-500">
          <div class="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <span class="text-sm font-bold text-gray-600">Memuat Soal Kuis...</span>
        </div>
        <template v-else>
          <QuizSentenceTyping v-if="quizStore.questionType === 'sentences'" />
          <template v-else>
            <QuizQuestion class="flex-shrink-0" />
            <div class="w-full flex flex-col justify-start items-center py-2">
              <QuizWordInput v-if="quizStore.isTypingMode" />
              <QuizOptions v-else />
            </div>
          </template>
        </template>
      </main>
      
      <QuizResults v-else class="flex-1 overflow-hidden" @home="goToHome" @leaderboard="showLeaderboardModal = true" />
      <QuizBottomNav :quiz-started="quizStarted" />
    </div>

    <!-- Battleground Mode (full-screen overlay) -->
    <BattlegroundMode
      v-if="showBattleground"
      @exit="showBattleground = false"
    />
  </div>
</template>

<style scoped>
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes scaleUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
.animate-scaleUp { animation: scaleUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
</style>
