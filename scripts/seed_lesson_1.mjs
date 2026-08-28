import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { toRomaji } from 'wanakana';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xvjwcyubeljzjjkialjj.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2andjeXViZWxqempqa2lhbGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMDYwNDUsImV4cCI6MjA5ODc4MjA0NX0.pqotCfsYvp9zkqWDNjf9Y0lmAQlj3XR7hXCdlzE-OL0';

// Disable realtime socket for node scripts
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { createWebSocket: () => null }
});

const JSON_PATH = '/Users/a2238/Downloads/lesson_1_transcript.json';
const IMAGES_DIR = '/Users/a2238/Downloads/files';

const kanjiToKanaMap = [
  [/あの方/g, 'あの かた'],
  [/あのひと/g, 'あの ひと'],
  [/あの人/g, 'あの ひと'],
  [/わたし/g, 'わたし'],
  [/私/g, 'わたし'],
  [/あなた/g, 'あなた'],
  [/貴方/g, 'あなた'],
  [/会社員/g, 'かいしゃいん'],
  [/社員/g, 'しゃいん'],
  [/銀行員/g, 'ぎんこういん'],
  [/医者/g, 'いしゃ'],
  [/先生/g, 'せんせい'],
  [/学生/g, 'がくせい'],
  [/研究者/g, 'けんきゅうしゃ'],
  [/教師/g, 'きょうし'],
  [/教員/g, 'きょういん'],
  [/エンジニア/g, 'エンジニア'],
  [/富士大学/g, 'ふじ だいがく'],
  [/さくら大学/g, 'さくら だいがく'],
  [/大学/g, 'だいがく'],
  [/神戸病院/g, 'こうべ びょういん'],
  [/病院/g, 'びょういん'],
  [/パワー電気/g, 'パワー でんき'],
  [/電気/g, 'でんき'],
  [/ブラジルエアー/g, 'ブラジル エアー'],
  [/アメリカ人/g, 'アメリカじん'],
  [/日本人/g, 'にほんじん'],
  [/イギリス人/g, 'イギリスじん'],
  [/タイ人/g, 'タイじん'],
  [/ドイツ人/g, 'ドイツじん'],
  [/フランス人/g, 'フランスじん'],
  [/韓国人/g, 'かんこくじん'],
  [/中国人/g, 'ちゅうごくじん'],
  [/インド人/g, 'インドじん'],
  [/インドネシア人/g, 'インドネシアじん'],
  [/ブラジル人/g, 'ブラジルじん'],
  [/アメリカ/g, 'アメリカ'],
  [/日本/g, 'にほん'],
  [/イギリス/g, 'イギリス'],
  [/タイ/g, 'タイ'],
  [/ドイツ/g, 'ドイツ'],
  [/フランス/g, 'フランス'],
  [/韓国/g, 'かんこく'],
  [/中国/g, 'ちゅうごく'],
  [/インド/g, 'インド'],
  [/インドネシア/g, 'インドネシア'],
  [/ブラジル/g, 'ブラジル'],
  [/人/g, 'じん'],
  [/何歳/g, 'なんさい'],
  [/おいくつ/g, 'おいくつ'],
  [/8歳/g, 'はっさい'],
  [/8さい/g, 'はっさい'],
  [/9歳/g, 'きゅうさい'],
  [/9さい/g, 'きゅうさい'],
  [/24歳/g, 'にじゅうよんさい'],
  [/29歳/g, 'にじゅうきゅうさい'],
  [/35歳/g, 'さんじゅうごさい'],
  [/39歳/g, 'さんじゅうきゅうさい'],
  [/42歳/g, 'よんじゅうにさい'],
  [/歳/g, 'さい'],
  [/初めまして/g, 'はじめまして'],
  [/来ました/g, 'きました'],
  [/失礼ですが/g, 'しつれい ですが'],
  [/お名前は/g, 'おなまえ は'],
  [/名前/g, 'なまえ']
];

