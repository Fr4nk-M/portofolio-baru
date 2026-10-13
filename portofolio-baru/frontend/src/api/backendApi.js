// frontend/src/api/backendApi.js
import axios from "axios";

// [PERUBAHAN] Versi baru memakai backend di port 8001 (versi asli: 8000)
export const BASE_URL = 'http://localhost:8001';

// Fungsi helper delay untuk memberi waktu animasi loading yang nyaman bagi mata
export const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

// Membuat instance axios dengan konfigurasi dasar
const backendApi = axios.create({
  baseURL: BASE_URL,
});

// ==================== [PERUBAHAN 1] INTERCEPTOR ====================
// Interceptor = fungsi yang dijalankan axios otomatis pada SETIAP request/response.

// a) Request interceptor: tempelkan token ke header Authorization.
//    Versi asli mengirim token secara manual di tiap fungsi ({ token } atau ?token=...).
//    Sekarang cukup di satu tempat ini, dan token tidak pernah muncul di URL.
backendApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// b) Response interceptor: jika server membalas 401 (token salah/kedaluwarsa),
//    kirim sinyal "auth:expired". AuthContext mendengarkan sinyal ini lalu logout otomatis.
//    Pengecualian: request /login sendiri (401 di sana artinya password salah, bukan sesi habis).
backendApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/login')) {
      // Pesan dari server dipakai jika soal sesi berakhir; selain itu tampilkan pesan umum
      const serverMsg = error.response.data?.message || '';
      window.dispatchEvent(new CustomEvent('auth:expired', {
        detail: serverMsg.includes('berakhir')
          ? serverMsg
          : 'Sesi Anda tidak berlaku lagi. Silakan login kembali.',
      }));
    }
    return Promise.reject(error);
  }
);

// Helper mengambil pesan error dari respons backend
export const getErrorMessage = (error, fallback = 'Terjadi kesalahan') =>
  error.response?.data?.message || error.response?.data?.pesan || fallback;

// ==================== AUTENTIKASI ====================
export const LoginApi = async (username, password) => {
  return await backendApi.post('/login', { username, password });
};

// [PERUBAHAN 1] Parameter token dihapus dari semua fungsi di bawah,
// karena token sudah otomatis ditempel oleh interceptor.
export const LogoutApi = async () => {
  return await backendApi.post('/logout');
};

export const VerifyLogin = async () => {
  return await backendApi.get('/verify_login');
};

// ==================== ENDPOINT PUBLIK ====================
export const GetPublic = async () => {
  return await backendApi.get('/public');
};

// [PERUBAHAN 3] Pengunjung mengirim pesan (tanpa login)
export const KirimPesan = async (data) => {
  return await backendApi.post('/pesan', data);
};

// ==================== BIODATA & PROFIL ====================
export const GetUser = async () => {
  return await backendApi.get('/users');
};

export const UpdateUser = async (formData) => {
  return await backendApi.post('/users', formData);
};

// ==================== [PERUBAHAN 5] STATISTIK DASHBOARD ====================
export const GetStatistik = async () => {
  return await backendApi.get('/statistik');
};

// ==================== [PERUBAHAN 3] PESAN MASUK (ADMIN) ====================
export const GetPesan = async () => {
  return await backendApi.get('/pesan');
};
export const TandaiPesan = async (id, sudah_dibaca) => {
  return await backendApi.put('/pesan', { id, sudah_dibaca });
};
export const DeletePesan = async (id) => {
  return await backendApi.delete('/pesan', { data: { id } });
};

// ==================== RIWAYAT PENDIDIKAN ====================
export const GetPendidikan = async () => {
  return await backendApi.get('/pendidikan');
};
export const AddPendidikan = async (data) => {
  return await backendApi.post('/pendidikan', data);
};
export const UpdatePendidikan = async (data) => {
  return await backendApi.put('/pendidikan', data);
};
export const DeletePendidikan = async (id) => {
  return await backendApi.delete('/pendidikan', { data: { id } });
};

// ==================== PENGALAMAN ====================
export const GetPengalaman = async () => {
  return await backendApi.get('/pengalaman');
};
export const AddPengalaman = async (data) => {
  return await backendApi.post('/pengalaman', data);
};
export const UpdatePengalaman = async (data) => {
  return await backendApi.put('/pengalaman', data);
};
export const DeletePengalaman = async (id) => {
  return await backendApi.delete('/pengalaman', { data: { id } });
};

// ==================== KEAHLIAN (SKILLS) ====================
export const GetKeahlian = async () => {
  return await backendApi.get('/keahlian');
};
export const AddKeahlian = async (data) => {
  return await backendApi.post('/keahlian', data);
};
export const UpdateKeahlian = async (data) => {
  return await backendApi.put('/keahlian', data);
};
export const DeleteKeahlian = async (id) => {
  return await backendApi.delete('/keahlian', { data: { id } });
};

// ==================== KONTAK AKTIF ====================
export const GetKontak = async () => {
  return await backendApi.get('/kontak');
};
export const AddKontak = async (data) => {
  return await backendApi.post('/kontak', data);
};
export const UpdateKontak = async (data) => {
  return await backendApi.put('/kontak', data);
};
export const DeleteKontak = async (id) => {
  return await backendApi.delete('/kontak', { data: { id } });
};

// ==================== KARYA TERBAIK ====================
export const GetKarya = async () => {
  return await backendApi.get('/karya');
};
export const AddKarya = async (data) => {
  return await backendApi.post('/karya', data);
};
export const UpdateKarya = async (data) => {
  return await backendApi.put('/karya', data);
};
export const DeleteKarya = async (id) => {
  return await backendApi.delete('/karya', { data: { id } });
};

export default backendApi;
