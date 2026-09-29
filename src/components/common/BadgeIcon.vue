<script setup lang="ts">
withDefaults(
  defineProps<{
    badgeId: string;
    unlocked?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }>(),
  {
    unlocked: true,
    size: 'md',
  }
);
</script>

<template>
  <div 
    class="inline-flex items-center justify-center flex-shrink-0 select-none"
    :class="[
      !unlocked ? 'grayscale opacity-30 contrast-125' : ''
    ]"
  >
    <!-- 1: Shoshinsha (Wakaba Beginner Leaf) -->
    <svg v-if="badgeId === 'badge_lvl_1'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4L12 18C12 30 18 42 24 44C24 44 24 24 24 4Z" fill="#10B981" />
      <path d="M24 4L36 18C36 30 30 42 24 44C24 44 24 24 24 4Z" fill="#FBBF24" />
      <path d="M24 4V44M24 4L12 18C12 30 18 42 24 44C30 42 36 30 36 18L24 4Z" stroke="#047857" stroke-width="2" stroke-linejoin="round" />
    </svg>

    <!-- 2: Hiragana Master (Sealed Crimson Monogram with あ) -->
    <svg v-else-if="badgeId === 'badge_hiragana_master'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="21" fill="#E11D48" />
      <circle cx="24" cy="24" r="18" stroke="#FDE047" stroke-width="2" stroke-dasharray="3 2" />
      <circle cx="24" cy="24" r="15" fill="#BE123C" />
      <text x="24" y="31" font-family="'Klee One', 'Hiragino Sans', sans-serif" font-size="20" font-weight="900" fill="#FFFFFF" text-anchor="middle">あ</text>
    </svg>

    <!-- 3: Katakana Master (Electric Azure Monogram with ア) -->
    <svg v-else-if="badgeId === 'badge_katakana_master'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="21" fill="#0284C7" />
      <circle cx="24" cy="24" r="18" stroke="#38BDF8" stroke-width="2" />
      <circle cx="24" cy="24" r="15" fill="#0369A1" />
      <path d="M34 10L28 22H32L24 38L26 26H22L26 14" stroke="#FDE047" stroke-width="2" stroke-linejoin="round" opacity="0.3" />
      <text x="24" y="31" font-family="'Klee One', 'Hiragino Sans', sans-serif" font-size="20" font-weight="900" fill="#FFFFFF" text-anchor="middle">ア</text>
    </svg>

    <!-- 4: Kanji N5 Master (Purple Imperial Seal with 漢) -->
    <svg v-else-if="badgeId === 'badge_kanji_n5_master'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="38" height="38" rx="10" fill="#6D28D9" transform="rotate(45 24 24)" />
      <circle cx="24" cy="24" r="18" fill="#4C1D95" stroke="#F59E0B" stroke-width="2" />
      <text x="24" y="31" font-family="'Klee One', 'Hiragino Sans', sans-serif" font-size="19" font-weight="900" fill="#FDE047" text-anchor="middle">漢</text>
    </svg>

    <!-- 5: Sakura Hajime (5-Petal Cherry Blossom) -->
    <svg v-else-if="badgeId === 'badge_lvl_2'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(24,24)">
        <path v-for="i in 5" :key="i" :transform="`rotate(${(i - 1) * 72})`" d="M0 -6 C-5 -12, -7 -18, -3 -21 C0 -23, 2 -20, 0 -17 C-2 -20, 0 -23, 3 -21 C7 -18, 5 -12, 0 -6 Z" fill="#F472B6" stroke="#DB2777" stroke-width="1" />
        <circle cx="0" cy="0" r="4.5" fill="#FDE047" />
        <circle cx="0" cy="0" r="2.5" fill="#EA580C" />
      </g>
    </svg>

    <!-- 6: Gerbang Torii (Traditional Red Shinto Shrine Gate) -->
    <svg v-else-if="badgeId === 'badge_lvl_3'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Upper curved beam (Kasagi) -->
      <path d="M4 11C14 9 34 9 44 11V8C34 6 14 6 4 8V11Z" fill="#DC2626" />
      <path d="M3 8C14 6 34 6 45 8L44 6C34 4 14 4 4 6L3 8Z" fill="#18181B" />
      <!-- Straight lintel (Shimaki / Nuki) -->
      <rect x="7" y="15" width="34" height="3" fill="#DC2626" />
      <rect x="22" y="11" width="4" height="4" fill="#DC2626" />
      <!-- Pillars (Hashira) -->
      <path d="M13 11L11 42H16L17 11H13Z" fill="#EA580C" />
      <path d="M35 11L37 42H32L31 11H35Z" fill="#EA580C" />
      <!-- Pillar bases (Nemaki) -->
      <rect x="10" y="38" width="7" height="4" fill="#18181B" rx="1" />
      <rect x="31" y="38" width="7" height="4" fill="#18181B" rx="1" />
    </svg>

    <!-- 7: Onigiri Explorer (Rice Triangle with Nori) -->
    <svg v-else-if="badgeId === 'badge_lvl_4'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 7C28 7 40 32 38 38C36 43 12 43 10 38C8 32 20 7 24 7Z" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" stroke-linejoin="round" />
      <path d="M17 31C17 28 20 27 24 27C28 27 31 28 31 31V41.5C28 42 20 42 17 41.5V31Z" fill="#18181B" />
      <circle cx="21" cy="22" r="1" fill="#DC2626" />
      <circle cx="26" cy="19" r="0.8" fill="#94A3B8" />
    </svg>

    <!-- 8: Matcha Teatime (Green Tea Bowl with Chasen) -->
    <svg v-else-if="badgeId === 'badge_lvl_5'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="20" rx="16" ry="6" fill="#10B981" />
      <ellipse cx="24" cy="20" rx="13" ry="4" fill="#34D399" />
      <path d="M8 20C8 34 16 38 24 38C32 38 40 34 40 20" fill="#047857" stroke="#065F46" stroke-width="2" />
      <ellipse cx="24" cy="38" rx="8" ry="2" fill="#064E3B" />
      <circle cx="21" cy="19" r="1.5" fill="#ECFDF5" />
      <circle cx="26" cy="21" r="1" fill="#ECFDF5" />
    </svg>

    <!-- 9: Fuji Climber (Mount Fuji with Snowcap & Sun) -->
    <svg v-else-if="badgeId === 'badge_lvl_6'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="34" cy="14" r="8" fill="#EF4444" opacity="0.85" />
      <path d="M18 18L5 40H43L30 18H18Z" fill="#1E3A8A" />
      <path d="M18 18L13 26L18 29L24 25L30 29L35 26L30 18H18Z" fill="#F8FAFC" />
    </svg>

    <!-- 10: Bento Gourmet (Lacquer Bento Box) -->
    <svg v-else-if="badgeId === 'badge_lvl_7'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="10" width="34" height="28" rx="5" fill="#7F1D1D" stroke="#991B1B" stroke-width="2" />
      <line x1="24" y1="10" x2="24" y2="38" stroke="#991B1B" stroke-width="2" />
      <line x1="7" y1="24" x2="24" y2="24" stroke="#991B1B" stroke-width="2" />
      <circle cx="15.5" cy="17" r="4" fill="#F8FAFC" />
      <circle cx="15.5" cy="17" r="1.5" fill="#EF4444" />
      <circle cx="15.5" cy="31" r="3.5" fill="#F59E0B" />
      <rect x="27" y="14" width="8" height="20" rx="3" fill="#10B981" />
    </svg>

    <!-- 11: Omiyage Giver (Furoshiki Japanese Ribbon Gift) -->
    <svg v-else-if="badgeId === 'badge_lvl_8'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="16" width="32" height="24" rx="4" fill="#8B5CF6" />
      <rect x="6" y="12" width="36" height="8" rx="2" fill="#7C3AED" />
      <rect x="22" y="12" width="4" height="28" fill="#FDE047" />
      <path d="M19 12C15 6 12 10 19 12Z" fill="#FDE047" />
      <path d="M29 12C33 6 36 10 29 12Z" fill="#FDE047" />
      <circle cx="24" cy="12" r="2.5" fill="#EAB308" />
    </svg>

    <!-- 12: Kitsune Mask (Japanese Fox Mask) -->
    <svg v-else-if="badgeId === 'badge_lvl_9'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Ears -->
      <path d="M10 8L18 20L8 20L10 8Z" fill="#DC2626" />
      <path d="M38 8L30 20L40 20L38 8Z" fill="#DC2626" />
      <!-- Face -->
      <path d="M12 18C12 34 24 44 24 44C24 44 36 34 36 18C36 14 12 14 12 18Z" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" />
      <!-- Eyes -->
      <path d="M16 26C18 24 21 26 21 26" stroke="#DC2626" stroke-width="2" stroke-linecap="round" />
      <path d="M32 26C30 24 27 26 27 26" stroke="#DC2626" stroke-width="2" stroke-linecap="round" />
      <!-- Nose & Mouth -->
      <circle cx="24" cy="34" r="1.5" fill="#18181B" />
      <path d="M24 35.5V38" stroke="#18181B" stroke-width="1.5" stroke-linecap="round" />
    </svg>

    <!-- 13: Sensu Fan (Japanese Folding Fan) -->
    <svg v-else-if="badgeId === 'badge_lvl_10'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 38L6 20C12 10 36 10 42 20L24 38Z" fill="#F43F5E" />
      <path d="M24 38L12 24C16 16 32 16 36 24L24 38Z" fill="#FB7185" />
      <line x1="24" y1="38" x2="16" y2="15" stroke="#FDE047" stroke-width="1.5" />
      <line x1="24" y1="38" x2="24" y2="13" stroke="#FDE047" stroke-width="1.5" />
      <line x1="24" y1="38" x2="32" y2="15" stroke="#FDE047" stroke-width="1.5" />
      <circle cx="24" cy="38" r="2.5" fill="#E11D48" />
    </svg>

    <!-- 14: Shiro Fortress (Japanese Castle Pagoda) -->
    <svg v-else-if="badgeId === 'badge_lvl_11'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Stone Base -->
      <path d="M10 42L14 32H34L38 42H10Z" fill="#64748B" />
      <!-- Tier 1 -->
      <rect x="16" y="24" width="16" height="8" fill="#F8FAFC" />
      <path d="M8 24C14 21 34 21 40 24L38 21C34 19 14 19 10 21L8 24Z" fill="#0F172A" />
      <!-- Tier 2 -->
      <rect x="18" y="14" width="12" height="8" fill="#F8FAFC" />
      <path d="M12 15C16 13 32 13 36 15L34 12C32 10 16 10 14 12L12 15Z" fill="#0F172A" />
      <!-- Top Gable -->
      <path d="M24 6L16 12H32L24 6Z" fill="#0F172A" />
      <circle cx="24" cy="5" r="1.5" fill="#F59E0B" />
    </svg>

    <!-- 15: Koinobori Breeze (Carp Streamer) -->
    <svg v-else-if="badgeId === 'badge_lvl_12'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 16C16 12 36 12 42 16L38 24L42 32C36 36 16 36 8 32V16Z" fill="#0284C7" />
      <circle cx="14" cy="22" r="3.5" fill="#FFFFFF" />
      <circle cx="14" cy="22" r="1.5" fill="#0F172A" />
      <path d="M22 18C20 22 20 26 22 30" stroke="#BAE6FD" stroke-width="2" stroke-linecap="round" />
      <path d="M28 18C26 22 26 26 28 30" stroke="#BAE6FD" stroke-width="2" stroke-linecap="round" />
    </svg>

    <!-- 16: Tanabata Wishes (Bamboo Wish Strips) -->
    <svg v-else-if="badgeId === 'badge_lvl_13'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="24" y1="42" x2="24" y2="8" stroke="#10B981" stroke-width="4" stroke-linecap="round" />
      <!-- Bamboo Leaves -->
      <path d="M24 16C28 12 36 14 36 14C36 14 32 20 24 18" fill="#34D399" />
      <path d="M24 24C18 20 12 22 12 22C12 22 16 28 24 26" fill="#34D399" />
      <!-- Wish Papers (Tanzaku) -->
      <rect x="26" y="20" width="6" height="14" rx="1" fill="#F43F5E" transform="rotate(8 26 20)" />
      <rect x="14" y="26" width="6" height="13" rx="1" fill="#FBBF24" transform="rotate(-6 14 26)" />
    </svg>

    <!-- 17: Chouchin Lantern (Japanese Red Paper Lantern) -->
    <svg v-else-if="badgeId === 'badge_lvl_14'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="7" width="12" height="3" fill="#18181B" rx="1" />
      <rect x="18" y="38" width="12" height="3" fill="#18181B" rx="1" />
      <path d="M12 17C10 24 10 28 12 35H36C38 28 38 24 36 17H12Z" fill="#DC2626" />
      <ellipse cx="24" cy="26" rx="13" ry="12" fill="#EF4444" />
      <line x1="13" y1="21" x2="35" y2="21" stroke="#B91C1C" stroke-width="1.5" />
      <line x1="11" y1="26" x2="37" y2="26" stroke="#B91C1C" stroke-width="1.5" />
      <line x1="13" y1="31" x2="35" y2="31" stroke="#B91C1C" stroke-width="1.5" />
      <line x1="24" y1="41" x2="24" y2="45" stroke="#DC2626" stroke-width="2" stroke-linecap="round" />
    </svg>

    <!-- 18: Origami Crane (Folded Paper Bird) -->
    <svg v-else-if="badgeId === 'badge_lvl_15'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 16L38 10L28 26L24 16Z" fill="#60A5FA" />
      <path d="M24 16L10 10L20 26L24 16Z" fill="#3B82F6" />
      <path d="M24 16L20 26L24 38L28 26L24 16Z" fill="#2563EB" />
      <path d="M10 10L6 14L10 17" stroke="#1D4ED8" stroke-width="2" stroke-linejoin="round" />
      <path d="M38 10L42 22" stroke="#1D4ED8" stroke-width="2" stroke-linecap="round" />
    </svg>

    <!-- 19: Katana Ronin (Crossed Japanese Swords) -->
    <svg v-else-if="badgeId === 'badge_lvl_16'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 40L38 10L40 12L10 42L8 40Z" fill="#94A3B8" />
      <path d="M40 8L36 12L38 14L42 10L40 8Z" fill="#F59E0B" />
      <path d="M40 40L10 10L8 12L38 42L40 40Z" fill="#CBD5E1" />
      <path d="M8 8L12 12L10 14L6 10L8 8Z" fill="#F59E0B" />
      <circle cx="24" cy="24" r="3" fill="#D97706" />
    </svg>

    <!-- 20: Jinja Shrine (Shinto Shrine Hall) -->
    <svg v-else-if="badgeId === 'badge_lvl_17'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 16C16 12 32 12 42 16L40 12C32 9 16 9 8 12L6 16Z" fill="#B91C1C" />
      <rect x="12" y="16" width="24" height="18" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5" />
      <rect x="20" y="24" width="8" height="10" fill="#78350F" />
      <line x1="8" y1="38" x2="40" y2="38" stroke="#78350F" stroke-width="3" />
      <circle cx="24" cy="19" r="2" fill="#DC2626" />
    </svg>

    <!-- 21: Kabuto Helm (Samurai Helmet with Horns) -->
    <svg v-else-if="badgeId === 'badge_lvl_18'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Crest (Kuwagata) -->
      <path d="M24 16L16 6C18 12 24 14 24 16Z" fill="#F59E0B" />
      <path d="M24 16L32 6C30 12 24 14 24 16Z" fill="#F59E0B" />
      <circle cx="24" cy="15" r="2.5" fill="#D97706" />
      <!-- Dome -->
      <path d="M12 22C12 16 36 16 36 22L38 32H10L12 22Z" fill="#1E293B" stroke="#0F172A" stroke-width="2" />
      <path d="M14 32C14 38 34 38 34 32" stroke="#DC2626" stroke-width="3" stroke-linecap="round" />
    </svg>

    <!-- 22: Kendama Focus (Traditional Ball & Cup Toy) -->
    <svg v-else-if="badgeId === 'badge_lvl_19'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="13" r="8" fill="#EF4444" stroke="#DC2626" stroke-width="1.5" />
      <circle cx="24" cy="13" r="3" fill="#FEE2E2" />
      <path d="M24 21V38" stroke="#D97706" stroke-width="4" stroke-linecap="round" />
      <path d="M15 25H33" stroke="#D97706" stroke-width="3" stroke-linecap="round" />
      <path d="M24 38C24 41 24 42 24 42" stroke="#B45309" stroke-width="6" stroke-linecap="round" />
    </svg>

    <!-- 23: Taiko Drummer (Japanese Drum with Drumsticks) -->
    <svg v-else-if="badgeId === 'badge_lvl_20'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="20" rx="14" ry="7" fill="#FEF3C7" stroke="#78350F" stroke-width="2" />
      <path d="M10 20C10 32 38 32 38 20V26C38 38 10 38 10 26V20Z" fill="#B91C1C" stroke="#7F1D1D" stroke-width="1.5" />
      <circle cx="24" cy="20" r="3" fill="#DC2626" />
      <line x1="8" y1="36" x2="20" y2="24" stroke="#D97706" stroke-width="2.5" stroke-linecap="round" />
      <line x1="40" y1="36" x2="28" y2="24" stroke="#D97706" stroke-width="2.5" stroke-linecap="round" />
    </svg>

    <!-- 24: Ryu Dragon (Japanese Azure Dragon Emblem) -->
    <svg v-else-if="badgeId === 'badge_lvl_21'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" fill="#047857" stroke="#F59E0B" stroke-width="2" />
      <path d="M14 34C14 22 26 14 32 14C34 14 36 16 34 18C28 20 22 26 26 30C28 32 32 30 34 26" stroke="#FDE047" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="28" cy="18" r="2" fill="#EF4444" />
      <path d="M34 14L38 10" stroke="#FDE047" stroke-width="2" stroke-linecap="round" />
    </svg>

    <!-- 25: Maneki Neko (Lucky Cat with Gold Coin) -->
    <svg v-else-if="badgeId === 'badge_lvl_22'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Body -->
      <path d="M12 40C12 28 36 28 36 40H12Z" fill="#F8FAFC" />
      <!-- Head -->
      <circle cx="24" cy="22" r="11" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
      <!-- Ears -->
      <path d="M14 16L17 9L22 13Z" fill="#F43F5E" />
      <path d="M34 16L31 9L26 13Z" fill="#F43F5E" />
      <!-- Raised Paw -->
      <circle cx="34" cy="18" r="4" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
      <!-- Eyes & Whisker -->
      <path d="M18 20C20 22 22 20 22 20" stroke="#18181B" stroke-width="1.5" stroke-linecap="round" />
      <circle cx="24" cy="23" r="1" fill="#F43F5E" />
      <!-- Gold Coin -->
      <ellipse cx="24" cy="34" rx="4" ry="6" fill="#F59E0B" stroke="#B45309" stroke-width="1" />
    </svg>

    <!-- 26: Bonsai Master (Sculpted Pine Tree in Pot) -->
    <svg v-else-if="badgeId === 'badge_lvl_23'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Pot -->
      <path d="M14 36H34L32 42H16L14 36Z" fill="#78350F" />
      <!-- Trunk -->
      <path d="M24 36C22 28 26 24 22 18" stroke="#92400E" stroke-width="4" stroke-linecap="round" />
      <path d="M23 26C28 24 30 22 30 20" stroke="#92400E" stroke-width="3" stroke-linecap="round" />
      <!-- Foliage Clouds -->
      <ellipse cx="20" cy="16" rx="8" ry="4.5" fill="#15803D" />
      <ellipse cx="30" cy="19" rx="6" ry="4" fill="#16A34A" />
      <ellipse cx="16" cy="23" rx="5" ry="3.5" fill="#22C55E" />
    </svg>

    <!-- 27: Shinobi Shadow (Ninja Shuriken) -->
    <svg v-else-if="badgeId === 'badge_lvl_24'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4L28 18L42 22L28 26L24 40L20 26L6 22L20 18L24 4Z" fill="#334155" stroke="#0F172A" stroke-width="1.5" />
      <circle cx="24" cy="22" r="4.5" fill="#0F172A" />
      <circle cx="24" cy="22" r="2.5" fill="#64748B" />
    </svg>

    <!-- 28: Daruma Wish (Red Daruma Doll) -->
    <svg v-else-if="badgeId === 'badge_lvl_25'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Body -->
      <circle cx="24" cy="26" r="16" fill="#DC2626" />
      <circle cx="24" cy="23" r="11" fill="#FEF2F2" />
      <!-- Determined Eyebrows & Eyes -->
      <path d="M16 19C18 17 21 19 21 19" stroke="#18181B" stroke-width="2.5" stroke-linecap="round" />
      <path d="M32 19C30 17 27 19 27 19" stroke="#18181B" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="19" cy="23" r="2.5" fill="#18181B" />
      <circle cx="29" cy="23" r="2.5" fill="#18181B" />
      <!-- Mustache & Beard -->
      <path d="M18 29C20 27 28 27 30 29" stroke="#18181B" stroke-width="2" stroke-linecap="round" />
      <!-- Gold accents -->
      <path d="M18 36C22 34 26 34 30 36" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" />
    </svg>

    <!-- 29: Nihongo Shogun (Imperial Gold Crown & Crest) -->
    <svg v-else-if="badgeId === 'badge_lvl_26'" viewBox="0 0 48 48" class="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="21" fill="url(#shogun_gold)" stroke="#B45309" stroke-width="2" />
      <path d="M10 32L14 18L24 24L34 18L38 32H10Z" fill="#FDE047" stroke="#B45309" stroke-width="1.5" />
      <circle cx="14" cy="17" r="2.5" fill="#EF4444" />
      <circle cx="24" cy="22" r="3" fill="#3B82F6" />
      <circle cx="34" cy="17" r="2.5" fill="#EF4444" />
      <circle cx="24" cy="31" r="2" fill="#10B981" />
      <defs>
        <linearGradient id="shogun_gold" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stop-color="#F59E0B" />
          <stop offset="0.5" stop-color="#FBBF24" />
          <stop offset="1" stop-color="#D97706" />
        </linearGradient>
      </defs>
    </svg>

    <!-- Fallback default / unknown badge -->
    <div v-else class="text-2xl">
      💮
    </div>
  </div>
</template>
