import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
const su = process.env.POCKETBASE_SUPERADMIN_EMAIL, sp = process.env.POCKETBASE_SUPERADMIN_PASSWORD;
async function main() {
  await pb.admins.authWithPassword(su, sp);
  const c = await pb.collections.getOne('spotlight_articles');
  console.log('=== spotlight_articles fields ===');
  for (const f of (c.fields || c.schema)) {
    let extra = '';
    if (f.type === 'select') extra = ` values=${JSON.stringify(f.values || f.options?.values)} maxSelect=${f.maxSelect ?? f.options?.maxSelect}`;
    if (f.type === 'file') extra = ` maxSelect=${f.maxSelect ?? f.options?.maxSelect} mime=${JSON.stringify(f.mimeTypes || f.options?.mimeTypes)}`;
    if (f.type === 'relation') extra = ` -> ${f.collectionId || f.options?.collectionId} cascade=${f.cascadeDelete ?? f.options?.cascadeDelete} required=${f.required}`;
    console.log(`- ${f.name} (${f.type})${extra}`);
  }
  const list = await pb.collection('spotlight_articles').getList(1, 3);
  console.log(`\ntotal articles: ${list.totalItems}`);
  if (list.items[0]) console.log('sample:', JSON.stringify(list.items[0], null, 1).slice(0, 800));
}
main().catch(e => console.error('ERR', e.message));
