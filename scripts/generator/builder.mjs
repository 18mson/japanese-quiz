import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllowedTagsForLesson } from '../grammar/tags.mjs';
import { detectTags } from '../grammar/detect.mjs';
import { resolvePool } from './pools.mjs';
import { checkItemGating, VOCAB_INDEX } from './vocab.mjs';
import { buildJpAnswers } from './utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesPath = path.resolve(__dirname, '../templates.json');
const templatesData = JSON.parse(fs.readFileSync(templatesPath, 'utf-8'));
export const TEMPLATES = templatesData.templates;

/**
 * Generates all valid questions for a given template definition
 * @param {any} tpl
 * @param {any} tokenizer
 * @param {number} lessonNumber
 * @param {Set<string>} [discardedSet]
 * @param {any[]} [vocabEntries=VOCAB_INDEX]
 * @returns {{ questions: any[], skipReason?: string }}
 */
export function generateAllCombinationsForTemplate(tpl, tokenizer, lessonNumber, discardedSet = new Set(), vocabEntries = VOCAB_INDEX) {
  const slotNames = Object.keys(tpl.slots);
  const slotItems = {};

  // 1. Resolve and gate each slot's items
  for (const sName of slotNames) {
    const poolSpec = tpl.slots[sName];
    const poolNames = Array.isArray(poolSpec) ? poolSpec : [poolSpec];
    let items = [];
    for (const pn of poolNames) {
      items = items.concat(resolvePool(pn));
    }

    const validItems = [];
    for (const it of items) {
      const chk = checkItemGating(it, tpl.lesson, tokenizer, vocabEntries);
      if (chk.pass) {
        validItems.push(it);
      } else {
        discardedSet.add(`${it.jp} (${chk.reason})`);
      }
    }
    slotItems[sName] = validItems;
  }

  // Check if any slot has 0 items after gating
  const emptySlot = slotNames.find(sn => slotItems[sn].length === 0);
  if (emptySlot) {
    return {
      questions: [],
      skipReason: `slot '${emptySlot}' (${JSON.stringify(tpl.slots[emptySlot])}) kosong setelah gating kosakata`
    };
  }

  // 2. Cartesian product across slots
  let combinations = [{}];
  for (const sName of slotNames) {
    const nextCombos = [];
    for (const curr of combinations) {
      for (const it of slotItems[sName]) {
        nextCombos.push({ ...curr, [sName]: it });
      }
    }
    combinations = nextCombos;
  }

  // 3. Apply distinct filter
  if (tpl.distinct && Array.isArray(tpl.distinct)) {
    combinations = combinations.filter(combo => {
      for (const [a, b] of tpl.distinct) {
        if (combo[a] && combo[b] && combo[a].jp === combo[b].jp) return false;
      }
      return true;
    });
  }

  // 4. Apply compat filter
  if (tpl.compat && Array.isArray(tpl.compat)) {
    combinations = combinations.filter(combo => {
      for (const [s1, s2] of tpl.compat) {
        const it1 = combo[s1];
        const it2 = combo[s2];
        if (!it1 || !it2) continue;
        const cats = it1.cats || it2.cats || [];
        const ok = it1.ok || it2.ok || [];
        if (cats.length > 0 && ok.length > 0) {
          const matched = cats.filter(c => ok.includes(c));
          if (matched.length === 0) return false;
        }
      }
      return true;
    });
  }

  const allowedTags = getAllowedTagsForLesson(lessonNumber);
  const validQuestions = [];
  let lastAssertionError = '';

  // 5. Expand placeholders and test assertions
  for (let idx = 0; idx < combinations.length; idx++) {
    const combo = combinations[idx];

    // Determine category override if compat has id_cat
    const idOverrides = {};
    if (tpl.compat && Array.isArray(tpl.compat)) {
      for (const [s1, s2] of tpl.compat) {
        const it1 = combo[s1];
        const it2 = combo[s2];
        if (!it1 || !it2) continue;
        const cats = it1.cats || it2.cats || [];
        const ok = it1.ok || it2.ok || [];
        const matched = cats.filter(c => ok.includes(c));
        if (matched.length > 0) {
          const matchedCat = matched[0];
          if (it1.id_cat && it1.id_cat[matchedCat]) idOverrides[s1] = it1.id_cat[matchedCat];
          if (it2.id_cat && it2.id_cat[matchedCat]) idOverrides[s2] = it2.id_cat[matchedCat];
        }
      }
    }

    // Build jp_text
    let jpText = tpl.jp;
    for (const s of slotNames) {
      const it = combo[s];
      jpText = jpText.replace(new RegExp(`\\{${s}\\.stem\\}`, 'g'), it.stem || it.jp);
      for (let n = 10; n >= 2; n--) {
        jpText = jpText.replace(new RegExp(`\\{${s}\\.${n}\\}`, 'g'), it['jp' + n] || '');
      }
      jpText = jpText.replace(new RegExp(`\\{${s}\\}`, 'g'), it.jp);
    }

    // Build kana_text
    let kanaText = tpl.jp_kana || tpl.jp;
    for (const s of slotNames) {
      const it = combo[s];
      kanaText = kanaText.replace(new RegExp(`\\{${s}\\.stem\\}`, 'g'), it.stem_kana || it.kana || it.stem || it.jp);
      for (let n = 10; n >= 2; n--) {
        kanaText = kanaText.replace(new RegExp(`\\{${s}\\.${n}\\}`, 'g'), it['kana' + n] || it['jp' + n] || '');
      }
      kanaText = kanaText.replace(new RegExp(`\\{${s}\\}`, 'g'), it.kana || it.jp);
    }

    // Build alt_jp_texts (Fase 2.5c: dukungan alt dan alt_stem dari item pool)
    const slotChoices = {};
    let hasAnyAlt = false;

    for (const s of slotNames) {
      const it = combo[s];
      const choices = [
        { ...it, jp: it.jp, stem: it.stem || it.jp }
      ];
      if (it.alt && Array.isArray(it.alt)) {
        for (let k = 0; k < it.alt.length; k++) {
          const altJp = it.alt[k];
          const altStem = (it.alt_stem && it.alt_stem[k]) ? it.alt_stem[k] : (it.stem || altJp);
          choices.push({
            ...it,
            jp: altJp,
            stem: altStem
          });
          hasAnyAlt = true;
        }
      }
      slotChoices[s] = choices;
    }

    // Cartesian product of slotChoices
    let altVariants = [{}];
    for (const s of slotNames) {
      const next = [];
      for (const r of altVariants) {
        for (const choice of slotChoices[s]) {
          next.push({ ...r, [s]: choice });
        }
      }
      altVariants = next;
    }

    const altJpTexts = [];

    // Jika template memiliki jp_alt, buat variasi untuk semua combo variant
    if (tpl.jp_alt && Array.isArray(tpl.jp_alt)) {
      for (const altPat of tpl.jp_alt) {
        for (const variant of altVariants) {
          let altJp = altPat;
          for (const s of slotNames) {
            const it = variant[s];
            altJp = altJp.replace(new RegExp(`\\{${s}\\.stem\\}`, 'g'), it.stem);
            for (let n = 10; n >= 2; n--) {
              altJp = altJp.replace(new RegExp(`\\{${s}\\.${n}\\}`, 'g'), it['jp' + n] || '');
            }
            altJp = altJp.replace(new RegExp(`\\{${s}\\}`, 'g'), it.jp);
          }
          altJpTexts.push(altJp);
        }
      }
    }

    // Variasi dari tpl.jp jika ada slot yang menggunakan pilihan alt (vIdx >= 1)
    if (hasAnyAlt) {
      for (let vIdx = 1; vIdx < altVariants.length; vIdx++) {
        const variant = altVariants[vIdx];
        let altJp = tpl.jp;
        for (const s of slotNames) {
          const it = variant[s];
          altJp = altJp.replace(new RegExp(`\\{${s}\\.stem\\}`, 'g'), it.stem);
          for (let n = 10; n >= 2; n--) {
            altJp = altJp.replace(new RegExp(`\\{${s}\\.${n}\\}`, 'g'), it['jp' + n] || '');
          }
          altJp = altJp.replace(new RegExp(`\\{${s}\\}`, 'g'), it.jp);
        }
        altJpTexts.push(altJp);
      }
    }

    // Build id_text
    let idText = tpl.id_text;
    for (const s of slotNames) {
      const it = combo[s];
      const baseId = idOverrides[s] || it.id;
      idText = idText.replace(new RegExp(`\\{${s}\\.fullz\\}`, 'g'), it.fullz || baseId);
      idText = idText.replace(new RegExp(`\\{${s}\\.full\\}`, 'g'), it.full || baseId);
      idText = idText.replace(new RegExp(`\\{${s}\\.q\\}`, 'g'), it.q || baseId);
      idText = idText.replace(new RegExp(`\\{${s}\\.loc\\}`, 'g'), it.loc || baseId);
      for (let n = 10; n >= 2; n--) {
        idText = idText.replace(new RegExp(`\\{${s}\\.${n}\\}`, 'g'), it['id' + n] || baseId);
      }
      idText = idText.replace(new RegExp(`\\{${s}\\.stem\\}`, 'g'), baseId);
      idText = idText.replace(new RegExp(`\\{${s}\\}`, 'g'), baseId);
    }
    idText = idText.charAt(0).toUpperCase() + idText.slice(1);

    // Check droppable subject
    let isDroppable = false;
    let droppableSubject = '';
    for (const s of slotNames) {
      if (combo[s]?.droppable) {
        const prefix = `{${s}}は`;
        if (tpl.jp.startsWith(prefix)) {
          isDroppable = true;
          droppableSubject = combo[s].jp;
          break;
        }
      }
    }

    // 6. KUROMOJI GRAMMAR ASSERTION
    const tokens = tokenizer.tokenize(jpText);
    const { tags, unknown } = detectTags(tokens);

    // Assertion A: must_tags ⊆ tags
    const missingMust = (tpl.must_tags || []).filter(mt => !tags.has(mt));
    if (missingMust.length > 0) {
      lastAssertionError = `must_tags tidak terdeteksi: ${missingMust.join(', ')} pada "${jpText}" (detected: ${[...tags].join(', ')})`;
      continue;
    }

    // Assertion B: tags ⊆ allowedTags(bab)
    const disallowed = [...tags].filter(t => !allowedTags.has(t));
    if (disallowed.length > 0) {
      lastAssertionError = `disallowed tags untuk Bab ${lessonNumber}: ${disallowed.join(', ')} pada "${jpText}"`;
      continue;
    }

    // Assertion C: unknown kosong
    if (unknown.length > 0) {
      lastAssertionError = `unknown grammar: ${unknown.join(', ')} pada "${jpText}"`;
      continue;
    }

    // Build accepted answers
    const answers = buildJpAnswers({
      jpText,
      kanaText,
      altJpTexts,
      isDroppable,
      droppableSubject
    });

    // Stable source_ref format: L5-T3:タクシー|うち (menangani jp2..jpN untuk compound slot)
    const slotValues = slotNames.map(s => {
      const item = combo[s];
      if (!item) return '';
      const jps = [item.jp];
      for (let n = 2; item['jp' + n]; n++) {
        jps.push(item['jp' + n]);
      }
      return jps.join('+');
    }).join('|');
    const sourceRef = slotValues ? `${tpl.tid}:${slotValues}` : `${tpl.tid}`;

    validQuestions.push({
      id_text: idText,
      jp_text: jpText,
      jp_answers: answers,
      chapter_id: lessonNumber,
      grammar_tags: Array.from(tags),
      is_focus: true,
      source: 'template',
      source_ref: sourceRef,
      attribution: 'Nihongo Master Template Engine',
      status: 'approved',
      template_id: tpl.tid
    });
  }

  if (validQuestions.length === 0) {
    return {
      questions: [],
      skipReason: lastAssertionError || 'tidak ada kombinasi yang memenuhi assertion'
    };
  }

  return { questions: validQuestions };
}

