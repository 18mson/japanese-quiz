// Mock import.meta.env and WebSocket before importing modules
(import.meta as any).env = {
  VITE_SUPABASE_URL: 'https://dummy.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'dummy_key'
};
(globalThis as any).WebSocket = class {} as any;

const { isBotPlayerId } = await import('../src/stores/battleground/types');
const { BOT_PRESETS } = await import('../src/stores/battleground/battlegroundBotService');

let passCount = 0;
let failCount = 0;

const assert = (condition: boolean, msg: string) => {
  if (condition) {
    console.log(`✅ PASS: ${msg}`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${msg}`);
    failCount++;
  }
};

console.log('=== TEST SUITE: Fitur Lawan Bot (AI Opponent) Battleground ===\n');

// 1. Validasi Helper isBotPlayerId
console.log('--- 1. Helper isBotPlayerId ---');
assert(isBotPlayerId('bot_kenji_12345') === true, 'bot_kenji_12345 terdeteksi sebagai bot');
assert(isBotPlayerId('bot_sakura_abc') === true, 'bot_sakura_abc terdeteksi sebagai bot');
assert(isBotPlayerId('guest_98765') === false, 'guest_98765 bukan bot');
assert(isBotPlayerId('user_uuid_123-456-789') === false, 'user UUID bukan bot');
assert(isBotPlayerId('') === false, 'string kosong bukan bot');

// 2. Validasi Profil BOT_PRESETS
console.log('\n--- 2. Bot Presets & Difficulties ---');
assert(BOT_PRESETS.length >= 3, 'Tersedia minimal 3 profil bot');

const difficulties = BOT_PRESETS.map(p => p.difficulty);
assert(difficulties.includes('easy'), 'Ada profil tingkat kesulitan easy');
assert(difficulties.includes('medium'), 'Ada profil tingkat kesulitan medium');
assert(difficulties.includes('hard'), 'Ada profil tingkat kesulitan hard');

for (const preset of BOT_PRESETS) {
  assert(preset.name.startsWith('🤖'), `Nama ${preset.name} memiliki icon robot`);
  assert(preset.charDelayRangeMs[0] < preset.charDelayRangeMs[1], `${preset.name} rentang jeda ketik valid`);
  assert(preset.accuracy > 0.5 && preset.accuracy <= 1.0, `${preset.name} akurasi antara 50% - 100%`);
  assert(preset.reactionTimeRangeMs[0] < preset.reactionTimeRangeMs[1], `${preset.name} rentang reaksi blitz valid`);
}

// 3. Perbandingan Kecepatan antar Kesulitan
console.log('\n--- 3. Logika Kecepatan (Hard > Medium > Easy) ---');
const easyBot = BOT_PRESETS.find(p => p.difficulty === 'easy')!;
const mediumBot = BOT_PRESETS.find(p => p.difficulty === 'medium')!;
const hardBot = BOT_PRESETS.find(p => p.difficulty === 'hard')!;

assert(hardBot.charDelayRangeMs[0] < mediumBot.charDelayRangeMs[0], 'Hard bot delay ketik lebih cepat dari Medium');
assert(mediumBot.charDelayRangeMs[0] < easyBot.charDelayRangeMs[0], 'Medium bot delay ketik lebih cepat dari Easy');
assert(hardBot.accuracy > mediumBot.accuracy, 'Hard bot akurasi lebih tinggi dari Medium');
assert(mediumBot.accuracy > easyBot.accuracy, 'Medium bot akurasi lebih tinggi dari Easy');

console.log(`\n========================================`);
console.log(`Hasil Test: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
