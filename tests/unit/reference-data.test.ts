import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { categories, seasons, stations } from '../../src/lib/schemas/reference.ts';

const load = async (file: string) => JSON.parse(await readFile(new URL(`../../data/reference/${file}`, import.meta.url), 'utf8'));

describe('reference data', () => {
  it('stations.json validates and has unique ids and codes', async () => {
    const list = stations.parse(await load('stations.json'));
    const ids = list.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const codes = list.map((s) => s.code).filter(Boolean);
    expect(new Set(codes).size).toBe(codes.length);
    expect(list.some((s) => s.major)).toBe(true);
  });
  it('categories.json validates with unique ids', async () => {
    const list = categories.parse(await load('categories.json'));
    expect(new Set(list.map((c) => c.id)).size).toBe(list.length);
  });
  it('seasons.json validates and covers every month', async () => {
    const list = seasons.parse(await load('seasons.json'));
    const months = new Set(list.flatMap((s) => s.months));
    for (let m = 1; m <= 12; m++) expect(months.has(m)).toBe(true);
  });
});
