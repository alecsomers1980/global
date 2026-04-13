import PocketBase from 'pocketbase';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function syncCollections() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    const adminEmail = 'alec@firewireit.co.za';
    const adminPassword = 'Ph03n1x@135';

    try {
        console.log('Authenticating...');
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        
        const schemaPath = 'C:/Users/info/OneDrive/Documents/Antigravity/bushbuckridge-directory/scripts/bushbuckridge_collections_fixed.json';
        const collections = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

        for (const target of collections) {
            console.log(`\nSyncing collection: ${target.name} (${target.id})...`);
            
            try {
                // Fetch current collection to get system fields
                const existing = await pb.collections.getOne(target.id);
                
                // Merge target fields into existing fields
                // We want to KEEP system fields (id, created, updated, email, etc. for auth)
                // and ADD/UPDATE our custom fields.
                
                const currentFields = existing.fields || [];
                const targetFields = target.fields || [];
                
                const finalFields = [...currentFields];
                
                for (const tField of targetFields) {
                    const index = finalFields.findIndex(f => f.name === tField.name);
                    if (index !== -1) {
                        // Update existing field
                        finalFields[index] = { ...finalFields[index], ...tField };
                    } else {
                        // Add new field
                        finalFields.push(tField);
                    }
                }

                // Update the collection
                await pb.collections.update(target.id, {
                    fields: finalFields,
                    listRule: target.listRule,
                    viewRule: target.viewRule,
                    createRule: target.createRule,
                    updateRule: target.updateRule,
                    deleteRule: target.deleteRule
                });
                
                console.log(`✅ ${target.name} synced.`);

            } catch (err) {
                console.log(`❌ Failed to sync ${target.name}:`, err.message);
                if (err.response?.data) console.log(JSON.stringify(err.response.data, null, 2));
            }
        }

        console.log('\n--- Final Verification ---');
        const biz = await pb.collections.getOne('businesses00000');
        console.log('Businesses fields:', biz.fields.map(f => f.name).join(', '));

    } catch (e) {
        console.error('Fatal Error:', e.message);
    }
}

syncCollections();
