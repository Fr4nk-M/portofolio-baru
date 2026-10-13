// frontend/src/components/Icon.jsx
// [PERUBAHAN 5] KOMPONEN BARU: ikon SVG sederhana untuk menu sidebar.
// Ditulis sendiri (bukan library) supaya tidak menambah dependensi npm.
// Setiap ikon hanyalah kumpulan garis (path) di kanvas 24x24.
const paths = {
  ringkasan: 'M4 13h6V4H4zM14 20h6v-9h-6zM14 4v4h6V4zM4 20h6v-4H4z',
  biodata: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c0-3.3 3.6-6 8-6s8 2.7 8 6',
  pendidikan: 'M2 9l10-5 10 5-10 5zM6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5',
  pengalaman: 'M4 8h16v11H4zM9 8V5h6v3M4 13h16',
  keahlian: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  kontak: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  karya: 'M3 7h18v12H3zM8 7V5h8v2',
  pesan: 'M3 6h18v12H3zM3 7l9 6 9-6',
  keluar: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  publik: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9',
  tema: 'M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z',
  menu: 'M4 7h16M4 12h16M4 17h16',
};

const Icon = ({ name, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={paths[name]} />
  </svg>
);

export default Icon;
