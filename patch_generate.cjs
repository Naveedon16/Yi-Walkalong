const fs = require('fs');
let code = fs.readFileSync('generate_restore.cjs', 'utf8');
const newFiles = [
  'public/partners/yi-logo.jpeg',
  'public/partners/theme-2026.jpeg',
  'public/partners/chennai-day.png',
  'public/partners/cii.jpeg',
  'public/partners/walkalong.png'
];
let target = "'public/partners/dalmia.png'";
let replace = "'public/partners/dalmia.png',\n  " + newFiles.map(f => "'" + f + "'").join(",\n  ");
code = code.replace(target, replace);
fs.writeFileSync('generate_restore.cjs', code);
console.log('Patched');
