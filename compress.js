import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = 'public/Images';
const files = fs.readdirSync(dir);

async function processImages() {
  for (const file of files) {
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      const p = path.join(dir, file);
      const stat = fs.statSync(p);
      if (stat.size > 500 * 1024) { // over 500kb
        console.log(`Compressing ${file}...`);
        const buffer = fs.readFileSync(p);
        const compressed = await sharp(buffer)
          .resize({ width: 1200, withoutEnlargement: true })
          .png({ quality: 80, compressionLevel: 9 })
          .toBuffer();
        fs.writeFileSync(p, compressed);
      }
    }
  }
  console.log('Compression done.');
}
processImages();
