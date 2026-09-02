import fs from 'fs';
import path from 'path';

const DAILY_CAP = 900;
const WARN_THRESHOLD = 810; // 90% of cap

// Stored next to the project root; added to .gitignore
const COUNTER_FILE = path.join(process.cwd(), '.maps-counter.json');

interface Counter {
  date: string; // YYYY-MM-DD UTC
  count: number;
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function readCounter(): Counter {
  try {
    const raw = fs.readFileSync(COUNTER_FILE, 'utf-8');
    return JSON.parse(raw) as Counter;
  } catch {
    return { date: '', count: 0 };
  }
}

function writeCounter(counter: Counter): void {
  fs.writeFileSync(COUNTER_FILE, JSON.stringify(counter), 'utf-8');
}

/**
 * Gate function — must be called before every Google Maps API request.
 * Returns true (allow) or false (block) and increments the daily counter.
 * Resets automatically when the UTC date rolls over.
 */
export function canMakeMapsRequest(apiType: string): boolean {
  const date = todayUTC();
  const counter = readCounter();

  if (counter.date !== date) {
    // New day — reset counter and allow
    writeCounter({ date, count: 1 });
    return true;
  }

  if (counter.count >= DAILY_CAP) {
    console.warn(
      `[Maps Gate] BLOCKED ${apiType} — daily cap of ${DAILY_CAP} reached. ` +
        `count=${counter.count} date=${date} ts=${new Date().toISOString()}`
    );
    return false;
  }

  const newCount = counter.count + 1;
  writeCounter({ date, count: newCount });

  if (newCount === WARN_THRESHOLD) {
    console.warn(
      `[Maps Gate] WARNING: ${newCount}/${DAILY_CAP} Maps API requests used today (${date}). ` +
        `Approaching daily cap.`
    );
  }

  return true;
}

export function getMapsRequestCount(): { date: string; count: number } {
  const date = todayUTC();
  const counter = readCounter();
  return counter.date === date ? counter : { date, count: 0 };
}
