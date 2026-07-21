/** Plain "R1 234.00" for PDFs — avoids the non-breaking space that
 *  toLocaleString emits, which renders as tofu in react-pdf's built-in fonts. */
export function zar(v: number): string {
  const n = Number(v || 0).toFixed(2);
  const [whole, cents] = n.split(".");
  return `R${whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}.${cents}`;
}
