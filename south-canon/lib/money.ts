/**
 * Formats an amount as South African rand.
 * en-ZA emits U+00A0 / U+202F as the group separator, which renders as tofu in
 * some PDF and OG-image pipelines — so it is normalised to a plain space.
 */
export function formatZar(amount: number | null | undefined): string | null {
  if (amount === null || amount === undefined) return null
  const formatted = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(amount)
  return formatted
    .replace(/^([^\d]*)[\u00a0\u202f]/, '$1')
    .replace(/[\u00a0\u202f]/g, ' ')
    .replace(/^ZAR\s*/, 'R')
    .trim()
}
