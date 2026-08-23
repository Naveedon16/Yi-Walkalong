const fs = require('fs');
let code = fs.readFileSync('src/pages/RegistrationStatus.tsx', 'utf-8');

// 1. imports
code = code.replace(/import \{ BrowserMultiFormatReader, NotFoundException \} from '@zxing\/library';\n/, '');
code = code.replace(/import \{ AdminAuthService, AdminService, ScanHistoryEntry \} from '\.\.\/services';\n/, '');

// Add QR Code import
code = code.replace(/import \{ motion, AnimatePresence \} from 'motion\/react';/, "import { motion, AnimatePresence } from 'motion/react';\nimport { RegistrationQRCode } from '../components/RegistrationQRCode';");

// 2. Remove scanner states
code = code.replace(/  const \[showScanner, setShowScanner\] = useState\(false\);\n  const \[cameraError, setCameraError\] = useState\(''\);\n  const \[scanHistory, setScanHistory\] = useState<ScanHistoryEntry\[\]>\(\[\]\);\n  const videoRef = useRef<HTMLVideoElement>\(null\);\n  const codeReaderRef = useRef<BrowserMultiFormatReader \| null>\(null\);\n  const isAdmin = AdminAuthService\.isAuthenticated\(\);\n/g, '');

// 3. Remove useEffect for scan history
code = code.replace(/  useEffect\(\(\) => \{\n    if \(isAdmin\) \{\n      AdminService\.getScanHistory\(\)\.then\(setScanHistory\)\.catch\(console\.error\);\n    \}\n    return \(\) => \{\n      if \(codeReaderRef\.current\) \{\n        codeReaderRef\.current\.reset\(\);\n      \}\n    \};\n  \}, \[isAdmin\]\);\n/g, '');

// 4. Remove startScanner and stopScanner
code = code.replace(/  const startScanner = async \(\) => \{[\s\S]*?  \};\n\n  const stopScanner = \(\) => \{[\s\S]*?  \};\n/g, '');

// 5. Remove Scan QR button
code = code.replace(/          <Button type="button" variant="outline" onClick=\{startScanner\} className="gap-2 sm:w-auto w-full">\n            <QrCode className="w-4 h-4" \/>\n            Scan QR\n          <\/Button>\n/g, '');

// 6. Remove showScanner block
code = code.replace(/        <AnimatePresence>\n          \{showScanner && \([\s\S]*?            <\/motion\.div>\n          \)\}\n        <\/AnimatePresence>\n/g, '');

// 7. Remove Admin Scan History Block
code = code.replace(/      \{isAdmin && \([\s\S]*?      \)\}\n/g, '');

// 8. Inject QR Code into selectedResult view
// We'll put it where the "Scan your QR code" instruction was
code = code.replace(/<p className="text-sm text-\[\#49454f\] dark:text-gray-400">Our event coordinator will scan the QR code to verify your registration\.<\/p>/, '<p className="text-sm text-[#49454f] dark:text-gray-400">Our event coordinator will scan the QR code to verify your registration.</p>\n                          <div className="mt-4">\n                            <RegistrationQRCode registrationId={selectedResult.id} size={120} />\n                          </div>');

fs.writeFileSync('src/pages/RegistrationStatus.tsx', code);
