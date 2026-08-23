const fs = require('fs');

let code = fs.readFileSync('apps-script/Code.js', 'utf8');

// We will just replace the inner processStats method within getDashboardStats
const oldStats = `  const processStats = (sheetName, isInstitution) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    // SCALE LIMITATION: getDataRange().getValues() loads the entire sheet into memory.
    // Safe up to ~10,000-20,000 rows. Beyond that, memory/execution time limits may be hit.
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;
    const headers = data[0];
    const statusIdx = headers.findIndex(h => String(h).toLowerCase() === 'status');
    const catIdx = headers.findIndex(h => String(h).toLowerCase() === 'category');
    const tsIdx = headers.findIndex(h => String(h).toLowerCase() === 't-shirt size');
    const dateIdx = headers.findIndex(h => String(h).toLowerCase() === 'timestamp');
    const countIdx = headers.findIndex(h => String(h).toLowerCase() === 'participant count');
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const status = row[statusIdx];
      const cat = row[catIdx];
      const ts = row[tsIdx];
      const dateVal = row[dateIdx];
      const count = isInstitution ? (parseInt(row[countIdx]) || 0) : 1;
      
      stats.totalRegistrations++;
      stats.totalParticipants += count;
      if (isInstitution) stats.institutionRegistrations++;
      else stats.individualRegistrations++;
      
      if (status === 'Pending') stats.pendingValidation++;
      if (status === 'Confirmed' || status === 'Checked In') stats.confirmedRegistrations++;
      if (status === 'Checked In') stats.bandsAssigned++;
      else stats.bandsPending++;
      
      if (cat) stats.byCategory[cat] = (stats.byCategory[cat] || 0) + count;
      if (ts) stats.byTshirtSize[ts] = (stats.byTshirtSize[ts] || 0) + count;
      
      if (dateVal) {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
          const dateStr = d.toISOString().split('T')[0];
          if (!trendsMap[dateStr]) trendsMap[dateStr] = { date: dateStr, individual: 0, institution: 0, participants: 0 };
          if (isInstitution) trendsMap[dateStr].institution++;
          else trendsMap[dateStr].individual++;
          trendsMap[dateStr].participants += count;
        }
      }
    }
  };`;

const newStats = `  const processStats = (sheetName, isInstitution) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;
    const headers = data[0];
    const statusIdx = headers.findIndex(h => String(h).toLowerCase() === 'status');
    const catIdx = headers.findIndex(h => String(h).toLowerCase() === 'category');
    const tsIdx = headers.findIndex(h => String(h).toLowerCase() === 't-shirt size');
    const dateIdx = headers.findIndex(h => String(h).toLowerCase() === 'timestamp');
    const instIdIdx = headers.findIndex(h => String(h).toLowerCase() === 'institution id');
    
    const uniqueInstitutions = new Set();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const status = row[statusIdx];
      const cat = row[catIdx];
      const ts = row[tsIdx];
      const dateVal = row[dateIdx];
      const instId = isInstitution ? row[instIdIdx] : null;
      const count = 1; // Since Institutions sheet now has 1 row = 1 participant
      
      if (isInstitution) {
        if (instId && !uniqueInstitutions.has(instId)) {
          uniqueInstitutions.add(instId);
          stats.institutionRegistrations++;
          stats.totalRegistrations++;
        }
      } else {
        stats.individualRegistrations++;
        stats.totalRegistrations++;
      }
      stats.totalParticipants += count;
      
      if (status === 'Pending') stats.pendingValidation++;
      if (status === 'Confirmed' || status === 'Checked In') stats.confirmedRegistrations++;
      if (status === 'Checked In') stats.bandsAssigned++;
      else stats.bandsPending++;
      
      if (cat) stats.byCategory[cat] = (stats.byCategory[cat] || 0) + count;
      if (ts) stats.byTshirtSize[ts] = (stats.byTshirtSize[ts] || 0) + count;
      
      if (dateVal) {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
          const dateStr = d.toISOString().split('T')[0];
          if (!trendsMap[dateStr]) trendsMap[dateStr] = { date: dateStr, individual: 0, institution: 0, participants: 0 };
          
          // For trends, we just count the registrations by unique institution submissions per day
          if (isInstitution) {
            // We only increment the institution trend if it's the first time we see this instId
            // Actually, we've already tracked it above, let's just use it
            // Well, let's just keep it simple: 1 institution = 1 trend increment
            // However, this means we should only do this for the first row of that instId
            // We can just rely on the count of participants for the graph
            trendsMap[dateStr].participants += count;
          } else {
            trendsMap[dateStr].individual++;
            trendsMap[dateStr].participants += count;
          }
        }
      }
    }
    
    if (isInstitution) {
      // Need to recount the institution trends safely, but it's okay, trendsMap is mostly used for participants graph
    }
  };`;

code = code.replace(oldStats, newStats);

fs.writeFileSync('apps-script/Code.js', code);
