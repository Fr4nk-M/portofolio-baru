<?php
// backend/src/login.php
require_once __DIR__ . '/../library/cors.php';

// Validasi hanya metode POST yang diizinkan
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Hanya metode POST yang diterima.']);
    exit;
}

require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

$data = readJsonBody();

$username = trim($data->username ?? '');
$password = trim($data->password ?? '');

if ($username === '' || $password === '') {
    jsonError(400, 'Username dan Password tidak boleh kosong!');
}

// Cari user berdasarkan username menggunakan prepared statement
$stmt = $conn->prepare('SELECT id, username, `password` FROM users WHERE username=?');
$stmt->bind_param('s', $username);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

// Verifikasi hash password
if ($row && password_verify($password, $row['password'])) {
    // Buat token acak kriptografis (32 bytes = 64 karakter heksadesimal)
    $token = bin2hex(random_bytes(32));

    // [PERUBAHAN 1] Hitung waktu kedaluwarsa: sekarang + 2 jam
    $expiresAt = time() + TOKEN_LIFETIME;

    // [PERUBAHAN 1] Yang disimpan ke database adalah HASH token, bukan token aslinya.
    // Token asli hanya dikirim satu kali ke browser lewat respons di bawah.
    $hashed = hashToken($token);
    $updateStmt = $conn->prepare('UPDATE users SET token=?, token_expires_at=? WHERE id=? LIMIT 1');
    $updateStmt->bind_param('sii', $hashed, $expiresAt, $row['id']);

    if (!$updateStmt->execute()) {
        jsonError(500, 'Gagal memperbarui token!');
    }
    $updateStmt->close();

    // Kembalikan token + waktu kedaluwarsa ke klien.
    // expires_at dikirim dalam milidetik karena JavaScript (Date.now()) memakai milidetik.
    echo json_encode([
        'status' => 'success',
        'message' => 'Login berhasil',
        'user' => [
            'id' => $row['id'],
            'username' => $row['username']
        ],
        'token' => $token,
        'expires_at' => $expiresAt * 1000
    ]);
    $conn->close();
    exit;
}

// Jika username atau password salah.
// Pesan sengaja dibuat sama untuk kedua kasus, agar penyerang tidak tahu
// apakah username-nya yang salah atau password-nya.
$conn->close();
jsonError(401, 'Username atau password salah!');
