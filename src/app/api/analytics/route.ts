import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      })
    : null;

const getClientIp = (headers: Headers) => {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || null;
  }
  return (
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    headers.get('x-client-ip') ||
    null
  );
};

const hashValue = (value: string) => {
  const salt = process.env.ANALYTICS_SALT || '';
  return createHash('sha256').update(`${salt}${value}`).digest('hex');
};

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ ok: false }, { status: 204 });
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

  if (!pathValue || (!visitorValue && !ipHash)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const referrerValue =
    typeof referrer === 'string' && referrer.trim().length > 0 ? referrer.trim() : null;

  const { error } = await supabase.from('analytics_events').insert({
    visitor_id: visitorValue || ipHash,
    ip_hash: ipHash,
    path: pathValue,
    referrer: referrerValue,
    user_agent: request.headers.get('user-agent'),
  });

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
