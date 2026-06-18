import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
async function main() {
  await pb.admins.authWithPassword(process.env.POCKETBASE_SUPERADMIN_EMAIL, process.env.POCKETBASE_SUPERADMIN_PASSWORD);
  for (const name of ['jobs', 'opportunities', 'editor_spotlight', 'settings']) {
    const c = await pb.collections.getOne(name);
    console.log(`\n## ${name}`);
    for (const f of (c.fields || c.schema)) {
      let extra = '';
      if (f.type === 'select') extra = ` values=${JSON.stringify(f.values || f.options?.values)}`;
      if (f.type === 'file') extra = ` maxSelect=${f.maxSelect}`;
      if (f.type === 'relation') extra = ` ->${f.collectionId} req=${f.required}`;
      console.log(`  - ${f.name} (${f.type})${extra}`);
    }
    if (name === 'settings') {
      const recs = await pb.collection('settings').getFullList();
      console.log('  RECORDS:', JSON.stringify(recs).slice(0, 1500));
    }
  }
}
main().catch(e => console.error('ERR', e.message));
