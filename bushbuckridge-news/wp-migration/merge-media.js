const fs = require('fs');

function mergeMedia() {
    console.log('Loading extracted posts and media...');
    const posts = JSON.parse(fs.readFileSync('extracted_posts_2025_plus.json', 'utf8'));
    const media = JSON.parse(fs.readFileSync('extracted_media_2025_plus.json', 'utf8'));

    // Create a map of attachment ID -> file path
    const attachmentPaths = {};
    const postThumbnails = {}; // parent_post_id -> attachment_id

    media.forEach(m => {
        if (m.meta_key === '_wp_attached_file') {
            attachmentPaths[m.post_id] = m.meta_value;
        } else if (m.meta_key === '_thumbnail_id') {
            postThumbnails[m.post_id] = m.meta_value;
        }
    });

    const finalPosts = [];
    let postsWithImages = 0;

    // First pass: just map standard posts
    posts.forEach(post => {
        if (post.post_type === 'post') {
            let featured_image = null;

            const thumbId = postThumbnails[post.id];
            if (thumbId && attachmentPaths[thumbId]) {
                featured_image = attachmentPaths[thumbId];
                postsWithImages++;
            }

            finalPosts.push({
                ...post,
                featured_image
            });
        }
    });

    console.log(`Loaded ${finalPosts.length} standard posts.`);
    console.log(`Found featured images for ${postsWithImages} of them.`);

    fs.writeFileSync('bushbuckridge_final_posts_2025.json', JSON.stringify(finalPosts, null, 2));
    console.log('Saved final output to bushbuckridge_final_posts_2025.json');
}

mergeMedia();
