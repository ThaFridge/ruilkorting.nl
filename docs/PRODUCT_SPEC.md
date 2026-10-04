# Product Specification

## 1. Vision

Railkorting.nl helps people discover affordable and enjoyable outings that are reachable by public transport.

The user can start with a departure point rather than a known destination.

## 2. Primary search

Inputs:
- departure point
- destination (optional)
- activity/category (optional)
- date or period
- budget
- maximum travel time
- country/region
- party size where relevant

Example:
`Heerlen + zaterdag + max €50 + alles`

## 3. Ranking

Support:
- Cheapest
- Best outing
- Shortest travel time

The "best outing" score must not be controlled solely by affiliate commission.

Potential scoring factors:
- price
- travel time
- attractiveness
- relevance
- seasonality
- popularity
- availability
- data confidence
- user constraints

## 4. Reachability

Hard rule:
A destination must be practically reachable by train and/or bus. Taxi, car or plane cannot be a required part of the route.

## 5. Destination model

Supported concepts:
- location
- city
- station
- destination
- attraction
- activity
- event
- festival
- hotel
- restaurant

## 6. Discovery funnel

A destination page should lead to relevant:
- nearby destinations
- activities
- attractions
- hotels
- restaurants
- events
- festivals
- seasonal content
- related cities

Distance bands can include:
- <1 km
- <5 km
- <25 km

## 7. Seasonal discovery

Seasonal content is core functionality:
- spring
- summer
- autumn
- winter
- Christmas
- carnival
- school holidays
- public holidays
- date-specific events

## 8. V1

Netherlands only.

Includes:
- search
- cities
- destinations
- stations
- activities
- attractions
- events
- festivals
- wellness
- hotels
- restaurants
- OV routes
- pricing
- deals
- affiliate providers
- seasonal content
- SEO
- analytics
- AI-assisted management
- admin backend

No accounts in V1.
No price alerts in V1.

### 8.1 Form of V1 features on a static site (ADR-001, awaiting PO confirmation)

The feature list above is unchanged. Because the site is static (GitHub Pages), these features change in form:

- **OV routes** become precomputed reachability (travel time, transfers, modes) per departure station for a representative travel day, with an outbound link to a live planner. No live door-to-door planning, no realtime.
- **Pricing** is refreshed at build time and always labelled with its date and type; no live prices.
- **Admin backend** is a Git-based editorial workflow: content files + pull requests + review. No admin UI in V1.
- **AI-assisted management** produces pull requests, not database changes.
- **Analytics** is client-side only; affiliate clicks are tracked as analytics events, not in a first-party log.

## 9. V2

Potential:
- accounts
- favorites
- saved searches
- price alerts
- personalization
- historical prices
- Belgium
- Germany

## 10. Product owner rule

The Product Owner owns scope and business decisions. Technical agents may recommend but must not silently change product direction.
