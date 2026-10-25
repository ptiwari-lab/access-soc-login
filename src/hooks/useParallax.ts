import { useEffect, useRef } from 'react';

/**
 * Mouse-responsive parallax for desktop only.
 * Returns a ref object whose `.current` is updated with normalized
 * mouse offset (-1..1) from center. Canvas draw functions can read it.
 * Disabled on touch devices and when prefers-reduced-motion is set.
 */
export function useParallax() {
  const offset = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || reduced) return;

    function onMove(e: MouseEvent) {
      offset.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      offset.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    function lerp() {
      smooth.current.x += (offset.current.x - smooth.current.x) * 0.04;
      smooth.current.y += (offset.current.y - smooth.current.y) * 0.04;
      rafRef.current = requestAnimationFrame(lerp);
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    rafRef.current = requestAnimationFrame(lerp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return smooth;
}
