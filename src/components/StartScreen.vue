<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { useBattlegroundStore } from '../stores/battlegroundStore';
import { useAuthStore } from '../stores/authStore';
import { playModeSelectSound } from '../utils/battleSoundManager';
import LessonReferenceModal from './lesson/LessonReferenceModal.vue';
import HitunganTutorialModal from './hitungan/HitunganTutorialModal.vue';
import { HITUNGAN_WAVES, type HitunganWaveDef } from '../data/hitunganWaves';
import { HitunganService } from '../services/hitunganService';

// Subcomponents & Config
import { modesList } from './start/modesConfig';
import StartHeaderBar from './start/StartHeaderBar.vue';
import StartWheelSelector from './start/StartWheelSelector.vue';
import StartBottomBar from './start/StartBottomBar.vue';
import KanaCategoryPanel, { type KanaCategoryType } from './start/panels/KanaCategoryPanel.vue';
import KanjiLessonPanel from './start/panels/KanjiLessonPanel.vue';
import HitunganWavePanel from './start/panels/HitunganWavePanel.vue';
import DuelOnlinePanel from './start/panels/DuelOnlinePanel.vue';

const emit = defineEmits(['start', 'openMasteryGrid', 'openBattleground', 'openLeaderboard', 'openAbout', 'openFuroku']);

const quizStore = useQuizStore();
const battlegroundStore = useBattlegroundStore();
const authStore = useAuthStore();

// Modals
const isReferenceModalOpen = ref(false);
const isHitunganTutorialOpen = ref(false);
const hitunganWaveForTutorial = ref<HitunganWaveDef | null>(null);

// Mode & Character Selection State
const characterTypes = ref('hiragana');
const selectedLevel = ref<'basic' | 'n5' | 'battleground'>('basic');
const selectedQuizBlitzCategory = ref<'hiragana' | 'katakana' | 'mix' | 'kotoba_kanji'>('hiragana');
const selectedKanaCategory = ref<KanaCategoryType>('all');

// Hitungan State
const selectedHitunganTab = ref<'angka' | 'counter' | 'campuran'>('angka');
const selectedHitunganWaveKey = ref<string>('basic_1_10');
const selectedHitunganDirection = ref<'number_to_kana' | 'kana_to_number'>('number_to_kana');

// Carousel / Wheel State
const activeModeIndex = ref(0);
const prevActiveModeIndex = ref(0);
const scrollDirection = ref<'down' | 'up'>('down');
const activeMode = computed(() => modesList[activeModeIndex.value]);

const currentHitunganWave = computed(() => {
  return HITUNGAN_WAVES.find(w => w.wave_key === selectedHitunganWaveKey.value) || HITUNGAN_WAVES[0];
});

const isKanaMode = computed(() => {
  return ['multiple_choice', 'keyboard_typing', 'writing'].includes(activeMode.value.id) &&
    ['hiragana', 'katakana', 'mix'].includes(characterTypes.value);
});

// Selection Handlers
function selectMode(index: number) {
  if (index < 0 || index >= modesList.length) return;
  if (index === activeModeIndex.value) return;

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
  quizStore.selectedMode = 'hitungan';
  quizStore.selectedHitunganWave = wave || currentHitunganWave.value;
  quizStore.selectedHitunganDirection = selectedHitunganDirection.value;
  emit('start');
};

const handleStart = async () => {
  if (activeMode.value.id === 'hitungan') {
    const wave = currentHitunganWave.value;
    const prog = quizStore.hitunganProgressMap[wave.wave_key];
    if (!prog?.tutorial_seen) {
      openHitunganTutorial(wave);
      return;
    }
    launchHitunganQuiz();
    return;
  }
  if (selectedLevel.value === 'battleground') {
    if (characterTypes.value === 'quiz_blitz') {
      battlegroundStore.gameMode = 'quiz_blitz';
      battlegroundStore.quizCategory = selectedQuizBlitzCategory.value;
      battlegroundStore.kanaCategory = selectedKanaCategory.value;
    } else {
      battlegroundStore.gameMode = 'battleground';
    }
    emit('openBattleground');
  } else {
    quizStore.selectedMode = activeMode.value.id as any;
    await quizStore.startQuiz(1, characterTypes.value, selectedLevel.value, selectedKanaCategory.value);
    emit('start');
  }
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
      const subTypes = activeMode.value.subTypes;
      if (subTypes && subTypes.length > 0) {
        event.preventDefault();
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
      focusedSection.value = 'duration';
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
  <div class="max-w-4xl mx-auto p-3.5 sm:p-6 pb-36 sm:pb-28 flex flex-col items-center animate-fadeIn h-full overflow-y-auto w-full select-none">
    <!-- Hitungan Tutorial Modal -->
    <HitunganTutorialModal 
      :is-open="isHitunganTutorialOpen" 
      :wave="hitunganWaveForTutorial" 
      @close="isHitunganTutorialOpen = false" 
      @start="startHitunganPracticeFromTutorial" 
    />
    
    <!-- SECTION 1: HEADER BAR -->
    <StartHeaderBar
      :is-keyboard-nav="isKeyboardNav"
      :focused-section="focusedSection"
      :focused-header-target="focusedHeaderTarget"
      :selected-level="selectedLevel"
      @open-mastery-grid="emit('openMasteryGrid')"
      @open-leaderboard="emit('openLeaderboard')"
      @open-furoku="emit('openFuroku')"
      @open-reference="isReferenceModalOpen = true"
      @interact="deactivateKeyboardNav"
    />

    <!-- SECTION 2: DISK WHEEL MODE SELECTION BOX -->
    <StartWheelSelector
      :modes="modesList"
      :active-mode-index="activeModeIndex"
      :prev-active-mode-index="prevActiveModeIndex"
      :scroll-direction="scrollDirection"
      :character-type="characterTypes"
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
          v-if="selectedLevel === 'battleground'" 
          :sub-type="characterTypes" 
        />

        <!-- Kana Category Selector Panel (Basic / Dakuten / Kombinasi / All) -->
        <KanaCategoryPanel
          v-else-if="isKanaMode"
          v-model="selectedKanaCategory"
          :character-type="characterTypes"
          @interact="deactivateKeyboardNav"
        />

        <!-- Kanji N5 Lesson Progression & Selector Panel -->
        <KanjiLessonPanel
          v-else-if="activeMode.id === 'writing' && characterTypes === 'kanji'"
          @interact="deactivateKeyboardNav"
        />

        <!-- Hitungan Mode Wave & Direction Selector Panel -->
        <HitunganWavePanel
          v-else-if="activeMode.id === 'hitungan'"
          :selected-tab="selectedHitunganTab"
          v-model:selected-wave-key="selectedHitunganWaveKey"
          v-model:direction="selectedHitunganDirection"
          @open-tutorial="openHitunganTutorial"
          @interact="deactivateKeyboardNav"
        />

        <!-- Default Subtype Fallback Info -->
        <div v-else key="mode-info" class="text-xs text-gray-500 dark:text-slate-400 font-medium text-center">
          Pilihan Sub-menu: {{ activeMode.subTypes?.map(s => s.label).join(', ') }}
        </div>
      </Transition>
    </StartWheelSelector>

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
