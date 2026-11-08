<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { useBattlegroundStore } from '../stores/battlegroundStore';
import { useAuthStore } from '../stores/authStore';
import { playModeSelectSound } from '../utils/battleSoundManager';
import { BookOpen } from '@lucide/vue';
import LessonReferenceModal from './lesson/LessonReferenceModal.vue';
import HitunganTutorialModal from './hitungan/HitunganTutorialModal.vue';
import { HITUNGAN_WAVES, type HitunganWaveDef } from '../data/hitunganWaves';
import { HitunganService } from '../services/hitunganService';
import { kanjiLessonList } from '../data/kanjiWritingPrompts';

// Subcomponents & Config
import { modesList, getDynamicDefaultModeId } from './start/modesConfig';
import StartHeaderBar from './start/StartHeaderBar.vue';
import StartWheelSelector from './start/StartWheelSelector.vue';
import StartBottomBar from './start/StartBottomBar.vue';
import KanaCategoryPanel, { type KanaCategoryType } from './start/panels/KanaCategoryPanel.vue';
import KanjiLessonPanel from './start/panels/KanjiLessonPanel.vue';
import DuelOnlinePanel from './start/panels/DuelOnlinePanel.vue';
import DesktopMasterySidebar from './start/desktop/DesktopMasterySidebar.vue';
import DesktopLeaderboardSidebar from './start/desktop/DesktopLeaderboardSidebar.vue';
import DailyGrammarRewindCard from './daily/DailyGrammarRewindCard.vue';

const emit = defineEmits(['start', 'openMasteryGrid', 'openBattleground', 'openLeaderboard', 'openAbout', 'openFuroku', 'openDailyPractice', 'openHandbook']);

const quizStore = useQuizStore();
const battlegroundStore = useBattlegroundStore();
const authStore = useAuthStore();

// Modals
const isReferenceModalOpen = ref(false);
const isHitunganTutorialOpen = ref(false);
const hitunganWaveForTutorial = ref<HitunganWaveDef | null>(null);

// User interaction flag (preserves manual user selection once touched)
const hasUserInteracted = ref(false);

// Dynamic Default Selection based on mastery progression:
// Hiragana < 100% -> Hiragana, Hiragana 100% -> Katakana, Katakana 100% -> Kanji, etc.
const targetDefaultModeId = getDynamicDefaultModeId({
  hiraganaPct: quizStore.hiraganaMasteryStats?.percentage ?? 0,
  katakanaPct: quizStore.katakanaMasteryStats?.percentage ?? 0,
  kanjiPct: quizStore.kanjiMasteryStats?.percentage ?? 0,
  wordsPct: quizStore.wordsMasteryStats?.percentage ?? 0
});
const defaultModeIndex = modesList.findIndex(m => m.id === targetDefaultModeId);
const initialModeIndex = defaultModeIndex !== -1 ? defaultModeIndex : modesList.findIndex(m => m.id === 'hiragana');

// Carousel / Wheel State
const activeModeIndex = ref(initialModeIndex !== -1 ? initialModeIndex : 0);
const prevActiveModeIndex = ref(activeModeIndex.value);
const scrollDirection = ref<'down' | 'up'>('down');
const activeMode = computed(() => modesList[activeModeIndex.value]);

// Mode & Character / Subtype Selection State
const characterTypes = ref(modesList[activeModeIndex.value].defaultType);
const selectedLevel = ref<'basic' | 'n5' | 'battleground'>(modesList[activeModeIndex.value].level);
const selectedQuizBlitzCategory = ref<'hiragana' | 'katakana' | 'mix' | 'kotoba_kanji'>('hiragana');
const selectedKanaCategory = ref<KanaCategoryType>('all');

// Hitungan State
const selectedHitunganTab = ref<'angka' | 'counter' | 'campuran'>('angka');
const selectedHitunganWaveKey = ref<string>('basic_1_10');
const selectedHitunganDirection = ref<'number_to_kana' | 'kana_to_number'>('number_to_kana');

const currentHitunganWave = computed(() => {
  return HITUNGAN_WAVES.find(w => w.wave_key === selectedHitunganWaveKey.value) || HITUNGAN_WAVES[0];
});

const isKanaMode = computed(() => {
  return ['hiragana', 'katakana'].includes(activeMode.value.id);
});

