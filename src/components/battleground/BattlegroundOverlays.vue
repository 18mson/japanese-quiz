<script setup lang="ts">
// src/components/battleground/BattlegroundOverlays.vue
import { Clock, Lock } from '@lucide/vue';

defineProps<{
  isFrozen: boolean;
  freezeCountdown: number;
  isRewindingGlitch: boolean;
  isStormActive: boolean;
  stormCountdown: number;
  lightningFlashActive: boolean;
  isPreparing: boolean;
  prepCountdownSeconds: number;
}>();

function getRainStyle(n: number) {
  const left = (n * 2.5) % 100;
  const delay = (n * 0.08) % 1.0;
  const duration = 0.3 + (n % 4) * 0.1;
  const height = 50 + (n % 5) * 25;
  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    height: `${height}px`,
  };
}

function getSnowStyle(n: number) {
  const angleRad = (n * 137.5 * Math.PI) / 180;
  const distanceVw = 32 + (n % 6) * 7.5;
  const distanceVh = 32 + (n % 6) * 7.5;
  const dx = Math.cos(angleRad) * distanceVw;
  const dy = Math.sin(angleRad) * distanceVh;

  const size = 3.5 + (n % 4) * 1.5;
  const duration = 1.5 + (n % 5) * 0.3;
  const delay = (n % 8) * 0.2;

  return {
    '--dx': `${dx.toFixed(1)}vw`,
    '--dy': `${dy.toFixed(1)}vh`,
    width: `${size}px`,
    height: `${size}px`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
  };
}
</script>

