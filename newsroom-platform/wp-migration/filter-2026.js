const fs = require('fs');
const posts = JSON.parse(fs.readFileSync('bushbuckridge_final_posts_2025.json', 'utf8'));

const filtered = posts.filter(p => !p.post_date.startsWith('2025'));
console.log(`Original count: ${posts.length}`);
console.log(`Filtered count (only 2026+): ${filtered.length}`);

fs.writeFileSync('bushbuckridge_final_posts_2026.json', JSON.stringify(filtered, null, 2));
console.log('Saved to bushbuckridge_final_posts_2026.json');
