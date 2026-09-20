<script setup lang="ts">
import { computed } from 'vue';
import { 
  Moon, 
  Sun, 
  Monitor, 
  Keyboard, 
  Volume2, 
  PenTool, 
  Check, 
  Sliders,
  X
} from '@lucide/vue';
import BaseModal from './common/BaseModal.vue';
import { useSettingsStore } from '../stores/settingsStore';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const settingsStore = useSettingsStore();

const themeIndex = computed(() => {
  if (settingsStore.themeMode === 'dark') return 1;
  if (settingsStore.themeMode === 'light') return 2;
  return 0;
});

const keyboardHeightIndex = computed(() => {
  return settingsStore.keyboardHeight === 'tall' ? 1 : 0;
});

const speechRateIndex = computed(() => {
  if (settingsStore.speechRate === 0.9) return 1;
  if (settingsStore.speechRate === 1.2) return 2;
  return 0;
});

const writingLeniencyIndex = computed(() => {
  if (settingsStore.writingLeniencyMode === 'standard') return 1;
  if (settingsStore.writingLeniencyMode === 'strict') return 2;
  return 0;
});
</script>

<template>
  <BaseModal
    :is-open="isOpen"
    max-width="2xl"
    :show-close-button="false"
    :dismiss-on-backdrop="true"
    @close="emit('close')"
    panel-class="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-3xl shadow-2xl relative text-gray-800 dark:text-slate-200 overflow-hidden"
  >
    <template #header>
      <div class="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0 bg-white dark:bg-slate-900">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xs shrink-0">
            <Sliders class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight">
              Pengaturan & Preferensi
            </h3>
            <p class="text-xs text-gray-500 dark:text-slate-400 font-medium">
              Sesuaikan kenyamanan tampilan, input, audio, dan kanvas latihan
            </p>
          </div>
        </div>

        <button 
          @click="emit('close')" 
          class="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 flex items-center justify-center transition cursor-pointer shrink-0"
          title="Tutup"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </template>

    <div class="p-5 sm:p-6">

    <!-- Responsive 2-Column Grid on Desktop / 1-Column on Mobile -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
      <!-- 1. Tema Tampilan -->
      <div class="bg-gray-50/80 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200/70 dark:border-slate-800 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
            <Moon class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Tema Tampilan</span>
          </div>
          <p class="text-[11px] text-gray-500 dark:text-slate-400 mb-3">
            Pilih nuansa warna antarmuka aplikasi atau ikuti setelan perangkat.
          </p>
        </div>

        <div class="relative grid grid-cols-3 p-1 bg-white dark:bg-slate-800/90 rounded-xl border border-gray-200/70 dark:border-slate-700/60">
          <!-- Sliding Pill Indicator -->
          <div 
            class="absolute inset-y-1 rounded-lg bg-indigo-50 dark:bg-slate-700 border border-indigo-100 dark:border-indigo-500/30 shadow-xs transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
            :style="{
              width: 'calc((100% - 8px) / 3)',
              left: '4px',
              transform: `translateX(${themeIndex * 100}%)`
            }"
          ></div>

          <button
            @click="settingsStore.setThemeMode('auto')"
            class="relative z-10 px-2 py-2 rounded-lg text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer select-none"
            :class="settingsStore.themeMode === 'auto' 
              ? 'text-indigo-600 dark:text-indigo-300 font-black' 
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
            title="Otomatis Ikuti Sistem"
          >
            <Monitor class="w-3.5 h-3.5 flex-shrink-0" />
            <span>Otomatis</span>
          </button>
          <button
            @click="settingsStore.setThemeMode('dark')"
            class="relative z-10 px-2 py-2 rounded-lg text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer select-none"
            :class="settingsStore.themeMode === 'dark' 
              ? 'text-indigo-600 dark:text-indigo-300 font-black' 
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
            title="Mode Gelap"
          >
            <Moon class="w-3.5 h-3.5 flex-shrink-0" />
            <span>Gelap</span>
          </button>
          <button
            @click="settingsStore.setThemeMode('light')"
            class="relative z-10 px-2 py-2 rounded-lg text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer select-none"
            :class="settingsStore.themeMode === 'light' 
              ? 'text-indigo-600 dark:text-indigo-300 font-black' 
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
            title="Mode Terang"
          >
            <Sun class="w-3.5 h-3.5 flex-shrink-0" />
            <span>Terang</span>
          </button>
        </div>
      </div>

      <!-- 2. Ketinggian Keyboard Virtual -->
      <div class="bg-gray-50/80 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200/70 dark:border-slate-800 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-300">
              <Keyboard class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Ketinggian Keyboard Virtual</span>
            </div>
            <span class="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">Touchscreen</span>
          </div>
          <p class="text-[11px] text-gray-500 dark:text-slate-400 mb-3">
            Pilihan luas tombol keyboard on-screen saat latihan mengetik.
          </p>
        </div>

        <div class="relative grid grid-cols-2 p-1 bg-white dark:bg-slate-800/90 rounded-xl border border-gray-200/70 dark:border-slate-700/60">
          <!-- Sliding Pill Indicator -->
          <div 
            class="absolute inset-y-1 rounded-lg bg-indigo-50 dark:bg-slate-700 border border-indigo-100 dark:border-indigo-500/30 shadow-xs transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
            :style="{
              width: 'calc((100% - 8px) / 2)',
              left: '4px',
              transform: `translateX(${keyboardHeightIndex * 100}%)`
            }"
          ></div>

          <button
            @click="settingsStore.setKeyboardHeight('short')"
            class="relative z-10 px-3 py-2 rounded-lg text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer select-none"
            :class="settingsStore.keyboardHeight === 'short' 
              ? 'text-indigo-600 dark:text-indigo-300 font-black' 
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
          >
            <Check v-if="settingsStore.keyboardHeight === 'short'" class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span>Default (Standar)</span>
          </button>
          <button
            @click="settingsStore.setKeyboardHeight('tall')"
            class="relative z-10 px-3 py-2 rounded-lg text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer select-none"
            :class="settingsStore.keyboardHeight === 'tall' 
              ? 'text-indigo-600 dark:text-indigo-300 font-black' 
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
          >
            <Check v-if="settingsStore.keyboardHeight === 'tall'" class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span>Tinggi (Lebih Lega)</span>
          </button>
        </div>
      </div>

      <!-- 3. Kecepatan Audio Pengucapan (TTS) -->
      <div class="bg-gray-50/80 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200/70 dark:border-slate-800 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
            <Volume2 class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Kecepatan Audio Pengucapan (TTS)</span>
          </div>
          <p class="text-[11px] text-gray-500 dark:text-slate-400 mb-3">
            Atur laju artikulasi suara pelafalan huruf dan kosakata bahasa Jepang.
          </p>
        </div>

        <div class="relative grid grid-cols-3 p-1 bg-white dark:bg-slate-800/90 rounded-xl border border-gray-200/70 dark:border-slate-700/60">
          <!-- Sliding Pill Indicator -->
          <div 
            class="absolute inset-y-1 rounded-lg bg-indigo-50 dark:bg-slate-700 border border-indigo-100 dark:border-indigo-500/30 shadow-xs transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
            :style="{
              width: 'calc((100% - 8px) / 3)',
              left: '4px',
              transform: `translateX(${speechRateIndex * 100}%)`
            }"
          ></div>

          <button
            @click="settingsStore.setSpeechRate(0.6)"
            class="relative z-10 px-2 py-2 rounded-lg text-xs font-bold transition-colors duration-200 flex flex-col items-center justify-center cursor-pointer select-none"
            :class="settingsStore.speechRate === 0.6 
              ? 'text-indigo-600 dark:text-indigo-300 font-black' 
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
          >
            <span>0.6x</span>
            <span class="text-[10px] opacity-75">Lambat</span>
          </button>
          <button
            @click="settingsStore.setSpeechRate(0.9)"
            class="relative z-10 px-2 py-2 rounded-lg text-xs font-bold transition-colors duration-200 flex flex-col items-center justify-center cursor-pointer select-none"
            :class="settingsStore.speechRate === 0.9 
              ? 'text-indigo-600 dark:text-indigo-300 font-black' 
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
          >
            <span>0.9x</span>
            <span class="text-[10px] opacity-75">Normal</span>
          </button>
          <button
            @click="settingsStore.setSpeechRate(1.2)"
            class="relative z-10 px-2 py-2 rounded-lg text-xs font-bold transition-colors duration-200 flex flex-col items-center justify-center cursor-pointer select-none"
            :class="settingsStore.speechRate === 1.2 
              ? 'text-indigo-600 dark:text-indigo-300 font-black' 
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
          >
            <span>1.2x</span>
            <span class="text-[10px] opacity-75">Cepat</span>
          </button>
        </div>
      </div>

      <!-- 4. Toleransi Menulis Huruf -->
      <div class="bg-gray-50/80 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200/70 dark:border-slate-800 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
            <PenTool class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Toleransi Menulis Huruf (Canvas)</span>
          </div>
          <p class="text-[11px] text-gray-500 dark:text-slate-400 mb-3">
            Sensitivitas penilaian guratan stroke saat menulis Hiragana/Katakana/Kanji.
          </p>
        </div>

        <div class="relative grid grid-cols-3 p-1 bg-white dark:bg-slate-800/90 rounded-xl border border-gray-200/70 dark:border-slate-700/60">
          <!-- Sliding Pill Indicator -->
          <div 
            class="absolute inset-y-1 rounded-lg bg-indigo-50 dark:bg-slate-700 border border-indigo-100 dark:border-indigo-500/30 shadow-xs transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
            :style="{
              width: 'calc((100% - 8px) / 3)',
              left: '4px',
              transform: `translateX(${writingLeniencyIndex * 100}%)`
            }"
          ></div>

          <button
            @click="settingsStore.setWritingLeniencyMode('relaxed')"
            class="relative z-10 px-2 py-2 rounded-lg text-xs font-bold transition-colors duration-200 flex flex-col items-center justify-center cursor-pointer select-none"
            :class="settingsStore.writingLeniencyMode === 'relaxed' 
              ? 'text-indigo-600 dark:text-indigo-300 font-black' 
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
          >
            <span>Santai</span>
            <span class="text-[10px] opacity-75">Paling toleran</span>
          </button>
          <button
            @click="settingsStore.setWritingLeniencyMode('standard')"
            class="relative z-10 px-2 py-2 rounded-lg text-xs font-bold transition-colors duration-200 flex flex-col items-center justify-center cursor-pointer select-none"
            :class="settingsStore.writingLeniencyMode === 'standard' 
              ? 'text-indigo-600 dark:text-indigo-300 font-black' 
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
          >
            <span>Standar</span>
            <span class="text-[10px] opacity-75">Seimbang</span>
          </button>
          <button
            @click="settingsStore.setWritingLeniencyMode('strict')"
            class="relative z-10 px-2 py-2 rounded-lg text-xs font-bold transition-colors duration-200 flex flex-col items-center justify-center cursor-pointer select-none"
            :class="settingsStore.writingLeniencyMode === 'strict' 
              ? 'text-indigo-600 dark:text-indigo-300 font-black' 
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
          >
            <span>Ketat</span>
            <span class="text-[10px] opacity-75">Presisi tinggi</span>
          </button>
        </div>
      </div>
    </div>

      <!-- Footer Action -->
      <div class="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-end">
        <button
          @click="emit('close')"
          class="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          Tutup & Simpan Preferensi
        </button>
      </div>
    </div>
  </BaseModal>
</template>
