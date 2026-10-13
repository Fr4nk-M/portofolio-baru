<?php
// backend/library/dbconnection.php

// [PERUBAHAN] Nama database default diganti menjadi 'portofolio_v2'.
// Alasannya: supaya versi baru TIDAK memakai database yang sama dengan versi asli
// ('portofolio'). Dengan begitu kedua versi bisa dijalankan bersamaan, dan menjalankan
// migrasi versi baru tidak akan menghapus data milik versi asli.
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_NAME', getenv('DB_NAME') ?: 'portofolio_v2');

// Membuat koneksi ke server database MySQL
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS);

// Cek apakah koneksi berhasil
if ($conn->connect_error) {
    die('Koneksi gagal: ' . $conn->connect_error);
}

$conn->set_charset('utf8mb4');

// Coba memilih database target
try {
    $conn->select_db(DB_NAME);
} catch (mysqli_sql_exception $e) {
    // Database belum ada (normal terjadi saat menjalankan migrasi pertama kali)
}
