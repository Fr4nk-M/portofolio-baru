# Web Portofolio Pribadi & Panel Admin (VERSI BARU)

Hasil modifikasi dari proyek mata kuliah **Pemrograman Web Modern**.
Daftar lengkap perubahan beserta alasannya ada di **`PERUBAHAN.md`**.

- **Backend**: PHP Native 8+ (REST API, Front Controller) + MySQL/MariaDB
- **Frontend**: React 19 + Vite + React Router + Axios (Context API, Dark/Light Mode)

## Beda alamat dengan versi asli

Versi baru sengaja memakai port dan database yang berbeda agar bisa dijalankan **bersamaan** dengan versi asli.

| | Versi asli | Versi baru |
|---|---|---|
| Backend | http://localhost:8000 | http://localhost:**8001** |
| Frontend | http://localhost:5173 | http://localhost:**5174** |
| Database | `portofolio` | `portofolio_v2` |

## Cara Menjalankan

### 0. Prasyarat
PHP 8+ (ekstensi `mysqli` & `fileinfo` aktif), MySQL/MariaDB (XAMPP / Laragon), Node.js 18+.
Default koneksi: host `127.0.0.1`, user `root`, password kosong (ubah di `backend/library/dbconnection.php`).

### 1. Backend
```bash
cd backend
php migration/main.php      # membuat database 'portofolio_v2', tabel, dan akun admin
php -S localhost:8001       # jalankan server API versi baru
```
Akun awal: **username `admin`** / **password `admin123`**

> `migration/main.php` menjalankan `DROP DATABASE portofolio_v2`. Database versi asli (`portofolio`) tidak ikut terhapus.

### 2. Frontend (terminal baru)
```bash
cd frontend
npm install
npm run dev
```
Buka http://localhost:5174

## Halaman
| Rute | Fungsi |
|------|--------|
| `/` | Portofolio publik: navbar, hero, Tentang Saya, timeline, meter keahlian, karya, kontak + form kirim pesan |
| `/login` | Login admin |
| `/dashboard` | Panel admin dengan sidebar: Ringkasan, Pesan Masuk, Biodata, Pendidikan, Pengalaman, Keahlian, Karya, Kontak (dilindungi `ProtectedRoute`) |
| `/logout` | Keluar dari sesi |
| lainnya | Halaman 404 |

## Endpoint API
Endpoint bertanda token wajib mengirim header `Authorization: Bearer <token>` (bukan lagi `?token=` di URL).

| Endpoint | Method | Token | Keterangan |
|----------|--------|-------|-----------|
| `/public` | GET | - | Seluruh data portofolio, termasuk tagline, tentang, cv |
| `/login` | POST | - | Login, mengembalikan token + `expires_at` |
| `/verify_login` | GET | ya | Cek token masih berlaku |
| `/logout` | POST | ya | Hapus token |
| `/users` | GET / POST | ya | Profil admin / update profil + upload foto & CV (multipart) |
| `/pendidikan` `/pengalaman` `/keahlian` `/karya` `/kontak` | GET POST PUT DELETE | ya | CRUD |
| `/pesan` | POST | - | **Baru.** Pengunjung mengirim pesan |
| `/pesan` | GET PUT DELETE | ya | **Baru.** Admin membaca, menandai, menghapus pesan |
| `/statistik` | GET | ya | **Baru.** Jumlah data untuk halaman Ringkasan |

## Catatan
- Alamat backend diatur di `frontend/src/api/backendApi.js` (`BASE_URL`).
- Berkas unggahan disimpan di `backend/uploads/`: foto JPG/PNG/WEBP maks 5 MB, CV PDF maks 2 MB.
- Token berlaku 2 jam (`TOKEN_LIFETIME` di `backend/library/commonfunction.php`).
