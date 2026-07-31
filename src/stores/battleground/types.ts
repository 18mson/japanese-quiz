// src/stores/battleground/types.ts

export type PlayerStatus = 'alive' | 'eliminated' | 'spectator';
export type RoomStatus = 'waiting' | 'in_progress' | 'finished';
export type RoundStatus = 'preparing' | 'active' | 'evaluating' | 'completed';
export type SubmissionStatus = 'success' | 'typo' | 'disqualified' | 'timeout' | 'pending';

export type GamePhase =
  | 'idle'
  | 'lobby'
  | 'round_preparing'
  | 'round_active'
  | 'round_result'
  | 'game_over';

export interface RoomPlayer {
  id: string;
  room_id: string;
  player_id: string;
  player_name: string;
  avatar_seed: string | null;
  status: PlayerStatus;
  eliminated_in_round: number | null;
  elimination_reason: string | null;
  final_rank: number | null;
  joined_at: string;
}

export interface RoundSentenceItem {
  id: string;
  japanese: string;
  romaji_variants: string[][];
  word_spans?: number[] | null;
  meaning: string;
}

export interface ActiveRound {
  id: string;
  room_id: string;
  round_number: number;
  sentence_id: string;
  sentence_japanese: string;
  sentence_romaji_variants: string[][];
  sentence_word_spans: number[] | null;
  sentence_meaning: string | null;
  status: RoundStatus;
  start_at: string | null;
  duration_seconds: number;
  sentences?: RoundSentenceItem[];
}

export interface EliminatedPlayerInfo {
  playerId: string;
  playerName?: string;
  reason: string;
  rank?: number;
}

export interface RoundStanding {
  playerId: string;
  completionTimeMs: number;
  status: string;
  completedSentences?: number;
  totalSentences?: number;
  progressPercentage?: number;
}

export interface RoundResultPayload {
  roundNumber: number;
  eliminatedPlayers: EliminatedPlayerInfo[];
  survivorPlayerIds: string[];
  roundStandings: RoundStanding[];
  isGameOver: boolean;
  nextRoundInSeconds: number;
  isDraw?: boolean;
  drawReason?: string;
}

export interface GameOverPayload {
  winnerPlayerId: string | null;
  finalRoundNumber: number;
  eliminatedPlayers: EliminatedPlayerInfo[];
  roundStandings: RoundStanding[];
  isDraw?: boolean;
  drawReason?: string;
}

export interface PlayerProgress {
  playerId: string;
  charIndex: number;
  totalChars: number;
  progressPercentage: number;
}

export interface PublicRoomItem {
  id: string;
  code: string;
  host_player_id: string;
  host_name: string;
  max_players: number;
  player_count: number;
  created_at: string;
}
