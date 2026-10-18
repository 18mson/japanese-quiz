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
const PICTOGRAPHS_FILE = path.resolve(__dirname, 'data/pictographs.json');

export function countWords(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

export function loadPictographs() {
  if (fs.existsSync(PICTOGRAPHS_FILE)) {
    try {
      const list = JSON.parse(fs.readFileSync(PICTOGRAPHS_FILE, 'utf-8'));
      if (Array.isArray(list)) return new Set(list);
    } catch (e) {
      console.warn(`Gagal membaca ${PICTOGRAPHS_FILE}:`, e.message);
    }
  }
  return new Set(['象', '日', '月', '木', '山', '川', '人', '口', '目', '手']);
}

export function determineConfidence(entry, fact, pictographsSet) {
  const kanji = entry.kanji;
  const isPictograph = pictographsSet.has(kanji);
  const isPhonoSemanticMatch = (
    !!fact?.phonetic_part &&
    entry.formation_type === 'phono_semantic' &&
    entry.claim_kind !== 'unknown'
  );

  if (isPictograph || isPhonoSemanticMatch) {
    return 'established';
  }

  if (entry.claim_kind === 'unknown' || entry.formation_type === 'unknown') {
    return 'uncertain';
  }

  return 'traditional';
}

export function checkMnemonicQuality(mnemonic, fact, entry) {
  const reasons = [];
  if (!mnemonic || !mnemonic.trim().startsWith('Cara mengingat:')) {
    reasons.push("mnemonic_id harus diawali dengan 'Cara mengingat:'");
    return reasons;
  }

  const wordCount = countWords(mnemonic);
  if (wordCount > 40) {
    reasons.push(`Panjang mnemonic_id melebihi 40 kata (${wordCount} kata)`);
  }

  const body = mnemonic.replace(/^Cara mengingat:\s*/i, '').trim();

  // 1. Cek keberadaan petunjuk bunyi
  const soundClueRegex = /(bunyi|suara|bacaan|lafal|diucapkan|mirip|pengucapan)/i;
  const arrowRegex = /[→\->]/;
  const romajiInParens = /\([a-zōūāīē\s]+\)/i;

  let hasSoundClue = soundClueRegex.test(body) || arrowRegex.test(body) || romajiInParens.test(body);

  // Cek apakah menyebutkan on/kun reading kanji atau reading_hint
  const allReadings = [...(fact?.on || []), ...(fact?.kun || [])].map(r => r.replace(/[.\-].*$/, '').trim()).filter(Boolean);
  if (!hasSoundClue) {
    for (const r of allReadings) {
      if (r.length >= 2 && body.includes(r)) {
        hasSoundClue = true;
        break;
      }
    }
  }

  // 2. Cek keberadaan citra konkret atau penyebutan komponen
  const commonImagery = [
    'orang', 'anak', 'wanita', 'perempuan', 'ibu', 'bapak', 'pria',
    'pohon', 'kayu', 'hutan', 'daun', 'bunga', 'buah', 'akar', 'tanaman', 'rumput',
    'air', 'sungai', 'hujan', 'laut', 'danau', 'es', 'tetes', 'salju',
    'api', 'panas', 'cahaya', 'matahari', 'bulan', 'bintang',
    'tanah', 'bumi', 'ladang', 'sawah', 'gunung', 'batu', 'pasir',
    'mata', 'tangan', 'kaki', 'mulut', 'telinga', 'hidung', 'kepala', 'hati', 'badan', 'tubuh',
    'atap', 'rumah', 'pintu', 'gerbang', 'jendela', 'pagar', 'dinding', 'gedung', 'bangunan',
    'pedang', 'pisau', 'senjata', 'panah', 'tombak', 'tongkat',
    'mobil', 'kereta', 'kendaraan', 'roda', 'perahu', 'kapal',
    'benang', 'kain', 'tali', 'baju', 'pakaian', 'topi',
    'emas', 'besi', 'logam', 'uang', 'koin',
    'hewan', 'gajah', 'kuda', 'burung', 'ikan', 'sapi', 'anjing', 'kucing', 'serangga',
    'cangkang', 'tulang', 'sayap', 'bulu',
    'buku', 'kertas', 'pena', 'tulisan', 'kotak', 'lingkaran', 'garis', 'gambar', 'mangkuk', 'meja'
  ];

  let hasImagery = false;
  // Cek penyebutan komponen fisik atau meaning_id komponen
  for (const comp of entry.components || []) {
    if (comp.part && body.includes(comp.part)) {
      hasImagery = true;
      break;
    }
    if (comp.meaning_id) {
      const words = comp.meaning_id.toLowerCase().split(/[\s,()/]+/).filter(w => w.length > 2);
      for (const w of words) {
        if (body.toLowerCase().includes(w)) {
          hasImagery = true;
          break;
        }
      }
    }
    if (hasImagery) break;
  }

  if (!hasImagery) {
    const lowerBody = body.toLowerCase();
    for (const img of commonImagery) {
      if (lowerBody.includes(img)) {
        hasImagery = true;
        break;
      }
    }
  }

  // 3. Deteksi apakah HANYA mengulang arti
  if (!hasSoundClue && !hasImagery) {
    reasons.push('Mnemonik hanya mengulang arti kanji tanpa memuat citra konkret atau petunjuk bunyi');
  }

  return reasons;
}

export function validateEntry(entry, factsMap, pictographsSet) {
  const reasons = [];

  // 1. JSON valid & semua field wajib terisi
  const requiredFields = ['kanji', 'formation_type', 'claim_kind', 'components', 'etymology_id', 'mnemonic_id', 'note_id'];
  for (const field of requiredFields) {
    if (entry[field] === undefined || entry[field] === null) {
      reasons.push(`Field '${field}' wajib ada`);
    }
  }

  if (reasons.length > 0) {
    return { valid: false, status: 'rejected', reasons, confidence: 'uncertain' };
  }

  // 2. Cek kesesuaian komponen: harus ada di tree.flat_parts, KRADFILE, atau old_form
  const fact = factsMap.get(entry.kanji);
  const flatParts = new Set(fact?.flat_parts || []);
  const kradParts = new Set(fact?.components || []);
  const allowedParts = new Set([...flatParts, ...kradParts]);

  if (fact?.old_form) {
    allowedParts.add(fact.old_form);
  }
  if (fact?.phonetic_part) {
    allowedParts.add(fact.phonetic_part);
    const cleaned = fact.phonetic_part.replace(/[0-9V\/].*$/, '').trim();
    if (cleaned) allowedParts.add(cleaned);
  }

  if (!Array.isArray(entry.components) || entry.components.length === 0) {
    reasons.push(`'components' harus berupa array dan tidak boleh kosong`);
  } else {
    for (const comp of entry.components) {
      if (!comp.part) {
        reasons.push(`Komponen tanpa 'part'`);
      } else if (!allowedParts.has(comp.part)) {
        reasons.push(`Komponen '${comp.part}' tidak ada dalam flat_parts KanjiVG, KRADFILE, maupun old_form untuk kanji ${entry.kanji}`);
      }
      if (!comp.role || !['meaning', 'phonetic', 'shape'].includes(comp.role)) {
        reasons.push(`Role komponen '${comp.part}' tidak valid: ${comp.role}`);
      }
      if (!comp.meaning_id || typeof comp.meaning_id !== 'string') {
        reasons.push(`meaning_id komponen '${comp.part}' tidak valid`);
      }

      // Jika komponen ini adalah phonetic_part dari fakta, periksa role-nya
      if (fact?.phonetic_part) {
        const isTargetPhon = (
          comp.part === fact.phonetic_part ||
          fact.phonetic_part.startsWith(comp.part) ||
          comp.part === fact.phonetic_part.replace(/[0-9V\/].*$/, '').trim()
        );
        if (isTargetPhon && comp.role !== 'phonetic') {
          reasons.push(`Komponen penanda bunyi '${comp.part}' diberi role '${comp.role}', wajib 'phonetic'`);
        }
      }
    }
  }

  // 3. Aturan phonetic_part: jika facts.phonetic_part ada, output WAJIB menyatakan bagian itu sebagai role 'phonetic' dan memuat reading_hint
  if (fact?.phonetic_part) {
    const hasPhoneticRole = (entry.components || []).some(c => c.role === 'phonetic');
    if (!hasPhoneticRole) {
      reasons.push(`facts.phonetic_part ada ('${fact.phonetic_part}'), tetapi tidak ada komponen ber-role 'phonetic'`);
    }

    if (!entry.reading_hint || typeof entry.reading_hint !== 'string' || entry.reading_hint.trim().length === 0) {
      reasons.push(`facts.phonetic_part ada ('${fact.phonetic_part}'), wajib menyertakan 'reading_hint'`);
    }
  }

  // 4. Larangan teks sejarah & pola terlarang
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

  // 5. Batasan panjang teks etymology_id
  const etymologyWordCount = countWords(entry.etymology_id);
  if (etymologyWordCount > 50) {
    reasons.push(`Panjang etymology_id melebihi 50 kata (${etymologyWordCount} kata)`);
  }

  // 6. Validasi kualitas mnemonik (tidak boleh hanya mengulang arti, maks 40 kata)
  const mnemonicReasons = checkMnemonicQuality(entry.mnemonic_id, fact, entry);
  for (const r of mnemonicReasons) reasons.push(r);

  // 7. Hitung keyakinan hasil skrip
  const calculatedConfidence = determineConfidence(entry, fact, pictographsSet);

  // Entri 'uncertain': tampilkan hanya struktur + reading_hint; dilarang klaim "berasal dari..."
  if (calculatedConfidence === 'uncertain') {
    if (/berasal dari/i.test(entry.etymology_id || '')) {
      reasons.push("Entri berkeyakinan 'uncertain' dilarang memuat klaim 'berasal dari ...'");
    }
    if (/asal[- ]usul/i.test(entry.etymology_id || '')) {
      reasons.push("Entri berkeyakinan 'uncertain' dilarang memuat klaim 'asal-usul'");
    }
  }

  // Jika ada pelanggaran, status rejected
  if (reasons.length > 0) {
    return { valid: false, status: 'rejected', reasons, confidence: calculatedConfidence };
  }

  let status = 'draft';
  if (calculatedConfidence === 'uncertain' || entry.formation_type === 'unknown') {
    status = 'needs_review';
  }

  return { valid: true, status, reasons: [], confidence: calculatedConfidence };
}

export async function runValidation({ specificKanji = null, autoRetry = true } = {}) {
  if (!fs.existsSync(FACTS_FILE)) {
    throw new Error('facts.json tidak ditemukan!');
  }
  const factsList = JSON.parse(fs.readFileSync(FACTS_FILE, 'utf-8'));
  const factsMap = new Map(factsList.map(f => [f.kanji, f]));
  const pictographsSet = loadPictographs();

  if (!fs.existsSync(RAW_DIR)) {
    throw new Error('Folder out/raw tidak ditemukan!');
  }

  let rawFiles = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.json'));
  if (specificKanji && specificKanji.length > 0) {
    const filterSet = new Set(specificKanji);
    rawFiles = rawFiles.filter(f => filterSet.has(f.replace('.json', '')));
  }

  console.log(`🔍 Memvalidasi ${rawFiles.length} berkas mentah kanji...`);

  const validatedEntries = new Map();
  const rejectedKanji = [];

  for (const file of rawFiles) {
    try {
      const rawContent = fs.readFileSync(path.resolve(RAW_DIR, file), 'utf-8');
      const entry = JSON.parse(rawContent);
      const validation = validateEntry(entry, factsMap, pictographsSet);

      const fact = factsMap.get(entry.kanji);
      const fullEntry = {
        ...entry,
        etymology_confidence: validation.confidence,
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
          phonetic_part: fact?.phonetic_part || null,
          flat_parts: fact?.flat_parts || [],
          old_form: fact?.old_form || null,
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

      const stillRejected = [];
      for (const k of kanjiToRetry) {
        const rawFile = path.resolve(RAW_DIR, `${k}.json`);
        if (fs.existsSync(rawFile)) {
          const entry = JSON.parse(fs.readFileSync(rawFile, 'utf-8'));
          const validation = validateEntry(entry, factsMap, pictographsSet);
          const fact = factsMap.get(entry.kanji);
          const fullEntry = {
            ...entry,
            etymology_confidence: validation.confidence,
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
              phonetic_part: fact?.phonetic_part || null,
              flat_parts: fact?.flat_parts || [],
              old_form: fact?.old_form || null,
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

  // Baca kanji-info.json yang ada jika specificKanji digunakan agar tidak menimpa kanji lain
  let mergedKanjiInfo = allEntries;
  if (specificKanji && fs.existsSync(KANJI_INFO_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(KANJI_INFO_FILE, 'utf-8'));
      const map = new Map(existing.map(e => [e.kanji, e]));
      for (const e of allEntries) {
        map.set(e.kanji, e);
      }
      mergedKanjiInfo = Array.from(map.values());
    } catch (e) {
      mergedKanjiInfo = allEntries;
    }
  }

  // Simpan kanji-info.json
  fs.writeFileSync(KANJI_INFO_FILE, JSON.stringify(mergedKanjiInfo, null, 2), 'utf-8');

  // Hasilkan review-sample.md
  generateReviewSample(allEntries, specificKanji);

  return {
    total: allEntries.length,
    approved: approvedList.length,
    needs_review: needsReviewList.length,
    draft: draftList.length,
    rejected: finalRejectedList.length,
    rejectedDetails: finalRejectedList
  };
}

export function generateReviewSample(entries, specificKanji = null) {
  let sampleEntries = entries;
  if (!specificKanji || specificKanji.length === 0) {
    const eligible = entries.filter(e => e.status !== 'rejected');
    const shuffled = [...eligible].sort((a, b) => {
      return ((a.kanji.charCodeAt(0) * 9301 + 49297) % 233280) - ((b.kanji.charCodeAt(0) * 9301 + 49297) % 233280);
    });
    sampleEntries = shuffled.slice(0, 30);
  }

  let md = `# Sampel Peninjauan Kanji (${sampleEntries.length} Kanji)\n\n`;
  md += `Tabel berikut disusun untuk ditinjau secara manual sebelum persetujuan akhir (status \`approved\`).\n\n`;
  md += `| No | Kanji | Arti | Komponen | Bagian Bunyi | Bentuk Lama | Asal-usul (Etymology) | Claim Kind | Keyakinan | Cara Mengingat (Mnemonic) |\n`;
  md += `|:---:|:---:|:---|:---|:---:|:---:|:---|:---:|:---:|:---|\n`;

  for (let i = 0; i < sampleEntries.length; i++) {
    const e = sampleEntries[i];
    const meanings = (e.facts?.meaning || []).slice(0, 3).join(', ');
    const comps = (e.components || []).map(c => `${c.part}(${c.role === 'phonetic' ? 'fonetik' : (c.role === 'meaning' ? 'makna' : 'bentuk')})`).join(' ');
    const phonPart = e.facts?.phonetic_part || e.phonetic_part || '-';
    const oldForm = e.facts?.old_form || e.old_form || '-';
    const claimKind = e.claim_kind || '-';
    const confidence = e.etymology_confidence || '-';
    const cleanEtym = (e.etymology_id || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const cleanMnem = (e.mnemonic_id || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

    md += `| ${i + 1} | **${e.kanji}** | ${meanings} | \`${comps}\` | \`${phonPart}\` | \`${oldForm}\` | ${cleanEtym} | \`${claimKind}\` | \`${confidence}\` | ${cleanMnem} |\n`;
  }

  md += `\n\n---\n*Gunakan perintah \`node scripts/kanji/approve.mjs --only <daftar kanji>\` untuk menyetujui hasil setelah tinjauan manual.*\n`;

  fs.writeFileSync(REVIEW_SAMPLE_FILE, md, 'utf-8');
  console.log(`📝 Sampel tinjauan ${sampleEntries.length} kanji disimpan ke: ${REVIEW_SAMPLE_FILE}`);
}

export function parseCliArgs() {
  const args = process.argv.slice(2);
  let specificKanji = null;
  let autoRetry = true;

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
    } else if (arg === '--no-retry') {
      autoRetry = false;
    }
  }

  return { specificKanji, autoRetry };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { specificKanji, autoRetry } = parseCliArgs();
  runValidation({ specificKanji, autoRetry }).then(stats => {
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
