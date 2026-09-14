// src/composables/battleground/useBattlegroundPowerUps.ts
import { ref, watch, onUnmounted, type Ref } from 'vue';
import { useBattlegroundStore } from '../../stores/battlegroundStore';
import { playFreezeSound, playLightningStrike } from '../../utils/battleSoundManager';
import type { Unit } from './useSentenceUnits';

export interface PowerUpOptions {
  units: Ref<Unit[]>;
  currentSentenceIndex: Ref<number>;
  onRewind?: () => void;
  onFreezeEnd?: () => void;
}

export function useBattlegroundPowerUps(options: PowerUpOptions) {
  const store = useBattlegroundStore();
  const { units, currentSentenceIndex, onRewind, onFreezeEnd } = options;

  // Power-Up Unit Position & Type on the sentence
  const powerUpUnitIndex = ref(0);
  const powerUpType = ref<'freeze' | 'backward' | 'storm'>('freeze');
  const failedPowerUpUnits = ref<Set<number>>(new Set());
  const claimedPowerUpUnits = ref<Set<number>>(new Set());

  // Victim Effects State
  const isFrozen = ref(false);
  const freezeCountdown = ref(3.0);
  let freezeTimer: ReturnType<typeof setInterval> | null = null;

  const isStormActive = ref(false);
  const stormCountdown = ref(5.0);
  const lightningFlashActive = ref(false);
  let stormTimer: ReturnType<typeof setInterval> | null = null;
  let lightningInterval: ReturnType<typeof setInterval> | null = null;

  const isRewindingGlitch = ref(false);
  const victimPowerUpAttacker = ref('');

  function initSentencePowerUp() {
    failedPowerUpUnits.value.clear();
    claimedPowerUpUnits.value.clear();
    const unitCount = units.value.length;
    if (unitCount > 0) {
      powerUpUnitIndex.value = Math.floor(Math.random() * unitCount);
      const types: Array<'freeze' | 'backward' | 'storm'> = ['freeze', 'backward', 'storm'];
      powerUpType.value = types[Math.floor(Math.random() * types.length)];
    }
  }

  function clearTimers() {
    if (freezeTimer) {
      clearInterval(freezeTimer);
      freezeTimer = null;
    }
    if (stormTimer) {
      clearInterval(stormTimer);
      stormTimer = null;
    }
    if (lightningInterval) {
      clearInterval(lightningInterval);
      lightningInterval = null;
    }
  }

  function resetState() {
    clearTimers();
    isFrozen.value = false;
    isStormActive.value = false;
    lightningFlashActive.value = false;
    isRewindingGlitch.value = false;
  }

  function applyVictimPowerUp(type: 'freeze' | 'backward' | 'storm', senderName: string) {
    victimPowerUpAttacker.value = senderName;

    if (type === 'freeze') {
      playFreezeSound();
      isFrozen.value = true;
      freezeCountdown.value = 3.0;
      if (freezeTimer) clearInterval(freezeTimer);
      freezeTimer = setInterval(() => {
        freezeCountdown.value = Math.max(0, +(freezeCountdown.value - 0.1).toFixed(1));
        if (freezeCountdown.value <= 0) {
          if (freezeTimer) clearInterval(freezeTimer);
          freezeTimer = null;
          isFrozen.value = false;
          onFreezeEnd?.();
        }
      }, 100);
    } else if (type === 'backward') {
      playLightningStrike();
      isRewindingGlitch.value = true;
      setTimeout(() => (isRewindingGlitch.value = false), 1000);
      onRewind?.();
    } else if (type === 'storm') {
      playLightningStrike();
      isStormActive.value = true;
      stormCountdown.value = 5.0;
      if (stormTimer) clearInterval(stormTimer);
      if (lightningInterval) clearInterval(lightningInterval);

      stormTimer = setInterval(() => {
        stormCountdown.value = Math.max(0, +(stormCountdown.value - 0.1).toFixed(1));
        if (stormCountdown.value <= 0) {
          if (stormTimer) clearInterval(stormTimer);
          stormTimer = null;
          if (lightningInterval) clearInterval(lightningInterval);
          lightningInterval = null;
          isStormActive.value = false;
          lightningFlashActive.value = false;
        }
      }, 100);

      lightningInterval = setInterval(() => {
        lightningFlashActive.value = true;
        playLightningStrike();
        setTimeout(() => {
          lightningFlashActive.value = false;
        }, 350);
      }, 1400);
    }
  }

  watch(currentSentenceIndex, () => {
    initSentencePowerUp();
  });

  watch(() => store.latestPowerUpEvent, (evt) => {
    if (!evt) return;
    if (evt.senderId !== store.myPlayerId) {
      applyVictimPowerUp(evt.type, evt.senderName);
    }
  });

  onUnmounted(() => {
    clearTimers();
  });

  return {
    powerUpUnitIndex,
    powerUpType,
    failedPowerUpUnits,
    claimedPowerUpUnits,
    isFrozen,
    freezeCountdown,
    isStormActive,
    stormCountdown,
    lightningFlashActive,
    isRewindingGlitch,
    victimPowerUpAttacker,
    initSentencePowerUp,
    applyVictimPowerUp,
    resetState,
  };
}
