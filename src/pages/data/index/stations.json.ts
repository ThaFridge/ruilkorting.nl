import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import type { StationIndex } from '../../../lib/data/index-types.ts';

export const GET: APIRoute = async () => {
  const stations = await getCollection('stations');
  const body: StationIndex = {
    generated_at: new Date().toISOString(),
    items: stations
      .map((s) => ({ id: s.id, name: s.data.name, major: s.data.major }))
      .sort((a, b) => Number(b.major) - Number(a.major) || a.name.localeCompare(b.name, 'nl')),
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
