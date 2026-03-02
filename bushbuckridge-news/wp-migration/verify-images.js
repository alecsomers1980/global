const fs = require('fs');
const path = require('path');
const posts = JSON.parse(fs.readFileSync('bushbuckridge_final_posts_2026.json', 'utf8'));

let missingCount = 0;
for (const post of posts) {
    if (post.featured_image) {
        let localPath = path.join(__dirname, post.featured_image);
        if (!fs.existsSync(localPath)) {
            console.warn(`[WARN] Missing local image: ${post.featured_image}`);
            missingCount++;
        }
    }
}
if (missingCount === 0) {
    console.log("All referenced featured images exist locally!");
} else {
    console.log(`Missing ${missingCount} images.`);
}
