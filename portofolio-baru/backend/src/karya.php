<?php
// backend/src/karya.php
require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

// [PERUBAHAN 1] Token dari header Authorization + cek kedaluwarsa
requireAuth();

$data = readJsonBody();

$id = (int) ($data->id ?? $_GET['id'] ?? 0);
$namaKarya = trim($data->nama_karya ?? '');
$deskripsi = trim($data->deskripsi ?? '');
$url = trim($data->url ?? '');

$method = $_SERVER['REQUEST_METHOD'];

if (in_array($method, ['POST', 'PUT'], true)) {
    if ($namaKarya === '' || $deskripsi === '' || $url === '') {
        jsonError(400, 'Data karya tidak boleh kosong');
    }
    // [PERUBAHAN 1] Tolak tautan berbahaya seperti "javascript:alert(1)"
    if (!isSafeUrl($url)) {
        jsonError(400, 'URL harus diawali http://, https://, atau mailto:');
    }
}

if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT * FROM karya_terbaik ORDER BY id DESC');
    $stmt->execute();
    echo json_encode(['status' => 'success', 'karya_terbaik' => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)]);
    $stmt->close();

} elseif ($method === 'POST') {
    $stmt = $conn->prepare('INSERT INTO karya_terbaik (nama_karya, deskripsi, url) VALUES (?, ?, ?)');
    $stmt->bind_param('sss', $namaKarya, $deskripsi, $url);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil menyimpan karya']);
    $stmt->close();

} elseif ($method === 'PUT') {
    $stmt = $conn->prepare('UPDATE karya_terbaik SET nama_karya=?, deskripsi=?, url=? WHERE id=? LIMIT 1');
    $stmt->bind_param('sssi', $namaKarya, $deskripsi, $url, $id);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil memperbarui karya']);
    $stmt->close();

} elseif ($method === 'DELETE') {
    $stmt = $conn->prepare('DELETE FROM karya_terbaik WHERE id=? LIMIT 1');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    if ($stmt->affected_rows === 0) jsonError(404, 'Data karya tidak ditemukan');
    echo json_encode(['status' => 'success', 'message' => 'Berhasil menghapus karya']);
    $stmt->close();

} else {
    jsonError(405, 'Method tidak diizinkan');
}

$conn->close();
