# 🇯🇵 Japanese Kana & Vocab Quiz App

A modern, interactive, and intelligent web application designed to help learners master **Japanese Hiragana**, **Katakana**, and **N5 Everyday Vocabulary** through adaptive spaced repetition, visual mastery tracking, and time-targeted practice sessions.

---

## ✨ Features & Highlights

### 📊 1. Visual Character Mastery Grid (Peta Penguasaan Huruf)
- **Interactive Matrix**: View all 46+ Hiragana, Katakana, and N5 Vocabulary items in a visual grid map with color-coded mastery tiers:
  - 🔴 **Belum Dipelajari (Streak 0)**: Unlearned or new characters.
  - 🟡 **Sedang Dipelajari (Streak 1–2)**: In-progress items needing practice.
  - 🟢 **Sudah Dikuasai (Streak 3–4)**: Mastered items (unlocks new lessons).
  - 💎 **Crown Mastered (Streak 5+)**: Perfect recall status.
- **Filter & Quick Review**: Filter by character sub-type (*Basic, Dakuten, Combination, Lesson 1 & 2*) or status, and launch **Weak Items Practice** instantly with one click.

### 🧠 2. Smart Adaptive Engine (Algoritma Kuis Cerdas Terbobot)
- **Dynamic Question Balancing**: Questions are no longer purely random. The algorithm dynamically composes each session:
  - 🔴 **~60% Weak & New Items**: Focuses on characters with lowest streaks or recent errors.
  - 🟡 **~30% Memory Reinforcement**: Reviews items currently in progress.
  - 🟢 **~10% Retention Check**: Tests mastered items for long-term memory.
  - 🔁 **Missed Item Retry Stack**: Answers marked incorrect are automatically pushed to the end of the session queue so learners review and correct every single mistake before finishing!
- **Question Reason Badges**: Transparency badges on every question card explaining *why* the item was selected (e.g. `🔴 Fokus Latihan`, `🟡 Penguatan Memori`, `🟢 Uji Retensi`, `🔁 Ulang (Jawaban Salah Sebelumnya)`).

### 👑 3. All-Mastered Maintenance Mode
- Automatically detects when **100% of characters** in a category reach Mastered status (`Streak >= 3`).
- Switches seamlessly to **Random Polish Mode** with a special visual banner: `👑 ALL MASTERED — Mode Pengulangan Acak`.

### ⏱️ 4. Silent Time-Targeted Sessions (Zero-Stress UX)
- Select target session durations:
  - ⚡ **1 Minute (Sesi Kilat)** ~ 8 Questions
  - 🔥 **3 Minutes (Sesi Fokus)** ~ 22 Questions
  - 🏆 **5 Minutes (Sesi Maraton)** ~ 35 Questions
- **Zero Timer Anxiety**: Timers are hidden during the quiz so users can focus on learning calmly.
- **Speed Achievement Surprise**: Complete a session faster than estimated target to earn bonus speed points and unlock achievement ranks (`⚡ Lightning Fast!`, `🚀 Speed Demon!`).

### ⚔️ 5. Typing Battleground (Multiplayer Battle Royale Mode)
- **Realtime Multiplayer Rooms (2–8 Pemain)**: Mainkan kuis mengetik kalimat Jepang secara multiplayer hingga **maksimal 8 pemain dalam 1 room** berbasis Supabase Realtime broadcast.
- **Public & Private Room System**:
  - **Public Room**: Ditampilkan pada daftar *Public Rooms* yang dapat langsung di-join oleh pemain lain dengan 1-klik.
  - **Private Room**: Memerlukan 6-digit Kode Room rahasia untuk bergabung.
  - **Host Controls**: Host dapat mengubah status Private/Public kapan saja serta me-reset room untuk **Mulai Game Lagi** (dengan popup konfirmasi re-join ke seluruh peserta).
- **Progressive Tournament Elimination Bracket**:
  - Sistem eliminasi bertahap otomatis hingga menyisakan **Babak Final 2 Pemain**:
    - **8 Pemain**: Ronde 1 (8 $\rightarrow$ 4) $\rightarrow$ Ronde 2 (4 $\rightarrow$ 2 Final) $\rightarrow$ Ronde 3 (2 $\rightarrow$ 1 Juara).
    - **7 Pemain**: Ronde 1 (7 $\rightarrow$ 4) $\rightarrow$ Ronde 2 (4 $\rightarrow$ 2 Final) $\rightarrow$ Ronde 3 (2 $\rightarrow$ 1 Juara).
    - **3 Pemain**: Ronde 1 (3 $\rightarrow$ 2 Final) $\rightarrow$ Ronde 2 (2 $\rightarrow$ 1 Juara).
    - **2 Pemain**: Ronde 1 (2 $\rightarrow$ 1 Juara).
- **Pro Typing Engine & Fluid UX**:
  - 🎯 **Single Upcoming Character Prompt**: Hanya 1 huruf romaji berikutnya yang akan ditampilkan (mencegah distrasi visual).
  - 🇯🇵 **Japanese Character Pointer**: Highlight huruf Jepang per-karakter secara *real-time* (Hijau = Selesai, Emas Berkedip = Sedang Diketik, Abu-abu = Belum Diketik).
  - ⚠️ **1-Second Typo Penalty Cooldown**: Jika terjadi kesalahan ketik (*typo*), layar akan menampilkan *overlay* penalti transparan `1.0s` dan tidak langsung membuat pemain gugur.
  - ⏩ **Auto-Skip Hyphen (`"-"`) & Space Tolerance**: Tanda hubung otomatis dilompati dan spasi tidak akan memicu error typo secara tidak sengaja.
- **Spectator Mode (Layar Penonton)**: Pemain yang telah tereliminasi tetap berada di dalam room dan dapat menyaksikan pertandingan pemain lain secara *live*.

### 🎮 6. Flexible Single Player Game Modes
- **Multiple Choice (Basic Level)**: Practice reading Hiragana and Katakana by choosing from standard multiple-choice Romaji options.
- **Keyboard Typing (Road to N5)**: Direct keyboard input for Hiragana, Katakana, and **Everyday Words**. *(Everyday Words mode is exclusive to Keyboard Typing mode to encourage direct recall).*

### 🏆 7. Global Leaderboard & User Authentication
- **Supabase Integration**: Synchronizes user streaks and leaderboard rankings online.
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
