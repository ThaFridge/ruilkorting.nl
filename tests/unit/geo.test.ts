import { describe, expect, it } from 'vitest';
import { distanceBand, haversineKm } from '../../src/lib/geo.ts';

describe('haversineKm', () => {
  it('is zero for identical points', () => {
    expect(haversineKm({ lat: 52, lon: 5 }, { lat: 52, lon: 5 })).toBe(0);
  });
  it('is symmetric', () => {
    const a = { lat: 50.891, lon: 5.975 };
    const b = { lat: 52.379, lon: 4.9 };
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 9);
  });
  it('Heerlen – Amsterdam Centraal is roughly 180 km as the crow flies', () => {
    const km = haversineKm({ lat: 50.891, lon: 5.975 }, { lat: 52.379, lon: 4.9 });
    expect(km).toBeGreaterThan(175);
    expect(km).toBeLessThan(185);
  });
});

describe('distanceBand', () => {
  it('maps to PRODUCT_SPEC bands', () => {
    expect(distanceBand(0.4)).toBe('<1 km');
    expect(distanceBand(1)).toBe('<5 km');
    expect(distanceBand(4.99)).toBe('<5 km');
    expect(distanceBand(10)).toBe('<25 km');
    expect(distanceBand(25)).toBe('25+ km');
  });
});
