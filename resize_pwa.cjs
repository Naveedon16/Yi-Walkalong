const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

async function resizeImage(inputPath, outputPath, size) {
  const image = await loadImage(inputPath);
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Draw scaled image
  ctx.drawImage(image, 0, 0, size, size);
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated ${outputPath}`);
}

async function main() {
  const input = path.join(__dirname, 'public/Yi.png');
  await resizeImage(input, path.join(__dirname, 'public/pwa-192x192.png'), 192);
  await resizeImage(input, path.join(__dirname, 'public/pwa-512x512.png'), 512);
}

main().catch(console.error);