/**
 * Generates questions for a lesson with round-robin sampling across templates
 * @param {number} lessonNumber
 * @param {any} tokenizer
 * @param {number} [targetCount=150]
 * @param {number} [minPerTemplate=10]
 * @param {Set<string>} [discardedWordsSet=new Set()]
 * @param {any[]} [vocabEntries=VOCAB_INDEX]
 * @returns {{
 *   questions: any[],
 *   templateStats: Record<string, number>,
 *   skippedTemplates: Array<{ tid: string, reason: string }>,
 *   discardedWords: string[]
 * }}
 */
export function generateQuestionsForLesson(
  lessonNumber,
  tokenizer,
  targetCount = 150,
  minPerTemplate = 10,
  discardedWordsSet = new Set(),
  vocabEntries = VOCAB_INDEX
) {
  const lessonTemplates = TEMPLATES.filter(t => t.lesson === lessonNumber);
  if (lessonTemplates.length === 0) {
    return {
      questions: [],
      templateStats: {},
      skippedTemplates: [],
      discardedWords: []
    };
  }

  const poolsByTemplate = new Map();
  const skippedTemplates = [];

  for (const tpl of lessonTemplates) {
    const res = generateAllCombinationsForTemplate(tpl, tokenizer, lessonNumber, discardedWordsSet, vocabEntries);
    if (res.questions.length > 0) {
      poolsByTemplate.set(tpl.tid, res.questions);
    } else {
      skippedTemplates.push({ tid: tpl.tid, reason: res.skipReason || 'Tidak ada soal valid' });
    }
  }

  const selectedQuestions = [];
  const seenJpTexts = new Set();
  /** @type {Record<string, number>} */
  const templateStats = {};
  for (const tpl of lessonTemplates) {
    templateStats[tpl.tid] = 0;
  }

  // Phase 1: Jamin minimal minPerTemplate (10) soal per template aktif
  for (let r = 0; r < minPerTemplate; r++) {
    for (const [tid, pool] of poolsByTemplate.entries()) {
      if (r < pool.length) {
        const candidate = pool[r];
        if (!seenJpTexts.has(candidate.jp_text)) {
          seenJpTexts.add(candidate.jp_text);
          selectedQuestions.push(candidate);
          templateStats[tid]++;
        }
      }
    }
  }

  // Phase 2: Lanjutkan round-robin hingga targetCount (150) atau semua kombinasi habis
  let round = minPerTemplate;
  let addedInRound = true;

  while (selectedQuestions.length < targetCount && addedInRound) {
    addedInRound = false;
    for (const [tid, pool] of poolsByTemplate.entries()) {
      if (round < pool.length) {
        const candidate = pool[round];
        if (!seenJpTexts.has(candidate.jp_text)) {
          seenJpTexts.add(candidate.jp_text);
          selectedQuestions.push(candidate);
          templateStats[tid]++;
          addedInRound = true;
          if (selectedQuestions.length >= targetCount) break;
        }
      }
    }
    round++;
  }

  return {
    questions: selectedQuestions,
    templateStats,
    skippedTemplates,
    discardedWords: Array.from(discardedWordsSet)
  };
}
