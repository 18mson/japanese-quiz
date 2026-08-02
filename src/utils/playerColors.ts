// src/utils/playerColors.ts

export interface PlayerColorDef {
  name: string;
  hex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  ringClass: string;
  glowClass: string;
}

export const PLAYER_COLOR_PALETTE: PlayerColorDef[] = [
  {
    name: 'Indigo',
    hex: '#6366F1',
    bgClass: 'bg-indigo-500',
    textClass: 'text-indigo-400',
    borderClass: 'border-indigo-400',
    ringClass: 'ring-indigo-400/40',
    glowClass: 'shadow-indigo-500/50',
  },
  {
    name: 'Emerald',
    hex: '#10B981',
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-400',
    ringClass: 'ring-emerald-400/40',
    glowClass: 'shadow-emerald-500/50',
  },
  {
    name: 'Amber',
    hex: '#F59E0B',
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-400',
    ringClass: 'ring-amber-400/40',
    glowClass: 'shadow-amber-500/50',
  },
  {
    name: 'Rose',
    hex: '#F43F5E',
    bgClass: 'bg-rose-500',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-400',
    ringClass: 'ring-rose-400/40',
    glowClass: 'shadow-rose-500/50',
  },
  {
    name: 'Cyan',
    hex: '#06B6D4',
    bgClass: 'bg-cyan-500',
    textClass: 'text-cyan-400',
    borderClass: 'border-cyan-400',
    ringClass: 'ring-cyan-400/40',
    glowClass: 'shadow-cyan-500/50',
  },
  {
    name: 'Orange',
    hex: '#F97316',
    bgClass: 'bg-orange-500',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-400',
    ringClass: 'ring-orange-400/40',
    glowClass: 'shadow-orange-500/50',
  },
  {
    name: 'Fuchsia',
    hex: '#D946EF',
    bgClass: 'bg-fuchsia-500',
    textClass: 'text-fuchsia-400',
    borderClass: 'border-fuchsia-400',
    ringClass: 'ring-fuchsia-400/40',
    glowClass: 'shadow-fuchsia-500/50',
  },
  {
    name: 'Lime',
    hex: '#84CC16',
    bgClass: 'bg-lime-500',
    textClass: 'text-lime-400',
    borderClass: 'border-lime-400',
    ringClass: 'ring-lime-400/40',
    glowClass: 'shadow-lime-500/50',
  },
];

/**
 * Returns a deterministic color definition for a player based on their index in the room.
 */
export function getPlayerColor(
  playerId: string,
  playersList?: { player_id: string }[]
): PlayerColorDef {
  if (!playersList || playersList.length === 0) {
    // Fallback based on char code sum if player list is not supplied
    let hash = 0;
    for (let i = 0; i < playerId.length; i++) {
      hash += playerId.charCodeAt(i);
    }
    return PLAYER_COLOR_PALETTE[Math.abs(hash) % PLAYER_COLOR_PALETTE.length];
  }

  const idx = playersList.findIndex((p) => p.player_id === playerId);
  const paletteIdx = idx >= 0 ? idx % PLAYER_COLOR_PALETTE.length : 0;
  return PLAYER_COLOR_PALETTE[paletteIdx];
}
