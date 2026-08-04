import { describe, it, expect } from 'vitest';
import { formatZAR, randToCents, centsToRand } from './money';

describe('money', () => {
  it('formats whole rand with no decimals', () => {
    expect(formatZAR(55000)).toBe('R550');
  });

  it('formats non-whole rand with two decimals', () => {
    expect(formatZAR(55050)).toBe('R550.50');
  });

  it('groups thousands with a regular space, not U+00A0', () => {
    expect(formatZAR(155000)).toBe('R1 550');
    expect(formatZAR(155000)).not.toContain(' ');
  });

  it('groups millions', () => {
    expect(formatZAR(123456789)).toBe('R1 234 567.89');
  });

  it('formats zero', () => {
    expect(formatZAR(0)).toBe('R0');
  });

  it('formats negative amounts for refunds', () => {
    expect(formatZAR(-55000)).toBe('-R550');
  });

  it('pads a single-digit cents remainder', () => {
    expect(formatZAR(55005)).toBe('R550.05');
  });

  it('converts two-decimal rand to cents without drift', () => {
    expect(randToCents(550.55)).toBe(55055);
    expect(randToCents(0.1)).toBe(10);
    expect(randToCents(0.07)).toBe(7);
    expect(randToCents(1999.99)).toBe(199999);
  });

  it('cannot rescue a third decimal place, and must not pretend to', () => {
    // The double nearest 1.005 is 1.00499999999999989..., so this rounds DOWN.
    // No epsilon or toFixed trick recovers the intent -- the precision is gone
    // before the function is called. ZAR has no sub-cent unit, so a third
    // decimal is never a legitimate input. Callers that accept typed prices
    // must validate to two decimals BEFORE reaching this boundary.
    expect(randToCents(1.005)).toBe(100);
  });

  it('converts cents back to rand', () => {
    expect(centsToRand(55055)).toBe(550.55);
  });
});
