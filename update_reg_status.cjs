const fs = require('fs');
let code = fs.readFileSync('src/pages/RegistrationStatus.tsx', 'utf-8');

// Remove zxing imports
code = code.replace(/import \{ BrowserMultiFormatReader, NotFoundException \} from '@zxing\/library';\n/, '');

// Remove QrCode icon import if present, wait, maybe just leave it or replace it
// Let's use a regex to replace the entire startScanner/stopScanner and zxing logic
// Since it's complex, I'll just use a python script to clean it up.
