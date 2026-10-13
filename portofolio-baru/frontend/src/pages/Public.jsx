// frontend/src/pages/Public.jsx
// [PERUBAHAN 4] Halaman publik dirancang ulang.
//   Versi asli : kartu-kartu bertumpuk, pendidikan/pengalaman dalam tabel,
//                keahlian berupa badge teks.
//   Versi baru : navbar menempel di atas dengan sorotan bagian aktif (scroll spy),
//                hero dengan nama besar + tagline + tombol CV, bagian "Tentang Saya",
//                timeline, meter keahlian 4 kotak, dan form kirim pesan.
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GetPublic, BASE_URL, delay } from "../api/backendApi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import nofoto from "../assets/nofoto.jpg";
import Loading from "../components/Loading";
import Timeline from "../components/Timeline";
import SkillMeter from "../components/SkillMeter";
import FormPesan from "../components/FormPesan";
import useScrollSpy from "../hooks/useScrollSpy";

// Daftar bagian halaman: id dipakai untuk anchor (#tentang) dan scroll spy
const SECTIONS = [
  { id: "tentang", label: "Tentang" },
  { id: "pendidikan", label: "Pendidikan" },
  { id: "pengalaman", label: "Pengalaman" },
  { id: "keahlian", label: "Keahlian" },
  { id: "karya", label: "Karya" },
  { id: "kontak", label: "Kontak" },
];

