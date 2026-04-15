const fs = require('fs');
const pdf = require('pdf-parse');

async function run() {
    try {
        const b1 = fs.readFileSync('./public/Newsletter/12 March 2026.pdf');
        const d1 = await pdf(b1);
        fs.writeFileSync('./12_March_2026.txt', d1.text);
        console.log("Written 12 March 2026");

        const b2 = fs.readFileSync('./public/Newsletter/26February2026.pdf');
        const d2 = await pdf(b2);
        fs.writeFileSync('./26_February_2026.txt', d2.text);
        console.log("Written 26 February 2026");
    } catch(e) {
        console.error(e);
    }
}
run();
