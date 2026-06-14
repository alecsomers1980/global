import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
async function main() {
  await pb.admins.authWithPassword(process.env.POCKETBASE_SUPERADMIN_EMAIL, process.env.POCKETBASE_SUPERADMIN_PASSWORD);
  const all = await pb.collections.getFullList();
  console.log('COLLECTIONS:', all.map(c => c.name).join(', '));
  for (const c of all) {
    if (c.name.startsWith('_')) continue;
    console.log(`\n## ${c.name} (type=${c.type})`);
    for (const f of (c.fields || c.schema || [])) {
      let extra = '';
      if (f.type === 'select') extra = ` values=${JSON.stringify(f.values || f.options?.values)} maxSelect=${f.maxSelect}`;
      if (f.type === 'file') extra = ` maxSelect=${f.maxSelect}`;
      if (f.type === 'relation') extra = ` ->${f.collectionId} maxSelect=${f.maxSelect}`;
      if (f.type === 'number') extra = '';
      console.log(`  - ${f.name} (${f.type})${f.required ? ' *req' : ''}${extra}`);
    }
  }
}
main().catch(e => console.error('ERR', e.message));
