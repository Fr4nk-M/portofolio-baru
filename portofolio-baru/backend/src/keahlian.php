<?php
// backend/src/keahlian.php
require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

// [PERUBAHAN 1] Token dari header Authorization + cek kedaluwarsa
requireAuth();

$data = readJsonBody();

$id = (int) ($data->id ?? $_GET['id'] ?? 0);
$namaKeahlian = trim($data->nama_keahlian ?? '');
$level = trim($data->level ?? '');

// [PERUBAHAN 5] Level hanya boleh salah satu dari daftar ini.
// Halaman publik baru menggambar meter 4 kotak berdasarkan level, jadi nilainya harus pasti.
$allowedLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

$method = $_SERVER['REQUEST_METHOD'];

if (in_array($method, ['POST', 'PUT'], true)) {
    if ($namaKeahlian === '' || $level === '') {
        jsonError(400, 'Data keahlian tidak boleh kosong');
    }
    if (!in_array($level, $allowedLevels, true)) {
        jsonError(400, 'Level harus Beginner, Intermediate, Advanced, atau Expert');
    }
}

if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT * FROM keahlian ORDER BY id DESC');
    $stmt->execute();
    echo json_encode(['status' => 'success', 'keahlian' => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)]);
    $stmt->close();

} elseif ($method === 'POST') {
    $stmt = $conn->prepare('INSERT INTO keahlian (nama_keahlian, level) VALUES (?, ?)');
    $stmt->bind_param('ss', $namaKeahlian, $level);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil menyimpan keahlian']);
    $stmt->close();

} elseif ($method === 'PUT') {
    $stmt = $conn->prepare('UPDATE keahlian SET nama_keahlian=?, level=? WHERE id=? LIMIT 1');
    $stmt->bind_param('ssi', $namaKeahlian, $level, $id);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil memperbarui keahlian']);
    $stmt->close();

} elseif ($method === 'DELETE') {
    $stmt = $conn->prepare('DELETE FROM keahlian WHERE id=? LIMIT 1');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    if ($stmt->affected_rows === 0) jsonError(404, 'Data keahlian tidak ditemukan');
    echo json_encode(['status' => 'success', 'message' => 'Berhasil menghapus keahlian']);
    $stmt->close();

} else {
    jsonError(405, 'Method tidak diizinkan');
}

$conn->close();
