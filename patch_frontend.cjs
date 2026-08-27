const fs = require('fs');
let code = fs.readFileSync('src/pages/IndividualRegistration.tsx', 'utf8');

code = code.replace(
  /delete \(submitData as any\)\.disabilityOther;/g,
  "// delete (submitData as any).disabilityOther; // Preserved for backend storage"
);

fs.writeFileSync('src/pages/IndividualRegistration.tsx', code);
console.log("Patched IndividualRegistration.tsx");
