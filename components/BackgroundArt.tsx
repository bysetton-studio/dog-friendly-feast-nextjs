import { backgroundArt } from '@/data/backgroundArt';

const POSITIONS: React.CSSProperties[] = [
  { top: '2%',    left: '1%'  },
  { top: '2%',    right: '1%' },
  { top: '50%',   left: '1%'  },
  { top: '50%',   right: '1%' },
  { bottom: '2%', left: '1%'  },
  { bottom: '2%', right: '1%' },
];

export default function BackgroundArt() {
  return (
    <>
      {POSITIONS.map((pos, i) => (
        <pre key={i} className="bg-art" style={pos} aria-hidden="true">
          {backgroundArt[i % backgroundArt.length]}
        </pre>
      ))}
    </>
  );
}
