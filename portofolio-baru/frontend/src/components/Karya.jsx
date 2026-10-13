// frontend/src/components/Karya.jsx
import { useState, useEffect } from 'react';
import { GetKarya, AddKarya, UpdateKarya, DeleteKarya, delay, getErrorMessage } from '../api/backendApi';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Skeleton from './Skeleton';
import ConfirmDialog from './ConfirmDialog';

const emptyForm = { nama_karya: '', deskripsi: '', url: '' };

// [PERUBAHAN 1] Prop token tidak diperlukan lagi
const Karya = () => {
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

  // 1. Ambil data dari server
  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const [res] = await Promise.all([GetKarya(), delay(200)]);
      if (res.data.status === 'success') {
        setList(res.data.karya_terbaik || []);
      }
    } catch (err) {
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal mengambil data karya'), type: 'error' });
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Tombol Tambah Baru
  const handleOpenAdd = () => {
    setIsEdit(false);
    setCurrentId(null);
    setForm(emptyForm);
    setIsOpen(true);
  };

  // 3. Tombol Edit
  const handleOpenEdit = (item) => {
    setIsEdit(true);
    setCurrentId(item.id);
    setForm({ nama_karya: item.nama_karya, deskripsi: item.deskripsi, url: item.url });
    setIsOpen(true);
  };

  // 4. Simpan Form (POST / PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...form };
      if (isEdit) {
        payload.id = currentId;
        await UpdateKarya(payload);
        setAlert({ show: true, message: 'Karya berhasil diperbarui!', type: 'success' });
      } else {
        await AddKarya(payload);
        setAlert({ show: true, message: 'Karya berhasil ditambahkan!', type: 'success' });
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal menyimpan karya'), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Hapus Data (DELETE) lewat ConfirmDialog
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await DeleteKarya(deleteTarget.id);
      setAlert({ show: true, message: 'Karya berhasil dihapus!', type: 'success' });
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal menghapus karya'), type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="section-head">
        <h3>Daftar Karya &amp; Proyek</h3>
        <Button primary={true} text="+ Tambah Karya" onClick={handleOpenAdd} type="button" />
      </div>

      {isLoadingData ? (
        <Skeleton cols={4} />
      ) : list.length === 0 ? (
        <p className="empty-state">Belum ada karya. Tugas kuliah yang kamu banggakan juga layak ditampilkan.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Karya</th>
                <th>Deskripsi</th>
                <th>Tautan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.nama_karya}</td>
                  <td className="cell-desc">{item.deskripsi}</td>
                  <td><a href={item.url} target="_blank" rel="noreferrer">Kunjungi</a></td>
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

      {/* Modal Tambah/Edit */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={isEdit ? 'Edit Karya' : 'Tambah Karya'} isLoading={isSubmitting}>
        <form onSubmit={handleSubmit}>
          <label>Nama Karya</label>
          <input type="text" required maxLength={255} value={form.nama_karya} onChange={(e) => setForm({ ...form, nama_karya: e.target.value })} />

          <label>Deskripsi</label>
          <textarea required value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />

          <label>URL / Tautan Proyek</label>
          {/* [PERUBAHAN 1] Hanya http(s):// atau mailto: yang diterima (dicek juga di backend) */}
          <input
            type="text"
            required
            maxLength={255}
            pattern="(https?://|mailto:).+"
            title="Awali dengan https://"
            placeholder="https://..."
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />

          <div className="form-actions">
            <Button primary={true} text={isEdit ? 'Simpan Perubahan' : 'Tambah Karya'} disabled={isSubmitting} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Hapus karya?"
        message={deleteTarget && `"${deleteTarget.nama_karya}" akan dihapus permanen dari portofolio.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />

      <Alert alert={alert} setAlert={setAlert} />
    </div>
  );
};

export default Karya;
