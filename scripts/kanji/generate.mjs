// scripts/kanji/generate.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

export const SYSTEM_PROMPT = `Kamu menyusun catatan belajar kanji untuk pelajar Indonesia tingkat pemula (Minna no Nihongo).
Aturan KETAT:
1. Fakta yang diberikan adalah pohon komponen (KanjiVG), bagian bunyi (phonetic_part, bisa null), bentuk lama (old_form, bisa null), serta daftar KRADFILE. Gunakan komponen dari pohon KanjiVG; jangan menjelaskan lewat serpihan KRADFILE bila ada komponen induk di pohon. Tiap components[].part HARUS ada di salah satu: pohon KanjiVG, KRADFILE, atau old_form.
2. Jika phonetic_part ada: jelaskan bahwa bagian itu menunjukkan bunyi, dan komponen lainnya menunjukkan kategori makna. Jangan mengarang makna untuk bagian bunyi. Beri role 'phonetic' pada komponen penanda bunyi tersebut, set formation_type menjadi 'phono_semantic', dan isi field reading_hint dengan pola bacaan bagian itu → bacaan kanji (mis. "交 こう → 校 こう").
3. Jika old_form ada: sebutkan satu kalimat "Bentuk lama: X" dan jelaskan kanji modern sebagai penyederhanaan; JANGAN menebak bentuk lama bila old_form null.
4. Jika kamu tidak tahu atau asal-usulnya tidak pasti, gunakan claim_kind "unknown" dan jelaskan hanya struktur komponen (JANGAN mengarang klaim "berasal dari..."). JANGAN menggunakan cerita folk (mis. "orang di bawah atap = menjual") sebagai penjelasan asal-usul.
5. Jangan mengarang sejarah. Dilarang menyebut tahun, dinasti, tulang ramalan, nama ahli, atau pola "pada zaman".
6. 'mnemonic_id' adalah alat bantu mengingat, harus diawali "Cara mengingat:", maks 40 kata, memuat minimal satu citra konkret ATAU petunjuk bunyi (mis. "交 (kō) memberi bunyi 'kō'"), dan DILARANG hanya mengulang arti kanji.
7. Format keluaran JSON memuat field:
   - kanji: karakter kanji
   - formation_type: 'pictograph' | 'ideograph_simple' | 'compound_meaning' | 'phono_semantic' | 'unknown'
   - phonetic_part: bagian bunyi (string jika ada, atau null jika tidak ada)
   - reading_hint: petunjuk keterkaitan bacaan (string jika phonetic_part ada, mis. "交 こう → 校 こう", atau null jika tidak ada)
   - claim_kind: 'structure' | 'folk' | 'unknown'
   - components: array objek { part, role: 'meaning' | 'phonetic' | 'shape', meaning_id }
   - etymology_id: penjelasan asal-usul/hubungan komponen secara ringkas (maks 50 kata). Jika claim_kind "unknown", jelaskan hanya struktur komponen dan petunjuk bacaan bila ada.
   - mnemonic_id: jembatan keledai dimulai dengan "Cara mengingat:" (maks 40 kata)
   - note_id: catatan tambahan bila relevan, atau string kosong jika tidak ada.
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
      phonetic_part: { type: 'STRING', nullable: true },
      reading_hint: { type: 'STRING', nullable: true },
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
  if (node.phon) info.push(`bunyi (phon): ${node.phon}`);
  if (node.position) info.push(`posisi: ${node.position}`);

  let res = `${indent}- ${info.join(', ') || 'grup'}\n`;
  for (const child of node.children || []) {
    res += formatKanjiVgTree(child, depth + 1);
  }
  return res;
}

export function buildUserPrompt(batchItems) {
  let prompt = `Susun catatan belajar untuk ${batchItems.length} kanji berikut berdasarkan fakta yang tersedia:\n\n`;

  for (let i = 0; i < batchItems.length; i++) {
    const item = batchItems[i];
    prompt += `=== Kanji ${i + 1}: ${item.kanji} ===\n`;
    prompt += `Arti: ${(item.meaning || []).slice(0, 5).join(', ') || '-'}\n`;
    prompt += `On: ${(item.on || []).join(', ') || '-'}\n`;
    prompt += `Kun: ${(item.kun || []).join(', ') || '-'}\n`;
    prompt += `Goresan: ${item.stroke_count ?? '-'}\n`;
    prompt += `Bagian Bunyi (phonetic_part): ${item.phonetic_part ? item.phonetic_part : 'null (tidak ada)'}\n`;
    prompt += `Bentuk Lama (old_form): ${item.old_form ? item.old_form : 'null (tidak ada)'}\n`;
    prompt += `Komponen KanjiVG Flat: ${(item.flat_parts || []).join(', ') || '-'}\n`;
    prompt += `Pohon Struktur KanjiVG:\n${formatKanjiVgTree(item.tree)}`;
    prompt += `Komponen KRADFILE: ${(item.components || []).join(', ') || '-'}\n`;
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

  // Filter kanji yang belum digenerate (idempoten & resumable)
  const pendingFacts = [];
  for (const item of targetFacts) {
    const rawFile = path.resolve(RAW_DIR, `${item.kanji}.json`);
    if (overwrite || !fs.existsSync(rawFile)) {
      pendingFacts.push(item);
    }
  }

  console.log(`📌 Total target kanji: ${targetFacts.length}`);
  console.log(`📌 Sudah ada di out/raw/: ${targetFacts.length - pendingFacts.length}`);
  console.log(`📌 Perlu digenerate: ${pendingFacts.length}`);

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
