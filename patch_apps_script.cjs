const fs = require('fs');
const file = 'apps-script/Code.js';
let code = fs.readFileSync(file, 'utf8');

const target = `    id = 'IND-' + Utilities.getUuid().split('-')[0].toUpperCase();`;
const replacement = `    // Generate sequential ID
    const idIdx = headers.findIndex(h => String(h).toLowerCase() === 'registration id');
    let nextNum = 1;
    if (idIdx !== -1) {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        const lastId = sheet.getRange(lastRow, idIdx + 1).getValue();
        const match = String(lastId).match(/IND-(\\d+)/);
        if (match) {
          nextNum = parseInt(match[1], 10) + 1;
        } else {
           const allIds = sheet.getRange(2, idIdx + 1, lastRow - 1, 1).getValues();
           for (let i = allIds.length - 1; i >= 0; i--) {
             const m = String(allIds[i][0]).match(/IND-(\\d+)/);
             if (m) {
               nextNum = parseInt(m[1], 10) + 1;
               break;
             }
           }
        }
      }
    }
    id = 'IND-' + nextNum.toString().padStart(4, '0');`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(file, code);
  console.log('Patched Code.js successfully.');
} else {
  console.error('Target not found in Code.js');
}
