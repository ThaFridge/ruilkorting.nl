import { z } from 'astro/zod';
import { coordinates, slug } from './common.ts';

export const station = coordinates.extend({
  id: slug,
  name: z.string().min(1),
  /** NS station abbreviation where known (e.g. "hrl"). Optional until verified against an official list. */
  code: z.string().regex(/^[a-z]{2,5}$/).optional(),
  province: z.string().min(1),
  /** Larger stations are listed first in the departure autocomplete. */
  major: z.boolean().default(false),
});
export type Station = z.infer<typeof station>;
export const stations = z.array(station);

export const category = z.object({
  id: slug,
  name: z.string().min(1),
  description: z.string().min(1),
  /** Short emoji/icon for navigation tiles. */
  icon: z.string().min(1),
  order: z.number().int(),
});
export type Category = z.infer<typeof category>;
export const categories = z.array(category);

export const season = z.object({
  id: slug,
  name: z.string().min(1),
  description: z.string().min(1),
  kind: z.enum(['season', 'holiday', 'event-period']),
  /** Months (1-12) in which this season is relevant; used to pick homepage inspiration. */
  months: z.array(z.number().int().min(1).max(12)).min(1),
  order: z.number().int(),
});
export type Season = z.infer<typeof season>;
export const seasons = z.array(season);
