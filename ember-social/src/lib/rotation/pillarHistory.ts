// Picks which 2 rotation-angle pillars (of the 3-candidate pool) get a slot
// this month, ranked by which was used LEAST recently for this workspace.
// Self-correcting: reads actual posts.pillar history, so a skipped or
// manually-run month doesn't desync anything.

import type { SupabaseClient } from '@supabase/supabase-js'

const CANDIDATES = ['finance', 'comparison', 'seasonal_local'] as const
const LOOKBACK_MONTHS = 3

export async function pickRotationSeats(supabase: SupabaseClient, workspaceId: string): Promise<[string, string]> {
	const cutoff = new Date()
	cutoff.setUTCMonth(cutoff.getUTCMonth() - LOOKBACK_MONTHS)

	const { data, error } = await supabase
		.from('posts')
		.select('pillar, scheduled_at')
		.eq('workspace_id', workspaceId)
		.in('pillar', CANDIDATES as unknown as string[])
		.gte('scheduled_at', cutoff.toISOString())

	if (error) {
		console.error('[pillarHistory] query failed, defaulting to first 2 candidates:', error.message)
		return [CANDIDATES[0], CANDIDATES[1]]
	}

	const lastUsed = new Map<string, number>()
	for (const c of CANDIDATES) lastUsed.set(c, 0) // never used = oldest possible (epoch)
	for (const row of (data ?? []) as any[]) {
		const t = new Date(row.scheduled_at).getTime()
		if (t > (lastUsed.get(row.pillar) ?? 0)) lastUsed.set(row.pillar, t)
	}

	const ranked = [...CANDIDATES].sort((a, b) => (lastUsed.get(a) ?? 0) - (lastUsed.get(b) ?? 0))
	return [ranked[0], ranked[1]]
}
