const fs = require('fs');
let code = fs.readFileSync('src/services/apiClient.ts', 'utf8');
code = code.replace(
  /      const errorMsg = data.error \|\| 'Unknown error occurred';/g,
  `      if (data.code === 'UNAUTHORIZED') {
        localStorage.removeItem('walkalong_admin_session');
        window.dispatchEvent(new Event('auth-unauthorized'));
      }
      const errorMsg = data.error || 'Unknown error occurred';`
);
fs.writeFileSync('src/services/apiClient.ts', code);
