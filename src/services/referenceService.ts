// src/services/referenceService.ts
import { supabase } from '../lib/supabaseClient';
import {
  kataBilanganData,
  ungkapanWaktuData,
  kataBantuBilanganData,
  konjugasiKataKerjaData,
  type KataBilanganData,
  type UngkapanWaktuData,
  type KataBantuBilanganData,
  type KonjugasiKataKerjaData
} from '../data/referenceData';

export async function fetchKataBilangan(): Promise<KataBilanganData> {
  try {
    const { data: category, error: catError } = await supabase
      .from('reference_categories')
      .select('id')
      .eq('slug', 'kata_bilangan')
      .maybeSingle();

    if (catError || !category) {
      return kataBilanganData;
    }

    const { data: entries, error: entriesError } = await supabase
      .from('reference_entries')
      .select('*')
      .eq('category_id', category.id)
      .order('order_index', { ascending: true });

    if (entriesError || !entries || entries.length === 0) {
      return kataBilanganData;
    }

    const units = entries.filter(e => e.group_label === 'units').map(e => e.entry_data);
    const decimals = entries.filter(e => e.group_label === 'decimal_examples').map(e => e.entry_data);
    const fractions = entries.filter(e => e.group_label === 'fraction_examples').map(e => e.entry_data);
    const noteEntry = entries.find(e => e.group_label === 'note_irregular');

    return {
      title: 'I. Kata Bilangan',
      units: units.length > 0 ? units : kataBilanganData.units,
      decimal_examples: decimals.length > 0 ? decimals : kataBilanganData.decimal_examples,
      fraction_examples: fractions.length > 0 ? fractions : kataBilanganData.fraction_examples,
      note_irregular: noteEntry?.note || kataBilanganData.note_irregular
    };
  } catch (err) {
    console.warn('fetchKataBilangan error, using local fallback:', err);
    return kataBilanganData;
  }
}

export async function fetchUngkapanWaktu(): Promise<UngkapanWaktuData> {
  try {
    const { data: category, error: catError } = await supabase
      .from('reference_categories')
      .select('id')
      .eq('slug', 'ungkapan_waktu')
      .maybeSingle();

    if (catError || !category) {
      return ungkapanWaktuData;
    }

    const { data: entries, error: entriesError } = await supabase
      .from('reference_entries')
      .select('*')
      .eq('category_id', category.id)
      .order('order_index', { ascending: true });

    if (entriesError || !entries || entries.length === 0) {
      return ungkapanWaktuData;
    }

    const hari = entries.filter(e => e.group_label === 'hari').map(e => e.entry_data);
    const pagi = entries.filter(e => e.group_label === 'pagi').map(e => e.entry_data);
    const malam = entries.filter(e => e.group_label === 'malam').map(e => e.entry_data);
    const minggu = entries.filter(e => e.group_label === 'minggu').map(e => e.entry_data);
    const bulan = entries.filter(e => e.group_label === 'bulan').map(e => e.entry_data);
    const tahun = entries.filter(e => e.group_label === 'tahun').map(e => e.entry_data);

    const jam = entries.filter(e => e.group_label === 'jam').map(e => e.entry_data);
    const menit = entries.filter(e => e.group_label === 'menit').map(e => e.entry_data);
    const durasiHari = entries.filter(e => e.group_label === 'durasi_hari').map(e => e.entry_data);
    const durasiMinggu = entries.filter(e => e.group_label === 'durasi_minggu').map(e => e.entry_data);
    const durasiBulan = entries.filter(e => e.group_label === 'durasi_bulan').map(e => e.entry_data);
    const durasiTahun = entries.filter(e => e.group_label === 'durasi_tahun').map(e => e.entry_data);
    const noteEntry = entries.find(e => e.group_label === 'note_irregular');

    return {
      kalender: {
        title: 'II. Ungkapan Waktu (Kalender)',
        hari: hari.length > 0 ? hari : ungkapanWaktuData.kalender.hari,
        pagi: pagi.length > 0 ? pagi : ungkapanWaktuData.kalender.pagi,
        malam: malam.length > 0 ? malam : ungkapanWaktuData.kalender.malam,
        minggu: minggu.length > 0 ? minggu : ungkapanWaktuData.kalender.minggu,
        bulan: bulan.length > 0 ? bulan : ungkapanWaktuData.kalender.bulan,
        tahun: tahun.length > 0 ? tahun : ungkapanWaktuData.kalender.tahun,
      },
      durasi: {
        title: 'III. Ungkapan Waktu (Durasi)',
        jam_menit: {
          jam: jam.length > 0 ? jam : ungkapanWaktuData.durasi.jam_menit.jam,
          menit: menit.length > 0 ? menit : ungkapanWaktuData.durasi.jam_menit.menit,
        },
        jangka_waktu: {
          hari: durasiHari.length > 0 ? durasiHari : ungkapanWaktuData.durasi.jangka_waktu.hari,
          minggu: durasiMinggu.length > 0 ? durasiMinggu : ungkapanWaktuData.durasi.jangka_waktu.minggu,
          bulan: durasiBulan.length > 0 ? durasiBulan : ungkapanWaktuData.durasi.jangka_waktu.bulan,
          tahun: durasiTahun.length > 0 ? durasiTahun : ungkapanWaktuData.durasi.jangka_waktu.tahun,
        },
        note_irregular: noteEntry?.note || ungkapanWaktuData.durasi.note_irregular
      }
    };
  } catch (err) {
    console.warn('fetchUngkapanWaktu error, using local fallback:', err);
    return ungkapanWaktuData;
  }
}

