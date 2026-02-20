import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import { isIP } from 'node:net';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseKey = supabaseServiceRoleKey ?? supabaseAnonKey;

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      })
    : null;

const normalizeIp = (value: string) => {
  let candidate = value.trim();
  if (!candidate) return null;
  if (candidate.toLowerCase() === 'unknown') return null;

  candidate = candidate.replace(/^"+|"+$/g, '').trim();

  if (candidate.startsWith('[')) {
    const endBracket = candidate.indexOf(']');
    if (endBracket > 1) {
      candidate = candidate.slice(1, endBracket).trim();
    }
  }

  const ipv4WithPort = candidate.includes('.') && candidate.split(':').length === 2;
  if (ipv4WithPort) {
    candidate = candidate.split(':')[0]?.trim() || '';
  }

  const ipv4Mapped = candidate.match(/^(?:0*:)*ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
  if (ipv4Mapped?.[1]) {
    candidate = ipv4Mapped[1];
  }

  if (isIP(candidate) === 0) return null;
  return candidate;
};

const getClientIp = (headers: Headers) => {
  const preferred = [
    headers.get('cf-connecting-ip'),
    headers.get('x-real-ip'),
    headers.get('x-client-ip'),
  ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

  for (const value of preferred) {
    const normalized = normalizeIp(value);
    if (normalized) return normalized;
  }

  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',');
    for (const part of parts) {
      const normalized = normalizeIp(part);
      if (normalized) return normalized;
    }
  }

  return null;
};

const hashValue = (value: string) => {
  const salt = process.env.ANALYTICS_SALT || '';
  return createHash('sha256').update(`${salt}${value}`).digest('hex');
};

const isCrossSiteRequest = (headers: Headers) => {
  const fetchSite = headers.get('sec-fetch-site');
  if (fetchSite === 'cross-site') return true;
  const origin = headers.get('origin');
  const host = headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host !== host;
  } catch {
    return false;
  }
};

export async function POST(request: Request) {
  if (!supabase) {
    return new NextResponse(null, { status: 204 });
  }

  if (isCrossSiteRequest(request.headers)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { visitorId, path, referrer } = payload as {
    visitorId?: string;
    path?: string;
    referrer?: string | null;
  };

  const visitorValue = String(visitorId || '').trim();
  const pathValue = String(path || '').trim();
  const ipAddress = getClientIp(request.headers);
  const ipHash = ipAddress ? hashValue(ipAddress) : null;
  const visitorKey = ipHash || visitorValue;

  if (!pathValue || pathValue.length > 200 || !pathValue.startsWith('/') || /\s/.test(pathValue)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (visitorValue.length > 80) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!visitorKey) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const referrerValue =
    typeof referrer === 'string' && referrer.trim().length > 0 ? referrer.trim() : null;
  const safeReferrer = referrerValue && referrerValue.length <= 500 ? referrerValue : null;

  const { error } = await supabase.from('analytics_events').insert({
    visitor_id: visitorKey,
    ip_hash: ipHash,
    path: pathValue,
    referrer: safeReferrer,
    user_agent: request.headers.get('user-agent'),
  });

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
