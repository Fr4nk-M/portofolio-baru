<?php
// backend/src/kontak.php
require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

// [PERUBAHAN 1] Token dari header Authorization + cek kedaluwarsa
requireAuth();

$data = readJsonBody();

$id = (int) ($data->id ?? $_GET['id'] ?? 0);
$nama_media = trim($data->nama_media ?? "");
$url = trim($data->url ?? "");

$method = $_SERVER['REQUEST_METHOD'];

if (in_array($method, ['POST', 'PUT'], true)) {
    if ($nama_media === '' || $url === '') {
        jsonError(400, 'Data kontak tidak boleh kosong');
    }
    // [PERUBAHAN 1] Tolak tautan berbahaya seperti "javascript:alert(1)"
    if (!isSafeUrl($url)) {
        jsonError(400, 'URL harus diawali http://, https://, atau mailto:');
    }
}

if ($method === 'GET') {
    $stmtGet = $conn->prepare("SELECT * FROM kontak_aktif ORDER BY id DESC");
    $stmtGet->execute();
    echo json_encode(['status' => 'success', 'kontak_aktif' => $stmtGet->get_result()->fetch_all(MYSQLI_ASSOC)]);
    $stmtGet->close();

} elseif ($method === 'POST') {
    $stmtPost = $conn->prepare("INSERT INTO kontak_aktif (nama_media, `url`) VALUES (?, ?)");
    $stmtPost->bind_param("ss", $nama_media, $url);
    $stmtPost->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil menyimpan kontak!']);
    $stmtPost->close();

} elseif ($method === 'PUT') {
    $stmtPut = $conn->prepare("UPDATE kontak_aktif SET nama_media=?, `url`=? WHERE id=? LIMIT 1");
    $stmtPut->bind_param("ssi", $nama_media, $url, $id);
    $stmtPut->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil memperbarui kontak!']);
    $stmtPut->close();

} elseif ($method === 'DELETE') {
    $stmtDelete = $conn->prepare("DELETE FROM kontak_aktif WHERE id=? LIMIT 1");
    $stmtDelete->bind_param("i", $id);
    $stmtDelete->execute();
    if ($stmtDelete->affected_rows === 0) jsonError(404, 'Data kontak tidak ditemukan');
    echo json_encode(['status' => 'success', 'message' => 'Berhasil menghapus kontak!']);
    $stmtDelete->close();

} else {
    jsonError(405, 'Method tidak diizinkan');
}

$conn->close();
