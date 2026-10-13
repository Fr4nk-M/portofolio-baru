// frontend/src/components/SkillMeter.jsx
// [PERUBAHAN 4] KOMPONEN BARU: meter level keahlian berupa 4 kotak.
//
// Kenapa 4 kotak dan bukan progress bar persen (mis. "PHP 75%")?
// Data level di database berupa kategori (Beginner/Intermediate/Advanced/Expert),
// bukan angka. Menampilkan "75%" berarti mengarang angka yang tidak pernah diisi admin.
// Empat kotak = empat level, jadi tampilannya jujur terhadap datanya.
//
// Animasi: kotak terisi satu per satu saat meter terlihat di layar (prop animate),
// memakai hook useInView (IntersectionObserver).
import useInView from '../hooks/useInView';

// eslint-disable-next-line react-refresh/only-export-components
export const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

// Nama level dalam bahasa Indonesia untuk ditampilkan ke pengunjung
const LABEL_ID = {
  Beginner: 'Pemula',
  Intermediate: 'Menengah',
  Advanced: 'Mahir',
  Expert: 'Ahli',
};

const SkillMeter = ({ level, animate = false, compact = false }) => {
  const [ref, inView] = useInView();
  // Beginner -> 1 kotak, Intermediate -> 2, Advanced -> 3, Expert -> 4
  const filled = LEVELS.indexOf(level) + 1;
  const show = !animate || inView;

  return (
    <span
      ref={ref}
      className={`meter${compact ? ' meter-compact' : ''}`}
      role="img"
      aria-label={`Level ${LABEL_ID[level] || level}, ${filled} dari 4`}
    >
      <span className="meter-cells" aria-hidden="true">
        {LEVELS.map((lv, i) => (
          <span
            key={lv}
            className={`meter-cell${show && i < filled ? ' is-on' : ''}`}
            style={{ transitionDelay: animate ? `${i * 120}ms` : '0ms' }}
          />
        ))}
      </span>
      <span className="meter-label">{LABEL_ID[level] || level}</span>
    </span>
  );
};

export default SkillMeter;
