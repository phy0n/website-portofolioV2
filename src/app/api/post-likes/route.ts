import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_POST_IDS = 80;

const normalizePostId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!UUID_RE.test(trimmed)) return null;
  return trimmed;
};

const toCount = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = (searchParams.get('ids') ?? searchParams.get('id') ?? '').trim();
  const ids = raw
    .split(',')
    .map((value) => normalizePostId(value))
    .filter((value): value is string => Boolean(value))
    .slice(0, MAX_POST_IDS);

  if (!supabase || ids.length === 0) {
    const response = NextResponse.json({ ok: true, counts: {} as Record<string, number> });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  const counts: Record<string, number> = {};
  ids.forEach((id) => {
    counts[id] = 0;
  });

  const { data, error } = await supabase
    .from('post_like_counters')
    .select('post_id,likes')
    .in('post_id', ids);

  if (!error && Array.isArray(data)) {
    data.forEach((row) => {
      const postId = String((row as any)?.post_id || '');
      if (!postId) return;
      counts[postId] = toCount((row as any)?.likes);
    });
  }

  const response = NextResponse.json({ ok: true, counts });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
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

  const { postId, visitorId } = payload as { postId?: string; visitorId?: string };
  const postValue = normalizePostId(String(postId || '')) ?? '';
  const visitorValue = String(visitorId || '').trim();

  if (!postValue) {
    return NextResponse.json({ ok: false, error: 'INVALID_POST_ID' }, { status: 400 });
  }

  if (!visitorValue || visitorValue.length > 80) {
    return NextResponse.json({ ok: false, error: 'INVALID_VISITOR_ID' }, { status: 400 });
  }

  const { error: insertError } = await supabase.from('post_likes').insert({
    post_id: postValue,
    visitor_id: visitorValue,
  });

  const insertCode = (insertError as any)?.code as string | undefined;
  if (insertError && insertCode !== '23505') {
    return NextResponse.json({ ok: false, error: 'INSERT_FAILED' }, { status: 500 });
  }

  let likes = 0;
  const { data: counterRow, error: counterError } = await supabase
    .from('post_like_counters')
    .select('likes')
    .eq('post_id', postValue)
    .maybeSingle();

  if (!counterError && counterRow) {
    likes = toCount((counterRow as any)?.likes);
  } else {
    const { count } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postValue);
    likes = typeof count === 'number' ? count : 0;
  }

  return NextResponse.json({
    ok: true,
    liked: true,
    alreadyLiked: insertCode === '23505',
    likes,
  });
}

