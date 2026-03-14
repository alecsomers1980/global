import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { createServerSupabaseClient } from '@/lib/supabase/client'

export async function POST(req: Request) {
    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

        const { workspaceId, topic, platforms } = await req.json()
        if (!workspaceId) return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 })

        const supabase = await createServerSupabaseClient()

        // 1. Fetch Client Intelligence
        const { data } = await supabase
            .from('client_intelligence')
            .select('brand_voice, industry, target_audience, do_not_post, key_messages')
            .eq('workspace_id', workspaceId)
            .single()

        const intel = data as any

        // 2. Format rules
        const doNotPostRules = intel?.do_not_post?.length
            ? `\nCRITICAL RULES - DO NOT DO THESE THINGS:\n${intel.do_not_post.map((r: string) => `- ${r}`).join('\n')}`
            : ''

        const keyMessages = intel?.key_messages?.length
            ? `\nTry to weave in one of these key messages if natural:\n${intel.key_messages.map((m: string) => `- ${m}`).join('\n')}`
            : ''

        // 3. Build AI Prompt
        const systemPrompt = `You are an expert social media copywriter.
Write an engaging, platform-optimized social media caption based on the user's topic.

CLIENT PROFILE:
Industry: ${intel?.industry || 'General Business'}
Target Audience: ${intel?.target_audience || 'General Public'}
Brand Voice/Tone: ${intel?.brand_voice || 'Professional and engaging'}
${doNotPostRules}
${keyMessages}

Target Platforms for this post: ${platforms.join(', ')}

OUTPUT RULES:
- Return ONLY the raw caption text (no introductory conversational text like "Here is your caption:").
- Include 3-5 relevant emojis if they fit the brand voice.
- Add 4-7 highly relevant hashtags at the bottom.
- Ensure the character length fits the strictest platform requested.`

        // 4. Generate
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Topic/Draft: ${topic}` }
            ],
            temperature: 0.7,
            max_tokens: 400
        })

        const caption = completion.choices[0].message.content

        return NextResponse.json({ caption })

    } catch (error: any) {
        console.error('Caption generation error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