// Selection Handlers
function selectMode(index: number) {
  if (index < 0 || index >= modesList.length) return;
  if (index === activeModeIndex.value) return;

  hasUserInteracted.value = true;
  prevActiveModeIndex.value = activeModeIndex.value;
  scrollDirection.value = index > activeModeIndex.value ? 'up' : 'down';
  activeModeIndex.value = index;
  selectedLevel.value = modesList[index].level;
  if (modesList[index].defaultType) {
    characterTypes.value = modesList[index].defaultType;
  }
  playModeSelectSound(index, scrollDirection.value);
}

function selectSubType(type: string) {
  hasUserInteracted.value = true;
  characterTypes.value = type;
}

// Hitungan Tutorial & Quiz Launching
const openHitunganTutorial = (wave: HitunganWaveDef) => {
  hitunganWaveForTutorial.value = wave;
  isHitunganTutorialOpen.value = true;
};

const startHitunganPracticeFromTutorial = () => {
  const targetWave = hitunganWaveForTutorial.value || currentHitunganWave.value;
  isHitunganTutorialOpen.value = false;

  if (targetWave) {
    launchHitunganQuiz(targetWave);

    HitunganService.saveProgress(
      targetWave.wave_key,
      { tutorial_seen: true },
      authStore.user?.id,
      targetWave.id
    ).then(() => {
      quizStore.loadHitunganProgress().catch(() => {});
    }).catch((err) => {
      console.warn('Background save tutorial progress error:', err);
    });
  }
};

const launchHitunganQuiz = (wave?: HitunganWaveDef) => {
  quizStore.initHitunganSession(10);
  quizStore.selectedHitunganWave = wave || currentHitunganWave.value;
  quizStore.selectedHitunganDirection = selectedHitunganDirection.value;
  emit('start');
};

const getHitunganDirectionLabelForward = (subKey: string) => {
  if (subKey === 'counter') return 'Counter ➔ かな';
  if (subKey === 'campuran') return 'Campuran ➔ かな';
  return 'Angka ➔ かな';
};

const getHitunganDirectionLabelBackward = (subKey: string) => {
  if (subKey === 'counter') return 'かな ➔ Counter';
  if (subKey === 'campuran') return 'かな ➔ Angka';
  return 'かな ➔ Angka';
};

const handleStartHitunganWave = (wave: HitunganWaveDef) => {
  hasUserInteracted.value = true;
  selectedHitunganWaveKey.value = wave.wave_key;
  const prog = quizStore.hitunganProgressMap[wave.wave_key];
  if (!prog?.tutorial_seen) {
    openHitunganTutorial(wave);
    return;
  }
  launchHitunganQuiz(wave);
};

const handleStart = async () => {
  const modeId = activeMode.value.id;
  const subType = characterTypes.value;

  if (modeId === 'daily') {
    emit('openDailyPractice');
    return;
  }

  if (modeId === 'online_game') {
    if (subType === 'quiz_blitz') {
      battlegroundStore.gameMode = 'quiz_blitz';
      battlegroundStore.quizCategory = selectedQuizBlitzCategory.value;
      battlegroundStore.kanaCategory = selectedKanaCategory.value;
    } else {
      battlegroundStore.gameMode = 'battleground';
    }
    emit('openBattleground');
    return;
  }

  if (modeId === 'lainnya') {
    if (['angka', 'counter', 'campuran'].includes(subType)) {
      const wave = currentHitunganWave.value;
      const prog = quizStore.hitunganProgressMap[wave.wave_key];
      if (!prog?.tutorial_seen) {
        openHitunganTutorial(wave);
        return;
      }
      launchHitunganQuiz();
      return;
    } else if (subType === 'mix') {
      quizStore.selectedMode = 'multiple_choice';
      await quizStore.startQuiz(1, 'mix', 'basic', selectedKanaCategory.value);
      emit('start');
      return;
    }
  }

  if (modeId === 'hiragana') {
    quizStore.selectedMode = subType as any; // 'multiple_choice' | 'keyboard_typing' | 'writing'
    await quizStore.startQuiz(1, 'hiragana', 'basic', selectedKanaCategory.value);
    emit('start');
    return;
  }

  if (modeId === 'katakana') {
    quizStore.selectedMode = subType as any; // 'multiple_choice' | 'keyboard_typing' | 'writing'
    await quizStore.startQuiz(1, 'katakana', 'basic', selectedKanaCategory.value);
    emit('start');
    return;
  }

  if (modeId === 'kanji') {
    quizStore.selectedMode = 'writing';
    await quizStore.startQuiz(1, 'kanji', 'basic', selectedKanaCategory.value);
    emit('start');
    return;
  }

  if (modeId === 'kotoba') {
    if (subType === 'renshuu') {
      await quizStore.startQuiz(1, 'renshuu', 'n5');
      emit('start');
      return;
    }
    if (subType === 'kaiwa') {
      await quizStore.startQuiz(1, 'kaiwa', 'n5');
      emit('start');
      return;
    }
    quizStore.selectedWordLessonNumber = null;
    quizStore.selectedMode = 'sentence_typing';
    const targetType = subType === 'words' ? 'words_mixed' : (subType || 'words_mixed');
    await quizStore.startQuiz(1, targetType, 'n5', selectedKanaCategory.value);
    emit('start');
    return;
  }
};

