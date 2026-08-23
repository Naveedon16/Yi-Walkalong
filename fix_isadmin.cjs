const fs = require('fs');
let code = fs.readFileSync('src/pages/RegistrationStatus.tsx', 'utf-8');

code = code.replace(/  useEffect\(\(\) => \{\n    if \(isAdmin\) \{\n    \}\n  \}, \[isAdmin\]\);\n/g, '');

fs.writeFileSync('src/pages/RegistrationStatus.tsx', code);
