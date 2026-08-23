const fs = require('fs');
const path = require('path');

const filesToRestore = [
  'public/Yi.png',
  'public/pwa-192x192.png',
  'public/pwa-512x512.png',
  'public/size-guide.png',
  'public/partners/armoraa.png',
  'public/partners/lotte.png',
  'public/partners/pepero.png',
  'public/partners/rams.png',
  'public/partners/tamil_matrimony.png'
];

let script = `const fs = require('fs');\nconst path = require('path');\n\nconst images = {\n`;

for (const file of filesToRestore) {
  const data = fs.readFileSync(file);
  const base64 = data.toString('base64');
  script += `  "${file}": "${base64}",\n`;
}

script += `};\n\nfor (const [file, base64] of Object.entries(images)) {\n`;
script += `  const fullPath = path.join(process.cwd(), file);\n`;
script += `  fs.mkdirSync(path.dirname(fullPath), { recursive: true });\n`;
script += `  fs.writeFileSync(fullPath, Buffer.from(base64, 'base64'));\n`;
script += `  console.log('Restored ' + file);\n`;
script += `}\n`;

fs.writeFileSync('restore_images.cjs', script);
console.log('Generated restore_images.cjs');
