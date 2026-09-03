import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('scripts/reference_source_data.json', 'utf8'));
const { kelompok_1, kelompok_2, kelompok_3 } = raw.reference_konjugasi_kata_kerja;

const header = `DO $$\nDECLARE cat_verba_id UUID;\nBEGIN\nSELECT id INTO cat_verba_id FROM public.reference_categories WHERE slug = 'konjugasi_kata_kerja';\n`;
const footer = `\nEND $$;`;

function makeSql(verbs, group, startIdx) {
  let s = header;
  verbs.forEach((v, idx) => {
    s += `INSERT INTO public.reference_entries (category_id, group_label, entry_data, order_index) VALUES (cat_verba_id, '${group}', '${JSON.stringify(v).replace(/'/g, "''")}'::jsonb, ${startIdx + idx});\n`;
  });
  return s + footer;
}

fs.writeFileSync('scripts/seed_k1_part1.sql', makeSql(kelompok_1.verbs.slice(0, 42), 'kelompok_1', 1));
fs.writeFileSync('scripts/seed_k1_part2.sql', makeSql(kelompok_1.verbs.slice(42), 'kelompok_1', 43));
fs.writeFileSync('scripts/seed_k2.sql', makeSql(kelompok_2.verbs, 'kelompok_2', 84));
fs.writeFileSync('scripts/seed_k3.sql', makeSql(kelompok_3.verbs, 'kelompok_3', 129));

console.log('✅ Generated 4 seed files: k1_part1, k1_part2, k2, k3');
