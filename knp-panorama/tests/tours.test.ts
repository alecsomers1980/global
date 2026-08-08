import { describe, it, expect } from 'vitest';
import { TOURS, getTour, getToursByPillar } from '@/data/tours';
import { DESTINATIONS } from '@/data/taxonomy';

describe('TOURS', () => {
  it('contains the five real experiences', () => {
    expect(TOURS).toHaveLength(5);
  });

  it('has unique slugs', () => {
    const slugs = TOURS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('references only known destinations', () => {
    const known = new Set(DESTINATIONS.map((d) => d.slug));
    for (const tour of TOURS) expect(known.has(tour.destination)).toBe(true);
  });

  it('never mentions a price', () => {
    const blob = JSON.stringify(TOURS);
    expect(blob).not.toMatch(/R\s?\d|ZAR|\$|price/i);
  });

  it('gives every tour a hero image and a summary', () => {
    for (const tour of TOURS) {
      expect(tour.heroImage).toMatch(/^\/images\//);
      expect(tour.summary.length).toBeGreaterThan(40);
    }
  });

  it('looks tours up by slug', () => {
    expect(getTour('full-day-safari-kruger-national-park')?.pillar).toBe('safari');
    expect(getTour('nope')).toBeUndefined();
  });

  it('filters by pillar', () => {
    expect(getToursByPillar('safari')).toHaveLength(2);
    expect(getToursByPillar('tours')).toHaveLength(2);
    expect(getToursByPillar('transfers')).toHaveLength(1);
  });

  it('gives every tour at least one highlight and one inclusion', () => {
    for (const tour of TOURS) {
      expect(tour.highlights.length).toBeGreaterThan(0);
      expect(tour.included.length).toBeGreaterThan(0);
    }
  });
});
