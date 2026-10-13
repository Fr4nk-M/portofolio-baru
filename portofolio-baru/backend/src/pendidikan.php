<?php
// backend/src/pendidikan.php
require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

// [PERUBAHAN 1] Cukup satu baris: token diambil dari header Authorization lalu diverifikasi
// (termasuk cek kedaluwarsa). Versi asli membaca token dari body/URL dan menulis
// pengecekan token kosong di setiap file.
requireAuth();

$data = readJsonBody();

$id = (int) ($data->id ?? $_GET['id'] ?? 0);
$namaInstitusi = trim($data->nama_institusi ?? '');
$tingkat = trim($data->tingkat ?? '');
$jurusan = trim($data->jurusan ?? '');
$tahunMulai = (int) ($data->tahun_mulai ?? 0);
$tahunSelesai = (int) ($data->tahun_selesai ?? 0);

$method = $_SERVER['REQUEST_METHOD'];

if (in_array($method, ['POST', 'PUT'], true)) {
    if ($namaInstitusi === '' || $tingkat === '' || $jurusan === '') {
        jsonError(400, 'Data pendidikan tidak boleh kosong');
    }
    // [PERUBAHAN 5] Validasi tahun: rentang wajar dan tahun selesai >= tahun mulai
    validasiTahun($tahunMulai, $tahunSelesai);
}

// READ: Ambil seluruh riwayat pendidikan
if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT * FROM riwayat_pendidikan ORDER BY tahun_mulai DESC, id DESC');
    $stmt->execute();
    echo json_encode(['status' => 'success', 'riwayat_pendidikan' => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)]);
    $stmt->close();

// CREATE: Tambah riwayat pendidikan baru
} elseif ($method === 'POST') {
    $stmt = $conn->prepare('INSERT INTO riwayat_pendidikan (nama_institusi, tingkat, jurusan, tahun_mulai, tahun_selesai) VALUES (?, ?, ?, ?, ?)');
    $stmt->bind_param('sssii', $namaInstitusi, $tingkat, $jurusan, $tahunMulai, $tahunSelesai);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil menyimpan riwayat pendidikan']);
    $stmt->close();

// UPDATE: Perbarui riwayat berdasarkan ID
} elseif ($method === 'PUT') {
    $stmt = $conn->prepare('UPDATE riwayat_pendidikan SET nama_institusi=?, tingkat=?, jurusan=?, tahun_mulai=?, tahun_selesai=? WHERE id=? LIMIT 1');
    $stmt->bind_param('sssiii', $namaInstitusi, $tingkat, $jurusan, $tahunMulai, $tahunSelesai, $id);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil memperbarui riwayat pendidikan']);
    $stmt->close();

// DELETE: Hapus riwayat berdasarkan ID
} elseif ($method === 'DELETE') {
    $stmt = $conn->prepare('DELETE FROM riwayat_pendidikan WHERE id=? LIMIT 1');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    // [PERUBAHAN 5] Beri tahu jika id yang dihapus tidak ada
    if ($stmt->affected_rows === 0) jsonError(404, 'Data pendidikan tidak ditemukan');
    echo json_encode(['status' => 'success', 'message' => 'Berhasil menghapus riwayat pendidikan']);
    $stmt->close();

} else {
    jsonError(405, 'Method tidak diizinkan');
}

$conn->close();
