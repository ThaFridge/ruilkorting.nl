import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { cityFrontmatter, destinationFrontmatter } from './lib/schemas/content.ts';
import { category, season, station } from './lib/schemas/reference.ts';

/**
 * Content collections (DATA_MODEL.md). The build fails on invalid data or a
 * dangling reference; this replaces database constraints.
 */

const stations = defineCollection({
  loader: file('./data/reference/stations.json'),
  schema: station,
});

const categories = defineCollection({
  loader: file('./data/reference/categories.json'),
  schema: category,
});

const seasons = defineCollection({
  loader: file('./data/reference/seasons.json'),
  schema: season,
});

const cities = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/cities' }),
  schema: cityFrontmatter.extend({
    station: reference('stations'),
  }),
});

const destinations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/destinations' }),
  schema: destinationFrontmatter.extend({
    city: reference('cities'),
    nearest_station: reference('stations'),
    categories: z.array(reference('categories')).min(1),
    seasons: z.array(reference('seasons')).default([]),
  }),
});

export const collections = { stations, categories, seasons, cities, destinations };
