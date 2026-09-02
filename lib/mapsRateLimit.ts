import { prisma } from '@/lib/prisma';

// const DAILY_CAP = 900;
const DAILY_CAP = 1;
const WARN_THRESHOLD = 810; // 90% of cap

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
    const row = await prisma.mapsRateLimit.upsert({
      where: { date },
      update: { count: { increment: 1 } },
      create: { date, count: 1 },
    });

    const count = row.count;

    if (count > DAILY_CAP) {
      console.warn(
        `[Maps Gate] BLOCKED ${apiType} — daily cap of ${DAILY_CAP} reached. ` +
          `count=${count} date=${date} ts=${new Date().toISOString()}`
      );
      return false;
    }

    if (count === WARN_THRESHOLD) {
      console.warn(
        `[Maps Gate] WARNING: ${count}/${DAILY_CAP} Maps API requests used today (${date}). ` +
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
