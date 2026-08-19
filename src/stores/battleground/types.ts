// src/stores/battleground/types.ts

export type GameMode = 'battleground' | 'quiz_blitz';
export type QuizCategory = 'hiragana' | 'katakana' | 'mix' | 'kotoba_kanji';

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

export type PowerUpType = 'freeze' | 'backward' | 'storm';

export interface PowerUpBroadcastPayload {
  senderId: string;
  senderName: string;
  type: PowerUpType;
  targetPlayerIds?: string[];
  sentAt?: number;
}

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
  score?: number;
}

export interface RoundSentenceItem {
  id: string;
  japanese: string;
  romaji_variants: string[][];
  word_spans?: number[] | null;
  meaning: string;
}

export interface QuizBlitzQuestion {
  id: string;
  prompt: string;          // Character, Kanji, or Word (e.g. "猫" or "あ")
  subPrompt?: string;      // Reading hint if any (e.g. "ねこ")
  promptType: 'character' | 'word' | 'kanji';
  questionText: string;    // "Pilih romaji yang tepat" / "Pilih arti bahasa Indonesia yang tepat"
  options: string[];       // 4–6 options
  correctOptionIndex: number;
  correctAnswer: string;
  meaning?: string;
  category: QuizCategory;
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
  question_data?: QuizBlitzQuestion | null;
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
  score?: number;
  correctChars?: number;
  wrongChars?: number;
}

export interface QuizBlitzScoreItem {
  playerId: string;
  playerName: string;
  avatarSeed: string | null;
  previousScore: number;
  pointsAdded: number;
  newScore: number;
  rank: number;
  previousRank: number;
  isCorrect: boolean;
  answerTimeMs: number;
  isCurrentUser?: boolean;
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
  quizBlitzScores?: QuizBlitzScoreItem[];
}

export interface GameOverPayload {
  winnerPlayerId: string | null;
  finalRoundNumber: number;
  eliminatedPlayers: EliminatedPlayerInfo[];
  roundStandings: RoundStanding[];
  isDraw?: boolean;
  drawReason?: string;
  quizBlitzScores?: QuizBlitzScoreItem[];
}

export interface PlayerProgress {
  playerId: string;
  charIndex?: number;
  totalChars?: number;
  sentenceIndex?: number;
  activeUnitIndex?: number;
  completedSentences?: number;
  totalSentences?: number;
  progressPercentage: number;
  correctChars?: number;
  wrongChars?: number;
  playerColor?: string;
}

export interface PublicRoomItem {
  id: string;
  code: string;
  host_player_id: string;
  host_name: string;
  max_players: number;
  player_count: number;
  created_at: string;
  game_mode?: GameMode;
  quiz_category?: QuizCategory;
}

