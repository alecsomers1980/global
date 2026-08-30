/**
 * Format rands.
 *
 * Deliberately not Intl.NumberFormat("en-ZA") — that emits a non-breaking
 * space as the thousands separator, which renders as tofu in several webfonts.
 */
export function rands(amount: number): string {
  const [whole, cents] = amount.toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `R${grouped}.${cents}`;
}
