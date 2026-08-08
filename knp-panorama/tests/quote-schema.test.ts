import { describe, it, expect } from 'vitest';
import { validateQuote, isBot, MIN_SUBMIT_MS } from '@/lib/quote-schema';

const valid = {
  name: 'Thandi Mokoena',
  email: 'thandi@example.co.za',
  phone: '0821234567',
  experience: 'full-day-safari-kruger-national-park',
  destination: 'kruger-national-park',
  comfort: 'premium',
  dateFrom: '2026-09-01',
  dateTo: '2026-09-03',
  adults: 2,
  children: 1,
  message: 'We would like a private vehicle if possible.',
};

describe('validateQuote', () => {
  it('accepts a complete payload', () => {
    expect(validateQuote(valid).ok).toBe(true);
  });

  it('requires name, email and phone', () => {
    const r = validateQuote({ ...valid, name: '', email: '', phone: '' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.name).toBeDefined();
      expect(r.errors.email).toBeDefined();
      expect(r.errors.phone).toBeDefined();
    }
  });

  it('rejects a malformed email', () => {
    const r = validateQuote({ ...valid, email: 'not-an-email' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.email).toMatch(/valid email/i);
  });

  it('accepts a contact-variant payload with no trip fields', () => {
    const r = validateQuote({
      name: 'Sipho',
      email: 'sipho@example.com',
      phone: '0721234567',
      message: 'General question about your tours.',
    });
    expect(r.ok).toBe(true);
  });

  it('rejects adults below one when supplied', () => {
    expect(validateQuote({ ...valid, adults: 0 }).ok).toBe(false);
  });

  it('rejects a departure date before the arrival date', () => {
    const r = validateQuote({ ...valid, dateFrom: '2026-09-05', dateTo: '2026-09-01' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.dateTo).toBeDefined();
  });

  it('trims whitespace off the name', () => {
    const r = validateQuote({ ...valid, name: '  Thandi  ' });
    if (r.ok) expect(r.data.name).toBe('Thandi');
  });

  it('rejects a non-object payload', () => {
    expect(validateQuote(null).ok).toBe(false);
    expect(validateQuote('nonsense').ok).toBe(false);
  });
});

describe('isBot', () => {
  it('flags a filled honeypot', () => {
    expect(isBot({ website: 'http://spam.example', renderedAt: 0 }, MIN_SUBMIT_MS + 1000)).toBe(true);
  });

  it('flags a submission faster than the threshold', () => {
    expect(isBot({ website: '', renderedAt: 10_000 }, 10_000 + MIN_SUBMIT_MS - 1)).toBe(true);
  });

  it('allows an empty honeypot after a human delay', () => {
    expect(isBot({ website: '', renderedAt: 10_000 }, 10_000 + MIN_SUBMIT_MS + 1)).toBe(false);
  });

  it('treats a missing timestamp as a bot', () => {
    expect(isBot({ website: '' }, 50_000)).toBe(true);
  });
});
