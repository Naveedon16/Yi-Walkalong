const fs = require('fs');
let code = fs.readFileSync('apps-script/Code.js', 'utf8');

code = code.replace(
/const setVal = \(colName, val\) => \{[\s\S]*?if \(idx !== -1\) row\[idx\] = val;\n\s*\};/m,
`const setVal = (colName, val) => {
      let idx = headers.findIndex(h => String(h).toLowerCase() === String(colName).toLowerCase());
      if (idx === -1) {
        headers.push(colName);
        idx = headers.length - 1;
        sheet.getRange(1, headers.length).setValue(colName);
      }
      row[idx] = val;
    };`
);

fs.writeFileSync('apps-script/Code.js', code);
console.log("Patched Code.js dynamically adding headers");
