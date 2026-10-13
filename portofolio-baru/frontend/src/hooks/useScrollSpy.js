// frontend/src/hooks/useScrollSpy.js
// [PERUBAHAN 4] CUSTOM HOOK BARU: mengetahui bagian (section) mana yang sedang dibaca,
// supaya menu navbar yang sesuai bisa disorot.
//
// Prinsipnya sama dengan useInView (IntersectionObserver), tetapi mengamati banyak
// section sekaligus. rootMargin '-45% 0px -50% 0px' artinya: sebuah section dianggap
// "aktif" ketika melewati garis tipis di tengah layar.
import { useEffect, useState } from 'react';

const useScrollSpy = (ids, deps = []) => {
  const [activeId, setActiveId] = useState(ids[0]);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return activeId;
};

export default useScrollSpy;
