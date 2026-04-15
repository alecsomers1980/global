import fs from 'fs';
import path from 'path';
import { exportImages } from 'pdf-export-images';
import { PDFExtract } from 'pdf.js-extract';

const pdfDir = './public/Newsletter';
const pdfs = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));

const pdfExtract = new PDFExtract();

async function run() {
  for (const pdf of pdfs) {
    const fullPath = path.join(pdfDir, pdf);
    const outBase = path.join(pdfDir, pdf.replace('.pdf', ''));
    fs.mkdirSync(outBase, { recursive: true });

    console.log(`Extracting images for ${pdf}...`);
    try {
      const images = await exportImages(fullPath, outBase);
      console.log(`Exported ${images?.length} images to ${outBase}`);
    } catch (err) {
      console.error(`Error extracting images from ${pdf}:`, err.message);
    }

    console.log(`Extracting text for ${pdf}...`);
    try {
      const data = await new Promise((resolve, reject) => {
        pdfExtract.extract(fullPath, {}, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
      
      let textOut = '';
      data.pages.forEach((page, i) => {
        textOut += `\n--- PAGE ${i+1} ---\n`;
        page.content.forEach(item => {
          textOut += item.str + '\n';
        });
      });
      fs.writeFileSync(path.join(outBase, 'extracted_text.txt'), textOut);
      console.log(`Exported text to ${outBase}/extracted_text.txt`);
    } catch (err) {
      console.error(`Error extracting text from ${pdf}:`, err.message);
    }
  }
}

run();
