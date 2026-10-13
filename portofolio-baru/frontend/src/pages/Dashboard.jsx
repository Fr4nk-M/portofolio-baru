// frontend/src/pages/Dashboard.jsx
// [PERUBAHAN 5] Tata letak dashboard diubah dari deretan tombol tab menjadi sidebar.
//   - Halaman pertama sekarang "Ringkasan" (statistik), bukan langsung Biodata
//   - Ada tab baru "Pesan Masuk" dengan badge jumlah pesan belum dibaca (PERUBAHAN 3)
//   - Pengecekan token dipindah ke <ProtectedRoute> (lihat App.jsx)
//   - Di layar HP, sidebar disembunyikan dan dibuka lewat tombol Menu
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { GetStatistik } from "../api/backendApi";
import Icon from "../components/Icon";
import Ringkasan from "../components/Ringkasan";
import Biodata from "../components/Biodata";
import Pendidikan from "../components/Pendidikan";
import Pengalaman from "../components/Pengalaman";
import Keahlian from "../components/Keahlian";
import Kontak from "../components/Kontak";
import Karya from "../components/Karya";
import Pesan from "../components/Pesan";

const tabs = [
  { id: "ringkasan", label: "Ringkasan" },
  { id: "pesan", label: "Pesan Masuk" },
  { id: "biodata", label: "Biodata" },
  { id: "pendidikan", label: "Pendidikan" },
  { id: "pengalaman", label: "Pengalaman" },
  { id: "keahlian", label: "Keahlian" },
  { id: "karya", label: "Karya" },
  { id: "kontak", label: "Kontak" },
];

// Format sisa waktu sesi, mis. "1 j 42 m"
const formatSisa = (ms) => {
  const menit = Math.max(0, Math.floor(ms / 60000));
  return `${Math.floor(menit / 60)} j ${menit % 60} m`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, expiresAt } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Tab aktif saat ini (default: 'ringkasan')
  const [activeTab, setActiveTab] = useState("ringkasan");
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    document.title = "Dashboard - Editor Portofolio";
    // Ambil jumlah pesan belum dibaca untuk badge sidebar
    GetStatistik().then((res) => setUnread(res.data.statistik.pesan_belum_dibaca)).catch(() => {});
    // Perbarui tampilan sisa waktu sesi setiap 30 detik
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const pilihTab = (id) => {
    setActiveTab(id);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const activeLabel = tabs.find((t) => t.id === activeTab)?.label;

  return (
    <div className="dash">
      {/* Bilah atas khusus layar kecil */}
      <header className="dash-topbar">
        <button type="button" className="button small" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="dash-sidebar">
          <Icon name="menu" /> Menu
        </button>
        <span className="dash-topbar-title">{activeLabel}</span>
      </header>

      <aside id="dash-sidebar" className={`dash-sidebar${menuOpen ? " is-open" : ""}`}>
        <div className="dash-brand">
          <span className="dash-brand-name">Editor Portofolio</span>
          <span className="muted dash-brand-user">Masuk sebagai {user?.username || "admin"}</span>
        </div>

        <nav className="dash-nav" aria-label="Menu dashboard">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => pilihTab(tab.id)}
              className={`dash-nav-item${activeTab === tab.id ? " is-active" : ""}`}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              <Icon name={tab.id} />
              <span>{tab.label}</span>
              {tab.id === "pesan" && unread > 0 && (
                <span className="nav-badge" aria-label={`${unread} belum dibaca`}>{unread}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="dash-nav dash-nav-bottom">
          <Link to="/" className="dash-nav-item">
            <Icon name="publik" /> <span>Lihat halaman publik</span>
          </Link>
          <button type="button" className="dash-nav-item" onClick={toggleTheme}>
            <Icon name="tema" /> <span>Ganti ke tema {theme === "light" ? "gelap" : "terang"}</span>
          </button>
          <button type="button" className="dash-nav-item" onClick={handleLogout}>
            <Icon name="keluar" /> <span>Keluar</span>
          </button>
          {/* [PERUBAHAN 1] Sisa waktu sebelum logout otomatis */}
          {expiresAt && (
            <p className="session-left">Sesi berakhir dalam {formatSisa(expiresAt - now)}</p>
          )}
        </div>
      </aside>

      {/* Lapisan gelap di belakang sidebar saat terbuka di HP */}
      {menuOpen && <div className="dash-scrim" onClick={() => setMenuOpen(false)} />}

      {/* Area Komponen Aktif */}
      <main className="dash-main">
        <div className="card">
          {activeTab === "ringkasan" && <Ringkasan onNavigate={pilihTab} />}
          {activeTab === "pesan" && <Pesan onCountChange={setUnread} />}
          {activeTab === "biodata" && <Biodata />}
          {activeTab === "pendidikan" && <Pendidikan />}
          {activeTab === "pengalaman" && <Pengalaman />}
          {activeTab === "keahlian" && <Keahlian />}
          {activeTab === "kontak" && <Kontak />}
          {activeTab === "karya" && <Karya />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
