// scripts/kanji/approve.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.resolve(__dirname, 'out');
const KANJI_INFO_FILE = path.resolve(OUT_DIR, 'kanji-info.json');
const TARGET_FINAL_FILE = path.resolve(__dirname, '../../src/data/kanjiInfo.json');
const MANUAL_ENTRIES_FILE = path.resolve(__dirname, 'data/manual_entries.json');

// Daftar kanji hasil Gemini yang disetujui (15 kanji)
export const GEMINI_APPROVED_KANJI = new Set([
  '梅', '紙', '荷', '警', '跳', '象', '迎', '通', '鉛', '答', '冷', '究', '花', '起', '靴'
]);

export function parseArgs() {
  const args = process.argv.slice(2);
  const onlyIndex = args.indexOf('--only');
  const rebuild = args.includes('--rebuild') || args.includes('--all-approved');
  const onlyKanji = new Set();

  if (onlyIndex !== -1 && args[onlyIndex + 1]) {
    const rawOnly = args.slice(onlyIndex + 1).join(' ');
    const items = rawOnly.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
    for (const item of items) {
      for (const char of item) {
        if (/[\u4e00-\u9fff]/.test(char)) {
          onlyKanji.add(char);
        }
      }
    }
  }

  return { onlyKanji, rebuild };
}

export function rebuildApprovedCatalog() {
  if (!fs.existsSync(KANJI_INFO_FILE)) {
    throw new Error(`Berkas kanji-info.json tidak ditemukan di ${KANJI_INFO_FILE}. Jalankan validate.mjs dulu!`);
  }

  const allEntries = JSON.parse(fs.readFileSync(KANJI_INFO_FILE, 'utf-8'));
  const allEntriesMap = new Map(allEntries.map(e => [e.kanji, e]));

  // Load manual entries
  let manualEntries = [];
  if (fs.existsSync(MANUAL_ENTRIES_FILE)) {
    const mData = JSON.parse(fs.readFileSync(MANUAL_ENTRIES_FILE, 'utf-8'));
    manualEntries = mData.entries || (Array.isArray(mData) ? mData : []);
  }

  // Final map hanya berisi: manual (158) + 15 Gemini approved
  const finalMap = {};

  // 1. Masukkan entri manual
  for (const m of manualEntries) {
    const k = m.kanji;
    const infoEntry = allEntriesMap.get(k);
    finalMap[k] = {
      kanji: k,
      meaning: infoEntry?.facts?.meaning || [],
      on: infoEntry?.facts?.on || [],
      kun: infoEntry?.facts?.kun || [],
      stroke_count: infoEntry?.facts?.stroke_count ?? null,
      jlpt: infoEntry?.facts?.jlpt ?? null,
      grade: infoEntry?.facts?.grade ?? null,
      formation_type: m.formation_type || 'unknown',
      components: m.components || [],
      etymology_id: m.etymology_id || '',
      etymology_confidence: m.etymology_confidence || 'established',
      mnemonic_id: m.mnemonic_id || '',
      note_id: m.note_id || '',
      phonetic_part: m.phonetic_part || infoEntry?.facts?.phonetic_part || null,
      reading_hint: m.reading_hint || null,
      claim_kind: m.claim_kind || 'structure',
      old_form: m.old_form || infoEntry?.facts?.old_form || null,
      words: infoEntry?.facts?.words || []
    };
  }

  // 2. Masukkan 15 Gemini approved entries
  for (const k of GEMINI_APPROVED_KANJI) {
    if (finalMap[k]) continue; // Hindari duplikasi jika ada tumpang tindih
    const infoEntry = allEntriesMap.get(k);
    if (!infoEntry) {
      console.warn(`⚠️ Entri Gemini approved [${k}] tidak ditemukan di kanji-info.json!`);
      continue;
    }
    finalMap[k] = {
      kanji: k,
      meaning: infoEntry.facts?.meaning || [],
      on: infoEntry.facts?.on || [],
      kun: infoEntry.facts?.kun || [],
      stroke_count: infoEntry.facts?.stroke_count ?? null,
      jlpt: infoEntry.facts?.jlpt ?? null,
      grade: infoEntry.facts?.grade ?? null,
      formation_type: infoEntry.formation_type || 'unknown',
      components: infoEntry.components || [],
      etymology_id: infoEntry.etymology_id || '',
      etymology_confidence: infoEntry.etymology_confidence || 'established',
      mnemonic_id: infoEntry.mnemonic_id || '',
      note_id: infoEntry.note_id || '',
      phonetic_part: infoEntry.facts?.phonetic_part || infoEntry.phonetic_part || null,
      reading_hint: infoEntry.reading_hint || null,
      claim_kind: infoEntry.claim_kind || 'structure',
      old_form: infoEntry.facts?.old_form || infoEntry.old_form || null,
      words: infoEntry.facts?.words || []
    };
  }

  // Update status di allEntries agar mencerminkan finalMap
  for (const entry of allEntries) {
    if (finalMap[entry.kanji]) {
      entry.status = 'approved';
    } else if (entry.status === 'approved') {
      entry.status = 'draft';
    }
  }

  // Perbarui kanji-info.json
  fs.writeFileSync(KANJI_INFO_FILE, JSON.stringify(allEntries, null, 2), 'utf-8');

  // Tulis ke src/data/kanjiInfo.json
  const finalJsonStr = JSON.stringify(finalMap, null, 2);
  fs.writeFileSync(TARGET_FINAL_FILE, finalJsonStr, 'utf-8');

  const rawBytes = Buffer.byteLength(finalJsonStr, 'utf-8');
  const gzipBytes = zlib.gzipSync(finalJsonStr).length;

  const keys = Object.keys(finalMap);
  // Pilih 5 kanji acak
  const shuffled = [...keys].sort(() => 0.5 - Math.random());
  const sample5 = shuffled.slice(0, 5).map(k => ({
    kanji: k,
    status: 'approved',
    source: GEMINI_APPROVED_KANJI.has(k) ? 'gemini' : 'manual',
    formation_type: finalMap[k].formation_type,
    meaning: finalMap[k].meaning.slice(0, 2).join(', ')
  }));

  return {
    totalKeys: keys.length,
    manualCount: manualEntries.length,
    geminiApprovedCount: GEMINI_APPROVED_KANJI.size,
    rawBytes,
    gzipBytes,
    targetFile: TARGET_FINAL_FILE,
    sample5
  };
}