export async function fetchKataBantuBilangan(): Promise<KataBantuBilanganData> {
  try {
    const { data: category, error: catError } = await supabase
      .from('reference_categories')
      .select('id')
      .eq('slug', 'kata_bantu_bilangan')
      .maybeSingle();

    if (catError || !category) {
      return kataBantuBilanganData;
    }

    const { data: entries, error: entriesError } = await supabase
      .from('reference_entries')
      .select('*')
      .eq('category_id', category.id)
      .order('order_index', { ascending: true });

    if (entriesError || !entries || entries.length === 0) {
      return kataBantuBilanganData;
    }

    const categories = entries.map(e => e.entry_data);
    const note = entries[0]?.note || kataBantuBilanganData.note;

    return {
      title: 'IV. Kata Bantu Bilangan (Counter Words)',
      categories: categories.length > 0 ? categories : kataBantuBilanganData.categories,
      note
    };
  } catch (err) {
    console.warn('fetchKataBantuBilangan error, using local fallback:', err);
    return kataBantuBilanganData;
  }
}

export async function fetchKonjugasiKataKerja(): Promise<KonjugasiKataKerjaData> {
  try {
    const { data: category, error: catError } = await supabase
      .from('reference_categories')
      .select('id')
      .eq('slug', 'konjugasi_kata_kerja')
      .maybeSingle();

    if (catError || !category) {
      return konjugasiKataKerjaData;
    }

    const { data: entries, error: entriesError } = await supabase
      .from('reference_entries')
      .select('*')
      .eq('category_id', category.id)
      .order('order_index', { ascending: true });

    if (entriesError || !entries || entries.length === 0) {
      return konjugasiKataKerjaData;
    }

    const k1 = entries.filter(e => e.group_label === 'kelompok_1').map(e => e.entry_data);
    const k2 = entries.filter(e => e.group_label === 'kelompok_2').map(e => e.entry_data);
    const k3 = entries.filter(e => e.group_label === 'kelompok_3').map(e => e.entry_data);

    return {
      title: 'V. Konjugasi Kata Kerja',
      note_umum: konjugasiKataKerjaData.note_umum,
      kelompok_1: {
        title: 'Kelompok I',
        description: konjugasiKataKerjaData.kelompok_1.description,
        verbs: k1.length > 0 ? k1 : konjugasiKataKerjaData.kelompok_1.verbs
      },
      kelompok_2: {
        title: 'Kelompok II',
        description: konjugasiKataKerjaData.kelompok_2.description,
        verbs: k2.length > 0 ? k2 : konjugasiKataKerjaData.kelompok_2.verbs
      },
      kelompok_3: {
        title: 'Kelompok III',
        description: konjugasiKataKerjaData.kelompok_3.description,
        verbs: k3.length > 0 ? k3 : konjugasiKataKerjaData.kelompok_3.verbs
      }
    };
  } catch (err) {
    console.warn('fetchKonjugasiKataKerja error, using local fallback:', err);
    return konjugasiKataKerjaData;
  }
}
