import { Check, X } from 'lucide-react';

interface InclusionListProps {
  included: string[];
  excluded: string[];
}

export function InclusionList({ included, excluded }: InclusionListProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h3>Included</h3>
        {included.length > 0 ? (
          <ul className="space-y-2">
            {included.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-text/70 normal-case"
              >
                <Check size={16} className="mt-0.5 shrink-0 text-green-600" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text/40 normal-case">
            Ask us when you request a quote.
          </p>
        )}
      </div>

      <div>
        <h3>Not Included</h3>
        {excluded.length > 0 ? (
          <ul className="space-y-2">
            {excluded.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-text/70 normal-case"
              >
                <X size={16} className="mt-0.5 shrink-0 text-text/40" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text/40 normal-case">
            Ask us when you request a quote.
          </p>
        )}
      </div>
    </div>
  );
}
