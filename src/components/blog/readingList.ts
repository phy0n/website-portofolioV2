'use client';

const STORAGE_KEY = 'phion_reading_list_v1';

export function readReadingList(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map((value) => String(value)));
  } catch {
    return new Set();
  }
}

export function writeReadingList(list: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(list)));
  } catch {
    // ignore storage failures
  }
}

export function toggleReadingListSlug(slug: string): { list: Set<string>; saved: boolean } {
  const list = readReadingList();
  const normalized = String(slug || '').trim();
  if (!normalized) return { list, saved: false };
  if (list.has(normalized)) {
    list.delete(normalized);
    writeReadingList(list);
    return { list, saved: false };
  }
  list.add(normalized);
  writeReadingList(list);
  return { list, saved: true };
}

