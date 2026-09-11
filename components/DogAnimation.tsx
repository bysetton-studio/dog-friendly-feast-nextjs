'use client';

import { useEffect, useRef, useState } from 'react';

interface DogAnimationProps {
  url: string;         // full animation GIF (plays once on trigger)
  pauseUrl: string;    // looping idle GIF (shown when not playing)
  duration: number;    // ms — one full loop duration of url
  className?: string;
}

const PAUSE_BETWEEN_PLAYS = 10_000;

export default function DogAnimation({ url, pauseUrl, duration, className }: DogAnimationProps) {
  const [playing, setPlaying] = useState(false);
  const [gifKey, setGifKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playingRef = useRef(false);

  useEffect(() => {
    scheduleNext(PAUSE_BETWEEN_PLAYS);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [url, duration]);

  function scheduleNext(delay: number) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(play, delay);
  }

  function play() {
    if (playingRef.current) return;
    playingRef.current = true;
    setPlaying(true);
    setGifKey(k => k + 1);
    timeoutRef.current = setTimeout(() => {
      playingRef.current = false;
      setPlaying(false);
      scheduleNext(PAUSE_BETWEEN_PLAYS);
    }, duration);
  }

  function handleMouseEnter() {
    if (playingRef.current) return;
    scheduleNext(0);
  }

  return (
    <div onMouseEnter={handleMouseEnter} className={className}>
      <img src={pauseUrl} alt="" aria-hidden="true" className={playing ? 'hidden' : 'block'} />
      {playing && <img key={gifKey} src={url} alt="" aria-hidden="true" className="block" />}
    </div>
  );
}
