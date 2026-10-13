// frontend/src/components/Pesan.jsx
// [PERUBAHAN 3] KOMPONEN BARU: tab "Pesan Masuk" di dashboard.
// Fitur: daftar pesan (yang belum dibaca ditebalkan), filter, buka pesan
// (otomatis ditandai sudah dibaca), tandai belum dibaca, balas lewat email, hapus.
import { useState, useEffect } from 'react';
import { GetPesan, TandaiPesan, DeletePesan, delay, getErrorMessage } from '../api/backendApi';
import Modal from './Modal';
import Alert from './Alert';
import Skeleton from './Skeleton';
import ConfirmDialog from './ConfirmDialog';

// Format tanggal "2026-10-13 09:15:00" menjadi "13 Okt 2026, 09.15"
const formatTanggal = (value) => {
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// onCountChange: memberi tahu Dashboard jumlah pesan belum dibaca (untuk badge di sidebar)
const Pesan = ({ onCountChange }) => {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('semua'); // 'semua' | 'belum'
  const [selected, setSelected] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const [res] = await Promise.all([GetPesan(), delay(200)]);
      if (res.data.status === 'success') {
        setList(res.data.pesan || []);
        onCountChange?.(res.data.belum_dibaca);
      }
    } catch (err) {
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal mengambil pesan'), type: 'error' });
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ubah status baca satu pesan di state lokal, tanpa memuat ulang seluruh daftar
  const updateLocal = (id, sudahDibaca) => {
    const next = list.map((p) => (p.id === id ? { ...p, sudah_dibaca: sudahDibaca ? 1 : 0 } : p));
    setList(next);
    onCountChange?.(next.filter((p) => Number(p.sudah_dibaca) === 0).length);
  };

  // Buka pesan: tampilkan di modal dan tandai sudah dibaca
  const handleOpen = async (item) => {
    setSelected(item);
    if (Number(item.sudah_dibaca) === 0) {
      try {
        await TandaiPesan(item.id, true);
        updateLocal(item.id, true);
      } catch (err) {
        setAlert({ show: true, message: getErrorMessage(err, 'Gagal menandai pesan'), type: 'error' });
      }
    }
  };

  const handleMarkUnread = async () => {
    try {
      await TandaiPesan(selected.id, false);
      updateLocal(selected.id, false);
      setSelected(null);
    } catch (err) {
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal menandai pesan'), type: 'error' });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await DeletePesan(deleteTarget.id);
      setAlert({ show: true, message: 'Pesan dihapus', type: 'success' });
      setDeleteTarget(null);
      setSelected(null);
      fetchData();
    } catch (err) {
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal menghapus pesan'), type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const belumDibaca = list.filter((p) => Number(p.sudah_dibaca) === 0).length;
  const shown = filter === 'belum' ? list.filter((p) => Number(p.sudah_dibaca) === 0) : list;

  return (
    <div>
      <div className="section-head">
        <h3>Pesan Masuk</h3>
        <div className="segmented" role="group" aria-label="Filter pesan">
          <button type="button" className={filter === 'semua' ? 'is-active' : ''} onClick={() => setFilter('semua')}>
            Semua ({list.length})
          </button>
          <button type="button" className={filter === 'belum' ? 'is-active' : ''} onClick={() => setFilter('belum')}>
            Belum dibaca ({belumDibaca})
          </button>
        </div>
      </div>

      {isLoadingData ? (
        <Skeleton cols={3} />
      ) : shown.length === 0 ? (
        <p className="empty-state">
          {filter === 'belum'
            ? 'Semua pesan sudah dibaca.'
            : 'Belum ada pesan. Pesan dari form di halaman publik akan muncul di sini.'}
        </p>
      ) : (
        <ul className="inbox">
          {shown.map((item) => (
            <li key={item.id} className={Number(item.sudah_dibaca) === 0 ? 'is-unread' : ''}>
              <button type="button" className="inbox-item" onClick={() => handleOpen(item)}>
                <span className="inbox-from">
                  {Number(item.sudah_dibaca) === 0 && <span className="dot" aria-label="Belum dibaca" />}
                  {item.nama}
                </span>
                <span className="inbox-subject">{item.subjek}</span>
                <span className="inbox-preview">{item.isi}</span>
                <span className="inbox-date">{formatTanggal(item.created_at)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal isOpen={selected !== null} onClose={() => setSelected(null)} title={selected?.subjek} size="lg">
        {selected && (
          <div className="pesan-detail">
            <p className="pesan-meta">
              Dari <strong>{selected.nama}</strong> &lt;<a href={`mailto:${selected.email}`}>{selected.email}</a>&gt;
              <br />
              <span className="muted">{formatTanggal(selected.created_at)}</span>
            </p>
            <p className="pesan-isi">{selected.isi}</p>
            <div className="confirm-actions">
              <button type="button" className="button ghost-danger" onClick={() => { setDeleteTarget(selected); setSelected(null); }}>Hapus</button>
              <button type="button" className="button" onClick={handleMarkUnread}>Tandai belum dibaca</button>
              {/* mailto: membuka aplikasi email dengan alamat & subjek terisi */}
              <a
                className="button primary"
                href={`mailto:${selected.email}?subject=${encodeURIComponent('Re: ' + selected.subjek)}`}
              >
                Balas lewat email
              </a>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Hapus pesan?"
        message={deleteTarget && `Pesan dari ${deleteTarget.nama} akan dihapus permanen.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />

      <Alert alert={alert} setAlert={setAlert} />
    </div>
  );
};

export default Pesan;
