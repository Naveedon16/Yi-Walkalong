const fs = require('fs');
let code = fs.readFileSync('apps-script/Code.js', 'utf-8');

code = code.replace(
  /const id = 'IND-' \+ new Date\(\)\.getTime\(\);/,
  `const id = 'IND-' + new Date().getTime();
  
  const participantName = String(payload.name || '').trim();
  if (!participantName) {
    throw new Error("Validation Error: Participant name is missing or empty.");
  }`
);

code = code.replace(
  /setVal\('Participant Name', payload\.name\);/,
  `setVal('Name', participantName);`
);

fs.writeFileSync('apps-script/Code.js', code);
