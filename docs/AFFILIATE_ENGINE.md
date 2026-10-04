# Affiliate Engine

## Principle

Affiliate providers are pluggable adapters in `pipeline/affiliates/`.

Railkorting offer -> provider -> affiliate program -> advertiser/product

## V1

Primary network: Daisycon (feed access, programme approval and feed format to be verified and recorded in `API_SOURCES.md`).

Potential: Booking.com, other hotel providers, activity/ticket providers.

## Data

Store per offer: provider, program, advertiser, product identifier, deeplink, tracking parameters, price, commission data when available, `retrieved_at`, validity. Generated into `data/generated/offers/`.

## Links and click tracking (static)

- Outbound links are rendered at build time with the network's tracking parameters. The browser never calls an affiliate API.
- Clicks are recorded as outbound-link events in the analytics provider (see ANALYTICS.md). There is no first-party click log in V1 (ADR-001 ⚠).
- Use `rel="sponsored noopener"` on affiliate links.
- Optional: a static `/uit/<offer-id>/` redirect page per offer gives a stable internal URL and makes link changes a data update rather than a content change. It adds pages; count it in the size budget.

## Ranking

Commission must not be a hidden ranking override. The deal score is documented in `DEAL_ENGINE.md` and implemented in `src/lib/scoring/`.

## Security

Affiliate credentials live only in GitHub Actions secrets. Feed files that may not be redistributed are not committed; only derived offer records are.