const handleStartSubtype = async (subKey: string) => {
  hasUserInteracted.value = true;
  if (['words', 'words_meaning', 'meaning_to_words', 'words_mixed'].includes(subKey)) {
    characterTypes.value = 'words';
    quizStore.selectedWordLessonNumber = null;
    quizStore.selectedMode = 'sentence_typing';
    const targetType = subKey === 'words' ? 'words_mixed' : subKey;
    await quizStore.startQuiz(1, targetType, 'n5', selectedKanaCategory.value);
    emit('start');
    return;
  }
  characterTypes.value = subKey;
  await handleStart();
};

// Keyboard Section Navigation
const focusedSection = ref<'header' | 'mode' | 'duration'>('mode');
const focusedHeaderTarget = ref<'grid' | 'leaderboard'>('grid');
const isKeyboardNav = ref(false);

const deactivateKeyboardNav = () => {
  isKeyboardNav.value = false;
};

const handleKeydown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
    return;
  }

  // Prevent start screen keyboard navigation if modals are open
  if (isReferenceModalOpen.value || isHitunganTutorialOpen.value) {
    return;
  }

  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
    isKeyboardNav.value = true;
  }

  if (event.key === 'Tab') {
    event.preventDefault();
    if (event.shiftKey) {
      if (focusedSection.value === 'duration') focusedSection.value = 'mode';
      else if (focusedSection.value === 'mode') focusedSection.value = 'header';
      else if (focusedSection.value === 'header') focusedSection.value = 'duration';
    } else {
      if (focusedSection.value === 'header') focusedSection.value = 'mode';
      else if (focusedSection.value === 'mode') focusedSection.value = 'duration';
      else if (focusedSection.value === 'duration') focusedSection.value = 'header';
    }
    return;
  }

  // Header Section
  if (focusedSection.value === 'header') {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      focusedHeaderTarget.value = focusedHeaderTarget.value === 'grid' ? 'leaderboard' : 'grid';
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusedSection.value = 'mode';
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (focusedHeaderTarget.value === 'grid') {
        emit('openMasteryGrid');
      } else {
        emit('openLeaderboard');
      }
    }
  }
  // Mode Section
  else if (focusedSection.value === 'mode') {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (activeModeIndex.value < modesList.length - 1) {
        selectMode(activeModeIndex.value + 1);
      } else {
        focusedSection.value = 'duration';
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (activeModeIndex.value > 0) {
        selectMode(activeModeIndex.value - 1);
      } else {
        focusedSection.value = 'header';
      }
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();

      // Mode Kana (Hiragana, Katakana, Mix): navigasi kiri/kanan memindahkan kategori huruf
      if (isKanaMode.value) {
        const categories: KanaCategoryType[] = ['all', 'basic', 'dakuten', 'combination'];
        const currentIdx = categories.indexOf(selectedKanaCategory.value);
        let nextIdx = 0;
        if (event.key === 'ArrowRight') {
          nextIdx = (currentIdx + 1) % categories.length;
        } else {
          nextIdx = (currentIdx - 1 + categories.length) % categories.length;
        }
        selectedKanaCategory.value = categories[nextIdx];
        return;
      }

      // Mode Kanji: navigasi kiri/kanan memindahkan sub mode / bab Kanji (Semua, Pelajaran 1, Pelajaran 2, ...)
      if (activeMode.value.id === 'kanji') {
        const lessonOptions = [0, ...kanjiLessonList.map(l => l.lessonNumber)];
        const currentIdx = lessonOptions.indexOf(quizStore.selectedKanjiLessonNumber);
        let nextIdx = 0;
        if (event.key === 'ArrowRight') {
          nextIdx = (currentIdx + 1) % lessonOptions.length;
        } else {
          nextIdx = (currentIdx - 1 + lessonOptions.length) % lessonOptions.length;
        }
        quizStore.selectedKanjiLessonNumber = lessonOptions[nextIdx];
        return;
      }

      // Mode Kotoba: navigasi kiri/kanan memindahkan sub-menu Kotoba (words, renshuu, kaiwa)
      if (activeMode.value.id === 'kotoba') {
        const subTypes = activeMode.value.subTypes;
        if (subTypes && subTypes.length > 0) {
          const currentIdx = subTypes.findIndex(s => s.key === characterTypes.value);
          let nextIdx = 0;
          if (event.key === 'ArrowRight') {
            nextIdx = (currentIdx + 1) % subTypes.length;
          } else {
            nextIdx = (currentIdx - 1 + subTypes.length) % subTypes.length;
          }
          selectSubType(subTypes[nextIdx].key);
        }
        return;
      }

      const subTypes = activeMode.value.subTypes;
      if (subTypes && subTypes.length > 0) {
        const currentIdx = subTypes.findIndex(s => s.key === characterTypes.value);
        let nextIdx = 0;
        if (event.key === 'ArrowRight') {
          nextIdx = (currentIdx + 1) % subTypes.length;
        } else {
          nextIdx = (currentIdx - 1 + subTypes.length) % subTypes.length;
        }
        selectSubType(subTypes[nextIdx].key);
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      handleStart();
    }
  }
  // Duration & Start Section
  else if (focusedSection.value === 'duration') {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusedSection.value = 'mode';
    } else if (event.key === 'Enter') {
      event.preventDefault();
      handleStart();
    }
  }
};

