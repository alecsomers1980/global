import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

function slugify(s) {
    return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

async function main() {
    await pb.admins.authWithPassword(process.env.POCKETBASE_SUPERADMIN_EMAIL, process.env.POCKETBASE_SUPERADMIN_PASSWORD);

    const businesses = await pb.collection('businesses').getFullList({ sort: 'created' });
    const used = new Set();

    for (const biz of businesses) {
        if (biz.slug) {
            used.add(biz.slug);
            continue;
        }
        const base = slugify(biz.name) || 'business';
        let slug = base;
        let n = 2;
        while (used.has(slug)) {
            slug = `${base}-${n++}`;
        }
        used.add(slug);
        await pb.collection('businesses').update(biz.id, { slug });
        console.log(`${biz.name} -> ${slug}`);
    }
    console.log(`Done. ${businesses.length} businesses checked.`);
}

main().catch(e => console.error('ERR', e.message, JSON.stringify(e.data || {})));
