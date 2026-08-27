const fs = require('fs');
let code = fs.readFileSync('apps-script/Code.js', 'utf8');

const dynamicCaptureCode = `
    // Dynamically capture any other unexpected fields from the frontend
    const knownKeys = ['name', 'age', 'gender', 'phone', 'email', 'category', 'tshirtSize', 'organization', 'disabilityType', 'disabilityOther', 'institutionName', 'specialRequirements', 'hasCaretaker', 'caretakerName', 'caretakerTShirtSize', 'employer', 'yiChapter', 'hasFamilyMember', 'familyMemberName', 'familyMemberTShirtSize', 'remarks', 'forceSubmit'];
    for (const key in payload) {
      if (payload.hasOwnProperty(key) && !knownKeys.includes(key)) {
        const colName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        setVal(colName, payload[key] || '');
      }
    }
    
    sheet.appendRow(row);
`;

code = code.replace(/sheet\.appendRow\(row\);/g, dynamicCaptureCode);
fs.writeFileSync('apps-script/Code.js', code);
console.log("Patched Code.js to capture dynamic fields");
