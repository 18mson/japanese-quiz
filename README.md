# 🇯🇵 Nihongo Master: Typing & Vocab Battleground

A modern, interactive, and intelligent web application designed to help learners master **Japanese Hiragana**, **Katakana**, **N5 Everyday Vocabulary**, and **Full Sentence Typing** through adaptive spaced repetition, visual mastery tracking, multiplayer battle royale games, keyboard-first navigation, custom themes, and time-targeted practice sessions.

---

## ✨ Features & Highlights

### ℹ️ 1. Interactive About Page & Mode Guide
- **Comprehensive Guide Modal**: Integrated *About & Mode Guide* modal accessible directly from the app header bar or `#about` route.
- **Fun Learning Philosophy**: Designed to make Japanese learning enjoyable, engaging, and stress-free without timer anxiety.
- **Detailed Mechanics & Rules Breakdown**: Instant access to rules, mechanisms, character highlighting, typing penalty explanations, and multiplayer elimination bracket rules.

### 📊 2. Visual Character Mastery Grid
- **Interactive Matrix**: View all 46+ Hiragana, Katakana, and N5 Vocabulary items in a visual grid map with color-coded mastery tiers:
  - 🔴 **Unlearned (Streak 0)**: Unlearned or brand new items.
  - 🟡 **Learning (Streak 1–2)**: In-progress items needing practice.
  - 🟢 **Mastered (Streak 3–4)**: Mastered items (unlocking new lesson tiers).
  - 💎 **Crown Mastered (Streak 5+)**: Perfect recall status.
- **Filter & Quick Review**: Filter by character sub-type (*Basic, Dakuten, Combination, Lesson 1 & 2*) or status, and launch **Weak Items Practice** instantly with one click.

### 🧠 3. Smart Adaptive Engine
- **Dynamic Question Balancing**: Questions are dynamically composed based on individual progress:
  - 🔴 **~60% Weak & New Items**: Focuses on characters with lowest streaks or recent errors.
  - 🟡 **~30% Memory Reinforcement**: Reviews items currently in progress.
  - 🟢 **~10% Retention Check**: Tests mastered items for long-term memory.
  - 🔁 **Missed Item Retry Stack**: Incorrectly answered items are automatically pushed to the end of the session queue so learners review and correct every single mistake before completing the quiz!
- **Question Context Badges**: Transparency badges on every question card explaining *why* the item was selected (e.g., `🔴 Practice Focus`, `🟡 Memory Reinforcement`, `🟢 Retention Test`, `🔁 Retry Incorrect`).

### 👑 4. All-Mastered Maintenance Mode
- Automatically detects when **100% of characters** in a category reach Mastered status (`Streak >= 3`).
- Switches seamlessly to **Random Polish Mode** with a special visual banner: `👑 ALL MASTERED — Random Polish Mode`.

### ⏱️ 5. Silent Time-Targeted Sessions (Zero-Stress UX)
- Select target session durations:
  - ⚡ **1 Minute (Speed Session)** ~ 8 Questions / 4 Sentences
  - 🔥 **3 Minutes (Focus Session)** ~ 22 Questions / 10 Sentences
  - 🏆 **5 Minutes (Marathon Session)** ~ 35 Questions / 16 Sentences
- **Zero Timer Anxiety**: Timers are hidden during the quiz so users can focus on learning calmly.
- **Speed Achievement Bonus**: Complete a session faster than the estimated target to earn bonus speed points and unlock achievement badges (`⚡ Lightning Fast!`, `🚀 Speed Demon!`).

### 🎮 6. Flexible Single-Player Game Modes & Mix Mode
1. **Multiple Choice (Basic Level)**: Practice reading Hiragana, Katakana, or **Mix Mode** (combined Hiragana + Katakana) with standard multiple-choice Romaji options.
2. **Keyboard Typing (Kana Typing)**: Direct keyboard input for Hiragana, Katakana, and **Mix Mode** with accuracy checking.
3. **Sentence Typing (Full N5 Words & Sentences)**: Real-time full N5 Japanese word and sentence typing powered by Wanakana parsing.
   - 🎯 **Single Upcoming Character Prompt**: Displays only 1 upcoming Romaji letter at a time to prevent visual clutter.
   - 🇯🇵 **Japanese Character Pointer**: Live character-by-character highlighting on the Japanese text (*Emerald = Completed*, *Pulsing Amber = Active*, *Slate = Pending*).
   - ⚠️ **1-Second Typo Penalty Cooldown**: Incorrect key presses lock input for 1.0 second to teach accuracy.
   - ⏩ **Auto-Skip Hyphens (`"-"`) & Space Tolerance**: Hyphens are automatically skipped, and accidental spacebar presses do not trigger typo penalties.

