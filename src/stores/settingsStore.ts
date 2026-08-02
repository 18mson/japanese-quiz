import { ref } from 'vue';
import { defineStore } from 'pinia';

export type KeyboardHeight = 'short' | 'tall';

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

  const keyboardHeight = ref<KeyboardHeight>(getInitialHeight());

  const setKeyboardHeight = (height: KeyboardHeight) => {
    keyboardHeight.value = height;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('keyboard_height', height);
    }
  };

  return {
    keyboardHeight,
    setKeyboardHeight,
  };
});
