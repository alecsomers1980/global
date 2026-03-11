import sharp from 'sharp';

async function convertWithSharp() {
  try {
    await sharp('public/images/Billboards.heic')
      .jpeg({ quality: 90 })
      .toFile('public/images/Billboards.jpeg');
    console.log('Successfully converted with sharp!');
  } catch (err) {
    console.error('Sharp conversion failed:', err.message);
  }
}

convertWithSharp();
