// scripts/kanji/generate_three_tier.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDirectComponents } from './validate.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
export const BATCH_SIZE = 10;
export const MAX_REQUESTS = 60;
export const REQUEST_DELAY_MS = 1500;

const DATA_DIR = path.resolve(__dirname, 'data');
const OUT_DIR = path.resolve(__dirname, 'out');
const FACTS_FILE = path.resolve(OUT_DIR, 'facts.json');
const AI_CACHE_FILE = path.resolve(OUT_DIR, 'ai_generated.json');
const MANUAL_ENTRIES_FILE = path.resolve(DATA_DIR, 'manual_entries.json');
const ESTABLISHED_FILE = path.resolve(DATA_DIR, 'established.json');
const OLD_FORMS_FILE = path.resolve(DATA_DIR, 'old_forms.json');
const RADICAL_VARIANTS_FILE = path.resolve(DATA_DIR, 'radical_variants.json');
const ENV_FILE = path.resolve(__dirname, '../../.env');

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

export function loadRadicalVariants() {
  if (fs.existsSync(RADICAL_VARIANTS_FILE)) {
    return JSON.parse(fs.readFileSync(RADICAL_VARIANTS_FILE, 'utf-8'));
  }
  return {};
}

export function loadOldForms() {
  if (fs.existsSync(OLD_FORMS_FILE)) {
    const data = JSON.parse(fs.readFileSync(OLD_FORMS_FILE, 'utf-8'));
    const pairs = data.pairs || data;
    const clean = {};
    for (const [k, v] of Object.entries(pairs)) {
      if (k.normalize('NFC') !== v.normalize('NFC')) {
        clean[k] = v;
      }
    }
    return clean;
  }
  return {};
}

// 15 kanji hasil Gemini yang sudah ditinjau user
export const GEMINI_APPROVED_KANJI = new Set([
  '梅', '紙', '荷', '警', '跳', '象', '迎', '通', '鉛', '答', '冷', '究', '花', '起', '靴'
]);

export function loadManualSet() {
  const manualSet = new Set();
  if (fs.existsSync(MANUAL_ENTRIES_FILE)) {
    const data = JSON.parse(fs.readFileSync(MANUAL_ENTRIES_FILE, 'utf-8'));
    const entries = data.entries || (Array.isArray(data) ? data : []);
    for (const e of entries) {
      if (e.kanji) manualSet.add(e.kanji);
    }
  }
  for (const k of GEMINI_APPROVED_KANJI) {
    manualSet.add(k);
  }
  return manualSet;
}

export const SYSTEM_PROMPT = `Kamu adalah asisten penyusun trik mengingat kanji (mnemonik) untuk pembelajar bahasa Jepang di Indonesia tingkat pemula (Minna no Nihongo).
Tujuan: membantu menghafal secara cepat dan ramah ingatan, bukan menulis etimologi ilmiah.

Aturan Pembuatan:
1. Mnemonik (mnemonic_id):
   - Wajib berbahasa Indonesia yang santai, lugas, dan mudah diingat.
   - Maksimal 40 kata.
   - WAJIB diawali persis dengan: "Cara mengingat:"
   - Boleh cerita kreatif / jembatan keledai yang mengaitkan arti kanji dengan komponen pembentuknya.
   - Sebutkan karakter kanji komponen dalam tanda kurung bila dirujuk dalam cerita, misalnya: (木) pohon atau (亻) orang.
2. Karakter CJK:
   - DILARANG keras memunculkan karakter Hanzi / CJK selain karakter kanji target itu sendiri, komponen pembentuknya, atau karakter dari contoh kosakata yang diberikan.
   - Dilarang memunculkan huruf Tiongkok sederhana seperti 买, 关, dll.
3. Komponen (components):
   - Berupa array komponen pembentuk langsung [{ "part": string, "meaning_id": string }].
   - meaning_id adalah arti ringkas komponen dalam bahasa Indonesia (misal: "pohon", "orang", "air", "matahari").
4. Kembalikan JSON Array sesuai skema yang diminta.`;

