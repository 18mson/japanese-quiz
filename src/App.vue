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

import AboutModal from './components/AboutModal.vue';
import PreviewCardModal from './components/preview/PreviewCardModal.vue';
import GoalCelebrationToast from './components/goals/GoalCelebrationToast.vue';
import { useQuizStore } from './stores/quizStore';
import { useAuthStore } from './stores/authStore';
import { useSettingsStore } from './stores/settingsStore';
import { LogOut, ChevronDown, Keyboard, Check, Settings, Info, Sun, Moon, Monitor } from '@lucide/vue';

const quizStore = useQuizStore();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();

const quizStarted = ref(false);
const showAuthModal = ref(false);
const showLeaderboardModal = ref(false);
const showMasteryGridModal = ref(false);
const showAboutModal = ref(false);
const showBattleground = ref(false);

const showUserDropdown = ref(false);
const userDropdownRef = ref<HTMLElement | null>(null);

const handleDocumentClick = (event: MouseEvent) => {
  if (userDropdownRef.value && !userDropdownRef.value.contains(event.target as Node)) {
    showUserDropdown.value = false;
  }
};

const handleLogout = async () => {
  showUserDropdown.value = false;
  await authStore.logout();
};



const openBattleground = () => {
  showBattleground.value = true;
  localStorage.setItem('active_screen', 'battleground');
  if (!window.location.pathname.includes('/battleground')) {
    history.pushState(null, '', '/battleground');
  }
};

const closeBattleground = () => {
  showBattleground.value = false;
  localStorage.removeItem('active_screen');
  if (window.location.pathname.includes('/battleground') || window.location.search.includes('mode=battleground')) {
    history.pushState(null, '', '/');
  }
};

const checkRouteState = () => {
  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash;
  const savedScreen = localStorage.getItem('active_screen');
  if (
    pathname.includes('/battleground') ||
    searchParams.get('mode') === 'battleground' ||
    hash === '#battleground' ||
    savedScreen === 'battleground'
  ) {
    showBattleground.value = true;
  }
  if (pathname.includes('/about') || searchParams.get('mode') === 'about' || hash === '#about') {
    showAboutModal.value = true;
  }
};

onMounted(async () => {
  window.addEventListener('popstate', checkRouteState);
  document.addEventListener('click', handleDocumentClick);
  checkRouteState();
  settingsStore.applyTheme();
  await authStore.checkSession();
  quizStore.startQuiz(1);
});

onUnmounted(() => {
  window.removeEventListener('popstate', checkRouteState);
  document.removeEventListener('click', handleDocumentClick);
});

const startQuiz = () => {
  quizStarted.value = true;
};

const handleStartWeakQuiz = async ({ type }: { type: string }) => {
  showMasteryGridModal.value = false;
  await quizStore.startWeakItemsQuiz(1, type);
  quizStarted.value = true;
};

const goToHome = () => {
  quizStarted.value = false;
  quizStore.quizCompleted = false;
  closeBattleground();
};
</script>

