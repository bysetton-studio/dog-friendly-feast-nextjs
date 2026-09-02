import { NextRequest, NextResponse } from 'next/server';

const DAILY_LIMIT = 900;

// Module-level counter — persists across requests within a single server process.
// Note: resets on server restart and won't coordinate across multiple instances.
let dailyCount = 0;
let countDate = new Date().toDateString();

function incrementCount(): boolean {
  const today = new Date().toDateString();
  if (today !== countDate) {
    dailyCount = 0;
    countDate = today;
  }
  if (dailyCount >= DAILY_LIMIT) return false;
  dailyCount++;
  return true;
}

export async function GET(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') ?? '';

  if (!incrementCount()) {
    return NextResponse.json({ city: null, limitReached: true });
  }

  try {
    const url = ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/';
    const res = await fetch(url);
    const data = await res.json();
    const city = typeof data?.city === 'string' ? data.city : null;
    return NextResponse.json({ city });
  } catch {
    dailyCount--; // don't count failed requests
    return NextResponse.json({ city: null });
  }
}
