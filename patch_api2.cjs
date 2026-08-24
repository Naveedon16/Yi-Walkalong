const fs = require('fs');
let code = fs.readFileSync('src/services/apiClient.ts', 'utf8');
code = code.replace(
  /window\.dispatchEvent\(new Event\('auth-unauthorized'\)\);/g,
  `if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') { window.location.href = '/admin/login'; }`
);
fs.writeFileSync('src/services/apiClient.ts', code);
