import { ref } from 'vue';
import { useSettingsStore } from '../stores/settingsStore';

export interface SpeakOptions {
  rate?: number; // 0.1 - 10, default from settingsStore or 0.9
  pitch?: number; // default 1
}

let activeUtterance: SpeechSynthesisUtterance | null = null;
let fallbackAudio: HTMLAudioElement | null = null;
let speechStartTimeout: any = null;

// Module-scoped shared reactive states (singleton pattern to avoid duplicate listeners)
const isSpeaking = ref<boolean>(false);
const currentSpeakingText = ref<string>('');
const isSupported = ref<boolean>(true); // Always true because of HTML5 audio fallback
const hasJapaneseVoice = ref<boolean>(false);
const selectedVoice = ref<SpeechSynthesisVoice | null>(null);
const isInitialized = ref<boolean>(false);

/**
 * Detect available voices in browser.
 * Handles race condition where voices load asynchronously via onvoiceschanged.
 */
function detectVoices(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    hasJapaneseVoice.value = false;
    return;
  }

  const voices = window.speechSynthesis.getVoices();

  if (voices && voices.length > 0) {
    // Find Japanese voices
    const jaVoices = voices.filter(
      v => v.lang === 'ja-JP' || v.lang === 'ja_JP' || v.lang.toLowerCase().startsWith('ja') || v.lang.toLowerCase().includes('ja')
    );

    hasJapaneseVoice.value = jaVoices.length > 0;

    if (jaVoices.length > 0) {
      // Voice Priority for macOS / Chrome / Safari stability:
      // 1. Google 日本語 (Built-in Chromium cloud voice, works flawlessly on Chrome macOS without OS voice pack)
      const googleJaVoice = jaVoices.find(v => v.name.toLowerCase().includes('google'));
      // 2. Default system voice explicitly for ja-JP
      const defaultJaVoice = jaVoices.find(v => v.default && (v.lang === 'ja-JP' || v.lang === 'ja_JP'));
      // 3. Local service Japanese voice (non-Siri to avoid macOS permission/download roadblocks)
      const localJaVoice = jaVoices.find(v => v.localService && !v.name.toLowerCase().includes('siri'));
      // 4. Kyoko / Otoya if installed
      const namedJaVoice = jaVoices.find(v => (v.name.toLowerCase().includes('kyoko') || v.name.toLowerCase().includes('otoya')) && !v.name.toLowerCase().includes('siri'));
      // 5. Any exact ja-JP
      const exactJaVoice = jaVoices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP');

      selectedVoice.value = googleJaVoice || defaultJaVoice || localJaVoice || namedJaVoice || exactJaVoice || jaVoices[0];
    } else {
      selectedVoice.value = null;
    }
  } else {
    hasJapaneseVoice.value = false;
  }
}

/**
 * Fallback to crystal-clear Google Translate Japanese TTS audio via HTML5 Audio
 * Works 100% on all macOS versions (Safari, Chrome, Arc, Firefox) even when system TTS voice is missing
 */
function playFallbackAudio(text: string): void {
  if (typeof window === 'undefined') return;

  if (fallbackAudio) {
    fallbackAudio.pause();
    fallbackAudio.removeAttribute('src');
    fallbackAudio = null;
  }

  try {
    const encodedText = encodeURIComponent(text);
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=tw-ob&q=${encodedText}`;
    const audio = new Audio(audioUrl);
    fallbackAudio = audio;

    isSpeaking.value = true;
    currentSpeakingText.value = text;

    audio.onended = () => {
      if (fallbackAudio === audio) {
        fallbackAudio = null;
      }
      isSpeaking.value = false;
      currentSpeakingText.value = '';
    };

    audio.onerror = () => {
      if (fallbackAudio === audio) {
        fallbackAudio = null;
      }
      isSpeaking.value = false;
      currentSpeakingText.value = '';
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('TTS Fallback audio play prevented:', err);
        isSpeaking.value = false;
        currentSpeakingText.value = '';
      });
    }
  } catch (err) {
    console.warn('Fallback audio creation error:', err);
    isSpeaking.value = false;
    currentSpeakingText.value = '';
  }
}

/**
 * Initialize Web Speech API listeners once
 */
function initSpeechSynthesis(): void {
  if (isInitialized.value || typeof window === 'undefined') return;
  isInitialized.value = true;

  if ('speechSynthesis' in window) {
    detectVoices();

    if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        detectVoices();
      };
    }

    setTimeout(detectVoices, 250);
    setTimeout(detectVoices, 1000);
    setTimeout(detectVoices, 2500);
  }
}

// Auto-run initialization
initSpeechSynthesis();

export function useTextToSpeech() {
  if (!isInitialized.value) {
    initSpeechSynthesis();
  }

  function stop(): void {
    if (speechStartTimeout) {
      clearTimeout(speechStartTimeout);
      speechStartTimeout = null;
    }

    if (fallbackAudio) {
      fallbackAudio.pause();
      fallbackAudio.removeAttribute('src');
      fallbackAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    activeUtterance = null;
    isSpeaking.value = false;
    currentSpeakingText.value = '';
  }

  function speak(text: string, options?: SpeakOptions): void {
    if (!text || typeof window === 'undefined') return;

    // Refresh voices detection in case voices were loaded late
    if ('speechSynthesis' in window && !hasJapaneseVoice.value) {
      detectVoices();
    }

    // Stop ongoing speech first
    stop();

    // If browser doesn't have Web Speech API or has no Japanese voices on macOS,
    // immediately use the high-quality Japanese audio stream
    if (!('speechSynthesis' in window) || !hasJapaneseVoice.value) {
      playFallbackAudio(text);
      return;
    }

    try {
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

      activeUtterance = utterance;
      let hasStarted = false;

      utterance.onstart = () => {
        hasStarted = true;
        if (speechStartTimeout) {
          clearTimeout(speechStartTimeout);
          speechStartTimeout = null;
        }
      };

      utterance.onend = () => {
        if (speechStartTimeout) {
          clearTimeout(speechStartTimeout);
          speechStartTimeout = null;
        }
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
        isSpeaking.value = false;
        currentSpeakingText.value = '';
      };

      utterance.onerror = (e) => {
        if (speechStartTimeout) {
          clearTimeout(speechStartTimeout);
          speechStartTimeout = null;
        }
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }

        // If Web Speech fails on macOS (e.g., missing offline voice pack or blocked),
        // fallback to HTML5 Japanese audio immediately
        if ((e as any).error !== 'canceled' && (e as any).error !== 'interrupted') {
          console.warn('SpeechSynthesis error on macOS, switching to audio stream:', (e as any).error);
          playFallbackAudio(text);
        } else {
          isSpeaking.value = false;
          currentSpeakingText.value = '';
        }
      };

      // Watchdog timer: If macOS SpeechSynthesis hangs without firing onstart within 350ms,
      // fallback seamlessly to audio stream
      speechStartTimeout = setTimeout(() => {
        speechStartTimeout = null;
        if (!hasStarted && isSpeaking.value && currentSpeakingText.value === text) {
          console.warn('SpeechSynthesis hung on macOS, activating audio fallback');
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          activeUtterance = null;
          playFallbackAudio(text);
        }
      }, 350);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis invocation failed, fallback to audio stream:', err);
      playFallbackAudio(text);
    }
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
