import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { destinationFrontmatter, type DestinationFrontmatter } from '../../src/lib/schemas/content.ts';
import { stations as stationsSchema, type Station } from '../../src/lib/schemas/reference.ts';

export const ROOT = path.resolve(import.meta.dirname, '../..');

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

export function parseFrontmatter(markdown: string): Record<string, unknown> {
  const match = FRONTMATTER.exec(markdown);
  if (!match) throw new Error('Geen frontmatter gevonden');
  const parsed: unknown = YAML.parse(match[1] ?? '');
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Frontmatter is geen object');
  }
  return parsed as Record<string, unknown>;
}

export async function readStations(): Promise<Station[]> {
  const raw = await readFile(path.join(ROOT, 'data/reference/stations.json'), 'utf8');
  return stationsSchema.parse(JSON.parse(raw));
}

export type DestinationEntry = { id: string; data: DestinationFrontmatter };

export async function readDestinations(): Promise<DestinationEntry[]> {
  const dir = path.join(ROOT, 'content/destinations');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md')).sort();
  const entries: DestinationEntry[] = [];
  for (const file of files) {
    const id = file.replace(/\.md$/, '');
    const raw = await readFile(path.join(dir, file), 'utf8');
    const result = destinationFrontmatter.safeParse(parseFrontmatter(raw));
    if (!result.success) {
      throw new Error(`content/destinations/${file}: ${result.error.message}`);
    }
    entries.push({ id, data: result.data });
  }
  return entries;
}
