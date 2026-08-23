const fs = require('fs');
let code = fs.readFileSync('src/pages/RegistrationStatus.tsx', 'utf-8');

code = code.replace(/  const \[showScanner, setShowScanner\] = useState\(false\);\n  const \[cameraError, setCameraError\] = useState\(''\);\n  const \[scanHistory, setScanHistory\] = useState<ScanHistoryEntry\[\]>\(\[\]\);\n  \n  const videoRef = useRef<HTMLVideoElement>\(null\);\n  const codeReaderRef = useRef<BrowserMultiFormatReader \| null>\(null\);\n/g, '');

code = code.replace(/  const isAdmin = AdminAuthService.isAuthenticated\(\);\n\n  useEffect\(\(\) => \{\n    if \(isAdmin\) \{\n      AdminService\.getScanHistory\(\)\.then\(setScanHistory\)\.catch\(console\.error\);\n    \}\n    return \(\) => \{\n      if \(codeReaderRef\.current\) \{\n        codeReaderRef\.current\.reset\(\);\n      \}\n    \};\n  \}, \[isAdmin\]\);\n/g, '');

code = code.replace(/  const startScanner = async \(\) => \{[\s\S]*?  \};\n\n  const stopScanner = \(\) => \{[\s\S]*?  \};\n/g, '');

fs.writeFileSync('src/pages/RegistrationStatus.tsx', code);
