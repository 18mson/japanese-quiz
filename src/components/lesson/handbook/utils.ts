import type { BunkeiItem } from '../../../data/lessonGrammarBook';

export interface FormulaToken {
  text: string;
  isPlus: boolean;
}

export function parseFormulaTokens(formula: string): FormulaToken[] {
  if (!formula) return [];
  const rawParts = formula.split(/\s+\+\s+/);
  const tokens: FormulaToken[] = [];
  rawParts.forEach((part, idx) => {
    if (idx > 0) {
      tokens.push({ text: '+', isPlus: true });
    }
    if (part.trim()) {
      tokens.push({ text: part.trim(), isPlus: false });
    }
  });
  return tokens;
}

export const BUNKEI_TITLES: Record<string, string> = {
  // Bab 1
  'b1-1': 'Kalimat Positif (～です)',
  'b1-2': 'Kalimat Negatif (～じゃ / では ありません)',
  'b1-3': 'Kalimat Tanya',
  'b1-4': 'Partikel "Juga" (～も)',
  'b1-5': 'Hubungan & Kepemilikan',

  // Bab 2
  'b2-1': 'Kata Tunjuk Benda (これ / それ / あれ)',
  'b2-2': 'Kata Tunjuk Spesifik (この / その / あの)',
  'b2-3': 'Konfirmasi Jawaban (そうです / 違います)',
  'b2-4': 'Isi & Kepemilikan',

  // Bab 3
  'b3-1': 'Kata Tunjuk Tempat (ここ / そこ / あそこ)',
  'b3-2': 'Lokasi Keberadaan Benda / Orang',
  'b3-3': 'Menanyakan Lokasi (どこ / どちら)',
  'b3-4': 'Menanyakan Harga (いくら)',

  // Bab 4
  'b4-1': 'Menyatakan Waktu (Jam & Menit)',
  'b4-2': 'Bentuk Waktu Kata Kerja (ます / ました)',
  'b4-3': 'Waktu Kegiatan (Partikel に)',
  'b4-4': 'Rentang Waktu & Tempat (から ～ まで)',

  // Bab 5
  'b5-1': 'Tujuan Perpindahan (Partikel へ)',
  'b5-2': 'Penyangkalan Arah Total (どこ［へ］も)',
  'b5-3': 'Sarana Transportasi (Partikel で)',
  'b5-4': 'Teman / Rekan Kegiatan (Partikel と)',

  // Bab 6
  'b6-1': 'Objek Penderita (Partikel を)',
  'b6-2': 'Tempat Melakukan Kegiatan (Partikel で)',
  'b6-3': 'Mengajak Melakukan Sesuatu (～ませんか)',
  'b6-4': 'Menyetujui & Melakukan Bersama (～ましょう)',

  // Bab 7
  'b7-1': 'Alat & Media Kegiatan (Partikel で)',
  'b7-2': 'Memberi Barang (～にあげます)',
  'b7-3': 'Menerima Barang (～にもらいます)',
  'b7-4': 'Status Penyelesaian (もう ～ました / まだです)',

  // Bab 8
  'b8-1': 'Predikat Kata Sifat-na',
  'b8-2': 'Predikat Kata Sifat-i',
  'b8-3': 'Penggabungan Kata Sifat dengan Kata Benda',
  'b8-4': 'Tingkat Keterangan Sifat (とても / あまり)',

  // Bab 9
  'b9-1': 'Kesukaan & Kemahiran (Partikel が)',
  'b9-2': 'Kepemilikan & Pemahaman (あります / わかります)',
  'b9-3': 'Penyebab & Alasan',

  // Bab 10
  'b10-1': 'Keberadaan Benda & Makhluk (あります / います)',
  'b10-2': 'Lokasi Keberadaan Subjek',
  'b10-3': 'Posisi Relatif Ruang',
  'b10-4': 'Penyebutan Sebagian (Partikel や ... など)',

  // Bab 11
  'b11-1': 'Jumlah & Bilangan Satuan (Counter)',
  'b11-2': 'Frekuensi Berkala (～に ～回)',
  'b11-3': 'Durasi Waktu Kegiatan',
  'b11-4': 'Pembatasan "Hanya"',

  // Bab 12
  'b12-1': 'Bentuk Lampau Kata Benda & Sifat-na',
  'b12-2': 'Bentuk Lampau Kata Sifat-i',
  'b12-3': 'Perbandingan Tingkat (A は B より ～)',
  'b12-4': 'Pilihan Perbandingan (どちらが ～)',
  'b12-5': 'Tingkat Paling Unggul / Superlatif',

  // Bab 13
  'b13-1': 'Keinginan Memiliki Benda (～が欲しいです)',
  'b13-2': 'Keinginan Melakukan Aksi (～たいです)',
  'b13-3': 'Tujuan Perpindahan (～に行きます)',

  // Bab 14
  'b14-1': 'Permintaan Tolong Sopan (～てください)',
  'b14-2': 'Aktivitas Sedang Berlangsung (～ています)',
  'b14-3': 'Menawarkan Bantuan (～ましょうか)',

  // Bab 15
  'b15-1': 'Izin Melakukan Sesuatu (～てもいいです)',
  'b15-2': 'Larangan Melakukan Sesuatu (～てはいけません)',
  'b15-3': 'Keadaan Berkelanjutan',

  // Bab 16
  'b16-1': 'Urutan Tindakan Beruntun (～て、～て、...)',
  'b16-2': 'Urutan Kejadian Setelah (～てから)',
  'b16-3': 'Penyambungan Dua Kata Sifat (～くて / ～で)',
  'b16-4': 'Ciri Khas / Sifat Fisik Subjek',

  // Bab 17
  'b17-1': 'Permohonan Jangan Melakukan (～ないでください)',
  'b17-2': 'Kewajiban & Keharusan (～なければなりません)',
  'b17-3': 'Boleh Tidak Melakukan (～なくてもいいです)',

  // Bab 18
  'b18-1': 'Kemampuan & Kesanggupan (～ことができます)',
  'b18-2': 'Menyatakan Hobi (わたしの趣味は ～ことです)',
  'b18-3': 'Sebelum Melakukan Sesuatu (～まえに)',

  // Bab 19
  'b19-1': 'Pengalaman Lampau (～たことがあります)',
  'b19-2': 'Aktivitas Representatif (～たり、～たりします)',
  'b19-3': 'Perubahan Kondisi (～くなります / ～になります)',

  // Bab 20
  'b20-1': 'Ragam Santai Kata Kerja (Bentuk Biasa)',
  'b20-2': 'Ragam Santai Kata Sifat & Benda (だ / だった)',

  // Bab 21
  'b21-1': 'Pendapat & Perkiraan (～と思います)',
  'b21-2': 'Kutipan Ucapan Langsung/Tak Langsung (～と言いました)',
  'b21-3': 'Konfirmasi Kesepakatan (～でしょう)',

  // Bab 22
  'b22-1': 'Anak Kalimat Pewatas Kata Benda',
  'b22-2': 'Memiliki Waktu / Janji / Urusan',

  // Bab 23
  'b23-1': 'Keterangan Waktu / Saat (～とき)',
  'b23-2': 'Kondisi / Konsekuensi Pasti (～と)',

  // Bab 24
  'b24-1': 'Menerima Pemberian Benda (わたしに ～をくれます)',
  'b24-2': 'Memberikan Jasa Kebaikan (～てあげます)',
  'b24-3': 'Menerima Bantuan Jasa (～てもらいます)',
  'b24-4': 'Menerima Kebaikan dari Orang Lain (～てくれます)',

  // Bab 25
  'b25-1': 'Pengandaian Bersyarat (～たら)',
  'b25-2': 'Pengandaian Bertentangan (～ても)',
  'b25-3': 'Penegas Kalimat Pengandaian (もし ～)'
};

export function getBunkeiTitle(item: BunkeiItem): string {
  if (item.title) return item.title;
  if (item.id && BUNKEI_TITLES[item.id]) {
    return BUNKEI_TITLES[item.id];
  }
  // Smart fallback: extract topic in parentheses if present at the end
  const topicMatch = item.pattern.match(/[（\(]([^）\)]+)[）\)]\s*$/);
  if (topicMatch && !topicMatch[1].toLowerCase().includes('stem') && !topicMatch[1].toLowerCase().includes('bentuk')) {
    return topicMatch[1].trim();
  }
  return item.pattern;
}
