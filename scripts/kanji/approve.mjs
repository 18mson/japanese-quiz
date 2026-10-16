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
  const exceptIndex = args.indexOf('--all-except');
  const exceptKanji = new Set();

  if (exceptIndex !== -1 && args[exceptIndex + 1]) {
    const rawExcept = args.slice(exceptIndex + 1).join(' ');
    // Split by comma or whitespace
    const items = rawExcept.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
    for (const item of items) {
      // Each kanji might be multiple characters if concatenated without spaces
      for (const char of item) {
        if (/[\u4e00-\u9fff]/.test(char)) {
          exceptKanji.add(char);
        }
      }
    }
  }

  return { exceptKanji };
}

export function approveEntries({ exceptKanji = new Set() } = {}) {
  if (!fs.existsSync(KANJI_INFO_FILE)) {
    throw new Error(`Berkas kanji-info.json tidak ditemukan di ${KANJI_INFO_FILE}. Jalankan validate.mjs dulu!`);
  }

  const allEntries = JSON.parse(fs.readFileSync(KANJI_INFO_FILE, 'utf-8'));
  let newlyApproved = 0;
  let skippedExcept = 0;
  let rejectedCount = 0;

  const finalMap = {};

  for (const entry of allEntries) {
    if (entry.status === 'rejected') {
      rejectedCount++;
      continue;
    }

    if (exceptKanji.has(entry.kanji)) {
      entry.status = 'needs_review';
      skippedExcept++;
      continue;
    }

    // Setujui entri
    entry.status = 'approved';
    newlyApproved++;

    // Format entri final untuk aplikasi (tanpa internal status/reasons)
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
    except: skippedExcept,
    rejected: rejectedCount,
    rawBytes,
    gzipBytes,
    targetFile: TARGET_FINAL_FILE
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { exceptKanji } = parseArgs();
  console.log(`🚀 Menyetujui kanji (dikecualikan: ${exceptKanji.size === 0 ? 'tidak ada' : Array.from(exceptKanji).join(', ')})...`);

  const result = approveEntries({ exceptKanji });

  console.log(`\n✅ Persetujuan selesai!`);
  console.log(`📊 Total entri: ${result.total}`);
  console.log(`✅ Approved: ${result.approved}`);
  console.log(`⏸ Dikecualikan (Needs Review): ${result.except}`);
  console.log(`❌ Ditolak (Rejected): ${result.rejected}`);
  console.log(`💾 Berkas final: ${result.targetFile}`);
  console.log(`📏 Ukuran raw: ${(result.rawBytes / 1024).toFixed(2)} KB (${result.rawBytes} bytes)`);
  console.log(`📦 Ukuran gzip: ${(result.gzipBytes / 1024).toFixed(2)} KB (${result.gzipBytes} bytes)`);
}