function japaneseSentenceToRomaji(japanese) {
  let text = (japanese || '').trim();

  for (const [regex, replacement] of kanjiToKanaMap) {
    text = text.replace(regex, replacement);
  }

  text = text
    .replace(/([^\s])は([^\s]|$)/g, '$1 wa $2')
    .replace(/\s+は\s+/g, ' wa ')
    .replace(/^は\s+/g, 'wa ')
    .replace(/\s+も\s+/g, ' mo ')
    .replace(/([^\s])も([^\s]|$)/g, '$1 mo $2')
    .replace(/\s+の\s+/g, ' no ')
    .replace(/([^\s])の([^\s]|$)/g, '$1 no $2')
    .replace(/\s+です\s*か/g, ' desu ka')
    .replace(/\s+です/g, ' desu')
    .replace(/\s+じゃ\s*ありません/g, ' ja arimasen')
    .replace(/\s+では\s*ありません/g, ' dewa arimasen')
    .replace(/・/g, ' ')
    .replace(/。/g, '.')
    .replace(/？|\?/g, '?')
    .replace(/（/g, ' (')
    .replace(/）/g, ') ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = text.split(' ');
  const romajiTokens = tokens.map(tok => {
    if (tok === 'wa') return 'wa';
    if (tok === 'mo') return 'mo';
    if (tok === 'no') return 'no';
    if (tok === 'ka') return 'ka';
    if (tok === 'desu') return 'desu';
    if (tok.startsWith('(') && tok.endsWith(')')) {
      const inner = tok.slice(1, -1);
      return `(${toRomaji(inner)})`;
    }
    return toRomaji(tok);
  });

  return romajiTokens.join(' ')
    .replace(/\s+\./g, '.')
    .replace(/\s+\?/g, '?')
    .replace(/\s+,/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}

async function seed() {
  console.log('🚀 Starting Lesson 1 seed (Revisi 2: Atomized Items & Bunkei Relations)...');

  if (!fs.existsSync(JSON_PATH)) {
    throw new Error(`Transcript JSON not found at ${JSON_PATH}`);
  }

  const rawJson = fs.readFileSync(JSON_PATH, 'utf-8');
  const data = JSON.parse(rawJson);

  // 1. Upload character images to Supabase Storage
  console.log('📸 Uploading character images to Supabase Storage bucket "renshuu-characters"...');
  const imageUrlMap = {};
  const imageFiles = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));

  for (const filename of imageFiles) {
    const filePath = path.join(IMAGES_DIR, filename);
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const storagePath = `lesson_1/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from('renshuu-characters')
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true
      });

    if (uploadError) {
      console.warn(`Failed to upload ${filename}:`, uploadError.message);
    }

    const { data: publicUrlData } = supabase.storage
      .from('renshuu-characters')
      .getPublicUrl(storagePath);

    imageUrlMap[filename] = publicUrlData.publicUrl;
  }

  // 2. Insert Lesson
  console.log('📚 Upserting Lesson 1...');
  const { data: lessonData, error: lessonError } = await supabase
    .from('lessons')
    .upsert(
      {
        lesson_number: data.lesson.lesson_number,
        title: data.lesson.title,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'lesson_number' }
    )
    .select()
    .single();

  if (lessonError) throw lessonError;
  const lessonId = lessonData.id;
  console.log(`  ✓ Lesson ID: ${lessonId}`);

  // Clear existing child records
  await supabase.from('renshuu_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('renshuu_a_items').delete().eq('lesson_id', lessonId);
  await supabase.from('renshuu_b_items').delete().eq('lesson_id', lessonId);
  await supabase.from('renshuu_c_items').delete().eq('lesson_id', lessonId);
  await supabase.from('renshuu_a').delete().eq('lesson_id', lessonId);
  await supabase.from('renshuu_b_questions').delete().eq('lesson_id', lessonId);
  await supabase.from('renshuu_b_characters').delete().eq('lesson_id', lessonId);
  const { data: existingRenshuuC } = await supabase.from('renshuu_c').select('id').eq('lesson_id', lessonId);
  if (existingRenshuuC && existingRenshuuC.length > 0) {
    await supabase.from('renshuu_c_options').delete().in('renshuu_c_id', existingRenshuuC.map(c => c.id));
  }
  await supabase.from('renshuu_c').delete().eq('lesson_id', lessonId);
  const { data: existingKaiwa } = await supabase.from('kaiwa').select('id').eq('lesson_id', lessonId);
  if (existingKaiwa && existingKaiwa.length > 0) {
    await supabase.from('kaiwa_lines').delete().in('kaiwa_id', existingKaiwa.map(k => k.id));
  }
  await supabase.from('kaiwa').delete().eq('lesson_id', lessonId);
  await supabase.from('grammar_points').delete().eq('lesson_id', lessonId);

  // 3. Insert Grammar Points (Bunkei)
  console.log('📝 Inserting Grammar Points (Bunkei)...');
  const bunkeiRows = (data.bunkei || []).map(b => ({
    lesson_id: lessonId,
    order_index: b.order,
    japanese: b.japanese,
    romaji: b.romaji,
    meaning: b.meaning
  }));

  const { data: bunkeiRecords, error: bunkeiError } = await supabase
    .from('grammar_points')
    .insert(bunkeiRows)
    .select();

  if (bunkeiError) throw bunkeiError;

  const bunkeiMap = {};
  bunkeiRecords.forEach(b => {
    bunkeiMap[b.order_index] = b.id;
  });
  console.log(`  ✓ Inserted ${bunkeiRecords.length} Bunkei items.`);

  // 4. Insert Kaiwa
  console.log('💬 Inserting Kaiwa...');
  const { data: kaiwaRecord, error: kaiwaError } = await supabase
    .from('kaiwa')
    .insert({
      lesson_id: lessonId,
      title: data.kaiwa.title,
      title_romaji: data.kaiwa.title_romaji,
      title_meaning: data.kaiwa.title_meaning,
      context_note: data.kaiwa.context_note
    })
    .select()
    .single();

  if (kaiwaError) throw kaiwaError;

  const kaiwaLines = (data.kaiwa.lines || []).map(l => ({
    kaiwa_id: kaiwaRecord.id,
    speaker: l.speaker,
    japanese: l.japanese,
    romaji: l.romaji,
    meaning: l.meaning,
    order_index: l.order
  }));

  const { error: linesError } = await supabase.from('kaiwa_lines').insert(kaiwaLines);
  if (linesError) throw linesError;

  // 5. Insert Characters
  console.log('👥 Inserting Renshuu B Characters...');
  const charRows = [];
  for (const table of (data.renshuu_b.character_tables || [])) {
    for (const char of table.characters) {
      charRows.push({
        lesson_id: lessonId,
        table_id: table.table_id,
        key: char.key,
        name: char.name,
        romaji_name: char.romaji_name,
        age: char.age || null,
        country: char.country || null,
        company: char.company || null,
        profession: char.profession || null,
        image_url: imageUrlMap[char.image_file] || null
      });
    }
  }

  const { data: charRecords, error: charError } = await supabase
    .from('renshuu_b_characters')
    .insert(charRows)
    .select();

  if (charError) throw charError;

  const charMap = {};
  charRecords.forEach(c => {
    charMap[`${c.table_id}_${c.key}`] = c;
  });

  // 6. Insert Renshuu A (Parent + Atomized Rows)
  console.log('🔤 Inserting Renshuu A and Atomized Items (8 items)...');
  const renshuuAItemsToInsert = [];

  for (const ra of (data.renshuu_a || [])) {
    // Map bunkei by question_order
    let bunkeiOrder = 1;
    if (ra.order === 2) bunkeiOrder = 2;
    else if (ra.order === 3) bunkeiOrder = 3;
    else if (ra.order === 4) bunkeiOrder = 4;
    else if (ra.order === 5) bunkeiOrder = 1;
    else if (ra.order === 6) bunkeiOrder = 1;

    const bunkeiId = bunkeiMap[bunkeiOrder] || null;

    // Parent row
    await supabase.from('renshuu_a').insert({
      lesson_id: lessonId,
      bunkei_ref: bunkeiId,
      question_order: ra.order,
      type: ra.type,
      base_template: ra.base_template,
      base_filled_example: ra.base_filled_example,
      substitutions: ra.substitutions,
      results: ra.results,
      meaning: ra.meaning
    });

    // Atomized rows
    const results = ra.results || (ra.result ? [ra.result] : []);
    const substitutions = ra.substitutions || (ra.substitution ? [ra.substitution] : []);
    const baseExample = ra.base_filled_example || ra.base_template || '';

    results.forEach((resText, idx) => {
      const subWord = substitutions[idx]
        ? (Array.isArray(substitutions[idx]) ? substitutions[idx].join(' · ') : String(substitutions[idx]))
        : (substitutions[0] ? (Array.isArray(substitutions[0]) ? substitutions[0].join(' · ') : String(substitutions[0])) : '');

      let itemBunkeiId = bunkeiId;
      if (ra.order === 6 && idx === 1) {
        itemBunkeiId = bunkeiMap[3]; // Question: nansai desu ka -> Bunkei 3
      }

      renshuuAItemsToInsert.push({
        lesson_id: lessonId,
        bunkei_id: itemBunkeiId,
        question_order: ra.order,
        sub_order: idx + 1,
        base_example: baseExample,
        substitution_word: subWord,
        target_japanese: resText,
        target_romaji: japaneseSentenceToRomaji(resText),
        meaning: ra.meaning || 'Latihan substitusi pola kalimat'
      });
    });
  }

  const { data: insertedAItems, error: aItemsError } = await supabase
    .from('renshuu_a_items')
    .insert(renshuuAItemsToInsert)
    .select();

  if (aItemsError) throw aItemsError;
  console.log(`  ✓ Inserted ${insertedAItems.length} atomic Renshuu A items.`);

  // 7. Insert Renshuu B (Parent + Atomized Rows - 28 items)
  console.log('🖼️ Inserting Renshuu B and Atomized Items (28 items)...');
  const renshuuBItemsToInsert = [];

  for (const q of (data.renshuu_b.questions || [])) {
    let bunkeiOrder = 1;
    if (q.pattern === 'country_statement') bunkeiOrder = 1;
    else if (q.pattern === 'profession_statement') bunkeiOrder = 1;
    else if (q.pattern === 'profession_negative') bunkeiOrder = 2;
    else if (q.pattern === 'yes_no_question') bunkeiOrder = 3;
    else if (q.pattern === 'also_question_answer' || q.pattern === 'also_question') bunkeiOrder = 4;
    else if (q.pattern === 'who_is_that_person' || q.pattern === 'who_question') bunkeiOrder = 3;
    else if (q.pattern === 'age_statement' || q.pattern === 'age_question') bunkeiOrder = 3;

    const bunkeiId = bunkeiMap[bunkeiOrder] || null;

    const { order, table_ref, pattern, ...rest } = q;
    await supabase.from('renshuu_b_questions').insert({
      lesson_id: lessonId,
      bunkei_ref: bunkeiId,
      table_ref,
      question_order: order,
      pattern,
      question_data: rest
    });

    const qData = rest || {};
    if (pattern === 'country_statement') {
      const targetKeys = qData.target_keys || ['1', '2', '3', '4'];
      targetKeys.forEach((k, idx) => {
        const char = charMap[`${table_ref}_${k}`];
        if (char) {
          const japanese = `${char.name}さんは ${char.country}人です。`;
          renshuuBItemsToInsert.push({
            lesson_id: lessonId,
            bunkei_id: bunkeiId,
            character_id: char.id,
            question_order: order,
            sub_order: idx + 1,
            pattern,
            character_key: k,
            prompt_question: null,
            prompt_romaji: null,
            target_japanese: japanese,
            target_romaji: japaneseSentenceToRomaji(japanese),
            meaning: `${char.romaji_name || char.name}-san adalah orang ${char.country}.`
          });
        }
      });
    } else if (pattern === 'profession_statement') {
      const targetKeys = qData.target_keys || ['1', '2', '3', '4'];
      targetKeys.forEach((k, idx) => {
        const char = charMap[`${table_ref}_${k}`];
        if (char) {
          const japanese = `${char.name}さんは ${char.profession}です。`;
          renshuuBItemsToInsert.push({
            lesson_id: lessonId,
            bunkei_id: bunkeiId,
            character_id: char.id,
            question_order: order,
            sub_order: idx + 1,
            pattern,
            character_key: k,
            prompt_question: null,
            prompt_romaji: null,
            target_japanese: japanese,
            target_romaji: japaneseSentenceToRomaji(japanese),
            meaning: `${char.romaji_name || char.name}-san adalah ${char.profession}.`
          });
        }
      });
    } else if (pattern === 'profession_negative') {
      const targets = qData.targets || [];
      targets.forEach((t, idx) => {
        const char = charMap[`${table_ref}_${t.key}`];
        const [_, negTarget] = (t.input || '').split('・');
        if (char && negTarget) {
          const japanese = `${char.name}さんは ${negTarget}じゃ ありません。`;
          renshuuBItemsToInsert.push({
            lesson_id: lessonId,
            bunkei_id: bunkeiId,
            character_id: char.id,
            question_order: order,
            sub_order: idx + 1,
            pattern,
            character_key: t.key,
            prompt_question: `Bukan: ${negTarget}`,
            prompt_romaji: `Bukan: ${negTarget}`,
            target_japanese: japanese,
            target_romaji: japaneseSentenceToRomaji(japanese),
            meaning: `${char.romaji_name || char.name}-san bukan ${negTarget}.`
          });
        }
      });
    } else if (pattern === 'yes_no_question') {
      const targets = qData.targets || [];
      targets.forEach((t, idx) => {
        const char = charMap[`${table_ref}_${t.key}`];
        const [_, queryAttr] = (t.input || '').split('・');
        if (char && queryAttr) {
          const isMatch = (char.country && (queryAttr.includes(char.country) || char.country.includes(queryAttr))) ||
                          (char.profession && (queryAttr.includes(char.profession) || char.profession.includes(queryAttr)));
          
          const promptQuestion = `${char.name}さんは ${queryAttr}ですか。`;
          const targetJapanese = isMatch ? `はい、${queryAttr}です。` : `いいえ、${queryAttr}じゃ ありません。`;

          renshuuBItemsToInsert.push({
            lesson_id: lessonId,
            bunkei_id: bunkeiId,
            character_id: char.id,
            question_order: order,
            sub_order: idx + 1,
            pattern,
            character_key: t.key,
            prompt_question: promptQuestion,
            prompt_romaji: japaneseSentenceToRomaji(promptQuestion),
            target_japanese: targetJapanese,
            target_romaji: japaneseSentenceToRomaji(targetJapanese),
            meaning: isMatch ? `Ya, orang/profesi ${queryAttr}.` : `Bukan, bukan ${queryAttr}.`
          });
        }
      });
    } else if (pattern === 'also_question_answer' || pattern === 'also_question') {
      const targets = qData.targets || [{ key: '1' }, { key: '2' }, { key: '3' }, { key: '4' }];
      targets.forEach((t, idx) => {
        const char = charMap[`${table_ref}_${t.key}`];
        if (char) {
          const isAffirmative = t.key === '3'; // Karina is student (like Tawaphon)
          const promptText = t.prompt || `${char.name}さんも 学生ですか。`;
          const targetJapanese = isAffirmative
            ? `はい、${char.name}さんも 学生です。`
            : (t.key === '1' ? `いいえ、${char.name}さんは 銀行員じゃ ありません。` :
               t.key === '2' ? `いいえ、${char.name}さんは 先生じゃ ありません。` :
               `いいえ、${char.name}さんは ドイツ人じゃ ありません。`);

          renshuuBItemsToInsert.push({
            lesson_id: lessonId,
            bunkei_id: bunkeiMap[4],
            character_id: char.id,
            question_order: order,
            sub_order: idx + 1,
            pattern: 'also_question_answer',
            character_key: t.key,
            prompt_question: promptText,
            prompt_romaji: japaneseSentenceToRomaji(promptText),
            target_japanese: targetJapanese,
            target_romaji: japaneseSentenceToRomaji(targetJapanese),
            meaning: isAffirmative ? `Ya, ${char.romaji_name || char.name}-san juga murid.` : `Bukan, ${char.romaji_name || char.name}-san bukan.`
          });
        }
      });
    } else if (pattern === 'who_is_that_person' || pattern === 'who_question') {
      const targetKeys = qData.target_keys || ['1', '2', '3', '4'];
      targetKeys.forEach((k, idx) => {
        const char = charMap[`${table_ref}_${k}`];
        if (char) {
          const companyAffil = char.company ? `${char.company}の ` : '';
          const targetJapanese = `${char.name}さんです。${companyAffil}${char.profession}です。`;
          renshuuBItemsToInsert.push({
            lesson_id: lessonId,
            bunkei_id: bunkeiMap[3],
            character_id: char.id,
            question_order: order,
            sub_order: idx + 1,
            pattern: 'who_is_that_person',
            character_key: k,
            prompt_question: `あの方は どなたですか。`,
            prompt_romaji: `ano kata wa donata desu ka.`,
            target_japanese: targetJapanese,
            target_romaji: japaneseSentenceToRomaji(targetJapanese),
            meaning: `Orang itu adalah ${char.romaji_name || char.name}-san. ${char.company || ''} ${char.profession}.`
          });
        }
      });
    } else if (pattern === 'age_statement' || pattern === 'age_question') {
      const targetKeys = qData.target_keys || ['1', '2', '3', '4'];
      targetKeys.forEach((k, idx) => {
        const char = charMap[`${table_ref}_${k}`];
        if (char && char.age) {
          const japanese = `${char.name}さんは ${char.age}歳です。`;
          renshuuBItemsToInsert.push({
            lesson_id: lessonId,
            bunkei_id: bunkeiMap[3],
            character_id: char.id,
            question_order: order,
            sub_order: idx + 1,
            pattern: 'age_statement',
            character_key: k,
            prompt_question: `${char.name}さんは 何歳ですか。`,
            prompt_romaji: `${char.romaji_name || char.name}-san wa nansai desu ka.`,
            target_japanese: japanese,
            target_romaji: japaneseSentenceToRomaji(japanese),
            meaning: `${char.romaji_name || char.name}-san berusia ${char.age} tahun.`
          });
        }
      });
    }
  }

  const { data: insertedBItems, error: bItemsError } = await supabase
    .from('renshuu_b_items')
    .insert(renshuuBItemsToInsert)
    .select();

  if (bItemsError) throw bItemsError;
  console.log(`  ✓ Inserted ${insertedBItems.length} atomic Renshuu B items.`);

  // 8. Insert Renshuu C (Parent + Atomized Rows - 9 items)
  console.log('🎭 Inserting Renshuu C and Atomized Items (9 items)...');
  const renshuuCItemsToInsert = [];

  for (const rc of (data.renshuu_c || [])) {
    let bunkeiOrder = rc.order === 1 ? 1 : rc.order === 2 ? 1 : 3;
    const bunkeiId = bunkeiMap[bunkeiOrder] || null;

    const { data: rcRecord, error: rcError } = await supabase
      .from('renshuu_c')
      .insert({
        lesson_id: lessonId,
        bunkei_ref: bunkeiId,
        question_order: rc.order,
        type: rc.type,
        dialogue_template: rc.dialogue_template
      })
      .select()
      .single();

    if (rcError) throw rcError;

    const template = rc.dialogue_template || [];

    for (const opt of (rc.options || [])) {
      const { key, ...slotVals } = opt;
      await supabase.from('renshuu_c_options').insert({
        renshuu_c_id: rcRecord.id,
        option_key: key,
        slot_values: slotVals
      });

      const resolvedLines = template.map(line => {
        let text = line.japanese;
        if (line.slots) {
          line.slots.forEach(slotNum => {
            const slotKey = `slot_${slotNum}`;
            if (slotVals[slotKey]) {
              text = text.replace(new RegExp(`①|②|①\\[[^\\]]+\\]|②\\[[^\\]]+\\]`, 'g'), (m) => {
                if (m.includes('①') && slotNum === 1) return slotVals[slotKey];
                if (m.includes('②') && slotNum === 2) return slotVals[slotKey];
                return m;
              });
            }
          });
        }
        return {
          speaker: line.speaker,
          japanese: text,
          romaji: japaneseSentenceToRomaji(text)
        };
      });

      renshuuCItemsToInsert.push({
        lesson_id: lessonId,
        bunkei_id: bunkeiId,
        renshuu_c_id: rcRecord.id,
        question_order: rc.order,
        option_key: key,
        slot_values: slotVals,
        dialogue_template: template,
        resolved_lines: resolvedLines
      });
    }
  }

  const { data: insertedCItems, error: cItemsError } = await supabase
    .from('renshuu_c_items')
    .insert(renshuuCItemsToInsert)
    .select();

  if (cItemsError) throw cItemsError;
  console.log(`  ✓ Inserted ${insertedCItems.length} atomic Renshuu C items.`);

  const totalAtomic = insertedAItems.length + insertedBItems.length + insertedCItems.length;

  console.log('\n=========================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log(`🎯 TOTAL SOAL ATOMIK GENERATED: ${totalAtomic}`);
  console.log(`   - Renshuu A Items: ${insertedAItems.length}`);
  console.log(`   - Renshuu B Items: ${insertedBItems.length}`);
  console.log(`   - Renshuu C Items: ${insertedCItems.length}`);
  console.log('=========================================\n');
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
