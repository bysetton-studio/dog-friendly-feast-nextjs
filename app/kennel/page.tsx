import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { kennelArt } from '@/data/kennelArt';
import { TYPE_FILTERS } from '@/components/TypeFilter';
import LogoutButton from './LogoutButton';
import './kennel.css';

function typeEmoji(types: string[]): string {
  const match = TYPE_FILTERS.find(
    (f) => f.types.length > 0 && f.types.some((t) => types.includes(t))
  );
  return match ? match.emoji : '🦴'; // fallback to "other"
}

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

  const suggestedLocations = await prisma.location.findMany({
    where: { suggestedById: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

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

      <div className="kennel__stack">
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

        <div className="kennel__card kennel__card--locations">
          <h2 className="kennel__section-title">Your Submissions</h2>

          {suggestedLocations.length === 0 ? (
            <div className="kennel__empty">
              <p className="kennel__empty-text">No submissions yet, go find somewhere dog-friendly! 🐾</p>
              <Link href="/" className="kennel__empty-btn">Find a spot →</Link>
            </div>
          ) : (() => {
            const approved = suggestedLocations.filter((l) => l.isAdminApproved);
            const pending  = suggestedLocations.filter((l) => !l.isAdminApproved);

            const LocationRow = ({ loc }: { loc: typeof suggestedLocations[number] }) => (
              <li className="kennel__location">
                <div className="kennel__location-main">
                  <span>
                    <span className="kennel__location-type-icon">{typeEmoji(loc.types)}</span>
                    <span className="kennel__location-icon-gap" />
                    <span className="kennel__location-name">{loc.name}</span>
                  </span>
                  <span className={`kennel__location-badge ${loc.isFriendly ? 'kennel__location-badge--friendly' : 'kennel__location-badge--not'}`}>
                    {loc.isFriendly ? '🐾 Friendly' : '✕ Not friendly'}
                  </span>
                </div>
                <div className="kennel__location-sub">
                  <span className="kennel__location-address">{loc.address}</span>
                </div>
              </li>
            );

            return (
              <>
                <div className="kennel__scores">
                  <div className="kennel__score kennel__score--approved">
                    <span className="kennel__score-number">{approved.length}</span>
                    <span className="kennel__score-label">Verified</span>
                  </div>
                  <div className="kennel__score-divider" />
                  <div className="kennel__score kennel__score--pending">
                    <span className="kennel__score-number">{pending.length}</span>
                    <span className="kennel__score-label">Pending</span>
                  </div>
                </div>

                {approved.length > 0 && (
                  <div className="kennel__group">
                    <p className="kennel__group-label kennel__group-label--approved">Verified</p>
                    <ul className="kennel__locations">
                      {approved.map((loc) => <LocationRow key={loc.id} loc={loc} />)}
                    </ul>
                  </div>
                )}

                {pending.length > 0 && (
                  <div className="kennel__group">
                    <p className="kennel__group-label kennel__group-label--pending">Pending</p>
                    <ul className="kennel__locations">
                      {pending.map((loc) => <LocationRow key={loc.id} loc={loc} />)}
                    </ul>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </main>
  );
}
