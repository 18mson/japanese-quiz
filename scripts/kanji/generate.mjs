// scripts/kanji/generate.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseKanjidic } from './facts.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konstanta Model & Batch
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
export const BATCH_SIZE = 10;
export const REQUEST_DELAY_MS = 3000;
export const MAX_RETRIES = 8;

const OUT_DIR = path.resolve(__dirname, 'out');
const RAW_DIR = path.resolve(OUT_DIR, 'raw');
const FACTS_FILE = path.resolve(OUT_DIR, 'facts.json');
const ENV_FILE = path.resolve(__dirname, '../../.env');

// Baca GEMINI_API_KEY dari .env tanpa mencetak nilai
export function getApiKey() {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  if (fs.existsSync(ENV_FILE)) {
    const content = fs.readFileSync(ENV_FILE, 'utf-8');
    for (const line of content.split('\n')) {
      const m = line.match(/^[ \t]*GEMINI_API_KEY[ \t]*=[ \t]*([^\s#]+)/);
      if (m) {
        return m[1].replace(/['"]/g, '').trim();
      }
    }
  }
  throw new Error('GEMINI_API_KEY tidak ditemukan di .env atau environment variables!');
}

let kanjidicCache = null;
function getKanjidic() {
  if (!kanjidicCache) {
    kanjidicCache = parseKanjidic();
  }
  return kanjidicCache;
}

export const SYSTEM_PROMPT = `Kamu menyusun catatan belajar kanji untuk pelajar Indonesia tingkat pemula (Minna no Nihongo).
Aturan KETAT:
1. Fakta yang diberikan adalah pohon komponen (KanjiVG), daftar on-yomi komponen dari KANJIDIC2, dan kata konteks. Gunakan komponen dari pohon KanjiVG. Tiap components[].part HARUS ada di pohon KanjiVG, KRADFILE, atau old_form.
2. Penanda Bunyi (Phonetic): Komponen hanya boleh diberi role 'phonetic' bila on-yomi komponen tersebut cocok/berima dengan on-yomi kanji target (berdasarkan fakta on-yomi yang diberikan). Jangan mengarang on-yomi! Jika ber-role 'phonetic', isi formation_type 'phono_semantic'. Model DILARANG mengeluarkan field reading_hint (reading_hint dihitung skrip).
3. Elemen Bukan Kanji: Komponen yang TIDAK ada di KANJIDIC2 hanya boleh diberi role 'shape' dengan meaning_id string kosong (""). Arti komponen hanya boleh diterjemahkan dari KANJIDIC2.
4. Karakter CJK: Karakter kanji/CJK pada etymology_id, mnemonic_id, dan note_id hanya boleh karakter yang diizinkan (kanji target itu sendiri, komponen pohon KanjiVG, KRADFILE, atau karakter dalam kata kosakata konteks). Dilarang memakai Hanzi sederhana Tiongkok seperti 买, 关, dll.
5. Bentuk Lama: Bila old_form ada, sebutkan singkat bentuk lamanya dan kanji modern sebagai penyederhanaan. JANGAN menebak bentuk lama bila old_form null.
6. Ketidakpastian: Jika asal-usulnya tidak pasti atau kamu ragu, gunakan claim_kind "unknown" dan formation_type "unknown", jelaskan hanya struktur visual (DILARANG mengarang cerita/klaim asal-usul palsu).
7. Larangan Sejarah & Klaim Gambar: Dilarang menyebut tahun, dinasti, tulang ramalan, atau pola "pada zaman". Dilarang mengklaim "digambarkan sebagai", "melambangkan", "berasal dari gambar" kecuali kanji piktograf benda murni.
8. Mnemonic (mnemonic_id): Harus diawali "Cara mengingat:", maksimal 40 kata. Wajib memuat citra konkret ATAU petunjuk bunyi. Dilarang hanya mengulang arti kanji. Dilarang menggunakan kalimat "berasal dari..." atau "artinya awalnya...".
9. Format keluaran JSON memuat field:
   - kanji: karakter kanji
   - formation_type: 'pictograph' | 'ideograph_simple' | 'compound_meaning' | 'phono_semantic' | 'unknown'
   - claim_kind: 'structure' | 'folk' | 'unknown'
   - components: array objek { part, role: 'meaning' | 'phonetic' | 'shape', meaning_id }
   - etymology_id: penjelasan struktur / asal-usul ringkas (maks 50 kata).
   - mnemonic_id: jembatan keledai diawali "Cara mengingat:" (maks 40 kata).
   - note_id: catatan tambahan atau string kosong.
Semua teks dalam bahasa Indonesia yang sederhana.`;

export const RESPONSE_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      kanji: { type: 'STRING' },
      formation_type: {
        type: 'STRING',
        enum: ['pictograph', 'ideograph_simple', 'compound_meaning', 'phono_semantic', 'unknown']
      },
      claim_kind: {
        type: 'STRING',
        enum: ['structure', 'folk', 'unknown']
      },
      components: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            part: { type: 'STRING' },
            role: { type: 'STRING', enum: ['meaning', 'phonetic', 'shape'] },
            meaning_id: { type: 'STRING' }
          },
          required: ['part', 'role', 'meaning_id']
        }
      },
      etymology_id: { type: 'STRING' },
      mnemonic_id: { type: 'STRING' },
      note_id: { type: 'STRING' }
    },
    required: [
      'kanji',
      'formation_type',
      'claim_kind',
      'components',
      'etymology_id',
      'mnemonic_id',
      'note_id'
    ]
  }
};

