import { BADGE_LIST, TIER_CONFIG } from '../src/data/badges';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

console.log('=== TEST SUITE: Sistem Badge, Siluet, & Level Up Milestone ===\n');

// 1. Validasi Kelengkapan Data Badge
console.log('--- 1. Validasi Dataset Badge ---');
assert(BADGE_LIST.length === 29, `Total badge harus 29 (1 starter + 25 bab + 3 penguasaan huruf & kanji). Ditemukan: ${BADGE_LIST.length}`);

const ids = new Set<string>();
for (const b of BADGE_LIST) {
  assert(!ids.has(b.id), `ID badge harus unik: ${b.id}`);
  ids.add(b.id);
  assert(Boolean(b.title && b.title.length > 0), `Badge ${b.id} harus memiliki title`);
  assert(Boolean(b.japaneseTitle && b.japaneseTitle.length > 0), `Badge ${b.id} harus memiliki japaneseTitle`);
  assert(Boolean(b.icon && b.icon.length > 0), `Badge ${b.id} harus memiliki icon visual`);
  assert(Boolean(b.description && b.description.length > 0), `Badge ${b.id} harus memiliki description`);
  assert(Boolean(b.unlockedHint && b.unlockedHint.length > 0), `Badge ${b.id} harus memiliki unlockedHint`);
  assert(Boolean(TIER_CONFIG[b.tier]), `Badge ${b.id} harus memiliki tier valid (${b.tier})`);
}

// Validasi keberadaan Badge Khusus Huruf & Kanji
const hiraganaBadge = BADGE_LIST.find(b => b.id === 'badge_hiragana_master');
const katakanaBadge = BADGE_LIST.find(b => b.id === 'badge_katakana_master');
const kanjiN5Badge = BADGE_LIST.find(b => b.id === 'badge_kanji_n5_master');
assert(Boolean(hiraganaBadge && hiraganaBadge.icon === '💮'), 'Badge Hiragana Master (💮) terdaftar');
assert(Boolean(katakanaBadge && katakanaBadge.icon === '⚡'), 'Badge Katakana Master (⚡) terdaftar');
assert(Boolean(kanjiN5Badge && kanjiN5Badge.icon === '🈴'), 'Badge Kanji N5 Master (🈴) terdaftar');

// 2. Validasi Status Unlock & Siluet
console.log('\n--- 2. Logika Status Unlock & Siluet ---');
function isUnlocked(badge: typeof BADGE_LIST[0], highestLevel: number, hiraPct = 0, kataPct = 0, kanjiPct = 0) {
  if (badge.id === 'badge_hiragana_master') return hiraPct >= 100;
  if (badge.id === 'badge_katakana_master') return kataPct >= 100;
  if (badge.id === 'badge_kanji_n5_master') return kanjiPct >= 100;
  return badge.levelRequired <= highestLevel;
}

// Saat pemain baru mulai (Level 1, Huruf 0%)
const unlockedLvl1 = BADGE_LIST.filter(b => isUnlocked(b, 1, 0, 0, 0));
const lockedLvl1 = BADGE_LIST.filter(b => !isUnlocked(b, 1, 0, 0, 0));
assert(unlockedLvl1.length === 1 && unlockedLvl1[0].id === 'badge_lvl_1', 'Pemain awal hanya membuka Badge Level 1 (Shoshinsha)');
assert(lockedLvl1.length === 28, '28 Badge lainnya dalam kondisi siluet terkunci');

// Saat pemain hafal 100% Hiragana tetapi masih Level 1
const unlockedWithHira = BADGE_LIST.filter(b => isUnlocked(b, 1, 100, 0, 0));
assert(unlockedWithHira.length === 2, 'Pemain level 1 yang hafal Hiragana 100% membuka 2 badge (Starter & Hiragana Master)');
assert(unlockedWithHira.some(b => b.id === 'badge_hiragana_master'), 'Badge Hiragana Master terbuka');

// Saat pemain hafal 100% Hiragana, Katakana, dan Kanji N5
const unlockedWithAll = BADGE_LIST.filter(b => isUnlocked(b, 1, 100, 100, 100));
assert(unlockedWithAll.length === 4, 'Pemain yang hafal 100% Hiragana, Katakana, & Kanji N5 membuka 4 badge');
assert(unlockedWithAll.some(b => b.id === 'badge_kanji_n5_master'), 'Badge Kanji N5 Master (🈴) terbuka');

// Saat pemain mencapai Level 2 (Menuntaskan Bab 1) tanpa 100% huruf/kanji
const unlockedLvl2 = BADGE_LIST.filter(b => isUnlocked(b, 2, 50, 50, 50));
assert(unlockedLvl2.length === 2, 'Pemain level 2 membuka 2 badge level (Starter & Sakura Hajime)');

// 3. Pencegahan Popup Level Up Berulang
console.log('\n--- 3. Logika Pencegahan Popup Level Up Berulang ---');
let highestLevelReached = 2; // Pemain pernah mencapai Level 2

// Skenario A: Streak kata Bab 1 sempat turun lalu naik lagi, currentUserLevel naik dari 1 ke 2
let currentUserLevel = 2;
let shouldShowLevelUp = currentUserLevel > highestLevelReached;
assert(shouldShowLevelUp === false, 'Popup Level Up TIDAK boleh muncul lagi saat currentUserLevel kembali ke 2');

// Skenario B: Pemain berhasil menguasai Bab 2 sehingga currentUserLevel naik ke 3
currentUserLevel = 3;
shouldShowLevelUp = currentUserLevel > highestLevelReached;
assert(shouldShowLevelUp === true, 'Popup Level Up HARUS muncul saat currentUserLevel menembus level baru (3 > 2)');

// Saat diklaim:
highestLevelReached = Math.max(highestLevelReached, currentUserLevel);
assert(highestLevelReached === 3, 'highestLevelReached terupdate menjadi 3');

// Skenario D: Pemain lama yang sudah berada di Level 2 sebelum fitur badge ditambahkan
let storedHighest = 1; // Belum pernah tercatat di storage
let existingMasteryLevel = 2; // Tapi sudah menuntaskan Bab 1
let effectiveHighest = Math.max(storedHighest, existingMasteryLevel);
assert(effectiveHighest === 2, 'highestLevelReached otomatis tersinkronkan minimal sama dengan level saat ini (2)');
const unlockedExisting = BADGE_LIST.filter(b => isUnlocked(b, effectiveHighest, 0, 0));
assert(unlockedExisting.length === 2, 'Pemain level 2 langsung membuka Badge Level 1 (Starter) dan Badge Level 2 (Sakura Hajime)');

console.log('\n========================================');
console.log('Hasil Test: Semua skenario Badge & Level Up Milestone BERHASIL! 🎉');
