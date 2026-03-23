import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'

export async function POST(req: Request) {
    try {
        const { url } = await req.json()
        if (!url) return NextResponse.json({ error: 'Missing URL' }, { status: 400 })

        // 1. Fetch website content
        // Note: In a production environment, you might want to use a proxy or a dedicated scraping service
        // to handle JS-rendered sites and avoid getting blocked.
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: { revalidate: 3600 }
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch website: ${response.statusText}`)
        }

        const html = await response.text()
        // Extract basic text to stay within context limits
        const textContent = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 6000) // First 6000 chars should be enough for "DNA"

        // 2. Analyze with OpenAI
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

        const systemPrompt = `You are an expert brand strategist and marketing analyst.
Your task is to extract a "Business DNA" profile from the provided website content. This profile will be used to automate social media marketing through the Google Pomelli philosophy.

Extract the following information in JSON format:
- industry: A concise name for the industry/niche.
- target_audience: A description of who the business is talking to.
- brand_voice: The tone, style, and persona of the brand.
- goals: Primary business objectives inferred from the site.
- key_messages: 3-5 core brand messages or unique selling points.

RESPONSE FORMAT: JSON ONLY.`

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Website URL: ${url}\n\nContent Snippet:\n${textContent}` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3
        })

        const result = JSON.parse(completion.choices[0].message.content || '{}')

        return NextResponse.json(result)

    } catch (error: any) {
        console.error('Website analysis error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
