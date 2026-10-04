# Transport Engine

## Objective

Determine practical public-transport reachability from a user's departure station to each destination, **precomputed at build time** and published as static JSON.

Reference: ADR-001. There is no live journey planner in V1.

## Source

Primary candidate: the NDOV GTFS feed for the Netherlands (train, bus, tram, metro, some ferries). Reported licence: CC0. **Verify on the official NDOV channels before use** and record the result in `API_SOURCES.md` (URL, date checked, update frequency, attribution).

## Pipeline (`pipeline-gtfs.yml`, weekly)

1. Download the current GTFS zip (cached with `actions/cache`, not committed).
2. Select a representative travel day per reachability table (e.g. next Saturday and next Tuesday, 08:00–12:00 departure window). Store the day in the output header.
3. For each departure station in `data/reference/stations.json`, compute for each destination's nearest stop:
   - best duration (minutes)
   - number of transfers
   - modes used (train, bus, …)
   - walking distance at the destination end
   - departures per hour in the window (frequency indicator)
4. Reject routes with no public-transport option. Car, taxi and air are never part of a route.
5. Write `data/generated/reachability/<station-slug>.json` and `data/generated/reachability/meta.json`.

Algorithm: a RAPTOR or CSA-style earliest-arrival computation over the GTFS timetable, implemented in TypeScript in `pipeline/transport/`. Use an existing library only after its licence is verified. Fixtures in `tests/fixtures/gtfs-mini/`.

## Output per destination

```json
{ "destination": "thermae-2000", "minutes": 82, "transfers": 1, "modes": ["train","bus"],
  "walk_m": 450, "departures_per_hour": 2, "travel_day": "2026-10-10" }
```

## Hard constraints

- Required car/taxi/air travel makes a destination unreachable for that station.
- The UI must state that times are indicative for the computed travel day and link to a live planner (NS, 9292) for the actual journey.

## Budgets

- One reachability file per departure station, ≤ 100 KB gzipped. If exceeded, limit destinations per file to those within the maximum supported travel time (e.g. 180 min).
- Weekly recomputation must finish within the Actions job limit; start with the stations in the reference list (initially the ~400 NS stations), add bus hubs later.

## Future

- Realtime status and door-to-door planning need a runtime; see ADR-001 option D.
- International GTFS feeds can be added as additional pipeline inputs without changing the output format.
