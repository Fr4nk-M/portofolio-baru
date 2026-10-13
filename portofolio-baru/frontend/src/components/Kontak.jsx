// frontend/src/components/Kontak.jsx
import { useState, useEffect } from 'react';
import { GetKontak, AddKontak, UpdateKontak, DeleteKontak, delay, getErrorMessage } from '../api/backendApi';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Skeleton from './Skeleton';
import ConfirmDialog from './ConfirmDialog';

const emptyForm = { nama_media: '', url: '' };

// [PERUBAHAN 1] Prop token tidak diperlukan lagi
const Kontak = () => {
  const [list, setList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  // [PERUBAHAN 5] Dialog konfirmasi hapus
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const [res] = await Promise.all([GetKontak(), delay(200)]);
      if (res.data.status === 'success') {
        setList(res.data.kontak_aktif || []);
      }
    } catch (err) {
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal mengambil data kontak'), type: 'error' });
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setCurrentId(null);
    setForm(emptyForm);
    setIsOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEdit(true);
    setCurrentId(item.id);
    setForm({ nama_media: item.nama_media, url: item.url });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...form };
      if (isEdit) {
        payload.id = currentId;
        await UpdateKontak(payload);
        setAlert({ show: true, message: 'Kontak berhasil diperbarui!', type: 'success' });
      } else {
        await AddKontak(payload);
        setAlert({ show: true, message: 'Kontak berhasil ditambahkan!', type: 'success' });
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal menyimpan kontak'), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await DeleteKontak(deleteTarget.id);
      setAlert({ show: true, message: 'Kontak berhasil dihapus!', type: 'success' });
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal menghapus kontak'), type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="section-head">
        <h3>Kontak &amp; Media Sosial</h3>
        <Button primary={true} text="+ Tambah Kontak" onClick={handleOpenAdd} type="button" />
      </div>

      {isLoadingData ? (
        <Skeleton cols={3} />
      ) : list.length === 0 ? (
        <p className="empty-state">Belum ada kontak. Tambahkan LinkedIn atau GitHub agar pengunjung bisa menemukanmu.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Media</th>
                <th>Tautan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.nama_media}</td>
                  <td className="cell-url"><a href={item.url} target="_blank" rel="noreferrer">{item.url}</a></td>
                  <td className="row-actions">
                    <button className="button small" onClick={() => handleOpenEdit(item)}>Edit</button>
                    <button className="button small ghost-danger" onClick={() => setDeleteTarget(item)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={isEdit ? 'Edit Kontak' : 'Tambah Kontak'} isLoading={isSubmitting}>
        <form onSubmit={handleSubmit}>
          <label>Nama Media (LinkedIn, GitHub, Instagram ...)</label>
          <input type="text" required maxLength={255} value={form.nama_media} onChange={(e) => setForm({ ...form, nama_media: e.target.value })} />

          <label>URL / Tautan</label>
          {/* [PERUBAHAN 1] Hanya http(s):// atau mailto: yang diterima (dicek juga di backend) */}
          <input
            type="text"
            required
            maxLength={255}
            pattern="(https?://|mailto:).+"
            title="Awali dengan https:// atau mailto:"
            placeholder="https://..."
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />

          <div className="form-actions">
            <Button primary={true} text={isEdit ? 'Simpan Perubahan' : 'Tambah Kontak'} disabled={isSubmitting} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Hapus kontak?"
        message={deleteTarget && `Kontak "${deleteTarget.nama_media}" akan dihapus permanen.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />

      <Alert alert={alert} setAlert={setAlert} />
    </div>
  );
};

export default Kontak;
