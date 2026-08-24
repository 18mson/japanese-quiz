<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { 
  X, 
  Sparkles, 
  Gamepad2, 
  Swords, 
  Keyboard, 
  BookOpen, 
  Layers, 
  Target, 
  Heart, 
  Code2, 
  ShieldCheck, 
  Clock, 
  Zap, 
  CheckCircle2,
  Users,
  Flame,
  Award
} from '@lucide/vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    emit('close');
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      @click.self="emit('close')"
    >
      <div 
        class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp relative"
      >
        <!-- Modal Header -->
        <div class="px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-white dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-md shadow-indigo-500/20">
              🇯🇵
            </div>
            <div>
              <h2 class="text-base sm:text-lg font-black text-gray-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <span>Tentang Nihongo Master</span>
                <span class="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full uppercase tracking-wider">v0.1.0</span>
              </h2>
              <p class="text-xs text-gray-500 dark:text-slate-400 font-medium">Platform Belajar Mengetik & Vocabulary Jepang Interaktif</p>
            </div>
          </div>

          <button 
            @click="emit('close')" 
            class="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 flex items-center justify-center transition cursor-pointer"
            title="Tutup"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Scrollable Modal Content Body -->
        <div class="p-5 sm:p-6 overflow-y-auto space-y-6 sm:space-y-8 text-gray-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
          
          <!-- 1. HERO & TUJUAN UTAMA -->
          <div class="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
            <div class="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div class="relative z-10 space-y-3">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 text-xs font-extrabold border border-white/20">
                <Sparkles class="w-3.5 h-3.5" />
                <span>Belajar Lebih Fun & Seru</span>
              </div>
              <h3 class="text-lg sm:text-2xl font-black tracking-tight leading-snug">
                Kuasai Kana, Kosakata, & Mengetik Jepang Tanpa Rasa Bosan!
              </h3>
              <p class="text-indigo-100 text-xs sm:text-sm leading-relaxed font-normal">
                <strong>Nihongo Master</strong> diciptakan dengan satu tujuan utama: 
                <span class="text-amber-300 font-bold">membuat proses belajar Bahasa Jepang menjadi sangat menyenangkan (FUN)</span>. 
                Kami mengubah latihan hafalan kana & kosakata yang kaku menjadi pengalaman interaktif berbasis kecepatan mengetik, tantangan adaptif, dan duel multiplayer battleground yang memicu adrenalin.
              </p>
              
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15 flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold flex-shrink-0">
                    <Gamepad2 class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="font-extrabold text-white text-xs">Gamifikasi Interaktif</div>
                    <div class="text-[11px] text-indigo-200">Belajar sambil bermain</div>
                  </div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15 flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold flex-shrink-0">
                    <ShieldCheck class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="font-extrabold text-white text-xs">Bebas Stress Timer</div>
                    <div class="text-[11px] text-indigo-200">Tanpa timer saat kuis</div>
                  </div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15 flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-rose-400/20 text-rose-300 flex items-center justify-center font-bold flex-shrink-0">
                    <Swords class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="font-extrabold text-white text-xs">Battleground Online</div>
                    <div class="text-[11px] text-indigo-200">Adu cepat vs teman</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. DETAIL MODE-MODE PERMAINAN -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-2">
              <Gamepad2 class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 class="text-sm sm:text-base font-black text-gray-900 dark:text-slate-100 tracking-tight">Detail Mode Permainan</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <!-- Mode 1: Multiple Choice -->
              <div class="bg-slate-50 dark:bg-slate-800/60 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl p-4 space-y-2.5 hover:border-indigo-200 dark:hover:border-indigo-500/50 transition">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center">
                      <Layers class="w-4 h-4" />
                    </div>
                    <span class="font-black text-gray-900 dark:text-slate-100 text-sm">1. Multiple Choice</span>
                  </div>
                  <span class="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded-md">Basic</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                  Latihan pilihan ganda cepat untuk pengenalan visual karakter <strong>Hiragana</strong> dan <strong>Katakana</strong> dasar.
                </p>
                <div class="bg-white dark:bg-slate-800 rounded-xl p-2.5 border border-gray-200 dark:border-slate-700 text-[11px] text-gray-500 dark:text-slate-400 space-y-1">
                  <div class="font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1">
                    <CheckCircle2 class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Fitur Kunci:
                  </div>
                  <p>Membantu pemula mengenali bentuk huruf Kana sebelum melangkah ke mode mengetik.</p>
                </div>
              </div>

              <!-- Mode 2: Keyboard Typing -->
              <div class="bg-slate-50 dark:bg-slate-800/60 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl p-4 space-y-2.5 hover:border-blue-200 dark:hover:border-blue-500/50 transition">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                      <Keyboard class="w-4 h-4" />
                    </div>
                    <span class="font-black text-gray-900 dark:text-slate-100 text-sm">2. Keyboard Typing</span>
                  </div>
                  <span class="px-2 py-0.5 text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-md">Kana & Kanji</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                  Melatih muscle memory mengetik Romaji untuk Kana dan <strong>Kosakata Kanji N5 (Minna no Nihongo)</strong>.
                </p>
                <div class="bg-white dark:bg-slate-800 rounded-xl p-2.5 border border-gray-200 dark:border-slate-700 text-[11px] text-gray-500 dark:text-slate-400 space-y-1">
                  <div class="font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1">
                    <CheckCircle2 class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Fitur Kunci:
                  </div>
                  <p>Mendukung Keyboard Virtual custom dan Keyboard Fisik laptop/PC.</p>
                </div>
              </div>

              <!-- Mode 3: Sentence Typing -->
              <div class="bg-slate-50 dark:bg-slate-800/60 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl p-4 space-y-2.5 hover:border-purple-200 dark:hover:border-purple-500/50 transition">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                      <BookOpen class="w-4 h-4" />
                    </div>
                    <span class="font-black text-gray-900 dark:text-slate-100 text-sm">3. Sentence Typing</span>
                  </div>
                  <span class="px-2 py-0.5 text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 rounded-md">Kalimat N5</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                  Mengetik kalimat Jepang lengkap secara real-time dengan bantuan romaji aktif & mesin parsing Wanakana.
                </p>
                <div class="bg-white dark:bg-slate-800 rounded-xl p-2.5 border border-gray-200 dark:border-slate-700 text-[11px] text-gray-500 dark:text-slate-400 space-y-1">
                  <div class="font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1">
                    <CheckCircle2 class="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Fitur Kunci:
                  </div>
                  <p>Smart Romaji Prompting + Penalti Typo 1.0s Cooldown jika salah menekan tombol.</p>
                </div>
              </div>

              <!-- Mode 4: Multiplayer Battleground -->
              <div class="bg-slate-50 dark:bg-slate-800/60 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl p-4 space-y-2.5 hover:border-rose-200 dark:hover:border-rose-500/50 transition">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                      <Swords class="w-4 h-4" />
                    </div>
                    <span class="font-black text-gray-900 dark:text-slate-100 text-sm">4. Online Battleground</span>
                  </div>
                  <span class="px-2 py-0.5 text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 rounded-md">2–8 Players</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                  Arena Battle Royale Mengetik real-time! Adu kecepatan & ketepatan mengetik kalimat Jepang bersama pemain lain.
                </p>
                <div class="bg-white dark:bg-slate-800 rounded-xl p-2.5 border border-gray-200 dark:border-slate-700 text-[11px] text-gray-500 dark:text-slate-400 space-y-1">
                  <div class="font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1">
                    <CheckCircle2 class="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Fitur Kunci:
                  </div>
                  <p>Bracket Eliminasi Bertahap, Spectator Mode, Room Publik/Privat, & Power-Ups.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. ATURAN & MEKANISME UTAMA -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-2">
              <Zap class="w-5 h-5 text-amber-500" />
              <h3 class="text-sm sm:text-base font-black text-gray-900 dark:text-slate-100 tracking-tight">Aturan & Mekanisme Unggulan</h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Engine Mengetik Pintar -->
              <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 space-y-2 shadow-xs">
                <div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs sm:text-sm">
                  <Keyboard class="w-4 h-4" />
                  <span>Pro Typing Engine</span>
                </div>
                <ul class="text-xs text-gray-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><strong>Single Upcoming Letter:</strong> Hanya menampilkan 1 romaji aktif berikutnya agar fokus dan tidak berantakan.</li>
                  <li><strong>Highlighting Status:</strong> Hijau = selesai, Amber pulse = aktif, Abu-abu = mendatang.</li>
                  <li><strong>Auto Skip Strip ("-"):</strong> Tanda hubung otomatis terlewati tanpa perlu diketik manual.</li>
                  <li><strong>Penalti Typo 1s:</strong> Layar terkunci 1 detik jika salah menekan huruf, mendidik ketelitian.</li>
                </ul>
              </div>

              <!-- Bracket Eliminasi Battleground -->
              <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 space-y-2 shadow-xs">
                <div class="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-xs sm:text-sm">
                  <Users class="w-4 h-4" />
                  <span>Mekanisme Eliminasi Battleground</span>
                </div>
                <ul class="text-xs text-gray-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><strong>8 – 5 Pemain:</strong> Ronde 1 mengeliminasi hingga tersisa 4 survivor teratas.</li>
                  <li><strong>4 – 3 Pemain:</strong> Mengeliminasi hingga 2 survivor melaju ke Babak Final.</li>
                  <li><strong>2 Pemain (Final):</strong> Adu ketepatan penentu 1 Pemenang Utama.</li>
                  <li><strong>Spectator Mode:</strong> Pemain gugur dapat menonton jalannya pertandingan live.</li>
                </ul>
              </div>

              <!-- Sistem Adaptif Mastery -->
              <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 space-y-2 shadow-xs">
                <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs sm:text-sm">
                  <Target class="w-4 h-4" />
                  <span>Spaced Repetition & Mastery</span>
                </div>
                <ul class="text-xs text-gray-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><strong>Soal Lemah (60%):</strong> Prioritas soal yang pernah salah atau belum dikuasai.</li>
                  <li><strong>Missed Items Retry:</strong> Soal yang salah akan diulang di akhir sesi kuis hingga benar.</li>
                  <li><strong>Tingkat Penguasaan:</strong> Streak 0 (Unlearned) → 1-2 (Learning) → 3-4 (Mastered) → 5+ (Crown Mastered).</li>
                </ul>
              </div>

              <!-- Durasi & Cloud Sync -->
              <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 space-y-2 shadow-xs">
                <div class="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-extrabold text-xs sm:text-sm">
                  <Clock class="w-4 h-4" />
                  <span>Durasi Kuis & Sync Cloud</span>
                </div>
                <ul class="text-xs text-gray-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><strong>Pilihan Durasi:</strong> 1 Menit (Kilat), 3 Menit (Fokus), 5 Menit (Maraton).</li>
                  <li><strong>Tanpa Timer Anxiety:</strong> Timer disembunyikan saat kuis berlangsung agar latihan tenang.</li>
                  <li><strong>Cloud & Offline Sync:</strong> Progress tersimpan aman secara offline & tersinkronisasi ke Supabase.</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 4. AUTHOR / CREATOR CREDIT SECTION -->
          <div class="pt-4 border-t border-gray-100 dark:border-slate-800">
            <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden border border-slate-800">
              <div class="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>

              <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 relative z-10 text-center sm:text-left">
                <!-- Avatar Badge -->
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg flex-shrink-0">
                  <div class="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-2xl font-black text-white">
                    👨‍💻
                  </div>
                </div>

                <div class="space-y-1.5 flex-1 min-w-0">
                  <div class="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <span class="text-xs font-bold text-indigo-400 uppercase tracking-widest">Creator & Developer</span>
                    <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    <span class="text-xs font-medium text-slate-400">Author</span>
                  </div>

                  <h4 class="text-lg sm:text-xl font-black text-white tracking-tight">
                    Muhamad Son'ani
                  </h4>

                  <p class="text-xs text-slate-300 leading-relaxed font-medium max-w-xl">
                    "Dikembangkan dengan semangat menghadirkan media pembelajaran Bahasa Jepang yang modern, responsif, dan mengasyikkan bagi para pembelajar di mana saja."
                  </p>

                  <!-- Tech stack badges -->
                  <div class="pt-2 flex items-center justify-center sm:justify-start gap-2 flex-wrap text-[11px] font-bold">
                    <span class="px-2.5 py-1 rounded-lg bg-slate-800/90 text-indigo-300 border border-slate-700/60 flex items-center gap-1">
                      <Code2 class="w-3 h-3 text-indigo-400" /> Vue 3 & TS
                    </span>
                    <span class="px-2.5 py-1 rounded-lg bg-slate-800/90 text-sky-300 border border-slate-700/60 flex items-center gap-1">
                      <Flame class="w-3 h-3 text-sky-400" /> Tailwind CSS
                    </span>
                    <span class="px-2.5 py-1 rounded-lg bg-slate-800/90 text-emerald-300 border border-slate-700/60 flex items-center gap-1">
                      <Award class="w-3 h-3 text-emerald-400" /> Supabase Realtime
                    </span>
                  </div>
                </div>
              </div>

              <!-- Footer tagline inside author card -->
              <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium flex-wrap gap-2">
                <span class="flex items-center gap-1 text-slate-300">
                  <Heart class="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Made with passion for Japanese Learners
                </span>
                <span class="text-slate-500">© {{ new Date().getFullYear() }} Nihongo Master</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Modal Footer Action -->
        <div class="px-5 py-3.5 sm:px-6 sm:py-4 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end flex-shrink-0">
          <button
            @click="emit('close')"
            class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
          >
            <span>Tutup & Mulai Belajar</span>
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.animate-scaleUp {
  animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
</style>
