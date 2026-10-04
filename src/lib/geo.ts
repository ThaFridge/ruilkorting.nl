import type { Coordinates } from './schemas/common.ts';

const EARTH_RADIUS_KM = 6371.0088;

const toRad = (deg: number): number => (deg * Math.PI) / 180;

/** Great-circle distance in kilometres (haversine). Pure, no I/O. */
export function haversineKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export type DistanceBand = '<1 km' | '<5 km' | '<25 km' | '25+ km';

/** Distance bands from PRODUCT_SPEC.md §6. */
export function distanceBand(km: number): DistanceBand {
  if (km < 1) return '<1 km';
  if (km < 5) return '<5 km';
  if (km < 25) return '<25 km';
  return '25+ km';
}
