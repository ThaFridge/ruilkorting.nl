/**
 * Data pipeline entry point (ARCHITECTURE.md layer 1).
 * Runs in GitHub Actions and locally via `npm run pipeline`; never in the browser.
 *
 * Steps are additive: later phases add GTFS, prices, events. Each step writes
 * only to data/generated/** in the header format from DATA_MODEL.md.
 */
import { runReachabilityEstimate } from './reachability/estimate.ts';

const started = performance.now();
const result = await runReachabilityEstimate();
const ms = Math.round(performance.now() - started);
console.log(
  `[pipeline] reachability (estimate): ${result.stations} stations × ${result.destinations} bestemmingen in ${ms} ms`,
);
