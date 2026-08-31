const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
code = code.replace(/typeof counts === 'object'/g, "typeof counts === 'object' && counts !== null && 'individual' in counts");
fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard.tsx TS issue");
