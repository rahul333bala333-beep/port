import { useState, useEffect, useRef } from 'react';

/**
 * Returns a ref + whether that element is currently near the viewport.
 * Used to mount heavy 3D canvases only while their section is on screen,
 * so off-screen sections don't keep a WebGL render loop running.
 *
 * Uses getBoundingClientRect (checked immediately on mount and throttled on
 * scroll/resize) rather than IntersectionObserver, so it resolves correctly
 * on first paint and works reliably across environments.
 *
 * @param {number} margin extra px around the viewport that still counts as "in view"
 */
export function useInView(margin = 250) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;
    const check = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      setInView(rect.top < vh + margin && rect.bottom > -margin);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(check);
      }
    };

    check(); // resolve immediately on mount
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [margin]);

  return [ref, inView];
}
