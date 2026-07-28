import type { CastRole } from '@/lib/types'

const GENDER_LABEL: Record<CastRole['gender'], string> = {
  male: 'Male',
  female: 'Female',
  any: 'Any gender',
}

export function Characters({ roles }: { roles: CastRole[] }) {
  if (roles.length === 0) return null
  return (
    <section>
      <h2 className="font-display text-3xl">Characters</h2>
      <ul className="mt-6 divide-y divide-rule border-t border-rule">
        {roles.map((role) => (
          <li key={role.id} className="grid gap-2 py-4 md:grid-cols-[200px_1fr]">
            <div>
              <p className="font-medium">{role.name}</p>
              <p className="text-xs uppercase tracking-wide text-muted">
                {GENDER_LABEL[role.gender]}
                {role.ageRange ? ` · ${role.ageRange}` : ''}
              </p>
            </div>
            {role.description && <p className="text-muted">{role.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
