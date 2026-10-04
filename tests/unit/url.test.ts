import { describe, expect, it } from 'vitest';
import { withBase } from '../../src/lib/url.ts';

describe('withBase', () => {
  it('prefixes the project base path', () => {
    expect(withBase('/bestemmingen/valkenburg/', '/railkorting.nl')).toBe('/railkorting.nl/bestemmingen/valkenburg/');
    expect(withBase('bestemmingen/', '/railkorting.nl/')).toBe('/railkorting.nl/bestemmingen/');
  });
  it('works for the root base on the custom domain', () => {
    expect(withBase('/bestemmingen/', '/')).toBe('/bestemmingen/');
    expect(withBase('/', '/')).toBe('/');
  });
});
