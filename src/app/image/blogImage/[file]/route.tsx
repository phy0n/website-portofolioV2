import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

export const runtime = 'nodejs';
export const revalidate = 86400;

const getContentType = (filename: string) => {
  const extension = filename.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    default:
      return null;
  }
};

const isSafeFilename = (filename: string) => {
  if (!filename) return false;
  if (filename.includes('..')) return false;
  if (filename.includes('/') || filename.includes('\\')) return false;
  return true;
};

export async function GET(_request: NextRequest, context: { params: Promise<{ file: string }> }) {
  const resolvedParams = await context.params;
  const fileParam = typeof resolvedParams?.file === 'string' ? resolvedParams.file : '';
  let decoded = fileParam;

  try {
    decoded = decodeURIComponent(fileParam);
  } catch {
    decoded = fileParam;
  }

  if (!isSafeFilename(decoded)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const contentType = getContentType(decoded);
  if (!contentType) {
    return new NextResponse('Not found', { status: 404 });
  }

  const filePath = path.join(process.cwd(), 'public', 'image', 'blogImage', decoded);

  try {
    const bytes = await readFile(filePath);
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
