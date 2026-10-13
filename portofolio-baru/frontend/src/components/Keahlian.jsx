// frontend/src/components/Keahlian.jsx
import { useState, useEffect } from 'react';
import { GetKeahlian, AddKeahlian, UpdateKeahlian, DeleteKeahlian, delay, getErrorMessage } from '../api/backendApi';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Skeleton from './Skeleton';
import ConfirmDialog from './ConfirmDialog';
import SkillMeter, { LEVELS } from './SkillMeter';

const emptyForm = { nama_keahlian: '', level: 'Beginner' };

// [PERUBAHAN 1] Prop token tidak diperlukan lagi
const Keahlian = () => {
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
      const [res] = await Promise.all([GetKeahlian(), delay(200)]);
      if (res.data.status === 'success') {
        setList(res.data.keahlian || []);
      }
    } catch (err) {
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal mengambil data keahlian'), type: 'error' });
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
    setForm({ nama_keahlian: item.nama_keahlian, level: item.level });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...form };
      if (isEdit) {
        payload.id = currentId;
        await UpdateKeahlian(payload);
        setAlert({ show: true, message: 'Keahlian berhasil diperbarui!', type: 'success' });
      } else {
        await AddKeahlian(payload);
        setAlert({ show: true, message: 'Keahlian berhasil ditambahkan!', type: 'success' });
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal menyimpan keahlian'), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await DeleteKeahlian(deleteTarget.id);
      setAlert({ show: true, message: 'Keahlian berhasil dihapus!', type: 'success' });
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      setAlert({ show: true, message: getErrorMessage(err, 'Gagal menghapus keahlian'), type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="section-head">
        <h3>Daftar Keahlian</h3>
        <Button primary={true} text="+ Tambah Keahlian" onClick={handleOpenAdd} type="button" />
      </div>

      {isLoadingData ? (
        <Skeleton cols={3} />
      ) : list.length === 0 ? (
        <p className="empty-state">Belum ada keahlian. Mulai dari yang paling sering kamu pakai.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Keahlian</th>
                <th>Level</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.nama_keahlian}</td>
                  {/* [PERUBAHAN 4] Level juga digambar sebagai meter, sama seperti di halaman publik */}
                  <td><SkillMeter level={item.level} compact /></td>
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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={isEdit ? 'Edit Keahlian' : 'Tambah Keahlian'} isLoading={isSubmitting}>
        <form onSubmit={handleSubmit}>
          <label>Nama Keahlian</label>
          <input type="text" required maxLength={255} value={form.nama_keahlian} onChange={(e) => setForm({ ...form, nama_keahlian: e.target.value })} />

          <label>Level</label>
          <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
            {LEVELS.map((lv) => (
              <option key={lv} value={lv}>{lv}</option>
            ))}
          </select>
          <div className="meter-preview">
            <SkillMeter level={form.level} />
          </div>

          <div className="form-actions">
            <Button primary={true} text={isEdit ? 'Simpan Perubahan' : 'Tambah Keahlian'} disabled={isSubmitting} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Hapus keahlian?"
        message={deleteTarget && `"${deleteTarget.nama_keahlian}" akan dihapus permanen.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />

      <Alert alert={alert} setAlert={setAlert} />
    </div>
  );
};

export default Keahlian;
