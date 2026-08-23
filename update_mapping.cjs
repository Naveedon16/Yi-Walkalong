const fs = require('fs');
let code = fs.readFileSync('src/pages/InstitutionRegistration.tsx', 'utf8');

code = code.replace(
  `...p,
        ...data // spread all coordinator fields`,
  `...p,
        ...data, // spread all new fields
        // Map back to what backend explicitly expects for backward compatibility:
        institutionName: data.institutionName,
        coordinatorName: data.coordinator1Name,
        coordinatorEmail: data.coordinator1Email,
        coordinatorPhone: data.coordinator1Phone`
);

fs.writeFileSync('src/pages/InstitutionRegistration.tsx', code);
