/**
 * Placeholder reachability estimate used until the GTFS pipeline (ROADMAP phase 4)
 * replaces it. Every result produced here is labelled `estimate-haversine` with
 * confidence `low`; the UI must show it as "geschat".
 *
 * Model: rail distance ≈ straight-line distance × detour factor; average
 * effective speed including stops; plus a fixed boarding/transfer allowance.
 * Pure function, unit-tested, no I/O.
 */
export const ESTIMATE_PARAMS = {
  /** Rail lines are not straight; typical network detour factor. */
  detourFactor: 1.25,
  /** Effective average speed including intermediate stops (km/h). */
  averageSpeedKmh: 70,
  /** Fixed allowance for boarding and waiting (minutes). */
  fixedMinutes: 8,
} as const;

export function estimateRailMinutes(distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    throw new RangeError('distanceKm must be a finite non-negative number');
  }
  if (distanceKm === 0) return 0;
  const railKm = distanceKm * ESTIMATE_PARAMS.detourFactor;
  const minutes = (railKm / ESTIMATE_PARAMS.averageSpeedKmh) * 60 + ESTIMATE_PARAMS.fixedMinutes;
  return Math.round(minutes);
}

/** Total door-to-door estimate: rail leg plus the destination's last mile from its nearest station. */
export function estimateTotalMinutes(distanceKm: number, lastMileMinutes = 0): number {
  return estimateRailMinutes(distanceKm) + Math.max(0, Math.round(lastMileMinutes));
}