<template>
  <div>
    <!-- VICTIM FREEZE OVERLAY ❄️ -->
    <div v-if="isFrozen" class="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-center bg-cyan-950/75 border-4 sm:border-8 border-cyan-400/40 animate-fadeIn overflow-hidden">
      <img src="/battle/water_caustics_a.png" class="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-screen" style="filter: hue-rotate(180deg) brightness(2) saturate(3);" />
      
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div v-for="n in 45" :key="n" class="snow-particle" :style="getSnowStyle(n)"></div>
      </div>

      <div class="relative z-10 flex flex-col items-center">
        <div class="text-center px-4">
          <div class="text-[10px] sm:text-xs text-cyan-300 font-extrabold tracking-widest uppercase mb-1">SERANGAN LAWAN • FREEZE!</div>
          <h2 class="text-2xl sm:text-3xl font-black text-white drop-shadow-md">LAYAR BEKU — INPUT TERKUNCI!</h2>
          <div class="mt-3 sm:mt-4 inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-cyan-950/90 border border-cyan-400/50 font-mono text-cyan-300 font-black text-lg sm:text-xl shadow-xl">
            <Clock class="w-4 sm:w-5 h-4 sm:h-5 animate-spin text-cyan-300" />
            <span>{{ freezeCountdown.toFixed(1) }}s</span>
          </div>
        </div>
      </div>
    </div>

    <!-- VICTIM BACKWARD REWIND OVERLAY ⏪ -->
    <div v-if="isRewindingGlitch" class="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-center bg-rose-950/85 overflow-hidden animate-glitch-screen">
      <div class="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        <div class="absolute inset-y-0 w-[120vw] bg-gradient-to-l from-transparent via-rose-500/50 to-transparent mix-blend-screen animate-rewind-sweep-1"></div>
        <div class="absolute inset-y-0 w-[80vw] bg-gradient-to-l from-transparent via-red-400/60 to-transparent mix-blend-screen animate-rewind-sweep-2"></div>
        
        <div class="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.4)_50%,rgba(0,0,0,0.4))] bg-[length:100%_4px] pointer-events-none opacity-40"></div>
        <div class="absolute inset-0 bg-cyan-500/20 mix-blend-screen animate-glitch-slice-1"></div>
        <div class="absolute inset-0 bg-rose-500/30 mix-blend-screen animate-glitch-slice-2"></div>

        <img src="/battle/cone_c_blur.png" class="absolute top-1/2 right-0 -translate-y-1/2 w-[120vh] h-[220vw] object-fill opacity-50 mix-blend-screen -rotate-90 animate-rewind-cone-1" style="filter: hue-rotate(320deg) brightness(3.5) saturate(3);" />
        <img src="/battle/cone_c_blur.png" class="absolute top-1/2 right-0 -translate-y-1/2 w-[90vh] h-[180vw] object-fill opacity-35 mix-blend-screen -rotate-90 animate-rewind-cone-2" style="filter: hue-rotate(330deg) brightness(4) saturate(3);" />
      </div>

      <div class="relative z-10 flex flex-col items-center animate-glitch-shake px-4 text-center">
        <div class="text-xs sm:text-sm text-rose-300 font-extrabold uppercase tracking-widest mb-2 glitch-text-sm">
          TIME REWIND ATTACK!
        </div>
        <h2 class="text-2xl sm:text-4xl font-black text-white tracking-wider glitch-text">
          TERLEMPAR MUNDUR -3 KATA!
        </h2>
      </div>
    </div>

    <!-- VICTIM STORM OVERLAY ⚡ -->
    <div v-if="isStormActive" class="fixed inset-0 pointer-events-none z-40 bg-slate-950/75 overflow-hidden flex flex-col items-center justify-start pt-12 sm:pt-16">
      <div class="absolute inset-0 w-full h-full pointer-events-none opacity-90">
        <div class="rain-drop-container">
          <div v-for="n in 40" :key="n" class="rain-line" :style="getRainStyle(n)"></div>
        </div>
      </div>

      <img src="/battle/streaks_composed_b.png" class="absolute inset-0 w-full h-full object-cover mix-blend-screen animate-lightning-streak" style="filter: hue-rotate(40deg) brightness(5) saturate(3);" />

      <div v-if="lightningFlashActive" class="absolute inset-0 bg-amber-200/35 mix-blend-screen transition-opacity duration-75"></div>

      <div class="relative z-10 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-slate-900/90 border border-amber-400/50 text-amber-300 font-extrabold text-xs sm:text-sm shadow-xl">
        <span class="text-base sm:text-lg">⚡</span>
        <span>BADAI PETIR • HINT TERANG SAAT PETIR!</span>
        <span class="font-mono text-white bg-amber-500/30 px-1.5 sm:px-2 py-0.5 rounded text-[11px] sm:text-xs ml-1">{{ stormCountdown.toFixed(1) }}s</span>
      </div>
    </div>

    <!-- PRE-ROUND COUNTDOWN OVERLAY -->
    <div
      v-if="isPreparing"
      class="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn"
    >
      <div class="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-3 sm:mb-4 text-amber-300 shadow-xl shadow-amber-500/20">
        <Lock class="w-7 sm:w-8 h-7 sm:h-8 text-amber-400" />
      </div>
      <h2 class="text-xl sm:text-2xl font-black text-white mb-2">Persiapkan Diri! 🚀</h2>
      <p class="text-slate-400 text-xs sm:text-sm mb-6 max-w-sm">Ronde akan dimulai. Ketik kalimat romaji begitu countdown selesai!</p>
      
      <div class="text-6xl sm:text-7xl font-black font-mono text-amber-400 mb-2 animate-bounce">
        {{ prepCountdownSeconds > 0 ? prepCountdownSeconds : 'SIAP!' }}
      </div>
      <span class="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">
        {{ prepCountdownSeconds > 0 ? 'Detik Lagi...' : 'Mulai Mengetik Sekarang! ⚡' }}
      </span>
    </div>

  </div>
</template>

