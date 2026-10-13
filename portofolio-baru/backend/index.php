<?php
// backend/index.php  (Front Controller / Router)

// 1. Ambil path dari URL yang diminta klien
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = trim($requestUri, '/');

// 2. PENANGANAN BERKAS STATIS - hanya untuk folder uploads/
//    (dibatasi agar berkas PHP/konfigurasi tidak pernah ikut terbaca sebagai teks)
if (strpos($path, 'uploads/') === 0) {
    $staticFile = realpath(__DIR__ . '/' . $path);
    $uploadsDir = realpath(__DIR__ . '/uploads');

    if ($staticFile && $uploadsDir && strpos($staticFile, $uploadsDir . DIRECTORY_SEPARATOR) === 0 && is_file($staticFile)) {
        $mime = mime_content_type($staticFile);
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: ' . ($mime ?: 'application/octet-stream'));
        // [PERUBAHAN 1] Larang browser "menebak" jenis berkas, supaya berkas unggahan
        // tidak pernah dijalankan sebagai HTML/JavaScript
        header('X-Content-Type-Options: nosniff');
        readfile($staticFile);
        exit;
    }
}

// 3. SET DEFAULT HEADER API: JSON
header('Content-Type: application/json');

// Jika mengakses root '/'
if (empty($path)) {
    echo json_encode(['message' => 'Selamat datang di backend portofolio (VERSI BARU)']);
    exit;
}

// 4. ROUTING DINAMIS KE FOLDER src/
$safePath = basename($path);
$filePath = __DIR__ . '/src/' . $safePath . '.php';

if (file_exists($filePath)) {
    require_once $filePath;
} else {
    // Jika endpoint tidak ditemukan
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint tidak ditemukan']);
}