onMounted(() => {
  quizStore.loadRenshuuProgress();
  quizStore.loadHitunganProgress();

  if (!hasUserInteracted.value) {
    const recId = getDynamicDefaultModeId({
      hiraganaPct: quizStore.hiraganaMasteryStats?.percentage ?? 0,
      katakanaPct: quizStore.katakanaMasteryStats?.percentage ?? 0,
      kanjiPct: quizStore.kanjiMasteryStats?.percentage ?? 0,
      wordsPct: quizStore.wordsMasteryStats?.percentage ?? 0
    });
    const idx = modesList.findIndex(m => m.id === recId);
    if (idx !== -1 && idx !== activeModeIndex.value) {
      activeModeIndex.value = idx;
      prevActiveModeIndex.value = idx;
      selectedLevel.value = modesList[idx].level;
      if (modesList[idx].defaultType) {
        characterTypes.value = modesList[idx].defaultType;
      }
    }
  }

  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('pointerdown', deactivateKeyboardNav);
  window.addEventListener('touchstart', deactivateKeyboardNav);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('pointerdown', deactivateKeyboardNav);
  window.removeEventListener('touchstart', deactivateKeyboardNav);
});

watch(characterTypes, (newVal) => {
  if (newVal === 'renshuu') {
    quizStore.loadRenshuuProgress();
  } else if (['angka', 'counter', 'campuran'].includes(newVal)) {
    selectedHitunganTab.value = newVal as any;
    if (newVal === 'angka') {
      selectedHitunganWaveKey.value = 'basic_1_10';
    } else if (newVal === 'counter') {
      selectedHitunganWaveKey.value = 'counter_hon';
    } else if (newVal === 'campuran') {
      selectedHitunganWaveKey.value = 'mixed_review';
    }
  }
});
</script>

