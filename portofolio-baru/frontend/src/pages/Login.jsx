// frontend/src/pages/Login.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import { LoginApi, getErrorMessage } from "../api/backendApi";
import Alert from "../components/Alert";

const Login = () => {
  const navigate = useNavigate();
  const { token, user, login, sessionMessage, setSessionMessage } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // [PERUBAHAN 5] Tombol tampilkan/sembunyikan password
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "success", message: "" });

  // Jika sudah login, langsung alihkan ke Dashboard
  useEffect(() => {
    document.title = "Login Portofolio";
    if (token && user) {
      navigate("/dashboard");
    }
  }, [token, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (username === "" || password === "") {
      setAlert({ show: true, type: "error", message: "Username dan Password tidak boleh kosong" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await LoginApi(username, password);

      if (response.data.status === 'success') {
        // [PERUBAHAN 1] Simpan juga waktu kedaluwarsa token
        login(response.data.token, response.data.user, response.data.expires_at);
        navigate("/dashboard");
      }
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: getErrorMessage(error, "Login gagal, periksa koneksi backend"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <div className="card login-card">
        <form onSubmit={handleLogin}>
          <h1 className="login-title">Masuk ke dashboard</h1>
          <p className="muted login-sub">Khusus pemilik portofolio.</p>

          {/* [PERUBAHAN 1] Pesan saat sesi berakhir otomatis */}
          {sessionMessage && (
            <div className="notice" role="status">
              {sessionMessage}
              <button type="button" className="notice-close" onClick={() => setSessionMessage('')} aria-label="Tutup pesan">×</button>
            </div>
          )}

          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan username"
            autoComplete="username"
          />

          <label htmlFor="password">Password</label>
          <div className="input-with-action">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              autoComplete="current-password"
            />
            <button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Sembunyikan" : "Tampilkan"}
            </button>
          </div>

          <Button primary={true} type="submit" text={isSubmitting ? "Memeriksa..." : "Masuk"} className="block" disabled={isSubmitting} />
        </form>

        <div className="login-back">
          <Link to="/">Kembali ke portofolio</Link>
        </div>
      </div>
      <Alert alert={alert} setAlert={setAlert} />
    </main>
  );
};

export default Login;