export const RESPONSE_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      kanji: { type: 'STRING' },
      components: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            part: { type: 'STRING' },
            meaning_id: { type: 'STRING' }
          },
          required: ['part', 'meaning_id']
        }
      },
      mnemonic_id: { type: 'STRING' }
    },
    required: ['kanji', 'components', 'mnemonic_id']
  }
};

export function getAllowedCjkSet(fact, radicalVariants, oldForms) {
  const allowed = new Set();
  const addChar = (c) => {
    if (!c) return;
    for (const ch of c) {
      if (/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(ch)) {
        allowed.add(ch);
        // check variants
        if (radicalVariants[ch]) allowed.add(radicalVariants[ch]);
        for (const [vK, vV] of Object.entries(radicalVariants)) {
          if (vV === ch) allowed.add(vK);
        }
      }
    }
  };

  addChar(fact.kanji);
  if (fact.old_form) addChar(fact.old_form);
  if (oldForms[fact.kanji]) addChar(oldForms[fact.kanji]);

  for (const p of fact.flat_parts || []) addChar(p);
  for (const c of fact.components || []) addChar(c);

  const direct = getDirectComponents(fact.tree);
  for (const d of direct) addChar(d);

  for (const w of fact.words || []) {
    addChar(w.jp);
  }

  return allowed;
}

export function buildPrompt(batch, radicalVariants, oldForms) {
  let prompt = `Susun trik mengingat (mnemonik) untuk ${batch.length} kanji berikut:\n\n`;

  for (let i = 0; i < batch.length; i++) {
    const item = batch[i];
    prompt += `=== Kanji ${i + 1}: ${item.kanji} ===\n`;
    prompt += `Arti: ${(item.meaning || []).slice(0, 5).join(', ') || '-'}\n`;
    prompt += `On: ${(item.on || []).join(', ') || '-'}\n`;
    prompt += `Kun: ${(item.kun || []).join(', ') || '-'}\n`;
    prompt += `Goresan: ${item.stroke_count ?? '-'}\n`;
    const oldForm = item.old_form || oldForms[item.kanji] || null;
    prompt += `Bentuk Lama: ${oldForm || 'tidak ada'}\n`;

    const direct = getDirectComponents(item.tree);
    const directWithVars = [];
    for (const d of direct) {
      if (radicalVariants[d]) {
        directWithVars.push(`${d} (varian dari ${radicalVariants[d]})`);
      } else {
        directWithVars.push(d);
      }
    }
    prompt += `Komponen Anak Langsung: ${directWithVars.join(', ') || (item.flat_parts || []).join(', ') || '-'}\n`;

    const sampleWords = (item.words || []).slice(0, 2);
    if (sampleWords.length > 0) {
      prompt += `Contoh Kosakata:\n`;
      for (const w of sampleWords) {
        prompt += `  - ${w.jp} (${w.kana}) = ${w.meaning}\n`;
      }
    } else {
      prompt += `Contoh Kosakata: (tidak ada)\n`;
    }
    prompt += `\n`;
  }

  return prompt;
}