<style scoped>
/* Snow Burst Radial Particles from Center (Freeze Effect) */
@keyframes snow-burst-outward {
  0% {
    transform: translate(-50%, -50%) translate(0, 0) scale(0.2);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  75% {
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(1.3);
    opacity: 0;
  }
}

.snow-particle {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  background: radial-gradient(circle, #ffffff 0%, rgba(186, 230, 253, 0.95) 50%, rgba(56, 189, 248, 0) 100%);
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.9), 0 0 10px rgba(56, 189, 248, 0.7);
  animation: snow-burst-outward linear infinite;
  pointer-events: none;
}

/* Right-to-Left Rewind Sweeps (Rewind Effect) */
@keyframes rewind-sweep-rtl-1 {
  0%   { transform: translateX(100vw); opacity: 0; }
  25%  { opacity: 0.85; }
  75%  { opacity: 0.85; }
  100% { transform: translateX(-100vw); opacity: 0; }
}
@keyframes rewind-sweep-rtl-2 {
  0%   { transform: translateX(120vw); opacity: 0; }
  20%  { opacity: 0.9; }
  80%  { opacity: 0.9; }
  100% { transform: translateX(-120vw); opacity: 0; }
}
.animate-rewind-sweep-1 {
  animation: rewind-sweep-rtl-1 0.7s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.animate-rewind-sweep-2 {
  animation: rewind-sweep-rtl-2 0.45s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.animate-rewind-cone-1 {
  animation: rewind-sweep-rtl-1 0.6s linear infinite;
}
.animate-rewind-cone-2 {
  animation: rewind-sweep-rtl-2 0.38s linear infinite;
}

/* Digital Glitch Animations for Backward Effect */
@keyframes glitch-shake {
  0% { transform: translate(0, 0) skew(0deg); }
  10% { transform: translate(-4px, 2px) skew(-2deg); }
  20% { transform: translate(4px, -1px) skew(3deg); }
  30% { transform: translate(-2px, -3px) skew(0deg); }
  40% { transform: translate(5px, 1px) skew(-3deg); }
  50% { transform: translate(-1px, 4px) skew(1deg); }
  60% { transform: translate(3px, -3px) skew(-1deg); }
  70% { transform: translate(-5px, 0px) skew(2deg); }
  80% { transform: translate(2px, -2px) skew(-2deg); }
  90% { transform: translate(-1px, 3px) skew(1deg); }
  100% { transform: translate(0, 0) skew(0deg); }
}
.animate-glitch-shake {
  animation: glitch-shake 0.2s infinite;
}
.animate-glitch-screen {
  animation: glitch-shake 0.12s infinite;
}

@keyframes glitch-slice-1 {
  0% { clip-path: inset(20% 0 60% 0); transform: translate(-12px, 3px); }
  20% { clip-path: inset(70% 0 10% 0); transform: translate(12px, -3px); }
  40% { clip-path: inset(10% 0 80% 0); transform: translate(-14px, 4px); }
  60% { clip-path: inset(50% 0 35% 0); transform: translate(8px, -2px); }
  80% { clip-path: inset(85% 0 5% 0); transform: translate(-6px, 3px); }
  100% { clip-path: inset(30% 0 50% 0); transform: translate(7px, -4px); }
}
@keyframes glitch-slice-2 {
  0% { clip-path: inset(40% 0 45% 0); transform: translate(14px, -4px); }
  25% { clip-path: inset(5% 0 85% 0); transform: translate(-10px, 3px); }
  50% { clip-path: inset(65% 0 15% 0); transform: translate(11px, 2px); }
  75% { clip-path: inset(15% 0 70% 0); transform: translate(-8px, -3px); }
  100% { clip-path: inset(75% 0 10% 0); transform: translate(9px, 4px); }
}
.animate-glitch-slice-1 {
  animation: glitch-slice-1 0.18s steps(2, start) infinite;
}
.animate-glitch-slice-2 {
  animation: glitch-slice-2 0.14s steps(2, start) infinite;
}

.glitch-text {
  text-shadow: -4px 0 #00ffff, 4px 0 #ff0055;
  animation: glitch-text-anim 0.15s infinite;
}
.glitch-text-sm {
  text-shadow: -2px 0 #00ffff, 2px 0 #ff0055;
  animation: glitch-text-anim 0.2s infinite;
}
@keyframes glitch-text-anim {
  0% { text-shadow: -4px 0 #00ffff, 4px 0 #ff0055; }
  25% { text-shadow: 4px 0 #00ffff, -4px 0 #ff0055; }
  50% { text-shadow: -3px 3px #00ffff, 3px -3px #ff0055; }
  75% { text-shadow: 3px -3px #00ffff, -3px 3px #ff0055; }
  100% { text-shadow: -4px 0 #00ffff, 4px 0 #ff0055; }
}

/* Individual falling rain drops (Storm Effect) */
.rain-drop-container {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.rain-line {
  position: absolute;
  top: -100px;
  width: 1.5px;
  background: linear-gradient(to bottom, transparent, rgba(251, 191, 36, 0.8), rgba(255, 255, 255, 0.95));
  animation: drop-fall linear infinite;
  box-shadow: 0 0 4px rgba(251, 191, 36, 0.7);
}
@keyframes drop-fall {
  0% {
    transform: translateY(-100px);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    transform: translateY(105vh);
    opacity: 0;
  }
}

@keyframes lightning-flicker {
  0%, 85%, 100% { opacity: 0; }
  86%            { opacity: 0.55; }
  87%            { opacity: 0.1; }
  88%            { opacity: 0.6; }
  89%            { opacity: 0.05; }
}
.animate-lightning-streak {
  animation: lightning-flicker 3.5s steps(1, end) infinite;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
