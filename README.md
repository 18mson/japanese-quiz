# 🇯🇵 Japanese Kana & Vocab Quiz App

A modern, interactive, and intelligent web application designed to help learners master **Japanese Hiragana**, **Katakana**, and **N5 Everyday Vocabulary** through adaptive spaced repetition, visual mastery tracking, multiplayer battle royale games, and time-targeted practice sessions.

---

## ✨ Features & Highlights

### 📊 1. Visual Character Mastery Grid
- **Interactive Matrix**: View all 46+ Hiragana, Katakana, and N5 Vocabulary items in a visual grid map with color-coded mastery tiers:
  - 🔴 **Unlearned (Streak 0)**: Unlearned or brand new items.
  - 🟡 **Learning (Streak 1–2)**: In-progress items needing practice.
  - 🟢 **Mastered (Streak 3–4)**: Mastered items (unlocking new lesson tiers).
  - 💎 **Crown Mastered (Streak 5+)**: Perfect recall status.
- **Filter & Quick Review**: Filter by character sub-type (*Basic, Dakuten, Combination, Lesson 1 & 2*) or status, and launch **Weak Items Practice** instantly with one click.

### 🧠 2. Smart Adaptive Engine
- **Dynamic Question Balancing**: Questions are no longer purely random. The algorithm dynamically composes each session:
  - 🔴 **~60% Weak & New Items**: Focuses on characters with lowest streaks or recent errors.
  - 🟡 **~30% Memory Reinforcement**: Reviews items currently in progress.
  - 🟢 **~10% Retention Check**: Tests mastered items for long-term memory.
  - 🔁 **Missed Item Retry Stack**: Incorrectly answered items are automatically pushed to the end of the session queue so learners review and correct every single mistake before completing the quiz!
- **Question Context Badges**: Transparency badges on every question card explaining *why* the item was selected (e.g., `🔴 Practice Focus`, `🟡 Memory Reinforcement`, `🟢 Retention Test`, `🔁 Retry Incorrect`).

### 👑 3. All-Mastered Maintenance Mode
- Automatically detects when **100% of characters** in a category reach Mastered status (`Streak >= 3`).
- Switches seamlessly to **Random Polish Mode** with a special visual banner: `👑 ALL MASTERED — Random Polish Mode`.

### ⏱️ 4. Silent Time-Targeted Sessions (Zero-Stress UX)
- Select target session durations:
  - ⚡ **1 Minute (Speed Session)** ~ 8 Questions
  - 🔥 **3 Minutes (Focus Session)** ~ 22 Questions
  - 🏆 **5 Minutes (Marathon Session)** ~ 35 Questions
- **Zero Timer Anxiety**: Timers are hidden during the quiz so users can focus on learning calmly.
- **Speed Achievement Bonus**: Complete a session faster than the estimated target to earn bonus speed points and unlock achievement badges (`⚡ Lightning Fast!`, `🚀 Speed Demon!`).

### ⚔️ 5. Typing Battleground (Multiplayer Battle Royale Mode)
- **Realtime Multiplayer Rooms (2–8 Players)**: Compete against other learners in a Japanese sentence typing Battle Royale with up to **8 players per room**, powered by Supabase Realtime broadcast.
- **Public & Private Room System**:
  - **Public Rooms**: Displayed on the live *Public Rooms* directory for instant 1-click joining.
  - **Private Rooms**: Accessible only via a secret 6-character Room Code.
  - **Host Controls**: Host can toggle privacy settings anytime and reset rooms to **Play Again** (triggering interactive re-join prompts for all participants).
- **Progressive Tournament Elimination Bracket**:
  - Automatic elimination system that scales down dynamically to a **2-Player Final Battle**:
    - **8 Players**: Round 1 (8 $\rightarrow$ 4) $\rightarrow$ Round 2 (4 $\rightarrow$ 2 Final) $\rightarrow$ Round 3 (2 $\rightarrow$ 1 Champion).
    - **7 Players**: Round 1 (7 $\rightarrow$ 4) $\rightarrow$ Round 2 (4 $\rightarrow$ 2 Final) $\rightarrow$ Round 3 (2 $\rightarrow$ 1 Champion).
    - **3 Players**: Round 1 (3 $\rightarrow$ 2 Final) $\rightarrow$ Round 2 (2 $\rightarrow$ 1 Champion).
    - **2 Players**: Round 1 (2 $\rightarrow$ 1 Champion).
- **Pro Typing Engine & Fluid UX**:
  - 🎯 **Single Upcoming Character Prompt**: Displays only 1 upcoming Romaji letter at a time to prevent screen clutter.
  - 🇯🇵 **Japanese Character Pointer**: Live character-by-character highlighting on the Japanese text (Green = Completed, Pulsing Gold = Active, Slate = Pending).
  - ⚠️ **1-Second Typo Penalty Cooldown**: Typos trigger a full-screen transparent `1.0s` penalty cooldown overlay instead of instant elimination, giving players a chance to recover.
  - ⏩ **Auto-Skip Hyphens (`"-"`) & Space Tolerance**: Hyphens are automatically skipped, and accidental spacebar presses do not trigger typo penalties.
- **Spectator Mode**: Eliminated players seamlessly remain in the room to watch the remaining competitors race to victory live.

### 🎮 6. Flexible Single Player Game Modes
- **Multiple Choice (Basic Level)**: Practice reading Hiragana and Katakana by choosing from standard multiple-choice Romaji options.
- **Keyboard Typing (Road to N5)**: Direct keyboard input for Hiragana, Katakana, and **Everyday Words**. *(Everyday Words mode is exclusive to Keyboard Typing mode to encourage direct recall).*

### 🏆 7. Global Leaderboard & User Authentication
- **Supabase Integration**: Synchronizes user streaks, match records, and leaderboard rankings online.
- **Speed & Cumulative Leaderboards**: Track top-performing speed runs and total cumulative scores.

---

## 🛠️ Technology Stack

- **Frontend Core**: [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/) + PWA support (`vite-plugin-pwa`)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Styling & Icons**: [Tailwind CSS](https://tailwindcss.com/) + [@lucide/vue](https://lucide.dev/)
- **Database, Auth & Realtime**: [Supabase](https://supabase.com/) (PostgreSQL + Realtime Broadcast & Presence + Edge Functions)

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+`
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/18mson/japanese-quiz.git
cd japanese-quiz

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Development
```bash
# Run local dev server
npm run dev
```

### Production Build
```bash
# Type check and build production bundle
npm run build

# Preview build locally
npm run preview
```

---

## 📄 License
Distributed under the MIT License.
