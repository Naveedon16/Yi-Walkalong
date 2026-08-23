const fs = require('fs');
let code = fs.readFileSync('apps-script/Code.js', 'utf8');

const oldCheckStatusRegex = /function checkStatus\(query\) \{[\s\S]*?return \{ statuses \};\n\}/;

const newCheckStatus = `function checkStatus(query) {
  logAction('CHECK_STATUS', 'Received query: ' + JSON.stringify(query));
  
  if (!query) {
    logAction('CHECK_STATUS', 'Empty query');
    return { statuses: [] };
  }
  
  const queryStr = String(query).trim().toLowerCase();
  const normalizedQueryPhone = queryStr.replace(/[\\s\\-()]/g, '');
  const queryIsPhone = /^\\d+$/.test(normalizedQueryPhone) && normalizedQueryPhone.length > 0;
  
  logAction('CHECK_STATUS', 'Lookup type detected: ' + (queryIsPhone ? 'Phone' : 'Registration/Institution ID'));
  
  const ss = getSpreadsheet();
  
  // Helper to convert header to camelCase key
  const toCamelCase = (str) => {
    return str.replace(/(?:^\\w|[A-Z]|\\b\\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\\s+/g, '');
  };

  // 1. Check Institutions Sheet First
  const instSheet = ss.getSheetByName('Institutions');
  if (instSheet) {
    const instData = instSheet.getDataRange().getValues();
    if (instData.length > 0) {
      const instHeaders = instData[0];
      const instIdIdx = instHeaders.findIndex(h => String(h).toLowerCase().trim() === 'institution id');
      const instPhoneIdx = instHeaders.findIndex(h => String(h).toLowerCase().trim() === 'phone');
      
      if (instIdIdx !== -1) {
        let matchedInstId = null;
        let matchedTimestamp = null;
        
        // Find matching Institution ID by direct ID or Phone
        for (let i = 1; i < instData.length; i++) {
          const rowInstId = String(instData[i][instIdIdx] || '').trim();
          const rowPhoneRaw = String(instData[i][instPhoneIdx] || '');
          const rowPhoneNorm = rowPhoneRaw.replace(/[\\s\\-()]/g, '');
          
          if (rowInstId.toLowerCase() === queryStr) {
            matchedInstId = rowInstId;
            break;
          }
          if (queryIsPhone && rowPhoneNorm === normalizedQueryPhone) {
            matchedInstId = rowInstId;
            break;
          }
        }
        
        if (matchedInstId) {
          // Gather all participants for this Institution ID
          const participants = [];
          for (let i = 1; i < instData.length; i++) {
            if (String(instData[i][instIdIdx] || '').trim() === matchedInstId) {
              if (!matchedTimestamp && instData[i][1]) {
                matchedTimestamp = instData[i][1];
              }
              const p = {};
              instHeaders.forEach((header, index) => {
                let key = String(header).trim();
                if (key.toLowerCase() === 't-shirt size') key = 'tshirtSize';
                else if (key.toLowerCase() === 'participant name') key = 'name';
                else key = toCamelCase(key);
                p[key] = instData[i][index];
              });
              // Ensure status exists if not in sheet
              if (typeof p.status === 'undefined') p.status = 'Confirmed';
              participants.push(p);
            }
          }
          
          logAction('CHECK_STATUS', {
            searchValue: queryStr,
            normalizedSearch: normalizedQueryPhone,
            matchedType: 'institution',
            matchedSheet: 'Institutions',
            matchedRowCount: participants.length
          });
          
          return {
            success: true,
            type: 'institution',
            institutionId: matchedInstId,
            timestamp: matchedTimestamp || new Date().toISOString(),
            participantCount: participants.length,
            participants: participants
          };
        }
      }
    }
  }
  
  // 2. Check Participants Sheet
  const sheet = ss.getSheetByName('Participants');
  const data = sheet.getDataRange().getValues();
  
  const headers = data[0];
  const idIdx = headers.findIndex(h => String(h).toLowerCase().includes('registration id') || String(h).toLowerCase() === 'id');
  const phoneIdx = headers.findIndex(h => String(h).toLowerCase().includes('phone'));
  
  if (idIdx === -1 || phoneIdx === -1) {
    logAction('CHECK_STATUS', 'Error: Could not find required columns in Participants sheet');
    return { statuses: [] };
  }
  
  const statuses = [];
  const rowsSearched = data.length - 1;
  
  for (let i = 1; i < data.length; i++) {
    const rawId = String(data[i][idIdx]);
    const id = rawId.toLowerCase().trim();
    
    const rawPhone = String(data[i][phoneIdx]);
    const normalizedPhone = rawPhone.replace(/[\\s\\-()]/g, '');
    
    const isIdMatch = id === queryStr;
    const isPhoneMatch = queryIsPhone && normalizedPhone === normalizedQueryPhone && normalizedPhone.length > 0;
    
    if (isIdMatch || isPhoneMatch) {
      const details = {};
      headers.forEach((header, index) => {
        let key = String(header).trim();
        if (key.toLowerCase() === 't-shirt size') key = 'tshirtSize';
        else if (key.toLowerCase() === 'registration id') key = 'id';
        else key = toCamelCase(key);
        
        details[key] = data[i][index];
      });
      
      statuses.push({
        id: rawId,
        status: details.status || 'Confirmed',
        details: details
      });
    }
  }
  
  logAction('CHECK_STATUS', {
    searchValue: queryStr,
    normalizedSearch: normalizedQueryPhone,
    matchedType: 'individual',
    matchedSheet: 'Participants',
    matchedRowCount: statuses.length
  });
  
  return { type: 'individual', statuses };
}`;

if (oldCheckStatusRegex.test(code)) {
  code = code.replace(oldCheckStatusRegex, newCheckStatus);
  fs.writeFileSync('apps-script/Code.js', code);
  console.log('Successfully updated apps-script/Code.js');
} else {
  console.log('Could not find checkStatus to replace');
}
