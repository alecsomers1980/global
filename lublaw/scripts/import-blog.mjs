/**
 * Import the legacy lublaw.co.za blog (scraped into intake/legacy-blog/posts.json,
 * see Task 12) into the `posts` table, uploading each featured image into the
 * `blog-images` Storage bucket first so nothing depends on the old WordPress host.
 *
 *   npm run import-blog          # dry run: reports what WOULD happen
 *   npm run import-blog:apply    # writes
 *
 * Idempotent: upserts on `slug` (unique), so a half-finished run can be re-run safely.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const APPLY = process.argv.includes("--apply");
const db = createClient(URL, SERVICE, { auth: { persistSession: false } });

const intakePath = join(root, "intake", "legacy-blog", "posts.json");
const posts = JSON.parse(readFileSync(intakePath, "utf8"));

console.log(`Loaded ${posts.length} posts from intake file.`);

function excerptFrom(content) {
  return content.replace(/\s+/g, " ").trim().slice(0, 200);
}

async function uploadImage(post) {
  if (!post.imageUrl) return "";
  const res = await fetch(post.imageUrl);
  if (!res.ok) {
    console.warn(`  image fetch failed (${res.status}) for ${post.slug}, skipping image`);
    return "";
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const ext = post.imageUrl.split(".").pop()?.split("?")[0] ?? "jpg";
  const path = `legacy/${post.slug}.${ext}`;

  if (!APPLY) return `[would upload to ${path}]`;

  const { error } = await db.storage.from("blog-images").upload(path, buffer, {
    contentType: res.headers.get("content-type") ?? "image/jpeg",
    upsert: true,
  });
  if (error) {
    console.warn(`  image upload failed for ${post.slug}: ${error.message}`);
    return "";
  }
  const { data } = db.storage.from("blog-images").getPublicUrl(path);
  return data.publicUrl;
}

let created = 0;
let failed = 0;

for (const post of posts) {
  const imageUrl = await uploadImage(post);

  const row = {
    title: post.title,
    slug: post.slug,
    excerpt: excerptFrom(post.content),
    content: post.content,
    featured_image: imageUrl,
    status: "published",
    published_at: post.publishedAt,
  };

  if (!APPLY) {
    console.log(`[dry run] would upsert: ${post.slug}`);
    continue;
  }

  const { error, data } = await db
    .from("posts")
    .upsert(row, { onConflict: "slug" })
    .select("id");

  if (error) {
    console.error(`  FAILED ${post.slug}: ${error.message}`);
    failed++;
  } else if (data?.length) {
    created++;
  }
}

if (APPLY) {
  console.log(`\nDone. Upserted: ${created}, failed: ${failed}, total in intake: ${posts.length}`);
} else {
  console.log(`\nDry run complete. ${posts.length} posts would be upserted. Re-run with --apply to write.`);
}
