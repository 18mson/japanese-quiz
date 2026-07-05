<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useQuizStore } from './stores/quizStore';
import { useAuthStore } from './stores/authStore';
import QuizHeader from './components/QuizHeader.vue';
import QuizQuestion from './components/QuizQuestion.vue';
import QuizOptions from './components/QuizOptions.vue';
import QuizWordInput from './components/QuizWordInput.vue';
import QuizResults from './components/QuizResults.vue';
import StartScreen from './components/StartScreen.vue';
import AuthModal from './components/AuthModal.vue';
import LeaderboardModal from './components/LeaderboardModal.vue';
import { User, KeyRound, Trophy, LogOut } from '@lucide/vue';

const quizStore = useQuizStore();
const authStore = useAuthStore();
const quizStarted = ref(false);

const showDropdown = ref(false);
const showAuthModal = ref(false);
const showLeaderboardModal = ref(false);

watch(() => quizStore.newRecordAchieved, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      showLeaderboardModal.value = true;
    }, 2000);
  }
});

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
  // Check user auth session
  await authStore.checkSession();
  // Initialize the quiz but don't start it yet
  quizStore.startQuiz(10);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});

const startQuiz = () => {
  quizStarted.value = true;
};

const claimLevelUp = () => {
  quizStore.showLevelUpScreen = false;
  quizStore.quizCompleted = true;
};

const goToHome = () => {
  quizStarted.value = false;
};

const toggleUserMenu = () => {
  if (authStore.user) {
    showDropdown.value = !showDropdown.value;
  } else {
    showAuthModal.value = true;
  }
};

const openLeaderboard = () => {
  showDropdown.value = false;
  showLeaderboardModal.value = true;
};

const handleLogout = async () => {
  showDropdown.value = false;
  await authStore.logout();
};
</script>

