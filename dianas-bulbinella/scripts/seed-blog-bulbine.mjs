/**
 * One-off: draft the flagship "Bulbine frutescens" Journal article via DeepSeek
 * and insert it (as a DRAFT for review). Same compliance guard as the runtime
 * generator (src/lib/blog/generator.ts). Idempotent — upserts on slug.
 *   node --env-file=.env.local scripts/seed-blog-bulbine.mjs
 */
import { createClient } from "@supabase/supabase-js";

const DEEPSEEK = process.env.DEEPSEEK_API_KEY;
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!DEEPSEEK || !URL || !SERVICE) {
  console.error("Missing DEEPSEEK_API_KEY / NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const SYSTEM = [
  "You are the content writer for Diana's Bulbinella, a South African natural skincare and botanical wellness brand handmade in small batches in White River, Mpumalanga. Founder: Diana Herbst.",
  "You write warm, trustworthy, editorial blog articles for South African customers who care about natural skincare and wellness.",
  "",
  "⚠️ COMPLIANCE — LEGAL REQUIREMENT, NEVER BREAK:",
  "SA law (Medicines Act 101 of 1965 / SAHPRA, Foodstuffs Cosmetics & Disinfectants Act 54 of 1972, ARB Code, CPA) forbids cosmetic/complementary products from making medical claims. You MUST NOT: name/imply any disease or condition a product acts on (cancer, diabetes, eczema, psoriasis, etc.); use treatment verbs (cure, heal, treat, prevent, kills, reverses, remedies); use pharma claims (antibacterial, antiviral, anti-inflammatory, 'clinically proven', 'medicinal', 'boosts immune system'). ONLY use: cosmetic function (cleanses, moisturises, softens, soothes, nourishes, protects, reduces the appearance of, leaves skin feeling…); traditional-use framing ('traditionally used in South Africa to support…', 'a long history of traditional use for…' — heritage, not efficacy); sensory/lifestyle language. Soft structure/function at most ('supports skin comfort') — never 'treats [condition]'.",
  "",
  "STYLE: South African English (moisturise, colour). Build the article around ONE specific, non-obvious angle, first-hand maker voice. Front-load the core takeaway. HONESTY RULE: do NOT invent statistics, studies, or 'clinically shown' data — genuine heritage + cosmetic function only. End with a '## Explore the range' CTA (no medical promises).",
  "",
  "OUTPUT: ONLY a valid JSON object, keys: \"title\",\"slug\",\"excerpt\",\"meta_title\",\"meta_description\",\"body_md\". title ≤70 chars; slug lowercase-hyphen; excerpt ≤200 chars; meta_title ≤60 chars incl \"Diana's Bulbinella\"; meta_description ≤160 chars; body_md = GitHub-flavoured markdown, 600-900 words, ## headings, short paragraphs, closing '## Explore the range'.",
].join("\n");

const USER = [
  "Write the flagship article about BULBINE FRUTESCENS — the indigenous South African plant that Diana's Bulbinella is named after.",
  "Cover, in a compliant way: what the plant is (a hardy indigenous SA succulent, sometimes called the burn-jelly plant, snake flower or cat's tail, with yellow star-shaped flowers), the clear leaf-gel it holds, its long heritage of traditional use in South African skincare, how products with it feel on the skin (soothing, moisturising, comforting), and that it's the heart of our Bulbinella range.",
  "Angle idea: why Diana built a whole brand around this humble, water-wise garden plant. Warm and place-rooted (White River, Mpumalanga).",
  "Return the JSON object now.",
].join("\n");

const res = await fetch("https://api.deepseek.com/chat/completions", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${DEEPSEEK}` },
  body: JSON.stringify({
    model: "deepseek-chat",
    max_tokens: 3000,
    temperature: 1.0,
    response_format: { type: "json_object" },
    messages: [{ role: "system", content: SYSTEM }, { role: "user", content: USER }],
  }),
});
if (!res.ok) { console.error("DeepSeek", res.status, (await res.text()).slice(0, 300)); process.exit(1); }
const data = await res.json();
let raw = (data.choices?.[0]?.message?.content ?? "").trim();
if (raw.startsWith("```")) raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
const a = JSON.parse(raw);
const slug = "bulbine-frutescens";

const sb = createClient(URL, SERVICE);
const { error } = await sb.from("blog_posts").upsert(
  {
    title: a.title,
    slug,
    excerpt: a.excerpt ?? "",
    meta_title: a.meta_title ?? a.title,
    meta_description: a.meta_description ?? a.excerpt ?? "",
    content: a.body_md,
    category: "Ingredient spotlight",
    image_url: "/images/blog/bulbine-frutescens.jpg",
    status: "draft",
  },
  { onConflict: "slug" }
);
if (error) { console.error("Insert failed:", error.message); process.exit(1); }

console.log("=== INSERTED AS DRAFT ===");
console.log("TITLE:", a.title);
console.log("SLUG :", slug);
console.log("META :", a.meta_title, "|", a.meta_description);
console.log("\n--- BODY ---\n" + a.body_md);
