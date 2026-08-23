const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');
content = content.replace(
  /<button className="px-4 py-2 rounded-full border border-\[#79747e\] text-sm font-medium text-\[#6750a4\] hover:bg-\[#6750a4\]\/5 hidden md:block">\s*Admin Login\s*<\/button>/g,
  '<Link to="/admin/login" className="px-4 py-2 rounded-full border border-[#79747e] text-sm font-medium text-[#6750a4] hover:bg-[#6750a4]/5 hidden md:block">Admin Login</Link>'
);
fs.writeFileSync('src/components/Layout.tsx', content);
