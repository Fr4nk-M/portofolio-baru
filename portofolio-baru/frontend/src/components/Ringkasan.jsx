// frontend/src/components/Ringkasan.jsx
// [PERUBAHAN 5] KOMPONEN BARU: halaman pertama dashboard.
// Menampilkan jumlah data tiap bagian (dari endpoint GET /statistik) dan daftar
// kelengkapan profil, supaya admin langsung tahu bagian mana yang masih kosong.
import { useEffect, useState } from 'react';
import { GetStatistik, delay, getErrorMessage } from '../api/backendApi';
import Skeleton from './Skeleton';

const KARTU = [
  { key: 'pendidikan', label: 'Pendidikan', tab: 'pendidikan' },
  { key: 'pengalaman', label: 'Pengalaman', tab: 'pengalaman' },
  { key: 'keahlian', label: 'Keahlian', tab: 'keahlian' },
  { key: 'karya', label: 'Karya', tab: 'karya' },
  { key: 'kontak', label: 'Kontak', tab: 'kontak' },
];

const CEKLIS = [
  { key: 'foto', label: 'Foto profil sudah diganti dari foto bawaan' },
  { key: 'tagline', label: 'Tagline sudah diisi' },
  { key: 'tentang', label: 'Bagian Tentang Saya sudah diisi' },
  { key: 'cv', label: 'CV sudah diunggah' },
];

// onNavigate: berpindah tab saat kartu diklik
const Ringkasan = ({ onNavigate }) => {
  const [stat, setStat] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([GetStatistik(), delay(200)])
      .then(([res]) => setStat(res.data.statistik))
      .catch((err) => setError(getErrorMessage(err, 'Gagal memuat ringkasan')));
  }, []);

  if (error) return <p className="form-error">{error}</p>;
  if (!stat) return <Skeleton rows={3} cols={3} />;

  const lengkap = CEKLIS.filter((c) => stat.profil_lengkap[c.key]).length;

  return (
    <div className="ringkasan">
      <div className="section-head">
        <h3>Ringkasan</h3>
      </div>

      {/* Kartu pesan diberi tempat paling depan karena butuh tindakan */}
      <button type="button" className="stat-pesan" onClick={() => onNavigate('pesan')}>
        <span className="stat-number">{stat.pesan_belum_dibaca}</span>
        <span>
          <strong>Pesan belum dibaca</strong>
          <span className="muted"> dari {stat.pesan} pesan masuk</span>
        </span>
      </button>

      <div className="stat-grid">
        {KARTU.map((k) => (
          <button type="button" key={k.key} className="stat-card" onClick={() => onNavigate(k.tab)}>
            <span className="stat-number">{stat[k.key]}</span>
            <span className="stat-label">{k.label}</span>
          </button>
        ))}
      </div>

      <h4 className="biodata-subhead">Kelengkapan profil ({lengkap}/{CEKLIS.length})</h4>
      <ul className="checklist">
        {CEKLIS.map((c) => (
          <li key={c.key} className={stat.profil_lengkap[c.key] ? 'is-done' : ''}>
            <span className="check" aria-hidden="true">{stat.profil_lengkap[c.key] ? '✓' : ''}</span>
            {c.label}
            {!stat.profil_lengkap[c.key] && (
              <button type="button" className="link-button" onClick={() => onNavigate('biodata')}>Lengkapi</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Ringkasan;
