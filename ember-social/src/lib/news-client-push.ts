import { createClient } from '@supabase/supabase-js'

export interface ClientSiteConfig {
    client_supabase_url?: string | null
    client_supabase_service_key?: string | null
    client_news_table?: string | null
}

export interface ArticlePayload {
    category: string
    title: string
    slug: string
    excerpt: string | null
    meta_title: string | null
    meta_description: string | null
    body_md: string
    hero_image_url: string | null
    featured_vehicle_id: string | null
    status: 'published' | 'draft'
    published_at?: string | null
}

/**
 * Upserts an article into the client's own Supabase news_posts table.
 * Returns the remote row's id so Ember-Social can track the link.
 */
function toRemotePayload(p: ArticlePayload): Record<string, any> {
    const { featured_vehicle_id, ...rest } = p
    const remote: Record<string, any> = { ...rest, generated_by_ai: true }
    // Client's news_posts uses `featured_car_id` (uuid FK to its own cars table).
    // Ember's vehicle ids won't match the client's cars table, so we drop it unless
    // it happens to be a uuid the caller has already validated against the client.
    if (featured_vehicle_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(featured_vehicle_id)) {
        remote.featured_car_id = featured_vehicle_id
    }
    return remote
}

export async function pushArticleToClient(
    workspace: ClientSiteConfig,
    payload: ArticlePayload,
    remoteId?: string | null
): Promise<{ remoteId: string }> {
    const url = workspace.client_supabase_url
    const key = workspace.client_supabase_service_key
    const table = workspace.client_news_table || 'news_posts'

    if (!url || !key) {
        throw new Error('Client Supabase credentials are not configured on this workspace')
    }

    const remote = createClient(url, key, { auth: { persistSession: false } })
    const remotePayload = toRemotePayload(payload)

    if (remoteId) {
        const { data, error } = await remote
            .from(table)
            .update(remotePayload as never)
            .eq('id', remoteId)
            .select('id')
            .single()
        if (error) {
            if (error.code === 'PGRST116' || (error as any).details?.includes('0 rows')) {
                // Row was deleted on the client side; fall through to upsert-on-slug.
            } else {
                throw error
            }
        } else {
            return { remoteId: (data as any).id }
        }
    }

    const { data, error } = await remote
        .from(table)
        .upsert(remotePayload as never, { onConflict: 'slug' })
        .select('id')
        .single()
    if (error) throw error
    return { remoteId: (data as any).id }
}

export async function unpublishOnClient(
    workspace: ClientSiteConfig,
    remoteId: string
): Promise<void> {
    const url = workspace.client_supabase_url
    const key = workspace.client_supabase_service_key
    const table = workspace.client_news_table || 'news_posts'
    if (!url || !key || !remoteId) return

    const remote = createClient(url, key, { auth: { persistSession: false } })
    await remote.from(table).update({ status: 'draft' } as never).eq('id', remoteId)
}
