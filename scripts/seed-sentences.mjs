import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import kuromoji from 'kuromoji';

// Polyfill WebSocket for Node.js < 22 to prevent Supabase RealtimeClient error
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class DummyWebSocket {};
}

import { createClient } from '@supabase/supabase-js';
import { LESSONS, getAllowedTagsForLesson, getLessonIntroduces } from './grammar/tags.mjs';
import { detectTags } from './grammar/detect.mjs';
import { generateQuestionsForLesson } from './template-generator.mjs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------------------------------------------
// 1. Load Environment Variables (.env)
// ------------------------------------------------------------------
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        if (!process.env[key]) {
          process.env[key] = value.trim();
        }
      }
    }
  }
}
loadEnv();

// ------------------------------------------------------------------
// 2. Parse CLI Arguments
// ------------------------------------------------------------------
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    ind: '',
    jpn: '',
    links: '',
    templatesOnly: false,
    dryRun: false,
    strict: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ind') options.ind = args[++i] || '';
    else if (args[i] === '--jpn') options.jpn = args[++i] || '';
    else if (args[i] === '--links') options.links = args[++i] || '';
    else if (args[i] === '--templates-only') options.templatesOnly = true;
    else if (args[i] === '--dry-run') options.dryRun = true;
    else if (args[i] === '--strict') options.strict = true;
  }

  return options;
}

// ------------------------------------------------------------------
// 3. Kuromoji Tokenizer Promise
// ------------------------------------------------------------------
function initTokenizer() {
  return new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath: 'node_modules/kuromoji/dict' }).build((err, tokenizer) => {
      if (err) reject(err);
      else resolve(tokenizer);
    });
  });
}

// ------------------------------------------------------------------
// 4. Function Words Allow-list (Kata fungsi sah di semua bab)
// ------------------------------------------------------------------
const FUNCTION_WORDS_ALLOWLIST = new Set([
  'は', 'が', 'を', 'に', 'へ', 'で', 'と', 'から', 'まで', 'も', 'の', 'か', 'ね', 'よ',
  'です', 'だ', 'ます', 'ある', 'いる', 'ない', 'た', 'て', 'さん', 'ちゃん', 'くん',
  'これ', 'それ', 'あれ', 'この', 'その', 'あの', 'ここ', 'そこ', 'あそこ', 'どこ', 'なん', 'なに', '何',
  '。', '、', '！', '？', ' ', '・'
]);

