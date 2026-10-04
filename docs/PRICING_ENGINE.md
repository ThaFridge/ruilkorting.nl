# Pricing Engine

## Goal

Normalize prices from different providers into a consistent internal representation, refreshed at build time.

## Price types

- from_price
- fixed
- promotional
- affiliate
- estimated
- unavailable

`live` does not exist in a static build. Every displayed price shows its status and its `retrieved_at` date.

## Pipeline (`pipeline-prices.yml`, daily)

Provider adapters in `pipeline/pricing/` and `pipeline/affiliates/` fetch feeds with Actions secrets, normalize to the price record in `DATA_MODEL.md` and write `data/generated/offers/<provider>.json`. Expired offers (`valid_until` in the past) are dropped at build time.

## Indicative trip price

Where component prices exist, the page may show an indicative combination (train + bus + activity + hotel), labelled "indicatief, prijzen van <date>". Never imply a guaranteed total.

## Train ticket prices

Whether any NS/NDOV source provides ticket prices under terms that allow display is **unverified**. Until verified, train prices are shown as `estimated` from a transparent distance/zone heuristic, or omitted. Record the decision in `API_SOURCES.md`.

## Ranking

Price can influence ranking but must not be the only factor. Scoring lives in `src/lib/scoring/` and is unit-tested.
