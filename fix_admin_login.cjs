const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminLogin.tsx', 'utf8');

code = code.replace(
  "setError(err.message || 'Failed to login');",
  `const msg = err.message || '';
      if (msg.includes('Network error') || msg.includes('Failed to fetch') || msg.includes('HTTP error')) {
        setError('Unable to connect to the admin service. Please try again.');
      } else if (msg.includes('Unauthorized') || msg.includes('Invalid')) {
        setError('Invalid admin credentials.');
      } else {
        setError(msg || 'Failed to login');
      }`
);

fs.writeFileSync('src/pages/AdminLogin.tsx', code);
