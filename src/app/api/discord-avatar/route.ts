import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const userId = process.env.DISCORD_USER_ID;
  const token = process.env.DISCORD_TOKEN;

  if (!userId || !token) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
  }

  const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
    headers: {
      Authorization: `Bot ${token}`,
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }

  const data = await response.json();
  const avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${data.avatar}.png`;

  return NextResponse.json({ avatarUrl });
}
