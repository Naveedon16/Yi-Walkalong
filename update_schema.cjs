const fs = require('fs');

let code = fs.readFileSync('apps-script/Code.js', 'utf8');

// I will insert a new function `migrateInstitutionSchema(sheet)`
// and call it at the beginning of `submitInstitution`.

const migrateFunction = `
function migrateInstitutionSchema(sheet) {
  const requiredHeaders = [
    'Institution ID', 'Timestamp', 'Institution Name', 'Institution Location',
    'Institute Coordinator 1 Name', 'Institute Coordinator 1 Phone', 'Institute Coordinator 1 Email',
    'Institute Coordinator 2 Name', 'Institute Coordinator 2 Phone', 'Institute Coordinator 2 Email',
    'Institute Coordinator 3 Name', 'Institute Coordinator 3 Phone', 'Institute Coordinator 3 Email',
    'Participant Name', 'Age', 'Gender', 'Phone', 'Email', 'T-Shirt Size', 'Category',
    'Disability Type', 'Special Notes / Assistance Required', 'Registration ID', 'Status'
  ];
  
  let currentHeaders = [];
  if (sheet.getLastRow() > 0) {
    currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  }
  
  const headersMatch = requiredHeaders.length === currentHeaders.length && 
    requiredHeaders.every((h, i) => String(h).toLowerCase() === String(currentHeaders[i]).toLowerCase());
    
  if (headersMatch) return currentHeaders;
  
  // Need to migrate
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    throw new Error("System is currently busy migrating schema. Please try again.");
  }
  try {
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    let oldData = [];
    if (lastRow > 1 && lastCol > 0) {
      oldData = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    }
    
    // Write new headers
    sheet.clearContents();
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    
    // Remap old data
    if (oldData.length > 0) {
      const newData = oldData.map(row => {
        const newRow = new Array(requiredHeaders.length).fill('');
        currentHeaders.forEach((h, colIdx) => {
          const newIdx = requiredHeaders.findIndex(rh => String(rh).toLowerCase() === String(h).toLowerCase());
          if (newIdx !== -1) {
            newRow[newIdx] = row[colIdx];
          }
        });
        return newRow;
      });
      sheet.getRange(2, 1, newData.length, requiredHeaders.length).setValues(newData);
    }
    return requiredHeaders;
  } finally {
    lock.releaseLock();
  }
}
`;

// Replace submitInstitution payload processing.
// Old code:
/*
function submitInstitution(payload) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName('Institutions');
  if (!sheet) throw new Error("Institutions sheet not found");
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const id = 'INS-' + new Date().getTime();
...
    setVal('Institution Location', p.institutionLocation || payload[0].institutionLocation);
    setVal('Coordinator Name', p.coordinatorName || payload[0].coordinatorName);
    setVal('Coordinator Email', p.coordinatorEmail || payload[0].coordinatorEmail);
    setVal('Coordinator Phone', p.coordinatorPhone || payload[0].coordinatorPhone);
    setVal('Coordinator 2 Name', p.coordinator2Name || payload[0].coordinator2Name);
...
    setVal('Status', 'Confirmed');
*/

const submitReplaceRegex = /function submitInstitution\(payload\) \{[\s\S]*?return \{ success: true, id \};\n\}/;

