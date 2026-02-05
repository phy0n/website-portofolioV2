export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function countWords(value: string): number {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean).length;
}

export function readingTimeMinutes(value: string, wordsPerMinute = 220): number {
  const safeWpm = Number.isFinite(wordsPerMinute) && wordsPerMinute > 0 ? wordsPerMinute : 220;
  const words = countWords(value);
  return Math.max(1, Math.ceil(words / safeWpm));
}

export function slugifyHeading(value: string): string {
  const trimmed = value.trim().toLowerCase();
  const normalized = trimmed.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const slug = normalized
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return slug || 'section';
}

export function createHeadingSlugger() {
  const seen = new Map<string, number>();
  return (text: string) => {
    const base = slugifyHeading(text);
    const next = (seen.get(base) ?? 0) + 1;
    seen.set(base, next);
    return next === 1 ? base : `${base}-${next}`;
  };
}

export function extractTocFromContent(content: string): TocItem[] {
  const lines = content.split(/\r?\n/);
  const slugger = createHeadingSlugger();
  const toc: TocItem[] = [];
  let inCodeBlock = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = /^(#{2,3})\s+(.*)$/.exec(line);
    if (!match) continue;

    const level = match[1].length === 2 ? 2 : 3;
    const text = match[2].trim();
    if (!text) continue;

    toc.push({ id: slugger(text), text, level });
  }

  return toc;
}

export function formatDateId(value: string): string {
  const [yyyyRaw, mmRaw, ddRaw] = value.split('-');
  const yyyy = Number(yyyyRaw);
  const mm = Number(mmRaw);
  const dd = Number(ddRaw);
  if (!yyyy || !mm || !dd) return value;
  return new Date(Date.UTC(yyyy, mm - 1, dd)).toISOString();
}

export function formatBlogDate(value: string, locale = 'en-US'): string {
  if (!value) return '';
  const [yyyyRaw, mmRaw, ddRaw] = value.split('T')[0]?.split('-') ?? [];
  const yyyy = Number(yyyyRaw);
  const mm = Number(mmRaw);
  const dd = Number(ddRaw);
  if (yyyy && mm && dd) {
    return new Date(Date.UTC(yyyy, mm - 1, dd)).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
