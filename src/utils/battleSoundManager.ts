// src/utils/battleSoundManager.ts
// Native Web Audio API sound generator for Battle Mode (0 external assets, zero latency).

let audioCtx: AudioContext | null = null;
let bgmOscillatorGroup: { stop: () => void } | null = null;
let isMutedState = localStorage.getItem('battleground_sound_muted') === 'true';

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isMuted(): boolean {
  return isMutedState;
}

export function toggleMute(): boolean {
  isMutedState = !isMutedState;
  localStorage.setItem('battleground_sound_muted', isMutedState ? 'true' : 'false');
  if (isMutedState) {
    stopRoundBgm();
  }
  return isMutedState;
}

// ── SFX 1: Countdown Beep (3, 2, 1 -> 800Hz, GO! -> 1200Hz) ───────────
export function playCountdownBeep(isFinal: boolean = false) {
  if (isMutedState) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isFinal ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isFinal ? 1200 : 800, ctx.currentTime);

    gain.gain.setValueAtTime(isFinal ? 0.35 : 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isFinal ? 0.35 : 0.15));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + (isFinal ? 0.35 : 0.15));
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

// ── SFX 2: Power-Up Pickup / Activation (Ascending Arpeggio) ─────────────
export function playPowerUpGain() {
  if (isMutedState) return;
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.05);
      osc.stop(ctx.currentTime + idx * 0.05 + 0.12);
    });
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

// ── SFX 3: Lightning Strike / Storm Hit (Thunder Crash Synth) ─────────────
export function playLightningStrike() {
  if (isMutedState) return;
  try {
    const ctx = getAudioContext();

    // Noise buffer for thunder crackle
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    // Filter for low thunder rumble
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.35);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    // Electric pitch sweep zap
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);

    oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    whiteNoise.start();
    whiteNoise.stop(ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

// ── SFX 4: Freeze Sound (Icy Crystal Bell Tone) ───────────────────────────
export function playFreezeSound() {
  if (isMutedState) return;
  try {
    const ctx = getAudioContext();
    const freqs = [1480, 1975.5, 2349.3]; // High glassy notes
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.04);
      osc.stop(ctx.currentTime + idx * 0.04 + 0.25);
    });
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

// ── SFX 5: Typing Error Penalty (Low Buzz Tone) ────────────────────────────
export function playPenaltyError() {
  if (isMutedState) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.setValueAtTime(110, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

// ── SFX: Quiz Correct Answer (Pleasant Double Chime) ─────────────────────
export function playCorrectSound() {
  if (isMutedState) return;
  try {
    const ctx = getAudioContext();
    const notes = [659.25, 880]; // E5 -> A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.2);
    });
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

// ── SFX: Quiz Incorrect Answer (Crisp Low Error Tone) ────────────────────
export function playIncorrectSound() {
  if (isMutedState) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.setValueAtTime(130, ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

// ── SFX 6: Victory Fanfare (Win Sound) ────────────────────────────────────
export function playVictorySound() {
  if (isMutedState) return;
  try {
    const ctx = getAudioContext();
    const notes = [
      { freq: 523.25, dur: 0.12, delay: 0 },    // C5
      { freq: 659.25, dur: 0.12, delay: 0.12 }, // E5
      { freq: 783.99, dur: 0.12, delay: 0.24 }, // G5
      { freq: 1046.5, dur: 0.4,  delay: 0.36 }, // C6
    ];

    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.delay);

      gain.gain.setValueAtTime(0.3, ctx.currentTime + n.delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.delay + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + n.delay);
      osc.stop(ctx.currentTime + n.delay + n.dur);
    });
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

// ── SFX 7: Defeat Tone (Elimination / Lose Sound) ──────────────────────────
export function playDefeatSound() {
  if (isMutedState) return;
  try {
    const ctx = getAudioContext();
    const notes = [
      { freq: 440, dur: 0.2, delay: 0 },    // A4
      { freq: 415.3, dur: 0.2, delay: 0.18 }, // G#4
      { freq: 392, dur: 0.2, delay: 0.36 },   // G4
      { freq: 349.23, dur: 0.4, delay: 0.54 }, // F4
    ];

    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.delay);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + n.delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.delay + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + n.delay);
      osc.stop(ctx.currentTime + n.delay + n.dur);
    });
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

// ── BGM: Simple Upbeat Arcade Synth Loop ────────────────────────────────────
export function startRoundBgm() {
  if (isMutedState) return;
  stopRoundBgm();

  try {
    const ctx = getAudioContext();

    // 8-bit style upbeat chord melody loop
    let isPlaying = true;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    // Progression: C major -> G major -> A minor -> F major
    const sequence = [
      [261.63, 329.63, 392.00], // C4, E4, G4
      [196.00, 246.94, 293.66], // G3, B3, D4
      [220.00, 261.63, 329.63], // A3, C4, E4
      [174.61, 220.00, 261.63], // F3, A3, C4
    ];

    let step = 0;

    const playStep = () => {
      if (!isPlaying || isMutedState) return;

      const chord = sequence[step % sequence.length];
      chord.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      });

      // Bass note
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(chord[0] / 2, ctx.currentTime);

      bassGain.gain.setValueAtTime(0.06, ctx.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);

      bassOsc.start();
      bassOsc.stop(ctx.currentTime + 0.38);

      step++;
      timerId = setTimeout(playStep, 400);
    };

    playStep();

    bgmOscillatorGroup = {
      stop: () => {
        isPlaying = false;
        if (timerId) clearTimeout(timerId);
      }
    };
  } catch (e) {
    console.warn('BGM error:', e);
  }
}

export function stopRoundBgm() {
  if (bgmOscillatorGroup) {
    try {
      bgmOscillatorGroup.stop();
    } catch (e) {}
    bgmOscillatorGroup = null;
  }
}
