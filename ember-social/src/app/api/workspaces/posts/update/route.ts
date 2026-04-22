import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        const { postId, status } = await req.json()

        if (!postId || !status) {
            return NextResponse.json({ error: 'postId and status are required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('posts')
            .update({ status })
            .eq('id', postId)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
