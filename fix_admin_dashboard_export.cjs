const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const targetStr = `  const handleExportParticipantsCSV = async () => {
    setIsExportingCSV(true);
    try {
      const participants = await AdminService.getParticipants();
      if (!participants || participants.length === 0) {
        alert('No participants found.');
        setIsExportingCSV(false);
        return;
      }
      
      const headersSet = new Set<string>();
      participants.forEach(p => {
        Object.keys(p).forEach(k => headersSet.add(k));
      });
      
      const headers = Array.from(headersSet);
      
      let csvContent = headers.join(',') + '\\n';
      
      participants.forEach(p => {
        const row = headers.map(header => {
          let val = (p as any)[header];
          if (val === null || val === undefined) val = '';
          val = String(val).replace(/"/g, '""');
          if (val.includes(',') || val.includes('"') || val.includes('\\n')) {
            val = \`"\${val}"\`;
          }
          return val;
        });
        csvContent += row.join(',') + '\\n';
      });`;

const replaceStr = `  const handleExportParticipantsCSV = async () => {
    setIsExportingCSV(true);
    try {
      const participants = await AdminService.getParticipants();
      if (!participants || participants.length === 0) {
        alert('No participants found.');
        setIsExportingCSV(false);
        return;
      }
      
      const headersSet = new Set<string>();
      participants.forEach(p => {
        Object.keys(p).forEach(k => {
          if(k !== 'type' && k !== 'source') headersSet.add(k);
        });
      });
      
      // Sort keys to put common headers first
      const preferredOrder = ['id', 'timestamp', 'category', 'name', 'age', 'gender', 'phone', 'email', 'tshirtSize', 'status', 'organization'];
      const headers = Array.from(headersSet).sort((a, b) => {
        const idxA = preferredOrder.indexOf(a);
        const idxB = preferredOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
      });
      
      // Create header row mapping camelCase keys back to readable strings
      const headerRow = headers.map(k => {
        let readable = k.replace(/([A-Z])/g, ' $1').trim();
        readable = readable.charAt(0).toUpperCase() + readable.slice(1);
        if(k === 'id') readable = 'Registration ID';
        if(k === 'tshirtSize') readable = 'T-Shirt Size';
        return \`"\${readable.replace(/"/g, '""')}"\`;
      });
      
      let csvContent = headerRow.join(',') + '\\n';
      
      participants.forEach(p => {
        const row = headers.map(header => {
          let val = (p as any)[header];
          if (val === null || val === undefined) val = '';
          val = String(val).replace(/"/g, '""');
          return \`"\${val}"\`;
        });
        csvContent += row.join(',') + '\\n';
      });`;

if (content.includes(targetStr)) {
  fs.writeFileSync('src/pages/AdminDashboard.tsx', content.replace(targetStr, replaceStr));
  console.log("Success");
} else {
  console.log("Target not found");
}
