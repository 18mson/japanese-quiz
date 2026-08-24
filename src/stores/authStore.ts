import { ref } from 'vue';
import { defineStore } from 'pinia';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { useQuizStore } from './quizStore';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const errorMsg = ref<string | null>(null);

  // Sync Conflict State
  const showSyncConflictModal = ref(false);
  const syncConflictLoading = ref(false);
  const pendingLocalCount = ref(0);
  const pendingServerCount = ref(0);
  const pendingServerStreaks = ref<Record<string, number>>({});
  const pendingUserId = ref<string>('');

  // Helper to extract username for Leaderboard display (strips domain if email was used)
  const getDisplayName = (emailOrUsername: string): string => {
    const clean = emailOrUsername.trim();
    if (clean.includes('@')) {
      return clean.split('@')[0];
    }
    return clean;
  };

  // Helper to format email address for Supabase auth using valid MX domain (gmail.com)
  const getEmailAddress = (emailOrUsername: string): string => {
    const clean = emailOrUsername.trim();
    if (clean.includes('@')) {
      return clean;
    }
    return `${clean.toLowerCase()}.quiz@gmail.com`;
  };

  const checkSession = async () => {
    loading.value = true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      user.value = session?.user ?? null;
      if (user.value) {
        const quizStore = useQuizStore();
        await quizStore.loadStreaksFromStorage();
      }
    } catch (err: any) {
      console.error('Error fetching session:', err);
    } finally {
      loading.value = false;
    }
  };

  const checkAndHandleStreakSyncOnLogin = async (userId: string) => {
    const quizStore = useQuizStore();
    try {
      const serverStreaks = await quizStore.fetchServerStreaks(userId);
      const localStreaks = quizStore.getLocalStreaks();

      const localCount = Object.values(localStreaks).filter((s: any) => Number(s) > 0).length;
      const serverCount = Object.values(serverStreaks).filter((s: any) => Number(s) > 0).length;

      if (localCount > 0 && serverCount > 0) {
        const isDifferent = Object.keys(localStreaks).some(k => localStreaks[k] !== serverStreaks[k]) ||
          Object.keys(serverStreaks).some(k => serverStreaks[k] !== localStreaks[k]);

        if (isDifferent) {
          pendingLocalCount.value = localCount;
          pendingServerCount.value = serverCount;
          pendingServerStreaks.value = serverStreaks;
          pendingUserId.value = userId;
          showSyncConflictModal.value = true;
          return;
        }
      }

      if (serverCount > 0 && localCount === 0) {
        quizStore.applyServerStreaks(serverStreaks);
      } else if (localCount > 0 && serverCount === 0) {
        await quizStore.syncLocalToServer(userId);
      } else if (serverCount > 0) {
        quizStore.applyServerStreaks(serverStreaks);
      }
    } catch (err) {
      console.error('Error during streak sync check:', err);
    }
  };

  const resolveSyncConflict = async (keepServer: boolean) => {
    syncConflictLoading.value = true;
    const quizStore = useQuizStore();
    try {
      if (keepServer) {
        // User selected YES: Server data overwrites local data
        quizStore.applyServerStreaks(pendingServerStreaks.value);
      } else {
        // User selected NO: Local data overwrites server data
        await quizStore.syncLocalToServer(pendingUserId.value);
      }
    } catch (e) {
      console.error('Failed to resolve sync conflict:', e);
    } finally {
      syncConflictLoading.value = false;
      showSyncConflictModal.value = false;
      pendingServerStreaks.value = {};
      pendingUserId.value = '';
    }
  };

  const login = async (emailOrUsername: string, password: string) => {
    loading.value = true;
    errorMsg.value = null;
    const email = getEmailAddress(emailOrUsername);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      user.value = data.user;

      if (data.user) {
        await checkAndHandleStreakSyncOnLogin(data.user.id);
      }

      return true;
    } catch (err: any) {
      errorMsg.value = err.message || 'Login failed';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const register = async (emailOrUsername: string, password: string) => {
    loading.value = true;
    errorMsg.value = null;
    const email = getEmailAddress(emailOrUsername);
    const displayName = getDisplayName(emailOrUsername);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName ?? undefined
          }
        }
      });

      if (error) throw error;
      
      if (data.user) {
        user.value = data.user;
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            username: displayName || null,
            email: email
          });
          
        if (insertError) {
          console.error('Failed to create public user record:', insertError);
        }

        // Automatically sync local data to server on registration
        const quizStore = useQuizStore();
        await quizStore.syncLocalToServer(data.user.id);
      }
      return true;
    } catch (err: any) {
      errorMsg.value = err.message || 'Registration failed';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    loading.value = true;
    try {
      await supabase.auth.signOut();
      user.value = null;
      const quizStore = useQuizStore();
      quizStore.userStreaks = quizStore.getLocalStreaks();
    } catch (err: any) {
      console.error('Error signing out:', err);
    } finally {
      loading.value = false;
    }
  };

  const displayUsername = ref('');
  
  const setUser = (val: User | null) => {
    user.value = val;
    if (val) {
      const raw = val.user_metadata?.display_name || val.email || 'User';
      displayUsername.value = raw.includes('@') ? raw.split('@')[0] : raw;
    } else {
      displayUsername.value = '';
    }
  };

  supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });

  return {
    user,
    loading,
    errorMsg,
    displayUsername,
    showSyncConflictModal,
    syncConflictLoading,
    pendingLocalCount,
    pendingServerCount,
    checkSession,
    login,
    register,
    logout,
    resolveSyncConflict
  };
});
