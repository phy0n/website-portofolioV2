import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const RESEND_API_URL = 'https://api.resend.com/emails';

const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? 'phymee@proton.me';
const RESEND_FROM = process.env.RESEND_FROM ?? 'Portfolio <onboarding@resend.dev>';
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? '';

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

const isValidEmail = (value: string) => {
  const email = value.trim();
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export async function POST(request: Request) {
  if (isCrossSiteRequest(request.headers)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  if (!RESEND_API_KEY) {
    return NextResponse.json({ ok: false, error: 'EMAIL_NOT_CONFIGURED' }, { status: 503 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });
  }

  const { email, message, source, company } = payload as {
    email?: unknown;
    message?: unknown;
    source?: unknown;
    company?: unknown;
  };

  const emailValue = String(email ?? '').trim();
  const messageValue = String(message ?? '').replace(/\r\n/g, '\n').trim();
  const sourceValue = String(source ?? '').trim();
  const honeypot = String(company ?? '').trim();

  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  if (!isValidEmail(emailValue)) {
    return NextResponse.json({ ok: false, error: 'INVALID_EMAIL' }, { status: 400 });
  }

  if (!messageValue || messageValue.length > 2000) {
    return NextResponse.json({ ok: false, error: 'INVALID_MESSAGE' }, { status: 400 });
  }

  const subject = `Portfolio contact${sourceValue ? ` (${sourceValue})` : ''}`;
  const text = [
    `From: ${emailValue}`,
    sourceValue ? `Source: ${sourceValue}` : null,
    '',
    messageValue,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [CONTACT_TO_EMAIL],
        subject,
        text,
        reply_to: emailValue,
      }),
    });

    const data = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: 'SEND_FAILED', details: data?.message ?? null },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch {
    return NextResponse.json({ ok: false, error: 'SEND_FAILED' }, { status: 502 });
  }
}

