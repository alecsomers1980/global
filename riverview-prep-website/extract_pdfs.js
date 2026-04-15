const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const pdfDir = path.join(__dirname, 'public', 'Newsletter');

async function extractPdfs() {
  const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));
  
  for (const file of files) {
    const pdfPath = path.join(pdfDir, file);
    console.log(`Extracting ${pdfPath}...`);
    try {
      const dataBuffer = fs.readFileSync(pdfPath);
      const data = await pdf(dataBuffer);
      
      const outPath = pdfPath.replace('.pdf', '_extracted.txt');
      fs.writeFileSync(outPath, data.text, 'utf-8');
      console.log(`Saved extracted text to ${outPath}`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
}

extractPdfs();
