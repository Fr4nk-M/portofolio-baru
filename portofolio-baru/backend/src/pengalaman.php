<?php
// backend/src/pengalaman.php
require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

// [PERUBAHAN 1] Token dari header Authorization + cek kedaluwarsa
requireAuth();

$data = readJsonBody();

$id = (int) ($data->id ?? $_GET['id'] ?? 0);
$namaPerusahaan = trim($data->nama_perusahaan ?? '');
$jabatan = trim($data->jabatan ?? '');
$tahunMulai = (int) ($data->tahun_mulai ?? 0);
$tahunSelesai = (int) ($data->tahun_selesai ?? 0);

$method = $_SERVER['REQUEST_METHOD'];

if (in_array($method, ['POST', 'PUT'], true)) {
    if ($namaPerusahaan === '' || $jabatan === '') {
        jsonError(400, 'Data pengalaman tidak boleh kosong');
    }
    // [PERUBAHAN 5] Validasi tahun
    validasiTahun($tahunMulai, $tahunSelesai);
}

if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT * FROM pengalaman ORDER BY tahun_mulai DESC, id DESC');
    $stmt->execute();
    echo json_encode(['status' => 'success', 'pengalaman' => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)]);
    $stmt->close();

} elseif ($method === 'POST') {
    $stmt = $conn->prepare('INSERT INTO pengalaman (nama_perusahaan, jabatan, tahun_mulai, tahun_selesai) VALUES (?, ?, ?, ?)');
    $stmt->bind_param('ssii', $namaPerusahaan, $jabatan, $tahunMulai, $tahunSelesai);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil menyimpan pengalaman']);
    $stmt->close();

} elseif ($method === 'PUT') {
    $stmt = $conn->prepare('UPDATE pengalaman SET nama_perusahaan=?, jabatan=?, tahun_mulai=?, tahun_selesai=? WHERE id=? LIMIT 1');
    $stmt->bind_param('ssiii', $namaPerusahaan, $jabatan, $tahunMulai, $tahunSelesai, $id);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil memperbarui pengalaman']);
    $stmt->close();

} elseif ($method === 'DELETE') {
    $stmt = $conn->prepare('DELETE FROM pengalaman WHERE id=? LIMIT 1');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    if ($stmt->affected_rows === 0) jsonError(404, 'Data pengalaman tidak ditemukan');
    echo json_encode(['status' => 'success', 'message' => 'Berhasil menghapus pengalaman']);
    $stmt->close();

} else {
    jsonError(405, 'Method tidak diizinkan');
}

$conn->close();
