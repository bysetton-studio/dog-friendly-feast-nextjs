import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { kennelArt } from '@/data/kennelArt';
import LogoutButton from './LogoutButton';
import './kennel.css';

const POSITIONS: React.CSSProperties[] = [
  { top: '2%',    left: '1%'  },
  { top: '2%',    right: '1%' },
  { top: '50%',   left: '1%'  },
  { top: '50%',   right: '1%' },
  { bottom: '2%', left: '1%'  },
  { bottom: '2%', right: '1%' },
];

export default async function KennelPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/auth');
  }

  return (
    <main className="kennel">
      {POSITIONS.map((pos, i) => (
        <pre key={i} className="bg-art" style={pos} aria-hidden="true">
          {kennelArt[i % kennelArt.length]}
        </pre>
      ))}

      <nav className="top-nav top-nav--left">
        <Link href="/about" className="top-nav__link">About</Link>
      </nav>
      <nav className="top-nav">
        <Link href="/" className="top-nav__link">Map</Link>
        <LogoutButton />
      </nav>

      <div className="kennel__card">
        <div className="kennel__avatar">🐶</div>
        <h1 className="kennel__title">Your Kennel</h1>

        <dl className="kennel__details">
          <div className="kennel__row">
            <dt>Name</dt>
            <dd>{session.user.name}</dd>
          </div>
          <div className="kennel__row">
            <dt>Email</dt>
            <dd>{session.user.email}</dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
