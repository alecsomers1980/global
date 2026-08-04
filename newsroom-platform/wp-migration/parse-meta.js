const fs = require('fs');
const { parse } = require('csv-parse/sync');

const FILE = 'wp_postmeta_block.txt';

function processMeta() {
    console.log(`Reading block from ${FILE}`);
    let sql = fs.readFileSync(FILE, 'utf8');

    // Trim opening '(' and closing ')'
    if (sql.startsWith('(')) sql = sql.substring(1);
    if (sql.endsWith(')')) sql = sql.substring(0, sql.length - 1);

    // Split using regex for the boundary as before
    const rawRows = sql.split(/\),\r?\n\(/);

    console.log(`Extracted ${rawRows.length} raw meta rows. Parsing as CSV...`);
    const postmeta = [];

    // We want to load the extracted 2025 posts so we only keep meta for posts we care about
    let validPostIds = new Set();
    try {
        const posts = JSON.parse(fs.readFileSync('extracted_posts_2025_plus.json', 'utf8'));
        posts.forEach(p => validPostIds.add(p.id));
        console.log(`Loaded ${validPostIds.size} valid 2025+ post IDs to filter meta.`);
    } catch (e) {
        console.error("Could not load extracted_posts_2025_plus.json. Run that extraction first.", e.message);
        return;
    }

    rawRows.forEach((rowStr, i) => {
        try {
            const parsed = parse(rowStr, {
                quote: "'",
                escape: '\\',
                relax_column_count: true,
                relax_quotes: true
            });

            // Clean up spaces and quotes
            const cleanRow = parsed[0].map(col => col.trim().replace(/^'|'$/g, ''));

            if (cleanRow && cleanRow.length >= 4) {
                const meta_id = cleanRow[0];
                const post_id = cleanRow[1];
                const meta_key = cleanRow[2];
                const meta_value = cleanRow[3];

                if (validPostIds.has(post_id) && (meta_key === '_wp_attached_file' || meta_key === '_thumbnail_id')) {
                    postmeta.push({ meta_id, post_id, meta_key, meta_value });
                }
            }
        } catch (err) {
            // ignore parse errors for meta
        }
    });

    console.log(`Found ${postmeta.length} associated '_wp_attached_file' and '_thumbnail_id' meta entries.`);
    fs.writeFileSync('extracted_media_2025_plus.json', JSON.stringify(postmeta, null, 2));
}

processMeta();