export async function callGemini(apiKey, promptText, stats, retryCount = 0) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: {
      temperature: 0.3,
      response_mime_type: 'application/json',
      response_schema: RESPONSE_SCHEMA
    }
  };

  stats.requests++;

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (netErr) {
    if (retryCount < 5) {
      console.warn(`[Network Error] ${netErr.message}, menunggu 3 detik sebelum coba ulang (${retryCount + 1}/5)...`);
      await new Promise(r => setTimeout(r, 3000));
      return callGemini(apiKey, promptText, stats, retryCount + 1);
    }
    throw netErr;
  }

  if (res.status === 429 || res.status === 503) {
    if (retryCount < 5) {
      const delay = 4000 * Math.pow(1.5, retryCount) + Math.random() * 1000;
      console.warn(`[HTTP ${res.status}] Rate limit / busy, menunggu ${Math.round(delay)}ms sebelum coba ulang (${retryCount + 1}/5)...`);
      await new Promise(r => setTimeout(r, delay));
      return callGemini(apiKey, promptText, stats, retryCount + 1);
    }
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API Error (HTTP ${res.status}): ${errText}`);
  }

  const data = await res.json();

  if (data.usageMetadata) {
    stats.promptTokens += data.usageMetadata.promptTokenCount || 0;
    stats.candidatesTokens += data.usageMetadata.candidatesTokenCount || 0;
    stats.totalTokens += data.usageMetadata.totalTokenCount || 0;
  }
  if (data.modelVersion) {
    stats.modelName = data.modelVersion;
  } else {
    stats.modelName = GEMINI_MODEL;
  }

  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Gemini API mengembalikan respons kosong tanpa candidates text');
  }

  return JSON.parse(rawText);
}

// Pemeriksaan ringan
// a. JSON valid dan mnemonic_id berawalan "Cara mengingat:".
// b. Tidak ada karakter CJK pada mnemonik di luar allowed set.
// c. Komponen di luar daftar fakta: BUANG komponen itu saja.
export function validateAiEntry(entry, fact, radicalVariants, oldForms) {
  if (!entry || !entry.kanji || typeof entry.mnemonic_id !== 'string') {
    return { valid: false, reason: 'Field kanji atau mnemonic_id hilang/invalid' };
  }

  const trimmed = entry.mnemonic_id.trim();
  if (!trimmed.startsWith('Cara mengingat:')) {
    return { valid: false, reason: 'Mnemonic tidak diawali "Cara mengingat:"' };
  }

  const allowedSet = getAllowedCjkSet(fact, radicalVariants, oldForms);

  // Check CJK characters in mnemonic
  const cjkChars = trimmed.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || [];
  for (const ch of cjkChars) {
    if (!allowedSet.has(ch)) {
      return { valid: false, reason: `Karakter CJK terlarang di mnemonik: ${ch}` };
    }
  }

  // Filter components (Check c): buang komponen di luar daftar fakta
  const validComponents = [];
  if (Array.isArray(entry.components)) {
    for (const c of entry.components) {
      if (c && c.part) {
        // Cek apakah part atau variannya ada di allowedSet
        let isAllowed = false;
        for (const ch of c.part) {
          if (allowedSet.has(ch)) isAllowed = true;
        }
        if (isAllowed) {
          validComponents.push({
            part: c.part,
            meaning_id: c.meaning_id || ''
          });
        }
      }
    }
  }

  return {
    valid: true,
    entry: {
      kanji: entry.kanji,
      components: validComponents,
      mnemonic_id: trimmed
    }
  };
}

export async function runGenerate() {
  const apiKey = getApiKey();
  const radicalVariants = loadRadicalVariants();
  const oldForms = loadOldForms();
  const manualSet = loadManualSet();

  if (!fs.existsSync(FACTS_FILE)) {
    throw new Error(`Facts file not found at ${FACTS_FILE}`);
  }

  const facts = JSON.parse(fs.readFileSync(FACTS_FILE, 'utf-8'));
  const factsMap = new Map(facts.map(f => [f.kanji, f]));

  // AI Cache untuk resumable
  let aiCache = {};
  if (fs.existsSync(AI_CACHE_FILE)) {
    try {
      aiCache = JSON.parse(fs.readFileSync(AI_CACHE_FILE, 'utf-8'));
      console.log(`Loaded ${Object.keys(aiCache).length} cached AI entries.`);
    } catch (e) {
      console.warn('Cache file corrupt, starting empty:', e.message);
    }
  }

  // Cari kanji yang butuh AI (bukan manual dan belum di cache)
  const targetKanji = [];
  for (const fact of facts) {
    const k = fact.kanji;
    if (manualSet.has(k)) continue;
    if (aiCache[k]) continue;
    targetKanji.push(fact);
  }

  console.log(`Total fakta: ${facts.length}`);
  console.log(`Manual tier: ${manualSet.size}`);
  console.log(`Sudah ada di cache AI: ${Object.keys(aiCache).length}`);
  console.log(`Kanji yang perlu di-generate: ${targetKanji.length}`);

  const stats = {
    requests: 0,
    promptTokens: 0,
    candidatesTokens: 0,
    totalTokens: 0,
    modelName: GEMINI_MODEL
  };

  const basicKanjiList = [];

  // Batching 10 per request
  for (let i = 0; i < targetKanji.length; i += BATCH_SIZE) {
    if (stats.requests >= MAX_REQUESTS) {
      console.warn(`Mencapai batas MAX_REQUESTS (${MAX_REQUESTS}). Menghentikan request tambahan.`);
      break;
    }

    const batch = targetKanji.slice(i, i + BATCH_SIZE);
    console.log(`\n[Request ${stats.requests + 1}] Processing batch ${i + 1}-${i + batch.length} (${batch.map(b => b.kanji).join('')})...`);

    const promptText = buildPrompt(batch, radicalVariants, oldForms);

    let rawResults = null;
    try {
      rawResults = await callGemini(apiKey, promptText, stats);
    } catch (err) {
      console.error(`Gagal panggil Gemini API untuk batch:`, err.message);
    }

    const failedForRetry = [];

    if (Array.isArray(rawResults)) {
      const resultsMap = new Map(rawResults.map(r => [r.kanji, r]));
      for (const item of batch) {
        const res = resultsMap.get(item.kanji);
        if (!res) {
          failedForRetry.push(item);
          continue;
        }
        const val = validateAiEntry(res, item, radicalVariants, oldForms);
        if (val.valid) {
          aiCache[item.kanji] = val.entry;
        } else {
          console.warn(`  Validasi awal gagal [${item.kanji}]: ${val.reason}`);
          failedForRetry.push(item);
        }
      }
    } else {
      // Seluruh batch gagal
      for (const item of batch) failedForRetry.push(item);
    }

    // Ulangi sekali untuk yang gagal
    if (failedForRetry.length > 0 && stats.requests < MAX_REQUESTS) {
      console.log(`  Mencoba ulang ${failedForRetry.length} kanji (${failedForRetry.map(b => b.kanji).join('')})...`);
      await new Promise(r => setTimeout(r, REQUEST_DELAY_MS));
      const retryPrompt = buildPrompt(failedForRetry, radicalVariants, oldForms);
      try {
        const retryResults = await callGemini(apiKey, retryPrompt, stats);
        if (Array.isArray(retryResults)) {
          const retryMap = new Map(retryResults.map(r => [r.kanji, r]));
          for (const item of failedForRetry) {
            const res = retryMap.get(item.kanji);
            const val = validateAiEntry(res, item, radicalVariants, oldForms);
            if (val.valid) {
              aiCache[item.kanji] = val.entry;
              console.log(`  Retry sukses [${item.kanji}]`);
            } else {
              console.log(`  Retry gagal [${item.kanji}] -> Masuk tier "basic"`);
              aiCache[item.kanji] = { kanji: item.kanji, tier: 'basic' };
              basicKanjiList.push(item.kanji);
            }
          }
        } else {
          for (const item of failedForRetry) {
            aiCache[item.kanji] = { kanji: item.kanji, tier: 'basic' };
            basicKanjiList.push(item.kanji);
          }
        }
      } catch (err) {
        console.error(`  Retry gagal dipanggil:`, err.message);
        for (const item of failedForRetry) {
          aiCache[item.kanji] = { kanji: item.kanji, tier: 'basic' };
          basicKanjiList.push(item.kanji);
        }
      }
    } else if (failedForRetry.length > 0) {
      // Tidak bisa retry karena limit
      for (const item of failedForRetry) {
        aiCache[item.kanji] = { kanji: item.kanji, tier: 'basic' };
        basicKanjiList.push(item.kanji);
      }
    }

    // Simpan cache berkala
    fs.writeFileSync(AI_CACHE_FILE, JSON.stringify(aiCache, null, 2), 'utf-8');
    await new Promise(r => setTimeout(r, REQUEST_DELAY_MS));
  }

  // Tulis cache final
  fs.writeFileSync(AI_CACHE_FILE, JSON.stringify(aiCache, null, 2), 'utf-8');

  console.log('\n=== STATISTIK GEMINI API ===');
  console.log(`Model: ${stats.modelName}`);
  console.log(`Jumlah Permintaan API: ${stats.requests}`);
  console.log(`Prompt Tokens: ${stats.promptTokens}`);
  console.log(`Candidates Tokens: ${stats.candidatesTokens}`);
  console.log(`Total Tokens: ${stats.totalTokens}`);

  return { stats, aiCache };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runGenerate().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
