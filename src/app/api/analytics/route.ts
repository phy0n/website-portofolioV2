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

const toIpv4Octets = (ip: string) => {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  const octets = parts.map((part) => Number.parseInt(part, 10));
  if (octets.some((octet) => !Number.isFinite(octet) || octet < 0 || octet > 255)) return null;
  return octets as [number, number, number, number];
};

const isPublicIpv4 = (ip: string) => {
  const octets = toIpv4Octets(ip);
  if (!octets) return false;
  const [a, b] = octets;

  if (a === 0) return false;
  if (a === 10) return false;
  if (a === 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  if (a === 100 && b >= 64 && b <= 127) return false; // CGNAT 100.64.0.0/10
  if (a === 192 && b === 0) return false; // 192.0.0.0/24 (incl. 192.0.2.0/24)
  if (a === 198 && (b === 18 || b === 19)) return false; // 198.18.0.0/15
  if (a >= 224) return false; // multicast + reserved

  return true;
};

const isPublicIpv6 = (ip: string) => {
  const normalized = ip.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized === '::') return false;
  if (normalized === '::1') return false;

  // Unique local addresses fc00::/7 (fc.. or fd..)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return false;

  // Link-local fe80::/10 (fe8.. to feb..)
  if (
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb')
  ) {
    return false;
  }

  // Documentation 2001:db8::/32
  if (normalized.startsWith('2001:db8') || normalized.startsWith('2001:0db8')) return false;

  return true;
};

const isPublicIp = (ip: string) => {
  const version = isIP(ip);
  if (version === 4) return isPublicIpv4(ip);
  if (version === 6) return isPublicIpv6(ip);
  return false;
};

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

  const zoneIndex = candidate.indexOf('%');
  if (zoneIndex > 0) {
    candidate = candidate.slice(0, zoneIndex).trim();
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

const parseForwardedHeader = (value: string) => {
  const entries: string[] = [];

  value.split(',').forEach((segment) => {
    segment.split(';').forEach((part) => {
      const trimmed = part.trim();
      if (!trimmed) return;
      const lower = trimmed.toLowerCase();
      if (!lower.startsWith('for=')) return;
      entries.push(trimmed.slice(4));
    });
  });

  return entries;
};

const getClientIp = (headers: Headers) => {
  const candidates: string[] = [];

  const pushCandidate = (value: string | null) => {
    if (!value) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    candidates.push(trimmed);
  };

  pushCandidate(headers.get('cf-connecting-ip'));
  pushCandidate(headers.get('x-real-ip'));
  pushCandidate(headers.get('x-client-ip'));

  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    forwardedFor.split(',').forEach((part) => candidates.push(part));
  }

  const forwarded = headers.get('forwarded');
  if (forwarded) {
    parseForwardedHeader(forwarded).forEach((part) => candidates.push(part));
  }

  const normalized = candidates
    .map((value) => normalizeIp(value))
    .filter((value): value is string => Boolean(value));

  const publicIpv4 = normalized.find((ip) => isIP(ip) === 4 && isPublicIp(ip));
  if (publicIpv4) return publicIpv4;

  const publicIp = normalized.find((ip) => isPublicIp(ip));
  if (publicIp) return publicIp;

  return normalized[0] ?? null;
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
