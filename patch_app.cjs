const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes('AdminScanner')) {
  code = code.replace(/import \{ AdminParticipants \} from '\.\/pages\/AdminParticipants';/, "import { AdminParticipants } from './pages/AdminParticipants';\nimport { AdminScanner } from './pages/AdminScanner';");
  code = code.replace(/<Route path="admin" element=\{<AdminRoute><AdminDashboard \/><\/AdminRoute>\} \/>/, `<Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />\n              <Route path="admin/scanner" element={<AdminRoute><AdminScanner /></AdminRoute>} />`);
  fs.writeFileSync('src/App.tsx', code);
}
