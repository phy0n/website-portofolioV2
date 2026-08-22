'use client';

export default function SpotifyPlaylistWidget() {
  const SPOTIFY_SHARE_LINK = "https://open.spotify.com/playlist/37i9dQZF1EIZ4Ek6ZjcXle?si=d0f5b46389ed4356";

  const embedLink = SPOTIFY_SHARE_LINK.replace('open.spotify.com/', 'open.spotify.com/embed/').split('?')[0] + '?utm_source=generator&theme=0';

  return (
    <div className="w-full h-[420px] rounded-2xl overflow-hidden bg-transparent">
      <iframe
        key={embedLink}
        style={{ borderRadius: '16px' }}
        src={embedLink}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen={false}
        allowTransparency={true}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="w-full h-full"
      ></iframe>
    </div>
  );
}
