const fs = require('fs');
let code = fs.readFileSync('src/pages/InstitutionRegistration.tsx', 'utf8');

code = code.replace(/onSubmit = async \(data: InstitutionFormValues\) => \{/, 'onSubmit = async (data: any) => {');

fs.writeFileSync('src/pages/InstitutionRegistration.tsx', code);
