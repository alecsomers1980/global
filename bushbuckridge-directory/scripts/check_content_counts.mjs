import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
async function run() {
  await pb.admins.authWithPassword(process.env.POCKETBASE_SUPERADMIN_EMAIL, process.env.POCKETBASE_SUPERADMIN_PASSWORD);
  const collections = ['businesses', 'jobs', 'opportunities', 'events', 'spotlight_articles', 'editor_spotlight', 'reviews', 'sectors', 'areas', 'subscriptions', 'payments'];
  for (const c of collections) {
    try {
      const res = await pb.collection(c).getList(1, 1);
      console.log(c, '->', res.totalItems);
    } catch (e) {
      console.log(c, '-> ERROR', e.message);
    }
  }
}
run().catch(e => console.error(e.message));
