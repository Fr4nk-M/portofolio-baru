// frontend/src/components/FormPesan.jsx
// [PERUBAHAN 3] KOMPONEN BARU: form "Kirim pesan" di halaman publik.
// Pengunjung tidak perlu login. Pesan disimpan ke tabel `pesan` lewat POST /pesan,
// lalu admin membacanya di tab "Pesan Masuk" pada dashboard.
import { useState } from 'react';
import { KirimPesan, getErrorMessage } from '../api/backendApi';

const emptyForm = { nama: '', email: '', subjek: '', isi: '', website: '' };

const FormPesan = () => {
  const [form, setForm] = useState(emptyForm);
  // status: 'idle' | 'sending' | 'sent' | 'error'
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const setField = (name) => (e) => setForm({ ...form, [name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      await KirimPesan(form);
      setStatus('sent');
      setForm(emptyForm);
    } catch (err) {
      setStatus('error');
      setErrorMsg(getErrorMessage(err, 'Pesan gagal dikirim. Periksa koneksi lalu coba lagi.'));
    }
  };

  if (status === 'sent') {
    return (
      <div className="form-sent" role="status">
        <p className="form-sent-title">Pesan terkirim.</p>
        <p className="muted">Terima kasih, balasan akan dikirim ke email yang kamu tulis.</p>
        <button type="button" className="button" onClick={() => setStatus('idle')}>Tulis pesan lain</button>
      </div>
    );
  }

  return (
    <form className="form-pesan" onSubmit={handleSubmit} noValidate={false}>
      <div className="form-row">
        <div>
          <label htmlFor="pesan-nama">Nama</label>
          <input id="pesan-nama" type="text" required minLength={2} maxLength={100} value={form.nama} onChange={setField('nama')} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="pesan-email">Email</label>
          <input id="pesan-email" type="email" required maxLength={255} value={form.email} onChange={setField('email')} autoComplete="email" />
        </div>
      </div>

      <label htmlFor="pesan-subjek">Subjek</label>
      <input id="pesan-subjek" type="text" required maxLength={150} value={form.subjek} onChange={setField('subjek')} />

      <label htmlFor="pesan-isi">Pesan</label>
      <textarea id="pesan-isi" required minLength={10} maxLength={2000} rows={5} value={form.isi} onChange={setField('isi')} />

      {/* Honeypot anti-spam: disembunyikan dari manusia (CSS .hp), tapi diisi oleh bot.
          tabIndex -1 dan autoComplete off agar tidak ikut terisi saat pengguna menekan Tab. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="pesan-website">Website</label>
        <input id="pesan-website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={setField('website')} />
      </div>

      {status === 'error' && <p className="form-error" role="alert">{errorMsg}</p>}

      <button type="submit" className="button primary" disabled={status === 'sending'}>
        {status === 'sending' ? 'Mengirim...' : 'Kirim pesan'}
      </button>
    </form>
  );
};

export default FormPesan;
