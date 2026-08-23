const XLSX = require('xlsx');

function parseTemplate(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // manually add some data to test
  worksheet['B21'] = { v: 'John Doe', t: 's' };
  worksheet['C21'] = { v: 25, t: 'n' };
  worksheet['G21'] = { v: 'Student', t: 's' };
  
  worksheet['B34'] = { v: 'Jane Smith', t: 's' };
  worksheet['G34'] = { v: 'Driver', t: 's' };
  
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  let pwdMode = false;
  let staffMode = false;
  
  const participants = [];
  
  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.length === 0) continue;
    
    const firstCell = String(row[0] || '').trim();
    
    if (firstCell === 'PERSONS WITH DISABILITIES (PWD)') {
      pwdMode = true;
      staffMode = false;
      i++; // skip header row
      continue;
    }
    
    if (firstCell === 'SUPPORT STAFF / CAREGIVERS / DRIVERS / VOLUNTEERS') {
      pwdMode = false;
      staffMode = true;
      i++; // skip header row
      continue;
    }
    
    if (firstCell === 'SUMMARY') {
      break;
    }
    
    if (pwdMode || staffMode) {
      const name = row[1];
      if (!name || String(name).trim() === '') continue;
      
      const age = row[2];
      const gender = row[3];
      const phone = row[4];
      const tshirtSize = row[5];
      const category = row[6];
      
      const participant = {
        name: name,
        age: age || '',
        gender: gender || '',
        phone: phone || '',
        tshirtSize: tshirtSize || '',
        category: category || '',
        isPwd: pwdMode
      };
      
      if (pwdMode) {
        participant.disabilityType = row[7] || '';
        participant.specialNotes = row[8] || '';
      }
      
      participants.push(participant);
    }
  }
  
  console.log("Parsed Participants:", participants.length);
  console.log(participants);
}

parseTemplate('WalkAlong_Registration_Sheet_Bulk.xlsx');
