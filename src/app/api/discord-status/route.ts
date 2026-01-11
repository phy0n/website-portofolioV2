import { NextResponse } from 'next/server';

export const revalidate = 15;

export async function GET() {
  // Use the same Discord User ID from environment variable
  const userId = process.env.DISCORD_USER_ID;

  if (!userId) {
    return NextResponse.json({ 
      online: false, 
      status: 'offline',
      activity: null,
      spotify: null,
      error: 'Discord User ID not configured'
    });
  }

  try {
    // Using Lanyard API to get Discord presence
    // Note: User must join https://discord.gg/lanyard for this to work
    const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, {
      next: { revalidate: 15 },
      headers: {
        Accept: 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lanyard API error:', response.status, errorText);
      
      // Return offline status instead of throwing error
      return NextResponse.json({ 
        online: false, 
        status: 'offline',
        activity: null,
        spotify: null,
        error: `Lanyard API error: ${response.status}. Make sure you've joined https://discord.gg/lanyard`
      });
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Lanyard API error');
    }

    const presence = data.data;
    
    // Extract activity information
    const activities = presence.activities || [];
    
    // Type 0 = Playing game, Type 4 = Custom Status
    const currentActivity = activities.find((act: any) => act.type === 0); // Playing
    const customStatus = activities.find((act: any) => act.type === 4); // Custom Status
    
    const status = {
      online: presence.discord_status !== 'offline',
      status: presence.discord_status, // online, idle, dnd, offline
      activity: currentActivity ? {
        name: currentActivity.name,
        details: currentActivity.details || null,
        state: currentActivity.state || null,
        largeImage: currentActivity.assets?.large_image 
          ? `https://cdn.discordapp.com/app-assets/${currentActivity.application_id}/${currentActivity.assets.large_image}.png`
          : null,
      } : null,
      customStatus: customStatus?.state || null,
      spotify: presence.spotify ? {
        song: presence.spotify.song,
        artist: presence.spotify.artist,
        album: presence.spotify.album,
      } : null,
    };

      return NextResponse.json(status, {
        headers: {
          'Cache-Control': 'public, max-age=15, stale-while-revalidate=60',
        },
      });
  } catch (error) {
    console.error('Error fetching Discord status:', error);
    // Return offline status instead of error
    return NextResponse.json(
      {
      online: false, 
      status: 'offline',
      activity: null,
      spotify: null,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=15, stale-while-revalidate=60',
        },
      }
    );
  }
}
