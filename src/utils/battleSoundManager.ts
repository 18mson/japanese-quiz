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
      { freq: 1046.5, dur: 0.4, delay: 0.36 }, // C6
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
    } catch (e) { }
    bgmOscillatorGroup = null;
  }
}

// ── SFX: Roulette Wheel Tick Sound ─────────────────────────────
export function playRouletteTickSound() {
  if (isMutedState) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.035);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  } catch (e) { }
}

// ── Original Epic-Ethereal Ambient BGM (Kajiura-inspired, A minor) ──────
let lobbyBgmGroup: { stop: () => void } | null = null;

export function startLobbyBgm() {
  if (isMutedState) return;
  stopLobbyBgm();

  try {
    const ctx = getAudioContext();
    let step = 0;
    let isPlaying = true;
    let schedulerTimerId: any = null;

    // Frequencies (A minor natural + modal borrow)
    const A3 = 220.00, B3 = 246.94, C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00;
    const A4 = 440.00, B4 = 493.88, C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;
    const A5 = 880.00;
    const A2 = 110.00, E3 = 164.81, C3 = 130.81, D3 = 146.83, G3 = 196.00, F3 = 174.61;

    const masterGainNode = ctx.createGain();
    masterGainNode.gain.setValueAtTime(0.14, ctx.currentTime);
    masterGainNode.connect(ctx.destination);

    const filterNode = ctx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(1400, ctx.currentTime);
    filterNode.connect(masterGainNode);

    const delayNode = ctx.createDelay();
    delayNode.delayTime.setValueAtTime(0.32, ctx.currentTime);
    const delayGain = ctx.createGain();
    delayGain.gain.setValueAtTime(0.28, ctx.currentTime);

    filterNode.connect(delayNode);
    delayNode.connect(delayGain);
    delayGain.connect(masterGainNode);

    const B = 210; // ms per beat, ~72 BPM lofi
    const secondsPerBeat = B / 1000;

    // ── Melody: wide intervallic leaps + suspended held notes (choir-like) ──
    const melodyTrack = [
      // BAR 1-2: tenang, tema pembuka (Aeolian, interval sexta)
      { note: A4,  beats: 2 },
      { note: C5,  beats: 1 },
      { note: E5,  beats: 3 },
      { note: D5,  beats: 1 },
      { note: C5,  beats: 1 },
      { note: A4,  beats: 2 },

      // BAR 3-4: turun modal, jawaban
      { note: G4,  beats: 2 },
      { note: A4,  beats: 1 },
      { note: B4,  beats: 3 },
      { note: A4,  beats: 1 },
      { note: F4,  beats: 1 },
      { note: E4,  beats: 2 },

      // BAR 5-6: build-up, interval melompat (khas ostinato)
      { note: E5,  beats: 1 },
      { note: A4,  beats: 1 },
      { note: E5,  beats: 1 },
      { note: G5,  beats: 1 },
      { note: F5,  beats: 2 },
      { note: D5,  beats: 2 },
      { note: E5,  beats: 2 },

      // BAR 7-8: puncak, held ethereal note lalu turun
      { note: A5,  beats: 3 },
      { note: G5,  beats: 1 },
      { note: F5,  beats: 1 },
      { note: E5,  beats: 1 },
      { note: D5,  beats: 2 },
      { note: B4,  beats: 2 },

      // BAR 9-10: resolusi lembut, kembali ke tema
      { note: C5,  beats: 2 },
      { note: A4,  beats: 2 },
      { note: E4,  beats: 4 },
      { note: 0,   beats: 2 },
    ];

    // Chord progression: Am - F - C - G (Aeolian/modal, khas cinematic)
    const chordTrack = [
      [A3, C4, E4, A4],   // Am
      [F3, A3, C4, F4],   // F
      [C3, E3, G3, C4],   // C
      [G3, B3, D4, G4],   // G
      [A3, C4, E4, A4],   // Am
      [F3, A3, C4, F4],   // F
      [D3, F3, A3, D4],   // Dm (modal borrow, nuansa gelap)
      [E3, G3, B3, E4],   // Em (Phrygian-ish cadence)
    ];

    const bassTrack = [A2, F3, C3, G3, A2, F3, D3, E3];

    let nextNoteTime = ctx.currentTime;
    let totalBeats = 0;

    const lookahead = 25;
    const scheduleAheadTime = 0.15;

    const scheduleNote = (item: any, time: number) => {
      const barIndex = Math.floor(totalBeats / 4);
      const currentChord = chordTrack[barIndex % chordTrack.length];
      const bassFreq = bassTrack[barIndex % bassTrack.length];
      const noteTime = item.beats * secondsPerBeat;

      if (item.note > 0) {
        // Lead voice: soft sine + slow vibrato (choir-like sustain)
        const leadOsc = ctx.createOscillator();
        const leadGain = ctx.createGain();
        leadOsc.type = 'sine';
        leadOsc.frequency.setValueAtTime(item.note, time);

        const vibrato = ctx.createOscillator();
        const vibratoGain = ctx.createGain();
        vibrato.frequency.setValueAtTime(3.2, time);
        vibratoGain.gain.setValueAtTime(2, time);
        vibrato.connect(vibratoGain);
        vibratoGain.connect(leadOsc.frequency);
        vibrato.start(time);

        leadGain.gain.setValueAtTime(0.001, time);
        leadGain.gain.linearRampToValueAtTime(0.22, time + 0.08);
        leadGain.gain.exponentialRampToValueAtTime(0.001, time + noteTime * 0.96);

        leadOsc.connect(leadGain);
        leadGain.connect(filterNode);
        leadOsc.start(time);
        leadOsc.stop(time + noteTime);
        vibrato.stop(time + noteTime);

        // Pad: sustained chord (string/choir pad feel)
        currentChord.forEach((chordNote: number) => {
          const padOsc = ctx.createOscillator();
          const padGain = ctx.createGain();
          padOsc.type = 'sine';
          padOsc.frequency.setValueAtTime(chordNote, time);
          padGain.gain.setValueAtTime(0.001, time);
          padGain.gain.linearRampToValueAtTime(0.05, time + 0.1);
          padGain.gain.exponentialRampToValueAtTime(0.001, time + noteTime * 0.98);
          padOsc.connect(padGain);
          padGain.connect(filterNode);
          padOsc.start(time);
          padOsc.stop(time + noteTime);
        });

        // Bass: warm sub
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassFreq, time);
        bassGain.gain.setValueAtTime(0.001, time);
        bassGain.gain.linearRampToValueAtTime(0.2, time + 0.05);
        bassGain.gain.exponentialRampToValueAtTime(0.001, time + noteTime * 0.92);
        bassOsc.connect(bassGain);
        bassGain.connect(filterNode);
        bassOsc.start(time);
        bassOsc.stop(time + noteTime);
      }

      totalBeats += item.beats;
    };

    const scheduler = () => {
      if (!isPlaying || isMutedState) return;
      while (nextNoteTime < ctx.currentTime + scheduleAheadTime) {
        const item = melodyTrack[step % melodyTrack.length];
        scheduleNote(item, nextNoteTime);
        nextNoteTime += item.beats * secondsPerBeat;
        step++;
      }
      schedulerTimerId = setTimeout(scheduler, lookahead);
    };

    scheduler();

    lobbyBgmGroup = {
      stop: () => {
        isPlaying = false;
        if (schedulerTimerId) clearTimeout(schedulerTimerId);
      }
    };
  } catch (e) {
    console.warn('Lobby BGM error:', e);
  }
}

export function stopLobbyBgm() {
  if (lobbyBgmGroup) {
    try {
      lobbyBgmGroup.stop();
    } catch (e) { }
    lobbyBgmGroup = null;
  }
}
