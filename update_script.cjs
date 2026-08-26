const fs = require('fs');
let code = fs.readFileSync('apps-script/Code.js', 'utf8');
const target = `    setVal('Family Member Name', payload.familyMemberName || '');
    setVal('Family Member T-Shirt Size', payload.familyMemberTShirtSize || '');
    
    sheet.appendRow(row);`;
const replacement = `    setVal('Family Member Name', payload.familyMemberName || '');
    setVal('Family Member T-Shirt Size', payload.familyMemberTShirtSize || '');
    
    // Special Invitee Category Specific
    setVal('Remarks', payload.remarks || '');
    
    sheet.appendRow(row);`;
code = code.replace(target, replacement);
fs.writeFileSync('apps-script/Code.js', code);
