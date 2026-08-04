const fs = require('fs');
const path = require('path');
const { parse } = require('sql-parser-cst');

const SQL_FILE = 'bushnxfzxw_wp2114.sql';
const OUTPUT_FILE = 'extracted_posts_2025_plus.json';
const OUTPUT_MEDIA = 'extracted_media_2025_plus.json';

const POSTS_TABLE = 'wp_posts';
const POSTMETA_TABLE = 'wp_postmeta';

function parseSqlDump() {
    console.log(`Starting to parse: ${SQL_FILE}`);
    const sql = fs.readFileSync(path.join(__dirname, SQL_FILE), 'utf8');
    console.log('SQL file loaded into memory.');

    let parseResult;
    try {
        console.log('Parsing AST... this might take a minute depending on DB size.');
        parseResult = parse(sql, { dialect: 'mysql' });
    } catch (err) {
        console.error('Failed to parse SQL. Exiting...', err.message);
        return;
    }

    const posts = [];
    const postmeta = [];

    if (!parseResult || !parseResult.statements) {
        console.error('No statements found!');
        return;
    }

    for (const stmt of parseResult.statements) {
        if (stmt.type !== 'create' && stmt.type !== 'insert') continue;
        if (stmt.type !== 'insert') continue; // We only care about INSERTS

        // Check if the table is what we want
        let isPosts = false;
        let isPostMeta = false;

        if (stmt.table && stmt.table.name) {
            const tName = stmt.table.name.value || stmt.table.name;
            if (tName === 'wp_posts' || tName === '`wp_posts`') isPosts = true;
            if (tName === 'wp_postmeta' || tName === '`wp_postmeta`') isPostMeta = true;
        }

        if (!isPosts && !isPostMeta) continue;

        const valuesNode = stmt.values;
        if (!valuesNode || !valuesNode.values) continue; // Array of tuples

        for (const tuple of valuesNode.values) {
            if (!tuple || !tuple.exprs) continue; // expressions in the tuple

            // Map CST exprs back to string values
            const row = tuple.exprs.map(expr => {
                if (expr.type === 'string') return expr.value;
                if (expr.type === 'number') return expr.value.toString();
                if (expr.type === 'null') return '';
                return ''; // fallback
            });

            if (isPosts) {
                if (row.length < 21) continue;
                const id = row[0];
                const post_date = row[2] || '';
                const post_content = row[4];
                const post_title = row[5];
                const post_status = row[7];
                const post_name = row[11];
                const post_type = row[20] || '';
                const post_mime_type = row[21] || '';

                if (post_date >= '2025-01-01' && (post_type === 'post' || post_type === 'attachment')) {
                    posts.push({ id, post_date, post_title, post_name, post_content, post_status, post_type, post_mime_type });
                }
            } else if (isPostMeta) {
                if (row.length < 4) continue;
                postmeta.push({
                    meta_id: row[0],
                    post_id: row[1],
                    meta_key: row[2],
                    meta_value: row[3]
                });
            }
        }
    }

    console.log(`Finished parsing. Found ${posts.length} qualifying posts/attachments.`);

    fs.writeFileSync(path.join(__dirname, OUTPUT_FILE), JSON.stringify(posts, null, 2));
    fs.writeFileSync(path.join(__dirname, OUTPUT_MEDIA), JSON.stringify(postmeta, null, 2));
    console.log(`Saved output to ${OUTPUT_FILE} and ${OUTPUT_MEDIA}`);
}

parseSqlDump();
