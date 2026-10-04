# Data Model

There is no database server. Data lives in three places:

| Kind | Location | Owner | Example |
|---|---|---|---|
| Editorial content | `content/<collection>/*.md` or `*.json` | humans + AI via PR | destination page text, seasonal collections |
| Reference data | `data/reference/*.json` | humans | station list, categories, seasons |
| Generated data | `data/generated/**` | pipeline (Actions) | reachability tables, offers, prices, event feeds |

All collections are typed with zod schemas in `src/content.config.ts`. The build fails on invalid data. This replaces database constraints.

## Core entities

Same domain as before:

- cities
- locations
- stations
- destinations
- attractions
- activities
- events
- festivals
- hotels
- restaurants
- reachability (replaces routes/route_legs)
- transport_sources
- prices
- offers
- affiliate_providers
- affiliate_programs
- seasons
- categories
- media
- sources
- seo_metadata

Dropped because they assumed a server: `data_updates`, `ai_changes`, `approvals`, `audit_logs`, `analytics_events`. Their purpose is covered by git history, pull requests and the analytics provider (see AI_SYSTEM.md, ANALYTICS.md).

## Identity and relations

- Every entity has a stable `id` (slug) used as filename and URL segment.
- Relations are by `id` reference in frontmatter (`city: "valkenburg"`, `nearest_station: "valkenburg"`). The build resolves and validates references; a dangling reference fails the build.

## Location strategy

Locations carry latitude, longitude, address, municipality/city, country, source, source identifier. Stations are a separate collection because reachability is computed per station.

## Provenance

Externally sourced records retain:
- `source`
- `source_id`
- `source_url`
- `retrieved_at`
- `valid_from`
- `valid_until`
- `confidence` where useful
- `licence` (so redistribution rules can be checked at build time)

## Pricing

Price records retain amount, currency, `price_type` (`from_price`, `fixed`, `promotional`, `affiliate`, `estimated`, `unavailable`), travel date, source, `retrieved_at`, validity. `live` is **not** a valid price type in a static build. Never label stale data as current.

## Generated data format

- JSON, one file per logical unit (per station, per provider, per day where relevant)
- Every file has a header: `{ "generated_at": ISO-8601, "source": ..., "schema_version": n, "items": [...] }`
- Files are committed by the pipeline so builds are reproducible and rollbackable
- Large intermediate inputs (raw GTFS zip) are **not** committed; they are cached with `actions/cache`

## Audit

Important mutations are commits. Each commit or PR must state actor (human or bot), source and, for AI proposals, the prompt reference (see AI_SYSTEM.md). Rollback = revert.

## Indexing

Build-time indexes are emitted as JSON for the client-side search: by slug, category, season, city, coordinates, price band and reachability. See ARCHITECTURE.md for size budgets.

Do not finalize schemas until the Data Architect has reviewed the domain relationships.
