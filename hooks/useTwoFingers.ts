import { useEffect, useState } from 'react';

interface UseTwoFingersResult {
  twoFingersUsed: boolean;
  oneFinger: boolean;
}

export function useTwoFingers(containerRef: React.RefObject<HTMLElement | null>): UseTwoFingersResult {
  const [touchCount, setTouchCount] = useState(0);

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
    oneFinger: touchCount === 1,
  };
}
