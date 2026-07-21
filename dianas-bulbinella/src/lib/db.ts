/** PostgREST caps every response at 1000 rows and does it SILENTLY — you get
 *  1000 rows and no error. With 4,626 orders and 1,885 customers imported from
 *  the old site, any unbounded select is now quietly wrong.
 *
 *  Use fetchAll() for anything that must see every matching row (spend totals,
 *  the monthly report, the reminder cron). Screens that show a page of results
 *  should use .range() and stay bounded instead. */

const PAGE = 1000;

type Pageable<T> = {
  range: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>;
};

/**
 * Page through a PostgREST query until it's exhausted.
 *
 *   const orders = await fetchAll((from, to) =>
 *     supabase.from("orders").select("total").in("status", PAID).range(from, to)
 *   );
 *
 * The builder is called once per page, so it must construct a fresh query each
 * time rather than reusing one (Supabase query builders are single-use).
 */
export async function fetchAll<T>(
  build: (from: number, to: number) => Pageable<T> | PromiseLike<{ data: T[] | null; error: any }>
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const q = build(from, from + PAGE - 1);
    const { data, error } = await (q as PromiseLike<{ data: T[] | null; error: any }>);
    if (error) throw error;
    const rows = data ?? [];
    out.push(...rows);
    if (rows.length < PAGE) return out;
  }
}
