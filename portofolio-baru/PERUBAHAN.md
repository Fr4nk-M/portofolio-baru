# Daftar Perubahan

Setiap perubahan ditandai di kode dengan komentar `[PERUBAHAN 1]` sampai `[PERUBAHAN 5]`.
Cari teks itu (Ctrl+Shift+F di VS Code) untuk melompat ke baris yang berubah.

| No | Perubahan | Lapisan yang disentuh |
|----|-----------|----------------------|
| 1 | Keamanan login | Database, backend, frontend |
| 2 | Tentang Saya, tagline, unggah CV | Database, backend, frontend |
| 3 | Modul Pesan Masuk | Tabel baru, endpoint baru, form publik, tab dashboard |
| 4 | Redesign halaman publik | Frontend (React + CSS) |
| 5 | Dashboard & UX | Frontend + endpoint baru `statistik.php` + validasi backend |

Tambahan teknis agar bisa dijalankan berdampingan dengan versi asli: port backend 8001, port frontend 5174, database `portofolio_v2` (`dbconnection.php`, `vite.config.js`, `backendApi.js`, `migration/main.php`).

---

## 1. Keamanan login

**Masalah di versi asli**

| Masalah | Akibatnya |
|---|---|
| Token dikirim lewat URL (`/pendidikan?token=abc...`) | Token tercatat di riwayat browser dan log server, bisa dicuri orang yang membaca log |
| Token berlaku selamanya | Token yang bocor bisa dipakai kapan saja sampai admin logout |
| Token disimpan mentah di database | Jika database bocor, penyerang langsung bisa login memakai isi kolom token |
| Tautan karya/kontak tidak divalidasi | Bisa diisi `javascript:...` yang berjalan saat pengunjung mengklik (XSS) |

**Yang diubah**

| Bagian | Isi perubahan | File |
|---|---|---|
| Header Authorization | Token dikirim lewat header `Authorization: Bearer <token>` | `commonfunction.php` (`getBearerToken`), `backendApi.js` (request interceptor) |
| Masa berlaku | Kolom `token_expires_at`, token berlaku 2 jam | `migration/main.php`, `login.php`, `commonfunction.php` (`verifyToken`) |
| Hash token | Database menyimpan `sha256(token)`, bukan token asli | `commonfunction.php` (`hashToken`), `login.php`, `logout.php` |
| Satu fungsi pelindung | `requireAuth()` dipanggil di awal tiap endpoint admin | semua file `backend/src/*.php` khusus admin |
| Logout otomatis | Timer di AuthContext + response interceptor yang menangkap 401 | `AuthContext.jsx`, `backendApi.js` |
| Validasi URL | Hanya `http://`, `https://`, `mailto:` | `commonfunction.php` (`isSafeUrl`), `karya.php`, `kontak.php` |
| Password baru | Minimal 8 karakter | `users.php`, `Biodata.jsx` |
| Berkas unggahan | Header `X-Content-Type-Options: nosniff` | `index.php` |

**Cara mendemokan**
1. Login, buka DevTools > Network. Klik tab Pendidikan. Di request `pendidikan`, tunjukkan header `Authorization: Bearer ...` dan URL yang bersih (bandingkan dengan versi asli yang URL-nya memuat `?token=`).
2. Di phpMyAdmin, buka tabel `users` database `portofolio_v2`: isi kolom `token` berbeda dari token di Local Storage browser (karena di-hash).
3. Ubah `token_expires_at` di phpMyAdmin menjadi `1`, lalu klik menu apa saja di dashboard: otomatis keluar ke halaman login dengan pesan "Sesi telah berakhir".

---

## 2. Tentang Saya, tagline, dan unggah CV

**Masalah di versi asli:** halaman publik hanya menampilkan nama, email, dan nomor HP. Tidak ada tempat untuk memperkenalkan diri atau membagikan CV.

| Bagian | Isi perubahan | File |
|---|---|---|
| Database | Kolom `tagline` (maks 150), `tentang` (TEXT), `cv` di tabel `users` | `migration/main.php` |
| Upload | Fungsi umum `simpanUpload()` dipakai untuk foto **dan** CV. CV hanya PDF (dicek dari isi berkas lewat `finfo`), maks 2 MB | `commonfunction.php`, `users.php` |
| Hapus CV | Centang "Hapus CV yang sekarang" | `users.php` (`hapus_cv`), `Biodata.jsx` |
| Endpoint publik | `public.php` ikut mengirim `tagline`, `tentang`, `cv` | `public.php` |
| Form admin | Input tagline + penghitung karakter, textarea Tentang Saya, input berkas CV | `Biodata.jsx` |
| Halaman publik | Tagline di hero, bagian "Tentang saya", tombol "Unduh CV" | `Public.jsx` |

**Cara mendemokan:** Dashboard > Biodata > Edit, isi tagline dan unggah PDF. Buka halaman publik: tombol "Unduh CV" muncul. Coba unggah berkas `.txt` yang diganti nama menjadi `.pdf`: ditolak dengan pesan "Format CV tidak didukung".

