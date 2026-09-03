<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { 
  X, 
  BookMarked, 
  Hash, 
  Clock, 
  Layers, 
  BookOpen, 
  Loader2,
  Volume2
} from '@lucide/vue';
import { useSettingsStore } from '../../stores/settingsStore';
import TabKataBilangan from './TabKataBilangan.vue';
import TabUngkapanWaktu from './TabUngkapanWaktu.vue';
import TabKataBantuBilangan from './TabKataBantuBilangan.vue';
import TabKonjugasiKataKerja from './TabKonjugasiKataKerja.vue';
import { 
  fetchKataBilangan, 
  fetchUngkapanWaktu, 
  fetchKataBantuBilangan, 
  fetchKonjugasiKataKerja 
} from '../../services/referenceService';
import {
  kataBilanganData,
  ungkapanWaktuData,
  kataBantuBilanganData,
  konjugasiKataKerjaData,
  type KataBilanganData,
  type UngkapanWaktuData,
  type KataBantuBilanganData,
  type KonjugasiKataKerjaData
} from '../../data/referenceData';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    initialTab?: 'kata_bilangan' | 'ungkapan_waktu' | 'kata_bantu_bilangan' | 'konjugasi_kata_kerja';
  }>(),
  {
    initialTab: 'kata_bilangan'
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const settingsStore = useSettingsStore();
const activeTab = ref<'kata_bilangan' | 'ungkapan_waktu' | 'kata_bantu_bilangan' | 'konjugasi_kata_kerja'>(props.initialTab);
const isLoading = ref(false);

// Local state for fetched data
const bilangan = ref<KataBilanganData>(kataBilanganData);
const waktu = ref<UngkapanWaktuData>(ungkapanWaktuData);
const counter = ref<KataBantuBilanganData>(kataBantuBilanganData);
const verba = ref<KonjugasiKataKerjaData>(konjugasiKataKerjaData);

const loadAllData = async () => {
  isLoading.value = true;
  try {
    const [b, w, c, v] = await Promise.all([
      fetchKataBilangan(),
      fetchUngkapanWaktu(),
      fetchKataBantuBilangan(),
      fetchKonjugasiKataKerja()
    ]);
    bilangan.value = b;
    waktu.value = w;
    counter.value = c;
    verba.value = v;
  } catch (err) {
    console.error('Error loading Furoku reference data:', err);
  } finally {
    isLoading.value = false;
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close');
  }
};

watch(() => props.isOpen, (open) => {
  if (open) {
    activeTab.value = props.initialTab || 'kata_bilangan';
    loadAllData();
  }
});

watch(() => props.initialTab, (newTab) => {
  if (newTab) {
    activeTab.value = newTab;
  }
});

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  if (props.isOpen) {
    loadAllData();
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-2.5 sm:p-5 select-none animate-fadeIn"
        @click.self="emit('close')"
      >
        <div 
          class="max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[880px] animate-scaleUp relative"
        >
          <!-- Top Decorative Glows -->
          <div class="absolute -right-16 -top-16 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -left-16 -bottom-16 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Header Bar -->
          <div class="px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border-b border-slate-800 flex items-center justify-between shadow-md flex-shrink-0 relative z-10">
            <div class="flex items-center gap-2.5 sm:gap-3">
              <div class="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-amber-300 shadow-inner flex-shrink-0">
                <BookMarked class="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-base sm:text-xl font-black text-white tracking-tight">Furoku (付録)</h2>
                  <span class="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">Referensi Cepat</span>
                </div>
                <p class="text-xs text-slate-400 mt-0.5 hidden sm:block">
                  Buku saku lampiran: kata bilangan, ungkapan waktu, kata bantu bilangan, dan konjugasi kata kerja.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2.5">
              <!-- Quick TTS Speed Toggle -->
              <div class="hidden sm:flex items-center gap-1 bg-slate-950/80 border border-slate-700/60 p-1 rounded-xl shadow-inner">
                <Volume2 class="w-3.5 h-3.5 text-indigo-400 ml-1 mr-0.5" />
                <button
                  v-for="rate in ([0.6, 0.9, 1.2] as const)"
                  :key="rate"
                  type="button"
                  @click="settingsStore.setSpeechRate(rate)"
                  :class="[
                    'px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer',
                    settingsStore.speechRate === rate
                      ? 'bg-indigo-600 text-white shadow-xs font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  ]"
                  :title="`Kecepatan Suara ${rate}x`"
                >
                  {{ rate }}x
                </button>
              </div>

              <!-- Close Button -->
              <button 
                @click="emit('close')"
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer border border-slate-700/60"
                title="Tutup (Esc)"
              >
                <X class="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <!-- 4 Main Navigation Tabs -->
          <div class="px-3 sm:px-6 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-1.5 sm:gap-2 overflow-x-auto flex-shrink-0 z-10">
            <!-- Tab 1: Kata Bilangan -->
            <button
              @click="activeTab = 'kata_bilangan'"
              :class="[
                'px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center gap-2 shrink-0 border',
                activeTab === 'kata_bilangan'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-xs shadow-amber-950/40'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              ]"
            >
              <Hash class="w-4 h-4" />
              <span>Kata Bilangan</span>
            </button>

            <!-- Tab 2: Ungkapan Waktu -->
            <button
              @click="activeTab = 'ungkapan_waktu'"
              :class="[
                'px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center gap-2 shrink-0 border',
                activeTab === 'ungkapan_waktu'
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-xs shadow-cyan-950/40'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              ]"
            >
              <Clock class="w-4 h-4" />
              <span>Ungkapan Waktu</span>
            </button>

            <!-- Tab 3: Kata Bantu Bilangan -->
            <button
              @click="activeTab = 'kata_bantu_bilangan'"
              :class="[
                'px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center gap-2 shrink-0 border',
                activeTab === 'kata_bantu_bilangan'
                  ? 'bg-violet-500/20 border-violet-500/40 text-violet-300 shadow-xs shadow-violet-950/40'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              ]"
            >
              <Layers class="w-4 h-4" />
              <span>Kata Bantu Bilangan</span>
            </button>

            <!-- Tab 4: Konjugasi Kata Kerja -->
            <button
              @click="activeTab = 'konjugasi_kata_kerja'"
              :class="[
                'px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center gap-2 shrink-0 border',
                activeTab === 'konjugasi_kata_kerja'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-xs shadow-emerald-950/40'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              ]"
            >
              <BookOpen class="w-4 h-4" />
              <span>Konjugasi Kata Kerja</span>
            </button>
          </div>

          <!-- Content Body (Scrollable) -->
          <div class="p-3.5 sm:p-6 overflow-y-auto flex-1 bg-slate-950/50 min-h-0 relative">
            <!-- Loading Indicator Overlay (Non-blocking) -->
            <div v-if="isLoading" class="absolute top-2 right-4 flex items-center gap-1.5 text-xs text-slate-400">
              <Loader2 class="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Sinkronisasi...</span>
            </div>

            <!-- Tab Views -->
            <TabKataBilangan 
              v-if="activeTab === 'kata_bilangan'" 
              :data="bilangan" 
            />

            <TabUngkapanWaktu 
              v-else-if="activeTab === 'ungkapan_waktu'" 
              :data="waktu" 
            />

            <TabKataBantuBilangan 
              v-else-if="activeTab === 'kata_bantu_bilangan'" 
              :data="counter" 
            />

            <TabKonjugasiKataKerja 
              v-else-if="activeTab === 'konjugasi_kata_kerja'" 
              :data="verba" 
            />
          </div>

          <!-- Footer Bar -->
          <div class="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium flex-shrink-0">
            <span class="text-[11px] sm:text-xs">
              Sumber: <em>Terjemahan dan Keterangan Tata Bahasa Minna no Nihongo (Indonesian Edition)</em>
            </span>
            <button 
              @click="emit('close')"
              class="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition cursor-pointer text-xs sm:text-sm border border-slate-700"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
@keyframes scaleUp { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
.animate-scaleUp { animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
</style>
