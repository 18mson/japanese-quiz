// scripts/kanji/validate.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateAll } from './generate.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.resolve(__dirname, 'out');
const RAW_DIR = path.resolve(OUT_DIR, 'raw');
const FACTS_FILE = path.resolve(OUT_DIR, 'facts.json');
const KANJI_INFO_FILE = path.resolve(OUT_DIR, 'kanji-info.json');
const REVIEW_SAMPLE_FILE = path.resolve(OUT_DIR, 'review-sample.md');

export function countWords(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

export function validateEntry(entry, factsMap) {
  const reasons = [];

  // 1. JSON valid & semua field wajib terisi
  const requiredFields = ['kanji', 'formation_type', 'components', 'etymology_id', 'etymology_confidence', 'mnemonic_id', 'note_id'];
  for (const field of requiredFields) {
    if (entry[field] === undefined || entry[field] === null) {
      reasons.push(`Field '${field}' wajib ada`);
    }
  }

  if (reasons.length > 0) {
    return { valid: false, status: 'rejected', reasons };
  }

  // 2. Cek kesesuaian komponen KRADFILE
  const fact = factsMap.get(entry.kanji);
  const kradComponents = new Set(fact?.components || []);

  if (!Array.isArray(entry.components)) {
    reasons.push(`'components' harus berupa array`);
  } else {
    for (const comp of entry.components) {
      if (!comp.part) {
        reasons.push(`Komponen tanpa 'part'`);
      } else if (!kradComponents.has(comp.part)) {
        reasons.push(`Komponen '${comp.part}' tidak ada dalam KRADFILE untuk kanji ${entry.kanji}`);
      }
      if (!comp.role || !['meaning', 'phonetic', 'shape'].includes(comp.role)) {
        reasons.push(`Role komponen '${comp.part}' tidak valid: ${comp.role}`);
      }
      if (!comp.meaning_id || typeof comp.meaning_id !== 'string') {
        reasons.push(`meaning_id komponen '${comp.part}' tidak valid`);
      }
    }
  }

  // 3. Larangan: angka tahun (\b\d{3,4}\b), kata "dinasti", "tulang ramalan", atau pola "pada zaman"
  const forbiddenPatterns = [
    { regex: /\b\d{3,4}\b/, name: 'angka tahun' },
    { regex: /\bdinasti\b/i, name: 'kata "dinasti"' },
    { regex: /tulang ramalan/i, name: 'kata "tulang ramalan"' },
    { regex: /pada zaman/i, name: 'frasa "pada zaman"' }
  ];

  const textsToCheck = [
    { name: 'etymology_id', text: entry.etymology_id || '' },
    { name: 'mnemonic_id', text: entry.mnemonic_id || '' },
    { name: 'note_id', text: entry.note_id || '' }
  ];

  for (const { name, text } of textsToCheck) {
    for (const { regex, name: patternName } of forbiddenPatterns) {
      if (regex.test(text)) {
        reasons.push(`Field '${name}' mengandung teks terlarang: ${patternName}`);
      }
    }
  }

  // 4. Batasan panjang teks
  const etymologyWordCount = countWords(entry.etymology_id);
  if (etymologyWordCount > 50) {
    reasons.push(`Panjang etymology_id melebihi 50 kata (${etymologyWordCount} kata)`);
  }

  const mnemonicWordCount = countWords(entry.mnemonic_id);
  if (mnemonicWordCount > 40) {
    reasons.push(`Panjang mnemonic_id melebihi 40 kata (${mnemonicWordCount} kata)`);
  }

  // Mnemonic harus diawali "Cara mengingat:"
  if (!entry.mnemonic_id || !entry.mnemonic_id.trim().startsWith('Cara mengingat:')) {
    reasons.push(`mnemonic_id harus diawali dengan 'Cara mengingat:'`);
  }

  // Jika ada pelanggaran, status rejected
  if (reasons.length > 0) {
    return { valid: false, status: 'rejected', reasons };
  }

  // Status awal: 'uncertain' dan formation_type 'unknown' -> needs_review; selain itu 'draft'
  let status = 'draft';
  if (entry.etymology_confidence === 'uncertain' || entry.formation_type === 'unknown') {
    status = 'needs_review';
  }

  return { valid: true, status, reasons: [] };
}

export async function runValidation({ autoRetry = true } = {}) {
  if (!fs.existsSync(FACTS_FILE)) {
    throw new Error('facts.json tidak ditemukan!');
  }
  const factsList = JSON.parse(fs.readFileSync(FACTS_FILE, 'utf-8'));
  const factsMap = new Map(factsList.map(f => [f.kanji, f]));

  // Baca semua file di RAW_DIR
  if (!fs.existsSync(RAW_DIR)) {
    throw new Error('Folder out/raw tidak ditemukan!');
  }

  const rawFiles = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.json'));
  console.log(`🔍 Memvalidasi ${rawFiles.length} berkas mentah kanji...`);

  const validatedEntries = new Map();
  const rejectedKanji = [];

  for (const file of rawFiles) {
    try {
      const rawContent = fs.readFileSync(path.resolve(RAW_DIR, file), 'utf-8');
      const entry = JSON.parse(rawContent);
      const validation = validateEntry(entry, factsMap);

      const fact = factsMap.get(entry.kanji);
      const fullEntry = {
        ...entry,
        status: validation.status,
        reasons: validation.reasons,
        facts: {
          meaning: fact?.meaning || [],
          on: fact?.on || [],
          kun: fact?.kun || [],
          stroke_count: fact?.stroke_count ?? null,
          jlpt: fact?.jlpt ?? null,
          grade: fact?.grade ?? null,
          components: fact?.components || [],
          words: fact?.words || []
        }
      };

      validatedEntries.set(entry.kanji, fullEntry);
      if (validation.status === 'rejected') {
        rejectedKanji.push({ kanji: entry.kanji, reasons: validation.reasons });
      }
    } catch (err) {
      console.error(`Gagal memproses file ${file}:`, err.message);
    }
  }

  // Regenerasi kanji yang rejected (maksimal 2 kali per aturan FASE C)
  if (autoRetry && rejectedKanji.length > 0) {
    console.log(`\n⚠️ Terdeteksi ${rejectedKanji.length} kanji dengan status 'rejected'. Mencoba regenerasi maksimal 2 kali...`);
    const kanjiToRetry = rejectedKanji.map(r => r.kanji);

    for (let attempt = 1; attempt <= 2; attempt++) {
      console.log(`\n🔄 [Attempt ${attempt}/2] Regenerasi ${kanjiToRetry.length} kanji rejected...`);
      await generateAll({ specificKanji: kanjiToRetry, overwrite: true });

      // Validasi ulang hasil retry
      const stillRejected = [];
      for (const k of kanjiToRetry) {
        const rawFile = path.resolve(RAW_DIR, `${k}.json`);
        if (fs.existsSync(rawFile)) {
          const entry = JSON.parse(fs.readFileSync(rawFile, 'utf-8'));
          const validation = validateEntry(entry, factsMap);
          const fact = factsMap.get(entry.kanji);
          const fullEntry = {
            ...entry,
            status: validation.status,
            reasons: validation.reasons,
            facts: {
              meaning: fact?.meaning || [],
              on: fact?.on || [],
              kun: fact?.kun || [],
              stroke_count: fact?.stroke_count ?? null,
              jlpt: fact?.jlpt ?? null,
              grade: fact?.grade ?? null,
              components: fact?.components || [],
              words: fact?.words || []
            }
          };
          validatedEntries.set(k, fullEntry);
          if (validation.status === 'rejected') {
            stillRejected.push({ kanji: k, reasons: validation.reasons });
          }
        }
      }

      if (stillRejected.length === 0) {
        console.log(`✅ Semua kanji rejected berhasil lolos validasi setelah percobaan ke-${attempt}!`);
        break;
      }
      kanjiToRetry.length = 0;
      for (const item of stillRejected) kanjiToRetry.push(item.kanji);
    }
  }

  // Hitung statistik final
  const allEntries = Array.from(validatedEntries.values());
  const approvedList = allEntries.filter(e => e.status === 'approved');
  const needsReviewList = allEntries.filter(e => e.status === 'needs_review');
  const draftList = allEntries.filter(e => e.status === 'draft');
  const finalRejectedList = allEntries.filter(e => e.status === 'rejected');

  // Simpan kanji-info.json
  fs.writeFileSync(KANJI_INFO_FILE, JSON.stringify(allEntries, null, 2), 'utf-8');

  // Hasilkan review-sample.md (30 kanji acak dari non-rejected atau draft/needs_review)
  generateReviewSample(allEntries);

  return {
    total: allEntries.length,
    approved: approvedList.length,
    needs_review: needsReviewList.length,
    draft: draftList.length,
    rejected: finalRejectedList.length,
    rejectedDetails: finalRejectedList
  };
}

export function generateReviewSample(allEntries) {
  const eligible = allEntries.filter(e => e.status !== 'rejected');
  // Ambil 30 kanji deterministik berbasis seed/sample
  const shuffled = [...eligible].sort((a, b) => {
    // Seed deterministik sederhana berdasarkan kode karakter
    return ((a.kanji.charCodeAt(0) * 9301 + 49297) % 233280) - ((b.kanji.charCodeAt(0) * 9301 + 49297) % 233280);
  });
  const sample30 = shuffled.slice(0, 30);

  let md = `# Sampel Peninjauan Kanji (30 Kanji Acak)\n\n`;
  md += `Tabel berikut disusun untuk ditinjau secara manual sebelum persetujuan akhir (status \`approved\`).\n\n`;
  md += `| No | Kanji | Arti | Komponen KRADFILE | Asal-usul (Etymology) | Keyakinan | Cara Mengingat (Mnemonic) |\n`;
  md += `|:---:|:---:|:---|:---|:---|:---:|:---|\n`;

  for (let i = 0; i < sample30.length; i++) {
    const e = sample30[i];
    const meanings = (e.facts?.meaning || []).slice(0, 3).join(', ');
    const krad = (e.facts?.components || []).join(' ');
    const cleanEtym = (e.etymology_id || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const cleanMnem = (e.mnemonic_id || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    md += `| ${i + 1} | **${e.kanji}** | ${meanings} | \`${krad}\` | ${cleanEtym} | \`${e.etymology_confidence}\` | ${cleanMnem} |\n`;
  }

  md += `\n\n---\n*Gunakan perintah \`node scripts/kanji/approve.mjs --all-except <daftar kanji>\` untuk menyetujui hasil setelah tinjauan manual.*\n`;

  fs.writeFileSync(REVIEW_SAMPLE_FILE, md, 'utf-8');
  console.log(`📝 Sampel tinjauan 30 kanji disimpan ke: ${REVIEW_SAMPLE_FILE}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runValidation().then(stats => {
    console.log('\n📊 Ringkasan Hasil Validasi:');
    console.log(`Total entri: ${stats.total}`);
    console.log(`- Draft: ${stats.draft}`);
    console.log(`- Needs Review: ${stats.needs_review}`);
    console.log(`- Approved: ${stats.approved}`);
    console.log(`- Rejected: ${stats.rejected}`);
    if (stats.rejected > 0) {
      console.log('\nDaftar kanji rejected:');
      for (const r of stats.rejectedDetails.slice(0, 10)) {
        console.log(`- ${r.kanji}: ${r.reasons.join('; ')}`);
      }
    }
  }).catch(err => {
    console.error('❌ Gagal menjalankan validate.mjs:', err);
    process.exit(1);
  });
}
