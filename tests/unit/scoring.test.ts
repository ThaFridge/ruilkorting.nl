import { describe, expect, it } from 'vitest';
import { SCORE_WEIGHTS, bestOutingScore } from '../../src/lib/scoring.ts';

const base = { travelMinutes: 60, featured: false, seasonMatch: false, confidence: 'low' as const };

describe('bestOutingScore', () => {
  it('prefers shorter travel times, all else equal', () => {
    expect(bestOutingScore({ ...base, travelMinutes: 30 })).toBeGreaterThan(bestOutingScore({ ...base, travelMinutes: 120 }));
  });
  it('caps the travel penalty at 180 minutes', () => {
    expect(bestOutingScore({ ...base, travelMinutes: 180 })).toBe(bestOutingScore({ ...base, travelMinutes: 400 }));
  });
  it('rewards season match and featured content', () => {
    expect(bestOutingScore({ ...base, seasonMatch: true }) - bestOutingScore(base)).toBe(SCORE_WEIGHTS.season);
    expect(bestOutingScore({ ...base, featured: true }) - bestOutingScore(base)).toBe(SCORE_WEIGHTS.featured);
  });
  it('only rewards budget when a price is known and within budget', () => {
    expect(bestOutingScore({ ...base, budgetEuro: 50 })).toBe(bestOutingScore(base));
    expect(bestOutingScore({ ...base, budgetEuro: 50, priceEuro: 40 }) - bestOutingScore(base)).toBe(SCORE_WEIGHTS.withinBudget);
    expect(bestOutingScore({ ...base, budgetEuro: 50, priceEuro: 60 })).toBe(bestOutingScore(base));
  });
  it('has no affiliate input at all', () => {
    expect(Object.keys(SCORE_WEIGHTS)).not.toContain('affiliate');
  });
});
