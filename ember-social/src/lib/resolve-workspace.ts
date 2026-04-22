import { createClient } from '@supabase/supabase-js'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: string): boolean {
    return UUID_REGEX.test(value)
}

interface WorkspaceRef {
    id: string
    slug: string
    name: string
}

/**
 * Resolves a route param (slug OR uuid) to the workspace's UUID + slug + name.
 * Returns null if not found.
 */
export async function resolveWorkspace(param: string): Promise<WorkspaceRef | null> {
    if (!param) return null

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const column = isUuid(param) ? 'id' : 'slug'

    const { data } = await supabase
        .from('workspaces')
        .select('id, slug, name')
        .eq(column, param)
        .single()

    return (data as WorkspaceRef | null) || null
}

/**
 * Resolves a route param to just the workspace UUID (or returns the param unchanged
 * if the workspace can't be found — caller will get a downstream "not found" error).
 */
export async function resolveWorkspaceId(param: string): Promise<string> {
    if (isUuid(param)) return param
    const workspace = await resolveWorkspace(param)
    return workspace?.id || param
}
