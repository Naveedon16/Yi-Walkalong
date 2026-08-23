const fs = require('fs');
let code = fs.readFileSync('src/pages/RegistrationStatus.tsx', 'utf-8');

// The file still has the isAdmin effect somehow. Let's completely remove it.
code = code.replace(/  useEffect\(\(\) => \{\n    if \(isAdmin\) \{\n      AdminService\.getScanHistory\(\)\.then\(setScanHistory\)\.catch\(console\.error\);\n    \}\n    return \(\) => \{\n      if \(codeReaderRef\.current\) \{\n        codeReaderRef\.current\.reset\(\);\n      \}\n    \};\n  \}, \[isAdmin\]\);\n/g, '');
code = code.replace(/import \{ motion, AnimatePresence \} from 'motion\/react';/g, "import { motion, AnimatePresence } from 'motion/react';\nimport { Search, Activity, CheckCircle, QrCode, Loader2 } from 'lucide-react';");

fs.writeFileSync('src/pages/RegistrationStatus.tsx', code);
