import { formatZar } from '@/lib/money'
import type { LicenceTier } from '@/lib/types'

export function LicensingPanel({ tiers }: { tiers: LicenceTier[] }) {
  if (tiers.length === 0) return null
  return (
    <section>
      <h2 className="font-display text-3xl">Licensing</h2>
      <table className="mt-6 w-full border-t border-rule text-left">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-muted">
            <th className="py-3 font-normal">Tier</th>
            <th className="py-3 font-normal">Who it is for</th>
            <th className="py-3 font-normal text-right">From</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rule">
          {tiers.map((t) => (
            <tr key={t.id}>
              <td className="py-4 align-top font-medium">{t.label}</td>
              <td className="py-4 align-top text-muted">{t.description}</td>
              <td className="py-4 align-top text-right whitespace-nowrap">
                {formatZar(t.minFee)
                  ? `${formatZar(t.minFee)} per performance`
                  : <span className="text-muted">On application</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-sm text-muted">
        Fees shown are indicative minimums and are not a quotation. Your licence fee depends on
        venue capacity, ticket price and the number of performances.
      </p>
    </section>
  )
}