<template>
  <div class="h-full w-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col overflow-hidden select-none text-slate-900 dark:text-slate-100 transition-colors duration-200">
    <!-- Top Global App Bar (Hidden when Battleground is active) -->
    <header v-if="!showBattleground" class="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-xs flex-shrink-0 z-20">
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 cursor-pointer" @click="goToHome">
          <span class="text-xl">🇯🇵</span>
          <span class="font-extrabold text-gray-900 dark:text-slate-100 tracking-tight text-sm sm:text-base">Nihongo Master</span>
        </div>
        <button 
            @click="showAboutModal = true"
            class="px-2.5 py-1.5 bg-gray-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200/80 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-300 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Tentang Aplikasi"
          >
          <Info class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        </button>
      </div>

      <div class="flex items-center gap-2">
        <template v-if="authStore.user">
          <div class="relative" ref="userDropdownRef">
            <button 
              @click.stop="showUserDropdown = !showUserDropdown"
              class="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/70 border border-indigo-100 dark:border-indigo-800/80 px-3 py-1.5 rounded-xl cursor-pointer transition select-none shadow-xs"
            >
              <div class="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xs">
                {{ (authStore.displayUsername || 'U').charAt(0).toUpperCase() }}
              </div>
              <span class="text-xs font-bold text-indigo-900 dark:text-indigo-200 truncate max-w-[100px] sm:max-w-[120px]">
                {{ authStore.displayUsername }}
              </span>
              <ChevronDown class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 transition-transform duration-200" :class="{ 'rotate-180': showUserDropdown }" />
            </button>

            <!-- Dropdown Menu -->
            <div 
              v-if="showUserDropdown"
              class="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 py-2.5 px-3 z-50 animate-fadeIn text-gray-800 dark:text-slate-200"
            >
              <!-- User Summary Header -->
              <div class="px-2 pb-2.5 mb-2 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs flex-shrink-0">
                  {{ (authStore.displayUsername || 'U').charAt(0).toUpperCase() }}
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-extrabold text-gray-900 dark:text-slate-100 truncate">
                    {{ authStore.displayUsername }}
                  </span>
                  <span class="text-[11px] font-medium text-gray-400 dark:text-slate-500 truncate">
                    {{ authStore.user?.email || 'Akun Pengguna' }}
                  </span>
                </div>
              </div>

              <!-- Settings Section: Theme Mode -->
              <div class="px-2 py-1.5">
                <div class="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-300 mb-2">
                  <Moon class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Tema Tampilan</span>
                </div>

                <div class="grid grid-cols-3 gap-1 bg-gray-50 dark:bg-slate-800/80 p-1 rounded-xl border border-gray-100 dark:border-slate-700/60">
                  <button
                    @click="settingsStore.setThemeMode('auto')"
                    class="px-2 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    :class="settingsStore.themeMode === 'auto' 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs border border-indigo-100 dark:border-indigo-500/30 font-extrabold' 
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
                    title="Otomatis Ikuti Perangkat"
                  >
                    <Monitor class="w-3 h-3 flex-shrink-0" />
                    <span>Auto</span>
                  </button>
                  <button
                    @click="settingsStore.setThemeMode('dark')"
                    class="px-2 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    :class="settingsStore.themeMode === 'dark' 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs border border-indigo-100 dark:border-indigo-500/30 font-extrabold' 
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
                    title="Mode Gelap"
                  >
                    <Moon class="w-3 h-3 flex-shrink-0" />
                    <span>Dark</span>
                  </button>
                  <button
                    @click="settingsStore.setThemeMode('light')"
                    class="px-2 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    :class="settingsStore.themeMode === 'light' 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs border border-indigo-100 dark:border-indigo-500/30 font-extrabold' 
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
                    title="Mode Terang"
                  >
                    <Sun class="w-3 h-3 flex-shrink-0" />
                    <span>Light</span>
                  </button>
                </div>
              </div>

              <!-- Settings Section: Keyboard Height -->
              <div class="px-2 py-1.5">
                <div class="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-300 mb-2">
                  <Keyboard class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Ketinggian Keyboard</span>
                </div>

                <div class="grid grid-cols-2 gap-1.5 bg-gray-50 dark:bg-slate-800/80 p-1 rounded-xl border border-gray-100 dark:border-slate-700/60">
                  <button
                    @click="settingsStore.setKeyboardHeight('short')"
                    class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    :class="settingsStore.keyboardHeight === 'short' 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs border border-indigo-100 dark:border-indigo-500/30 font-extrabold' 
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
                  >
                    <Check v-if="settingsStore.keyboardHeight === 'short'" class="w-3 h-3 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span>Default</span>
                  </button>
                  <button
                    @click="settingsStore.setKeyboardHeight('tall')"
                    class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    :class="settingsStore.keyboardHeight === 'tall' 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs border border-indigo-100 dark:border-indigo-500/30 font-extrabold' 
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
                  >
                    <Check v-if="settingsStore.keyboardHeight === 'tall'" class="w-3 h-3 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span>Tinggi</span>
                  </button>
                </div>
              </div>

              <!-- Divider -->
              <div class="my-1.5 border-t border-gray-100 dark:border-slate-800"></div>

              <!-- Logout Button -->
              <button 
                @click="handleLogout"
                class="w-full px-2.5 py-2 text-left text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition flex items-center gap-2 cursor-pointer"
              >
                <LogOut class="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="relative" ref="userDropdownRef">
            <button 
              @click.stop="showUserDropdown = !showUserDropdown"
              class="p-2 text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition border border-gray-200 dark:border-slate-700 cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="Pengaturan"
            >
              <Settings class="w-4 h-4 text-gray-500 dark:text-slate-400" />
              <ChevronDown class="w-3 h-3 text-gray-400 dark:text-slate-500 transition-transform duration-200" :class="{ 'rotate-180': showUserDropdown }" />
            </button>

            <!-- Dropdown Menu for Guest -->
            <div 
              v-if="showUserDropdown"
              class="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 py-2.5 px-3 z-50 animate-fadeIn text-gray-800 dark:text-slate-200"
            >
              <!-- Settings Section: Theme Mode -->
              <div class="px-2 py-1.5">
                <div class="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-300 mb-2">
                  <Moon class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Tema Tampilan</span>
                </div>

                <div class="grid grid-cols-3 gap-1 bg-gray-50 dark:bg-slate-800/80 p-1 rounded-xl border border-gray-100 dark:border-slate-700/60">
                  <button
                    @click="settingsStore.setThemeMode('auto')"
                    class="px-2 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    :class="settingsStore.themeMode === 'auto' 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs border border-indigo-100 dark:border-indigo-500/30 font-extrabold' 
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
                    title="Otomatis Ikuti Perangkat"
                  >
                    <Monitor class="w-3 h-3 flex-shrink-0" />
                    <span>Auto</span>
                  </button>
                  <button
                    @click="settingsStore.setThemeMode('dark')"
                    class="px-2 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    :class="settingsStore.themeMode === 'dark' 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs border border-indigo-100 dark:border-indigo-500/30 font-extrabold' 
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
                    title="Mode Gelap"
                  >
                    <Moon class="w-3 h-3 flex-shrink-0" />
                    <span>Dark</span>
                  </button>
                  <button
                    @click="settingsStore.setThemeMode('light')"
                    class="px-2 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    :class="settingsStore.themeMode === 'light' 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs border border-indigo-100 dark:border-indigo-500/30 font-extrabold' 
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
                    title="Mode Terang"
                  >
                    <Sun class="w-3 h-3 flex-shrink-0" />
                    <span>Light</span>
                  </button>
                </div>
              </div>

              <!-- Settings Section: Keyboard Height -->
              <div class="px-2 py-1.5">
                <div class="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-300 mb-2">
                  <Keyboard class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Ketinggian Keyboard</span>
                </div>

                <div class="grid grid-cols-2 gap-1.5 bg-gray-50 dark:bg-slate-800/80 p-1 rounded-xl border border-gray-100 dark:border-slate-700/60">
                  <button
                    @click="settingsStore.setKeyboardHeight('short')"
                    class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    :class="settingsStore.keyboardHeight === 'short' 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs border border-indigo-100 dark:border-indigo-500/30 font-extrabold' 
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
                  >
                    <Check v-if="settingsStore.keyboardHeight === 'short'" class="w-3 h-3 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span>Default</span>
                  </button>
                  <button
                    @click="settingsStore.setKeyboardHeight('tall')"
                    class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    :class="settingsStore.keyboardHeight === 'tall' 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs border border-indigo-100 dark:border-indigo-500/30 font-extrabold' 
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
                  >
                    <Check v-if="settingsStore.keyboardHeight === 'tall'" class="w-3 h-3 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span>Tall</span>
                  </button>
                </div>
              </div>

              <!-- Divider -->
              <div class="my-1.5 border-t border-gray-100 dark:border-slate-800"></div>

              <!-- Login CTA inside dropdown -->
              <button 
                @click="showAuthModal = true; showUserDropdown = false;"
                class="w-full px-2.5 py-2 text-center text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-xs cursor-pointer"
              >
                Masuk / Daftar
              </button>
            </div>
          </div>

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
    <AboutModal
      :is-open="showAboutModal"
      @close="showAboutModal = false"
    />
    <LevelUpModal />
    <SyncConflictModal
      :is-open="authStore.showSyncConflictModal"
      :local-count="authStore.pendingLocalCount"
      :server-count="authStore.pendingServerCount"
      :loading="authStore.syncConflictLoading"
      @resolve="authStore.resolveSyncConflict"
    />

    <!-- Modals & Overlays -->
    <PreviewCardModal v-if="quizStarted" />
    <GoalCelebrationToast />

    <!-- Main Screens -->
    <BattlegroundMode
      v-if="showBattleground"
      class="flex-1 w-full h-full z-30"
      @exit="closeBattleground"
    />
    <StartScreen 
      v-else-if="!quizStarted" 
      @start="startQuiz" 
      @open-mastery-grid="showMasteryGridModal = true" 
      @open-leaderboard="showLeaderboardModal = true"
      @open-about="showAboutModal = true"
      @open-battleground="openBattleground" 
    />
    <div v-else class="max-w-2xl w-full mx-auto p-2 sm:p-4 flex flex-col min-h-full overflow-y-auto relative pb-48 sm:pb-24">
      <QuizHeader v-if="!quizStore.quizCompleted" class="flex-shrink-0" />
      
      <main class="bg-white dark:bg-slate-900 rounded-2xl shadow-md p-3 sm:p-6 flex flex-col items-center justify-center w-full border border-gray-100 dark:border-slate-800 mb-2 sm:mb-4 flex-shrink-0 min-h-[180px] sm:min-h-[300px]" v-if="!quizStore.quizCompleted">
        <div v-if="quizStore.isLoading" class="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-slate-400">
          <div class="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <span class="text-sm font-bold text-gray-600 dark:text-slate-300">Memuat Soal Kuis...</span>
        </div>
        <template v-else>
          <QuizSentenceTyping v-if="quizStore.questionType === 'sentences'" />
          <template v-else>
            <QuizQuestion class="flex-shrink-0" />
            <div class="w-full flex flex-col justify-start items-center py-1 sm:py-2">
              <QuizWordInput v-if="quizStore.isTypingMode" />
              <QuizOptions v-else />
            </div>
          </template>
        </template>
      </main>
      
      <QuizResults v-else class="flex-1 overflow-hidden" @home="goToHome" @leaderboard="showLeaderboardModal = true" />
      <QuizBottomNav :quiz-started="quizStarted" />
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes scaleUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
.animate-scaleUp { animation: scaleUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
</style>
