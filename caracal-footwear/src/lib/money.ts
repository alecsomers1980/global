/**
 * All money in this codebase is integer cents. Never floats.
 *
 * Formatting deliberately avoids Intl.NumberFormat: the en-ZA locale emits
 * U+00A0 (non-breaking space) as its thousands separator, which renders as a
 * tofu box in several display faces. The Everest flyer build hit exactly this.
 */

export function randToCents(rand: number): number {
  return Math.round(rand * 100);
}

export function centsToRand(cents: number): number {
  return cents / 100;
}

export function formatZAR(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const remainder = abs % 100;

  // Regular U+0020 space as the thousands separator, not U+00A0.
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const body =
    remainder === 0
      ? `R${grouped}`
      : `R${grouped}.${String(remainder).padStart(2, '0')}`;

  return negative ? `-${body}` : body;
}
