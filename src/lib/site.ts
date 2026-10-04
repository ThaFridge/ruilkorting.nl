/** Site-wide constants and build-time flags. */
export const SITE_NAME = 'Railkorting.nl';
export const SITE_TAGLINE = 'Treinuitjes vanaf jouw station';
export const SITE_DESCRIPTION =
  'Geef je vertrekstation, datum en budget op en ontdek wat je met trein en bus kunt doen in Nederland.';

/** Only the custom domain may be indexed (SEO_STRATEGY.md); project URL is noindex. */
export const INDEXABLE = (import.meta.env.INDEXABLE ?? process.env.INDEXABLE) === 'true';

export const SORT_MODES = ['beste', 'snelste', 'goedkoopste'] as const;
export type SortMode = (typeof SORT_MODES)[number];

export const BUDGET_OPTIONS = [25, 50, 75, 100, 150] as const;
export const MAX_TRAVEL_OPTIONS = [60, 90, 120, 180] as const;
