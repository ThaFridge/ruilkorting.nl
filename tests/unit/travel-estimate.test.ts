import { describe, expect, it } from 'vitest';
import { ESTIMATE_PARAMS, estimateRailMinutes, estimateTotalMinutes } from '../../src/lib/travel-estimate.ts';

describe('estimateRailMinutes', () => {
  it('returns 0 for the same station', () => {
    expect(estimateRailMinutes(0)).toBe(0);
  });
  it('adds the fixed allowance for short hops', () => {
    expect(estimateRailMinutes(10)).toBe(Math.round((10 * ESTIMATE_PARAMS.detourFactor) / 70 * 60 + 8));
  });
  it('is monotonic in distance', () => {
    expect(estimateRailMinutes(50)).toBeLessThan(estimateRailMinutes(100));
  });
  it('gives a plausible Heerlen – Amsterdam estimate (2u30 – 3u30)', () => {
    const m = estimateRailMinutes(180);
    expect(m).toBeGreaterThanOrEqual(150);
    expect(m).toBeLessThanOrEqual(210);
  });
  it('rejects negative or non-finite distances', () => {
    expect(() => estimateRailMinutes(-1)).toThrow(RangeError);
    expect(() => estimateRailMinutes(Number.NaN)).toThrow(RangeError);
  });
});

describe('estimateTotalMinutes', () => {
  it('adds the last mile', () => {
    expect(estimateTotalMinutes(0, 25)).toBe(25);
    expect(estimateTotalMinutes(100, 10)).toBe(estimateRailMinutes(100) + 10);
  });
  it('ignores negative last-mile values', () => {
    expect(estimateTotalMinutes(0, -5)).toBe(0);
  });
});
