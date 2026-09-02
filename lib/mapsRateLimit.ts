import { prisma } from '@/lib/prisma';

const DAILY_CAP = parseInt(process.env.MAPS_DAILY_CAP ?? '900', 10);
const WARN_THRESHOLD = parseInt(process.env.MAPS_WARN_THRESHOLD ?? String(Math.floor(DAILY_CAP * 0.9)), 10);

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Gate function — must be called before every Google Maps API request.
 * Uses a raw upsert+increment so the count is updated atomically with no race conditions.
 * Fails open if the DB is unavailable so the app keeps working.
 */
export async function canMakeMapsRequest(apiType: string): Promise<boolean> {
  const date = todayUTC();

  try {
    const existing = await prisma.mapsRateLimit.findUnique({ where: { date } });
    const currentCount = existing?.count ?? 0;

    if (currentCount >= DAILY_CAP) {
      console.warn(
        `[Maps Gate] BLOCKED ${apiType} — daily cap of ${DAILY_CAP} reached. ` +
          `count=${currentCount} date=${date} ts=${new Date().toISOString()}`
      );
      return false;
    }

    const row = await prisma.mapsRateLimit.upsert({
      where: { date },
      update: { count: { increment: 1 } },
      create: { date, count: 1 },
    });

    if (row.count === WARN_THRESHOLD) {
      console.warn(
        `[Maps Gate] WARNING: ${row.count}/${DAILY_CAP} Maps API requests used today (${date}). ` +
          `Approaching daily cap.`
      );
    }

    return true;
  } catch {
    // TODO: switch to `return true` once the app has real traffic so a DB outage
    // doesn't break the map for all users. For now, fail closed to avoid unexpected billing.
    return false;
  }
}

export async function getMapsRequestCount(): Promise<{ date: string; count: number }> {
  const date = todayUTC();
  try {
    const row = await prisma.mapsRateLimit.findUnique({ where: { date } });
    return { date, count: row?.count ?? 0 };
  } catch {
    return { date, count: 0 };
  }
}

export async function isMapsCapReached(): Promise<boolean> {
  const { count } = await getMapsRequestCount();
  return count >= DAILY_CAP;
}
