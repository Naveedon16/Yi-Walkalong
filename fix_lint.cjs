const fs = require('fs');
let code = fs.readFileSync('src/pages/InstitutionRegistration.tsx', 'utf8');

// Fix CheckCircle2 import
code = code.replace(/import \{ Download, Upload, AlertCircle, Users \} from 'lucide-react';/, "import { Download, Upload, AlertCircle, Users, CheckCircle2 } from 'lucide-react';");

// Fix zod resolver TS issue by just letting it infer the type automatically:
code = code.replace(/useForm<InstitutionFormValues>\(\{/g, 'useForm({');

fs.writeFileSync('src/pages/InstitutionRegistration.tsx', code);
