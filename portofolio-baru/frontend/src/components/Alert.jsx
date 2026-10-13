// frontend/src/components/Alert.jsx
import { useEffect } from 'react';

// [PERUBAHAN 5] Judul toast memakai bahasa Indonesia ("Berhasil"/"Gagal"),
// tampil 3 detik (sebelumnya 2), dan diberi role="status" agar dibacakan pembaca layar.
const titles = { success: 'Berhasil', error: 'Gagal' };

const Alert = ({ alert, setAlert }) => {
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ show: false, type: "", message: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert, setAlert]);

  if (!alert.show) return null;

  return (
    <div className={`alert ${alert.type}`} role="status" aria-live="polite">
      <div className="alert-content">
        <div className="alert-title">{titles[alert.type] || alert.type}</div>
        <div className="alert-message">{alert.message}</div>
      </div>
    </div>
  );
};

export default Alert;
