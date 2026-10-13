// frontend/src/hooks/useInView.js
// [PERUBAHAN 4] CUSTOM HOOK BARU: mendeteksi apakah sebuah elemen sudah terlihat di layar.
//
// Memakai IntersectionObserver, API bawaan browser yang memberi tahu kapan elemen masuk
// ke area pandang. Cara ini jauh lebih hemat daripada mendengarkan event "scroll" lalu
// menghitung posisi elemen setiap kali layar bergeser.
//
// Pemakaian:  const [ref, inView] = useInView();   <div ref={ref}> ... </div>
import { useEffect, useRef, useState } from 'react';

const useInView = (options = { threshold: 0.4 }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Browser lama tanpa IntersectionObserver: anggap langsung terlihat
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect(); // cukup sekali, animasi tidak diulang
      }
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, inView];
};

export default useInView;
