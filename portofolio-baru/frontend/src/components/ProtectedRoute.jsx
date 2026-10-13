// frontend/src/components/ProtectedRoute.jsx
// [PERUBAHAN 5] KOMPONEN BARU: pembungkus rute yang hanya boleh dibuka admin.
//
// Versi asli memeriksa token di dalam Dashboard.jsx ("if (!token) return <Navigate/>").
// Dengan komponen ini, aturan proteksi ditulis sekali dan bisa dipakai untuk rute apa pun:
//   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
//
// Selain memeriksa token di browser, komponen ini juga bertanya ke server (/verify_login)
// apakah token masih diterima. Ini penting karena token di localStorage bisa saja sudah
// tidak berlaku di server (kedaluwarsa, sudah logout di tempat lain, atau database direset).
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VerifyLogin } from '../api/backendApi';
import Loading from './Loading';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  const [status, setStatus] = useState('checking'); // 'checking' | 'ok'

  useEffect(() => {
    if (!token) return;
    let aktif = true;
    VerifyLogin()
      .then(() => aktif && setStatus('ok'))
      // Jika gagal (401), interceptor axios sudah memicu logout otomatis,
      // sehingga token menjadi null dan komponen ini akan me-redirect ke /login.
      .catch(() => {});
    return () => { aktif = false; };
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (status === 'checking') {
    return <Loading type="fixed" title="Memeriksa sesi..." />;
  }

  return children;
};

export default ProtectedRoute;
