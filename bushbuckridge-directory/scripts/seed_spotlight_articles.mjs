import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function seedSpotlightArticles() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    const adminEmail = 'alec@firewireit.co.za';
    const adminPassword = 'Ph03n1x@135';

    try {
        console.log('Authenticating...');
        await pb.admins.authWithPassword(adminEmail, adminPassword);

        // Grab premium businesses
        const premiumBizzes = await pb.collection('businesses').getFullList({
            filter: 'package_tier = "premium" && status = "active"'
        });

        if (premiumBizzes.length === 0) {
            console.log('No premium businesses found. Exiting.');
            return;
        }

        console.log(`Found ${premiumBizzes.length} premium businesses. Seeding articles...`);

        const articleTemplates = [
            {
                content: `<h2>A Legacy of Excellence in Property Development</h2>
<p>For over a decade, this locally-rooted enterprise has been reshaping the Bushbuckridge landscape through sustainable development practices and community-first design principles.</p>
<p>From affordable housing complexes to commercial centres that serve as economic hubs, their portfolio speaks volumes about what is possible when vision meets local expertise.</p>
<h3>Community Impact</h3>
<p>Beyond bricks and mortar, the team has invested in skills development programmes that have trained over 200 local artisans. Their commitment to hiring locally means that every project directly benefits the surrounding community.</p>
<blockquote>\"We don't just build structures — we build futures. Every nail driven is an investment in Bushbuckridge's tomorrow.\"</blockquote>
<h3>What Sets Them Apart</h3>
<ul>
<li>100% locally sourced materials where possible</li>
<li>Green building certifications on all new projects</li>
<li>Free consultations for first-time property buyers</li>
<li>Community upliftment fund receiving 2% of all project revenue</li>
</ul>`,
                layout: 'hero_top'
            },
            {
                content: `<h2>Driving Financial Empowerment in the Lowveld</h2>
<p>In a region where financial literacy can transform lives, this dynamic firm has positioned itself as the go-to advisory partner for both emerging entrepreneurs and established businesses across the Bushbuckridge municipal area.</p>
<p>Their innovative approach combines traditional financial planning with cutting-edge digital tools, making professional-grade advice accessible to everyone.</p>
<h3>Services That Make a Difference</h3>
<p>From micro-business bookkeeping to corporate tax strategy, their team of qualified professionals delivers tailored solutions that respect local economic realities while pushing for growth.</p>
<h3>By the Numbers</h3>
<ul>
<li>500+ local businesses advised since founding</li>
<li>R12M+ in funding successfully secured for clients</li>
<li>98% client retention rate</li>
<li>Free monthly financial workshops at the community library</li>
</ul>`,
                layout: 'default'
            }
        ];

        for (let i = 0; i < Math.min(premiumBizzes.length, articleTemplates.length); i++) {
            const biz = premiumBizzes[i];
            const template = articleTemplates[i];

            // Check if article already exists
            try {
                await pb.collection('spotlight_articles').getFirstListItem(`business_id = "${biz.id}"`);
                console.log(`⚠️  Article already exists for ${biz.name}, skipping.`);
                continue;
            } catch (e) {
                // No existing article, good to create
            }

            await pb.collection('spotlight_articles').create({
                business_id: biz.id,
                status: 'published',
                layout: template.layout,
                content: template.content,
            });
            console.log(`✅ Created spotlight article for: ${biz.name}`);
        }

        console.log('\nDone seeding spotlight articles!');
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
    }
}

seedSpotlightArticles();