const newSubmitInstitution = `function submitInstitution(payload) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName('Institutions');
  if (!sheet) throw new Error("Institutions sheet not found");
  
  const headers = migrateInstitutionSchema(sheet);
  const id = 'INS-' + new Date().getTime();
  const timestamp = new Date().toISOString();
  
  const rows = payload.map((p, i) => {
    const row = new Array(headers.length).fill('');
    const participantId = \`\${id}-\${String(i + 1).padStart(3, '0')}\`;
    
    const setVal = (colName, val) => {
      const idx = headers.findIndex(h => String(h).toLowerCase() === String(colName).toLowerCase());
      if (idx !== -1 && val !== undefined && val !== null) row[idx] = val;
    };
    
    setVal('Institution ID', id);
    setVal('Timestamp', timestamp);
    setVal('Institution Name', p.institutionName || payload[0].institutionName);
    setVal('Institution Location', p.institutionLocation || payload[0].institutionLocation);
    
    setVal('Institute Coordinator 1 Name', p.coordinator1Name || payload[0].coordinator1Name || p.coordinatorName || payload[0].coordinatorName);
    setVal('Institute Coordinator 1 Phone', p.coordinator1Phone || payload[0].coordinator1Phone || p.coordinatorPhone || payload[0].coordinatorPhone);
    setVal('Institute Coordinator 1 Email', p.coordinator1Email || payload[0].coordinator1Email || p.coordinatorEmail || payload[0].coordinatorEmail);
    
    setVal('Institute Coordinator 2 Name', p.coordinator2Name || payload[0].coordinator2Name);
    setVal('Institute Coordinator 2 Phone', p.coordinator2Phone || payload[0].coordinator2Phone);
    setVal('Institute Coordinator 2 Email', p.coordinator2Email || payload[0].coordinator2Email);
    
    setVal('Institute Coordinator 3 Name', p.coordinator3Name || payload[0].coordinator3Name);
    setVal('Institute Coordinator 3 Phone', p.coordinator3Phone || payload[0].coordinator3Phone);
    setVal('Institute Coordinator 3 Email', p.coordinator3Email || payload[0].coordinator3Email);
    
    setVal('Participant Name', p.name);
    setVal('Age', p.age);
    setVal('Gender', p.gender);
    setVal('Phone', p.phone);
    setVal('Email', p.email);
    setVal('T-Shirt Size', p.tshirtSize);
    setVal('Category', p.category);
    setVal('Disability Type', p.disabilityType);
    setVal('Special Notes / Assistance Required', p.specialNotes);
    
    setVal('Registration ID', participantId);
    setVal('Status', 'Confirmed');
    
    return row;
  });
  
  if (rows.length > 0) {
    const lock = LockService.getScriptLock();
    if (lock.tryLock(10000)) {
      try {
        const startRow = Math.max(sheet.getLastRow() + 1, 2);
        sheet.getRange(startRow, 1, rows.length, headers.length).setValues(rows);
      } finally {
        lock.releaseLock();
      }
    } else {
      throw new Error("System is currently busy due to high traffic. Please try submitting again.");
    }
  }
  return { success: true, id };
}`;

code = migrateFunction + '\n' + code.replace(submitReplaceRegex, newSubmitInstitution);

// Also verify if there is any hardcoded appending in setup() for institutionsSheet
const setupReplaceRegex = /const institutionsSheet = ss\.getSheetByName\('Institutions'\);\s*if \(institutionsSheet\.getLastRow\(\) === 0\) \{\s*institutionsSheet\.appendRow\(\[.*?\]\);\s*\}/;
const setupNew = `const institutionsSheet = ss.getSheetByName('Institutions');
  if (institutionsSheet.getLastRow() === 0) {
    institutionsSheet.appendRow([
      'Institution ID', 'Timestamp', 'Institution Name', 'Institution Location',
      'Institute Coordinator 1 Name', 'Institute Coordinator 1 Phone', 'Institute Coordinator 1 Email',
      'Institute Coordinator 2 Name', 'Institute Coordinator 2 Phone', 'Institute Coordinator 2 Email',
      'Institute Coordinator 3 Name', 'Institute Coordinator 3 Phone', 'Institute Coordinator 3 Email',
      'Participant Name', 'Age', 'Gender', 'Phone', 'Email', 'T-Shirt Size', 'Category',
      'Disability Type', 'Special Notes / Assistance Required', 'Registration ID', 'Status'
    ]);
  }`;
code = code.replace(setupReplaceRegex, setupNew);

fs.writeFileSync('apps-script/Code.js', code);
