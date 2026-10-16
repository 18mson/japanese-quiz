// scripts/kanji/facts.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectKanjiFromWords } from './collect.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_DIR = path.resolve(__dirname, 'raw');
const KANJIDIC_PATH = path.resolve(RAW_DIR, 'kanjidic2.xml');
const KRADFILE_PATH = path.resolve(RAW_DIR, 'kradfile-u');
const OUT_DIR = path.resolve(__dirname, 'out');
const FACTS_FILE = path.resolve(OUT_DIR, 'facts.json');
const REPORT_FILE = path.resolve(OUT_DIR, 'facts-report.md');

export function parseKradfile() {
  if (!fs.existsSync(KRADFILE_PATH)) {
    throw new Error(`KRADFILE tidak ditemukan di ${KRADFILE_PATH}`);
  }
  const content = fs.readFileSync(KRADFILE_PATH, 'utf-8');
  const kradMap = new Map();

  for (const line of content.split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(' : ');
    if (parts.length === 2) {
      const kanji = parts[0].trim();
      const components = parts[1].trim().split(/\s+/).filter(Boolean);
      kradMap.set(kanji, components);
    }
  }
  return kradMap;
}

export function parseKanjidic(targetKanjiSet) {
  if (!fs.existsSync(KANJIDIC_PATH)) {
    throw new Error(`KANJIDIC2 tidak ditemukan di ${KANJIDIC_PATH}`);
  }
  const xmlContent = fs.readFileSync(KANJIDIC_PATH, 'utf-8');
  const charBlocks = xmlContent.split('</character>');
  const dictMap = new Map();

  for (const block of charBlocks) {
    const litMatch = block.match(/<literal>([^<]+)<\/literal>/);
    if (!litMatch) continue;
    const literal = litMatch[1];
    if (!targetKanjiSet.has(literal)) continue;

    const strokeMatch = block.match(/<stroke_count>(\d+)<\/stroke_count>/);
    const stroke_count = strokeMatch ? parseInt(strokeMatch[1], 10) : null;

    const gradeMatch = block.match(/<grade>(\d+)<\/grade>/);
    const grade = gradeMatch ? parseInt(gradeMatch[1], 10) : null;

    const jlptMatch = block.match(/<jlpt>(\d+)<\/jlpt>/);
    const jlpt = jlptMatch ? parseInt(jlptMatch[1], 10) : null;

    const onReadings = [];
    const onMatches = block.matchAll(/<reading r_type="ja_on">([^<]+)<\/reading>/g);
    for (const m of onMatches) onReadings.push(m[1]);

    const kunReadings = [];
    const kunMatches = block.matchAll(/<reading r_type="ja_kun">([^<]+)<\/reading>/g);
    for (const m of kunMatches) kunReadings.push(m[1]);

    const meanings = [];
    // Only English meanings (no m_lang attribute)
    const meaningMatches = block.matchAll(/<meaning(?:>| m_lang="en">)([^<]+)<\/meaning>/g);
    for (const m of meaningMatches) meanings.push(m[1]);

    dictMap.set(literal, {
      stroke_count,
      grade,
      jlpt,
      on: onReadings,
      kun: kunReadings,
      meaning: meanings
    });
  }

  return dictMap;
}

export function buildFacts() {
  const { count, kanjiList } = collectKanjiFromWords();
  const targetKanjiSet = new Set(kanjiList.map(k => k.kanji));

  const kradMap = parseKradfile();
  const kanjidicMap = parseKanjidic(targetKanjiSet);

  const facts = [];
  const missingKradfile = [];
  const missingKanjidic = [];
  let completeCount = 0;

  for (const item of kanjiList) {
    const k = item.kanji;
    const components = kradMap.get(k) || [];
    if (!kradMap.has(k)) {
      missingKradfile.push(k);
    }

    const dict = kanjidicMap.get(k);
    if (!dict) {
      missingKanjidic.push(k);
    }

    const factEntry = {
      kanji: k,
      meaning: dict ? dict.meaning : [],
      on: dict ? dict.on : [],
      kun: dict ? dict.kun : [],
      stroke_count: dict ? dict.stroke_count : null,
      jlpt: dict ? dict.jlpt : null,
      grade: dict ? dict.grade : null,
      components: components,
      words: item.words
    };

    const isComplete = (
      dict &&
      dict.meaning.length > 0 &&
      dict.stroke_count !== null &&
      components.length > 0
    );

    if (isComplete) {
      completeCount++;
    }

    facts.push(factEntry);
  }

  return {
    totalUnique: count,
    completeCount,
    missingKradfile,
    missingKanjidic,
    facts
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('🔄 Membangun fakta kanji dari KANJIDIC2 dan KRADFILE...');
  const result = buildFacts();

  fs.writeFileSync(FACTS_FILE, JSON.stringify(result.facts, null, 2), 'utf-8');

  const reportMarkdown = `# Laporan Data Fakta Kanji (Minna no Nihongo)

- **Total kanji unik**: ${result.totalUnique}
- **Data lengkap (meaning, stroke_count, components)**: ${result.completeCount}
- **Tidak ditemukan di KANJIDIC2**: ${result.missingKanjidic.length === 0 ? 'Tidak ada (0)' : result.missingKanjidic.join(', ')}
- **Tidak ditemukan di KRADFILE**: ${result.missingKradfile.length === 0 ? 'Tidak ada (0)' : result.missingKradfile.join(', ')}

Berkas fakta tersimpan di: \`scripts/kanji/out/facts.json\`
`;

  fs.writeFileSync(REPORT_FILE, reportMarkdown, 'utf-8');

  console.log(`✅ Selesai!`);
  console.log(`📊 Total kanji unik: ${result.totalUnique}`);
  console.log(`📊 Lengkap: ${result.completeCount}`);
  console.log(`⚠️ Tidak ada di KANJIDIC2: ${result.missingKanjidic.length}`);
  console.log(`⚠️ Tidak ada di KRADFILE: ${result.missingKradfile.length}`);
  console.log(`💾 Fakta: ${FACTS_FILE}`);
  console.log(`📝 Laporan: ${REPORT_FILE}`);
}
