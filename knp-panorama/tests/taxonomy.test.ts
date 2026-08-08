import { describe, it, expect } from 'vitest';
import { DESTINATIONS, COMFORT_TIERS, PILLARS } from '@/data/taxonomy';

describe('taxonomy', () => {
  it('has the eight destinations from the old site', () => {
    expect(DESTINATIONS).toHaveLength(8);
    expect(DESTINATIONS.map((d) => d.slug)).toContain('panorama-route');
  });

  it('has the three comfort tiers', () => {
    expect(COMFORT_TIERS.map((c) => c.label)).toEqual([
      'Affordable Comfort',
      'Premium Comfort',
      'Luxurious Experience',
    ]);
  });

  it('gives every destination an image and a label', () => {
    for (const d of DESTINATIONS) {
      expect(d.image).toMatch(/^\/images\/destinations\//);
      expect(d.label.length).toBeGreaterThan(2);
    }
  });

  it('has four pillars', () => {
    expect(PILLARS.map((p) => p.slug)).toEqual([
      'safari',
      'tours',
      'transfers',
      'accommodation',
    ]);
  });
});
