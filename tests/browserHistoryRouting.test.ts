import test from 'node:test';
import assert from 'node:assert';

test('Browser History & Route State Navigation Suite', async (t) => {
  // Mock window & localStorage environment
  let mockLocation = {
    pathname: '/',
    search: '',
    hash: ''
  };

  const mockStorage: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, val: string) => { mockStorage[key] = val; },
    removeItem: (key: string) => { delete mockStorage[key]; }
  };

  // Reusable checkRouteState logic identical to App.vue
  function runCheckRouteState() {
    const pathname = mockLocation.pathname;
    const searchParams = new URLSearchParams(mockLocation.search);
    const hash = mockLocation.hash;

    const isBattlegroundRoute = pathname.includes('/battleground') ||
      searchParams.get('mode') === 'battleground' ||
      hash === '#battleground';

    const isDailyRoute = pathname.includes('/daily') ||
      searchParams.get('mode') === 'daily' ||
      hash === '#daily';

    const isMateriRoute = pathname.includes('/materi') ||
      searchParams.get('mode') === 'materi' ||
      hash === '#materi';

    const isAboutRoute = pathname.includes('/about') ||
      searchParams.get('mode') === 'about' ||
      hash === '#about';

    const isReferenceRoute = pathname.includes('/furoku') || 
      searchParams.get('mode') === 'furoku' || 
      hash === '#furoku' ||
      pathname.includes('/referensi') ||
      searchParams.get('mode') === 'referensi' ||
      hash === '#referensi';

    let selectedHandbookLesson = 1;
    if (isMateriRoute) {
      const lessonParam = parseInt(searchParams.get('lesson') || searchParams.get('bab') || '');
      if (lessonParam && lessonParam >= 1 && lessonParam <= 25) {
        selectedHandbookLesson = lessonParam;
      }
    }

    if (!isBattlegroundRoute && !isDailyRoute && !isMateriRoute) {
      mockLocalStorage.removeItem('active_screen');
    }

    return {
      showBattleground: isBattlegroundRoute,
      showDailyPractice: isDailyRoute,
      showHandbook: isMateriRoute,
      showAboutModal: isAboutRoute,
      showReferenceModal: isReferenceRoute,
      selectedHandbookLesson
    };
  }

  await t.test('1. Buka halaman /materi: showHandbook aktif', () => {
    mockLocation = { pathname: '/materi', search: '?lesson=3', hash: '' };
    mockLocalStorage.setItem('active_screen', 'materi');

    const state = runCheckRouteState();
    assert.strictEqual(state.showHandbook, true, 'Halaman materi harus aktif saat di /materi');
    assert.strictEqual(state.selectedHandbookLesson, 3, 'Bab materi harus sesuai query param lesson=3');
    assert.strictEqual(state.showBattleground, false);
    assert.strictEqual(state.showDailyPractice, false);
  });

  await t.test('2. Tombol back browser dari /materi kembali ke /: harus kembali ke Home (showHandbook = false)', () => {
    // Simulasi popstate saat menekan tombol back di browser
    mockLocation = { pathname: '/', search: '', hash: '' };

    const state = runCheckRouteState();
    assert.strictEqual(state.showHandbook, false, 'Setelah tombol back, showHandbook HARUS false (kembali ke home)');
    assert.strictEqual(mockLocalStorage.getItem('active_screen'), null, 'active_screen harus terhapus dari localStorage');
  });

  await t.test('3. Refresh browser saat berada di home (/): tetap di Home, TIDAK boleh terlempar ke materi', () => {
    mockLocation = { pathname: '/', search: '', hash: '' };

    const state = runCheckRouteState();
    assert.strictEqual(state.showHandbook, false, 'Refresh di / harus tetap di home');
    assert.strictEqual(state.showBattleground, false);
    assert.strictEqual(state.showDailyPractice, false);
  });

  await t.test('4. Refresh browser saat berada di /materi: tetap berada di halaman materi', () => {
    mockLocation = { pathname: '/materi', search: '?lesson=7', hash: '' };
    mockLocalStorage.setItem('active_screen', 'materi');

    const state = runCheckRouteState();
    assert.strictEqual(state.showHandbook, true, 'Refresh di /materi harus tetap membuka materi');
    assert.strictEqual(state.selectedHandbookLesson, 7, 'Bab 7 harus dipertahankan saat refresh');
  });

  await t.test('5. Halaman Battleground (/battleground) lalu tombol back ke /: kembali ke Home', () => {
    mockLocation = { pathname: '/battleground', search: '', hash: '' };
    mockLocalStorage.setItem('active_screen', 'battleground');
    let state = runCheckRouteState();
    assert.strictEqual(state.showBattleground, true);

    // Tekan tombol back browser
    mockLocation = { pathname: '/', search: '', hash: '' };
    state = runCheckRouteState();
    assert.strictEqual(state.showBattleground, false, 'Battleground harus nonaktif');
    assert.strictEqual(mockLocalStorage.getItem('active_screen'), null, 'active_screen harus bersih');
  });

  await t.test('6. Halaman Latihan Harian (/daily) lalu tombol back ke /: kembali ke Home', () => {
    mockLocation = { pathname: '/daily', search: '', hash: '' };
    mockLocalStorage.setItem('active_screen', 'daily');
    let state = runCheckRouteState();
    assert.strictEqual(state.showDailyPractice, true);

    // Tekan tombol back browser
    mockLocation = { pathname: '/', search: '', hash: '' };
    state = runCheckRouteState();
    assert.strictEqual(state.showDailyPractice, false, 'Daily Practice harus nonaktif');
    assert.strictEqual(mockLocalStorage.getItem('active_screen'), null);
  });

  await t.test('7. Halaman Furoku/Referensi (/furoku) lalu tombol back ke /: modal referensi tertutup', () => {
    mockLocation = { pathname: '/furoku', search: '', hash: '' };
    let state = runCheckRouteState();
    assert.strictEqual(state.showReferenceModal, true);

    // Tekan tombol back browser
    mockLocation = { pathname: '/', search: '', hash: '' };
    state = runCheckRouteState();
    assert.strictEqual(state.showReferenceModal, false, 'ReferenceModal harus tertutup saat kembali ke /');
  });

  await t.test('8. Halaman Tentang Aplikasi (/about) lalu tombol back ke /: modal about tertutup', () => {
    mockLocation = { pathname: '/about', search: '', hash: '' };
    let state = runCheckRouteState();
    assert.strictEqual(state.showAboutModal, true);

    // Tekan tombol back browser
    mockLocation = { pathname: '/', search: '', hash: '' };
    state = runCheckRouteState();
    assert.strictEqual(state.showAboutModal, false, 'AboutModal harus tertutup saat kembali ke /');
  });
});
