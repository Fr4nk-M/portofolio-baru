// frontend/src/components/Pendidikan.jsx
import { useState, useEffect } from 'react';
import { GetPendidikan, AddPendidikan, UpdatePendidikan, DeletePendidikan, delay, getErrorMessage } from '../api/backendApi';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Skeleton from './Skeleton';
import ConfirmDialog from './ConfirmDialog';

const emptyForm = { nama_institusi: '', tingkat: '', jurusan: '', tahun_mulai: '', tahun_selesai: '' };

// [PERUBAHAN 1] Prop token tidak diperlukan lagi: interceptor axios yang menempelkannya
const Pendidikan = () => {
  const [list, setList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  // [PERUBAHAN 5] Data yang akan dihapus (null = dialog konfirmasi tertutup)
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const [res] = await Promise.all([GetPendidikan(), delay(200)]);
      if (res.data.status === 'success') {
        setList(res.data.riwayat_pendidikan || []);
      }
    } catch (err) {
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal mengambil data pendidikan'), type: 'error' });
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
    setForm({
      nama_institusi: item.nama_institusi,
      tingkat: item.tingkat,
      jurusan: item.jurusan,
      tahun_mulai: item.tahun_mulai,
      tahun_selesai: item.tahun_selesai,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // [PERUBAHAN 5] Validasi di sisi frontend (backend juga memvalidasi hal yang sama)
    if (Number(form.tahun_selesai) < Number(form.tahun_mulai)) {
      setAlert({ show: true, message: 'Tahun selesai tidak boleh lebih kecil dari tahun mulai', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        tahun_mulai: Number(form.tahun_mulai),
        tahun_selesai: Number(form.tahun_selesai),
      };
      if (isEdit) {
        payload.id = currentId;
        await UpdatePendidikan(payload);
        setAlert({ show: true, message: 'Pendidikan berhasil diperbarui!', type: 'success' });
      } else {
        await AddPendidikan(payload);
        setAlert({ show: true, message: 'Pendidikan berhasil ditambahkan!', type: 'success' });
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      // [PERUBAHAN 5] Pesan error diambil dari backend, bukan teks umum
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal menyimpan pendidikan'), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // [PERUBAHAN 5] Hapus lewat ConfirmDialog, bukan window.confirm()
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await DeletePendidikan(deleteTarget.id);
      setAlert({ show: true, message: 'Pendidikan berhasil dihapus!', type: 'success' });
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal menghapus pendidikan'), type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="section-head">
        <h3>Riwayat Pendidikan</h3>
        <Button primary={true} text="+ Tambah Pendidikan" onClick={handleOpenAdd} type="button" />
      </div>

      {isLoadingData ? (
        <Skeleton cols={5} />
      ) : list.length === 0 ? (
        <p className="empty-state">Belum ada riwayat pendidikan. Tambahkan yang pertama agar muncul di timeline halaman publik.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Institusi</th>
                <th>Tingkat</th>
                <th>Jurusan</th>
                <th>Tahun</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.nama_institusi}</td>
                  <td>{item.tingkat}</td>
                  <td>{item.jurusan}</td>
                  <td>{item.tahun_mulai} - {item.tahun_selesai}</td>
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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={isEdit ? 'Edit Pendidikan' : 'Tambah Pendidikan'} isLoading={isSubmitting}>
        <form onSubmit={handleSubmit}>
          <label>Nama Institusi</label>
          <input type="text" required maxLength={255} value={form.nama_institusi} onChange={(e) => setForm({ ...form, nama_institusi: e.target.value })} />

          <label>Tingkat (SD / SMP / SMA / D3 / S1 ...)</label>
          <input type="text" required maxLength={255} value={form.tingkat} onChange={(e) => setForm({ ...form, tingkat: e.target.value })} />

          <label>Jurusan</label>
          <input type="text" required maxLength={255} value={form.jurusan} onChange={(e) => setForm({ ...form, jurusan: e.target.value })} />

          <div className="form-row">
            <div>
              <label>Tahun Mulai</label>
              <input type="number" required min="1950" max="2100" value={form.tahun_mulai} onChange={(e) => setForm({ ...form, tahun_mulai: e.target.value })} />
            </div>
            <div>
              <label>Tahun Selesai</label>
              <input type="number" required min={form.tahun_mulai || 1950} max="2100" value={form.tahun_selesai} onChange={(e) => setForm({ ...form, tahun_selesai: e.target.value })} />
            </div>
          </div>

          <div className="form-actions">
            <Button primary={true} text={isEdit ? 'Simpan Perubahan' : 'Tambah Pendidikan'} disabled={isSubmitting} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Hapus riwayat pendidikan?"
        message={deleteTarget && `"${deleteTarget.nama_institusi}" akan dihapus permanen dari portofolio.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />

      <Alert alert={alert} setAlert={setAlert} />
    </div>
  );
};

export default Pendidikan;
