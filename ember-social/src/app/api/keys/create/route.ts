import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import crypto from 'crypto'

export async function POST(req: Request) {
    try {
        const { workspaceId, name: label } = await req.json()
        if (!workspaceId || !label) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })

        const supabase = await createServerSupabaseClient()

        // 1. Generate a secure random token
        const tokenBytes = crypto.randomBytes(32)
        const tokenStr = tokenBytes.toString('base64url')
        const rawKey = `es_${tokenStr}` // Ember Social prefix

        // 2. Hash the token for DB storage (never store raw keys!)
        // In a real production app we'd use bcrypt or Argon2
        const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')

        // 3. Insert into DB
        const { error } = await supabase.from('workspace_api_keys').insert({
            workspace_id: workspaceId,
            label,
            key_hash: keyHash,
        } as never)

        if (error) throw error

        // 4. Return the raw key EXACTLY ONCE to the user
        return NextResponse.json({ rawKey })

    } catch (error: any) {
        console.error('API Key creation error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
