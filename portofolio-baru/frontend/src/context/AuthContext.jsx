// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LogoutApi } from '../api/backendApi';

const AuthContext = createContext(null);

// Helper membaca localStorage dengan aman
const readStorage = (key) => (typeof window !== 'undefined' ? localStorage.getItem(key) : null);

export const AuthProvider = ({ children }) => {
  // 1. Ambil token dari localStorage saat pertama kali dimuat
  const [token, setToken] = useState(() => readStorage('token'));

  // 2. Ambil data user dari localStorage
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(readStorage('user')) || null;
    } catch {
      return null;
    }
  });

  // 3. [PERUBAHAN 1] Waktu kedaluwarsa token (milidetik), dikirim backend saat login
  const [expiresAt, setExpiresAt] = useState(() => Number(readStorage('token_expires_at')) || null);

  // 4. [PERUBAHAN 1] Pesan alasan logout (mis. "Sesi berakhir"), ditampilkan di halaman Login
  const [sessionMessage, setSessionMessage] = useState('');

  // Bersihkan semua data sesi di browser
  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_expires_at');
    setToken(null);
    setUser(null);
    setExpiresAt(null);
  }, []);

  // 5. Fungsi saat login berhasil
  const login = (newToken, userData, newExpiresAt) => {
    // Simpan langsung ke localStorage agar interceptor axios bisa langsung memakainya
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token_expires_at', String(newExpiresAt));
    setToken(newToken);
    setUser(userData);
    setExpiresAt(newExpiresAt);
    setSessionMessage('');
  };

  // 6. Fungsi logout manual (tombol Logout)
  const logout = useCallback(async () => {
    try {
      if (localStorage.getItem('token')) await LogoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  // 7. [PERUBAHAN 1] Logout otomatis saat waktu token habis.
  //    Pasang timer yang berbunyi tepat di detik kedaluwarsa.
  useEffect(() => {
    if (!token || !expiresAt) return;

    const sisaWaktu = expiresAt - Date.now();
    if (sisaWaktu <= 0) {
      setSessionMessage('Sesi Anda telah berakhir, silakan login kembali.');
      clearSession();
      return;
    }

    const timer = setTimeout(() => {
      setSessionMessage('Sesi Anda telah berakhir, silakan login kembali.');
      clearSession();
    }, sisaWaktu);

    // Cleanup: batalkan timer lama jika token berganti atau komponen dilepas
    return () => clearTimeout(timer);
  }, [token, expiresAt, clearSession]);

  // 8. [PERUBAHAN 1] Dengarkan sinyal "auth:expired" dari interceptor axios.
  //    Terjadi jika server menolak token (mis. database direset, atau token dihapus).
  useEffect(() => {
    const handleExpired = (event) => {
      setSessionMessage(event.detail);
      clearSession();
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ token, user, expiresAt, login, logout, sessionMessage, setSessionMessage }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook agar mudah dipanggil di komponen lain
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