<template>
  <div class="max-w-4xl xl:max-w-[1460px] 2xl:max-w-[1620px] mx-auto p-3.5 sm:p-6 pb-36 sm:pb-28 flex flex-col items-center animate-fadeIn h-full overflow-y-auto w-full select-none">
    <!-- Hitungan Tutorial Modal -->
    <HitunganTutorialModal 
      :is-open="isHitunganTutorialOpen" 
      :wave="hitunganWaveForTutorial" 
      @close="isHitunganTutorialOpen = false" 
      @start="startHitunganPracticeFromTutorial" 
    />
    
    <!-- SECTION 1: HEADER BAR (Mobile & Tablet only, hidden on desktop >= xl) -->
    <div class="w-full max-w-3xl xl:hidden mb-1 flex justify-center">
      <StartHeaderBar
        :is-keyboard-nav="isKeyboardNav"
        :focused-section="focusedSection"
        :focused-header-target="focusedHeaderTarget"
        :selected-level="selectedLevel"
        @open-mastery-grid="emit('openMasteryGrid')"
        @open-leaderboard="emit('openLeaderboard')"
        @open-furoku="emit('openFuroku')"
        @open-reference="isReferenceModalOpen = true"
        @open-daily-practice="emit('openDailyPractice')"
        @interact="deactivateKeyboardNav"
      />
    </div>

    <!-- SECTION 2: 3-COLUMN DESKTOP VIEW & CENTERED WHEEL -->
    <div class="w-full flex justify-center items-start gap-5 2xl:gap-8 mt-1 xl:mt-0">
      <!-- Left Column: Peta Penguasaan Huruf (Desktop >= xl) -->
      <aside class="hidden xl:block w-[300px] 2xl:w-[340px] shrink-0">
        <DesktopMasterySidebar 
          @open-mastery-grid="(cat) => emit('openMasteryGrid', cat)" 
        />
      </aside>

      <!-- Center Column: Wheel Selector & Options -->
      <main class="w-full max-w-3xl flex flex-col items-center min-w-0">
        <!-- Mobile/Tablet Compact Daily Grammar Rewind Card -->
        <div class="w-full xl:hidden mb-2">
          <DailyGrammarRewindCard 
            @jump-to-chapter="(num) => emit('openHandbook', num)" 
          />
        </div>

        <StartWheelSelector
          :modes="modesList"
          :active-mode-index="activeModeIndex"
          :prev-active-mode-index="prevActiveModeIndex"
          :scroll-direction="scrollDirection"
          :character-type="characterTypes"
          :selected-kana-category="selectedKanaCategory"
          :selected-kanji-lesson-number="quizStore.selectedKanjiLessonNumber"
          :selected-hitungan-tab="selectedHitunganTab"
          :is-keyboard-nav="isKeyboardNav"
          :focused-section="focusedSection"
          @select-mode="selectMode"
          @select-sub-type="selectSubType"
          @interact="deactivateKeyboardNav"
        >
          <!-- Mode Bottom Configuration Panels -->
          <Transition name="fade-slide-up" mode="out-in">
            <!-- Duel Online Info Banner -->
            <DuelOnlinePanel 
              v-if="activeMode.id === 'online_game'" 
              :sub-type="characterTypes" 
            />

            <!-- Kana Category Selector Panel (Basic / Dakuten / Kombinasi / All) -->
            <KanaCategoryPanel
              v-else-if="isKanaMode"
              v-model="selectedKanaCategory"
              :character-type="activeMode.id"
              @interact="deactivateKeyboardNav"
            />

            <!-- Kanji N5 Lesson Progression & Selector Panel -->
            <KanjiLessonPanel
              v-else-if="activeMode.id === 'kanji'"
              @interact="deactivateKeyboardNav"
            />

            <!-- Kotoba Sub-Menu Selector inside Card (Kotoba, Renshuu, Kaiwa) -->
            <div 
              v-else-if="activeMode.id === 'kotoba'"
              class="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full animate-fadeIn pt-1"
            >
              <button
                v-for="sub in activeMode.subTypes"
                :key="sub.key"
                type="button"
                @click.stop="deactivateKeyboardNav(); selectSubType(sub.key);"
                :class="[
                  'px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs',
                  (characterTypes === sub.key || (sub.key === 'words' && ['words_meaning', 'meaning_to_words', 'words_mixed'].includes(characterTypes)))
                    ? 'bg-aizome dark:bg-amber-500 text-white border-aizome dark:border-amber-500 font-black shadow-xs scale-[1.02]'
                    : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200/90 dark:border-slate-700/80'
                ]"
              >
                <span>{{ sub.label }}</span>
                <span v-if="sub.beta" class="text-[8px] sm:text-[9px] font-black px-1 py-0.5 rounded bg-amber-400 text-amber-950 uppercase shrink-0">Beta</span>
              </button>
            </div>

            <!-- Lainnya Panel: Sub-Menu (Angka / Counter / Campuran / Mix Kana) + Arah Latihan / Kana Category -->
            <div 
              v-else-if="activeMode.id === 'lainnya'"
              class="flex flex-col gap-2 w-full animate-fadeIn pt-1"
            >
              <!-- Sub-Menu Selector Pills (Angka, Counter, Campuran, Mix Kana) -->
              <div class="grid grid-cols-4 gap-1.5 w-full">
                <button
                  v-for="sub in activeMode.subTypes"
                  :key="sub.key"
                  type="button"
                  @click.stop="deactivateKeyboardNav(); selectSubType(sub.key);"
                  :class="[
                    'py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer border flex flex-col sm:flex-row items-center justify-center gap-1 shadow-2xs',
                    characterTypes === sub.key
                      ? 'bg-matcha dark:bg-emerald-600 text-white border-matcha dark:border-emerald-500 font-black shadow-xs scale-[1.02]'
                      : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200/90 dark:border-slate-700/80'
                  ]"
                >
                  <span class="text-[11px] sm:text-xs truncate">{{ sub.label }}</span>
                </button>
              </div>

              <!-- Jika Mix Kana: Tampilkan Kategori Huruf (Semua, Dasar, Dakuten, Kombinasi) -->
              <KanaCategoryPanel
                v-if="characterTypes === 'mix'"
                v-model="selectedKanaCategory"
                character-type="mix"
                @interact="deactivateKeyboardNav"
              />

              <!-- Jika Angka / Counter / Campuran: Tampilkan Arah Latihan + Lihat Pola -->
              <div 
                v-else
                class="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-1.5 w-full"
              >
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 dark:text-slate-400">
                    Arah Latihan:
                  </span>
                  <div class="flex items-center gap-1 bg-white/80 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      @click.stop="deactivateKeyboardNav(); selectedHitunganDirection = 'number_to_kana'"
                      :class="[
                        'px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer',
                        selectedHitunganDirection === 'number_to_kana'
                          ? 'bg-emerald-600 text-white font-black shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      ]"
                    >
                      {{ getHitunganDirectionLabelForward(characterTypes) }}
                    </button>
                    <button
                      type="button"
                      @click.stop="deactivateKeyboardNav(); selectedHitunganDirection = 'kana_to_number'"
                      :class="[
                        'px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer',
                        selectedHitunganDirection === 'kana_to_number'
                          ? 'bg-emerald-600 text-white font-black shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      ]"
                    >
                      {{ getHitunganDirectionLabelBackward(characterTypes) }}
                    </button>
                  </div>
                </div>

                <!-- Preview Pattern Modal Button -->
                <button
                  type="button"
                  @click.stop="openHitunganTutorial(currentHitunganWave)"
                  class="py-1 px-2 rounded-xl bg-white/80 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-slate-700 text-xs font-bold transition hover:bg-emerald-50 dark:hover:bg-slate-700 flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
                  title="Buka Penjelasan Pola & Pengecualian"
                >
                  <BookOpen class="w-3.5 h-3.5 text-emerald-600" />
                  <span class="text-[11px]">Lihat Pola</span>
                </button>
              </div>
            </div>
          </Transition>
        </StartWheelSelector>
      </main>

      <!-- Right Column: Daily Rewind & Papan Peringkat / Leaderboard (Desktop >= xl) -->
      <aside class="hidden xl:flex flex-col gap-3.5 w-[300px] 2xl:w-[340px] shrink-0">
        <!-- Daily Grammar Rewind Card (Di atas Papan Peringkat) -->
        <DailyGrammarRewindCard 
          @jump-to-chapter="(num) => emit('openHandbook', num)" 
        />
        <DesktopLeaderboardSidebar @open-leaderboard="emit('openLeaderboard')" />
      </aside>
    </div>

    <!-- SECTION 3: STICKY BOTTOM ACTION BAR -->
    <StartBottomBar
      :is-keyboard-nav="isKeyboardNav"
      :focused-section="focusedSection"
      :active-mode-id="activeMode.id"
      :selected-level="selectedLevel"
      :character-type="characterTypes"
      :selected-kana-category="selectedKanaCategory"
      :current-hitungan-wave="currentHitunganWave"
      :selected-hitungan-direction="selectedHitunganDirection"
      :is-loading="quizStore.isLoading"
      @start="handleStart"
      @start-subtype="handleStartSubtype"
      @start-hitungan-wave="handleStartHitunganWave"
      @interact="deactivateKeyboardNav"
    />

    <!-- Standalone Reference Modal for N5 Kotoba / Renshuu / Kaiwa -->
    <LessonReferenceModal 
      :is-open="isReferenceModalOpen" 
      @close="isReferenceModalOpen = false" 
    />
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Card Bottom Area Component Transition */
.fade-slide-up-enter-active,
.fade-slide-up-leave-active {
  transition: all 0.25s ease-out;
}

.fade-slide-up-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

.fade-slide-up-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
