import Anthropic from "@anthropic-ai/sdk";
import {
  NewsCategory,
  FALLBACK_IMAGES,
  CATEGORY_UNSPLASH_TERMS,
} from "./news-categories";

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY environment variable is not set. Cannot generate news articles."
      );
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

const usedImageUrls = new Set<string>();

async function fetchImage(category: NewsCategory): Promise<string> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  const terms = CATEGORY_UNSPLASH_TERMS[category];
  const searchTerm = terms[Math.floor(Math.random() * terms.length)];

  // Try Unsplash API if key is present
  if (accessKey) {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          searchTerm
        )}&per_page=30&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${accessKey}`,
            "Accept-Version": "v1",
          },
        }
      );
      if (!response.ok) throw new Error(`Unsplash API error: ${response.status}`);
      const data = await response.json();
      const results = data?.results;
      if (results && results.length > 0) {
        const freshUrls = results
          .map((photo: any) => photo?.urls?.raw)
          .filter((raw: string) => !!raw)
          .filter((raw: string) => !usedImageUrls.has(raw))
          .map((raw: string) => `${raw}&w=1200&h=630&fit=crop&q=80&auto=format`);

        let chosen: string | undefined;
        if (freshUrls.length > 0) {
          chosen = freshUrls[Math.floor(Math.random() * freshUrls.length)];
        } else {
          // All returned URLs are already used; fallback to a random result regardless
          const anyRaw = results[Math.floor(Math.random() * results.length)]?.urls?.raw;
          if (anyRaw) chosen = `${anyRaw}&w=1200&h=630&fit=crop&q=80&auto=format`;
        }

        if (chosen) {
          usedImageUrls.add(chosen);
          return chosen;
        }
      }
    } catch (error) {
      console.error("Unsplash image fetch failed, using fallback:", error);
    }
  }

  // Fallback to static Unsplash URLs
  const fallback = FALLBACK_IMAGES[category];
  const fallbackUrl = fallback[Math.floor(Math.random() * fallback.length)];
  usedImageUrls.add(fallbackUrl);
  return fallbackUrl;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface NewsArticle {
  title: string;
  slug: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  body_md: string;
  image_url: string;
}

export async function generateNewsArticle(opts: {
  category: NewsCategory;
  recentTitles: string[];
}): Promise<NewsArticle> {
  const client = getAnthropicClient();

  const systemPrompt = `You are an expert content writer for Aloe Signs, a leading South African signage and large-format printing company based in Johannesburg, Gauteng, serving the whole country. Your writing follows these rules:

- Use South African English: "organise", "colour", "favour", "programme", etc.
- Mention local context where relevant: Gauteng, Johannesburg, South African business climate, load-shedding considerations, SANS standards (e.g., SANS 1186 for safety signs), the Occupational Health and Safety Act (OHS Act), BBBEE, etc.
- Be practical, helpful, and educational. Write for business owners, marketing managers, facilities managers, or safety officers – not a hard-sell.
- End EVERY article with a call-to-action section titled "## Get a Quote from Aloe Signs". The section should invite readers to contact Aloe Signs for a free consultation and quote, and provide the phone number 011 693 2600 and WhatsApp 068 883 8049. Keep the tone warm and professional.

The article category is: ${opts.category}. ${
    opts.recentTitles.length
      ? `Do NOT repeat or closely paraphrase any of these recent titles: ${opts.recentTitles.join("; ")}.`
      : ""
  }`;

  const userPrompt = `Write an expert, SEO-optimised blog article for the category "${opts.category}". Follow all the system instructions carefully. Output ONLY valid JSON (no markdown fences, no extra text) with exactly these keys: "title", "slug", "excerpt", "meta_title", "meta_description", "body_md".`;

  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );
  if (!textBlock) {
    throw new Error("No text content returned from Claude.");
  }

  let jsonText = textBlock.text;
  // Strip markdown code fences if present
  jsonText = jsonText.replace(/^\s*```json\s*/i, "").replace(/\s*```\s*$/, "");

  const parsed = JSON.parse(jsonText);

  // Build article with safe defaults
  const title = String(parsed.title ?? "Untitled").trim().slice(0, 70);
  const slug =
    parsed.slug
      ? slugify(String(parsed.slug))
      : slugify(title);
  const excerpt = String(parsed.excerpt ?? "").slice(0, 200);
  const meta_title = String(parsed.meta_title ?? title).slice(0, 60);
  const meta_description = String(parsed.meta_description ?? excerpt).slice(0, 160);
  const body_md = String(parsed.body_md ?? "");

  // Ensure CTA is present (basic check, but trust the AI mostly)
  const ctaHeading = "## Get a Quote from Aloe Signs";
  if (!body_md.includes(ctaHeading)) {
    // Append a fallback CTA if missing
    const fallbackCta = `\n\n${ctaHeading}\n\nNeed expert signage for your business? Contact Aloe Signs today for a free consultation and quotation. Call us on 011 693 2600 or WhatsApp 068 883 8049. Our team in Johannesburg serves clients across Gauteng and nationwide.\n`;
    const finalBody = body_md + fallbackCta;
    return {
      title,
      slug,
      excerpt,
      meta_title,
      meta_description,
      body_md: finalBody,
      image_url: await fetchImage(opts.category),
    };
  }

  return {
    title,
    slug,
    excerpt,
    meta_title,
    meta_description,
    body_md,
    image_url: await fetchImage(opts.category),
  };
}