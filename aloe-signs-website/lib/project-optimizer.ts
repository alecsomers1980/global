import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY environment variable is not set. Cannot optimise project content.'
      );
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

/**
 * Models sometimes emit raw newlines/tabs inside JSON string values, which is
 * invalid JSON. Escape any control character (< 0x20) that appears inside a
 * string literal so JSON.parse succeeds. (Mirrors lib/news-generator.ts.)
 */
function escapeJsonControlChars(raw: string): string {
  let out = '';
  let inString = false;
  let escaped = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      out += ch;
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      out += ch;
      continue;
    }
    const code = raw.charCodeAt(i);
    if (inString && code < 0x20) {
      if (ch === '\n') out += '\\n';
      else if (ch === '\r') out += '\\r';
      else if (ch === '\t') out += '\\t';
      else out += '\\u' + code.toString(16).padStart(4, '0');
      continue;
    }
    out += ch;
  }
  return out;
}

export interface OptimizedProject {
  summary: string;
  meta_title: string;
  meta_description: string;
  body_md: string;
}

export interface OptimizeInput {
  title: string;
  client?: string;
  location?: string;
  category?: string;
  rawText: string;
}

export async function optimiseProjectContent(
  input: OptimizeInput
): Promise<OptimizedProject> {
  const client = getAnthropicClient();

  const systemPrompt = `You are an expert SEO, local (GEO) and AI-search (Generative Engine Optimisation) content strategist for Aloe Signs, a South African signage and large-format printing company based in Johannesburg, Gauteng, serving the whole country.

Rewrite the raw notes you are given into a polished, high-ranking project case study. Optimise simultaneously for THREE goals:
- CLASSIC SEO: natural keywords, descriptive ## headings, scannable bullet points.
- LOCAL / GEO: reference the project location and the South African context (Gauteng, Johannesburg, relevant suburb/town, nationwide reach) where it is truthful to do so.
- AI / ANSWER-ENGINE SEARCH: include a few clear, question-style ## headings (e.g. "What signage did Aloe Signs install?") answered concisely in the first sentence, use plain factual statements and named entities, so AI assistants can quote the page confidently.

Rules:
- Use South African English ("organise", "colour", "signage", "branding").
- NEVER invent facts, figures, dates, materials or client claims that are not present or clearly implied in the raw notes. If a detail is unknown, keep the copy general rather than fabricating specifics.
- Keep a warm, professional, non-hard-sell tone aimed at business owners and marketing/facilities managers.
- End EVERY body with a call-to-action section titled "## Get a Quote from Aloe Signs" inviting a free consultation and quote, with phone 011 693 2600 and WhatsApp 068 883 8049.`;

  const facts = [
    `Project title: ${input.title}`,
    input.client ? `Client: ${input.client}` : '',
    input.location ? `Location: ${input.location}` : '',
    input.category ? `Type of work / category: ${input.category}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const userPrompt = `Here are the project details and the admin's raw notes.

${facts}

RAW NOTES:
"""
${input.rawText || '(no notes provided — write a concise, honest case study from the details above only)'}
"""

Return your response in EXACTLY this format, with nothing before or after it:
1. A single-line JSON object (no code fences) containing ONLY these keys: "summary" (max 200 chars, one-sentence card blurb), "meta_title" (max 60 chars, include "Aloe Signs"), "meta_description" (max 160 chars). Do NOT put the body in the JSON.
2. On its own line, the exact delimiter: ===BODY===
3. After the delimiter, the full case study in GitHub-flavoured Markdown (300-600 words, ## headings including 1-2 question-style headings, bullet points where useful, ending with the "## Get a Quote from Aloe Signs" section).`;

  const response = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );
  if (!textBlock) {
    throw new Error('No text content returned from Claude.');
  }

  let raw = textBlock.text.trim();
  raw = raw.replace(/^```(?:json|markdown)?\s*/i, '').replace(/```\s*$/i, '').trim();

  const delimiter = '===BODY===';
  const delimiterIndex = raw.indexOf(delimiter);

  let metaRaw = raw;
  let extractedBody = '';
  if (delimiterIndex !== -1) {
    metaRaw = raw.slice(0, delimiterIndex);
    extractedBody = raw.slice(delimiterIndex + delimiter.length).trim();
  }

  const firstBrace = metaRaw.indexOf('{');
  const lastBrace = metaRaw.lastIndexOf('}');
  const jsonSlice =
    firstBrace !== -1 && lastBrace > firstBrace
      ? metaRaw.slice(firstBrace, lastBrace + 1)
      : metaRaw;

  let parsed: any;
  try {
    parsed = JSON.parse(jsonSlice);
  } catch {
    parsed = JSON.parse(escapeJsonControlChars(jsonSlice));
  }

  const summary = String(parsed.summary ?? '').slice(0, 200);
  const meta_title = String(parsed.meta_title ?? input.title).slice(0, 60);
  const meta_description = String(parsed.meta_description ?? summary).slice(0, 160);
  let body_md = extractedBody || String(parsed.body_md ?? '');

  const ctaHeading = '## Get a Quote from Aloe Signs';
  if (body_md && !body_md.includes(ctaHeading)) {
    body_md += `\n\n${ctaHeading}\n\nWant signage like this for your business? Contact Aloe Signs for a free consultation and quotation. Call 011 693 2600 or WhatsApp 068 883 8049 — our Johannesburg team serves clients across Gauteng and nationwide.\n`;
  }

  return { summary, meta_title, meta_description, body_md };
}
