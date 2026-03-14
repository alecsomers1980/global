import { OpenAI } from 'openai'
import { createServerSupabaseClient } from '@/lib/supabase/client'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

interface StrategyInput {
    workspaceId: string
    currentMonthFocus: string
    postsPerWeek?: number
}

export async function generateMonthlyStrategy({ workspaceId, currentMonthFocus, postsPerWeek = 3 }: StrategyInput) {
    const supabase = await createServerSupabaseClient()

    // 1. Fetch Client Intelligence & Notes
    const [{ data: intelArray }, { data: notesArray }] = await Promise.all([
        supabase.from('client_intelligence').select('*').eq('workspace_id', workspaceId),
        supabase.from('client_intel_notes').select('note').eq('workspace_id', workspaceId),
    ])

    const intel: any = intelArray?.[0]
    const notes: any[] = notesArray || []

    if (!intel) throw new Error('Client Intelligence profile not found')

    // 2. Fetch past performance data (the "Learning" part)
    const { data: pastPosts } = await supabase
        .from('posts')
        .select('content, post_results(impressions, likes, comments)')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(20)

    // 3. Build the prompt
    const systemPrompt = `You are an expert Social Media Account Manager for an agency called Ember Automations.
Your job is to generate a comprehensive, highly-tailored 30-day social media content calendar for a specific client.

--- CLIENT INTELLIGENCE ---
Industry: ${intel.industry || 'Not specified'}
Target Audience: ${intel.target_audience || 'Not specified'}
Brand Voice/Tone: ${intel.brand_voice || 'Professional and engaging'}
Primary Goals: ${intel.goals || 'Brand awareness and engagement'}

Key Messages to Include:
${intel.key_messages?.map((m: any) => `- ${m}`).join('\n') || 'None specified'}

STRICT DO NOT POST RULES (Violating these is a critical failure):
${intel.do_not_post?.map((m: any) => `- ${m}`).join('\n') || 'None specified'}

Additional Strategy Notes:
${notes?.map((n: any) => `- ${n.note}`).join('\n') || 'None'}

--- CURRENT MONTH FOCUS ---
${currentMonthFocus}

--- TASK ---
Generate a content calendar for the next 30 days, averaging ${postsPerWeek} posts per week.
Vary the content angles (e.g., Educational, Promotional, Behind-the-scenes, Community, Testimonial).
Match the platforms requested (Facebook, Instagram, LinkedIn).
Provide a highly engaging, fully drafted caption for each post, plus relevant hashtags.
Provide a clear, descriptive visual brief for the image or video that should accompany the post.

Structure your response EXACTLY as a JSON object matching this schema:
{
  "strategy_overview": "A 2-sentence summary of the focus for this month",
  "posts": [
    {
      "day_number": 1,
      "platforms": ["facebook", "instagram"],
      "content_angle": "Promotional",
      "draft_caption": "The actual caption text...",
      "suggested_hashtags": ["#example", "#tag"],
      "visual_brief": "Describe the image or graphic needed"
    }
  ]
}`

    // 4. Call OpenAI (using Structured Outputs)
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Generate the 30-day strategy now.' }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
    })

    // 5. Parse and return
    const result = JSON.parse(completion.choices[0].message.content || '{}')

    return result
}
