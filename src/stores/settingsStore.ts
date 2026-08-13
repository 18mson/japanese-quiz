import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';

export type KeyboardHeight = 'short' | 'tall';
export type ThemeMode = 'auto' | 'dark' | 'light';

export const useSettingsStore = defineStore('settings', () => {
  const getInitialHeight = (): KeyboardHeight => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('keyboard_height');
      if (saved === 'tall' || saved === 'short') {
        return saved;
      }
    }
    return 'short';
  };

  const getInitialTheme = (): ThemeMode => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('theme_mode') as ThemeMode | null;
      if (saved === 'auto' || saved === 'dark' || saved === 'light') {
        return saved;
      }
    }
    return 'dark';
  };

  const keyboardHeight = ref<KeyboardHeight>(getInitialHeight());
  const themeMode = ref<ThemeMode>(getInitialTheme());

  const systemPrefersDark = ref(
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true
  );

  const isDarkMode = computed(() => {
    if (themeMode.value === 'dark') return true;
    if (themeMode.value === 'light') return false;
    return systemPrefersDark.value;
  });

  const applyTheme = () => {
    if (typeof document !== 'undefined') {
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // Setup system listener if matchMedia available
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      systemPrefersDark.value = e.matches;
      applyTheme();
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
    } else if ('addListener' in mediaQuery) {
      (mediaQuery as any).addListener(handleSystemChange);
    }
  }

  const setKeyboardHeight = (height: KeyboardHeight) => {
    keyboardHeight.value = height;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('keyboard_height', height);
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme_mode', mode);
    }
    applyTheme();
  };

  // Watch isDarkMode to update DOM whenever it changes
  watch(isDarkMode, () => {
    applyTheme();
  }, { immediate: true });

  return {
    keyboardHeight,
    setKeyboardHeight,
    themeMode,
    isDarkMode,
    setThemeMode,
    applyTheme,
  };
});
