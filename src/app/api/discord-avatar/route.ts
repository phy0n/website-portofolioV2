import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(req: NextRequest) {
  const userId = process.env.DISCORD_USER_ID;
  const token = process.env.DISCORD_TOKEN;

  if (!userId || !token) {
    return NextResponse.json(
      { avatarUrl: null, error: 'Missing credentials' },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
        },
      }
    );
  }

  const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
    headers: {
      Authorization: `Bot ${token}`,
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { avatarUrl: null, error: 'Failed to fetch' },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
        },
      }
    );
  }

  const data = await response.json();
  const avatarUrl = data.avatar ? `https://cdn.discordapp.com/avatars/${userId}/${data.avatar}.png?size=512` : null;
  const avatarDecorationUrl = data.avatar_decoration_data?.asset
    ? `https://cdn.discordapp.com/avatar-decoration-presets/${data.avatar_decoration_data.asset}.png?size=512&passthrough=true`
    : null;

  return NextResponse.json(
    { avatarUrl, avatarDecorationUrl },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    }
  );
}
