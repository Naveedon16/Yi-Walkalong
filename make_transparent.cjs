const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

async function processImage(input, output) {
  const img = await loadImage(input);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Make white pixels transparent (tolerance 200+)
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 220 && data[i+1] > 220 && data[i+2] > 220) {
      data[i+3] = 0; // alpha to 0
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(output, buffer);
  console.log(`Saved ${output}`);
}

processImage('public/partners/dalmia.jpg', 'public/partners/dalmia.png').catch(console.error);
