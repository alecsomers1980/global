import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', quiet: true });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
pb.autoCancellation(false);

async function expand(name, newFields, tweak) {
    const c = await pb.collections.getOne(name);
    const fields = (c.fields || c.schema).map(f => ({ ...f }));
    const have = new Set(fields.map(f => f.name));
    const added = [];
    for (const nf of newFields) {
        if (!have.has(nf.name)) { fields.push(nf); added.push(nf.name); }
    }
    if (tweak) tweak(fields);
    await pb.collections.update(c.id, { fields });
    console.log(`${name}: added [${added.join(', ') || 'none'}]${tweak ? ' (+tweaks)' : ''}`);
}

async function main() {
    await pb.admins.authWithPassword(process.env.POCKETBASE_SUPERADMIN_EMAIL, process.env.POCKETBASE_SUPERADMIN_PASSWORD);

    // ---- JOBS ----
    await expand('jobs', [
        { name: 'company', type: 'text' },
        { name: 'location', type: 'text' },
        { name: 'type', type: 'select', maxSelect: 1, values: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'] },
        { name: 'salary', type: 'text' },
        { name: 'salary_period', type: 'select', maxSelect: 1, values: ['Monthly', 'Annual', 'Hourly', 'Negotiable'] },
        { name: 'experience_level', type: 'select', maxSelect: 1, values: ['Entry-level', 'Mid-level', 'Senior', 'Executive'] },
        { name: 'positions', type: 'number' },
        { name: 'closing_date', type: 'date' },
        { name: 'responsibilities', type: 'editor' },
        { name: 'requirements', type: 'editor' },
        { name: 'how_to_apply', type: 'editor' },
        { name: 'contact_name', type: 'text' },
        { name: 'contact_number', type: 'text' },
        { name: 'contact_email', type: 'email' },
    ], (fields) => {
        const slug = fields.find(f => f.name === 'slug');
        if (slug) slug.required = false;
    });

    // ---- OPPORTUNITIES ----
    await expand('opportunities', [
        { name: 'description', type: 'editor' },
        { name: 'link', type: 'url' },
        { name: 'organization', type: 'text' },
        { name: 'value', type: 'text' },
        { name: 'eligibility', type: 'editor' },
        { name: 'reference_number', type: 'text' },
        { name: 'location', type: 'text' },
        { name: 'how_to_apply', type: 'editor' },
        { name: 'required_documents', type: 'editor' },
    ], (fields) => {
        const cat = fields.find(f => f.name === 'category');
        if (cat) cat.values = ['Funding', 'Tenders', 'Grants', 'Training', 'Business Support', 'Other'];
    });

    // ---- EDITOR SPOTLIGHT ----
    await expand('editor_spotlight', [
        { name: 'layout', type: 'select', maxSelect: 1, values: ['default', 'hero_top', 'gallery_grid'] },
        { name: 'images', type: 'file', maxSelect: 10 },
    ]);

    // ---- SPOTLIGHT ARTICLES (quarterly) ----
    await expand('spotlight_articles', [
        { name: 'title', type: 'text' },
        { name: 'quarter', type: 'select', maxSelect: 1, values: ['Q1', 'Q2', 'Q3', 'Q4'] },
        { name: 'year', type: 'number' },
    ]);

    // ---- SETTINGS: seed price rows (Rands) if missing ----
    const prices = { price_basic: '199', price_pro_lead: '799', price_pro_business: '10500' };
    const existing = await pb.collection('settings').getFullList();
    for (const [key, value] of Object.entries(prices)) {
        if (!existing.find(r => r.key === key)) {
            await pb.collection('settings').create({ key, value });
            console.log(`settings: seeded ${key}=${value}`);
        } else {
            console.log(`settings: ${key} already exists`);
        }
    }
    console.log('\nMigration complete ✅');
}
main().catch(e => console.error('ERR', e.message, JSON.stringify(e.data || {})));
