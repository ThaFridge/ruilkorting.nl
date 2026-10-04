import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import type { DestinationIndex } from '../../../lib/data/index-types.ts';

export const GET: APIRoute = async () => {
  const [destinations, cities, categories, seasons] = await Promise.all([
    getCollection('destinations', (d) => d.data.published),
    getCollection('cities'),
    getCollection('categories'),
    getCollection('seasons'),
  ]);
  const cityName = new Map(cities.map((c) => [c.id, c.data.title]));
  const body: DestinationIndex = {
    generated_at: new Date().toISOString(),
    categories: Object.fromEntries(categories.map((c) => [c.id, c.data.name])),
    seasons: Object.fromEntries(seasons.map((s) => [s.id, { name: s.data.name, months: s.data.months }])),
    items: destinations
      .map((d) => ({
        id: d.id,
        title: d.data.title,
        type: d.data.type,
        city: cityName.get(d.data.city.id) ?? d.data.city.id,
        station: d.data.nearest_station.id,
        categories: d.data.categories.map((c) => c.id),
        seasons: d.data.seasons.map((s) => s.id),
        summary: d.data.summary,
        featured: d.data.featured,
        price:
          d.data.price && d.data.price.price_type !== 'unavailable' && d.data.price.amount !== undefined
            ? { amount: d.data.price.amount, type: d.data.price.price_type, retrieved_at: d.data.price.retrieved_at ?? null }
            : null,
        last_mile: { mode: d.data.last_mile.mode, minutes: d.data.last_mile.minutes },
      }))
      .sort((a, b) => a.title.localeCompare(b.title, 'nl')),
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