function formatKanjiVgTree(node, depth = 0) {
  if (!node) return '(tidak ada struktur)';
  const indent = '  '.repeat(depth);
  const info = [];
  if (node.element) info.push(`elemen: ${node.element}`);
  if (node.original) info.push(`asli: ${node.original}`);
  if (node.position) info.push(`posisi: ${node.position}`);

  let res = `${indent}- ${info.join(', ') || 'grup'}\n`;
  for (const child of node.children || []) {
    res += formatKanjiVgTree(child, depth + 1);
  }
  return res;
}

export function buildUserPrompt(batchItems) {
  const kdict = getKanjidic();
  let prompt = `Susun catatan belajar untuk ${batchItems.length} kanji berikut berdasarkan fakta yang tersedia:\n\n`;

  for (let i = 0; i < batchItems.length; i++) {
    const item = batchItems[i];
    prompt += `=== Kanji ${i + 1}: ${item.kanji} ===\n`;
    prompt += `Arti: ${(item.meaning || []).slice(0, 5).join(', ') || '-'}\n`;
    prompt += `On: ${(item.on || []).join(', ') || '-'}\n`;
    prompt += `Kun: ${(item.kun || []).join(', ') || '-'}\n`;
    prompt += `Goresan: ${item.stroke_count ?? '-'}\n`;
    prompt += `Bentuk Lama (old_form): ${item.old_form ? item.old_form : 'null (tidak ada)'}\n`;
    prompt += `Komponen KanjiVG Flat: ${(item.flat_parts || []).join(', ') || '-'}\n`;
    prompt += `Pohon Struktur KanjiVG:\n${formatKanjiVgTree(item.tree)}`;
    prompt += `Komponen KRADFILE: ${(item.components || []).join(', ') || '-'}\n`;

    // Berikan daftar on-yomi tiap komponen dari KANJIDIC2
    const compReadings = [];
    for (const p of item.flat_parts || []) {
      if (p === item.kanji) continue;
      const dictEntry = kdict.get(p);
      if (dictEntry) {
        const onStr = dictEntry.on?.length ? `on: ${dictEntry.on.join(', ')}` : 'on: -';
        const kunStr = dictEntry.kun?.length ? `kun: ${dictEntry.kun.join(', ')}` : '';
        const mStr = dictEntry.meaning?.length ? `arti: ${dictEntry.meaning.slice(0, 2).join(', ')}` : '';
        compReadings.push(`${p} (${[onStr, kunStr, mStr].filter(Boolean).join('; ')})`);
      } else {
        compReadings.push(`${p} (komponen non-KANJIDIC2, role hanya boleh 'shape' tanpa meaning_id)`);
      }
    }
    prompt += `Data Komponen & On-yomi KANJIDIC2:\n`;
    if (compReadings.length === 0) {
      prompt += `  - (tidak ada sub-komponen terpisah)\n`;
    } else {
      for (const cr of compReadings) {
        prompt += `  - ${cr}\n`;
      }
    }

    prompt += `Kosakata proyek Minna no Nihongo:\n`;
    const sampleWords = (item.words || []).slice(0, 3);
    if (sampleWords.length === 0) {
      prompt += `- (tidak ada kosakata konteks khusus)\n`;
    } else {
      for (const w of sampleWords) {
        prompt += `- ${w.jp} (${w.kana}) = ${w.meaning}\n`;
      }
    }
    prompt += `\n`;
  }
  return prompt;
}

