import { NextResponse } from 'next/server'
import { publishPost } from '@/lib/publish'

export async function POST(req: Request) {
    try {
        const { postId } = await req.json()

        if (!postId) {
            return NextResponse.json({ error: 'postId is required' }, { status: 400 })
        }

        const outcome = await publishPost(postId)

        if (!outcome.results.length && !outcome.success) {
            return NextResponse.json({
                error: 'No connected accounts for the targeted platforms. Connect them on the Platforms page first.',
            }, { status: 400 })
        }

        return NextResponse.json({
            success: outcome.success,
            allSuccess: outcome.allSuccess,
            results: outcome.results,
        })
    } catch (error: any) {
        console.error('Publish API error:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
