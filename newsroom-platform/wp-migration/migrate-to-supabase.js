require('dotenv').config({ path: '../.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    const jsonFile = process.argv[2] || 'bushbuckridge_final_posts_2026.json';
    console.log(`Loading final posts JSON (${jsonFile})...`);
    const posts = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

    console.log(`Starting migration for ${posts.length} posts...`);

    let successCount = 0;
    let imageUploadCount = 0;
    let failCount = 0;

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];

        // 1. Upload Featured Image if exists
        let storagePath = null;
        if (post.featured_image) {
            // The image path in wp_postmeta is like "2025/01/image.jpg"
            // Wait: the user said the folder is named "2026" on disk.
            // Let's check if the file exists locally by trying '2026' if '2025' fails.

            let localPath = path.join(__dirname, post.featured_image);
            if (!fs.existsSync(localPath)) {
                // Try replacing 2025 with 2026
                const altPath = post.featured_image.replace('2025/', '2026/');
                localPath = path.join(__dirname, altPath);
            }

            if (fs.existsSync(localPath)) {
                const fileExt = path.extname(localPath);
                const fileName = path.basename(localPath);
                // We'll upload it using the original wp_postmeta path structure
                storagePath = post.featured_image;

                try {
                    const fileBuffer = fs.readFileSync(localPath);
                    const { data, error } = await supabase.storage
                        .from('media')
                        .upload(storagePath, fileBuffer, {
                            upsert: true,
                            contentType: getContentType(fileExt)
                        });

                    if (error) {
                        console.error(`Error uploading image ${storagePath}:`, error.message);
                    } else {
                        imageUploadCount++;
                    }
                } catch (e) {
                    console.error(`Failed to read/upload ${localPath}`);
                }
            } else {
                console.warn(`[WARN] Local image not found, skipping upload: ${post.featured_image}`);
            }
        }

        // 2. Insert Post to Database
        try {
            // Strip HTML from post name if necessary, or just use it as slug
            const slug = post.post_name ? post.post_name.trim() : `post-${post.id}`;

            // Supabase expects valid timestamps. wp_post_date might need parsing if invalid, but MySQL format usually works.

            const { error } = await supabase
                .from('posts')
                .upsert({
                    wp_id: parseInt(post.id),
                    title: post.post_title.trim(),
                    slug: slug,
                    content: post.post_content,
                    featured_image: storagePath,  // We store the storage path relative to the bucket
                    published_at: post.post_date,
                    status: post.post_status.trim() === 'publish' ? 'publish' : 'draft',
                    site_id: 'bushbuckridge-news'
                }, { onConflict: 'wp_id' });

            if (error) {
                console.error(`Error inserting post ${post.id}:`, error.message);
                failCount++;
            } else {
                successCount++;
                if (successCount % 50 === 0) {
                    console.log(`Progress: Ingested ${successCount}/${posts.length} posts...`);
                }
            }
        } catch (dbErr) {
            console.error(`DB Insert Error for ${post.id}:`, dbErr.message);
            failCount++;
        }
    }

    console.log(`Migration Complete!`);
    console.log(`- Posts Ingested: ${successCount}`);
    console.log(`- Images Uploaded: ${imageUploadCount}`);
    console.log(`- Failures: ${failCount}`);
}

function getContentType(ext) {
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.png') return 'image/png';
    if (ext === '.webp') return 'image/webp';
    if (ext === '.gif') return 'image/gif';
    return 'application/octet-stream';
}

migrate();
