<?php
// backend/library/commonfunction.php

// [PERUBAHAN 1] Lama hidup token dalam detik (2 jam).
// Setelah lewat dari waktu ini, token dianggap kedaluwarsa dan admin harus login ulang.
define('TOKEN_LIFETIME', 2 * 60 * 60);

// Fungsi untuk mengeksekusi query database dengan pesan status (dipakai migrasi)
function executeQuery($query, $message = '')
{
    global $conn;
    if (!$conn->query($query)) {
        die('Error: ' . $conn->error);
    }
    if ($message) {
        echo ' ' . $message . "\n";
    }
}

// Helper kecil: kirim error JSON lalu hentikan script
function jsonError($code, $message)
{
    http_response_code($code);
    echo json_encode(['status' => 'error', 'message' => $message, 'pesan' => $message]);
    exit;
}

// Membaca body JSON dari request. Selalu mengembalikan object (tidak pernah null),
// supaya kode di endpoint bisa langsung menulis $data->nama ?? '' tanpa error.
function readJsonBody()
{
    $data = json_decode(file_get_contents('php://input'));
    return is_object($data) ? $data : (object) [];
}

// ==================== [PERUBAHAN 1] AUTENTIKASI ====================

// Token TIDAK disimpan mentah di database, melainkan hasil hash SHA-256-nya.
// Jika database bocor, isi kolom token tidak bisa langsung dipakai untuk login,
// karena penyerang butuh token aslinya (yang hanya ada di browser admin).
function hashToken($token)
{
    return hash('sha256', $token);
}

// Mengambil token dari header "Authorization: Bearer <token>".
// Versi asli mengirim token lewat body/URL (?token=...). Token di URL itu berbahaya karena
// ikut tercatat di riwayat browser dan log server. Header tidak tercatat di sana.
function getBearerToken()
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';

    // Cadangan untuk server yang tidak meneruskan header ke $_SERVER (misalnya Apache)
    if ($header === '' && function_exists('getallheaders')) {
        foreach (getallheaders() as $name => $value) {
            if (strtolower($name) === 'authorization') {
                $header = $value;
                break;
            }
        }
    }

    // Format yang diterima: "Bearer 64karakterheksadesimal"
    if (preg_match('/^Bearer\s+([a-f0-9]{64})$/i', trim($header), $match)) {
        return $match[1];
    }
    return '';
}

// Memverifikasi token: harus ada di tabel users DAN belum kedaluwarsa.
// Mengembalikan id user pemilik token, supaya endpoint lain bisa memakainya.
function verifyToken($token)
{
    global $conn;

    // Menggunakan Prepared Statement untuk mencegah SQL Injection
    $hashed = hashToken($token);
    $stmt = $conn->prepare('SELECT id, token_expires_at FROM users WHERE token=? LIMIT 1');
    $stmt->bind_param('s', $hashed);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$user) {
        jsonError(401, 'Token tidak valid');
    }

    // Token ditemukan tapi waktunya sudah lewat: hapus dari database lalu tolak
    if ((int) $user['token_expires_at'] < time()) {
        $clear = $conn->prepare('UPDATE users SET token=NULL, token_expires_at=NULL WHERE id=? LIMIT 1');
        $clear->bind_param('i', $user['id']);
        $clear->execute();
        $clear->close();
        jsonError(401, 'Sesi telah berakhir, silakan login kembali');
    }

    return (int) $user['id'];
}

// Satu baris untuk melindungi endpoint: ambil token dari header lalu verifikasi.
// Dipanggil di awal setiap endpoint yang khusus admin.
function requireAuth()
{
    $token = getBearerToken();
    if ($token === '') {
        jsonError(401, 'Silahkan login terlebih dahulu');
    }
    return verifyToken($token);
}

// ==================== [PERUBAHAN 1 & 5] VALIDASI ====================

// Hanya izinkan tautan http, https, atau mailto.
// Mencegah admin (atau penyerang yang mencuri token) menyimpan tautan "javascript:..."
// yang akan dijalankan saat pengunjung mengklik tautan di halaman publik (serangan XSS).
function isSafeUrl($url)
{
    return (bool) preg_match('#^(https?://|mailto:)\S+$#i', $url);
}

// Validasi rentang tahun pada pendidikan & pengalaman
function validasiTahun($mulai, $selesai)
{
    $tahunDepan = (int) date('Y') + 10;
    if ($mulai < 1950 || $mulai > $tahunDepan || $selesai < 1950 || $selesai > $tahunDepan) {
        jsonError(400, 'Tahun harus di antara 1950 dan ' . $tahunDepan);
    }
    if ($selesai < $mulai) {
        jsonError(400, 'Tahun selesai tidak boleh lebih kecil dari tahun mulai');
    }
}

// ==================== [PERUBAHAN 2] UPLOAD BERKAS ====================

// Fungsi umum untuk menyimpan berkas unggahan (dipakai untuk foto DAN CV).
// Versi asli menulis logika upload langsung di users.php; karena sekarang ada dua jenis
// berkas, logikanya dipindah ke sini agar tidak ditulis dua kali.
//
// $field        : nama field di FormData ('foto' atau 'cv')
// $allowedMimes : daftar MIME yang diizinkan => ekstensi file, mis. ['application/pdf' => 'pdf']
// $maxBytes     : ukuran maksimal
// $oldFile      : nama berkas lama (akan dihapus jika berkas baru berhasil disimpan)
// Mengembalikan nama berkas baru, atau $oldFile jika tidak ada berkas yang diunggah.
function simpanUpload($field, $allowedMimes, $maxBytes, $oldFile, $label)
{
    if (!isset($_FILES[$field]) || $_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) {
        return $oldFile;
    }

    if ($_FILES[$field]['error'] !== UPLOAD_ERR_OK) {
        jsonError(400, "Upload $label gagal");
    }

    if ($_FILES[$field]['size'] > $maxBytes) {
        jsonError(413, "Ukuran $label maksimal " . round($maxBytes / 1024 / 1024) . ' MB');
    }

    // Jenis berkas dicek dari ISI berkas (finfo), bukan dari nama/ekstensinya,
    // karena ekstensi mudah dipalsukan (virus.php diganti nama menjadi foto.jpg).
    $mimeType = (new finfo(FILEINFO_MIME_TYPE))->file($_FILES[$field]['tmp_name']);
    if (!isset($allowedMimes[$mimeType])) {
        jsonError(415, "Format $label tidak didukung");
    }

    $uploadDirectory = __DIR__ . '/../uploads';
    if (!is_dir($uploadDirectory)) {
        mkdir($uploadDirectory, 0755, true);
    }

    // Nama acak unik, supaya tidak bisa ditebak dan tidak menimpa berkas lain
    $newFile = bin2hex(random_bytes(16)) . '.' . $allowedMimes[$mimeType];

    if (!move_uploaded_file($_FILES[$field]['tmp_name'], $uploadDirectory . '/' . $newFile)) {
        jsonError(500, "Gagal menyimpan $label ke server");
    }

    hapusUpload($oldFile);
    return $newFile;
}

// Menghapus berkas lama di folder uploads (kecuali foto bawaan)
function hapusUpload($fileName)
{
    $fileName = basename((string) $fileName);
    $path = __DIR__ . '/../uploads/' . $fileName;
    if ($fileName !== '' && $fileName !== 'default.png' && is_file($path)) {
        @unlink($path);
    }
}
