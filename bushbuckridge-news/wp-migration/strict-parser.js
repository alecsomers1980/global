const fs = require('fs');

const FILE = 'wp_posts_block.txt';

function extractWithRegex() {
    console.log(`Reading block from ${FILE}`);
    let sql = fs.readFileSync(FILE, 'utf8');

    console.log('Using regex to find tuples...');

    // A WordPress wp_posts row looks like:
    // (ID, post_author, 'post_date', 'post_date_gmt', 'post_content', 'post_title', 'post_excerpt', 'post_status', 'comment_status', 'ping_status', 'post_password', 'post_name', 'to_ping', 'pinged', 'post_modified', 'post_modified_gmt', 'post_content_filtered', post_parent, 'guid', menu_order, 'post_type', 'post_mime_type', comment_count)

    // We can match the start of a row reliably: `\((\d+),\d+,'([^']+)'` which is `(ID, author_id, 'date'`
    // Then we match everything until the specific end pattern of a WordPress row: 
    // `,'([^']*)','([^']*)',\d+\)` which is `,'post_type','mime_type',comment_count)`
    // Wait, mime type might be empty `''`.

    // Simpler approach: match the ID and date to filter immediately, then extract the whole content string between date and post_name.

    const rowRegex = /\((\d+),\d+,'([^']{19})','[^']{19}',(?:'(.*?)',)?'(.*?)','(.*?)','([^']+)','[^']+','[^']+','[^']*','([^']+)',[\s\S]*?,'([^']*)','([^']*)',\d+\)/g;

    // Actually, regex over 13MB of HTML might crash V8. Let's use a custom state machine parser tailored EXACTLY for the wp_posts schema.

    const posts = [];
    let inString = false;
    let escapeNext = false;
    let cols = [];
    let currentCol = '';

    for (let i = 0; i < sql.length; i++) {
        const char = sql[i];

        if (escapeNext) {
            currentCol += char;
            escapeNext = false;
            continue;
        }

        if (char === '\\') {
            escapeNext = true;
            // keep the slash or drop it? Let's drop it since it was just escaping the next char for SQL
            continue;
        }

        if (char === "'") {
            inString = !inString;
            continue;
        }

        if (!inString) {
            if (char === '(' && cols.length === 0) {
                // start of row
                currentCol = '';
            } else if (char === ',') {
                cols.push(currentCol);
                currentCol = '';
            } else if (char === ')') {
                cols.push(currentCol);

                // Process row
                if (cols.length >= 21) {
                    const id = cols[0].trim();
                    const post_date = cols[2].trim();
                    const post_content = cols[4];
                    const post_title = cols[5];
                    const post_status = cols[7];
                    const post_name = cols[11];
                    const post_type = cols[20].trim();
                    const post_mime_type = cols[21] ? cols[21].trim() : '';

                    if (post_date >= '2025-01-01' && (post_type === 'post' || post_type === 'attachment')) {
                        posts.push({ id, post_date, post_title, post_name, post_content, post_status, post_type, post_mime_type });
                    }
                }

                cols = [];
                currentCol = '';

                // skip ',\n' if present
                if (sql[i + 1] === ',' && sql[i + 2] === '\n') {
                    i += 2;
                }
            } else if (char !== '\n' && char !== '\r') {
                currentCol += char;
            }
        } else {
            currentCol += char;
        }
    }

    console.log(`Found ${posts.length} qualifying 2025+ posts/attachments.`);
    fs.writeFileSync('extracted_posts_2025_plus.json', JSON.stringify(posts, null, 2));
}

extractWithRegex();
