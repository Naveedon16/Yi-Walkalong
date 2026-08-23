const fs = require('fs');
let code = fs.readFileSync('src/pages/RegistrationStatus.tsx', 'utf-8');

code = code.replace(/  const codeReaderRef = useRef<BrowserMultiFormatReader \| null>\(null\);\n/g, '');
code = code.replace(/import \{ Search, Activity, CheckCircle, QrCode, Loader2 \} from 'lucide-react';/g, "import { Search, Activity, CheckCircle, Loader2 } from 'lucide-react';");

fs.writeFileSync('src/pages/RegistrationStatus.tsx', code);
