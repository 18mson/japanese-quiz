---
name: japanese-quiz-architecture
description: Comprehensive architecture, directory layout, state management, module flow, and Supabase integration reference for the Japanese Quiz codebase.
---

# 🇯🇵 Japanese Quiz Repository Architecture & Context Guide

This skill provides an authoritative, complete technical overview of the **Japanese Kana & Vocab Quiz** codebase. Use this document to understand the codebase layout, state management, core algorithms, typing engines, multiplayer Battleground flow, and Supabase database schemas.

---

## 🏛️ 1. Architecture Overview

- **Frontend Core**: [Vue 3](https://vuejs.org/) (Composition API with `<script setup>`) + [TypeScript](https://www.typescriptlang.org/)
- **Build & PWA**: [Vite](https://vitejs.dev/) with `vite-plugin-pwa`
- **State Management**: [Pinia](https://pinia.vuejs.org/) (`authStore`, `quizStore`, `battlegroundStore`)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/) + [@lucide/vue](https://lucide.dev/) icons
- **Backend & Realtime Services**: [Supabase](https://supabase.com/)
  - **Database**: PostgreSQL with Row-Level Security (RLS)
  - **Realtime**: Supabase Realtime Channels (Broadcast + Presence)
  - **Edge Functions**: Deno Edge Functions (`battleground-submit`)

---

## 📁 2. Directory Layout & Module Structure

```
japanese-quiz/
├── .agents/skills/japanese-quiz-architecture/
│   └── SKILL.md                  # This skill architecture document
├── src/
│   ├── App.vue                   # Root component & main view switcher
│   ├── main.ts                   # Vue app initialization & Pinia mounting
│   ├── style.css                 # Custom Tailwind & CSS animations
│   ├── assets/                   # Audio files (correct/incorrect wav) & favicons
│   ├── components/
│   │   ├── StartScreen.vue       # Main menu & mode selection landing page
│   │   ├── BattlegroundMode.vue  # Wrapper view for Multiplayer Battleground
│   │   ├── AuthModal.vue         # Supabase Auth modal (Login/Register)
│   │   ├── LeaderboardModal.vue  # Global single-player leaderboard modal
│   │   ├── MasteryGridModal.vue  # Visual character mastery grid (46+ items)
│   │   ├── QuizQuestion.vue     # Single-player multiple choice card
│   │   ├── QuizOptions.vue      # Multiple choice option buttons
│   │   ├── QuizWordInput.vue    # Single-player keyboard typing card (Words/Kana)
│   │   ├── QuizSentenceTyping.vue # Single-player full sentence typing engine
│   │   ├── QuizResults.vue       # Single-player quiz end summary & stats
│   │   ├── QuizHeader.vue        # Quiz session header bar
│   │   ├── QuizBottomNav.vue     # Quiz navigation bar
│   │   ├── SyncConflictModal.vue # Offline vs Cloud data sync conflict modal
│   │   ├── LevelUpModal.vue      # Achievement / Level up celebration modal
│   │   ├── battleground/
│   │   │   ├── BattlegroundLobby.vue       # Multiplayer room lobby & public room list
│   │   │   ├── BattlegroundRound.vue       # Active sentence typing battle screen
│   │   │   ├── BattlegroundRoundResult.vue # Round standings & elimination summary
│   │   │   └── BattlegroundGameOver.vue    # Final match leaderboard & winner display
│   │   └── mastery/             # Mastery grid helper subcomponents
│   ├── data/
│   │   ├── hiragana.ts           # Basic, Dakuten, Yoon Hiragana items
│   │   ├── katakana.ts           # Basic, Dakuten, Yoon Katakana items
│   │   ├── words.ts              # N5 Japanese everyday vocabulary list
│   │   └── sentences.ts          # N5 Japanese sentences & romaji variants
│   ├── lib/
│   │   └── supabaseClient.ts     # Supabase client singleton setup
│   ├── services/                 # LocalStorage & sync helpers
│   ├── stores/
│   │   ├── authStore.ts          # Authentication state & user profile sync
│   │   ├── quizStore.ts          # Single-player quiz logic & adaptive algorithm
│   │   ├── battlegroundStore.ts  # Main multiplayer Battleground store
│   │   └── battleground/
│   │       ├── types.ts          # Battleground TypeScript interfaces & schemas
│   │       ├── helpers.ts        # Random sentence picking & utility helpers
│   │       └── evaluator.ts      # Host-side round evaluation & elimination logic
│   └── utils/                    # Formatting & helper functions
└── supabase/
    ├── migrations/
    │   └── 001_battleground.sql  # SQL schema, RLS policies, & indexes
    └── functions/
        └── battleground-submit/  # Deno Edge function for speed submission validation
```

---

## 🔑 3. Key Subsystems & Core Logic

### A. Single Player Quiz & Adaptive Engine (`quizStore.ts`)
1. **Weighted Question Selection**:
   - ~60% Weak & New items (`Streak 0–2` or recent errors).
   - ~30% Memory reinforcement items.
   - ~10% Long-term retention checks (`Streak 3+`).
2. **Missed Item Retry Stack**:
   - Incorrect answers are automatically appended to the end of the session queue so learners correct every mistake before completing the session.
3. **Mastery Tiers**:
   - `Streak 0`: Unlearned (Red)
   - `Streak 1–2`: Learning (Yellow)
   - `Streak 3–4`: Mastered (Green)
   - `Streak 5+`: Crown Mastered (Diamond)
4. **Time-Targeted Practice**:
   - 1 Minute (~8 Qs), 3 Minutes (~22 Qs), 5 Minutes (~35 Qs).
   - Timers are hidden during quiz to eliminate timer anxiety. Speed achievement bonuses (`⚡ Lightning Fast!`) are awarded post-quiz.

---

### B. Pro Typing Engine (`QuizSentenceTyping.vue` & `BattlegroundRound.vue`)
The typing engine uses **Wanakana** romaji parsing to convert Japanese text into matchable units:
1. **Unit Struct**:
   ```ts
   interface Unit {
     kana: string;             // e.g. "ふ"
     acceptedRomaji: string[]; // e.g. ["fu", "hu"]
   }
   ```
2. **Single Upcoming Character Prompt**:
   - To prevent visual clutter, the romaji box displays **only completed text** plus **1 single upcoming Romaji letter** (highlighted with an amber pulsing glow). Future letters are hidden.
3. **Japanese Character Progress Pointer**:
   - Live character-by-character highlighting on the Japanese text:
     - `text-emerald-400 font-extrabold`: Completed characters.
     - `text-amber-300 bg-amber-400/25 animate-pulse`: Currently active unit.
     - `text-slate-400`: Pending upcoming characters.
4. **Typing Fluidity Rules**:
   - **Auto-Skip Hyphens (`"-"`)**: If the required next character is `-`, the engine automatically advances past it without user input.
   - **Space Tolerance**: Accidental spacebar presses when space is not expected are ignored without triggering a typo error.
   - **1-Second Typo Penalty Cooldown**: Pressing an incorrect key triggers a full-screen transparent `1.0s` penalty overlay. Input is blocked for 1 second, then clears automatically so the player can resume typing.

---

### C. Multiplayer Battleground (`battlegroundStore.ts` & `src/stores/battleground/`)

#### 1. Room Settings & Capacity
- **Max Capacity**: Fixed at **8 players per room** (`max_players: 8`).
- **Privacy Modes**:
  - **Public**: Listed in the Public Rooms directory; 1-click Join.
  - **Private**: Requires a 6-character secret code (`6GVS9U`). Host can switch privacy anytime.

#### 2. Progressive Elimination Bracket (`evaluator.ts`)
Rounds dynamically eliminate the slowest/failed players down to a **2-Player Final Battle**:
- **N > 4 players**: Eliminates down to **4 survivors**.
- **N = 4 or N = 3 players**: Eliminates down to **2 survivors (Final!)**.
- **N = 2 players**: Eliminates down to **1 Champion (Game Over)**.

*Example progressions:*
- `8 Players` $\rightarrow$ Round 1 (4 survivors) $\rightarrow$ Round 2 (2 survivors Final) $\rightarrow$ Round 3 (1 Winner).
- `7 Players` $\rightarrow$ Round 1 (4 survivors) $\rightarrow$ Round 2 (2 survivors Final) $\rightarrow$ Round 3 (1 Winner).
- `3 Players` $\rightarrow$ Round 1 (2 survivors Final) $\rightarrow$ Round 2 (1 Winner).
- `2 Players` $\rightarrow$ Round 1 (1 Winner).

#### 3. Spectator Mode
- Players who are eliminated (`status === 'eliminated'`) remain in the room as spectators.
- Keyboard input is disabled, but spectators watch live typing progress, timer countdowns, and realtime standings of active players.

#### 4. Host Controls & Rematch Flow
- Host can click **"Mulai Game Lagi"** (Play Again) after a match ends.
- Leftover round submissions and rounds are deleted in the database, and room status resets to `waiting`.
- Joined players receive a popup banner allowing them to re-join the lobby or leave gracefully.

---

## 🗄️ 4. Supabase Schema & Realtime Events

### Database Tables (`supabase/migrations/001_battleground.sql`)
1. **`public.rooms`**: `id`, `code`, `host_player_id`, `status` (`waiting`, `in_progress`, `finished`), `is_public`, `max_players` (8), `current_round_num`, `used_sentence_ids`.
2. **`public.room_players`**: `room_id`, `player_id`, `player_name`, `avatar_seed`, `status` (`alive`, `eliminated`), `final_rank`, `eliminated_in_round`, `elimination_reason`.
3. **`public.rounds`**: `id`, `room_id`, `round_number`, `sentence_id`, `sentence_japanese`, `sentence_romaji_variants`, `sentence_meaning`, `status` (`preparing`, `active`, `evaluated`), `start_at`, `duration_seconds`.
4. **`public.round_submissions`**: `id`, `round_id`, `room_id`, `player_id`, `typed_input`, `completion_time_ms`, `is_valid`, `status` (`success`, `typo`, `timeout`, `disqualified`).

### Realtime Broadcast Events (`realtimeChannel`)
- `player_joined`: Broadcasted when a new player joins the lobby.
- `player_left`: Broadcasted when a player exits the room.
- `room_updated`: Broadcasted when room settings (e.g. `is_public`) change.
- `round_preparing`: Signals the 5-second pre-round countdown.
- `progress_update`: Live progress percentages of players during a round.
- `round_results`: Broadcasted by Host when a round ends (standing list & eliminations).
- `game_over`: Broadcasted when the final round ends (Winner announced).
- `room_reset`: Sent when Host resets room for a new match.
- `rejoin_prompt`: Displays rejoin popup to existing lobby members.

---

## ⚡ 5. Essential Gotchas & Developer Rules

1. **Always Use `upsert` for Round Creation**:
   - When Host creates a round in `battlegroundStore.ts`, ALWAYS use `.upsert({ ... }, { onConflict: 'room_id,round_number' })` to prevent `duplicate key value violates unique constraint` errors.
2. **Clean Leftover Data Before Room Reset**:
   - In `resetRoomForNextGame()` and `startGame()`, execute explicit `delete()` queries on `round_submissions` and `rounds` for the `room_id` prior to starting Round 1.
3. **Keep Realtime State Synchronized**:
   - Non-host clients rely on broadcast events and Supabase Postgres Changes listeners (`rooms`, `room_players`, `rounds`). Ensure subscriptions are attached in `subscribeToRoom(roomId)`.
4. **Build Verification**:
   - Before completing tasks, always run `npx vue-tsc --noEmit` and `npm run build` to guarantee zero TypeScript or Vite compilation errors.
