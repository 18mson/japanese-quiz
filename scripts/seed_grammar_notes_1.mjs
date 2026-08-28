import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class {
    constructor() {}
    addEventListener() {}
    removeEventListener() {}
    send() {}
    close() {}
  };
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xvjwcyubeljzjjkialjj.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2andjeXViZWxqempqa2lhbGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMDYwNDUsImV4cCI6MjA5ODc4MjA0NX0.pqotCfsYvp9zkqWDNjf9Y0lmAQlj3XR7hXCdlzE-OL0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const JSON_PATH = path.resolve('src/data/lesson_1_grammar_notes.json');

async function seedGrammarNotes() {
  console.log('🚀 Seeding Grammar Notes, Vocabulary, and Reference Tables for Lesson 1...');

  if (!fs.existsSync(JSON_PATH)) {
    throw new Error(`Grammar notes JSON not found at ${JSON_PATH}`);
  }

  const rawJson = fs.readFileSync(JSON_PATH, 'utf-8');
  const data = JSON.parse(rawJson);

  // 1. Fetch Lesson 1 ID
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('id')
    .eq('lesson_number', 1)
    .single();

  if (lessonError || !lesson) {
    throw new Error(`Failed to find lesson 1: ${lessonError?.message}`);
  }

  const lessonId = lesson.id;
  console.log(`Found Lesson 1 ID: ${lessonId}`);

  // 2. Fetch existing grammar_points for Lesson 1
  const { data: existingPoints } = await supabase
    .from('grammar_points')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('order_index', { ascending: true });

  const existingByOrder = {};
  if (existingPoints) {
    for (const gp of existingPoints) {
      if (!existingByOrder[gp.order_index]) {
        existingByOrder[gp.order_index] = gp.id;
      }
    }
  }

  // 3. Upsert Grammar Points (6 points)
  let grammarPointsCount = 0;
  for (const gp of (data.grammar_explanations || [])) {
    const pointNumber = gp.point_number;
    let examples = [];
    if (gp.examples && Array.isArray(gp.examples)) {
      examples = gp.examples;
    } else if (gp.example) {
      examples = [gp.example];
    } else if (gp.sub_points && Array.isArray(gp.sub_points)) {
      for (const sp of gp.sub_points) {
        if (sp.examples && Array.isArray(sp.examples)) {
          examples.push(...sp.examples);
        } else if (sp.example) {
          examples.push(sp.example);
        }
      }
    }

    const firstExample = examples[0] || { japanese: gp.pattern, meaning: '' };

    const payload = {
      lesson_id: lessonId,
      point_number: pointNumber,
      order_index: pointNumber,
      pattern: gp.pattern,
      explanation: gp.explanation || null,
      sub_points: gp.sub_points || null,
      examples: examples,
      note: gp.note || null,
      japanese: firstExample.japanese || gp.pattern,
      meaning: firstExample.meaning || '',
      updated_at: new Date().toISOString()
    };

    const existingId = existingByOrder[pointNumber];
    if (existingId) {
      const { error: updateError } = await supabase
        .from('grammar_points')
        .update(payload)
        .eq('id', existingId);

      if (updateError) {
        console.error(`Error updating grammar point ${pointNumber}:`, updateError);
      } else {
        grammarPointsCount++;
      }
    } else {
      const { error: insertError } = await supabase
        .from('grammar_points')
        .insert({
          ...payload,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error(`Error inserting grammar point ${pointNumber}:`, insertError);
      } else {
        grammarPointsCount++;
      }
    }
  }

  console.log(`✅ Seeded ${grammarPointsCount} Grammar Points.`);

  // 4. Seed Vocabulary (kosakata + renshuu_c_phrases)
  await supabase.from('lesson_vocabulary').delete().eq('lesson_id', lessonId);

  const vocabRows = [];
  let vocabOrder = 1;

  for (const item of (data.kosakata || [])) {
    vocabRows.push({
      lesson_id: lessonId,
      japanese: item.japanese,
      meaning: item.meaning,
      note: item.note || null,
      category: 'kosakata',
      order_index: vocabOrder++
    });
  }

  for (const item of (data.renshuu_c_phrases || [])) {
    vocabRows.push({
      lesson_id: lessonId,
      japanese: item.japanese,
      meaning: item.meaning,
      note: item.note || null,
      category: 'renshuu_c_phrase',
      order_index: vocabOrder++
    });
  }

  const { data: insertedVocab, error: vocabError } = await supabase
    .from('lesson_vocabulary')
    .insert(vocabRows)
    .select();

  if (vocabError) {
    console.error('Error inserting lesson vocabulary:', vocabError);
  } else {
    console.log(`✅ Seeded ${insertedVocab?.length || vocabRows.length} Vocabulary & Phrase rows (${data.kosakata?.length || 0} kosakata, ${data.renshuu_c_phrases?.length || 0} frasa renshuu c).`);
  }

  // 5. Seed Reference Tables (negara_orang_bahasa)
  await supabase.from('lesson_reference_tables').delete().eq('lesson_id', lessonId);

  const refRows = (data.reference_table_negara_orang_bahasa || []).map((row, idx) => ({
    lesson_id: lessonId,
    table_type: 'negara_orang_bahasa',
    row_data: row,
    order_index: idx + 1
  }));

  const { data: insertedRef, error: refError } = await supabase
    .from('lesson_reference_tables')
    .insert(refRows)
    .select();

  if (refError) {
    console.error('Error inserting reference tables:', refError);
  } else {
    console.log(`✅ Seeded ${insertedRef?.length || refRows.length} Reference Table rows (negara_orang_bahasa).`);
  }

  console.log('🎉 Lesson 1 Grammar Notes Seeding Complete!');
}

seedGrammarNotes().catch(err => {
  console.error('Fatal error during seed:', err);
  process.exit(1);
});
