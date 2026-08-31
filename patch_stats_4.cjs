const fs = require('fs');
let code = fs.readFileSync('apps-script/Code.js', 'utf8');

const newProcessStats = `  const processStats = (sheetName) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;
    const headers = data[0];
    
    // Use trim and lowerCase, replace multiple spaces with single space
    const normalizeHeader = (h) => String(h).trim().toLowerCase().replace(/\\s+/g, ' ');
    
    const statusIdx = headers.findIndex(h => normalizeHeader(h) === 'status');
    const catIdx = headers.findIndex(h => normalizeHeader(h) === 'category');
    const tsIdx = headers.findIndex(h => normalizeHeader(h) === 't-shirt size');
    const dateIdx = headers.findIndex(h => normalizeHeader(h) === 'timestamp');
    const hasFamilyMemberIdx = headers.findIndex(h => normalizeHeader(h) === 'has family member');
    const familyMemberTsIdx = headers.findIndex(h => normalizeHeader(h) === 'family member t-shirt size');
    const hasCaretakerIdx = headers.findIndex(h => normalizeHeader(h) === 'has caretaker');
    const caretakerTsIdx = headers.findIndex(h => normalizeHeader(h) === 'caretaker t-shirt size');

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
      
      const familySizes = String(familyTs).split(',').map(s => s.trim()).filter(s => s);
      const hasFamilyStr = String(hasFamily).trim().toLowerCase();
      if (hasFamilyStr === 'yes' || hasFamilyStr === 'true') {
        familyCount = familySizes.length > 0 ? familySizes.length : 1;
        count += familyCount;
      }
      
      const caretakerSizes = String(caretakerTs).split(',').map(s => s.trim()).filter(s => s);
      const hasCaretakerStr = String(hasCaretaker).trim().toLowerCase();
      if (hasCaretakerStr === 'yes' || hasCaretakerStr === 'true') {
        caretakerCount = caretakerSizes.length > 0 ? caretakerSizes.length : 1;
        count += caretakerCount;
      }
      
      stats.totalRegistrations++;
      stats.totalParticipants += count;
      stats.individualRegistrations++;
      
      if (status === 'Pending') stats.pendingValidation++;
      if (status === 'Confirmed' || status === 'Checked In') stats.confirmedRegistrations++;
      if (status === 'Checked In') stats.bandsAssigned += count;
      else stats.bandsPending += count;
      
      if (cat) {
        if (!stats.byCategory[cat]) stats.byCategory[cat] = { individual: 0, family: 0, caretaker: 0 };
        stats.byCategory[cat].individual += 1;
        stats.byCategory[cat].family += familyCount;
        stats.byCategory[cat].caretaker += caretakerCount;
      }

      const mainSizes = String(ts).split(',').map(s => s.trim()).filter(s => s);
      mainSizes.forEach(size => {
        stats.byTshirtSize[size] = (stats.byTshirtSize[size] || 0) + 1;
      });
      
      if (familyCount > 0) {
        familySizes.forEach(size => {
          stats.byTshirtSize[size] = (stats.byTshirtSize[size] || 0) + 1;
        });
      }
      
      if (caretakerCount > 0) {
        caretakerSizes.forEach(size => {
          stats.byTshirtSize[size] = (stats.byTshirtSize[size] || 0) + 1;
        });
      }
      
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
console.log("Patched processStats heavily for comma separated values");
