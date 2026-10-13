<?php
// backend/src/users.php
require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

$method = $_SERVER['REQUEST_METHOD'];

if (!in_array($method, ['GET', 'POST'], true)) {
    jsonError(405, 'Method tidak diizinkan');
}

// [PERUBAHAN 1] Token dari header. requireAuth() mengembalikan id user pemilik token,
// sehingga query di bawah cukup memakai "WHERE id=?" (versi asli: "WHERE token=?").
$userId = requireAuth();

// 1. GET: Ambil Detail Profil Pengguna Aktif
//    [PERUBAHAN 2] Kolom tagline, tentang, dan cv ikut diambil
if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT id, username, email, nama_lengkap, nomor_hp, foto, tagline, tentang, cv, created_at FROM users WHERE id=? LIMIT 1');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    echo json_encode(['status' => 'success', 'user' => $user]);
    $conn->close();
    exit;
}

// 2. UPDATE PROFIL (POST multipart/form-data karena bisa membawa berkas)
$data = (object) $_POST;

$username = trim($data->username ?? '');
$email = trim($data->email ?? '');
$namaLengkap = trim($data->nama_lengkap ?? '');
$nomorHp = trim($data->nomor_hp ?? '');
$password = trim($data->password ?? '');
// [PERUBAHAN 2] Field baru
$tagline = trim($data->tagline ?? '');
$tentang = trim($data->tentang ?? '');
$hapusCv = ($data->hapus_cv ?? '') === '1';

if ($username === '' || $email === '' || $namaLengkap === '' || $nomorHp === '') {
    jsonError(400, 'Data user tidak boleh kosong');
}
// [PERUBAHAN 5] Validasi format email dan panjang isian
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonError(400, 'Format email tidak valid');
}
if (mb_strlen($tagline) > 150) {
    jsonError(400, 'Tagline maksimal 150 karakter');
}
if (mb_strlen($tentang) > 2000) {
    jsonError(400, 'Tentang Saya maksimal 2000 karakter');
}
// [PERUBAHAN 1] Password baru minimal 8 karakter
if ($password !== '' && strlen($password) < 8) {
    jsonError(400, 'Password baru minimal 8 karakter');
}

// Ambil nama berkas foto & CV lama
$stmtUser = $conn->prepare('SELECT foto, cv FROM users WHERE id=? LIMIT 1');
$stmtUser->bind_param('i', $userId);
$stmtUser->execute();
$currentUser = $stmtUser->get_result()->fetch_assoc();
$stmtUser->close();

// 3. UPLOAD BERKAS
//    [PERUBAHAN 2] Logika upload dipindah ke fungsi simpanUpload() di commonfunction.php
//    supaya bisa dipakai ulang untuk foto dan CV.
$foto = simpanUpload('foto', [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
], 5 * 1024 * 1024, $currentUser['foto'], 'foto');

$cv = $currentUser['cv'];
if ($hapusCv) {
    // Admin mencentang "hapus CV"
    hapusUpload($cv);
    $cv = '';
}
$cv = simpanUpload('cv', ['application/pdf' => 'pdf'], 2 * 1024 * 1024, $cv, 'CV');

// 4. SIMPAN PERUBAHAN KE DATABASE
if ($password !== '') {
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare('UPDATE users SET username=?, email=?, `password`=?, nama_lengkap=?, nomor_hp=?, foto=?, tagline=?, tentang=?, cv=? WHERE id=? LIMIT 1');
    $stmt->bind_param('sssssssssi', $username, $email, $passwordHash, $namaLengkap, $nomorHp, $foto, $tagline, $tentang, $cv, $userId);
} else {
    $stmt = $conn->prepare('UPDATE users SET username=?, email=?, nama_lengkap=?, nomor_hp=?, foto=?, tagline=?, tentang=?, cv=? WHERE id=? LIMIT 1');
    $stmt->bind_param('ssssssssi', $username, $email, $namaLengkap, $nomorHp, $foto, $tagline, $tentang, $cv, $userId);
}

$stmt->execute();
$stmt->close();

echo json_encode(['status' => 'success', 'message' => 'Berhasil memperbarui data user']);
$conn->close();
