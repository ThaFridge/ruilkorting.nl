/**
 * Prefix an absolute site path with the configured base path.
 * Works for base "/" (custom domain) and "/railkorting.nl" (project URL).
 */
export function withBase(path: string, base: string = import.meta.env.BASE_URL): string {
  const b = base.replace(/\/+$/, '');
  const p = path.replace(/^\/+/, '');
  return `${b}/${p}`;
}

/**
 * Outbound link to a live journey planner (ADR-001: no live planning in V1).
 * Deep-link parameters are not used until the planner's URL scheme is verified
 * and recorded in docs/API_SOURCES.md.
 */
export const PLANNER_URL = 'https://www.ns.nl/reisplanner';
