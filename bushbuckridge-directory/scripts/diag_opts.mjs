import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function main() {
    await pb.admins.authWithPassword('alec@firewireit.co.za', 'Ph03n1x@135');

    const b = await pb.collections.getOne('businesses');
    for (const f of (b.fields || b.schema)) {
        if (f.type === 'select') {
            console.log(`businesses.${f.name} values=`, JSON.stringify(f.values || f.options?.values), 'maxSelect=', f.maxSelect ?? f.options?.maxSelect);
        }
    }

    const e = await pb.collections.getOne('events');
    console.log('\nevents full fields:');
    for (const f of (e.fields || e.schema)) {
        const extra = f.type === 'select' ? ` values=${JSON.stringify(f.values || f.options?.values)}` : '';
        console.log(`  - ${f.name} (${f.type}) required=${f.required}${extra}`);
    }
}

main().catch(e => console.error('ERR', e.message, e.data || ''));