---

## 3. Modul Pesan Masuk

**Masalah di versi asli:** pengunjung hanya bisa melihat daftar tautan kontak, tidak bisa menghubungi langsung dari web.

| Bagian | Isi perubahan | File |
|---|---|---|
| Tabel baru | `pesan` (nama, email, subjek, isi, sudah_dibaca, ip_address, created_at) | `migration/main.php` |
| Endpoint baru | POST tanpa token (publik), GET/PUT/DELETE dengan token (admin) | `backend/src/pesan.php` |
| Anti-spam | Honeypot (field tersembunyi `website`) + maks 3 pesan per 10 menit per IP | `pesan.php`, `FormPesan.jsx`, `.hp` di `App.css` |
| Form publik | Bagian Kontak punya form kirim pesan | `FormPesan.jsx`, `Public.jsx` |
| Tab dashboard | Daftar pesan, filter belum dibaca, buka pesan (otomatis ditandai dibaca), balas lewat email, hapus | `Pesan.jsx`, `Dashboard.jsx` |
| Badge | Jumlah pesan belum dibaca di sidebar | `Dashboard.jsx` |

**Cara mendemokan:** kirim pesan dari halaman publik, lalu login dan tunjukkan badge di menu "Pesan Masuk". Buka pesannya, badge berkurang satu. Kirim 4 pesan berturut-turut: pesan ke-4 ditolak (HTTP 429).

---

## 4. Redesign halaman publik

| Versi asli | Versi baru | File |
|---|---|---|
| Header biasa | Navbar menempel di atas, menu bagian yang sedang dibaca disorot (scroll spy) | `Public.jsx`, `hooks/useScrollSpy.js` |
| Kartu profil di tengah | Hero: nama besar, tagline, tombol CV dan kirim pesan, foto di samping | `Public.jsx`, `App.css` |
| Pendidikan & pengalaman dalam tabel | Timeline vertikal (komponen yang sama dipakai dua kali) | `Timeline.jsx` |
| Keahlian berupa badge teks | Meter 4 kotak (Pemula, Menengah, Mahir, Ahli) yang terisi saat terlihat di layar | `SkillMeter.jsx`, `hooks/useInView.js` |
| Kartu karya | Daftar karya dengan garis tebal di atas tiap judul | `Public.jsx`, `App.css` |
| Satu kolom kartu | Tata letak dua kolom: judul bagian di kiri, isi di kanan; satu kolom di HP | `App.css` |
| Font sistem | Bricolage Grotesque (judul) + Literata (paragraf) | `index.html`, `App.css` |

Alasan meter 4 kotak, bukan progress bar persen: data level di database berupa kategori, bukan angka. Menulis "75%" berarti mengarang angka yang tidak pernah diisi admin.

Aksesibilitas: tautan "Lewati ke konten" untuk pengguna keyboard, fokus terlihat, dan semua animasi dimatikan jika sistem pengguna mengaktifkan "kurangi gerakan" (`prefers-reduced-motion`).

---

## 5. Dashboard dan UX

| Bagian | Isi perubahan | File |
|---|---|---|
| Sidebar | Menu samping dengan ikon; di HP menjadi laci yang dibuka tombol Menu | `Dashboard.jsx`, `Icon.jsx`, `App.css` |
| Ringkasan | Halaman pertama dashboard: jumlah data tiap bagian, pesan belum dibaca, kelengkapan profil | `Ringkasan.jsx`, endpoint baru `statistik.php` |
| ProtectedRoute | Proteksi rute dipindah dari dalam Dashboard ke komponen pembungkus, plus cek token ke server | `ProtectedRoute.jsx`, `App.jsx` |
| Konfirmasi hapus | `window.confirm()` diganti dialog yang mengikuti tema dan menyebut nama data | `ConfirmDialog.jsx`, 5 komponen CRUD |
| Skeleton loading | Spinner diganti kerangka tabel yang berdenyut | `Skeleton.jsx` |
| Modal | Bisa ditutup dengan tombol Escape, halaman belakang tidak ikut ter-scroll | `Modal.jsx` |
| Pesan error | Pesan dari backend ditampilkan apa adanya (mis. "Tahun selesai tidak boleh lebih kecil dari tahun mulai") | `getErrorMessage` di `backendApi.js` |
| Validasi | Tahun selesai >= tahun mulai, level keahlian harus salah satu dari 4 pilihan, format email, hapus id yang tidak ada membalas 404 | `commonfunction.php` (`validasiTahun`), `keahlian.php`, `users.php`, semua CRUD |
| Login | Tombol tampilkan password, pesan alasan logout otomatis | `Login.jsx` |
| Lain-lain | Halaman 404, toast berbahasa Indonesia, sisa waktu sesi di sidebar | `NotFound.jsx`, `Alert.jsx`, `Dashboard.jsx` |
