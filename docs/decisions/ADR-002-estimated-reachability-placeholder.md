# ADR-002 — Distance-based reachability estimate as placeholder until the GTFS pipeline exists

| | |
|---|---|
| Status | **Accepted for the prototype** (2026-10-04); to be superseded by the phase 4 transport pipeline |
| Date | 2026-10-04 |
| Decider | Development team, under the Product Owner's instruction to start prototyping |
| Affects | Transport Agent, Data Architect, Frontend Architect, UX Agent |

## Context

The Product Owner wants a working prototype on GitHub Pages now. The core interaction (station + date + budget → results sorted by travel time) needs a reachability table per station. The real source (NDOV GTFS, `docs/API_SOURCES.md`) is not yet verified and `prompts/02-static-foundation.md` explicitly excludes building transport pipelines in phase 2.

## Decision

Until the GTFS pipeline exists, `npm run pipeline` generates `data/generated/reachability/<station>.json` with a **transparent estimate**:

- rail minutes = great-circle distance between departure station and the destination's nearest station × 1.25 (network detour) ÷ 70 km/h + 8 min fixed allowance
- total minutes = rail minutes + the destination's editorial `last_mile.minutes`
- `transfers: null` (unknown), `method: "estimate-haversine"`, `confidence: "low"`
- file header `source: "estimate-haversine"`, `travel_date` = next Saturday, `generated_at`

The file format is the final format from `docs/DATA_MODEL.md`; only the values are provisional. Parameters live in `src/lib/travel-estimate.ts` and are unit-tested.

## UI obligations

- Every estimated travel time is shown as "ca. 1u20" with the label "reistijd geschat voor <datum>" and an explicit notice that no timetable data is used yet.
- Every page with estimates links to a live planner for the real journey.
- When `source` no longer starts with `estimate`, the UI automatically switches to "berekend" and shows transfers.

## Consequences

- The search, sorting and per-station pages can be built and tested now against the final data contract.
- Estimates will be wrong for routes with poor rail geometry (e.g. across the IJsselmeer, Zeeland). Acceptable for a prototype that is `noindex`; **not acceptable for launch**. Phase 4 must replace this before the custom domain goes live.
- No external data, no licence questions, no network in CI.
