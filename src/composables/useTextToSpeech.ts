import { ref } from 'vue';
import { useSettingsStore } from '../stores/settingsStore';

export interface SpeakOptions {
  rate?: number; // 0.1 - 10, default from settingsStore or 0.9
  pitch?: number; // default 1
}

let activeUtterance: SpeechSynthesisUtterance | null = null;
let pendingSpeakTimer: any = null;

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
      v => v.lang === 'ja-JP' || v.lang === 'ja_JP' || v.lang.toLowerCase().startsWith('ja') || v.lang.toLowerCase().includes('ja')
    );

    hasJapaneseVoice.value = jaVoices.length > 0;

    if (jaVoices.length > 0) {
      // Prioritize non-Siri local Japanese voices (e.g. Kyoko, Hattori, or localService) for macOS/Chrome stability
      const kyokoVoice = jaVoices.find(v => v.name.toLowerCase().includes('kyoko'));
      const localJaVoice = jaVoices.find(v => v.localService && !v.name.toLowerCase().includes('siri'));
      const exactJaVoice = jaVoices.find(v => (v.lang === 'ja-JP' || v.lang === 'ja_JP') && !v.name.toLowerCase().includes('siri'));
      selectedVoice.value = kyokoVoice || localJaVoice || exactJaVoice || jaVoices[0];
    } else {
      selectedVoice.value = null;
    }
  } else {
    // Some browsers report SpeechSynthesis available but return empty voice array initially
    // We keep isSupported true, and fallback to default ja-JP speech synthesis
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

  // Fallback timers for browsers that don't always fire onvoiceschanged reliably
  setTimeout(detectVoices, 300);
  setTimeout(detectVoices, 1000);
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
    if (pendingSpeakTimer) {
      clearTimeout(pendingSpeakTimer);
      pendingSpeakTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    activeUtterance = null;
    isSpeaking.value = false;
    currentSpeakingText.value = '';
  }

  function speak(text: string, options?: SpeakOptions): void {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Refresh voices detection in case voices were loaded late
    if (!hasJapaneseVoice.value) {
      detectVoices();
    }

    if (pendingSpeakTimer) {
      clearTimeout(pendingSpeakTimer);
      pendingSpeakTimer = null;
    }

    // MANDATORY: Cancel any ongoing speech to prevent audio overlap
    window.speechSynthesis.cancel();

    // Critical for macOS Safari & Chrome:
    // Calling window.speechSynthesis.cancel() followed immediately by speak() in the same tick
    // causes the new utterance to be canceled immediately by the native audio engine queue.
    // Delaying speak() by 40ms completely prevents this race condition.
    pendingSpeakTimer = setTimeout(() => {
      pendingSpeakTimer = null;

      // Chrome/Safari bug workaround: resume if synthesis was paused
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

      // Retain strong reference to utterance to prevent garbage collection on macOS WebKit/V8
      activeUtterance = utterance;

      utterance.onend = () => {
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
        isSpeaking.value = false;
        currentSpeakingText.value = '';
      };

      utterance.onerror = (e) => {
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
        // Ignore canceled errors (caused by intentional speechSynthesis.cancel())
        if ((e as any).error !== 'canceled' && (e as any).error !== 'interrupted') {
          console.warn('SpeechSynthesis error:', (e as any).error);
        }
        isSpeaking.value = false;
        currentSpeakingText.value = '';
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis speak failed:', err);
        isSpeaking.value = false;
        currentSpeakingText.value = '';
        activeUtterance = null;
      }
    }, 40);
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
