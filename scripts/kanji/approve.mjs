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

export function parseArgs() {
  const args = process.argv.slice(2);
  const onlyIndex = args.indexOf('--only');
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

  return { onlyKanji };
}

export function approveEntries({ onlyKanji = new Set() } = {}) {
  if (onlyKanji.size === 0) {
    throw new Error('Gunakan flag --only <daftar_kanji> untuk menyetujui kanji tertentu.');
  }

  if (!fs.existsSync(KANJI_INFO_FILE)) {
    throw new Error(`Berkas kanji-info.json tidak ditemukan di ${KANJI_INFO_FILE}. Jalankan validate.mjs dulu!`);
  }

  const allEntries = JSON.parse(fs.readFileSync(KANJI_INFO_FILE, 'utf-8'));
  let newlyApproved = 0;
  let skippedCount = 0;
  let rejectedCount = 0;

  // Baca target final yang sudah ada jika ada agar tidak menimpa entri yang sudah approved sebelumnya
  let finalMap = {};
  if (fs.existsSync(TARGET_FINAL_FILE)) {
    try {
      finalMap = JSON.parse(fs.readFileSync(TARGET_FINAL_FILE, 'utf-8'));
    } catch (e) {
      finalMap = {};
    }
  }

  for (const entry of allEntries) {
    if (!onlyKanji.has(entry.kanji)) {
      skippedCount++;
      continue;
    }

    if (entry.status === 'rejected') {
      console.warn(`⚠️ Menolak menyetujui kanji ${entry.kanji} karena berstatus 'rejected'.`);
      rejectedCount++;
      continue;
    }

    // Setujui entri
    entry.status = 'approved';
    newlyApproved++;

    finalMap[entry.kanji] = {
      kanji: entry.kanji,
      meaning: entry.facts?.meaning || [],
      on: entry.facts?.on || [],
      kun: entry.facts?.kun || [],
      stroke_count: entry.facts?.stroke_count ?? null,
      jlpt: entry.facts?.jlpt ?? null,
      grade: entry.facts?.grade ?? null,
      formation_type: entry.formation_type,
      components: entry.components || [],
      etymology_id: entry.etymology_id,
      etymology_confidence: entry.etymology_confidence,
      mnemonic_id: entry.mnemonic_id,
      note_id: entry.note_id || '',
      phonetic_part: entry.facts?.phonetic_part || entry.phonetic_part || null,
      reading_hint: entry.reading_hint || null,
      claim_kind: entry.claim_kind || 'structure',
      old_form: entry.facts?.old_form || entry.old_form || null,
      words: entry.facts?.words || []
    };
  }

  // Perbarui kanji-info.json
  fs.writeFileSync(KANJI_INFO_FILE, JSON.stringify(allEntries, null, 2), 'utf-8');

  // Tulis ke src/data/kanjiInfo.json
  const finalJsonStr = JSON.stringify(finalMap, null, 2);
  fs.writeFileSync(TARGET_FINAL_FILE, finalJsonStr, 'utf-8');

  const rawBytes = Buffer.byteLength(finalJsonStr, 'utf-8');
  const gzipBytes = zlib.gzipSync(finalJsonStr).length;

  return {
    total: allEntries.length,
    approved: newlyApproved,
    skipped: skippedCount,
    rejected: rejectedCount,
    rawBytes,
    gzipBytes,
    targetFile: TARGET_FINAL_FILE
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { onlyKanji } = parseArgs();
  if (onlyKanji.size === 0) {
    console.error('❌ Harap berikan daftar kanji yang disetujui: node scripts/kanji/approve.mjs --only <daftar>');
    process.exit(1);
  }

  console.log(`🚀 Menyetujui kanji terpilih (${Array.from(onlyKanji).join(', ')})...`);
  const result = approveEntries({ onlyKanji });

  console.log(`\n✅ Persetujuan selesai!`);
  console.log(`📊 Total entri di katalog: ${result.total}`);
  console.log(`✅ Approved baru: ${result.approved}`);
  console.log(`⏸ Dilewati: ${result.skipped}`);
  console.log(`❌ Ditolak (Rejected): ${result.rejected}`);
  console.log(`💾 Berkas final: ${result.targetFile}`);
  console.log(`📏 Ukuran raw: ${(result.rawBytes / 1024).toFixed(2)} KB (${result.rawBytes} bytes)`);
  console.log(`📦 Ukuran gzip: ${(result.gzipBytes / 1024).toFixed(2)} KB (${result.gzipBytes} bytes)`);
}
