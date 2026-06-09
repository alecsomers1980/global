import type { VehicleSummary } from './fetchVehicles'

export function slugify(str: string): string {
    return String(str || '')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
}

// Matches Everest's algorithm in everest-motoring/src/utils/url/vehicleUrl.js
// so the URLs the campaign generator emits resolve to real product pages.
export function computeVehicleSlug(v: Pick<VehicleSummary, 'id' | 'year' | 'make' | 'model' | 'slug'>): string {
    if (v.slug) return v.slug
    const shortId = String(v.id || '').split('-')[0]
    const base = slugify(`${v.year ?? ''}-${v.make ?? ''}-${v.model ?? ''}`)
    return shortId ? `${base}-${shortId}` : base
}
