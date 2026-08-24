const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(
  /#registration-pass, #registration-pass \* \{\n    visibility: visible;\n  \}/m,
  `#registration-pass, #registration-pass * {
    visibility: visible;
    color: #000 !important;
  }`
);

fs.writeFileSync('src/index.css', css);
