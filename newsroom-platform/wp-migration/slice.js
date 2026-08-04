const fs = require('fs');

const SQL_FILE = 'bushnxfzxw_wp2114.sql';

function sliceData() {
    const sql = fs.readFileSync(SQL_FILE, 'utf8');
    const matchStr = 'INSERT INTO `wp_posts`';

    let startIdx = 0;
    let allTuples = '';
    let count = 0;

    while (true) {
        startIdx = sql.indexOf(matchStr, startIdx);
        if (startIdx === -1) break;

        // Find where the values start for this specific INSERT
        const valuesMatch = 'VALUES\n';
        const valuesIdx = sql.indexOf(valuesMatch, startIdx);
        if (valuesIdx === -1) break;

        const actualDataStart = valuesIdx + valuesMatch.length;

        // Find the end of this insert statement
        const endIdx = sql.indexOf(';\n', actualDataStart);
        if (endIdx === -1) break;

        let block = sql.substring(actualDataStart, endIdx);

        // We append a comma and newline to combine the blocks, except for the last one later
        if (allTuples.length > 0) {
            allTuples += ',\n';
        }
        allTuples += block;

        count++;
        startIdx = endIdx + 2;
    }

    if (count === 0) {
        console.error(`Could not find ${matchStr}`);
        return;
    }

    fs.writeFileSync('wp_posts_block.txt', allTuples, 'utf8');
    console.log(`Successfully combined ${count} wp_posts inserts. Total Length: ${allTuples.length}`);
}

sliceData();
