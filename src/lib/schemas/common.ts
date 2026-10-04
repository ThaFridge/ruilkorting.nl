import { z } from 'astro/zod';

/** Stable slug used as id, filename and URL segment (DATA_MODEL.md). */
export const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug: alleen kleine letters, cijfers en enkele streepjes');

export const coordinates = z.object({
  lat: z.number().min(50.5).max(53.7),
  lon: z.number().min(3.2).max(7.3),
});
export type Coordinates = z.infer<typeof coordinates>;

/** Price types allowed in a static build. `live` is deliberately absent (DATA_MODEL.md). */
export const priceType = z.enum([
  'from_price',
  'fixed',
  'promotional',
  'affiliate',
  'estimated',
  'unavailable',
]);
export type PriceType = z.infer<typeof priceType>;

export const price = z.object({
  amount: z.number().nonnegative().optional(),
  currency: z.literal('EUR').default('EUR'),
  price_type: priceType,
  retrieved_at: z.iso.date().optional(),
  source: z.string().optional(),
  source_url: z.url().optional(),
  note: z.string().optional(),
});
export type Price = z.infer<typeof price>;

/** Provenance for externally sourced records (DATA_MODEL.md). */
export const provenance = z.object({
  source: z.string(),
  source_id: z.string().optional(),
  source_url: z.url().optional(),
  retrieved_at: z.iso.date(),
  valid_from: z.iso.date().optional(),
  valid_until: z.iso.date().optional(),
  confidence: z.enum(['low', 'medium', 'high']).optional(),
  licence: z.string().optional(),
});

export const lastMileMode = z.enum(['walk', 'bus', 'tram', 'metro', 'ferry', 'train']);
export type LastMileMode = z.infer<typeof lastMileMode>;

export const lastMile = z.object({
  mode: lastMileMode,
  minutes: z.number().int().min(0).max(120),
  note: z.string().optional(),
});
export type LastMile = z.infer<typeof lastMile>;
