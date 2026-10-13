// frontend/src/components/Modal.jsx
import { useEffect } from "react";
import Loading from "./Loading";

const Modal = ({
  children,
  isOpen,
  onClose,
  title,
  isLoading = false,
  loadingTitle = "Memproses...",
  size = "md",
}) => {
  // [PERUBAHAN 5] Modal bisa ditutup dengan tombol Escape di keyboard,
  // dan halaman di belakangnya tidak ikut ter-scroll selama modal terbuka.
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={isLoading ? undefined : onClose}>
      {/* stopPropagation agar klik di dalam kotak modal tidak menutup modal */}
      <div
        className={`modal-content modal-${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button className="modal-close" onClick={onClose} disabled={isLoading} aria-label="Tutup">
          ×
        </button>

        {title && <h3 className="modal-title">{title}</h3>}

        <div className="modal-body">
          {children}
        </div>

        {isLoading && <Loading type="modal" title={loadingTitle} />}
      </div>
    </div>
  );
};

export default Modal;
