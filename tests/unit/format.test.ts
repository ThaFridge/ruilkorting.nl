import { describe, expect, it } from 'vitest';
import { formatMinutes, priceLabel } from '../../src/lib/format.ts';

describe('formatMinutes', () => {
  it('formats minutes under an hour', () => {
    expect(formatMinutes(45)).toBe('45 min');
  });
  it('formats whole hours and hours with minutes', () => {
    expect(formatMinutes(60)).toBe('1u');
    expect(formatMinutes(80)).toBe('1u20');
    expect(formatMinutes(125)).toBe('2u05');
  });
});

describe('priceLabel', () => {
  it('never claims a live price and falls back to "Prijs volgt"', () => {
    expect(priceLabel(undefined).text).toBe('Prijs volgt');
    expect(priceLabel({ currency: 'EUR', price_type: 'unavailable' }).text).toBe('Prijs volgt');
  });
  it('labels a from-price with its retrieval date', () => {
    const label = priceLabel({ amount: 12.5, currency: 'EUR', price_type: 'from_price', retrieved_at: '2026-10-03' });
    expect(label.text).toMatch(/^vanaf €\s?12,50$/);
    expect(label.detail).toMatch(/prijs van .*3 okt/);
  });
  it('marks estimates as such', () => {
    expect(priceLabel({ amount: 20, currency: 'EUR', price_type: 'estimated' })).toEqual({ text: expect.stringMatching(/^ca\. €\s?20$/), detail: 'schatting' });
  });
});
