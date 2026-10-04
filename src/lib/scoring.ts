/**
 * "Beste uitje" score (PRODUCT_SPEC.md §3). Deliberately independent of
 * affiliate commission. Pure function; weights are explicit so they can be
 * tuned and tested. Higher is better.
 */
export type ScoreInput = {
  travelMinutes: number;
  /** Editorially featured destination. */
  featured: boolean;
  /** Destination's seasons include the season of the chosen travel date. */
  seasonMatch: boolean;
  /** Data confidence of the reachability estimate. */
  confidence: 'low' | 'medium' | 'high';
  /** Known price in euro, if any. */
  priceEuro?: number | null;
  /** User budget in euro, if any. */
  budgetEuro?: number | null;
};

export const SCORE_WEIGHTS = {
  travel: 50, // 0..50 points, linear from 0 min (50) to 180 min (0)
  featured: 15,
  season: 20,
  confidence: { low: 0, medium: 5, high: 10 },
  withinBudget: 5,
} as const;

export function bestOutingScore(input: ScoreInput): number {
  const travel = Math.max(0, 1 - Math.min(input.travelMinutes, 180) / 180) * SCORE_WEIGHTS.travel;
  const featured = input.featured ? SCORE_WEIGHTS.featured : 0;
  const season = input.seasonMatch ? SCORE_WEIGHTS.season : 0;
  const confidence = SCORE_WEIGHTS.confidence[input.confidence];
  const withinBudget =
    input.priceEuro != null && input.budgetEuro != null && input.priceEuro <= input.budgetEuro
      ? SCORE_WEIGHTS.withinBudget
      : 0;
  return Math.round((travel + featured + season + confidence + withinBudget) * 10) / 10;
}
