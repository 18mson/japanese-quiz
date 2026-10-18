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
const KANJIVG_DIR = path.resolve(RAW_DIR, 'kanjivg/kanji');
const DATA_DIR = path.resolve(__dirname, 'data');
const OLD_FORMS_PATH = path.resolve(DATA_DIR, 'old_forms.json');
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

export function parseKanjivgSvg(svgText) {
  if (!svgText) return null;
  // Hapus komentar dan DOCTYPE
  const clean = svgText.replace(/<!--[\s\S]*?-->/g, '').replace(/<!DOCTYPE[\s\S]*?]>/g, '');
  const tagRegex = /<(\/)?g\b([^>]*)>/g;
  let match;

  const stack = [];
  let rootNode = null;

  while ((match = tagRegex.exec(clean)) !== null) {
    const isClosing = match[1] === '/';
    const attrString = match[2];

    if (isClosing) {
      if (stack.length > 0) {
        const popped = stack.pop();
        if (stack.length === 0 && !rootNode) {
          rootNode = popped;
        }
      }
      continue;
    }

    // Lewati grup kvg:StrokeNumbers_
    if (attrString.includes('kvg:StrokeNumbers_')) {
      let depth = 1;
      while ((match = tagRegex.exec(clean)) !== null) {
        if (match[1] === '/') {
          depth--;
          if (depth === 0) break;
        } else {
          depth++;
        }
      }
      continue;
    }

    // Lewati wrapper kvg:StrokePaths_
    if (attrString.includes('kvg:StrokePaths_')) {
      continue;
    }

    const getAttr = (name) => {
      const m = attrString.match(new RegExp(name + '="([^"]+)"'));
      return m ? m[1] : undefined;
    };

    const element = getAttr('kvg:element');
    const original = getAttr('kvg:original');
    const phon = getAttr('kvg:phon');
    const position = getAttr('kvg:position');

    const node = {
      element: element || null,
      children: []
    };
    if (original) node.original = original;
    if (phon) node.phon = phon;
    if (position) node.position = position;

    if (stack.length > 0) {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
    if (!rootNode && stack.length === 1) {
      rootNode = node;
    }
  }

  return rootNode;
}

export function extractFlatParts(tree, set = new Set()) {
  if (!tree) return [];
  if (tree.element) {
    set.add(tree.element);
  }
  for (const child of tree.children || []) {
    extractFlatParts(child, set);
  }
  return Array.from(set);
}

export function extractPhoneticPart(tree, svgContent = '') {
  // Cari di tree dulu
  function findPhon(node) {
    if (!node) return null;
    if (node.phon) return node.phon;
    for (const child of node.children || []) {
      const p = findPhon(child);
      if (p) return p;
    }
    return null;
  }

  const fromTree = findPhon(tree);
  if (fromTree) return fromTree;

  // Fallback regex jika ada di atribut <g>
  if (svgContent) {
    const m = svgContent.match(/<g\b[^>]*kvg:phon="([^"]+)"/);
    if (m) return m[1];
  }
  return null;
}

export function loadOldForms() {
  if (fs.existsSync(OLD_FORMS_PATH)) {
    try {
      const content = fs.readFileSync(OLD_FORMS_PATH, 'utf-8');
      const data = JSON.parse(content);
      return new Map(Object.entries(data));
    } catch (e) {
      console.warn(`Gagal membaca ${OLD_FORMS_PATH}:`, e.message);
    }
  }
  return new Map();
}

export function buildFacts() {
  const { count, kanjiList } = collectKanjiFromWords();
  const targetKanjiSet = new Set(kanjiList.map(k => k.kanji));

  const kradMap = parseKradfile();
  const kanjidicMap = parseKanjidic(targetKanjiSet);
  const oldFormsMap = loadOldForms();

  const facts = [];
  const missingKradfile = [];
  const missingKanjidic = [];
  const missingKanjiVG = [];
  let completeCount = 0;
  let withPhoneticCount = 0;
  let withOldFormCount = 0;

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

    // KanjiVG SVG
    const hex = k.codePointAt(0).toString(16).padStart(5, '0');
    const svgPath = path.resolve(KANJIVG_DIR, `${hex}.svg`);
    let tree = null;
    let phonetic_part = null;
    let flat_parts = [];

    if (fs.existsSync(svgPath)) {
      const svgContent = fs.readFileSync(svgPath, 'utf-8');
      tree = parseKanjivgSvg(svgContent);
      phonetic_part = extractPhoneticPart(tree, svgContent);
      flat_parts = extractFlatParts(tree);
    } else {
      missingKanjiVG.push(k);
    }

    if (phonetic_part) {
      withPhoneticCount++;
    }

    const old_form = oldFormsMap.get(k) || null;
    if (old_form) {
      withOldFormCount++;
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
      tree: tree,
      phonetic_part: phonetic_part,
      flat_parts: flat_parts,
      old_form: old_form,
      words: item.words
    };

    const isComplete = (
      dict &&
      dict.meaning.length > 0 &&
      dict.stroke_count !== null &&
      components.length > 0 &&
      tree !== null
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
    missingKanjiVG,
    withPhoneticCount,
    withOldFormCount,
    facts
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('🔄 Membangun fakta kanji dari KANJIDIC2, KRADFILE, dan KanjiVG...');
  const result = buildFacts();

  fs.writeFileSync(FACTS_FILE, JSON.stringify(result.facts, null, 2), 'utf-8');

  const reportMarkdown = `# Laporan Data Fakta Kanji (Minna no Nihongo)

- **Total kanji unik**: ${result.totalUnique}
- **Data lengkap (meaning, stroke_count, components, KanjiVG tree)**: ${result.completeCount}
- **Kanji dengan penanda bunyi (phonetic_part)**: ${result.withPhoneticCount}
- **Kanji dengan bentuk lama (old_form)**: ${result.withOldFormCount}
- **Tidak ditemukan di KANJIDIC2**: ${result.missingKanjidic.length === 0 ? 'Tidak ada (0)' : result.missingKanjidic.join(', ')}
- **Tidak ditemukan di KRADFILE**: ${result.missingKradfile.length === 0 ? 'Tidak ada (0)' : result.missingKradfile.join(', ')}
- **Tidak ditemukan di KanjiVG**: ${result.missingKanjiVG.length === 0 ? 'Tidak ada (0)' : result.missingKanjiVG.join(', ')}

Berkas fakta tersimpan di: \`scripts/kanji/out/facts.json\`
`;

  fs.writeFileSync(REPORT_FILE, reportMarkdown, 'utf-8');

  console.log(`✅ Selesai!`);
  console.log(`📊 Total kanji unik: ${result.totalUnique}`);
  console.log(`📊 Lengkap: ${result.completeCount}`);
  console.log(`🔊 Punya phonetic_part: ${result.withPhoneticCount}`);
  console.log(`📜 Punya old_form: ${result.withOldFormCount}`);
  console.log(`⚠️ Tidak ada di KANJIDIC2: ${result.missingKanjidic.length}`);
  console.log(`⚠️ Tidak ada di KRADFILE: ${result.missingKradfile.length}`);
  console.log(`⚠️ Tidak ada di KanjiVG: ${result.missingKanjiVG.length}`);
  console.log(`💾 Fakta: ${FACTS_FILE}`);
  console.log(`📝 Laporan: ${REPORT_FILE}`);
}