const Public = () => {
  const { token } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bagian yang sedang terlihat di layar (untuk menyorot menu navbar)
  const activeId = useScrollSpy(SECTIONS.map((s) => s.id), [loading]);

  // Ambil data publik saat halaman pertama kali dibuka
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setLoading(true);
        const [response] = await Promise.all([GetPublic(), delay(250)]);

        if (response.data.status === "success") {
          setPortfolioData(response.data.data);
          // [PERUBAHAN 4] Judul tab browser memakai nama pemilik portofolio
          const nama = response.data.data.profil?.nama_lengkap;
          document.title = nama ? `${nama} | Portofolio` : "Portofolio Pribadi";
        } else {
          setError("Gagal memuat data portofolio");
        }
      } catch (err) {
        console.error(err);
        setError("Tidak dapat terhubung ke server backend. Pastikan backend versi baru berjalan di port 8001.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  if (loading) return <Loading type="fixed" title="Memuat portofolio..." />;

  if (error) {
    return (
      <main className="notfound">
        <h1>Portofolio belum bisa dimuat</h1>
        <p className="muted">{error}</p>
        <button className="button primary" onClick={() => window.location.reload()}>
          Muat ulang
        </button>
      </main>
    );
  }

  const profil = portfolioData?.profil || {};
  const pendidikan = portfolioData?.riwayat_pendidikan || [];
  const pengalaman = portfolioData?.pengalaman || [];
  const keahlian = portfolioData?.keahlian || [];
  const kontak = portfolioData?.kontak_aktif || [];
  const karya = portfolioData?.karya_terbaik || [];

  // Helper untuk menentukan alamat URL foto profil
  const getFotoUrl = () => {
    if (!profil.foto) return nofoto;
    if (profil.foto.startsWith("http")) return profil.foto;
    return `${BASE_URL}/uploads/${profil.foto}`;
  };

  // [PERUBAHAN 2] Paragraf "Tentang Saya": pisahkan per baris kosong
  const paragrafTentang = (profil.tentang || "").split(/\n\s*\n/).filter((p) => p.trim() !== "");

  return (
    <div className="site">
      <a href="#konten" className="skip-link">Lewati ke konten</a>

      {/* ============ NAVBAR ============ */}
      <header className="site-nav">
        <div className="site-nav-inner">
          <a href="#beranda" className="site-brand">{profil.nama_lengkap || "Portofolio"}</a>
          <nav className="site-links" aria-label="Bagian halaman">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={activeId === s.id ? "is-active" : ""}>
                {s.label}
              </a>
            ))}
          </nav>
          <div className="site-tools">
            <button className="button small" onClick={toggleTheme} aria-label="Ganti tema">
              {theme === "light" ? "Gelap" : "Terang"}
            </button>
            <Link to={token ? "/dashboard" : "/login"} className="button small">
              {token ? "Dashboard" : "Masuk"}
            </Link>
          </div>
        </div>
      </header>

      <main id="konten">
        {/* ============ HERO ============ */}
        <section className="hero" id="beranda">
          <div className="hero-text">
            <h1 className="hero-name">{profil.nama_lengkap || "Nama Lengkap"}</h1>
            {/* [PERUBAHAN 2] Tagline */}
            {profil.tagline && <p className="hero-tagline">{profil.tagline}</p>}
            <div className="hero-actions">
              {/* [PERUBAHAN 2] Tombol CV, hanya muncul jika CV sudah diunggah */}
              {profil.cv && (
                <a className="button primary" href={`${BASE_URL}/uploads/${profil.cv}`} target="_blank" rel="noreferrer">
                  Unduh CV
                </a>
              )}
              <a className="button" href="#kontak">Kirim pesan</a>
            </div>
            <ul className="hero-contact">
              {profil.email && <li><a href={`mailto:${profil.email}`}>{profil.email}</a></li>}
              {profil.nomor_hp && <li>{profil.nomor_hp}</li>}
            </ul>
          </div>
          <img
            className="hero-photo"
            src={getFotoUrl()}
            alt={`Foto ${profil.nama_lengkap || "profil"}`}
            onError={(e) => { e.target.onerror = null; e.target.src = nofoto; }}
          />
        </section>

        {/* ============ TENTANG SAYA ============ */}
        <section className="sheet" id="tentang">
          <h2 className="sheet-title">Tentang saya</h2>
          <div className="sheet-body prose">
            {paragrafTentang.length > 0
              ? paragrafTentang.map((p, i) => <p key={i}>{p}</p>)
              : <p className="muted">Belum ada deskripsi.</p>}
          </div>
        </section>

        {/* ============ PENDIDIKAN ============ */}
        <section className="sheet" id="pendidikan">
          <h2 className="sheet-title">Pendidikan</h2>
          <div className="sheet-body">
            {pendidikan.length === 0 ? (
              <p className="muted">Belum ada data pendidikan.</p>
            ) : (
              <Timeline
                items={pendidikan.map((p) => ({
                  judul: p.nama_institusi,
                  keterangan: `${p.tingkat}, ${p.jurusan}`,
                  mulai: p.tahun_mulai,
                  selesai: p.tahun_selesai,
                }))}
              />
            )}
          </div>
        </section>

        {/* ============ PENGALAMAN ============ */}
        <section className="sheet" id="pengalaman">
          <h2 className="sheet-title">Pengalaman</h2>
          <div className="sheet-body">
            {pengalaman.length === 0 ? (
              <p className="muted">Belum ada data pengalaman.</p>
            ) : (
              <Timeline
                items={pengalaman.map((p) => ({
                  judul: p.jabatan,
                  keterangan: p.nama_perusahaan,
                  mulai: p.tahun_mulai,
                  selesai: p.tahun_selesai,
                }))}
              />
            )}
          </div>
        </section>

        {/* ============ KEAHLIAN ============ */}
        <section className="sheet" id="keahlian">
          <h2 className="sheet-title">Keahlian</h2>
          <div className="sheet-body">
            {keahlian.length === 0 ? (
              <p className="muted">Belum ada data keahlian.</p>
            ) : (
              <ul className="skills">
                {keahlian.map((item, idx) => (
                  <li key={idx}>
                    <span className="skill-name">{item.nama_keahlian}</span>
                    {/* animate: kotak terisi saat bagian ini muncul di layar */}
                    <SkillMeter level={item.level} animate />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ============ KARYA ============ */}
        <section className="sheet" id="karya">
          <h2 className="sheet-title">Karya</h2>
          <div className="sheet-body">
            {karya.length === 0 ? (
              <p className="muted">Belum ada karya.</p>
            ) : (
              <div className="works">
                {karya.map((item, idx) => (
                  <article key={idx} className="work">
                    <h3 className="work-title">{item.nama_karya}</h3>
                    <p className="work-desc">{item.deskripsi}</p>
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noreferrer" className="work-link">
                        Lihat proyek
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ============ KONTAK + FORM PESAN ============ */}
        <section className="sheet" id="kontak">
          <h2 className="sheet-title">Kontak</h2>
          <div className="sheet-body contact-grid">
            <div>
              <p className="contact-intro">
                Punya tawaran kerja sama, pertanyaan soal proyek, atau sekadar ingin menyapa?
                Tulis lewat form ini atau hubungi salah satu akun di bawah.
              </p>
              {kontak.length > 0 && (
                <ul className="contact-links">
                  {kontak.map((item, idx) => (
                    <li key={idx}>
                      <a href={item.url} target="_blank" rel="noreferrer">{item.nama_media}</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* [PERUBAHAN 3] Form kirim pesan */}
            <FormPesan />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} {profil.nama_lengkap || "Portofolio"}</p>
        <a href="#beranda">Kembali ke atas</a>
      </footer>
    </div>
  );
};

export default Public;
