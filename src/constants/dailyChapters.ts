export interface ChapterMeta {
  title: string;
  grammar: string;
}

export const DAILY_CHAPTER_META: Record<number, ChapterMeta> = {
  1: { title: 'Perkenalan Diri', grammar: 'N1 は N2 です, じゃありません, か' },
  2: { title: 'Benda & Kepemilikan', grammar: 'これ / それ / あれ, この / その / あの N' },
  3: { title: 'Tempat & Lokasi', grammar: 'ここ / そこ / あそこ, どこ, どちら' },
  4: { title: 'Waktu & Kegiatan', grammar: 'Jam, menit, から〜まで, kata kerja bentuk 〜ます' },
  5: { title: 'Perjalanan & Transportasi', grammar: 'へ 行きます, で (kendaraan), と (teman)' },
  6: { title: 'Aktivitas Sehari-hari', grammar: 'を 食べます, で (tempat aksi), 〜ませんか' },
  7: { title: 'Alat & Pemberian', grammar: 'で (alat), に あげます / もらいます, もう〜ました' },
  8: { title: 'Kata Sifat (i & na)', grammar: 'い形容詞, な形容詞, とても, あまり' },
  9: { title: 'Kesukaan, Kemampuan & Alasan', grammar: '〜が 好き / 上手 / わかります, 〜から (alasan)' },
  10: { title: 'Keberadaan & Posisi', grammar: 'あります / います, に あります / います, 上 / 下 / 前 / 後ろ' },
  11: { title: 'Bilangan & Durasi', grammar: 'Pencacah (〜つ, 〜人, 〜枚), durasi waktu, 〜ぐらい' },
  12: { title: 'Bentuk Lampau & Perbandingan', grammar: 'Lampau adj / noun, A は B より, どちら, いちばん' },
};

export function getChapterTitle(chapterId: number): string {
  return DAILY_CHAPTER_META[chapterId]?.title || `Bab ${chapterId}`;
}

export function formatSessionChapterTitles(chapterIds: number[]): string {
  if (!chapterIds || chapterIds.length === 0) return '';
  return chapterIds.map(id => getChapterTitle(id)).join(' • ');
}
