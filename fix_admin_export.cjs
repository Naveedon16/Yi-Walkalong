const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminParticipants.tsx', 'utf8');

const targetStr = `  const handleExportCSV = () => {
    if (filteredParticipants.length === 0) return;
    
    // Get headers dynamically based on data keys + standard ones
    const baseHeaders = ['Registration ID', 'Name', 'Age', 'Gender', 'Phone', 'Email', 'Category', 'T-Shirt Size', 'Status', 'Timestamp'];
    
    // Fallback to extract all unique keys from all filtered records if we want to be thorough, 
    // but baseHeaders covers the prompt's request.
    const csvRows = [];
    csvRows.push(baseHeaders.map(h => \`"\${h.replace(/"/g, '""')}"\`).join(','));
    
    for (const p of filteredParticipants) {
      const row = [
        p.id || '',
        p.institutionId || '',
        p.name || '',
        p.age || '',
        p.gender || '',
        p.phone || '',
        p.email || '',
        p.category || '',
        p.tshirtSize || '',
        p.institutionName || '',
        p.status || '',
        p.timestamp || ''
      ];
      
      csvRows.push(row.map(val => \`"\${String(val).replace(/"/g, '""')}"\`).join(','));
    }
    
    const csvContent = csvRows.join('\\n');`;

const replaceStr = `  const handleExportCSV = () => {
    if (filteredParticipants.length === 0) return;
    
    // Use the dynamic keys that we get from the sheet backend to support all custom fields dynamically
    const allKeys = new Set<string>();
    filteredParticipants.forEach(p => Object.keys(p).forEach(k => {
      if(k !== 'type' && k !== 'source') allKeys.add(k);
    }));
    
    // Sort keys to put common headers first
    const preferredOrder = ['id', 'timestamp', 'category', 'name', 'age', 'gender', 'phone', 'email', 'tshirtSize', 'status', 'organization'];
    const sortedKeys = Array.from(allKeys).sort((a, b) => {
      const idxA = preferredOrder.indexOf(a);
      const idxB = preferredOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    const csvRows = [];
    
    // Create header row mapping camelCase keys back to readable strings
    const headerRow = sortedKeys.map(k => {
      let readable = k.replace(/([A-Z])/g, ' $1').trim();
      readable = readable.charAt(0).toUpperCase() + readable.slice(1);
      if(k === 'id') readable = 'Registration ID';
      if(k === 'tshirtSize') readable = 'T-Shirt Size';
      return \`"\${readable.replace(/"/g, '""')}"\`;
    });
    csvRows.push(headerRow.join(','));
    
    // Add data rows
    for (const p of filteredParticipants) {
      const row = sortedKeys.map(k => {
        let val = p[k];
        if (val === undefined || val === null) val = '';
        return \`"\${String(val).replace(/"/g, '""')}"\`;
      });
      csvRows.push(row.join(','));
    }
    
    const csvContent = csvRows.join('\\n');`;

if (content.includes(targetStr)) {
  fs.writeFileSync('src/pages/AdminParticipants.tsx', content.replace(targetStr, replaceStr));
  console.log("Success");
} else {
  console.log("Target not found");
}
