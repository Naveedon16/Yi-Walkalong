const fs = require('fs');
let code = fs.readFileSync('src/pages/IndividualRegistration.tsx', 'utf8');
code = code.replace(
  `      </AnimatePresence>`,
  `      </AnimatePresence>
      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />`
);
fs.writeFileSync('src/pages/IndividualRegistration.tsx', code);
