import { NextResponse } from 'next/server'
import { publishPost } from '@/lib/publish'

export async function POST(req: Request) {
    try {
        const { postId } = await req.json()

        if (!postId) {
            return NextResponse.json({ error: 'postId is required' }, { status: 400 })
        }

        const outcome = await publishPost(postId)

        // A pillar='video' post that isn't ready yet gets skipped (not
        // failed) by publishPost — surface that distinctly, otherwise it
        // falls into the empty-results branch below and misreports as
        // "no connected accounts" even though accounts are fine.
        if (outcome.skipped) {
            return NextResponse.json({
                error: 'This video post is not ready to publish yet — it is still rendering, or its video generation failed. Check the post for its current status.',
            }, { status: 409 })
        }

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
