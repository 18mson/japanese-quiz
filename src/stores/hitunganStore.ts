import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { HITUNGAN_WAVES, type HitunganWaveDef } from '../data/hitunganWaves';
import { HitunganService, type HitunganProgressRecord } from '../services/hitunganService';
import { supabase } from '../lib/supabaseClient';

export const useHitunganStore = defineStore('hitungan', () => {
  const selectedHitunganWave = ref<HitunganWaveDef>(HITUNGAN_WAVES[0]);
  const selectedHitunganDirection = ref<'number_to_kana' | 'kana_to_number'>('number_to_kana');
  const hitunganProgressMap = ref<Record<string, HitunganProgressRecord>>({});
  const isHitunganFinished = ref(false);

  const unlockedHitunganWaveKeys = computed(() => {
    return Object.keys(hitunganProgressMap.value).filter(
      key => hitunganProgressMap.value[key]?.tutorial_seen
    );
  });

  const loadHitunganProgress = async () => {
    const authUserId = (await supabase.auth.getUser()).data.user?.id || null;
    const prog = await HitunganService.getProgress(authUserId);
    hitunganProgressMap.value = prog;
    return prog;
  };

  return {
    selectedHitunganWave,
    selectedHitunganDirection,
    hitunganProgressMap,
    unlockedHitunganWaveKeys,
    isHitunganFinished,
    loadHitunganProgress
  };
});