export function approveEntries({ onlyKanji = new Set() } = {}) {
  if (onlyKanji.size === 0) {
    return rebuildApprovedCatalog();
  }

  for (const k of onlyKanji) {
    GEMINI_APPROVED_KANJI.add(k);
  }

  return rebuildApprovedCatalog();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { onlyKanji, rebuild } = parseArgs();
  console.log('🔄 Membangun ulang src/data/kanjiInfo.json dari entri approved...');
  const result = onlyKanji.size > 0 ? approveEntries({ onlyKanji }) : rebuildApprovedCatalog();

  console.log(`\n✅ Katalog kanjiInfo.json berhasil dibangun!`);
  console.log(`📊 Total kunci (keys): ${result.totalKeys}`);
  console.log(`   - Manual entries: ${result.manualCount}`);
  console.log(`   - Gemini approved: ${result.geminiApprovedCount}`);
  console.log(`💾 Berkas: ${result.targetFile}`);
  console.log(`📏 Ukuran raw: ${(result.rawBytes / 1024).toFixed(2)} KB (${result.rawBytes} bytes)`);
  console.log(`📦 Ukuran gzip: ${(result.gzipBytes / 1024).toFixed(2)} KB (${result.gzipBytes} bytes)`);
  console.log(`\n🎲 5 Kanji acak dan statusnya:`);
  console.table(result.sample5);
}
