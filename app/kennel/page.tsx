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
    <main className="min-h-screen flex flex-col items-center justify-center pt-20 px-6 pb-12 font-[Arial,sans-serif]">
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

      <div className="w-full max-w-205 flex flex-col gap-4">
          <div className="flex flex-col items-center justify-center mb-7 gap-3">
            <div className="group/avatar-area relative w-70 h-57.5 flex justify-center pt-15 box-border">
              <AvatarPicker image={session.user.image ?? null} />
              <DogAvatars initial={dogs.map((d) => ({ id: d.id, image: d.image }))} />
            </div>
            <h1 className="text-[32px] font-semibold text-fg m-0 font-[Arial,sans-serif]">{session.user.name}&apos;s Kennel</h1>
          </div>

        <div className="w-full bg-[rgb(30,30,30)] rounded-2xl relative z-1 text-left p-6">
          <h2 className="text-[15px] font-semibold text-fg mt-0 mb-4">Your Submissions</h2>

          {suggestedLocations.length === 0 ? (
            <div className="flex flex-col items-start gap-4">
              <p className="text-[14px] text-fg-muted m-0">No submissions yet, go find somewhere dog-friendly! 🐾</p>
              <Link href="/" className="text-[14px] font-[Arial,sans-serif] text-fg bg-white/8 border border-white/12 rounded-lg py-2.25 px-4 no-underline transition-[background] duration-150 hover:bg-white/13">Find a spot →</Link>
            </div>
          ) : (() => {
            const approved = suggestedLocations.filter((l) => l.isAdminApproved);
            const pending  = suggestedLocations.filter((l) => !l.isAdminApproved);

            return (
              <>
                <div className="flex items-center justify-center mb-7">
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[64px] font-bold leading-none font-[Arial,sans-serif] text-friendly">{approved.length}</span>
                    <span className="text-[11px] uppercase tracking-[0.8px] text-fg-muted font-[Arial,sans-serif]">Verified</span>
                  </div>
                  <div className="w-px h-15 bg-white/8 shrink-0 mx-4" />
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[64px] font-bold leading-none font-[Arial,sans-serif] text-fg-muted">{pending.length}</span>
                    <span className="text-[11px] uppercase tracking-[0.8px] text-fg-muted font-[Arial,sans-serif]">Pending</span>
                  </div>
                </div>

                {approved.length > 0 && (
                  <div className="mb-8 last:mb-0">
                    <p className="text-[11px] uppercase tracking-[0.8px] mt-0 mb-2 font-[Arial,sans-serif] text-friendly">Verified</p>
                    <ul className="list-none m-0 p-0 flex flex-col gap-px">
                      {approved.map((loc) => <KennelLocationRow key={loc.id} loc={loc} />)}
                    </ul>
                  </div>
                )}

                {pending.length > 0 && (
                  <div className={`mb-8 last:mb-0${approved.length > 0 ? ' pt-6 border-t border-white/6' : ''}`}>
                    <p className="text-[11px] uppercase tracking-[0.8px] mt-0 mb-2 font-[Arial,sans-serif] text-fg-muted">Pending</p>
                    <ul className="list-none m-0 p-0 flex flex-col gap-px">
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
