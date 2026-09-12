import { useEffect, useRef, useState } from 'react';

interface UseTwoFingersResult {
  twoFingersUsed: boolean;
  oneFinger: boolean;
}

const ONE_FINGER_DELAY_MS = 100;

export function useTwoFingers(containerRef: React.RefObject<HTMLElement | null>): UseTwoFingersResult {
  const [touchCount, setTouchCount] = useState(0);
  const [oneFingerDelayed, setOneFingerDelayed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const isOneFinger = touchCount === 1;

    if (isOneFinger) {
      timerRef.current = setTimeout(() => setOneFingerDelayed(true), ONE_FINGER_DELAY_MS);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      setOneFingerDelayed(false);
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [touchCount]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = (e: TouchEvent) => setTouchCount(e.touches.length);
    const onTouchEnd = (e: TouchEvent) => setTouchCount(e.touches.length);

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [containerRef]);

  return {
    twoFingersUsed: touchCount >= 2,
    oneFinger: oneFingerDelayed,
  };
}
