<?php
// backend/src/logout.php
require_once __DIR__ . '/../library/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Metode tidak diizinkan']);
    exit;
}

require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

// [PERUBAHAN 1] Token dibaca dari header Authorization, bukan dari body JSON
$token = getBearerToken();

if ($token === '') {
    jsonError(401, 'Token tidak boleh kosong');
}

// Kosongkan token dan waktu kedaluwarsanya. Pencarian memakai hash token.
$hashed = hashToken($token);
$logoutStmt = $conn->prepare('UPDATE users SET token=NULL, token_expires_at=NULL WHERE token=? LIMIT 1');
$logoutStmt->bind_param('s', $hashed);
$logoutStmt->execute();

if ($logoutStmt->affected_rows === 0) {
    jsonError(401, 'Token tidak valid');
}

echo json_encode(['status' => 'success', 'message' => 'Anda telah logout!']);
$logoutStmt->close();
$conn->close();
