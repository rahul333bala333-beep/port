import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function PageTransition({ children }) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      );
    }
  }, []);

  return (
    <div ref={ref} className="page-enter" style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
