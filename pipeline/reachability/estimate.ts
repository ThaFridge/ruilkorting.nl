import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { haversineKm } from '../../src/lib/geo.ts';
import {
  REACHABILITY_SCHEMA_VERSION,
  reachabilityFile,
  type ReachabilityFile,
  type ReachabilityItem,
} from '../../src/lib/schemas/reachability.ts';
import { estimateTotalMinutes } from '../../src/lib/travel-estimate.ts';
import { nextSaturday } from '../../src/lib/season.ts';
import { ROOT, readDestinations, readStations, type DestinationEntry } from '../lib/content.ts';
import type { Station } from '../../src/lib/schemas/reference.ts';

export const SOURCE = 'estimate-haversine';
const OUT_DIR = path.join(ROOT, 'data/generated/reachability');

/**
 * Pure computation for one departure station. Exported for unit tests.
 * See ADR-002: this is a placeholder until the GTFS pipeline exists.
 */
export function computeReachability(
  from: Station,
  stations: readonly Station[],
  destinations: readonly DestinationEntry[],
  now: Date,
): ReachabilityFile {
  const byId = new Map(stations.map((s) => [s.id, s]));
  const items: ReachabilityItem[] = [];
  for (const { id, data } of destinations) {
    if (!data.published) continue;
    const nearest = byId.get(data.nearest_station);
    if (!nearest) throw new Error(`Bestemming ${id}: onbekend station ${data.nearest_station}`);
    const distance = from.id === nearest.id ? 0 : haversineKm(from, nearest);
    items.push({
      destination: id,
      travel_minutes: estimateTotalMinutes(distance, data.last_mile.minutes),
      transfers: null,
      distance_km: Math.round(distance * 10) / 10,
      method: SOURCE,
      confidence: 'low',
    });
  }
  items.sort((a, b) => a.travel_minutes - b.travel_minutes || a.destination.localeCompare(b.destination));
  return reachabilityFile.parse({
    generated_at: now.toISOString(),
    source: SOURCE,
    schema_version: REACHABILITY_SCHEMA_VERSION,
    station: from.id,
    travel_date: nextSaturday(now),
    items,
  });
}

export async function runReachabilityEstimate(now = new Date()): Promise<{ stations: number; destinations: number }> {
  const [stations, destinations] = await Promise.all([readStations(), readDestinations()]);
  await mkdir(OUT_DIR, { recursive: true });
  // Remove stale files for stations that no longer exist.
  for (const f of await readdir(OUT_DIR)) {
    if (f.endsWith('.json') && !stations.some((s) => `${s.id}.json` === f)) {
      await rm(path.join(OUT_DIR, f));
    }
  }
  for (const station of stations) {
    const file = computeReachability(station, stations, destinations, now);
    await writeFile(path.join(OUT_DIR, `${station.id}.json`), JSON.stringify(file, null, 2) + '\n');
  }
  return { stations: stations.length, destinations: destinations.filter((d) => d.data.published).length };
}