<template>
  <div class="h-screen max-h-screen overflow-hidden flex flex-col bg-gray-50 text-gray-800 relative">
    <!-- Top-Right User Menu -->
    <div class="absolute top-4 right-4 z-40">
      <div class="relative">
        <button 
          @click="toggleUserMenu"
          class="w-10 h-10 rounded-full bg-white border border-gray-200/80 shadow-md hover:shadow-lg hover:border-indigo-400 transition-all flex items-center justify-center cursor-pointer select-none"
          title="User Account"
        >
          <User v-if="authStore.user" class="w-5 h-5 text-indigo-600" />
          <KeyRound v-else class="w-5 h-5 text-gray-500" />
        </button>
        
        <!-- Dropdown Menu (only if logged in) -->
        <div 
          v-if="showDropdown && authStore.user"
          class="absolute right-0 mt-2 w-48 bg-white border border-gray-150 rounded-2xl shadow-xl py-2 z-50 animate-slide-down"
        >
          <div class="px-4 py-2 border-b border-gray-100 flex flex-col gap-1">
            <span class="text-xs font-bold text-gray-400 truncate">Hi, {{ authStore.displayUsername }}!</span>
            <div class="flex items-center gap-1.5 mt-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full w-fit">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span class="text-[9px] font-black uppercase tracking-wider">Level {{ quizStore.currentUserLevel }}</span>
            </div>
          </div>
          <button 
            @click="openLeaderboard"
            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition font-semibold cursor-pointer flex items-center gap-2"
          >
            <Trophy class="w-4 h-4 text-amber-500" />
            <span>Leaderboard</span>
          </button>
          <button 
            @click="handleLogout"
            class="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition border-t border-gray-50 font-semibold cursor-pointer flex items-center gap-2"
          >
            <LogOut class="w-4 h-4 text-rose-500" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AuthModal :is-open="showAuthModal" @close="showAuthModal = false" />
    <LeaderboardModal :is-open="showLeaderboardModal" @close="showLeaderboardModal = false" />

    <!-- Level Up Screen Overlay -->
    <div 
      v-if="quizStore.showLevelUpScreen" 
      class="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50 animate-fadeIn"
    >
      <div class="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden animate-scaleUp">
        <!-- Golden particles backdrop -->
        <div class="absolute inset-0 pointer-events-none opacity-30">
          <div class="sparkle s1 text-xl">✨</div>
          <div class="sparkle s2 text-xl">⭐</div>
          <div class="sparkle s3 text-xl">✨</div>
          <div class="sparkle s4 text-xl">⭐</div>
        </div>
        
        <div class="flex flex-col items-center gap-4 relative z-10">
          <!-- Glowing animated trophy -->
          <div class="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-yellow-500/30 animate-pulse">
            <Trophy class="w-10 h-10 text-white drop-shadow-md" />
          </div>
          
          <h2 class="text-3xl font-black bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent uppercase tracking-wider">
            LEVEL UP!
          </h2>
          
          <p class="text-sm text-gray-200 font-medium max-w-xs mx-auto">
            Amazing job! You have fully mastered all Everyday Words in Lesson 1!
          </p>
          
          <div class="flex items-center justify-center gap-6 my-4 w-full bg-white/5 py-4 rounded-2xl border border-white/10">
            <div class="flex flex-col">
              <span class="text-xs text-gray-400 uppercase font-bold">Previous</span>
              <span class="text-2xl font-black text-gray-300">Level 1</span>
            </div>
            <div class="text-xl text-amber-400 animate-pulse">➔</div>
            <div class="flex flex-col">
              <span class="text-xs text-amber-400 uppercase font-bold">Current</span>
              <span class="text-2xl font-black text-amber-300">Level 2</span>
            </div>
          </div>
          
          <p class="text-xs text-teal-300 font-bold mb-2">
            🔓 Unlocked: Minna no Nihongo Lesson 2 Vocabulary
          </p>
          
          <button 
            @click="claimLevelUp"
            class="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition shadow-lg hover:shadow-yellow-500/20 hover:-translate-y-0.5 cursor-pointer"
          >
            Claim & View Results
          </button>
        </div>
      </div>
    </div>

    <StartScreen v-if="!quizStarted" @start="startQuiz" />
    <div v-else class="max-w-2xl w-full mx-auto p-4 flex flex-col h-full overflow-hidden relative" :class="{ 'pb-20': quizStore.isTypingMode || quizStore.selectedAnswer !== null }">
      <QuizHeader class="flex-shrink-0" />
      
      <main class="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center w-full border border-gray-100 flex-1 overflow-hidden mb-4" v-if="!quizStore.quizCompleted">
        <QuizQuestion class="flex-shrink-0" />
        <div class="w-full flex-1 flex flex-col justify-start items-center overflow-y-auto py-2">
          <QuizWordInput v-if="quizStore.isTypingMode" />
          <QuizOptions v-else />
        </div>
      </main>
      
      <QuizResults v-else class="flex-1 overflow-hidden" @home="goToHome" @leaderboard="showLeaderboardModal = true" />
      
      <!-- Fixed/Pinned Bottom Action Navbar (Full Viewport Width) -->
      <div 
        v-if="quizStarted && !quizStore.quizCompleted && (quizStore.isTypingMode || quizStore.selectedAnswer !== null)" 
        class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3.5 px-6 flex justify-center items-center shadow-lg z-30 w-full animate-fadeIn"
      >
        <div class="max-w-md w-full flex justify-center gap-4">
          <!-- Pre-answer actions (Only in typing mode) -->
          <template v-if="quizStore.selectedAnswer === null">
            <template v-if="quizStore.isTypingMode">
              <button 
                class="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-xl transition duration-200 hover:bg-gray-300 cursor-pointer shadow-sm text-sm"
                @click="quizStore.submitAnswer('')"
              >
                Skip
              </button>
              <button 
                class="px-8 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl transition duration-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm flex-1 max-w-[200px]"
                :disabled="quizStore.userInput.trim() === ''"
                @click="quizStore.submitAnswer(quizStore.userInput)"
              >
                Submit
              </button>
            </template>
          </template>
          
          <!-- Post-answer Action (Next / See Results) -->
          <template v-else>
            <button 
              class="w-full sm:w-56 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-2.5 shadow-md hover:shadow-lg transition duration-200 flex justify-center items-center gap-2 cursor-pointer text-sm"
              @click="quizStore.nextQuestion"
            >
              <span>{{ quizStore.currentQuestionIndex < quizStore.questions.length - 1 ? 'Next Question' : 'See Results' }}</span>
              <span class="text-xs bg-indigo-500/50 px-2 py-0.5 rounded border border-indigo-400/30 font-mono">Enter</span>
            </button>
          </template>
        </div>
      </div>

    </div>
  </div>
</template>

<style>
@keyframes slide-down {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-down {
  animation: slide-down 0.2s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.animate-scaleUp {
  animation: scaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes float-sparkle {
  0% { transform: translateY(10px) scale(0.6); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-30px) scale(1.1); opacity: 0; }
}
.sparkle {
  position: absolute;
  font-size: 16px;
  animation: float-sparkle 3s infinite linear;
}
.s1 { top: 15%; left: 10%; animation-delay: 0s; }
.s2 { top: 50%; left: 85%; animation-delay: 0.7s; }
.s3 { top: 75%; left: 20%; animation-delay: 1.4s; }
.s4 { top: 25%; left: 75%; animation-delay: 2.1s; }
</style>
