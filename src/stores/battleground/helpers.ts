// src/stores/battleground/helpers.ts

import { sentencesData, type SentenceItem } from '../../data/sentences';

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function pickRandomSentence(usedIds: string[]): SentenceItem | null {
  const available = sentencesData.filter(s => !usedIds.includes(s.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

export function getGuestId(): string {
  let id = localStorage.getItem('battleground_guest_id');
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem('battleground_guest_id', id);
  }
  return id;
}

export function getGuestName(): string {
  return localStorage.getItem('battleground_guest_name') || 'Player';
}

export function validateRomaji(typedInput: string, romajiVariants: string[][]): boolean {
  if (!typedInput || !romajiVariants?.length) return false;
  
  function buildValid(units: string[][], idx: number, current: string): boolean {
    if (idx >= units.length) return current === typedInput;
    for (const r of units[idx]) {
      if (buildValid(units, idx + 1, current + r)) return true;
    }
    return false;
  }
  
  return buildValid(romajiVariants, 0, '');
}
