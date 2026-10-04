# Railkorting.nl

Railkorting.nl is a Dutch train-outings discovery, deal and inspiration platform.

## Core proposition

> Geef je vertrekpunt, datum en budget en Railkorting.nl zoekt uit wat je met trein + bus kunt doen.

The platform combines:
- OV reachability
- destinations
- activities
- attractions
- events and festivals
- wellness
- hotels
- restaurants
- seasonal inspiration
- prices and deals
- affiliate offers
- SEO/SEA
- AI-assisted data management

## Technology

Target stack (see `docs/decisions/ADR-001-static-site-on-github-pages.md`):

- **Hosting:** GitHub Pages (static files only, deployed by a GitHub Actions workflow)
- **Repository:** https://github.com/ThaFridge/railkorting.nl (public)
- **Site generator:** Astro (static output, no SSR)
- **Styling:** Tailwind CSS
- **Interactivity:** small islands of vanilla TypeScript; no SPA framework unless justified
- **Content:** Markdown + JSON in the repository (Astro content collections)
- **Data pipeline:** GitHub Actions scheduled workflows (Node/TypeScript scripts) that fetch, normalize and precompute data into JSON before the build
- **Search:** client-side over prebuilt JSON indexes
- **Analytics:** privacy-friendly client-side analytics (provider to be verified)
- **Secrets:** GitHub Actions secrets only; the browser never talks to a provider API

There is **no application server, no PHP, no database server and no queue**. Everything dynamic happens at build time.

The former Laravel/VPS plan is archived in `docs/decisions/ADR-001-static-site-on-github-pages.md`.

## Project status

**Phase 2 (static foundation) is built and deploys as a prototype** to https://thafridge.github.io/railkorting.nl/ on every push to `main`.

What works today:

- Astro 7 + Tailwind 4 static site with typed content collections (stations, categories, seasons, cities, destinations)
- 15 seed destinations and 36 departure stations (Netherlands only)
- Homepage with the primary search, seasonal inspiration and category navigation
- Client-side search (`/zoeken/`) over prebuilt JSON: departure station, date, budget, category, max travel time; three sort modes
- Per-station pages (`/treinuitjes/vanuit/<station>/`), destination, city, category and season pages
- Build-time pipeline that writes per-station reachability JSON (**distance-based estimates**, see `docs/decisions/ADR-002-estimated-reachability-placeholder.md`)
- CI (typecheck, unit tests, build, size budgets, link check) and deploy workflow with post-deploy smoke test

Not yet: real timetable data (GTFS), prices/offers, events pipeline, affiliates, analytics, custom domain. See `docs/ROADMAP.md`.

## Development

```bash
npm ci
npm run pipeline   # writes data/generated/reachability/*.json
npm run dev        # http://localhost:4321/railkorting.nl/
npm test           # Vitest unit tests
npm run check      # astro check (types)
npm run build      # pipeline → astro build → size budget + link check
```

Build-time configuration: `SITE_URL`, `BASE_PATH`, `INDEXABLE` (see `.env.example`). Defaults target the project URL; the site is `noindex` until `INDEXABLE=true` on the custom domain.

## First steps

1. Read `docs/decisions/ADR-001-static-site-on-github-pages.md`.
2. Read `docs/PRODUCT_SPEC.md`.
3. Read `docs/ARCHITECTURE.md`.
4. Read `docs/DATA_MODEL.md`.
5. Read `docs/API_SOURCES.md`.
6. Read the relevant agent file in `/agents`.
7. Phase 2 (`prompts/02-static-foundation.md`) is done; continue with `prompts/03-transport-engine.md`.
8. Do not invent external API capabilities. Verify them first.
