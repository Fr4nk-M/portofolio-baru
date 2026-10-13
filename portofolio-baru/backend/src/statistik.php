<?php
// backend/src/statistik.php
// [PERUBAHAN 5] ENDPOINT BARU: ringkasan jumlah data untuk halaman "Ringkasan" di dashboard.
// Semua hitungan diambil dengan SATU query (memakai subquery), bukan tujuh request terpisah,
// supaya dashboard cukup memanggil satu endpoint.

require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError(405, 'Method tidak diizinkan');
}

requireAuth();

$sql = 'SELECT
    (SELECT COUNT(*) FROM riwayat_pendidikan) AS pendidikan,
    (SELECT COUNT(*) FROM pengalaman) AS pengalaman,
    (SELECT COUNT(*) FROM keahlian) AS keahlian,
    (SELECT COUNT(*) FROM karya_terbaik) AS karya,
    (SELECT COUNT(*) FROM kontak_aktif) AS kontak,
    (SELECT COUNT(*) FROM pesan) AS pesan,
    (SELECT COUNT(*) FROM pesan WHERE sudah_dibaca = 0) AS pesan_belum_dibaca';

$stmt = $conn->prepare($sql);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

// Ubah semua nilai menjadi angka (dari database datang sebagai string)
$statistik = array_map('intval', $row);

// Cek kelengkapan profil: tagline, tentang, foto, dan CV sudah diisi atau belum
$stmt = $conn->prepare("SELECT tagline, tentang, foto, cv FROM users ORDER BY created_at ASC LIMIT 1");
$stmt->execute();
$profil = $stmt->get_result()->fetch_assoc();
$stmt->close();

$statistik['profil_lengkap'] = [
    'tagline' => ($profil['tagline'] ?? '') !== '',
    'tentang' => trim($profil['tentang'] ?? '') !== '',
    'foto' => ($profil['foto'] ?? 'default.png') !== 'default.png',
    'cv' => ($profil['cv'] ?? '') !== '',
];

echo json_encode(['status' => 'success', 'statistik' => $statistik]);
$conn->close();
