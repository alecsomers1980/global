import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function main() {
    await pb.admins.authWithPassword(process.env.POCKETBASE_SUPERADMIN_EMAIL, process.env.POCKETBASE_SUPERADMIN_PASSWORD);
    const c = await pb.collections.getOne('spotlight_articles');
    const fields = (c.fields || c.schema).map(f => ({ ...f }));
    const img = fields.find(f => f.name === 'images');
    console.log('before: images maxSelect =', img.maxSelect, 'type =', img.type);
    img.maxSelect = 10;
    if (img.mimeTypes === undefined && img.options?.mimeTypes === undefined) {
        img.mimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    }
    await pb.collections.update(c.id, { fields });
    const c2 = await pb.collections.getOne('spotlight_articles');
    const img2 = (c2.fields || c2.schema).find(f => f.name === 'images');
    console.log('after:  images maxSelect =', img2.maxSelect, 'mime =', JSON.stringify(img2.mimeTypes));
}
main().catch(e => console.error('ERR', e.message, JSON.stringify(e.data || {})));
