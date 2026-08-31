const fs = require('fs');
let code = fs.readFileSync('apps-script/Code.js', 'utf8');

code = code.replace(/CacheService\.getScriptCache\(\)\.remove\('participants_data'\);/g, "CacheService.getScriptCache().remove('participants_data');\n    try { updateSummarySheet(); } catch(e) {}");

fs.writeFileSync('apps-script/Code.js', code);
console.log("Patched Code.js to trigger summary updates");
