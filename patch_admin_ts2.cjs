const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

code = code.replace(/counts\.individual/g, '(counts as any).individual');
code = code.replace(/counts\.family/g, '(counts as any).family');
code = code.replace(/counts\.caretaker/g, '(counts as any).caretaker');

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard.tsx TS issue");
