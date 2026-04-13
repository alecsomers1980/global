import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import https from 'https';

dotenv.config({ path: '.env.local' });

function downloadImage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

async function addGalleryAndSeedImages() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    const adminEmail = 'alec@firewireit.co.za';
    const adminPassword = 'Ph03n1x@135';

    try {
        console.log('Authenticating...');
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        
        console.log('\nChecking / Updating businesses collection for `gallery` field...');
        const collection = await pb.collections.getOne('businesses');
        
        const fields = collection.fields || collection.schema || [];
        const hasGallery = fields.some(field => field.name === 'gallery');
        
        if (!hasGallery) {
            // we have to push to fields or schema depending on pb version
            if (collection.fields) {
                collection.fields.push({
                    name: 'gallery',
                    type: 'file',
                    required: false,
                    options: {
                        maxSelect: 10,
                        maxSize: 5242880,
                        protected: false
                    }
                });
            } else if (collection.schema) {
                collection.schema.push({
                    name: 'gallery',
                    type: 'file',
                    required: false,
                    options: {
                        maxSelect: 10,
                        maxSize: 5242880,
                        protected: false
                    }
                });
            }
            await pb.collections.update('businesses', collection);
            console.log('✅ Added `gallery` field to businesses collection.');
        } else {
            console.log('`gallery` field already exists.');
        }

        console.log('\nSeeding mock images...');

        const bizzes = await pb.collection('businesses').getFullList();

        const enhancedBiz = bizzes.find(b => b.name === "Enhanced Consulting Group");
        const premiumBiz1 = bizzes.find(b => b.name === "Elite Property Development");
        const premiumBiz2 = bizzes.find(b => b.name === "Apex Financial Solutions");

        const mockImg1 = await downloadImage('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80'); 
        const mockImg2 = await downloadImage('https://images.unsplash.com/photo-1626178793926-22b28cecd2c2?w=800&q=80'); 
        const mockImg3 = await downloadImage('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'); 
        const mockImg4 = await downloadImage('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80'); 

        if (enhancedBiz) {
            const fd = new FormData();
            fd.append('gallery', new Blob([mockImg1]), 'enhanced_img.jpg');
            await pb.collection('businesses').update(enhancedBiz.id, fd);
            console.log(`✅ Uploaded 1 image to Enhanced Consulting Group`);
        }

        if (premiumBiz1) {
            const fd = new FormData();
            fd.append('gallery', new Blob([mockImg2]), 'gallery_1.jpg');
            fd.append('gallery', new Blob([mockImg3]), 'gallery_2.jpg');
            fd.append('gallery', new Blob([mockImg1]), 'gallery_3.jpg');
            await pb.collection('businesses').update(premiumBiz1.id, fd);
            console.log(`✅ Uploaded 3 images to Elite Property Development`);
        }
        
        if (premiumBiz2) {
            const fd = new FormData();
            fd.append('gallery', new Blob([mockImg4]), 'biz_1.jpg');
            fd.append('gallery', new Blob([mockImg1]), 'biz_2.jpg');
            await pb.collection('businesses').update(premiumBiz2.id, fd);
            console.log(`✅ Uploaded 2 images to Apex Financial Solutions`);
        }

        console.log('\nAll done!');
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
    }
}

addGalleryAndSeedImages();
