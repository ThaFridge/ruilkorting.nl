import { describe, expect, it } from 'vitest';
import { nextSaturday, parseIsoDate, seasonsForDate, toIsoDate } from '../../src/lib/season.ts';
import type { Season } from '../../src/lib/schemas/reference.ts';

const seasons: Season[] = [
  { id: 'winter', name: 'Winter', description: 'x', kind: 'season', months: [12, 1, 2], order: 40 },
  { id: 'kerst', name: 'Kerst', description: 'x', kind: 'event-period', months: [12], order: 50 },
  { id: 'herfst', name: 'Herfst', description: 'x', kind: 'season', months: [9, 10, 11], order: 30 },
];

describe('nextSaturday', () => {
  it('returns the following Saturday for a weekday', () => {
    expect(nextSaturday(new Date(2026, 9, 4))).toBe('2026-10-10'); // Sunday 4 Oct 2026
    expect(nextSaturday(new Date(2026, 9, 7))).toBe('2026-10-10'); // Wednesday
  });
  it('skips to next week when today is Saturday', () => {
    expect(nextSaturday(new Date(2026, 9, 10))).toBe('2026-10-17');
  });
});

describe('seasonsForDate', () => {
  it('returns matching seasons sorted by order', () => {
    expect(seasonsForDate(new Date(2026, 11, 15), seasons).map((s) => s.id)).toEqual(['winter', 'kerst']);
    expect(seasonsForDate(new Date(2026, 9, 4), seasons).map((s) => s.id)).toEqual(['herfst']);
  });
});

describe('parseIsoDate / toIsoDate', () => {
  it('round-trips valid dates and rejects invalid ones', () => {
    expect(toIsoDate(parseIsoDate('2026-10-10')!)).toBe('2026-10-10');
    expect(parseIsoDate('2026-02-30')).toBeNull();
    expect(parseIsoDate('10-10-2026')).toBeNull();
    expect(parseIsoDate(null)).toBeNull();
  });
});
