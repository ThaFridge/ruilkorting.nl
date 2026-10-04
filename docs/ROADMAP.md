# Roadmap

## Phase 1 — done 2026-10-04
Architecture and requirements. ADR-001 accepted for prototyping.

## Phase 2 — done 2026-10-04 (except custom domain)
Static foundation: Astro project, Tailwind, content collections and schemas, CI workflow, deploy workflow to GitHub Pages (Actions source). Custom domain pending PO decision.

## Phase 3 — seed done 2026-10-04
Locations, cities, stations and destinations as content collections; first destination pages. 36 stations, 14 cities, 15 destinations seeded; content expansion continues alongside later phases.

## Interim — ADR-002
Distance-based reachability estimate as placeholder so the search prototype works before phase 4. Replaced by phase 4.

## Phase 4
Transport pipeline: verified GTFS source, reachability computation, per-station JSON, size budgets.

## Phase 5
Client-side search: departure station, date, budget, category, max travel time; three sort modes.

## Phase 6
Pricing and offers pipeline; deal scoring; price status labels.

## Phase 7
Events, festivals and activities (content + daily pipeline).

## Phase 8
Hotels and affiliate integrations (Daisycon first).

## Phase 9
AI-assisted editorial workflow (PR-based proposals, provenance, branch protection).

## Phase 10
SEO (sitemaps, structured data, programmatic pages within budget) and SEA landing pages.

## Phase 11
UX/performance optimization (Lighthouse mobile budgets, JSON size budgets).

## Phase 12
QA/security (Playwright journeys, CSP, dependency policy).

## Phase 13
Production launch on railkorting.nl; monitoring of build health and bandwidth.

## V2
- accounts, favorites, saved searches, price alerts, personalization (require a runtime → ADR-001 option D)
- historical prices (possible statically: keep daily snapshots)
- Belgium, Germany (additional GTFS feeds)
