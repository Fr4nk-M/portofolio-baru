<?php
// backend/src/pesan.php
// [PERUBAHAN 3] ENDPOINT BARU: Pesan Masuk
//
// Berbeda dengan endpoint lain, endpoint ini punya DUA jenis pengguna:
//   POST              -> pengunjung umum mengirim pesan dari halaman publik (TANPA token)
//   GET / PUT / DELETE -> admin membaca, menandai, dan menghapus pesan (WAJIB token)
// Karena itu requireAuth() tidak dipanggil di paling atas, tetapi hanya untuk method admin.

require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = readJsonBody();

// ==================== POST: KIRIM PESAN (PUBLIK) ====================
if ($method === 'POST') {
    $nama = trim($data->nama ?? '');
    $email = trim($data->email ?? '');
    $subjek = trim($data->subjek ?? '');
    $isi = trim($data->isi ?? '');

    // Anti-spam 1: "honeypot". Field 'website' disembunyikan dengan CSS di form,
    // jadi manusia tidak akan mengisinya. Bot pengisi form otomatis biasanya mengisi
    // semua field. Jika terisi, kita pura-pura sukses tapi tidak menyimpan apa pun.
    if (trim($data->website ?? '') !== '') {
        echo json_encode(['status' => 'success', 'message' => 'Pesan terkirim']);
        exit;
    }

    // Validasi isian
    if (mb_strlen($nama) < 2 || mb_strlen($nama) > 100) {
        jsonError(400, 'Nama harus 2 sampai 100 karakter');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonError(400, 'Format email tidak valid');
    }
    if ($subjek === '' || mb_strlen($subjek) > 150) {
        jsonError(400, 'Subjek wajib diisi, maksimal 150 karakter');
    }
    if (mb_strlen($isi) < 10 || mb_strlen($isi) > 2000) {
        jsonError(400, 'Isi pesan harus 10 sampai 2000 karakter');
    }

    // Anti-spam 2: batasi maksimal 3 pesan per 10 menit dari alamat IP yang sama
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $stmt = $conn->prepare('SELECT COUNT(*) AS jumlah FROM pesan WHERE ip_address=? AND created_at > (NOW() - INTERVAL 10 MINUTE)');
    $stmt->bind_param('s', $ip);
    $stmt->execute();
    $jumlah = (int) $stmt->get_result()->fetch_assoc()['jumlah'];
    $stmt->close();

    if ($jumlah >= 3) {
        jsonError(429, 'Terlalu banyak pesan. Coba lagi dalam 10 menit.');
    }

    $stmt = $conn->prepare('INSERT INTO pesan (nama, email, subjek, isi, ip_address) VALUES (?, ?, ?, ?, ?)');
    $stmt->bind_param('sssss', $nama, $email, $subjek, $isi, $ip);
    $stmt->execute();
    $stmt->close();

    http_response_code(201); // 201 Created: data baru berhasil dibuat
    echo json_encode(['status' => 'success', 'message' => 'Pesan terkirim. Terima kasih!']);
    $conn->close();
    exit;
}

// ==================== METHOD KHUSUS ADMIN ====================
requireAuth();

$id = (int) ($data->id ?? $_GET['id'] ?? 0);

// GET: daftar pesan (terbaru di atas) + jumlah yang belum dibaca
if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT id, nama, email, subjek, isi, sudah_dibaca, created_at FROM pesan ORDER BY created_at DESC, id DESC');
    $stmt->execute();
    $list = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    $belumDibaca = count(array_filter($list, fn($p) => (int) $p['sudah_dibaca'] === 0));

    echo json_encode(['status' => 'success', 'pesan' => $list, 'belum_dibaca' => $belumDibaca]);

// PUT: tandai sudah dibaca / belum dibaca
} elseif ($method === 'PUT') {
    $sudahDibaca = !empty($data->sudah_dibaca) ? 1 : 0;
    $stmt = $conn->prepare('UPDATE pesan SET sudah_dibaca=? WHERE id=? LIMIT 1');
    $stmt->bind_param('ii', $sudahDibaca, $id);
    $stmt->execute();
    $stmt->close();
    echo json_encode(['status' => 'success', 'message' => 'Status pesan diperbarui']);

// DELETE: hapus pesan
} elseif ($method === 'DELETE') {
    $stmt = $conn->prepare('DELETE FROM pesan WHERE id=? LIMIT 1');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    if ($stmt->affected_rows === 0) jsonError(404, 'Pesan tidak ditemukan');
    $stmt->close();
    echo json_encode(['status' => 'success', 'message' => 'Pesan dihapus']);

} else {
    jsonError(405, 'Method tidak diizinkan');
}

$conn->close();