### ⌨️ 7. Full Keyboard Navigation & Disk Wheel Selector
- **Mouse-Free Menu Controls**: Complete keyboard accessibility supporting `Tab` / `Shift+Tab` to switch sections, `Arrow Up / Down` to spin the disk wheel selector, `Arrow Left / Right` for sub-types and durations, and `Enter` to select or start.
- **Vinyl Disk Wheel UI**: Interactive mode selector styled with smooth spin animations and visual feedback.

### 🎨 8. Theme Customization & Ergonomic Settings
- **Dark, Light & Auto Themes**: Instant toggling between Dark Mode, Light Mode, and System Default (`auto`) preferences, stored persistently in settings.
- **Virtual Keyboard Height Adjustments**: Toggle virtual keyboard height between **Short** and **Tall** modes for optimized mobile and desktop typing ergonomics.

### 🎵 9. Immersive Audio & Background Lobby Music
- **Ambient Battleground Music**: Immersive background lobby soundtrack during multiplayer preparation.
- **Sound Effects**: Audio feedback for correct/incorrect answers, roulette tick sounds on selection, and single-click sound toggles.

### ⚔️ 10. Online Multiplayer Typing Battleground
- **Realtime Multiplayer Rooms (2–8 Players)**: Compete against other learners in a Japanese sentence typing Battle Royale with up to **8 players per room**, powered by Supabase Realtime broadcast & presence.
- **Public & Private Room System**:
  - **Public Rooms**: Displayed on the live *Public Rooms* directory for instant 1-click joining.
  - **Private Rooms**: Accessible only via a secret 6-character Room Code.
  - **Host Controls**: Host can toggle privacy settings anytime and reset rooms to **Play Again** (triggering interactive re-join prompts for all participants).
- **Progressive Tournament Elimination Bracket**:
  - Automatic elimination system scaling down dynamically to a **2-Player Final Battle**:
    - **8 Players**: Round 1 (8 $\rightarrow$ 4) $\rightarrow$ Round 2 (4 $\rightarrow$ 2 Final) $\rightarrow$ Round 3 (2 $\rightarrow$ 1 Champion).
    - **7 Players**: Round 1 (7 $\rightarrow$ 4) $\rightarrow$ Round 2 (4 $\rightarrow$ 2 Final) $\rightarrow$ Round 3 (2 $\rightarrow$ 1 Champion).
    - **3 Players**: Round 1 (3 $\rightarrow$ 2 Final) $\rightarrow$ Round 2 (2 $\rightarrow$ 1 Champion).
    - **2 Players**: Round 1 (2 $\rightarrow$ 1 Champion).
- **Active Player Markers & Spectator Mode**: Distinct color-coded player markers, active status indicators, and live spectator views for eliminated participants.

### 🏆 11. Global Leaderboard & User Authentication
- **Supabase Integration**: Synchronizes user streaks, match records, and leaderboard rankings online across devices.
- **Speed & Cumulative Leaderboards**: Track top-performing speed runs and total cumulative scores.

---

## 🛠️ Technology Stack

- **Frontend Core**: [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/) + PWA support (`vite-plugin-pwa`)
- **State Management**: [Pinia](https://pinia.vuejs.org/) (`authStore`, `quizStore`, `battlegroundStore`, `settingsStore`)
- **Styling & Icons**: [Tailwind CSS](https://tailwindcss.com/) (with dark mode class support) + [@lucide/vue](https://lucide.dev/)
- **Japanese Romaji Parsing**: [WanaKana](https://wanakana.com/)
- **Database, Auth & Realtime**: [Supabase](https://supabase.com/) (PostgreSQL + Realtime Broadcast & Presence + Deno Edge Functions)

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

### Type Checking & Production Build
```bash
# Run TypeScript type check
npx vue-tsc --noEmit

# Build production bundle
npm run build

# Preview build locally
npm run preview
```

---

## 👨‍💻 Author & Developer

Crafted with ❤️ by **Muhamad Son'ani**:
- 🌐 **GitHub**: [@18mson](https://github.com/18mson)
- 🇯🇵 **Project**: [Nihongo Master](https://github.com/18mson/japanese-quiz)

---

## 📄 License
Distributed under the MIT License.
