require('dotenv').config({ path: '../.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SITE_ID = 'bushbuckridge-news';
const NAV_EXCLUDED = ['top-story', 'uncategorized'];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { categories, relationships, postAuthors } =
    JSON.parse(fs.readFileSync(path.join(__dirname, 'relations.json'), 'utf8'));

  // 1. Upsert categories
  const rows = categories.map(c => ({ name: c.name, slug: c.slug, site_id: SITE_ID }));
  const { error: catErr } = await supabase
    .from('categories')
    .upsert(rows, { onConflict: 'site_id,slug' });
  if (catErr) throw catErr;

  const { data: dbCats } = await supabase
    .from('categories').select('id, slug').eq('site_id', SITE_ID);
  const catIdBySlug = Object.fromEntries(dbCats.map(c => [c.slug, c.id]));
  console.log(`categories in DB: ${dbCats.length}`);

  // 2. Map wp_id → post uuid (paged; there are ~1,110 posts)
  const postIdByWpId = {};
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('posts').select('id, wp_id').eq('site_id', SITE_ID).range(from, from + 999);
    if (error) throw error;
    if (!data.length) break;
    for (const p of data) postIdByWpId[p.wp_id] = p.id;
    if (data.length < 1000) break;
  }
  console.log(`posts in DB: ${Object.keys(postIdByWpId).length}`);

  // 3. Insert post_categories
  const links = [];
  for (const rel of relationships) {
    const postId = postIdByWpId[rel.wp_post_id];
    const categoryId = catIdBySlug[rel.category_slug];
    if (postId && categoryId) links.push({ post_id: postId, category_id: categoryId });
  }
  for (let i = 0; i < links.length; i += 500) {
    const { error } = await supabase
      .from('post_categories').upsert(links.slice(i, i + 500), { onConflict: 'post_id,category_id' });
    if (error) throw error;
  }
  console.log(`post_categories linked: ${links.length}`);

  // 4. Backfill authors
  let authorCount = 0;
  for (const [wpId, author] of Object.entries(postAuthors)) {
    const postId = postIdByWpId[wpId];
    if (!postId || !author) continue;
    const { error } = await supabase.from('posts').update({ author }).eq('id', postId);
    if (error) throw error;
    authorCount++;
  }
  console.log(`authors set: ${authorCount}`);
  console.log(`nav categories: ${dbCats.filter(c => !NAV_EXCLUDED.includes(c.slug)).length} (expected 6)`);
}

main().catch(e => { console.error(e); process.exit(1); });