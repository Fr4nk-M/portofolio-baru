<?php
// backend/src/verify_login.php
require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

// [PERUBAHAN 1] Token dibaca dari header. Jika tidak valid atau kedaluwarsa,
// requireAuth() otomatis membalas 401 dan menghentikan script.
$userId = requireAuth();

// Kembalikan juga sisa waktu sesi, dipakai frontend (ProtectedRoute) untuk memastikan
// token di browser masih diterima server setiap kali dashboard dibuka.
$stmt = $conn->prepare('SELECT id, username, token_expires_at FROM users WHERE id=? LIMIT 1');
$stmt->bind_param('i', $userId);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

echo json_encode([
    'status' => 'success',
    'message' => 'Token valid',
    'user' => ['id' => $user['id'], 'username' => $user['username']],
    'expires_at' => (int) $user['token_expires_at'] * 1000
]);
$conn->close();
