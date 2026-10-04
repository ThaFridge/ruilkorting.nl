# Deployment

## Target

GitHub Pages, published from a **GitHub Actions workflow** (not from a branch). Repository: `ThaFridge/railkorting.nl` (public).

Current state (2026-10-04): Pages source switched from the legacy branch source to **GitHub Actions** (`build_type: workflow`) via the REST API. `deploy.yml` publishes on every push to `main`. Live URL: https://thafridge.github.io/railkorting.nl/ (noindex until the custom domain is live).

## Workflows

| Workflow | Trigger | Does |
|---|---|---|
| `ci.yml` | push to non-`main` branches, pull_request, manual | `npm audit`, `astro check`, Vitest, `npm run build` (= pipeline → build → size budget → link check) |
| `deploy.yml` | push to `main`, manual | `withastro/action@v6` (check + test + build) → `actions/deploy-pages@v5` → post-deploy smoke test (homepage, a destination, sitemap, one reachability JSON, stations index). Permissions: `contents: read`, `pages: write`, `id-token: write` |
| `pipeline-gtfs.yml` | schedule (weekly + manual) | download NDOV GTFS, compute reachability, commit `data/generated/reachability/*` |
| `pipeline-prices.yml` | schedule (daily) | refresh offers/prices, commit `data/generated/offers/*` |
| `pipeline-events.yml` | schedule (daily) | discover/refresh events, open PR for new events |

Pipeline workflows commit generated data to `main`, which triggers `deploy.yml`. Use a bot commit message prefix (`data:`) and `[skip ci]` where a redeploy is not needed.

## Environment and secrets

- All provider credentials are **GitHub Actions secrets**.
- Build-time configuration via workflow `env:`: `SITE_URL`, `BASE_PATH`, `INDEXABLE` (see `.env.example`). Switching to the custom domain = changing these three values in `deploy.yml` and adding the `CNAME`.
- No `.env` in the repository; `.env.example` documents local variable names only.

## Domain and HTTPS

- Target custom domain: `railkorting.nl` (+ `www` redirect). DNS: `A`/`AAAA` records to GitHub Pages IPs or `CNAME` for `www`, per GitHub docs at the time of setup.
- Enforce HTTPS in Pages settings (already enabled on the default URL).
- Until the custom domain is live, Astro `base` must equal `/<repository-name>/`. After the domain is live, `base` becomes `/`. Do not submit sitemaps to search engines before the domain is live.

## Limits to respect (verified 2026-10-04)

- Site ≤ 1 GB (internal target ≤ 200 MB)
- Deploy job ≤ 10 minutes (internal target ≤ 6 minutes)
- Soft bandwidth limit 100 GB/month; monitor via analytics page views × average page weight
- Scheduled workflows are disabled after 60 days without repository activity: the daily pipeline commit counts as activity, but add a monthly `workflow_dispatch` check to the operations checklist

## Rollback

Every deploy is a commit on `main`. Rollback = `git revert` and push. Generated data can be rolled back the same way because it is committed.

## Health checks

After deploy, the `smoke` job in `deploy.yml` fetches the homepage, one destination page, `sitemap-index.xml`, one reachability JSON and the stations index and asserts HTTP 200 and the presence of `generated_at`.

## Fallback host

If GitHub Pages becomes unavailable or its usage rules are a problem (see ADR-001 risk 1), deploy the same `dist/` to Cloudflare Pages. Keep the build host-agnostic.

## Never

- Never commit secrets.
- Never commit raw third-party data whose licence forbids redistribution; commit only derived, allowed data.
