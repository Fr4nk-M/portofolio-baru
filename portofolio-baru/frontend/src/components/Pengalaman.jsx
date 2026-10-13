// frontend/src/components/Pengalaman.jsx
import { useState, useEffect } from 'react';
import { GetPengalaman, AddPengalaman, UpdatePengalaman, DeletePengalaman, delay, getErrorMessage } from '../api/backendApi';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Skeleton from './Skeleton';
import ConfirmDialog from './ConfirmDialog';

const emptyForm = { nama_perusahaan: '', jabatan: '', tahun_mulai: '', tahun_selesai: '' };

// [PERUBAHAN 1] Prop token tidak diperlukan lagi
const Pengalaman = () => {
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
      const [res] = await Promise.all([GetPengalaman(), delay(200)]);
      if (res.data.status === 'success') {
        setList(res.data.pengalaman || []);
      }
    } catch (err) {
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal mengambil data pengalaman'), type: 'error' });
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
      nama_perusahaan: item.nama_perusahaan,
      jabatan: item.jabatan,
      tahun_mulai: item.tahun_mulai,
      tahun_selesai: item.tahun_selesai,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // [PERUBAHAN 5] Validasi tahun di sisi frontend
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
        await UpdatePengalaman(payload);
        setAlert({ show: true, message: 'Pengalaman berhasil diperbarui!', type: 'success' });
      } else {
        await AddPengalaman(payload);
        setAlert({ show: true, message: 'Pengalaman berhasil ditambahkan!', type: 'success' });
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal menyimpan pengalaman'), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await DeletePengalaman(deleteTarget.id);
      setAlert({ show: true, message: 'Pengalaman berhasil dihapus!', type: 'success' });
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal menghapus pengalaman'), type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="section-head">
        <h3>Pengalaman Kerja / Organisasi</h3>
        <Button primary={true} text="+ Tambah Pengalaman" onClick={handleOpenAdd} type="button" />
      </div>

      {isLoadingData ? (
        <Skeleton cols={4} />
      ) : list.length === 0 ? (
        <p className="empty-state">Belum ada pengalaman. Organisasi kampus dan kepanitiaan juga boleh dimasukkan.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Perusahaan / Organisasi</th>
                <th>Jabatan</th>
                <th>Tahun</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.nama_perusahaan}</td>
                  <td>{item.jabatan}</td>
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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={isEdit ? 'Edit Pengalaman' : 'Tambah Pengalaman'} isLoading={isSubmitting}>
        <form onSubmit={handleSubmit}>
          <label>Nama Perusahaan / Organisasi</label>
          <input type="text" required maxLength={255} value={form.nama_perusahaan} onChange={(e) => setForm({ ...form, nama_perusahaan: e.target.value })} />

          <label>Jabatan</label>
          <input type="text" required maxLength={255} value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })} />

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
            <Button primary={true} text={isEdit ? 'Simpan Perubahan' : 'Tambah Pengalaman'} disabled={isSubmitting} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Hapus pengalaman?"
        message={deleteTarget && `"${deleteTarget.jabatan} di ${deleteTarget.nama_perusahaan}" akan dihapus permanen.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />

      <Alert alert={alert} setAlert={setAlert} />
    </div>
  );
};

export default Pengalaman;
