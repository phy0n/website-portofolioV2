import { NextResponse } from 'next/server';

export const revalidate = 600;

const DEFAULT_USERNAME = 'phy0n';
const JAVA_USERNAME_REGEX = /^[a-zA-Z0-9_]{3,16}$/;

type MojangProfileResponse = {
  id: string;
  name: string;
};

type SessionProfileResponse = {
  id: string;
  name: string;
  properties?: Array<{
    name: string;
    value: string;
  }>;
};

type TexturesPayload = {
  textures?: {
    SKIN?: {
      url?: string;
      metadata?: {
        model?: 'slim' | 'default';
      };
    };
    CAPE?: {
      url?: string;
    };
  };
};

function formatUuid(uuid: string) {
  const normalized = uuid.replace(/-/g, '');
  if (normalized.length !== 32) return uuid;
  return `${normalized.slice(0, 8)}-${normalized.slice(8, 12)}-${normalized.slice(12, 16)}-${normalized.slice(16, 20)}-${normalized.slice(20)}`;
}

function ensureHttps(url: string) {
  if (url.startsWith('http://')) return `https://${url.slice('http://'.length)}`;
  return url;
}

function decodeTextures(value: string): TexturesPayload | null {
  try {
    const decoded = Buffer.from(value, 'base64').toString('utf8');
    return JSON.parse(decoded) as TexturesPayload;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || DEFAULT_USERNAME;

  if (!JAVA_USERNAME_REGEX.test(username)) {
    return NextResponse.json({ error: 'Invalid Minecraft username' }, { status: 400 });
  }

  try {
    const profileResponse = await fetch(
      `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`,
      { next: { revalidate } }
    );

    if (profileResponse.status === 204 || profileResponse.status === 404) {
      return NextResponse.json({ error: 'Minecraft profile not found' }, { status: 404 });
    }

    if (!profileResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch Minecraft profile' }, { status: 502 });
    }

    const profileData = (await profileResponse.json()) as MojangProfileResponse;
    const uuid = profileData.id;

    const sessionResponse = await fetch(
      `https://sessionserver.mojang.com/session/minecraft/profile/${encodeURIComponent(uuid)}`,
      { next: { revalidate } }
    );

    if (!sessionResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch Minecraft textures' }, { status: 502 });
    }

    const sessionData = (await sessionResponse.json()) as SessionProfileResponse;
    const texturesProperty = sessionData.properties?.find((property) => property.name === 'textures');
    const textures = texturesProperty?.value ? decodeTextures(texturesProperty.value) : null;

    const skinUrlRaw = textures?.textures?.SKIN?.url ?? null;
    const capeUrlRaw = textures?.textures?.CAPE?.url ?? null;
    const skinUrl = skinUrlRaw ? ensureHttps(skinUrlRaw) : null;
    const capeUrl = capeUrlRaw ? ensureHttps(capeUrlRaw) : null;
    const model = textures?.textures?.SKIN?.metadata?.model === 'slim' ? 'slim' : 'default';

    return NextResponse.json(
      {
        username: profileData.name,
        uuid: formatUuid(uuid),
        skinUrl,
        capeUrl,
        model,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=600, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching Minecraft profile:', error);
    return NextResponse.json({ error: 'Failed to fetch Minecraft profile' }, { status: 500 });
  }
}

