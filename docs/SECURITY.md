# Security

## Threat model (static site)

There is no server, session, login or database. The remaining surfaces are: the repository and its CI, the browser-side scripts, third-party scripts, and the data pipeline's provider credentials.

## Repository and CI

- Branch protection on `main`: PR required for `content/` and `src/`, status checks required, no force-push.
- Actions secrets for all credentials; secrets are never echoed in logs; `pull_request` workflows from forks get no secrets.
- Pin third-party actions to a major version from trusted publishers; review Dependabot updates.
- Workflow permissions default to `contents: read`; the deploy and pipeline jobs request only what they need.
- The repository is public: never commit credentials, personal data or non-redistributable data.

## Site

- HTTPS enforced.
- Strict Content Security Policy via `<meta http-equiv>` (Pages cannot set custom headers): self-hosted assets only, analytics domain allow-listed.
- No inline third-party scripts other than the verified analytics snippet.
- Outbound affiliate links: `rel="sponsored noopener"`.
- Output escaping is handled by Astro templates; raw HTML injection only from trusted content with a documented reason.
- Dependency updates via Dependabot; `npm audit` in CI.

## AI

AI runs only through PRs (see AI_SYSTEM.md). No bot has write access to `content/` on `main`.

## Providers

- Credentials only in Actions.
- Timeouts, bounded retries, rate limiting in pipeline adapters.
- Logging without secrets.

## Not applicable (no server)

CSRF, authorization policies, admin 2FA, SSH hardening, firewall, backups of a database. Backups are the git history on GitHub plus an optional mirror.
