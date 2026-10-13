// frontend/src/components/Biodata.jsx
import { useState, useEffect } from 'react';
import { GetUser, UpdateUser, BASE_URL, delay, getErrorMessage } from '../api/backendApi';
import nofoto from '../assets/nofoto.jpg';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Skeleton from './Skeleton';

// [PERUBAHAN 2] Field baru: tagline, tentang, cv (berkas PDF), hapus_cv (centang)
const emptyForm = {
  username: '', email: '', nama_lengkap: '', nomor_hp: '', password: '',
  tagline: '', tentang: '', foto: null, cv: null, hapus_cv: false,
};

const TAGLINE_MAX = 150;
const TENTANG_MAX = 2000;

// [PERUBAHAN 1] Prop token tidak diperlukan lagi
const Biodata = () => {
  const [profile, setProfile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formDataState, setFormDataState] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // 1. Ambil data profil dari server
  const fetchGetUser = async () => {
    setIsLoadingData(true);
    try {
      const [res] = await Promise.all([GetUser(), delay(200)]);
      if (res.data.status === 'success') {
        setProfile(res.data.user);
      }
    } catch (err) {
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal mengambil data biodata'), type: 'error' });
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchGetUser();
  }, []);

  const getFotoUrl = () => {
    if (!profile?.foto) return nofoto;
    if (profile.foto.startsWith('http')) return profile.foto;
    return `${BASE_URL}/uploads/${profile.foto}`;
  };

  // 2. Buka form edit
  const handleOpenEdit = () => {
    setFormDataState({
      username: profile?.username || '',
      email: profile?.email || '',
      nama_lengkap: profile?.nama_lengkap || '',
      nomor_hp: profile?.nomor_hp || '',
      password: '',
      tagline: profile?.tagline || '',
      tentang: profile?.tentang || '',
      foto: null,
      cv: null,
      hapus_cv: false,
    });
    setIsOpen(true);
  };

  // 3. Kirim FormData (mendukung unggah berkas foto & CV)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // [PERUBAHAN 2] Cek ukuran CV di browser dulu, agar tidak perlu menunggu upload
    // berkas besar hanya untuk ditolak server
    if (formDataState.cv && formDataState.cv.size > 2 * 1024 * 1024) {
      setAlert({ show: true, message: 'Ukuran CV maksimal 2 MB', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    // FormData dipakai (bukan JSON) karena request ini membawa berkas
    const data = new FormData();
    data.append('nama_lengkap', formDataState.nama_lengkap);
    data.append('username', formDataState.username);
    data.append('email', formDataState.email);
    data.append('nomor_hp', formDataState.nomor_hp);
    data.append('tagline', formDataState.tagline);
    data.append('tentang', formDataState.tentang);

    if (formDataState.password) {
      data.append('password', formDataState.password);
    }
    if (formDataState.foto) {
      data.append('foto', formDataState.foto);
    }
    if (formDataState.cv) {
      data.append('cv', formDataState.cv);
    }
    if (formDataState.hapus_cv) {
      data.append('hapus_cv', '1');
    }

    try {
      const response = await UpdateUser(data);
      if (response.data.status === 'success') {
        setAlert({ show: true, message: 'Biodata berhasil diperbarui!', type: 'success' });
        setIsOpen(false);
        fetchGetUser(); // Ambil ulang data terbaru
      }
    } catch (err) {
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal memperbarui profil'), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const setField = (name) => (e) => setFormDataState({ ...formDataState, [name]: e.target.value });

  if (isLoadingData) return <Skeleton rows={5} cols={2} />;

  const rows = [
    ['Username', profile?.username],
    ['Nama Lengkap', profile?.nama_lengkap],
    ['Email', profile?.email],
    ['Nomor HP', profile?.nomor_hp],
    ['Tagline', profile?.tagline],
  ];

  return (
    <div>
      <div className="section-head">
        <h3>Biodata Profil</h3>
        <button type="button" className="button primary" onClick={handleOpenEdit}>Edit Biodata</button>
      </div>

      <div className="biodata-grid">
        <img
          className="profile-photo"
          src={getFotoUrl()}
          alt="Foto profil"
          onError={(e) => { e.target.onerror = null; e.target.src = nofoto; }}
        />

        <div>
          <table className="kv-table">
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  <td>{value || <span className="muted">Belum diisi</span>}</td>
                </tr>
              ))}
              {/* [PERUBAHAN 2] Tautan CV */}
              <tr>
                <th scope="row">CV</th>
                <td>
                  {profile?.cv
                    ? <a href={`${BASE_URL}/uploads/${profile.cv}`} target="_blank" rel="noreferrer">Lihat CV (PDF)</a>
                    : <span className="muted">Belum diunggah</span>}
                </td>
              </tr>
            </tbody>
          </table>

          {/* [PERUBAHAN 2] Tentang Saya */}
          <h4 className="biodata-subhead">Tentang Saya</h4>
          {profile?.tentang
            ? <p className="biodata-about">{profile.tentang}</p>
            : <p className="muted">Belum diisi. Ceritakan singkat siapa kamu dan apa yang sedang kamu kerjakan.</p>}
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Edit Biodata" isLoading={isSubmitting} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div>
              <label>Username</label>
              <input type="text" required value={formDataState.username} onChange={setField('username')} />
            </div>
            <div>
              <label>Nama Lengkap</label>
              <input type="text" required value={formDataState.nama_lengkap} onChange={setField('nama_lengkap')} />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label>Email</label>
              <input type="email" required value={formDataState.email} onChange={setField('email')} />
            </div>
            <div>
              <label>Nomor HP</label>
              <input type="text" required value={formDataState.nomor_hp} onChange={setField('nomor_hp')} />
            </div>
          </div>

          {/* [PERUBAHAN 2] Tagline dengan penghitung karakter */}
          <label>
            Tagline <span className="field-hint">{formDataState.tagline.length}/{TAGLINE_MAX}</span>
          </label>
          <input
            type="text"
            maxLength={TAGLINE_MAX}
            placeholder="Contoh: Mahasiswa Informatika yang suka membangun aplikasi web"
            value={formDataState.tagline}
            onChange={setField('tagline')}
          />

          {/* [PERUBAHAN 2] Tentang Saya */}
          <label>
            Tentang Saya <span className="field-hint">{formDataState.tentang.length}/{TENTANG_MAX}</span>
          </label>
          <textarea
            maxLength={TENTANG_MAX}
            rows={5}
            value={formDataState.tentang}
            onChange={setField('tentang')}
          />

          <label>Password Baru (kosongkan jika tidak diganti, minimal 8 karakter)</label>
          <input type="password" minLength={8} value={formDataState.password} onChange={setField('password')} autoComplete="new-password" />

          <div className="form-row">
            <div>
              <label>Foto Profil (JPG / PNG / WEBP, maks 5 MB)</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFormDataState({ ...formDataState, foto: e.target.files[0] || null })}
              />
            </div>
            <div>
              {/* [PERUBAHAN 2] Unggah CV */}
              <label>CV (PDF, maks 2 MB)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFormDataState({ ...formDataState, cv: e.target.files[0] || null, hapus_cv: false })}
              />
              {profile?.cv && !formDataState.cv && (
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={formDataState.hapus_cv}
                    onChange={(e) => setFormDataState({ ...formDataState, hapus_cv: e.target.checked })}
                  />
                  Hapus CV yang sekarang
                </label>
              )}
            </div>
          </div>

          <div className="form-actions">
            <Button primary={true} text="Simpan Perubahan" disabled={isSubmitting} />
          </div>
        </form>
      </Modal>

      <Alert alert={alert} setAlert={setAlert} />
    </div>
  );
};

export default Biodata;
