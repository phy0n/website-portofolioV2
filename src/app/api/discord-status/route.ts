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

  const getDiscordAssetUrl = (applicationId: string | null, image: string | null | undefined) => {
    if (!image) return null;

    if (image.startsWith('mp:')) {
      return `https://media.discordapp.net/${image.slice('mp:'.length)}`;
    }

    if (image.startsWith('spotify:')) {
      return `https://i.scdn.co/image/${image.slice('spotify:'.length)}`;
    }

    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }

    if (!applicationId) return null;
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${image}.png`;
  };

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
    
    // Type 4 = Custom Status
    const primaryActivity = activities.find((act: any) => act.type !== 4 && act.name !== 'Spotify');
    const customStatus = activities.find((act: any) => act.type === 4); // Custom Status

    const normalizedActivity = primaryActivity
      ? {
          type: primaryActivity.type,
          name: primaryActivity.name,
          details: primaryActivity.details ?? null,
          state: primaryActivity.state ?? null,
          applicationId: primaryActivity.application_id ? String(primaryActivity.application_id) : null,
          timestamps: primaryActivity.timestamps
            ? {
                start: typeof primaryActivity.timestamps.start === 'number' ? primaryActivity.timestamps.start : null,
                end: typeof primaryActivity.timestamps.end === 'number' ? primaryActivity.timestamps.end : null,
              }
            : null,
          assets: primaryActivity.assets
            ? {
                largeImage: getDiscordAssetUrl(
                  primaryActivity.application_id ? String(primaryActivity.application_id) : null,
                  primaryActivity.assets.large_image
                ),
                largeText: primaryActivity.assets.large_text ?? null,
                smallImage: getDiscordAssetUrl(
                  primaryActivity.application_id ? String(primaryActivity.application_id) : null,
                  primaryActivity.assets.small_image
                ),
                smallText: primaryActivity.assets.small_text ?? null,
              }
            : null,
          largeImage: getDiscordAssetUrl(
            primaryActivity.application_id ? String(primaryActivity.application_id) : null,
            primaryActivity.assets?.large_image
          ),
          smallImage: getDiscordAssetUrl(
            primaryActivity.application_id ? String(primaryActivity.application_id) : null,
            primaryActivity.assets?.small_image
          ),
        }
      : null;
    
    const status = {
      online: presence.discord_status !== 'offline',
      status: presence.discord_status, // online, idle, dnd, offline
      activity: normalizedActivity,
      customStatus: customStatus?.state || null,
      spotify: presence.spotify ? {
        song: presence.spotify.song,
        artist: presence.spotify.artist,
        album: presence.spotify.album,
        trackId: presence.spotify.track_id ?? null,
        albumArtUrl: presence.spotify.album_art_url ?? null,
        timestamps: presence.spotify.timestamps
          ? {
              start: presence.spotify.timestamps.start,
              end: presence.spotify.timestamps.end,
            }
          : null,
        songUrl: presence.spotify.track_id ? `https://open.spotify.com/track/${presence.spotify.track_id}` : null,
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
