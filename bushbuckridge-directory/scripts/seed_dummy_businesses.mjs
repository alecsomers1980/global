import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function seedDummyBusinesses() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');
    const adminEmail = 'alec@firewireit.co.za';
    const adminPassword = 'Ph03n1x@135';

    try {
        console.log('Authenticating...');
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        
        console.log('\nCreating Dummy Businesses for each Tier...');

        // Create Standard Business
        const b1 = await pb.collections.getOne('businesses').catch(() => null); // just check if it exists

        const standardBiz = await pb.collection('businesses').create({
            name: "Standard Local Plumbing",
            phone: "013 123 4567",
            email: "info@standardplumbing.co.za",
            description: "A standard business listing example. Reliable local plumbing services.",
            status: "active",
            package_tier: "standard",
            is_featured: false,
            is_verified: false
        });
        console.log(`✅ Created Standard: ${standardBiz.id}`);

        // Create Enhanced Business
        const enhancedBiz = await pb.collection('businesses').create({
            name: "Enhanced Consulting Group",
            phone: "013 987 6543",
            whatsapp: "27821234567",
            email: "contact@enhancedconsulting.co.za",
            description: "An enhanced business listing example. Professional consulting with WhatsApp integration.",
            status: "active",
            package_tier: "enhanced",
            is_featured: false,
            is_verified: true
        });
        console.log(`✅ Created Enhanced: ${enhancedBiz.id}`);

        // Create Premium Business 1
        const premiumBiz1 = await pb.collection('businesses').create({
            name: "Elite Property Development",
            phone: "013 555 7777",
            whatsapp: "27829998888",
            email: "sales@eliteproperty.co.za",
            description: "A premium business listing example. Top-tier property development.",
            status: "active",
            package_tier: "premium",
            is_featured: true,
            is_verified: true
        });
        console.log(`✅ Created Premium: ${premiumBiz1.id}`);

        // Create Premium Business 2
        const premiumBiz2 = await pb.collection('businesses').create({
            name: "Apex Financial Solutions",
            phone: "013 444 3333",
            whatsapp: "27825554444",
            email: "hello@apexfinancial.co.za",
            description: "Another premium business example for the carousel.",
            status: "active",
            package_tier: "premium",
            is_featured: true,
            is_verified: true
        });
        console.log(`✅ Created Premium 2: ${premiumBiz2.id}`);

        console.log('\nDone seeding dummy data!');
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
    }
}

seedDummyBusinesses();
