// src/composables/battleground/useLiveMarkers.ts
import { ref, computed, type Ref } from 'vue';
import { useBattlegroundStore } from '../../stores/battlegroundStore';
import { getPlayerColor, type PlayerColorDef } from '../../utils/playerColors';

export interface LiveMarker {
  playerId: string;
  playerName: string;
  colorDef: PlayerColorDef;
  sentenceIndex: number;
  activeUnitIndex: number;
  isSameSentence: boolean;
  isBehind: boolean;
  isAhead: boolean;
  stackIndex: number;
}

export function useLiveMarkers(currentSentenceIndex: Ref<number>, unitsCount: Ref<number>) {
  const store = useBattlegroundStore();
  const unitElMap = ref<Map<number, HTMLElement>>(new Map());
  const layoutTick = ref(0);

  const liveMarkers = computed<LiveMarker[]>(() => {
    if (!store.alivePlayers || store.alivePlayers.length === 0) return [];
    const myId = store.myPlayerId;
    const currentSentIdx = currentSentenceIndex.value;

    const result: LiveMarker[] = [];
    const stackMap = new Map<string, number>();

    for (const player of store.alivePlayers) {
      if (player.player_id === myId) continue;

      const pProgress = store.playerProgress.get(player.player_id);
      const sentIdx = pProgress?.sentenceIndex ?? 0;
      const unitIdx = pProgress?.activeUnitIndex ?? 0;
      const colorDef = getPlayerColor(player.player_id, store.players);

      const isSameSentence = sentIdx === currentSentIdx;
      const isBehind = sentIdx < currentSentIdx;
      const isAhead = sentIdx > currentSentIdx;

      let posKey = '';
      if (isSameSentence) {
        posKey = `unit_${unitIdx}`;
      } else if (isBehind) {
        posKey = 'edge_left';
      } else {
        posKey = 'edge_right';
      }

      const currentStack = stackMap.get(posKey) ?? 0;
      stackMap.set(posKey, currentStack + 1);

      result.push({
        playerId: player.player_id,
        playerName: player.player_name,
        colorDef,
        sentenceIndex: sentIdx,
        activeUnitIndex: unitIdx,
        isSameSentence,
        isBehind,
        isAhead,
        stackIndex: currentStack,
      });
    }

    return result;
  });

  const sameSentenceMarkers = computed(() => liveMarkers.value.filter((m) => m.isSameSentence));
  const leftEdgeMarkers = computed(() => liveMarkers.value.filter((m) => m.isBehind));
  const rightEdgeMarkers = computed(() => liveMarkers.value.filter((m) => m.isAhead));

  function setUnitRef(el: any, idx: number) {
    if (el) {
      unitElMap.value.set(idx, el as HTMLElement);
    } else {
      unitElMap.value.delete(idx);
    }
  }

  function handleMarkerResize() {
    layoutTick.value++;
  }

  function getMarkerPositionStyle(marker: LiveMarker) {
    void layoutTick.value;
    const el = unitElMap.value.get(marker.activeUnitIndex);

    if (!el) {
      const total = Math.max(1, unitsCount.value);
      const pct = Math.min(95, Math.max(5, ((marker.activeUnitIndex + 0.5) / total) * 100));
      return {
        left: `${pct.toFixed(2)}%`,
        top: '0px',
        transform: `translate(-50%, -100%) translateY(${-(marker.stackIndex * 22)}px)`,
      };
    }

    const left = el.offsetLeft + el.offsetWidth / 2;
    const top = el.offsetTop - (marker.stackIndex * 22);

    return {
      left: `${left}px`,
      top: `${top}px`,
      transform: 'translate(-50%, -100%) translateY(10px)',
    };
  }

  return {
    liveMarkers,
    sameSentenceMarkers,
    leftEdgeMarkers,
    rightEdgeMarkers,
    setUnitRef,
    handleMarkerResize,
    getMarkerPositionStyle,
  };
}
