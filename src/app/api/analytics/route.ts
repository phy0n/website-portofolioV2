import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      })
    : null;

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

  if (!visitorValue || !pathValue) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const referrerValue =
    typeof referrer === 'string' && referrer.trim().length > 0 ? referrer.trim() : null;

  const { error } = await supabase.from('analytics_events').insert({
    visitor_id: visitorValue,
    path: pathValue,
    referrer: referrerValue,
    user_agent: request.headers.get('user-agent'),
  });

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
