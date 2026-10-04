# API and Data Sources

This document is a decision register, not a list of assumed integrations.

## Candidate transport sources

### NDOV Loket
Potential source for Dutch public transport datasets and feeds.

Verify before implementation:
- current datasets
- GTFS availability
- GTFS-RT/realtime availability
- commercial usage rights
- attribution
- rate limits
- update frequency

### NS API
Potential source for NS transport information.

Verify:
- current API products
- registration
- subscription requirements
- quotas
- commercial terms
- timetable/disruption/station data
- price/ticket capabilities

### 9292
Potential route/departure API.

Treat as commercial unless current terms prove otherwise.

Verify:
- Reisadvies API
- Vertrektijden API
- pricing
- licensing
- quotas
- commercial use
- redistribution rights

## Hosting and platform (verified)

### GitHub Pages — checked 2026-10-04
- URL: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- Capabilities: static HTML/CSS/JS only; custom domain; enforced HTTPS; publish from branch or Actions workflow
- Limits: 1 GB site, 100 GB/month soft bandwidth, 10 builds/hour soft (not with Actions workflow), 10-minute deploy timeout
- Terms: not allowed as free hosting for an online business, e-commerce site or SaaS; affiliate content site is a grey area (ADR-001 risk 1)
- Decision: V1 host, with Cloudflare Pages as fallback

### GitHub Actions — checked 2026-10-04
- Minutes free and unlimited for public repositories
- Scheduled workflows: minimum interval 5 minutes, may be delayed, disabled after 60 days without activity
- Decision: runs CI, deploy and all data pipelines

### Cloudflare Pages (fallback) — checked 2026-10-04
- URL: https://developers.cloudflare.com/pages/platform/limits/
- Free plan: 500 builds/month, 1 concurrent build, 20,000 files/site, 25 MiB/file
- Decision: fallback host; not in use

## Transport data (partially verified)

### NDOV GTFS — checked 2026-10-04 (secondary sources only)
- Community sources report a nationwide GTFS feed (train, bus, tram, metro, some ferries) derived from NDOV data under CC0
- **To verify on official NDOV channels:** download URL, update frequency, attribution expectations, whether realtime (GTFS-RT) is included
- Decision: primary candidate for the reachability pipeline; implementation blocked until verified

## Rule

Never assume an API is free, commercially usable or suitable for redistribution.

Every provider decision must be recorded with:
- URL
- date checked
- capabilities
- license
- pricing
- limitations
- decision

## Price data

Transport routing and ticket pricing are separate concerns.

A route API does not automatically imply ticket-price availability.

## Static-site constraint

Every source must be usable **at build time from GitHub Actions**. Sources that only work per request from a server (realtime APIs, per-user quotas) are out of scope for V1 unless ADR-001 option D is approved.

## Still to decide and record

- Analytics provider (Plausible / GoatCounter / Umami hosted): pricing, data location, cookies
- Daisycon: feed access, programme approvals, feed format, redistribution terms
- LLM provider for scheduled AI jobs: cost, terms
- Train ticket price source: availability and display terms
