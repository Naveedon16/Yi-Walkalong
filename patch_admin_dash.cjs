const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

const target = `<Link to="/admin/participants">
            <Button variant="outline" size="sm">Manage Participants</Button>
          </Link>`;
          
const replacement = `<Link to="/admin/scanner">
            <Button variant="primary" size="sm" className="bg-[#6750a4]">Scanner</Button>
          </Link>
          <Link to="/admin/participants">
            <Button variant="outline" size="sm">Manage Participants</Button>
          </Link>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
}
