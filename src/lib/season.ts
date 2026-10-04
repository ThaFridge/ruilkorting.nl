import type { Season } from './schemas/reference.ts';

/** ISO date (YYYY-MM-DD) in local time. */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Next Saturday strictly after `from` — the representative travel day for precomputed reachability. */
export function nextSaturday(from: Date): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const delta = ((6 - d.getDay() + 7) % 7) || 7;
  d.setDate(d.getDate() + delta);
  return toIsoDate(d);
}

/** Seasons relevant for a date, ordered by their `order` field. */
export function seasonsForDate(date: Date, seasons: readonly Season[]): Season[] {
  const month = date.getMonth() + 1;
  return seasons.filter((s) => s.months.includes(month)).sort((a, b) => a.order - b.order);
}

/** Parse a YYYY-MM-DD string into a local Date, or null when invalid. */
export function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number) as [number, number, number];
  const date = new Date(y, m - 1, d);
  return date.getMonth() === m - 1 && date.getDate() === d ? date : null;
}
