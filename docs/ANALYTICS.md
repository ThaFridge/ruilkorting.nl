# Analytics

## Approach

Client-side, privacy-friendly analytics only; no server events exist. Candidates: Plausible, GoatCounter, Umami (self-hosted is not possible on Pages, so a hosted plan would be used). **Pricing, data location and cookie-consent implications must be verified before choosing**; record in `API_SOURCES.md`.

## Events

- searches (departure station, date type, budget band, filters) — as custom events without personal data
- result impressions (sampled)
- destination views (page views)
- offer views
- affiliate outbound clicks (custom event with provider and offer id)
- campaigns and landing pages (UTM)

## Privacy

Comply with GDPR/AVG and the Dutch cookie rules. Prefer a cookieless provider so no consent banner is needed; if the chosen provider sets cookies, add consent handling.

## Business questions

- Which searches are popular?
- Which destinations convert?
- Which categories monetize?
- Which providers perform?
- Which landing pages generate commercial clicks?
