import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function updateDummyFeatures() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    const adminEmail = 'alec@firewireit.co.za';
    const adminPassword = 'Ph03n1x@135';

    try {
        console.log('Authenticating...');
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        
        console.log('\nUpdating Dummy Businesses with Feature Lists...');

        const standardFeatures = `
**Package Features Included:**
• Business Name & Category
• Basic Contact Details
• Physical Address
• Search Result Inclusion
• Standard Directory Listing`;

        const enhancedFeatures = `
**Package Features Included:**
• Everything in Standard
• Business logo and an image
• Social Media Integration
• Website & Email Links
• Verified Badge Status
• Priority Search Ranking`;

        const premiumFeatures = `
**Package Features Included:**
• Everything in Enhanced
• Logo and gallery
• Full Spotlight Article
• Featured Home Page Placement
• Lead Management Dashboard
• Monthly Performance Report`;

        // We fetch explicitly by name for the dummy ones
        const bizzes = await pb.collection('businesses').getFullList({
            filter: 'name = "Standard Local Plumbing" || name = "Enhanced Consulting Group" || name = "Elite Property Development" || name = "Apex Financial Solutions"'
        });

        for (const biz of bizzes) {
            let featuresToAppend = '';
            if (biz.package_tier === 'standard') featuresToAppend = standardFeatures;
            if (biz.package_tier === 'enhanced') featuresToAppend = enhancedFeatures;
            if (biz.package_tier === 'premium') featuresToAppend = premiumFeatures;

            // Simple text replacement so we don't append multiple times
            let currentDesc = biz.description || '';
            if (currentDesc.includes('**Package Features Included:**')) {
                currentDesc = currentDesc.split('**Package Features Included:**')[0].trim();
            }

            const newDesc = `${currentDesc}\n\n${featuresToAppend}`;
            await pb.collection('businesses').update(biz.id, { description: newDesc });
            console.log(`✅ Updated ${biz.name} with ${biz.package_tier} features.`);
        }

        console.log('\nDone updating dummy data features!');
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
    }
}

updateDummyFeatures();
