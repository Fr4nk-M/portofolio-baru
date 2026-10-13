// frontend/src/pages/NotFound.jsx
// [PERUBAHAN 5] HALAMAN BARU: tampil jika alamat tidak cocok dengan rute mana pun
import { Link } from 'react-router-dom';

const NotFound = () => (
  <main className="notfound">
    <p className="notfound-code">404</p>
    <h1>Halaman ini tidak ada</h1>
    <p className="muted">Alamatnya mungkin salah ketik atau halamannya sudah dipindah.</p>
    <Link to="/" className="button primary">Kembali ke portofolio</Link>
  </main>
);

export default NotFound;
