# Testing Strategy

## Unit (Vitest)

Pure domain logic in `src/lib/` and `pipeline/`:
- scoring
- price normalization
- reachability computation (on a mini GTFS fixture)
- deal scoring
- distance calculations
- schema validation of content and generated data

## Build

- `astro check` (types) and `astro build` must pass on every PR.
- Content validation: dangling references and invalid frontmatter fail the build.
- Size budget check: fail if `dist/` or any reachability JSON exceeds the budgets in ARCHITECTURE.md.
- Link check over `dist/` (internal links, sitemap entries).

## Pipeline

Provider adapters are tested with recorded fixtures; no network in CI tests. A scheduled smoke job may hit real providers and only alerts.

## Browser (Playwright, against `dist/` served locally)

Critical journeys:
- mobile search: choose station, date, budget → results
- destination discovery page
- offer click (asserts tracking parameters and `rel`)
- filtering and sort modes

## Post-deploy

Smoke requests against the live site (see DEPLOYMENT.md).

## Regression

Every production bug should result in a regression test when practical.
