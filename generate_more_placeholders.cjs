const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const partners = [
  { file: 'public/Yi.png', text: 'Yi Logo', width: 200, height: 200 },
  { file: 'public/size-guide.png', text: 'Size Guide', width: 800, height: 600 }
];

partners.forEach(p => {
  const canvas = createCanvas(p.width, p.height);
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, p.width, p.height);
  
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 30px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.text, p.width / 2, p.height / 2);
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(p.file, buffer);
  console.log('Generated placeholder for ' + p.file);
});
