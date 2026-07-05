<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { AlertCircle, Sparkles } from '@lucide/vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const authStore = useAuthStore();

const isLoginTab = ref(true);
const emailOrUsername = ref('');
const password = ref('');
const registerSuccess = ref(false);

const resetForm = () => {
  emailOrUsername.value = '';
  password.value = '';
  authStore.errorMsg = null;
  registerSuccess.value = false;
};

const handleClose = () => {
  resetForm();
  emit('close');
};

const handleSubmit = async () => {
  if (!emailOrUsername.value || !password.value) {
    authStore.errorMsg = 'Please fill in all fields.';
    return;
  }

  if (isLoginTab.value) {
    const success = await authStore.login(emailOrUsername.value, password.value);
    if (success) {
      handleClose();
    }
  } else {
    const success = await authStore.register(emailOrUsername.value, password.value);
    if (success) {
      registerSuccess.value = true;
      isLoginTab.value = true;
      password.value = ''; // keep username for login
    }
  }
};
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300"
    @click.self="handleClose"
  >
    <div 
      class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 border border-gray-100"
      @keydown.enter="handleSubmit"
    >
      <!-- Header / Tabs -->
      <div class="flex border-b border-gray-100 bg-gray-50/50">
        <button 
          class="flex-1 py-4 text-center text-sm font-bold border-b-2 transition-all cursor-pointer"
          :class="isLoginTab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="isLoginTab = true"
        >
          Sign In
        </button>
        <button 
          class="flex-1 py-4 text-center text-sm font-bold border-b-2 transition-all cursor-pointer"
          :class="!isLoginTab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="isLoginTab = false"
        >
          Create Account
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <div class="text-center mb-6">
          <h3 class="text-xl font-extrabold text-gray-800">
            {{ isLoginTab ? 'Welcome Back!' : 'Join the Japanese Quiz' }}
          </h3>
          <p class="text-xs text-gray-500 mt-1">
            {{ isLoginTab ? 'Sign in to sync your score and view the leaderboard.' : 'Create an account to track your mastery progress.' }}
          </p>
        </div>

        <!-- Feedback Messages -->
        <div 
          v-if="authStore.errorMsg" 
          class="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2 animate-shake"
        >
          <AlertCircle class="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{{ authStore.errorMsg }}</span>
        </div>

        <div 
          v-if="registerSuccess" 
          class="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-2"
        >
          <Sparkles class="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Registration successful! Please Sign In.</span>
        </div>

        <!-- Form Fields -->
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Username or Email
            </label>
            <input 
              v-model="emailOrUsername" 
              type="text" 
              placeholder="e.g. joshua or josh@email.com"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-800"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input 
              v-model="password" 
              type="password" 
              placeholder="••••••••"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-800"
            />
          </div>

          <button 
            @click="handleSubmit" 
            :disabled="authStore.loading"
            class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-indigo-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
          >
            <span v-if="authStore.loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>{{ isLoginTab ? 'Sign In' : 'Register' }}</span>
          </button>
        </div>
      </div>

      <!-- Footer Close Option -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button 
          @click="handleClose"
          class="px-4 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.2s ease-in-out 2;
}
</style>
