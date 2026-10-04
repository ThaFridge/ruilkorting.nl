import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { reachabilityFile, type ReachabilityFile } from '../schemas/reachability.ts';

/** Build-time reader for data/generated/reachability/*.json (validated). Not used in the browser. */
const DIR = path.resolve(process.cwd(), 'data/generated/reachability');

export async function listReachabilityStations(): Promise<string[]> {
  try {
    return (await readdir(DIR)).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')).sort();
  } catch {
    return [];
  }
}

export async function readReachability(station: string): Promise<ReachabilityFile> {
  const raw = await readFile(path.join(DIR, `${station}.json`), 'utf8');
  return reachabilityFile.parse(JSON.parse(raw));
}
