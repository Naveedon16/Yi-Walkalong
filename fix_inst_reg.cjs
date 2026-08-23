const fs = require('fs');
let code = fs.readFileSync('src/pages/InstitutionRegistration.tsx', 'utf-8');

// 1. Remove settings state and effect
code = code.replace(/const \[settings, setSettings\] = useState<SettingsResponse \| null>\(null\);\n/g, '');
code = code.replace(/const \[settingsError, setSettingsError\] = useState<\{message: string, code: string, title\?: string\} \| null>\(null\);\n/g, '');

const loadSettingsRegex = /const loadSettings = \(\) => \{[\s\S]*?\};\n\n  React\.useEffect\(\(\) => \{\n    loadSettings\(\);\n  \}, \[\]\);\n\n/g;
code = code.replace(loadSettingsRegex, '');

// Remove unused imports SettingsService, SettingsResponse, LoadingState, ErrorState
code = code.replace(/import \{ InstitutionService, SettingsService, SettingsResponse \} from '\.\.\/services';/g, "import { InstitutionService } from '../services';");
code = code.replace(/import \{ LoadingState \} from '\.\.\/components\/LoadingState';\n/g, '');
code = code.replace(/import \{ ErrorState \} from '\.\.\/components\/ErrorState';\n/g, '');

// Remove if (settingsError) and if (!settings)
code = code.replace(/  if \(settingsError\) return <ErrorState title=\{settingsError\.title\} message=\{settingsError\.message\} onRetry=\{loadSettings\} \/>;\n/g, '');
code = code.replace(/  if \(!settings\) return <LoadingState message="Loading registration forms\.\.\." \/>;\n/g, '');

// 2. Fix the layout wrappers
code = code.replace(/<div className="max-w-6xl mx-auto w-full">/g, '<div className="max-w-5xl mx-auto w-full">');
code = code.replace(/<form className="grid grid-cols-1 md:grid-cols-3 gap-6"/g, '<form className="space-y-6"');

// 3. Remove column wrappers
code = code.replace(/        <div className="md:col-span-1 space-y-6">\n/g, '');
code = code.replace(/        <div className="md:col-span-2 space-y-6">\n/g, '');
// And their closing tags. There are two closing tags for these divs before </form>
code = code.replace(/        <\/div>\n      <\/form>/g, '      </form>'); // removes the second one
code = code.replace(/          <\/Card>\n        <\/div>\n        <Card>/g, '          </Card>\n        <Card>'); // wait, let's just do it with a more precise regex.

fs.writeFileSync('src/pages/InstitutionRegistration.tsx', code);
