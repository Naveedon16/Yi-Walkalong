const fs = require('fs');
let code = fs.readFileSync('src/pages/RegistrationStatus.tsx', 'utf-8');

// Just remove these lines
code = code.split('\n').filter(line => {
  if (line.includes('useState<ScanHistoryEntry[]>')) return false;
  if (line.includes('AdminAuthService.isAuthenticated()')) return false;
  if (line.includes('AdminService.getScanHistory()')) return false;
  if (line.includes('BrowserMultiFormatReader | null')) return false;
  if (line.includes('stopScanner()')) return false;
  return true;
}).join('\n');

// Also need to remove the whole useEffect for isAdmin
code = code.replace(/  useEffect\(\(\) => \{\n    if \(isAdmin\) \{\n      AdminService\.getScanHistory\(\)\.then\(setScanHistory\)\.catch\(console\.error\);\n    \}\n    return \(\) => \{\n      if \(codeReaderRef\.current\) \{\n        codeReaderRef\.current\.reset\(\);\n      \}\n    \};\n  \}, \[isAdmin\]\);\n/g, '');

fs.writeFileSync('src/pages/RegistrationStatus.tsx', code);
