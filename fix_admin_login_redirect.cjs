const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminLogin.tsx', 'utf8');

if (!code.includes('AdminService.getSession')) {
  code = code.replace(
    "import React, { useState } from 'react';",
    "import React, { useState, useEffect } from 'react';"
  );
  
  const insertIndex = code.indexOf('const handleLogin = async (e: React.FormEvent) => {');
  
  const effectCode = `  useEffect(() => {
    if (AdminService.getSession()) {
      navigate('/admin');
    }
  }, [navigate]);

  `;
  
  code = code.substring(0, insertIndex) + effectCode + code.substring(insertIndex);
  
  fs.writeFileSync('src/pages/AdminLogin.tsx', code);
}
