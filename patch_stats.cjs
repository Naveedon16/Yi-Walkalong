const fs = require('fs');
let code = fs.readFileSync('apps-script/Code.js', 'utf8');

const newProcessStats = `  const processStats = (sheetName) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;
    const headers = data[0];
    const statusIdx = headers.findIndex(h => String(h).toLowerCase() === 'status');
    const catIdx = headers.findIndex(h => String(h).toLowerCase() === 'category');
    const tsIdx = headers.findIndex(h => String(h).toLowerCase() === 't-shirt size');
    const dateIdx = headers.findIndex(h => String(h).toLowerCase() === 'timestamp');
    const hasFamilyMemberIdx = headers.findIndex(h => String(h).toLowerCase() === 'has family member');
    const familyMemberTsIdx = headers.findIndex(h => String(h).toLowerCase() === 'family member t-shirt size');
    const hasCaretakerIdx = headers.findIndex(h => String(h).toLowerCase() === 'has caretaker');
    const caretakerTsIdx = headers.findIndex(h => String(h).toLowerCase() === 'caretaker t-shirt size');

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const status = row[statusIdx];
      const cat = row[catIdx];
      const ts = row[tsIdx];
      const dateVal = row[dateIdx];
      const hasFamily = hasFamilyMemberIdx !== -1 ? row[hasFamilyMemberIdx] : '';
      const familyTs = familyMemberTsIdx !== -1 ? row[familyMemberTsIdx] : '';
      const hasCaretaker = hasCaretakerIdx !== -1 ? row[hasCaretakerIdx] : '';
      const caretakerTs = caretakerTsIdx !== -1 ? row[caretakerTsIdx] : '';

      let count = 1;
      let familyCount = 0;
      let caretakerCount = 0;

      if (String(hasFamily).toLowerCase() === 'yes' && familyTs) {
        familyCount = 1;
        count++;
      }
      if (String(hasCaretaker).toLowerCase() === 'yes' && caretakerTs) {
        caretakerCount = 1;
        count++;
      }
      
      stats.totalRegistrations++;
      stats.totalParticipants += count;
      stats.individualRegistrations++;
      
      if (status === 'Pending') stats.pendingValidation++;
      if (status === 'Confirmed' || status === 'Checked In') stats.confirmedRegistrations++;
      if (status === 'Checked In') stats.bandsAssigned += count;
      else stats.bandsPending += count;
      
      if (cat) stats.byCategory[cat] = (stats.byCategory[cat] || 0) + count;
      if (ts) stats.byTshirtSize[ts] = (stats.byTshirtSize[ts] || 0) + 1;
      if (familyCount > 0 && familyTs) stats.byTshirtSize[familyTs] = (stats.byTshirtSize[familyTs] || 0) + 1;
      if (caretakerCount > 0 && caretakerTs) stats.byTshirtSize[caretakerTs] = (stats.byTshirtSize[caretakerTs] || 0) + 1;
      
      if (dateVal) {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
          const dateStr = d.toISOString().split('T')[0];
          if (!trendsMap[dateStr]) trendsMap[dateStr] = { date: dateStr, individual: 0, participants: 0 };
          trendsMap[dateStr].individual++;
          trendsMap[dateStr].participants += count;
        }
      }
    }
  };`;

code = code.replace(/  const processStats = \(sheetName\) => \{[\s\S]*?    \}[\s\S]*?  \};/m, newProcessStats);
fs.writeFileSync('apps-script/Code.js', code);
console.log("Patched processStats");
