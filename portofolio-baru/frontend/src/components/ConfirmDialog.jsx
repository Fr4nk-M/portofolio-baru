// frontend/src/components/ConfirmDialog.jsx
// [PERUBAHAN 5] KOMPONEN BARU: dialog konfirmasi pengganti window.confirm().
//
// Kekurangan window.confirm() di versi asli:
//   - tampilannya bawaan browser, tidak mengikuti tema terang/gelap aplikasi
//   - memblokir seluruh halaman (JavaScript berhenti sampai tombol diklik)
//   - tidak bisa menampilkan nama data yang akan dihapus dengan rapi
// Komponen ini memakai ulang <Modal> yang sudah ada, jadi gayanya konsisten.
import Modal from './Modal';

const ConfirmDialog = ({
  isOpen,
  title = 'Hapus data?',
  message,
  confirmText = 'Hapus',
  onConfirm,
  onCancel,
  isLoading = false,
}) => (
  <Modal isOpen={isOpen} onClose={onCancel} title={title} isLoading={isLoading} loadingTitle="Menghapus..." size="sm">
    <p className="confirm-message">{message}</p>
    <div className="confirm-actions">
      <button type="button" className="button" onClick={onCancel} disabled={isLoading}>
        Batal
      </button>
      <button type="button" className="button danger" onClick={onConfirm} disabled={isLoading} autoFocus>
        {confirmText}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
