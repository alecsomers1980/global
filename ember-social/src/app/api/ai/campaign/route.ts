import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { createServerSupabaseClient } from '@/lib/supabase/client'

export async function POST(req: Request) {
    try {
        const { workspaceId } = await req.json()
        if (!workspaceId) return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 })

        const supabase = await createServerSupabaseClient()

        // 1. Fetch Client Intelligence
        const { data } = await supabase
            .from('client_intelligence')
            .select('*')
            .eq('workspace_id', workspaceId)
            .single()

        const intel = data as any

        // 2. Build AI Prompt for Campaign
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

        const systemPrompt = `You are an expert social media strategist.
Based on the client's "Business DNA", generate a cohesive social media campaign for the next 30 days.

CLIENT PROFILE:
Industry: ${intel?.industry}
Target Audience: ${intel?.target_audience}
Brand Voice: ${intel?.brand_voice}
Current Month Focus: ${intel?.current_month_focus}
Goals: ${intel?.goals}

OUTPUT RULES:
- Generate 5 distinct campaign concepts or content pillars.
- For each concept, provide:
  - title: A short title for the pillar.
  - description: Why this works for this audience.
  - post_ideas: An array of 3 specific post ideas for this pillar.
- Return the response as JSON.

RESPONSE FORMAT: JSON ONLY.`

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: 'Generate my campaign strategy.' }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7
        })

        const result = JSON.parse(completion.choices[0].message.content || '{}')

        return NextResponse.json(result)

    } catch (error: any) {
        console.error('Campaign generation error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
