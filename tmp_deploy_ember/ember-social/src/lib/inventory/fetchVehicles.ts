import { createClient } from '@supabase/supabase-js'

export interface VehicleSummary {
    id: string
    make: string
    model: string
    year: number | string
    colour: string
    price: number | string
    mileage: number | string
    transmission: string
    fuel_type: string
    description: string
    main_image_url: string
    gallery_urls: string[]
    features: string[]
    slug: string
    social_shared_at: string | null
}

/**
 * Fetches vehicles from a client's own Supabase instance.
 * Tolerates ALL errors — logs and returns [] so campaign generation falls back gracefully.
 */
export async function fetchVehiclesForWorkspace(args: {
    clientSupabaseUrl: string
    clientServiceKey: string
    table?: string
    fields?: string
    filter?: Record<string, string>
    limit?: number
    notSharedWithinDays?: number
}): Promise<VehicleSummary[]> {
    try {
        const supabase = createClient(args.clientSupabaseUrl, args.clientServiceKey, {
            auth: { persistSession: false }
        })

        const table = args.table || 'cars'
        const limit = args.limit || 40
        // NOTE: `slug` is computed by computeVehicleSlug — it's not a column on
        // Everest's `cars` table. Asking PostgREST for it would 42703 the whole query.
        const fieldsStr = args.fields || 'id,make,model,year,colour,price,mileage,transmission,fuel_type,description,main_image_url,gallery_urls,features,social_shared_at'

        // Build the query, preferring never-shared vehicles first
        let query = supabase
            .from(table)
            .select(fieldsStr)
            .order('social_shared_at', { ascending: true, nullsFirst: true })
            .limit(limit)

        // Apply filters e.g. { "status": "eq.available" }
        const filter = args.filter || {}
        for (const [column, expr] of Object.entries(filter)) {
            const dot = expr.indexOf('.')
            const op = dot > 0 ? expr.slice(0, dot) : 'eq'
            const val = dot > 0 ? expr.slice(dot + 1) : expr
            query = query.filter(column, op as any, val)
        }

        // Exclude vehicles shared within the window
        if (args.notSharedWithinDays && args.notSharedWithinDays > 0) {
            const cutoff = new Date()
            cutoff.setDate(cutoff.getDate() - args.notSharedWithinDays)
            query = query.or(`social_shared_at.is.null,social_shared_at.lt.${cutoff.toISOString()}`)
        }

        const { data, error } = await query

        if (error) {
            console.error('fetchVehicles query error:', error)
            return []
        }

        return ((data || []) as any[]).map(row => ({
            id: String(row.id || ''),
            make: row.make || '',
            model: row.model || '',
            year: row.year || '',
            colour: row.colour || '',
            price: row.price || '',
            mileage: row.mileage || '',
            transmission: row.transmission || '',
            fuel_type: row.fuel_type || '',
            description: row.description || '',
            main_image_url: row.main_image_url || '',
            gallery_urls: Array.isArray(row.gallery_urls) ? row.gallery_urls : [],
            features: Array.isArray(row.features) ? row.features : [],
            slug: row.slug || '',
            social_shared_at: row.social_shared_at || null
        }))
    } catch (e) {
        console.error('fetchVehicles error:', e)
        return []
    }
}
