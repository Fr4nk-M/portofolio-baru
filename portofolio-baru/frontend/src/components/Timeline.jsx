// frontend/src/components/Timeline.jsx
// [PERUBAHAN 4] KOMPONEN BARU: menampilkan riwayat sebagai garis waktu (timeline).
// Versi asli memakai tabel. Riwayat pendidikan & pengalaman adalah data berurutan
// menurut waktu, jadi garis vertikal dengan titik per entri lebih mudah dibaca
// daripada baris tabel. Komponen ini dipakai ulang untuk pendidikan DAN pengalaman.
//
// Props items: [{ judul, keterangan, mulai, selesai }]
const Timeline = ({ items }) => (
  <ol className="timeline">
    {items.map((item, idx) => (
      <li className="timeline-item" key={idx}>
        <span className="timeline-years">
          {item.mulai}
          {String(item.selesai) !== String(item.mulai) && <>–{item.selesai}</>}
        </span>
        <div className="timeline-body">
          <h3 className="timeline-title">{item.judul}</h3>
          <p className="timeline-sub">{item.keterangan}</p>
        </div>
      </li>
    ))}
  </ol>
);

export default Timeline;
