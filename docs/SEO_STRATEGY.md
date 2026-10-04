# SEO Strategy

## Architecture

SEO is built into the build. A fully static site is favourable: every URL is a real HTML file with full content, no client rendering needed for indexing.

Prerequisites (ADR-001): custom domain `railkorting.nl` configured and Astro `base` set to `/` before any sitemap is submitted. Under the default project URL the site lives under `/<repo-name>/` and must be `noindex`.

Build-time outputs: `sitemap-index.xml` (Astro sitemap integration), `robots.txt`, canonical tags, JSON-LD per page type. Redirects are limited to what static hosting allows (HTML meta refresh pages); plan URL changes carefully.

Support:
- crawlable URLs
- unique titles
- meta descriptions
- canonical URLs
- XML sitemap
- robots.txt
- breadcrumbs
- structured data
- Open Graph
- internal linking
- index/noindex controls
- redirects
- event lifecycle
- faceted-navigation controls

## URL examples

- /bestemmingen/amsterdam
- /bestemmingen/valkenburg
- /bestemmingen/thermae-2000
- /festivals/awakenings
- /evenementen/cultura-nova
- /pretparken/efteling
- /kerstmarkten/aachen
- /treinuitjes/vanuit/heerlen

## Programmatic SEO

Only create pages that have real user value and sufficiently unique content. Every generated page costs build time and site size (ADR-001 budgets); the build must enforce a page budget per template (e.g. `/treinuitjes/vanuit/<station>` only for stations with ≥ N reachable destinations).

## Mobile

Mobile pages must contain equivalent meaningful content, metadata and structured data to desktop versions.

## Event pages

Use appropriate Event structured data when event data is sufficiently accurate.
