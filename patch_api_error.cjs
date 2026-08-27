const fs = require('fs');
let code = fs.readFileSync('src/services/apiClient.ts', 'utf8');

code = code.replace(
  /throw new ApiError\('The registration service is temporarily unavailable\. Please try again shortly\.', 'CONFIGURATION_ERROR'\);/g,
  "throw new ApiError('Backend configuration error: Please make sure you have copied the latest apps-script/Code.js into your Google Apps Script editor and deployed it as a NEW version. Then run the setup() function.', 'CONFIGURATION_ERROR');"
);

fs.writeFileSync('src/services/apiClient.ts', code);
console.log("Patched apiClient.ts");
