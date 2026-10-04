# ADR-001 — Static site on GitHub Pages instead of Laravel on a VPS

| | |
|---|---|
| Status | **Accepted for prototyping** — Product Owner instructed "begin met bouwen, ik wil GitHub Pages gaan gebruiken om te prototypen" on 2026-10-04. Option A is in effect. Items still open are listed below. |
| Date | 2026-10-04 |
| Decider | Product Owner |
| Repository | https://github.com/ThaFridge/railkorting.nl |

## Context

The original plan was a Laravel 13 modular monolith (PHP-FPM, PostgreSQL, Redis, Supervisor, queues, scheduler) on a Debian VPS.

The Product Owner wants to build and host the site on **GitHub Pages**, using the existing repository `ThaFridge/railkorting.nl` (public, one initial commit with a README, Pages already enabled) as the codebase.

Facts verified on 2026-10-04 (GitHub docs):

- GitHub Pages is "a static site hosting service that takes HTML, CSS, and JavaScript files straight from a repository". It does not run PHP, Node, a database or any server process.
- Limits: published site max 1 GB, soft bandwidth limit 100 GB/month, deployment timeout 10 minutes, soft limit of 10 builds/hour (the build limit does not apply when publishing via a custom GitHub Actions workflow).
- Usage rule: Pages is "not intended for or allowed to be used as a free web-hosting service to run your online business, e-commerce site, or any other website that is primarily directed at either facilitating commercial transactions or providing commercial software as a service".
- GitHub Actions minutes are free and unlimited for public repositories. Scheduled workflows run at most every 5 minutes, may be delayed under load, and are disabled automatically after 60 days without repository activity.
- The repository is public and already has Pages enabled with the legacy "deploy from branch `main`, path `/`" source at https://thafridge.github.io/railkorting.nl/. This must be switched to the "GitHub Actions" source.

## Consequence 1 — Laravel cannot be the runtime

Laravel is a server-side PHP framework. GitHub Pages cannot execute it. The two cannot be combined in one deployment. Options considered:

| Option | Description | Verdict |
|---|---|---|
| A. Static site generator on GitHub Pages | Build all pages at build time in GitHub Actions; all data precomputed to JSON; no server | **Recommended** |
| B. Laravel on VPS, GitHub Pages for docs only | Keeps the old plan; Pages adds nothing | Rejected: does not meet the PO's goal |
| C. Static frontend on Pages + Laravel API on a VPS | Two deployments, CORS, server costs and ops remain | Rejected for V1: all the VPS burden, little of the benefit |
| D. Static frontend + serverless functions (Cloudflare Workers etc.) | Enables live lookups and click redirects | Deferred: only if a V1 feature proves impossible statically |

## Decision

Build Railkorting.nl as a **fully static site** with **Astro** (static output, no SSR), **Tailwind CSS**, content in **Markdown/JSON content collections**, and a **GitHub Actions data pipeline** that fetches and precomputes external data before every build. Deploy with a custom GitHub Actions workflow (official `withastro/action`) to GitHub Pages.

Why Astro and not Jekyll (the Pages default), Eleventy, Hugo or Next.js:

- Astro produces zero-JS HTML by default and allows small interactive islands (search form, filters) in plain TypeScript. Good for mobile performance and SEO.
- Content collections give typed, validated Markdown/JSON content, which matches the provenance and validation requirements in `docs/DATA_MODEL.md`.
- Node 24 and npm are already installed locally; Jekyll would need a Ruby toolchain. The pipeline scripts are TypeScript, so one language for pipeline and site.
- Next.js/Nuxt are heavier and their value (SSR, API routes) is exactly what Pages cannot run.
- Eleventy and Hugo are valid alternatives. Astro is chosen for its typed content layer; this is a judgment call, not a hard requirement.

## Consequence 2 — what changes in the product plan

Nothing in the V1 **feature list** is removed, but several features change **form**. The Product Owner must confirm each item marked ⚠.

