import { ref } from 'vue';
import { defineStore } from 'pinia';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const errorMsg = ref<string | null>(null);

  // Helper to extract username for Leaderboard display (returns null if email was used)
  const getDisplayName = (emailOrUsername: string): string | null => {
    if (emailOrUsername.includes('@')) {
      return null;
    }
    return emailOrUsername;
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
    } catch (err: any) {
      console.error('Error fetching session:', err);
    } finally {
      loading.value = false;
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
      
      // Auto login after sign up if user is already returned (e.g. no email confirmation required)
      if (data.user) {
        user.value = data.user;
        
        // Insert into public.users table to maintain public user records
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
    } catch (err: any) {
      console.error('Error signing out:', err);
    } finally {
      loading.value = false;
    }
  };

  // Reactive username getter based on metadata or email
  const displayUsername = ref('');
  
  // Set user value and reactively update displayUsername
  const setUser = (val: User | null) => {
    user.value = val;
    if (val) {
      displayUsername.value = val.user_metadata?.display_name || val.email || 'User';
    } else {
      displayUsername.value = '';
    }
  };

  // Monitor auth state changes
  supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });

  return {
    user,
    loading,
    errorMsg,
    displayUsername,
    checkSession,
    login,
    register,
    logout
  };
});
