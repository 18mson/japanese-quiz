<script setup lang="ts">
import { computed } from 'vue';
import { useQuizStore } from '../../stores/quizStore';

const quizStore = useQuizStore();

// Tentukan mode aktif berdasarkan activeQuestionType
const activeDoodleMode = computed<'indonesia' | 'japan' | 'romaji'>(() => {
  const qType = quizStore.activeQuestionType;
  if (qType === 'words_meaning') {
    return 'indonesia';
  }
  if (qType === 'meaning_to_words') {
    return 'japan';
  }
  return 'romaji';
});
</script>

<template>
  <div 
    class="fixed inset-0 top-[59px] pointer-events-none overflow-hidden select-none z-0 transition-opacity duration-700 ease-in-out"
    aria-hidden="true"
  >
    <!-- ============================================================ -->
    <!-- THEME 1: INDONESIA (Mode: words_meaning / Input Arti Indonesia) -->
    <!-- Nuansa: Merah-Putih Nusantara, Monas, Garuda, Candi, Batik    -->
    <!-- ============================================================ -->
    <transition name="doodle-fade">
      <div 
        v-if="activeDoodleMode === 'indonesia'"
        key="doodle-indonesia"
        class="absolute inset-0 w-full h-full"
      >
        <!-- Soft Ambient Radial Glows (Nuansa Merah Hangat) -->
        <div class="absolute -top-10 -left-16 w-96 h-96 rounded-full bg-rose-500/10 dark:bg-rose-600/15 blur-3xl"></div>
        <div class="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-red-500/8 dark:bg-rose-500/10 blur-3xl"></div>
        <div class="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full bg-rose-400/8 dark:bg-red-700/10 blur-3xl"></div>

        <!-- SVG Doodle Canvas -->
        <svg 
          class="w-full h-full opacity-40 dark:opacity-35 transition-all duration-700" 
          viewBox="0 0 1000 700" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMin slice"
        >
          <!-- 1. Bendera Merah Putih (Kiri Atas) -->
          <g transform="translate(60, 95) scale(0.95)" class="text-rose-600 dark:text-rose-400">
            <!-- Tiang Bendera -->
            <path d="M10 5 V110" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
            <circle cx="10" cy="5" r="4" fill="currentColor" opacity="0.8"/>
            <!-- Kibaran Bendera Merah Putih -->
            <path d="M12 10 C35 3, 50 18, 75 10 C85 8, 92 12, 95 14 V42 C75 48, 55 35, 35 42 C22 45, 15 42, 12 40 Z" fill="#E11D48" opacity="0.85" />
            <path d="M12 40 C35 34, 55 46, 75 40 C85 38, 92 41, 95 42 V70 C75 76, 55 64, 35 70 C22 73, 15 70, 12 68 Z" fill="#FFFFFF" stroke="#E11D48" stroke-width="1.5" opacity="0.9" />
            <!-- Tali Tiang -->
            <path d="M10 75 L10 105" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2" opacity="0.4"/>
            <!-- Label Teks ID -->
            <rect x="25" y="76" width="30" height="16" rx="4" fill="#E11D48" fill-opacity="0.15" stroke="#E11D48" stroke-width="1" />
            <text x="40" y="88" font-size="10" font-weight="900" fill="#E11D48" text-anchor="middle" font-family="sans-serif">ID</text>
          </g>

          <!-- 2. Monas (Kanan Atas) -->
          <g transform="translate(860, 90) scale(0.9)" class="text-rose-600 dark:text-rose-400">
            <!-- Lidah Api Emas Kemerdekaan -->
            <path d="M35 15 C33 7, 39 3, 40 0 C41 4, 47 7, 45 15 C47 18, 43 24, 40 25 C37 24, 33 18, 35 15 Z" fill="#F59E0B" opacity="0.8" />
            <!-- Cawan / Pelataran Puncak -->
            <rect x="30" y="25" width="20" height="5" rx="1.5" fill="currentColor" opacity="0.7"/>
            <!-- Tiang Obelisk Monas -->
            <path d="M36 30 L34 110 H46 L44 30 Z" stroke="currentColor" stroke-width="2.5" fill="currentColor" fill-opacity="0.15" />
            <!-- Cawan Bawah -->
            <path d="M22 110 L26 122 H54 L58 110 Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.2"/>
            <!-- Dasar Struktur / Museum -->
            <rect x="12" y="122" width="56" height="14" rx="2" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
            <line x1="8" y1="136" x2="72" y2="136" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
          </g>

          <!-- 3. Siluet Burung Garuda / Sayap Kemerdekaan (Kiri Tengah) -->
          <g transform="translate(45, 335) scale(0.85)" class="text-rose-600 dark:text-rose-400" opacity="0.75">
            <!-- Sayap Kiri -->
            <path d="M50 45 C35 30, 15 25, 0 32 C12 42, 25 50, 42 52 C28 58, 12 58, 2 68 C16 72, 30 74, 45 70 C32 80, 20 86, 12 98 C28 98, 40 90, 50 82" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
            <!-- Perisai Dada -->
            <path d="M50 40 Q62 40 68 50 Q68 75 50 90 Q32 75 32 50 Q38 40 50 40 Z" fill="#E11D48" fill-opacity="0.2" stroke="currentColor" stroke-width="2" />
            <path d="M50 45 V85 M35 62 H65" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2" opacity="0.5"/>
            <!-- Sayap Kanan -->
            <path d="M50 45 C65 30, 85 25, 100 32 C88 42, 75 50, 58 52 C72 58, 88 58, 98 68 C84 72, 70 74, 55 70 C68 80, 80 86, 88 98 C72 98, 60 90, 50 82" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
          </g>

          <!-- 4. Candi / Stupa Borobudur (Kanan Tengah) -->
          <g transform="translate(870, 325) scale(0.9)" class="text-rose-600 dark:text-rose-400">
            <!-- Pucuk Spire -->
            <path d="M45 10 V32" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            <!-- Kubah Utama Stupa -->
            <path d="M22 68 C20 48, 30 32, 45 32 C60 32, 70 48, 68 68 Z" stroke="currentColor" stroke-width="2.5" fill="currentColor" fill-opacity="0.12"/>
            <!-- Lubang Belah Ketupat Stupa (Perforations) -->
            <rect x="42" y="42" width="6" height="6" transform="rotate(45 45 45)" fill="currentColor" opacity="0.7"/>
            <rect x="32" y="52" width="5" height="5" transform="rotate(45 34.5 54.5)" fill="currentColor" opacity="0.6"/>
            <rect x="52" y="52" width="5" height="5" transform="rotate(45 54.5 54.5)" fill="currentColor" opacity="0.6"/>
            <!-- Kaki Undakan -->
            <rect x="15" y="68" width="60" height="8" rx="2" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
            <rect x="10" y="76" width="70" height="9" rx="2" stroke="currentColor" stroke-width="2" fill="none" opacity="0.8"/>
          </g>

          <!-- 5. Motif Batik Mega Mendung (Bawah Kiri) -->
          <g transform="translate(80, 565) scale(0.9)" class="text-rose-600 dark:text-rose-400" opacity="0.65">
            <path d="M10 40 Q25 15, 55 25 Q80 5, 110 20 Q135 10, 155 35 Q180 30, 195 50 Q160 55, 130 50 Q90 60, 50 50 Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.08" />
            <path d="M30 40 Q45 28, 70 34 Q90 22, 115 32 Q135 28, 150 45" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.5"/>
          </g>

          <!-- 6. Kompas Khatulistiwa & Buku Kamus (Bawah Kanan) -->
          <g transform="translate(840, 545) scale(0.85)" class="text-rose-600 dark:text-rose-400">
            <!-- Kompas Mata Angin -->
            <circle cx="50" cy="50" r="32" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3" opacity="0.5"/>
            <!-- Jarum Kompas (Utara Merah) -->
            <polygon points="50,22 55,50 50,45 45,50" fill="#E11D48" opacity="0.85"/>
            <polygon points="50,78 55,50 50,55 45,50" fill="currentColor" opacity="0.3"/>
            <!-- Huruf U / N (Utara) -->
            <text x="50" y="16" font-size="11" font-weight="900" fill="#E11D48" text-anchor="middle" font-family="sans-serif">U</text>
            <!-- Label Kamus ID -->
            <path d="M20 95 L40 85 L60 95 L80 85 V110 L60 120 L40 110 L20 120 Z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1"/>
          </g>

          <!-- 7. Aksen Kata Tipis Mengambang -->
          <g class="font-sans font-black select-none pointer-events-none" fill="#E11D48" fill-opacity="0.12">
            <text x="220" y="155" font-size="28" letter-spacing="4">INDONESIA</text>
            <text x="730" y="275" font-size="22" letter-spacing="3">ARTI KATA</text>
            <text x="260" y="635" font-size="20" letter-spacing="2">NUSANTARA</text>
          </g>
        </svg>
      </div>
    </transition>

    <!-- ============================================================ -->
    <!-- THEME 2: JEPANG (Mode: meaning_to_words / Input Kanji/Kana)   -->
    <!-- Nuansa: Torii Gate, Gunung Fuji, Sakura, Pagoda, Hinomaru     -->
    <!-- ============================================================ -->
    <transition name="doodle-fade">
      <div 
        v-if="activeDoodleMode === 'japan'"
        key="doodle-japan"
        class="absolute inset-0 w-full h-full"
      >
        <!-- Soft Ambient Radial Glows (Nuansa Torii Vermilion & Sakura) -->
        <div class="absolute -top-10 -left-16 w-96 h-96 rounded-full bg-torii/12 dark:bg-torii/18 blur-3xl"></div>
        <div class="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-pink-500/10 dark:bg-pink-600/12 blur-3xl"></div>
        <div class="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-amber-500/10 dark:bg-amber-600/12 blur-3xl"></div>

        <!-- SVG Doodle Canvas -->
        <svg 
          class="w-full h-full opacity-45 dark:opacity-40 transition-all duration-700" 
          viewBox="0 0 1000 700" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMin slice"
        >
          <!-- 1. Gerbang Torii Shinto (Kiri Atas) -->
          <g transform="translate(60, 95) scale(0.95)" class="text-torii dark:text-torii-light">
            <!-- Kasagi / Palang Atas Melengkung -->
            <path d="M5 20 C35 12, 75 12, 105 20 L102 27 C75 20, 35 20, 8 27 Z" fill="#E05A47" />
            <!-- Shimaki / Balok Kedua -->
            <rect x="16" y="27" width="78" height="6" rx="1" fill="#E05A47" opacity="0.9" />
            <!-- Tablet Gakuzuka Tengah -->
            <rect x="50" y="33" width="10" height="15" rx="1" fill="#B91C1C" stroke="currentColor" stroke-width="1"/>
            <!-- Nuki / Palang Tengah Tembus -->
            <rect x="8" y="46" width="94" height="6" rx="1" fill="#E05A47" opacity="0.85" />
            <!-- Tiang Kiri & Kanan (Hashira) -->
            <path d="M24 33 L21 115 H31 L30 33 Z" fill="#E05A47" opacity="0.95" />
            <path d="M80 33 L81 115 H71 L72 33 Z" fill="#E05A47" opacity="0.95" />
            <!-- Batu Fondasi Bawah (Daiishi) -->
            <rect x="17" y="115" width="16" height="5" rx="1" fill="currentColor" opacity="0.6"/>
            <rect x="75" y="115" width="16" height="5" rx="1" fill="currentColor" opacity="0.6"/>
          </g>

          <!-- 2. Gunung Fuji & Matahari Terbit (Kanan Atas) -->
          <g transform="translate(830, 90) scale(0.95)" class="text-torii dark:text-torii-light">
            <!-- Matahari Terbit Merah (Hinomaru) -->
            <circle cx="70" cy="50" r="32" fill="#E05A47" opacity="0.75" />
            <!-- Kerucut Gunung Fuji -->
            <path d="M15 110 L52 35 H88 L125 110 Z" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
            <!-- Mahkota Salju Fuji -->
            <path d="M52 35 L45 52 L56 46 L65 58 L74 48 L84 56 L88 35 Z" fill="#FFFFFF" opacity="0.9" stroke="currentColor" stroke-width="1.5" />
            <!-- Awan Mengambang -->
            <path d="M0 85 Q20 75, 40 85 Q60 70, 75 85" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.5"/>
          </g>

          <!-- 3. Pagoda Tradisional Jepang 5 Tingkat (Kiri Tengah) -->
          <g transform="translate(50, 330) scale(0.85)" class="text-torii dark:text-torii-light">
            <!-- Sorin (Ujung Spire Pagoda) -->
            <path d="M45 5 V30" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            <circle cx="45" cy="12" r="3" fill="currentColor"/>
            <circle cx="45" cy="20" r="4" fill="currentColor"/>
            <!-- Tingkat 1 (Atas) -->
            <path d="M22 38 Q45 28, 68 38 L65 44 H25 Z" fill="#E05A47" opacity="0.85"/>
            <!-- Tingkat 2 -->
            <path d="M18 52 Q45 40, 72 52 L69 58 H21 Z" fill="#E05A47" opacity="0.85"/>
            <!-- Tingkat 3 -->
            <path d="M14 66 Q45 52, 76 66 L73 72 H17 Z" fill="#E05A47" opacity="0.85"/>
            <!-- Tingkat 4 -->
            <path d="M10 80 Q45 64, 80 80 L77 86 H13 Z" fill="#E05A47" opacity="0.85"/>
            <!-- Tingkat 5 (Bawah) -->
            <path d="M6 94 Q45 76, 84 94 L80 100 H10 Z" fill="#E05A47" opacity="0.85"/>
            <!-- Badan Pagoda Bawah -->
            <rect x="25" y="100" width="40" height="20" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.2"/>
            <line x1="45" y1="100" x2="45" y2="120" stroke="currentColor" stroke-width="1.5"/>
          </g>

          <!-- 4. Kipas Tradisional Sensu (Kanan Tengah) -->
          <g transform="translate(865, 325) scale(0.9)" class="text-torii dark:text-torii-light">
            <!-- Bilah Lipatan Kipas -->
            <path d="M10 70 A60 60 0 0 1 90 70 L50 90 Z" fill="#F43F5E" fill-opacity="0.2" stroke="currentColor" stroke-width="2" />
            <!-- Garis Jari-jari Kipas -->
            <line x1="50" y1="90" x2="25" y2="45" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>
            <line x1="50" y1="90" x2="40" y2="35" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>
            <line x1="50" y1="90" x2="50" y2="30" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>
            <line x1="50" y1="90" x2="60" y2="35" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>
            <line x1="50" y1="90" x2="75" y2="45" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>
            <!-- Bulatan Merah di Tengah Kipas -->
            <circle cx="50" cy="55" r="10" fill="#E05A47" opacity="0.75"/>
            <!-- Ikatan Simpul Bawah -->
            <circle cx="50" cy="90" r="3" fill="#B91C1C"/>
          </g>

          <!-- 5. Bunga Sakura Mekar & Kelopak Berguguran (Tersebar Halus) -->
          <!-- Sakura 1 (Kiri Bawah) -->
          <g transform="translate(80, 565) scale(0.9)" fill="#F472B6" stroke="#DB2777" stroke-width="1.5" opacity="0.8">
            <path d="M40 25 C35 15, 45 5, 50 12 C55 5, 65 15, 60 25 C70 20, 80 30, 72 36 C80 42, 70 52, 60 47 C65 57, 55 67, 50 60 C45 67, 35 57, 40 47 C30 52, 20 42, 28 36 C20 30, 30 20, 40 25 Z" fill-opacity="0.35"/>
            <circle cx="50" cy="36" r="4" fill="#FBBF24" stroke="none"/>
          </g>
          <!-- Sakura Kelopak Melayang -->
          <g fill="#F472B6" opacity="0.75">
            <path d="M160 540 C155 532, 162 525, 168 530 C172 535, 166 545, 160 540 Z" />
            <path d="M190 570 C185 565, 190 558, 196 562 C200 566, 195 574, 190 570 Z" />
            <path d="M830 570 C825 562, 832 555, 838 560 C842 565, 836 575, 830 570 Z" />
          </g>

          <!-- 6. Lentera Jepang / Chouchin (Bawah Kanan) -->
          <g transform="translate(870, 545) scale(0.85)" class="text-torii dark:text-torii-light">
            <rect x="35" y="15" width="20" height="5" rx="1.5" fill="currentColor"/>
            <path d="M25 20 C18 35, 18 65, 25 80 H65 C72 65, 72 35, 65 20 Z" fill="#E05A47" fill-opacity="0.3" stroke="currentColor" stroke-width="2"/>
            <line x1="22" y1="40" x2="68" y2="40" stroke="currentColor" stroke-width="1" opacity="0.6"/>
            <line x1="20" y1="60" x2="70" y2="60" stroke="currentColor" stroke-width="1" opacity="0.6"/>
            <rect x="35" y="80" width="20" height="5" rx="1.5" fill="currentColor"/>
            <!-- Rumbai Bawah -->
            <line x1="45" y1="85" x2="45" y2="105" stroke="currentColor" stroke-width="2"/>
          </g>

          <!-- 7. Kaligrafi Huruf Jepang Mengambang (Font JP Artistik) -->
          <g class="font-jp font-black select-none pointer-events-none" fill="#E05A47" fill-opacity="0.14">
            <text x="210" y="155" font-size="34">日本語</text>
            <text x="730" y="255" font-size="32">桜 • 富士</text>
            <text x="250" y="635" font-size="30">漢字 • 仮名</text>
          </g>
        </svg>
      </div>
    </transition>

    <!-- ============================================================ -->
    <!-- THEME 3: ROMAJI (Mode: words / Input Huruf Latin Alfabet)    -->
    <!-- Nuansa: Indigo Aizome, Alfabet ABC, Globe, Translation A⇄あ  -->
    <!-- ============================================================ -->
    <transition name="doodle-fade">
      <div 
        v-if="activeDoodleMode === 'romaji'"
        key="doodle-romaji"
        class="absolute inset-0 w-full h-full"
      >
        <!-- Soft Ambient Radial Glows (Nuansa Indigo & Sky Blue Modern) -->
        <div class="absolute -top-10 -left-16 w-96 h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-3xl"></div>
        <div class="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-sky-500/10 dark:bg-sky-600/12 blur-3xl"></div>
        <div class="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-purple-500/8 dark:bg-indigo-700/12 blur-3xl"></div>

        <!-- SVG Doodle Canvas -->
        <svg 
          class="w-full h-full opacity-40 dark:opacity-35 transition-all duration-700" 
          viewBox="0 0 1000 700" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMin slice"
        >
          <!-- 1. Blok Huruf Alfabet ABC (Kiri Atas) -->
          <g transform="translate(60, 95) scale(0.95)" class="text-indigo-600 dark:text-indigo-400">
            <!-- Blok A -->
            <rect x="10" y="20" width="38" height="38" rx="8" stroke="currentColor" stroke-width="2.5" fill="currentColor" fill-opacity="0.12"/>
            <text x="29" y="47" font-size="22" font-weight="900" fill="currentColor" text-anchor="middle" font-family="sans-serif">A</text>
            <!-- Blok B -->
            <rect x="54" y="10" width="38" height="38" rx="8" stroke="currentColor" stroke-width="2.5" fill="currentColor" fill-opacity="0.18"/>
            <text x="73" y="37" font-size="22" font-weight="900" fill="currentColor" text-anchor="middle" font-family="sans-serif">B</text>
            <!-- Blok C -->
            <rect x="42" y="54" width="38" height="38" rx="8" stroke="currentColor" stroke-width="2.5" fill="currentColor" fill-opacity="0.1"/>
            <text x="61" y="81" font-size="22" font-weight="900" fill="currentColor" text-anchor="middle" font-family="sans-serif">C</text>
          </g>

          <!-- 2. Speech Bubble Translation: [A] ⇄ [あ] (Kanan Atas) -->
          <g transform="translate(850, 90) scale(0.9)" class="text-indigo-600 dark:text-indigo-400">
            <!-- Bubble Kiri (A) -->
            <path d="M10 20 C10 10, 20 5, 38 5 H50 C68 5, 78 10, 78 20 V38 C78 48, 68 53, 50 53 H32 L18 63 V53 C12 50, 10 44, 10 38 Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.12"/>
            <text x="44" y="36" font-size="22" font-weight="900" fill="currentColor" text-anchor="middle" font-family="sans-serif">A</text>
            
            <!-- Panah Bolak-balik Translation -->
            <path d="M48 70 H76 M70 65 L76 70 L70 75" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M72 82 H44 M50 77 L44 82 L50 87" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

            <!-- Bubble Kanan (あ) -->
            <path d="M42 100 C42 90, 52 85, 70 85 H82 C100 85, 110 90, 110 100 V118 C110 128, 100 133, 82 133 H64 L50 143 V133 C44 130, 42 124, 42 118 Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.2"/>
            <text x="76" y="117" font-size="20" font-weight="900" fill="currentColor" text-anchor="middle" font-family="sans-serif">あ</text>
          </g>

          <!-- 3. Globe Dunia Pembelajaran Bahasa (Kiri Tengah) -->
          <g transform="translate(50, 330) scale(0.9)" class="text-indigo-600 dark:text-indigo-400">
            <!-- Lingkaran Luar Globe -->
            <circle cx="50" cy="50" r="35" stroke="currentColor" stroke-width="2.5" fill="currentColor" fill-opacity="0.08"/>
            <!-- Garis Bujur & Lintang Globe -->
            <ellipse cx="50" cy="50" rx="18" ry="35" stroke="currentColor" stroke-width="1.75" fill="none" opacity="0.6"/>
            <line x1="15" y1="50" x2="85" y2="50" stroke="currentColor" stroke-width="1.75" opacity="0.6"/>
            <path d="M20 32 Q50 42, 80 32" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.5"/>
            <path d="M20 68 Q50 58, 80 68" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.5"/>
            <!-- Cincin Orbit Mengelilingi Globe -->
            <ellipse cx="50" cy="50" rx="46" ry="14" transform="rotate(-25 50 50)" stroke="#38BDF8" stroke-width="2" stroke-dasharray="4 3" fill="none" opacity="0.8"/>
          </g>

          <!-- 4. Buku Terbuka & Pensil Menulis (Kanan Tengah) -->
          <g transform="translate(865, 325) scale(0.9)" class="text-indigo-600 dark:text-indigo-400">
            <!-- Halaman Kiri Buku -->
            <path d="M50 35 Q30 30, 10 33 V85 Q30 82, 50 87 Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.12"/>
            <!-- Halaman Kanan Buku -->
            <path d="M50 35 Q70 30, 90 33 V85 Q70 82, 50 87 Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.18"/>
            <!-- Punggung Buku -->
            <line x1="50" y1="35" x2="50" y2="87" stroke="currentColor" stroke-width="2.5"/>
            <!-- Garis-garis Tulisan Buku -->
            <line x1="18" y1="46" x2="42" y2="45" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
            <line x1="18" y1="56" x2="42" y2="55" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
            <line x1="58" y1="46" x2="82" y2="45" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
            <line x1="58" y1="56" x2="82" y2="55" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
            <!-- Pensil Doodle Diagonal -->
            <g transform="translate(68, 15) rotate(40)">
              <polygon points="0,0 6,0 3,-6" fill="currentColor"/>
              <rect x="0" y="0" width="6" height="24" rx="1" fill="#38BDF8" opacity="0.9"/>
            </g>
          </g>

          <!-- 5. Sparkles Bintang & Headphone Suara (Bawah Kiri) -->
          <g transform="translate(80, 560) scale(0.9)" class="text-indigo-600 dark:text-indigo-400">
            <!-- Sparkle Besar -->
            <path d="M35 10 Q35 30, 15 30 Q35 30, 35 50 Q35 30, 55 30 Q35 30, 35 10 Z" fill="#6366F1" opacity="0.7"/>
            <!-- Sparkle Kecil -->
            <path d="M70 40 Q70 52, 58 52 Q70 52, 70 64 Q70 52, 82 52 Q70 52, 70 40 Z" fill="#38BDF8" opacity="0.8"/>
            <circle cx="20" cy="55" r="2.5" fill="currentColor" opacity="0.6"/>
            <circle cx="75" cy="20" r="2" fill="currentColor" opacity="0.5"/>
          </g>

          <!-- 6. Lencana / Badge Pita Prestasi (Bawah Kanan) -->
          <g transform="translate(860, 550) scale(0.9)" class="text-indigo-600 dark:text-indigo-400">
            <circle cx="45" cy="40" r="22" stroke="currentColor" stroke-width="2.5" fill="currentColor" fill-opacity="0.14"/>
            <!-- Bintang Tengah -->
            <polygon points="45,26 49,35 58,36 51,42 53,51 45,46 37,51 39,42 32,36 41,35" fill="#F59E0B" opacity="0.85"/>
            <!-- Pita Menjuntai -->
            <path d="M35 58 L25 85 L38 78 L50 85 L44 58" fill="currentColor" fill-opacity="0.25" stroke="currentColor" stroke-width="1.5"/>
          </g>

          <!-- 7. Teks Tipis Mengambang (ROMAJI / HEPBURN) -->
          <g class="font-sans font-black select-none pointer-events-none" fill="#4F46E5" fill-opacity="0.12">
            <text x="220" y="155" font-size="28" letter-spacing="4">ROMAJI • ALFABET</text>
            <text x="730" y="275" font-size="22" letter-spacing="3">HEPBURN SYSTEM</text>
            <text x="260" y="635" font-size="20" letter-spacing="2">VOCABULARY • KOTOBA</text>
          </g>
        </svg>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.doodle-fade-enter-active,
.doodle-fade-leave-active {
  transition: opacity 0.6s ease-in-out, transform 0.6s ease-in-out;
}

.doodle-fade-enter-from {
  opacity: 0;
  transform: scale(0.98);
}

.doodle-fade-leave-to {
  opacity: 0;
  transform: scale(1.02);
}
</style>
