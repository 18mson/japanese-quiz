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
1. Gunakan HANYA fakta yang diberikan (arti, bacaan, jumlah goresan, daftar komponen).
   Bagian 'components' pada keluaran HARUS himpunan bagian dari daftar komponen yang diberikan.
2. Jangan mengarang sejarah. Dilarang menyebut tahun, dinasti, tulang ramalan, nama ahli, atau
   klaim "pada zaman dahulu ...".
3. Untuk 'etymology_id' jelaskan hubungan komponen dengan arti kanji secara singkat (maks 50 kata).
   - 'established': penjelasan yang diterima luas dan tidak diperdebatkan (mis. 休 = orang + pohon).
   - 'traditional': penjelasan populer yang tidak pasti benar secara sejarah.
   - 'uncertain': jika tidak yakin. Pada kasus ini cukup jelaskan struktur komponen dan JANGAN
     mengarang alasan.
4. Bila salah satu komponen kemungkinan hanya penanda bunyi (bacaan sama atau mirip dengan kanji),
   jelaskan sebagai 'phonetic', jangan dipaksa punya makna.
5. 'mnemonic_id' adalah alat bantu mengingat, harus diawali "Cara mengingat:", maks 40 kata,
   dan TIDAK boleh dinyatakan sebagai sejarah.
6. Semua teks dalam bahasa Indonesia yang sederhana. Jangan menambah field lain.`;

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
      etymology_confidence: {
        type: 'STRING',
        enum: ['established', 'traditional', 'uncertain']
      },
      mnemonic_id: { type: 'STRING' },
      note_id: { type: 'STRING' }
    },
    required: ['kanji', 'formation_type', 'components', 'etymology_id', 'etymology_confidence', 'mnemonic_id', 'note_id']
  }
};

function buildUserPrompt(batchItems) {
  let prompt = `Susun catatan belajar untuk ${batchItems.length} kanji berikut:\n\n`;

  for (let i = 0; i < batchItems.length; i++) {
    const item = batchItems[i];
    prompt += `--- Kanji ${i + 1} ---\n`;
    prompt += `Kanji: ${item.kanji}\n`;
    prompt += `Arti: ${(item.meaning || []).slice(0, 5).join(', ') || '-'}\n`;
    prompt += `On: ${(item.on || []).join(', ') || '-'}\n`;
    prompt += `Kun: ${(item.kun || []).join(', ') || '-'}\n`;
    prompt += `Goresan: ${item.stroke_count ?? '-'}\n`;
    prompt += `Komponen KRADFILE: ${(item.components || []).join(', ') || '-'}\n`;
    prompt += `Kosakata proyek:\n`;
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

export async function generateAll({ specificKanji = null, overwrite = false } = {}) {
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

  for (let b = 0; b < totalBatches; b++) {
    const batch = pendingFacts.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
    const kanjiNames = batch.map(x => x.kanji).join(', ');
    console.log(`\n🚀 [Batch ${b + 1}/${totalBatches}] Mengirim ${batch.length} kanji: ${kanjiNames}`);

    const prompt = buildUserPrompt(batch);
    const results = await callGeminiApi(apiKey, prompt);

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
    if (b < totalBatches - 1) {
      await new Promise(r => setTimeout(r, REQUEST_DELAY_MS));
    }
  }

  console.log('\n🎉 Selesai proses batch generasi Gemini!');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateAll().catch(err => {
    console.error('❌ Gagal menjalankan generate.mjs:', err);
    process.exit(1);
  });
}
