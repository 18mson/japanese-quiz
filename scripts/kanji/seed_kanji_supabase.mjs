// scripts/kanji/seed_kanji_supabase.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Polyfill WebSocket for Node.js < 22 to prevent Supabase RealtimeClient error
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class DummyWebSocket {};
}

import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_FILE = path.resolve(__dirname, '../../.env');
const DATA_FILE = path.resolve(__dirname, '../../src/data/kanjiInfo.json');
const BACKUP_FILE = path.resolve(__dirname, 'out/kanjiInfo.json');

function getEnv(key) {
  if (process.env[key]) return process.env[key];
  if (fs.existsSync(ENV_FILE)) {
    const content = fs.readFileSync(ENV_FILE, 'utf-8');
    for (const line of content.split('\n')) {
      const m = line.match(new RegExp(`^[ \\t]*${key}[ \\t]*=[ \\t]*(.*)$`));
      if (m) {
        return m[1].replace(/['"]/g, '').trim();
      }
    }
  }
  return '';
}

async function runSeed() {
  const url = getEnv('VITE_SUPABASE_URL');
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('VITE_SUPABASE_ANON_KEY');

  if (!url || !serviceKey) {
    throw new Error('Supabase URL atau Service Role Key tidak ditemukan di .env!');
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const sourcePath = fs.existsSync(DATA_FILE) ? DATA_FILE : BACKUP_FILE;
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Data kanji tidak ditemukan di ${DATA_FILE} maupun ${BACKUP_FILE}!`);
  }

  const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
  const entries = Object.values(raw);

  console.log(`Memulai seeding ${entries.length} kanji ke Supabase (tabel: kanji_catalog)...`);

  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const chunk = entries.slice(i, i + BATCH_SIZE);
    const rows = chunk.map(e => ({
      kanji: e.kanji,
      tier: e.tier,
      meaning: e.meaning || [],
      on_readings: e.on || [],
      kun_readings: e.kun || [],
      stroke_count: e.stroke_count ?? null,
      jlpt: e.jlpt ?? null,
      grade: e.grade ?? null,
      formation_type: e.formation_type || null,
      components: e.components || [],
      etymology_id: e.etymology_id || null,
      etymology_confidence: e.etymology_confidence || null,
      mnemonic_id: e.mnemonic_id || null,
      note_id: e.note_id || null,
      phonetic_part: e.phonetic_part || null,
      reading_hint: e.reading_hint || null,
      claim_kind: e.claim_kind || null,
      old_form: e.old_form || null,
      words: e.words || [],
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('kanji_catalog').upsert(rows, { onConflict: 'kanji' });
    if (error) {
      throw new Error(`Gagal upsert batch ${i + 1}-${i + rows.length}: ${error.message}`);
    }

    inserted += rows.length;
    console.log(`  Progress: ${inserted} / ${entries.length} kanji tersimpan...`);
  }

  // Backup file ke scripts/kanji/out/kanjiInfo.json jika belum ada
  if (!fs.existsSync(BACKUP_FILE) && fs.existsSync(DATA_FILE)) {
    fs.copyFileSync(DATA_FILE, BACKUP_FILE);
    console.log(`Backup disimpan ke: ${BACKUP_FILE}`);
  }

  // Verifikasi count final
  const { count, error: countErr } = await supabase.from('kanji_catalog').select('*', { count: 'exact', head: true });
  if (countErr) {
    console.warn('Gagal verifikasi count:', countErr.message);
  } else {
    console.log(`\n🎉 SEEDING BERHASIL! Total kanji di Supabase: ${count} entri.`);
  }
}

runSeed().catch(err => {
  console.error('Fatal Seeding Error:', err);
  process.exit(1);
});

