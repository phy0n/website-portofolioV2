import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import { createSupabaseServerClient, supabaseConfig } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CHAT_TABLE = 'chat_messages_phion';

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

type ChatMessage = {
  id: number;
  createdAt: string;
  name: string;
  message: string;
};

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

const toMessage = (row: any): ChatMessage | null => {
  const id = Number(row?.id);
  const createdAt = String(row?.created_at ?? '').trim();
  const name = String(row?.name ?? '').trim();
  const message = String(row?.message ?? '').trim();

  if (!Number.isFinite(id) || !createdAt || !name || !message) return null;
  return { id, createdAt, name, message };
};

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const rawLimit = searchParams.get('limit');
  const limit = Math.max(1, Math.min(80, Number.parseInt(rawLimit ?? '50', 10) || 50));

  const { data, error } = await supabase
    .from(CHAT_TABLE)
    .select('id,created_at,name,message')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ ok: false, error: 'QUERY_FAILED' }, { status: 500 });
  }

  const messages = (data ?? [])
    .map(toMessage)
    .filter((row): row is ChatMessage => Boolean(row))
    .reverse();

  const response = NextResponse.json({ ok: true, messages });
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

  const { name, message, visitorId } = payload as {
    name?: string;
    message?: string;
    visitorId?: string;
  };

  const nameValue = String(name || '').trim();
  const messageValue = String(message || '').trim();
  const visitorValue = String(visitorId || '').trim();

  if (!nameValue || nameValue.length > 40) {
    return NextResponse.json({ ok: false, error: 'INVALID_NAME' }, { status: 400 });
  }

  if (!messageValue || messageValue.length > 500) {
    return NextResponse.json({ ok: false, error: 'INVALID_MESSAGE' }, { status: 400 });
  }

  const ipAddress = getClientIp(request.headers);
  const ipHash = ipAddress ? hashValue(ipAddress) : null;
  const senderId = visitorValue || ipHash;

  if (!senderId) {
    return NextResponse.json({ ok: false, error: 'MISSING_SENDER_ID' }, { status: 400 });
  }

  const threshold = new Date(Date.now() - 2_000).toISOString();
  const { data: recent, error: recentError } = await supabase
    .from(CHAT_TABLE)
    .select('id')
    .eq('visitor_id', senderId)
    .gte('created_at', threshold)
    .limit(1);

  if (!recentError && Array.isArray(recent) && recent.length > 0) {
    return NextResponse.json({ ok: false, error: 'RATE_LIMITED' }, { status: 429 });
  }

  const { data: inserted, error } = await supabase
    .from(CHAT_TABLE)
    .insert({
      name: nameValue,
      message: messageValue,
      visitor_id: senderId,
      ip_hash: ipHash,
      user_agent: request.headers.get('user-agent'),
    })
    .select('id,created_at,name,message')
    .maybeSingle();

  if (error || !inserted) {
    return NextResponse.json({ ok: false, error: 'INSERT_FAILED' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: toMessage(inserted) });
}

export async function DELETE(request: Request) {
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  }

  if (isCrossSiteRequest(request.headers)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return NextResponse.json({ ok: false, error: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  }

  let routeSupabase;
  try {
    routeSupabase = await createSupabaseServerClient();
  } catch {
    return NextResponse.json({ ok: false, error: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  }

  const {
    data: { user },
    error: userError,
  } = await routeSupabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { data: adminRow, error: adminError } = await routeSupabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (adminError || !adminRow) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const url = new URL(request.url);
  let rawId = url.searchParams.get('id') ?? '';

  if (!rawId) {
    try {
      const payload = (await request.json()) as { id?: unknown };
      rawId = String(payload?.id ?? '').trim();
    } catch {
      // ignore
    }
  }

  const id = Number.parseInt(String(rawId || ''), 10);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: 'INVALID_ID' }, { status: 400 });
  }

  const deleteClient = supabaseServiceRoleKey ? supabase : routeSupabase;
  const { error: deleteError } = await deleteClient.from(CHAT_TABLE).delete().eq('id', id);

  if (deleteError) {
    return NextResponse.json({ ok: false, error: 'DELETE_FAILED' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
