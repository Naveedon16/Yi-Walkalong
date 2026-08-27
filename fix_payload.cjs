const fs = require('fs');
let code = fs.readFileSync('apps-script/Code.js', 'utf8');
code = code.replace("const payload = body.payload;", "const payload = body.payload || {};");
fs.writeFileSync('apps-script/Code.js', code);
console.log("Fixed apps-script/Code.js");