export async function callGeminiApi(apiKey, userPrompt, retryCount = 0) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.2,
      response_mime_type: 'application/json',
      response_schema: RESPONSE_SCHEMA
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.status === 429 || res.status === 503) {
      if (retryCount < MAX_RETRIES) {
        const delay = res.status === 429 
          ? Math.min(60000, 15000 + retryCount * 8000 + Math.random() * 2000)
          : Math.min(30000, 3000 * Math.pow(2, retryCount) + Math.random() * 1000);
        console.warn(`[HTTP ${res.status}] Rate limit / server busy, menunggu ${Math.round(delay)}ms sebelum coba ulang (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(r => setTimeout(r, delay));
        return callGeminiApi(apiKey, userPrompt, retryCount + 1);
      }
      throw new Error(`Gagal setelah ${MAX_RETRIES} kali retry dengan HTTP ${res.status}`);
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API Error (HTTP ${res.status}): ${errText}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Gemini API mengembalikan respons kosong (tidak ada kandidat teks)');
    }

    return JSON.parse(rawText);
  } catch (err) {
    if (retryCount < MAX_RETRIES && (err.message.includes('fetch failed') || err.message.includes('ETIMEDOUT'))) {
      const delay = Math.pow(2, retryCount + 1) * 1000;
      console.warn(`[Network Error] ${err.message}, coba ulang (${retryCount + 1}/${MAX_RETRIES}) dalam ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
      return callGeminiApi(apiKey, userPrompt, retryCount + 1);
    }
    throw err;
  }
}

export function parseCliArgs() {
  const args = process.argv.slice(2);
  let specificKanji = null;
  let maxRequests = Infinity;
  let overwrite = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--only' && args[i + 1]) {
      const raw = args[i + 1];
      const items = raw.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
      specificKanji = [];
      for (const item of items) {
        for (const char of item) {
          if (/[\u4e00-\u9fff]/.test(char)) {
            specificKanji.push(char);
          }
        }
      }
      i++;
    } else if (arg === '--max-requests' && args[i + 1]) {
      maxRequests = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === '--overwrite') {
      overwrite = true;
    }
  }

  // Jika --only diberikan tanpa flag lain, defaultkan overwrite=true untuk kanji terpilih
  if (specificKanji && specificKanji.length > 0 && !args.includes('--no-overwrite')) {
    overwrite = true;
  }

  return { specificKanji, maxRequests, overwrite };
}

