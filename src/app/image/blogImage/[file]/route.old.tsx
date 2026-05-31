import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const revalidate = 86400;

const hashString = (value: string) => {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(i);
  }
  return Math.abs(hash);
};

const titleFromFilename = (filename: string) => {
  const base = filename.replace(/\.[a-z0-9]+$/i, '');
  const cleaned = base.replace(/[-_]+/g, ' ').trim();
  if (!cleaned) return null;
  return cleaned
    .split(/\s+/)
    .map((word) => (word ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : ''))
    .join(' ');
};

export async function GET(_request: Request, { params }: { params: { file: string } }) {
  const fileParam = typeof params?.file === 'string' ? params.file : '';
  let decoded = fileParam;

  try {
    decoded = decodeURIComponent(fileParam);
  } catch {
    decoded = fileParam;
  }

  const title = titleFromFilename(decoded) ?? 'Blog';
  const seed = hashString(decoded || title);
  const hue = seed % 360;
  const hue2 = (hue + 42) % 360;
  const accentHue = (hue + 190) % 360;

  const bg1 = `hsl(${hue} 62% 10%)`;
  const bg2 = `hsl(${hue2} 62% 7%)`;
  const accent = `hsl(${accentHue} 90% 65%)`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 64,
          background: `linear-gradient(135deg, ${bg1}, ${bg2})`,
          color: 'white',
          position: 'relative',
        }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.10), transparent 55%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.06), transparent 55%)',
          }}
        />

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: accent,
                boxShadow: `0 0 0 8px rgba(0,0,0,0.18)`,
              }}
            />
            <div style={{ fontSize: 22, letterSpacing: 8, textTransform: 'uppercase', opacity: 0.75 }}>
              Phion Blog
            </div>
          </div>

          <div
            style={{
              fontSize: 74,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 980,
              textShadow: '0 30px 80px rgba(0,0,0,0.55)',
            }}>
            {title}
          </div>

          <div style={{ fontSize: 22, opacity: 0.7, letterSpacing: 1 }}>
            /image/blogImage/{decoded}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    }
  );
}
