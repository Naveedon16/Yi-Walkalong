const fs = require('fs');
let code = fs.readFileSync('src/pages/InstitutionRegistration.tsx', 'utf8');

// Insert import at the top
if (!code.includes('import templateUrl')) {
  code = code.replace("import * as XLSX from 'xlsx';", "import * as XLSX from 'xlsx';\nimport templateUrl from '/WalkAlong_Registration_Sheet_Bulk.xlsx?url';");
}

const target = `      const response = await fetch('/WalkAlong_Registration_Sheet_Bulk.xlsx');`;
const replace = `      const response = await fetch(templateUrl);`;
code = code.replace(target, replace);

const targetFallback = `      link.setAttribute("href", "/WalkAlong_Registration_Sheet_Bulk.xlsx");`;
const replaceFallback = `      link.setAttribute("href", templateUrl);`;
code = code.replace(targetFallback, replaceFallback);

fs.writeFileSync('src/pages/InstitutionRegistration.tsx', code);
