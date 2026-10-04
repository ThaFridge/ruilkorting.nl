# Architecture

## Principle

A static site with a build-time data pipeline. No server. Everything that would have been a request-time computation becomes a build-time computation that produces HTML or JSON.

Reference decision: `decisions/ADR-001-static-site-on-github-pages.md`.

## Three layers

```
┌──────────────────────────────────────────────────────────────┐
│ 1. Data pipeline (GitHub Actions, scheduled + on push)        │
│    fetch providers → normalize → precompute → data/generated/ │
├──────────────────────────────────────────────────────────────┤
│ 2. Site build (Astro, GitHub Actions)                         │
│    content/ + data/generated/ → HTML + JSON indexes → dist/   │
├──────────────────────────────────────────────────────────────┤
│ 3. Browser (GitHub Pages)                                     │
│    static HTML + small TS islands reading site-local JSON     │
└──────────────────────────────────────────────────────────────┘
```

Hard rule: **Browser → static files on the same site only.** The browser never calls a provider API and never sees a credential. Provider calls happen in layer 1 with GitHub Actions secrets.

## Logical modules

Same domain modules as before; each is now a folder of pipeline code, content schema and page templates rather than a Laravel module.

- Search (client-side)
- Locations, cities, stations
- Destinations, attractions, activities
- Transport (reachability precomputation)
- Pricing
- Deals
- Affiliates
- Events, festivals
- Hotels, restaurants
- Seasonal content
- SEO
- Analytics
- AI (PR-based proposals)
- Editorial workflow (replaces "Administration")

## Proposed repository layout

```
/
├── .github/workflows/
│   ├── deploy.yml            build + deploy to Pages on push to main
│   ├── pipeline-gtfs.yml     scheduled: NDOV GTFS → reachability JSON
│   ├── pipeline-prices.yml   scheduled: price/offer refresh
│   ├── pipeline-events.yml   scheduled: event discovery
│   └── ci.yml                lint, typecheck, unit tests, build, link check
├── content/                  editorial content (Markdown/JSON, Astro collections)
│   ├── destinations/
│   ├── attractions/
│   ├── events/
│   ├── seasons/
│   └── ...
├── data/
│   ├── reference/            hand-maintained reference data (stations list, categories)
│   └── generated/            pipeline output committed by Actions (see DATA_MODEL.md)
├── pipeline/                 TypeScript scripts run in Actions
│   ├── providers/            one adapter per external source
│   ├── transport/            GTFS parsing, reachability computation
│   ├── pricing/
│   └── affiliates/
├── src/                      Astro site
│   ├── pages/
│   ├── layouts/
│   ├── components/
│   ├── islands/              interactive TS (search, filters)
│   ├── content.config.ts     collection schemas (zod), built on src/lib/schemas/
│   └── lib/                  domain logic shared by pipeline, build and islands (geo, scoring, formatting, schemas)
├── scripts/                  build checks (size budget, internal links) run in `postbuild`
├── tests/
│   ├── unit/                 Vitest: scoring, normalization, distance
│   └── e2e/                  Playwright: critical journeys against dist/
└── docs/
```

## Domain logic placement

Scoring, price normalization, route normalization and deal scoring live in `src/lib/` as pure TypeScript with no I/O, so the same code runs in the pipeline, in the build and (where needed) in the browser, and is unit-tested once.

## Search

Client-side. The build emits:

- `/data/index/destinations.json` — compact list of destinations with city, station, categories, seasons, known price, last mile, slug
- `/data/reachability/<station-slug>.json` — travel time and transfers from one departure station to each destination (copied from `data/generated/reachability/` and validated at build time)
- `/data/index/stations.json` — station names for the departure-point selector

(The URL prefix is `/data/`, not `/_data/`: Astro excludes underscore-prefixed routes. The JSON is emitted by static endpoints in `src/pages/data/`.)

The search island loads the station index, then the one reachability file for the chosen departure station, then filters/sorts in the browser. Budget: each reachability file < 100 KB gzipped; destination index < 300 KB gzipped. If budgets are exceeded, split by region before considering option D of ADR-001.

## Caching

Browser caching is handled by GitHub Pages' default headers. Pipeline caching uses `actions/cache` for downloaded feeds. Stale data is never relabelled as fresh; every generated file carries `generated_at`.

## Configuration

Provider endpoints, feature flags and budgets are configured in `pipeline/config.ts` and `astro.config.mjs`, read from environment variables in Actions. No hardcoded credentials, no `.env` committed.

## Portability

The build must run with `npm ci && npm run pipeline && npm run build` on any CI. Nothing may depend on GitHub Pages specifically except the deploy step, so the Cloudflare Pages fallback in ADR-001 remains a one-file change.
