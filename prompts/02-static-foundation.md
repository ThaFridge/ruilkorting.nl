# Static Foundation

Only execute after ADR-001 is approved by the Product Owner.

Build the static foundation according to:
- `/docs/decisions/ADR-001-static-site-on-github-pages.md`
- `/docs/ARCHITECTURE.md`
- `/docs/DATA_MODEL.md`
- `/docs/DEPLOYMENT.md`
- `/docs/SECURITY.md`
- `/docs/TESTING.md`

Before implementation:
1. inspect current repository state (repository name, Pages source setting, custom domain)
2. verify Astro, Node and `withastro/action` versions
3. scaffold the Astro project with Tailwind, sitemap integration and content collections
4. define zod schemas for stations, cities, destinations, categories, seasons
5. add `ci.yml` (typecheck, unit tests, build, link check, size budget) and `deploy.yml` (Pages via Actions)
6. switch the Pages source from "branch" to "GitHub Actions"
7. run the build locally and in CI
8. document decisions

Do not build transport/provider pipelines in this step.
