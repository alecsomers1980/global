import fs from 'fs';
import { promisify } from 'util';
import heicConvert from 'heic-convert';

async function convertHeic() {
  const inputBuffer = fs.readFileSync('public/images/Billboards.heic');
  console.log('Converting HEIC file...');
  const outputBuffer = await heicConvert({
    buffer: inputBuffer,
    format: 'JPEG',
    quality: 0.9
  });
  fs.writeFileSync('public/images/Billboards.jpeg', outputBuffer as Uint8Array);
  console.log('Done!');
}

convertHeic().catch(console.error);
