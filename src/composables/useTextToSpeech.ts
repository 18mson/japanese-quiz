import { ref } from 'vue';
import { useSettingsStore } from '../stores/settingsStore';

export interface SpeakOptions {
  rate?: number; // 0.1 - 10, default from settingsStore or 0.9
  pitch?: number; // default 1
}

// Module-scoped shared reactive states (singleton pattern to avoid duplicate listeners)
const isSpeaking = ref<boolean>(false);
const currentSpeakingText = ref<string>('');
const isSupported = ref<boolean>(false);
const hasJapaneseVoice = ref<boolean>(false);
const selectedVoice = ref<SpeechSynthesisVoice | null>(null);
const isInitialized = ref<boolean>(false);

/**
 * Detect available voices in browser.
 * Handles race condition where voices load asynchronously via onvoiceschanged.
 */
function detectVoices(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    isSupported.value = false;
    hasJapaneseVoice.value = false;
    return;
  }

  isSupported.value = true;
  const voices = window.speechSynthesis.getVoices();

  if (voices && voices.length > 0) {
    // Find Japanese voices
    const jaVoices = voices.filter(
      v => v.lang === 'ja-JP' || v.lang === 'ja_JP' || v.lang.toLowerCase().startsWith('ja')
    );

    hasJapaneseVoice.value = jaVoices.length > 0;

    if (jaVoices.length > 0) {
      // Prioritize local voice (localService: true) for offline / low-end performance
      const localJaVoice = jaVoices.find(v => v.localService && (v.lang === 'ja-JP' || v.lang === 'ja_JP'));
      const exactJaVoice = jaVoices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP');
      selectedVoice.value = localJaVoice || exactJaVoice || jaVoices[0];
    } else {
      selectedVoice.value = null;
    }
  } else {
    // Some browsers report SpeechSynthesis available but return empty voice array initially
    // We keep isSupported true, but hasJapaneseVoice will be updated when onvoiceschanged fires
    hasJapaneseVoice.value = false;
  }
}

/**
 * Initialize Web Speech API listeners once
 */
function initSpeechSynthesis(): void {
  if (isInitialized.value || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  isInitialized.value = true;

  detectVoices();

  // Listen for voice loading event
  if ('onvoiceschanged' in window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
      detectVoices();
    };
  }

  // Fallback timers for mobile browsers (e.g. Chrome Android) that don't always fire onvoiceschanged reliably
  setTimeout(detectVoices, 400);
  setTimeout(detectVoices, 1200);
  setTimeout(detectVoices, 2500);
}

// Auto-run initialization
initSpeechSynthesis();

export function useTextToSpeech() {
  // Ensure initialization check in component lifecycle
  if (!isInitialized.value) {
    initSpeechSynthesis();
  }

  function stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isSpeaking.value = false;
    currentSpeakingText.value = '';
  }

  function speak(text: string, options?: SpeakOptions): void {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Refresh voices detection in case voices were loaded late
    if (!hasJapaneseVoice.value) {
      detectVoices();
    }

    // MANDATORY: Cancel any ongoing speech to prevent audio overlap on fast clicking
    window.speechSynthesis.cancel();

    // Chrome mobile bug workaround: resume if synthesis was paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const settingsStore = useSettingsStore();
    const rate = options?.rate ?? settingsStore.speechRate ?? 0.9;
    const pitch = options?.pitch ?? 1.0;

    isSpeaking.value = true;
    currentSpeakingText.value = text;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (selectedVoice.value) {
      utterance.voice = selectedVoice.value;
    }

    utterance.onend = () => {
      isSpeaking.value = false;
      currentSpeakingText.value = '';
    };

    utterance.onerror = (e) => {
      // Ignore canceled errors (caused by intentional speechSynthesis.cancel())
      if ((e as any).error !== 'canceled' && (e as any).error !== 'interrupted') {
        console.warn('SpeechSynthesis error:', (e as any).error);
      }
      isSpeaking.value = false;
      currentSpeakingText.value = '';
    };

    window.speechSynthesis.speak(utterance);
  }

  function isCurrentTextSpeaking(text: string): boolean {
    return isSpeaking.value && currentSpeakingText.value === text;
  }

  return {
    isSpeaking,
    currentSpeakingText,
    isSupported,
    hasJapaneseVoice,
    selectedVoice,
    speak,
    stop,
    isCurrentTextSpeaking,
    detectVoices
  };
}
