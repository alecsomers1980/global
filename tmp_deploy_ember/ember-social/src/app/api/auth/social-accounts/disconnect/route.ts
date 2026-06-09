import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'

export async function POST(req: Request) {
    try {
        const { accountId } = await req.json()

        if (!accountId) {
            return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
        }

        const supabase = await createServerSupabaseClient()

        const { error } = await supabase
            .from('social_accounts')
            .delete()
            .eq('id', accountId)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Disconnect error:', error)
        return NextResponse.json({ error: error.message || 'Failed to disconnect' }, { status: 500 })
    }
}
