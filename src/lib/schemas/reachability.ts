import { z } from 'astro/zod';
import { slug } from './common.ts';

export const REACHABILITY_SCHEMA_VERSION = 1;

export const reachabilityItem = z.object({
  destination: slug,
  travel_minutes: z.number().int().min(0),
  /** Unknown (null) for estimates; filled by the GTFS pipeline later. */
  transfers: z.number().int().min(0).nullable(),
  distance_km: z.number().nonnegative(),
  method: z.enum(['estimate-haversine', 'gtfs']),
  confidence: z.enum(['low', 'medium', 'high']),
});
export type ReachabilityItem = z.infer<typeof reachabilityItem>;

/** One file per departure station: data/generated/reachability/<station>.json (DATA_MODEL.md header format). */
export const reachabilityFile = z.object({
  generated_at: z.iso.datetime(),
  source: z.string(),
  schema_version: z.literal(REACHABILITY_SCHEMA_VERSION),
  station: slug,
  /** Representative travel day the computation is valid for. */
  travel_date: z.iso.date(),
  items: z.array(reachabilityItem),
});
export type ReachabilityFile = z.infer<typeof reachabilityFile>;
