const fs = require('fs');
const glob = require('glob');

const files = glob.sync('app/**/page.tsx');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    let newContent = content
        .replace(/import Footer from '@\/components\/Footer';\n?/g, '')
        .replace(/import Footer from "@\/components\/Footer";\n?/g, '')
        .replace(/[ \t]*<Footer \/>\n?/g, '');

    if (content !== newContent) {
        fs.writeFileSync(file, newContent);
        console.log(`Updated ${file}`);
    }
});
