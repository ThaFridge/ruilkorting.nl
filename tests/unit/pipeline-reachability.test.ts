import { describe, expect, it } from 'vitest';
import { computeReachability, SOURCE } from '../../pipeline/reachability/estimate.ts';
import { parseFrontmatter } from '../../pipeline/lib/content.ts';
import { reachabilityFile } from '../../src/lib/schemas/reachability.ts';
import type { Station } from '../../src/lib/schemas/reference.ts';
import type { DestinationEntry } from '../../pipeline/lib/content.ts';

const stations: Station[] = [
  { id: 'heerlen', name: 'Heerlen', province: 'Limburg', lat: 50.891, lon: 5.975, major: true },
  { id: 'valkenburg', name: 'Valkenburg', province: 'Limburg', lat: 50.868, lon: 5.83, major: false },
];
const dest = (id: string, nearest: string, published = true): DestinationEntry => ({
  id,
  data: {
    title: id,
    type: 'stad',
    city: 'x',
    nearest_station: nearest,
    last_mile: { mode: 'walk', minutes: 5 },
    location: { lat: 50.86, lon: 5.83 },
    categories: ['steden'],
    seasons: [],
    summary: 'Een voldoende lange samenvatting voor de test.',
    highlights: [],
    sources: [],
    featured: false,
    published,
  },
});

describe('computeReachability', () => {
  const now = new Date(2026, 9, 4, 12, 0, 0);
  it('produces a valid file sorted by travel time and skips unpublished destinations', () => {
    const file = computeReachability(stations[0]!, stations, [dest('far', 'valkenburg'), dest('home', 'heerlen'), dest('draft', 'heerlen', false)], now);
    expect(() => reachabilityFile.parse(file)).not.toThrow();
    expect(file.items.map((i) => i.destination)).toEqual(['home', 'far']);
    expect(file.items[0]).toMatchObject({ travel_minutes: 5, distance_km: 0, transfers: null, method: SOURCE, confidence: 'low' });
    expect(file.travel_date).toBe('2026-10-10');
  });
  it('fails on a dangling station reference', () => {
    expect(() => computeReachability(stations[0]!, stations, [dest('x', 'nergens')], now)).toThrow(/onbekend station/);
  });
});

describe('parseFrontmatter', () => {
  it('parses YAML frontmatter and rejects missing frontmatter', () => {
    expect(parseFrontmatter('---\ntitle: A\nlist: [a, b]\n---\nbody')).toEqual({ title: 'A', list: ['a', 'b'] });
    expect(() => parseFrontmatter('no frontmatter')).toThrow();
  });
});
