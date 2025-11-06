import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || '8883015179';

  try {
    // Fetch user details
    const userResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    const userData = await userResponse.json();

    // Fetch avatar thumbnail
    const avatarResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png`);
    const avatarData = await avatarResponse.json();

    const profile = {
      username: userData.name,
      displayName: userData.displayName,
      description: userData.description || 'No description',
      created: new Date(userData.created).toLocaleDateString(),
      isBanned: userData.isBanned || false,
      avatarUrl: avatarData.data[0]?.imageUrl || '',
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching Roblox profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Roblox profile' },
      { status: 500 }
    );
  }
}
