const fs = require('fs');
let code = fs.readFileSync('src/components/QRScanner.tsx', 'utf8');
code = code.replace(/facingMode: \{ ideal: "environment" \}/g, 'facingMode: "environment"');
code = code.replace(/facingMode: \{ exact: "environment" \}/g, 'facingMode: "environment"');
fs.writeFileSync('src/components/QRScanner.tsx', code);