| Area | Laravel plan | Static plan |
|---|---|---|
| Routing / reachability | Live route API per search | Precomputed reachability table (station → destination travel time and transfers) computed from the NDOV GTFS feed in a scheduled workflow, published as JSON per departure station. ⚠ No door-to-door live journey planner in V1; results show "ca. 1u20, 1 overstap" and link out to NS/9292 for the live plan |
| Realtime status | Realtime where available | ⚠ Not in V1 (no server). Possible later via option D |
| Prices | Live + cached prices | Prices refreshed at build time (daily or more often per source). Every price carries `retrieved_at` and is labelled `from_price`, `indicative` or `promotional`; never `live` |
| Search | Server-side PostgreSQL search | Client-side search over prebuilt JSON indexes (destinations, categories, seasonal collections) plus the per-station reachability JSON. Must stay small enough for mobile |
| Admin backend | Laravel admin UI with approvals | ⚠ Git-based editing: content lives as Markdown/JSON; changes are pull requests; approval = PR review/merge. Optional later: a Git-backed CMS UI (e.g. Decap CMS) if hand-editing becomes a burden |
| AI administration | AI writes proposals to DB, human approves in UI | AI (Claude Code or an Actions job) opens pull requests with proposals; provenance stored in frontmatter; approval = merge; rollback = git revert |
| Affiliate click tracking | Server-side redirect + DB log | Client-side: outbound links carry Daisycon tracking parameters; click events sent to the analytics provider. ⚠ No first-party click log in V1 |
| Analytics | Server events + privacy-friendly tool | Client-side privacy-friendly tool only (Plausible, GoatCounter, Umami or similar; pricing/terms to be verified) |
| Accounts, alerts | Not in V1 | Unchanged; also technically impossible statically, so V2 would need option D |
| Queues / scheduler | Redis queues, Laravel scheduler | GitHub Actions `schedule` workflows |
| Database | PostgreSQL | JSON/Markdown files in the repo + generated JSON artifacts. No database server |
| Secrets | `.env` on server | GitHub Actions secrets; never shipped to the browser |

## Consequence 3 — risks the Product Owner must accept or mitigate

1. **Commercial-use rule (highest risk).** Railkorting.nl earns from affiliate links. GitHub's rule targets sites "primarily directed at facilitating commercial transactions" and SaaS. A content/discovery site with outbound affiliate links is a grey area, not a clear violation, but GitHub decides. Mitigation: keep the site editorial (content first, offers secondary), and keep the deployment portable. **Fallback: Cloudflare Pages** (free plan verified 2026-10-04: 500 builds/month, 1 concurrent build, 20,000 files/site, 25 MiB/file). The same Astro build and the same GitHub repository deploy there with a different workflow step. Netlify and Vercel are comparable fallbacks. The architecture must not depend on anything Pages-specific.
2. **Repository name.** The repository is `railkorting.nl`, the product is `Railkorting.nl`. Renaming on GitHub is cheap (old URLs redirect). Decision needed before the first release, because the Pages URL and `base` path follow the repository name.
3. **Public repository.** Unlimited free Actions minutes require the repo to stay public. Everything in it, including content and pipeline code, is public. Secrets stay in Actions secrets. Any licensed data that may not be redistributed must not be committed; it must be fetched at build time and only derived data published.
4. **Size and build budget.** Max 1 GB published, 10-minute deploy. Programmatic SEO pages and per-station JSON must be budgeted (target: < 200 MB site, build < 6 minutes). Pages that do not add unique value are not generated.
5. **Freshness.** Data is as fresh as the last successful build. Scheduled workflows can be delayed. The UI must always show the data timestamp.
6. **Project-site base path.** Until a custom domain is set, URLs live under `/railkorting.nl/`. The SEO URL scheme in `docs/SEO_STRATEGY.md` assumes a custom domain (`railkorting.nl`) with HTTPS enforced; configure it before indexing.
7. **Scheduled workflows stop after 60 days of inactivity.** Add a keep-alive commit or monitor; document in `docs/DEPLOYMENT.md`.

## Open decisions for the Product Owner

- [x] Approve option A (static Astro site on GitHub Pages) with Cloudflare Pages as fallback — approved implicitly for the prototype on 2026-10-04 ("begin met bouwen").
- [ ] Accept the ⚠ changes in form listed above for V1 (the prototype implements them; explicit confirmation still wanted before launch).
- [ ] Rename the repository or keep `railkorting.nl` (prototype uses `/railkorting.nl/` as base path).
- [ ] Confirm the custom domain `railkorting.nl` will be pointed at GitHub Pages.
- [ ] Confirm a Git-based editorial workflow (PRs) is acceptable as the V1 "admin backend".

## Archived: former target stack

Debian VPS · Nginx · PHP 8.5 · Laravel 13 · Blade · Livewire 4 · Tailwind CSS · PostgreSQL · Redis · Supervisor · Laravel Scheduler. Superseded by this ADR.
