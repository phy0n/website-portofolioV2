import type { DiscordActivity, DiscordStatus } from '@/components/home/types';

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => typeof value === 'object' && value !== null;

const asString = (value: unknown): string | null => (typeof value === 'string' ? value : null);

const asNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const asStringOrNumberToString = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
};

export const getDiscordAssetUrl = (applicationId: string | null, image: string | null | undefined) => {
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

const normalizeActivity = (raw: unknown): DiscordActivity | null => {
  if (!isRecord(raw)) return null;

  const type = asNumber(raw.type);
  const name = asString(raw.name);
  if (type === null || !name) return null;

  const applicationId = asStringOrNumberToString(raw.application_id);

  const timestampsRaw = isRecord(raw.timestamps) ? raw.timestamps : null;
  const timestamps = timestampsRaw
    ? {
        start: asNumber(timestampsRaw.start),
        end: asNumber(timestampsRaw.end),
      }
    : null;

  const assetsRaw = isRecord(raw.assets) ? raw.assets : null;
  const largeImageKey = assetsRaw ? asString(assetsRaw.large_image) : null;
  const smallImageKey = assetsRaw ? asString(assetsRaw.small_image) : null;

  const assets = assetsRaw
    ? {
        largeImage: getDiscordAssetUrl(applicationId, largeImageKey),
        largeText: asString(assetsRaw.large_text),
        smallImage: getDiscordAssetUrl(applicationId, smallImageKey),
        smallText: asString(assetsRaw.small_text),
      }
    : null;

  const largeImage = getDiscordAssetUrl(applicationId, largeImageKey);
  const smallImage = getDiscordAssetUrl(applicationId, smallImageKey);

  return {
    type,
    name,
    details: asString(raw.details),
    state: asString(raw.state),
    applicationId,
    timestamps,
    assets,
    largeImage,
    smallImage,
  };
};

const normalizeSpotify = (raw: unknown): DiscordStatus['spotify'] => {
  if (!isRecord(raw)) return null;
  const song = asString(raw.song);
  const artist = asString(raw.artist);
  const album = asString(raw.album);
  if (!song || !artist || !album) return null;

  const trackId = asString(raw.track_id);
  const albumArtUrl = asString(raw.album_art_url);

  const timestampsRaw = isRecord(raw.timestamps) ? raw.timestamps : null;
  const start = timestampsRaw ? asNumber(timestampsRaw.start) : null;
  const end = timestampsRaw ? asNumber(timestampsRaw.end) : null;

  return {
    song,
    artist,
    album,
    trackId,
    albumArtUrl,
    timestamps: typeof start === 'number' && typeof end === 'number' ? { start, end } : null,
    songUrl: trackId ? `https://open.spotify.com/track/${trackId}` : null,
  };
};

export const normalizeDiscordStatusFromLanyard = (presence: unknown): DiscordStatus | null => {
  if (!isRecord(presence)) return null;

  const statusKey = asString(presence.discord_status) ?? 'offline';
  const activities = Array.isArray(presence.activities) ? presence.activities : [];
  const spotify = normalizeSpotify(presence.spotify);

  const primaryActivityRaw = activities.find((entry) => {
    if (!isRecord(entry)) return false;
    const type = asNumber(entry.type);
    const name = asString(entry.name);
    if (type === null || !name) return false;
    return type !== 4 && name !== 'Spotify';
  });

  const customStatusRaw = activities.find((entry) => {
    if (!isRecord(entry)) return false;
    const type = asNumber(entry.type);
    const state = asString(entry.state);
    return type === 4 && Boolean(state);
  });

  const customStatus = isRecord(customStatusRaw) ? asString(customStatusRaw.state) : null;
  const activity = normalizeActivity(primaryActivityRaw);

  return {
    online: statusKey !== 'offline',
    status: statusKey,
    activity,
    customStatus,
    spotify,
  };
};

