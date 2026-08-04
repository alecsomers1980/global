const fs = require('fs');
const { parse } = require('csv-parse/sync');

const FILE = 'wp_posts_block.txt';

function processBlock() {
    console.log(`Reading block from ${FILE}`);
    let sql = fs.readFileSync(FILE, 'utf8');

    // Remove the 'INSERT INTO `wp_posts` VALUES ' prefix to leave just the tuples
    const prefixMatch = 'VALUES\n';
    const prefixIdx = sql.indexOf(prefixMatch);
    if (prefixIdx > -1) {
        sql = sql.substring(prefixIdx + prefixMatch.length);
    }

    // Remove the trailing ';'
    sql = sql.trim().replace(/;$/, '');

    console.log('Splitting the massive tuple string into individual CSV-like rows...');
    // The SQL dump formats each row explicitly as `(val1, val2),\n(val3, val4)`
    // We can cleanly split by `),\r\n(` or `),\n(`

    // Trim opening '(' and closing ')'
    if (sql.startsWith('(')) sql = sql.substring(1);
    if (sql.endsWith(')')) sql = sql.substring(0, sql.length - 1);

    // Split using regex for the boundary
    const rawRows = sql.split(/\),\r?\n\(/);

    console.log(`Extracted ${rawRows.length} raw rows. Parsing as CSV...`);
    const posts = [];

    rawRows.forEach((rowStr, i) => {
        try {
            // MySQL escapes things differently than standard CSV. 
            // csv-parse handles standard escaping well if we set escape option
            const parsed = parse(rowStr, {
                quote: "'",
                escape: '\\',
                relax_column_count: true,
                relax_quotes: true
            });

            // Clean up spaces and quotes from all columns
            const cleanRow = parsed[0].map(col => col.trim().replace(/^'|'$/g, ''));

            if (i < 2) console.log(`Debug Row ${i} length: ${cleanRow.length}, first col: ${cleanRow[0]}, date col: ${cleanRow[2]}`);

            // Since WordPress content has commas that csv-parse might still split if quotes were mismatched, 
            // the array length might be > 21. As long as it's at least 21, the first few columns are usually intact.
            if (cleanRow && cleanRow.length >= 21) {
                const id = cleanRow[0];
                const post_date = cleanRow[2];
                const post_content = cleanRow[4];
                const post_title = cleanRow[5];
                const post_status = cleanRow[7];
                const post_name = cleanRow[11]; // slug

                // The post_type is usually near the end. If the array is longer than 23 (due to commas in content),
                // we might need to look from the back.
                // Standard: [..., guid (18), menu_order (19), post_type (20), post_mime_type (21), comment_count (22)]
                // Let's grab the 3rd to last item as post_type, and 2nd to last as mime_type for safety if length > 23
                let post_type = cleanRow[20];
                let post_mime_type = cleanRow[21] || '';

                if (cleanRow.length > 23) {
                    post_type = cleanRow[cleanRow.length - 3];
                    post_mime_type = cleanRow[cleanRow.length - 2];
                }

                if (post_date && post_date >= '2025-01-01' && (post_type === 'post' || post_type === 'attachment')) {
                    posts.push({ id, post_date, post_title, post_name, post_content, post_status, post_type, post_mime_type });
                }
            }
        } catch (err) {
            if (i < 5) console.error(`Failed to parse row ${i}:`, err.message);
        }
    });

    console.log(`Found ${posts.length} qualifying 2025+ posts/attachments.`);
    fs.writeFileSync('extracted_posts_2025_plus.json', JSON.stringify(posts, null, 2));
}

processBlock();
