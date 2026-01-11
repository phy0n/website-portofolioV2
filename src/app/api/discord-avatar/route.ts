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
  const avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${data.avatar}.png`;

  return NextResponse.json(
    { avatarUrl },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    }
  );
}
