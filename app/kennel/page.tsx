import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AvatarPicker from '@/components/AvatarPicker';
import DogAvatars from './DogAvatars';
import LogoutButton from './LogoutButton';
import KennelLocationRow from './KennelLocationRow';

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
      <nav className="fixed top-5 left-6 flex gap-2 z-300">
        <Button href="/about">About</Button>
      </nav>
      <nav className="fixed top-5 right-6 flex gap-2 z-300">
        <Button href="/">Map</Button>
        <LogoutButton />
      </nav>

      <div className="w-full max-w-205 flex flex-col gap-4">
          <div className="flex flex-col items-center justify-center mb-7 gap-3">
            <div className="group/avatar-area relative w-70 h-57.5 flex justify-center pt-15 box-border">
              <AvatarPicker image={session.user.image ?? null} />
              <DogAvatars initial={dogs.map((d) => ({ id: d.id, image: d.image }))} />
            </div>
            <h1 className="text-[32px] font-bold text-fg m-0 font-['Comic_Neue','Comic_Sans_MS','Comic_Sans',cursive]">{session.user.name}&apos;s Kennel</h1>
          </div>

        <div className="card w-full relative z-1 text-left p-6">
          <h2 className="text-[15px] font-semibold text-card-fg mt-0 mb-4">Your Submissions</h2>

          {suggestedLocations.length === 0 ? (
            <div className="flex flex-col items-start gap-4">
              <p className="text-[14px] text-card-fg-muted m-0">No submissions yet, go find somewhere dog-friendly! 🐾</p>
              <Link href="/" className="text-[14px] font-[Arial,sans-serif] text-card-fg bg-black/8 border border-black/12 rounded-lg py-2.25 px-4 no-underline transition-[background] duration-150 hover:bg-black/14">Find a spot →</Link>
            </div>
          ) : (() => {
            const approved = suggestedLocations.filter((l) => l.isAdminApproved);
            const pending  = suggestedLocations.filter((l) => !l.isAdminApproved);

            return (
              <>
                <div className="flex items-center justify-center mb-7">
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[64px] font-bold leading-none font-[Arial,sans-serif] text-friendly-dark">{approved.length}</span>
                    <span className="text-[11px] uppercase tracking-[0.8px] text-card-fg-muted font-[Arial,sans-serif]">Verified</span>
                  </div>
                  <div className="w-px h-15 bg-black/10 shrink-0 mx-4" />
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[64px] font-bold leading-none font-[Arial,sans-serif] text-card-fg-muted">{pending.length}</span>
                    <span className="text-[11px] uppercase tracking-[0.8px] text-card-fg-muted font-[Arial,sans-serif]">Pending</span>
                  </div>
                </div>

                {approved.length > 0 && (
                  <div className="mb-8 last:mb-0">
                    <p className="text-[11px] uppercase tracking-[0.8px] mt-0 mb-2 font-[Arial,sans-serif] text-friendly-dark">Verified</p>
                    <ul className="list-none m-0 p-0 flex flex-col gap-px">
                      {approved.map((loc) => <KennelLocationRow key={loc.id} loc={loc} />)}
                    </ul>
                  </div>
                )}

                {pending.length > 0 && (
                  <div className={`mb-8 last:mb-0${approved.length > 0 ? ' pt-6 border-t border-black/8' : ''}`}>
                    <p className="text-[11px] uppercase tracking-[0.8px] mt-0 mb-2 font-[Arial,sans-serif] text-card-fg-muted">Pending</p>
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
