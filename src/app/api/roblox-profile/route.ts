import { NextResponse } from 'next/server';

export const revalidate = 600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || '8883015179';

  try {
    const userResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`, {
      next: { revalidate: 600 },
    });
    const userData = await userResponse.json();
    const avatarResponse = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png`,
      { next: { revalidate: 600 } }
    );
    const avatarData = await avatarResponse.json();

    const profile = {
      username: userData.name,
      displayName: userData.displayName,
      description: userData.description || 'No description',
      created: new Date(userData.created).toLocaleDateString(),
      isBanned: userData.isBanned || false,
      avatarUrl: avatarData.data[0]?.imageUrl || '',
    };

    return NextResponse.json(profile, {
      headers: {
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching Roblox profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Roblox profile' },
      { status: 500 }
    );
  }
}
