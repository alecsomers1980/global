const fs = require('fs');

const SQL_FILE = 'bushnxfzxw_wp2114.sql';
const OUTPUT_FILE = 'temp_insert.txt';

function extractData() {
    console.log(`Reading: ${SQL_FILE}`);
    const sql = fs.readFileSync(SQL_FILE, 'utf8');

    // Find the exact 'INSERT INTO `wp_posts`' match
    const matchStr = 'INSERT INTO `wp_posts`';
    const idx = sql.indexOf(matchStr);

    if (idx === -1) {
        console.log(`Could not find string: ${matchStr}`);
        return;
    }

    console.log(`Found string at index ${idx}. Extracting 5000 characters...`);
    const snippet = sql.substring(idx, idx + 5000);

    fs.writeFileSync(OUTPUT_FILE, snippet, 'utf8');
    console.log(`Snippet written to ${OUTPUT_FILE}`);
}

extractData();
