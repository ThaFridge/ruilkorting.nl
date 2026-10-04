import { z } from 'astro/zod';
import { coordinates, lastMile, price, provenance, slug } from './common.ts';

/**
 * Frontmatter schemas shared by the Astro content layer (src/content.config.ts,
 * which upgrades the slug fields to typed `reference()`s) and the pipeline,
 * which runs in plain Node without `astro:content`.
 */

export const destinationType = z.enum([
  'stad',
  'attractie',
  'pretpark',
  'museum',
  'wellness',
  'natuur',
  'strand',
  'evenement',
  'festival',
  'kerstmarkt',
  'hotel',
  'restaurant',
]);
export type DestinationType = z.infer<typeof destinationType>;

export const cityFrontmatter = coordinates.extend({
  title: z.string().min(1),
  province: z.string().min(1),
  station: slug,
  summary: z.string().min(20).max(300),
});

export const destinationFrontmatter = z.object({
  title: z.string().min(1),
  type: destinationType,
  city: slug,
  nearest_station: slug,
  last_mile: lastMile,
  location: coordinates,
  categories: z.array(slug).min(1),
  seasons: z.array(slug).default([]),
  summary: z.string().min(20).max(300),
  highlights: z.array(z.string().min(1)).max(6).default([]),
  price: price.optional(),
  website: z.url().optional(),
  sources: z.array(provenance).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});
export type DestinationFrontmatter = z.infer<typeof destinationFrontmatter>;
