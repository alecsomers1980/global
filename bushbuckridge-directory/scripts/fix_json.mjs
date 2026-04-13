import fs from 'fs';

const idMap = {
    "sectors": "sectors00000000",
    "areas": "areas0000000000",
    "businesses": "businesses00000",
    "jobs": "jobs00000000000",
    "events": "events000000000",
    "opportunities": "opportunities00",
    "enquiries": "enquiries00000",
    "subscriptions": "subscriptions00",
    "users": "_pb_users_auth_"
};

const schemaPath = 'C:/Users/info/.gemini/antigravity/brain/4d8e7859-56fc-43cd-be4c-d0a486b4982a/bushbuckridge_collections.json';
const collections = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const fixedCollections = collections.map(collection => {
    // 1. Update Collection ID
    if (idMap[collection.name]) {
        collection.id = idMap[collection.name];
    }

    // 2. Rename 'schema' to 'fields' for compatibility with newer API
    const fields = collection.schema || collection.fields || [];
    
    // In PB v0.20+, 'schema' is still used in Some contexts, but 'fields' is the new standard.
    // However, the internal fields like 'id', 'created', 'updated' are auto-managed.
    
    collection.fields = fields.map(field => {
        // Update relation IDs
        if (field.type === 'relation' && field.options && field.options.collectionId) {
            const targetName = field.options.collectionId;
            if (idMap[targetName]) {
                field.options.collectionId = idMap[targetName];
            }
        }
        // Remove 'id' from fields to let PB manage them, or keep if 15 chars.
        // For f1, f2 format, PB might reject them or ignore them.
        delete field.id; 
        
        return field;
    });

    // We keep 'schema' for backward compatibility if the SDK uses it, 
    // but we use the same array for 'fields'.
    collection.schema = collection.fields;

    return collection;
});

fs.writeFileSync('C:/Users/info/OneDrive/Documents/Antigravity/bushbuckridge-directory/scripts/bushbuckridge_collections_fixed.json', JSON.stringify(fixedCollections, null, 2));
console.log('✅ Fixed JSON (with fields) saved.');
