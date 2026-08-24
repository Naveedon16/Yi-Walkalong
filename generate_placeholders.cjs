const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const partners = [
  { file: 'public/partners/yi-logo.jpeg', text: 'Yi Logo', width: 400, height: 200 },
  { file: 'public/partners/theme-2026.jpeg', text: 'One Bharat Spirit', width: 400, height: 200 },
  { file: 'public/partners/chennai-day.png', text: 'Chennai Day', width: 400, height: 200 },
  { file: 'public/partners/cii.jpeg', text: 'CII Logo', width: 400, height: 200 },
  { file: 'public/partners/dalmia.png', text: 'Dalmia', width: 400, height: 200 },
  { file: 'public/partners/armoraa.png', text: 'Armoraa', width: 400, height: 200 },
  { file: 'public/partners/lotte.png', text: 'Lotte', width: 400, height: 200 },
  { file: 'public/partners/pepero.png', text: 'Pepero', width: 400, height: 200 },
  { file: 'public/partners/rams.png', text: 'RAMS', width: 400, height: 200 },
  { file: 'public/partners/tamil_matrimony.png', text: 'Tamil Matrimony', width: 400, height: 200 },
  { file: 'public/partners/walkalong.png', text: 'WalkAlong', width: 400, height: 200 }
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
