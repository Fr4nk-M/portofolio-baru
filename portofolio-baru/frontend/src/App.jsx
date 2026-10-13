// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Public from './pages/Public';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Logout from './pages/Logout';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Halaman Beranda Publik */}
            <Route path="/" element={<Public />} />
            {/* Halaman Masuk Admin */}
            <Route path="/login" element={<Login />} />
            {/* [PERUBAHAN 5] Dashboard dibungkus ProtectedRoute */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Halaman Proses Logout */}
            <Route path="/logout" element={<Logout />} />
            {/* [PERUBAHAN 5] Alamat yang tidak dikenal menampilkan halaman 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
