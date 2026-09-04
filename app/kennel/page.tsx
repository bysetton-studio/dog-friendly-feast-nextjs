import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { kennelArt } from '@/data/kennelArt';
import AvatarPicker from '@/components/AvatarPicker';
import DogAvatars from './DogAvatars';
import LogoutButton from './LogoutButton';
import KennelLocationRow from './KennelLocationRow';
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

  const [suggestedLocations, dogs] = await Promise.all([
    prisma.location.findMany({
      where: { suggestedById: session.user.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.userDog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

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
          <div className="kennel__title_container">
            <div className="kennel__avatar-area">
              <AvatarPicker image={session.user.image ?? null} />
              <DogAvatars initial={dogs.map((d) => ({ id: d.id, image: d.image }))} />
            </div>
            <h1 className="kennel__title">{session.user.name}&apos;s Kennel</h1>
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
                      {approved.map((loc) => <KennelLocationRow key={loc.id} loc={loc} />)}
                    </ul>
                  </div>
                )}

                {pending.length > 0 && (
                  <div className="kennel__group">
                    <p className="kennel__group-label kennel__group-label--pending">Pending</p>
                    <ul className="kennel__locations">
                      {pending.map((loc) => <KennelLocationRow key={loc.id} loc={loc} canEdit />)}
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
