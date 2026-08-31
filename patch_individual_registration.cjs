const fs = require('fs');
let code = fs.readFileSync('src/pages/IndividualRegistration.tsx', 'utf8');

code = code.replace(/options=\{settings.categories.filter\(c => c.value === 'PWD' \|\| c.value === 'YI_MEMBER' \|\| c.value === 'SPECIAL_INVITEE'\)\}/g, "options={settings.categories.filter(c => c.value === 'PWD' || c.value === 'YI_MEMBER' || c.value === 'SPECIAL_INVITEE' || c.value === 'GENERAL_PUBLIC')}");

code = code.replace(/\{selectedCategory === 'SPECIAL_INVITEE' && \(/g, "{(selectedCategory === 'SPECIAL_INVITEE' || selectedCategory === 'GENERAL_PUBLIC') && (");

code = code.replace(/<h3 className="text-lg font-bold text-\[\#6750a4\]">Special Invitee Details<\/h3>/g, "<h3 className=\"text-lg font-bold text-[#6750a4]\">{selectedCategory === 'SPECIAL_INVITEE' ? 'Special Invitee' : 'General Public'} Details</h3>");

fs.writeFileSync('src/pages/IndividualRegistration.tsx', code);
console.log("Patched IndividualRegistration.tsx");
