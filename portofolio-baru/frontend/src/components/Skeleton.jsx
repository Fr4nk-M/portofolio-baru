// frontend/src/components/Skeleton.jsx
// [PERUBAHAN 5] KOMPONEN BARU: kerangka (skeleton) tabel saat data sedang dimuat.
// Versi asli menampilkan spinner berputar. Skeleton menggambar bentuk tabel kosong yang
// berdenyut, sehingga pengguna sudah tahu "di sini akan muncul tabel" dan tata letak
// halaman tidak melompat saat data datang.
const Skeleton = ({ rows = 4, cols = 4 }) => (
  <div className="skeleton-table" aria-busy="true" aria-label="Memuat data">
    {Array.from({ length: rows }).map((_, r) => (
      <div className="skeleton-row" key={r}>
        {Array.from({ length: cols }).map((_, c) => (
          <span className="skeleton-cell" key={c} style={{ width: `${c === 0 ? 30 : 60 + ((r + c) % 3) * 12}%` }} />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;