export async function generateAll({ specificKanji = null, maxRequests = Infinity, overwrite = false } = {}) {
  if (!fs.existsSync(FACTS_FILE)) {
    throw new Error(`Berkas facts.json tidak ditemukan di ${FACTS_FILE}. Jalankan facts.mjs dulu!`);
  }
  if (!fs.existsSync(RAW_DIR)) {
    fs.mkdirSync(RAW_DIR, { recursive: true });
  }

  const apiKey = getApiKey();
  const allFacts = JSON.parse(fs.readFileSync(FACTS_FILE, 'utf-8'));

  let targetFacts = allFacts;
  if (specificKanji && specificKanji.length > 0) {
    const filterSet = new Set(specificKanji);
    targetFacts = allFacts.filter(f => filterSet.has(f.kanji));
  }

  // Load manual entries
  const manualFile = path.resolve(__dirname, 'data/manual_entries.json');
  let manualEntriesMap = new Map();
  if (fs.existsSync(manualFile)) {
    try {
      const mData = JSON.parse(fs.readFileSync(manualFile, 'utf-8'));
      const entries = mData.entries || (Array.isArray(mData) ? mData : []);
      for (const e of entries) {
        if (e.kanji) manualEntriesMap.set(e.kanji, e);
      }
    } catch (e) {
      console.warn('Gagal membaca manual_entries.json:', e.message);
    }
  }

  // Tulis kanji manual langsung ke out/raw/{kanji}.json jika masuk dalam target
  for (const item of targetFacts) {
    if (manualEntriesMap.has(item.kanji)) {
      const manEntry = manualEntriesMap.get(item.kanji);
      const rawFile = path.resolve(RAW_DIR, `${item.kanji}.json`);
      fs.writeFileSync(rawFile, JSON.stringify({ ...manEntry, source: 'manual' }, null, 2), 'utf-8');
      console.log(`📌 Kanji [${item.kanji}] disimpan langsung dari manual_entries.json (source: manual)`);
    }
  }

  // Filter kanji yang belum digenerate (idempoten & resumable, lewati entri manual)
  const pendingFacts = [];
  for (const item of targetFacts) {
    if (manualEntriesMap.has(item.kanji)) {
      // Entri manual melewati Gemini sepenuhnya
      continue;
    }
    const rawFile = path.resolve(RAW_DIR, `${item.kanji}.json`);
    if (overwrite || !fs.existsSync(rawFile)) {
      pendingFacts.push(item);
    }
  }

  console.log(`📌 Total target kanji: ${targetFacts.length}`);
  console.log(`📌 Entri manual (bypass Gemini): ${targetFacts.filter(t => manualEntriesMap.has(t.kanji)).length}`);
  console.log(`📌 Sudah ada di out/raw/: ${targetFacts.length - pendingFacts.length}`);
  console.log(`📌 Perlu digenerate lewat Gemini: ${pendingFacts.length}`);

  if (pendingFacts.length === 0) {
    console.log('✨ Semua kanji sudah digenerate! Tidak ada tugas pending.');
    return;
  }

  // Batching 10 kanji per request
  const totalBatches = Math.ceil(pendingFacts.length / BATCH_SIZE);
  let requestCount = 0;

  for (let b = 0; b < totalBatches; b++) {
    if (requestCount >= maxRequests) {
      console.log(`🛑 Batas --max-requests (${maxRequests}) tercapai. Menghentikan proses.`);
      break;
    }

    const batch = pendingFacts.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
    const kanjiNames = batch.map(x => x.kanji).join(', ');
    console.log(`\n🚀 [Batch ${b + 1}/${totalBatches}] (${requestCount + 1}/${maxRequests}) Mengirim ${batch.length} kanji: ${kanjiNames}`);

    const prompt = buildUserPrompt(batch);
    const results = await callGeminiApi(apiKey, prompt);
    requestCount++;

    if (!Array.isArray(results)) {
      console.error(`⚠️ Respons batch ${b + 1} bukan array! Mengabaikan...`);
      continue;
    }

    // Tulis tiap hasil mentah ke scripts/kanji/out/raw/{kanji}.json
    for (const resItem of results) {
      if (resItem && resItem.kanji) {
        const rawFile = path.resolve(RAW_DIR, `${resItem.kanji}.json`);
        fs.writeFileSync(rawFile, JSON.stringify(resItem, null, 2), 'utf-8');
      }
    }
    console.log(`💾 Tersimpan ${results.length} kanji ke out/raw/`);

    // Jeda antar permintaan
    if (b < totalBatches - 1 && requestCount < maxRequests) {
      await new Promise(r => setTimeout(r, REQUEST_DELAY_MS));
    }
  }

  console.log('\n🎉 Selesai proses batch generasi Gemini!');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { specificKanji, maxRequests, overwrite } = parseCliArgs();
  generateAll({ specificKanji, maxRequests, overwrite }).catch(err => {
    console.error('❌ Gagal menjalankan generate.mjs:', err);
    process.exit(1);
  });
}