// ------------------------------------------------------------------
// 5. Main Seeder Execution
// ------------------------------------------------------------------
async function main() {
  const opts = parseArgs();
  console.log('=== SEED SENTENCE QUESTIONS ===');
  console.log(`Mode: ${opts.templatesOnly ? 'Templates Only' : 'Tatoeba + Templates'}`);
  console.log(`Strict Vocab: ${opts.strict ? 'YES' : 'NO'}`);
  console.log(`Dry run: ${opts.dryRun ? 'YES (No DB Writes)' : 'NO'}`);

  const tokenizer = await initTokenizer();

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                     process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
                     process.env.SUPABASE_ANON_KEY ||
                     process.env.VITE_SUPABASE_ANON_KEY;

  let supabase = null;
  if (!opts.dryRun) {
    if (!supabaseUrl || !serviceKey) {
      console.warn('⚠️ WARNING: Supabase URL atau Key tidak ditemukan di .env.');
      console.warn('Beralih ke mode --dry-run (simulasi tanpa simpan ke database).\n');
      opts.dryRun = true;
    } else {
      supabase = createClient(supabaseUrl, serviceKey);
    }
  }

  /** @type {Record<number, number>} */
  const chapterCounts = {};
  /** @type {Record<number, number>} */
  const focusCounts = {};
  for (let c = 1; c <= 25; c++) {
    chapterCounts[c] = 0;
    focusCounts[c] = 0;
  }

  const rejectionStats = {
    outsideVocab: 0,
    tagsNotYetTaught: 0,
    unknownGrammar: 0,
    lengthOutOfRange: 0,
    latinOrDigit: 0
  };

  /** @type {any[]} */
  const questionsToUpsert = [];

  // A. Generate Template Questions (Bab 1 s.d. 8)
  console.log('\n[1/2] Menghasilkan Soal dari Generator Template (Target 150 per bab)...');
  /** @type {Record<number, Record<string, number>>} */
  const allTemplateStats = {};
  const discardedWordsSet = new Set();
  for (let lesson = 1; lesson <= 8; lesson++) {
    const { questions: generated, templateStats } = generateQuestionsForLesson(lesson, tokenizer, 150, 10, discardedWordsSet);
    allTemplateStats[lesson] = templateStats;
    for (const q of generated) {
      questionsToUpsert.push({
        id_text: q.id_text,
        jp_text: q.jp_text,
        jp_answers: q.jp_answers,
        chapter_id: q.chapter_id,
        grammar_tags: q.grammar_tags,
        is_focus: q.is_focus,
        source: q.source,
        source_ref: q.source_ref,
        attribution: q.attribution,
        status: q.status
      });
      chapterCounts[lesson] = (chapterCounts[lesson] || 0) + 1;
      if (q.is_focus) focusCounts[lesson] = (focusCounts[lesson] || 0) + 1;
    }
  }
  console.log(`✓ Dihasilkan ${questionsToUpsert.length} soal template untuk Bab 1 s.d. 8.`);


  // B. Process Tatoeba files jika file disediakan
  if (!opts.templatesOnly && opts.ind && opts.jpn && opts.links) {
    console.log('\n[2/2] Membaca dan Memproses File Tatoeba...');
    if (!fs.existsSync(opts.ind) || !fs.existsSync(opts.jpn) || !fs.existsSync(opts.links)) {
      console.error('❌ Error: Salah satu file Tatoeba tidak ditemukan di path yang diberikan.');
      process.exit(1);
    }

    // Baca kalimat Indonesia
    const indSentences = new Map();
    const indRl = readline.createInterface({ input: fs.createReadStream(opts.ind), crlfDelay: Infinity });
    for await (const line of indRl) {
      const [id, , text] = line.split('\t');
      if (id && text) indSentences.set(id.trim(), text.trim());
    }

    // Baca kalimat Jepang
    const jpnSentences = new Map();
    const jpnRl = readline.createInterface({ input: fs.createReadStream(opts.jpn), crlfDelay: Infinity });
    for await (const line of jpnRl) {
      const [id, , text] = line.split('\t');
      if (id && text) jpnSentences.set(id.trim(), text.trim());
    }

    // Baca Links dan hubungkan (1 ID -> multiple JP)
    const linksMap = new Map();
    const linksRl = readline.createInterface({ input: fs.createReadStream(opts.links), crlfDelay: Infinity });
    for await (const line of linksRl) {
      const [fromId, toId] = line.split('\t');
      if (indSentences.has(fromId) && jpnSentences.has(toId)) {
        if (!linksMap.has(fromId)) linksMap.set(fromId, []);
        linksMap.get(fromId).push(jpnSentences.get(toId));
      } else if (indSentences.has(toId) && jpnSentences.has(fromId)) {
        if (!linksMap.has(toId)) linksMap.set(toId, []);
        linksMap.get(toId).push(jpnSentences.get(fromId));
      }
    }

    console.log(`Ditemukan ${linksMap.size} pasangan kalimat unik ID <-> JP dari Tatoeba.`);

    // Evaluasi tiap pasangan
    for (const [indId, jpList] of linksMap.entries()) {
      const idText = indSentences.get(indId);
      const wordCount = idText.trim().split(/\s+/).length;

      // Filter panjang kalimat ID (3 - 15 kata)
      if (wordCount < 3 || wordCount > 15) {
        rejectionStats.lengthOutOfRange++;
        continue;
      }

      // Ambil JP pertama sebagai representasi utama
      const mainJp = jpList[0];
      if (mainJp.length > 40) {
        rejectionStats.lengthOutOfRange++;
        continue;
      }

      // Buang yang mengandung karakter latin atau angka
      if (/[a-zA-Z0-9]/.test(mainJp)) {
        rejectionStats.latinOrDigit++;
        continue;
      }

      // Tokenisasi dengan kuromoji
      const tokens = tokenizer.tokenize(mainJp);
      const { tags, unknown } = detectTags(tokens);

      if (unknown.length > 0) {
        rejectionStats.unknownGrammar++;
        continue;
      }

      // Klasifikasi Bab N terkecil
      let matchedChapter = null;
      let isFocus = false;

      for (let n = 1; n <= 25; n++) {
        const allowedTags = getAllowedTagsForLesson(n);
        const tagsAllowed = Array.from(tags).every(t => allowedTags.has(t));
        if (tagsAllowed) {
          matchedChapter = n;
          const introducesN = getLessonIntroduces(n);
          isFocus = Array.from(tags).some(t => introducesN.has(t));
          break;
        }
      }

      if (!matchedChapter) {
        rejectionStats.tagsNotYetTaught++;
        continue;
      }

      // Siapkan variasi jawaban jp_answers
      const answersSet = new Set();
      /** @param {string} s */
      const clean = (s) => s.replace(/[。、！？\s]/g, '');

      for (const jp of jpList) {
        answersSet.add(clean(jp));
        // Hiragana reading dari kuromoji
        const jpTokens = tokenizer.tokenize(jp);
        const hiraganaReading = jpTokens.map(t => t.reading ? toHiragana(t.reading) : t.surface_form).join('');
        answersSet.add(clean(hiraganaReading));
        // Versi tanpa わたしは
        if (jp.startsWith('わたしは') || jp.startsWith('私は')) {
          answersSet.add(clean(jp.replace(/^わたしは|^私は/, '')));
        }
      }

      questionsToUpsert.push({
        id_text: idText,
        jp_text: mainJp,
        jp_answers: Array.from(answersSet),
        chapter_id: matchedChapter,
        grammar_tags: Array.from(tags),
        is_focus: isFocus,
        source: 'tatoeba',
        source_ref: `tatoeba_${indId}`,
        attribution: 'Tatoeba (CC BY 2.0 FR)',
        status: 'approved'
      });

      chapterCounts[matchedChapter]++;
      if (isFocus) focusCounts[matchedChapter]++;
    }
  } else if (!opts.templatesOnly) {
    console.log('\n(Info: Argumen --ind, --jpn, atau --links tidak disertakan. Jalankan dengan file Tatoeba untuk mengimpor dari Tatoeba.)');
  }

  // C. Laporan Seed
  console.log('\n======================================================');
  console.log('              LAPORAN SEED SOAL HARIAN                ');
  console.log('======================================================');
  console.log('Bab  | Total Soal | Soal Fokus | Status');
  console.log('-----+------------+------------+----------------------');
  for (let c = 1; c <= 25; c++) {
    const total = chapterCounts[c] || 0;
    const focus = focusCounts[c] || 0;
    const warning = total < 15 ? '⚠️ < 15 soal' : '✓ Cukup';
    console.log(`${String(c).padStart(3)}  | ${String(total).padStart(10)} | ${String(focus).padStart(10)} | ${warning}`);
  }

  console.log('\nRincian Jumlah Soal per Template:');
  for (const [lesson, stats] of Object.entries(allTemplateStats)) {
    console.log(`- Bab ${lesson}:`);
    for (const [tplId, count] of Object.entries(stats)) {
      console.log(`    ${tplId}: ${count} soal`);
    }
  }

  console.log('\nAlasan Penolakan Soal Tatoeba Terbanyak:');

  console.log(`- Panjang di luar rentang (3-15 kata ID / >40 jp): ${rejectionStats.lengthOutOfRange}`);
  console.log(`- Mengandung karakter latin atau angka di JP:     ${rejectionStats.latinOrDigit}`);
  console.log(`- Tata bahasa tidak dikenal (Unknown grammar):      ${rejectionStats.unknownGrammar}`);
  console.log(`- Tata bahasa belum diajarkan di Bab 1-25:          ${rejectionStats.tagsNotYetTaught}`);

  // D. Ringkasan Kosakata Suplemen & Kata Terbuang
  const vocabExtraPath = path.resolve(__dirname, 'data/vocab-extra.json');
  if (fs.existsSync(vocabExtraPath)) {
    try {
      const extraList = JSON.parse(fs.readFileSync(vocabExtraPath, 'utf-8'));
      const countsByReason = {};
      const nonMissing = [];
      for (const w of extraList) {
        countsByReason[w.reason] = (countsByReason[w.reason] || 0) + 1;
        if (w.reason !== 'missing') nonMissing.push(w);
      }
      console.log('\nRingkasan Suplemen Kosakata (vocab-extra.json):');
      console.log(`- Total kata suplemen: ${extraList.length}`);
      for (const [r, cnt] of Object.entries(countsByReason)) {
        console.log(`  - Alasan "${r}": ${cnt} kata`);
      }
      if (nonMissing.length > 0) {
        console.log('  - Kata dengan alasan bukan "missing":');
        for (const w of nonMissing) {
          console.log(`    * ${w.jp} (${w.kana}) - Bab ${w.lesson} [${w.reason}]`);
        }
      }
    } catch {}
  }

  const discardedList = Array.from(discardedWordsSet);
  if (discardedList.length > 0) {
    console.log(`\nDaftar Kata Masih Terbuang (${discardedList.length} kata):`);
    for (const w of discardedList) {
      console.log(`  - ${w}`);
    }
  } else {
    console.log('\nDaftar Kata Masih Terbuang: (tidak ada)');
  }

  // E. Upsert Idempoten ke Supabase
  if (!opts.dryRun && supabase && questionsToUpsert.length > 0) {
    console.log(`\nMenyimpan ${questionsToUpsert.length} soal ke Supabase dalam batch...`);
    const chunkSize = 100;
    let successCount = 0;
    for (let i = 0; i < questionsToUpsert.length; i += chunkSize) {
      const chunk = questionsToUpsert.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('sentence_questions')
        .upsert(chunk, { onConflict: 'source,source_ref' });

      if (error) {
        console.error(`❌ Gagal upsert batch ${i + 1}-${i + chunk.length}:`, error.message);
        break;
      }
      successCount += chunk.length;
      process.stdout.write(`  ... ${successCount}/${questionsToUpsert.length} tersimpan\r`);
    }
    console.log(`\n✓ Berhasil menyimpan ${successCount} soal ke database secara idempoten!`);
  }

  console.log('\n=== SEED SELESAI ===');
}

/**
 * Konversi katakana reading ke hiragana
 * @param {string} katakana
 */
function toHiragana(katakana) {
  return katakana.replace(/[\u30a1-\u30f6]/g, (match) => {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
