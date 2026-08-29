
const SPREADSHEET_NAME = "WalkAlong 2026 Database";

function setup() {
  let ss;
  const files = DriveApp.searchFiles(`title = "${SPREADSHEET_NAME}" and mimeType = "${MimeType.GOOGLE_SHEETS}"`);
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  }

  const requiredSheets = ['Participants', 'Settings', 'Admins', 'Logs', 'ScanHistory'];
  
  requiredSheets.forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
  });

  // Setup headers if empty
  const participantsSheet = ss.getSheetByName('Participants');
  if (participantsSheet.getLastRow() === 0) {
    participantsSheet.appendRow(['Registration ID', 'Timestamp', 'Category', 'Name', 'Age', 'Gender', 'Phone', 'Email', 'T-Shirt Size', 'Organization', 'Disability Type', 'Special Requirements', 'Employer', 'Yi Chapter', 'Status']);
  }

  const settingsSheet = ss.getSheetByName('Settings');
  if (settingsSheet.getLastRow() === 0) {
    settingsSheet.appendRow(['Key', 'Value']);
    settingsSheet.appendRow(['isOpen', 'true']);
    settingsSheet.appendRow(['eventDate', '2026-08-15']);
  }

  const logsSheet = ss.getSheetByName('Logs');
  if (logsSheet.getLastRow() === 0) {
    logsSheet.appendRow(['Timestamp', 'Action', 'Details']);
  }
  
  const scanHistorySheet = ss.getSheetByName('ScanHistory');
  if (scanHistorySheet.getLastRow() === 0) {
    scanHistorySheet.appendRow(['Registration ID', 'Timestamp', 'Admin ID', 'Scan Type']);
  }

  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  
  return ss.getUrl();
}

function getSpreadsheet() {
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) {
    throw new Error("Configuration error: SPREADSHEET_ID property is missing.");
  }
  return SpreadsheetApp.openById(id);
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify({ success: true, result: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(errorMsg, code = 'BACKEND_ERROR') {
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: errorMsg, code }))
    .setMimeType(ContentService.MimeType.JSON);
}

function logAction(action, details) {
  try {
    const lock = LockService.getScriptLock();
    if (lock.tryLock(3000)) {
      try {
        const ss = getSpreadsheet();
        let sheet = ss.getSheetByName('Logs');
        if (!sheet) {
          sheet = ss.insertSheet('Logs');
          sheet.appendRow(['Timestamp', 'Action', 'Details']);
        }
        sheet.appendRow([new Date().toISOString(), action, JSON.stringify(details)]);
      } finally {
        lock.releaseLock();
      }
    }
  } catch (e) {}
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    if (action === 'checkStatus') {
      return jsonResponse(checkStatus(e.parameter.query));
    } else if (action === 'getSettings') {
      return jsonResponse(getSettings());
    }
    return errorResponse("Invalid action");
  } catch(err) {
    return errorResponse(err.message);
  }
}

function getSettings() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Settings');
  const data = sheet.getDataRange().getValues();
  
  const settings = {
    isOpen: true,
    eventDate: '2026-08-15',
    categories: [
      { value: 'PWD', label: 'Participant with Disability' },
      { value: 'YI_MEMBER', label: 'Yi Member' },
      { value: 'SPECIAL_INVITEE', label: 'Special Invitee' }
    ],
    tshirtSizes: [
      { label: 'Extra Small (XS)', value: 'XS' },
      { label: 'Small (S)', value: 'S' },
      { label: 'Medium (M)', value: 'M' },
      { label: 'Large (L)', value: 'L' },
      { label: 'Extra Large (XL)', value: 'XL' },
      { label: '2XL', value: '2XL' },
      { label: '3XL', value: '3XL' },
      { label: '4XL', value: '4XL' },
      { label: '5XL', value: '5XL' }
    ],
    disabilityTypes: [
      { label: 'Intellectual Disability', value: 'Intellectual Disability' },
      { label: 'Autism', value: 'Autism' },
      { label: 'Visual Impairment', value: 'Visual Impairment' },
      { label: 'Hearing Impairment', value: 'Hearing Impairment' },
      { label: 'Speech Impairment', value: 'Speech Impairment' },
      { label: 'Mobility Impairment', value: 'Mobility Impairment' },
      { label: 'Cerebral Palsy', value: 'Cerebral Palsy' },
      { label: 'Multiple Disabilities', value: 'Multiple Disabilities' },
      { label: 'Other', value: 'Other' }
    ],
    genders: [
      { label: 'Male', value: 'Male' },
      { label: 'Female', value: 'Female' },
      { label: 'Other', value: 'Other' }
    ],
    yiChapters: []
  };
  
  for (let i = 1; i < data.length; i++) {
    const key = data[i][0];
    const value = data[i][1];
    
    if (key === 'isOpen') settings.isOpen = String(value).toLowerCase() === 'true';
    if (key === 'eventDate') settings.eventDate = value;
    if (key === 'YI_CHAPTER' && value) settings.yiChapters.push({ label: String(value).trim(), value: String(value).trim() });
  }
  
  return settings;
}

function validateToken(token) {
  if (!token) return null;
  const sessionStr = CacheService.getScriptCache().get('admin_token_' + token);
  if (!sessionStr) return null;
  try { return JSON.parse(sessionStr); } catch (e) { return null; }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const payload = body.payload || {};
    const token = payload.token;
    
    // Protected actions
    const allProtected = ['getParticipants', 'getDashboardStats', 'updateStatus', 'updateStatuses', 'logScan', 'getScanHistory', 'checkInParticipant', 'sendRegistrationPass'];
    const adminOnly = ['getParticipants', 'getDashboardStats', 'updateStatus', 'updateStatuses'];
    
    let session = null;
    if (allProtected.includes(action)) {
      session = validateToken(token);
      if (!session) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unauthorized access', code: 'UNAUTHORIZED' })).setMimeType(ContentService.MimeType.JSON);
      }
      
      if (adminOnly.includes(action) && session.role !== 'ADMIN') {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Forbidden: Admin access required', code: 'FORBIDDEN' })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Inject the authenticated session email securely into the payload, overriding any client-provided adminId
      payload._authenticatedEmail = session.email;
    }
    
    let result;
    if (action === 'adminLogin') {
      result = adminLogin(payload);
    } else if (action === 'getParticipants') {
      result = { participants: getParticipants() };
    } else if (action === 'getDashboardStats') {
      result = getDashboardStats();
    } else if (action === 'updateStatus') {
      result = updateStatus(payload);
    } else if (action === 'updateStatuses') {
      result = updateStatuses(payload);
    } else if (action === 'logScan') {
      result = logScan(payload);
    } else if (action === 'getScanHistory') {
      result = getScanHistory();
    } else if (action === 'updateAdminPassword') {
      result = updateAdminPassword(payload);
    } else if (action === 'checkInParticipant') {
      result = checkInParticipant(payload);
    } else if (action === 'sendRegistrationPass') {
      result = sendRegistrationPass(payload);
    } else if (action === 'submitIndividual') {
      result = submitIndividual(payload);
    } else {
      return errorResponse("Unknown action");
    }
    return jsonResponse(result);
  } catch (err) {
    return errorResponse(err.message);
  }
}

function checkStatus(query) {
  try { logAction('CHECK_STATUS', 'Received query: ' + JSON.stringify(query)); } catch(e){}
  
  if (!query) {
    try { logAction('CHECK_STATUS', 'Empty query'); } catch(e){}
    return { statuses: [] };
  }
  
  const ss = getSpreadsheet();
  const queryStr = String(query).trim().toLowerCase();
  const normalizedQueryPhone = queryStr.replace(/[\s\-()]/g, '');
  const queryIsPhone = /^\d+$/.test(normalizedQueryPhone) && normalizedQueryPhone.length > 0;
  
  const searchQ = (queryIsPhone && normalizedQueryPhone.length > 5) ? normalizedQueryPhone : queryStr;
  
  const toCamelCase = (str) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  };

  // 1. TextFinder lookup for Participants
  const partSheet = ss.getSheetByName('Participants');
  const statuses = [];
  if (partSheet) {
    const tf = partSheet.createTextFinder(searchQ).findAll();
    if (tf.length > 0) {
      const data = partSheet.getDataRange().getValues();
      const headers = data[0];
      const idIdx = headers.findIndex(h => String(h).toLowerCase().includes('registration id') || String(h).toLowerCase() === 'id');
      const phoneIdx = headers.findIndex(h => String(h).toLowerCase().includes('phone'));
      
      const seenIds = new Set();
      
      tf.forEach(cell => {
        const rowIdx = cell.getRow() - 1;
        if (rowIdx === 0) return; // skip header
        
        const rawId = String(data[rowIdx][idIdx] || '');
        if (!rawId || seenIds.has(rawId)) return;
        
        // Verify it's a real match in ID or Phone (since TextFinder searches everywhere)
        const id = rawId.toLowerCase().trim();
        const rawPhone = String(data[rowIdx][phoneIdx] || '');
        const normalizedPhone = rawPhone.replace(/[\s\-()]/g, '');
        
        const isIdMatch = id === queryStr;
        const isPhoneMatch = queryIsPhone && normalizedPhone === normalizedQueryPhone && normalizedPhone.length > 0;
        
        if (isIdMatch || isPhoneMatch) {
          seenIds.add(rawId);
          const details = {};
          headers.forEach((header, index) => {
            let key = String(header).trim();
            if (key.toLowerCase() === 't-shirt size') key = 'tshirtSize';
            else if (key.toLowerCase() === 'registration id') key = 'id';
            else key = toCamelCase(key);
            
            details[key] = data[rowIdx][index];
          });
          
          statuses.push({
            id: rawId,
            status: details.status || 'Confirmed',
            details: details
          });
        }
      });
    }
  }

  return { type: 'individual', statuses };
}

function adminLogin(payload) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Admins');
  if (!sheet) throw new Error('Admins sheet not found');
  const data = sheet.getDataRange().getDisplayValues();
  const email = String(payload.email || '').trim().toLowerCase();
  
  for (let i = 1; i < data.length; i++) {
    const sheetEmail = String(data[i][0] || '').trim().toLowerCase();
    if (sheetEmail === email && email !== '') {
      const token = Utilities.getUuid();
      CacheService.getScriptCache().put('admin_token_' + token, JSON.stringify({ email: email, role: data[i][2] || 'ADMIN' }), 21600); // 6 hours
      return { success: true, admin: { email: email, role: data[i][2] || 'ADMIN', token: token } };
    }
  }
  throw new Error("Invalid credentials");
}

function getParticipants() {
  const start = Date.now();
  const cache = CacheService.getScriptCache();
  const cached = cache.get('participants_data');
  if (cached) {
    try { return JSON.parse(cached); } catch(e) {}
  }
  
  const ss = getSpreadsheet();
  const parts = [];
  
  const toCamelCase = (str) => {
    return str.replace(/(?:^\w|[A-Z]| \w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  };

  const processSheet = (sheetName, type) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    // SCALE LIMITATION: getDataRange().getValues() loads the entire sheet into memory.
    // Safe up to ~10,000-20,000 rows. Beyond that, memory/execution time limits may be hit.
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;
    const headers = data[0];
    const mappings = headers.map(h => {
      let key = String(h).trim();
      if (key.toLowerCase() === 't-shirt size') return 'tshirtSize';
      if (key.toLowerCase() === 'participant name') return 'name';
      if (key.toLowerCase() === 'registration id') return 'id';
      return toCamelCase(key);
    });
    
    for (let i = 1; i < data.length; i++) {
      const obj = { type };
      headers.forEach((h, j) => {
        obj[mappings[j]] = data[i][j];
      });
      parts.push(obj);
    }
  };
  
  processSheet('Participants', 'INDIVIDUAL');
  
  const result = parts.reverse();
  cache.put('participants_data', JSON.stringify(result), 60); // 1 min cache
  console.log(`getParticipants duration: ${Date.now() - start}ms, rows: ${result.length}`);
  return result;
}

function getDashboardStats() {
  const start = Date.now();
  const cache = CacheService.getScriptCache();
  const cached = cache.get('dashboard_stats');
  if (cached) {
    try { return JSON.parse(cached); } catch(e) {}
  }

  const ss = getSpreadsheet();
  const stats = {
    totalRegistrations: 0,
    totalParticipants: 0,
    individualRegistrations: 0,
    pwdParticipants: 0,
    pendingValidation: 0,
    confirmedRegistrations: 0,
    bandsAssigned: 0,
    bandsPending: 0,
    byCategory: {},
    byTshirtSize: {},
    trends: []
  };

  const trendsMap = {};

  const processStats = (sheetName) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;
    const headers = data[0];
    
    // Use trim and lowerCase, replace multiple spaces with single space
    const normalizeHeader = (h) => String(h).trim().toLowerCase().replace(/\s+/g, ' ');
    
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

      const hasFamilyStr = String(hasFamily).trim().toLowerCase();
      if (hasFamilyStr === 'yes' || hasFamilyStr === 'true') {
        familyCount = 1;
        count++;
      }
      
      const hasCaretakerStr = String(hasCaretaker).trim().toLowerCase();
      if (hasCaretakerStr === 'yes' || hasCaretakerStr === 'true') {
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
      
      if (cat) {
        if (!stats.byCategory[cat]) stats.byCategory[cat] = { individual: 0, family: 0, caretaker: 0 };
        stats.byCategory[cat].individual += 1;
        stats.byCategory[cat].family += familyCount;
        stats.byCategory[cat].caretaker += caretakerCount;
      }

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
  };

  processStats('Participants');

  stats.trends = Object.values(trendsMap).sort((a, b) => a.date.localeCompare(b.date));
  
  cache.put('dashboard_stats', JSON.stringify(stats), 300); // 5 mins cache
  console.log(`getDashboardStats duration: ${Date.now() - start}ms`);
  return stats;
}

function submitIndividual(payload) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName('Participants');
  if (!sheet) throw new Error("Participants sheet not found");
  
  const participantName = String(payload.name || '').trim();
  if (!participantName) {
    throw new Error("Validation Error: Participant name is missing or empty.");
  }
  
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    throw new Error("System is currently busy due to high traffic. Please try submitting again.");
  }
  
  let id;
  try {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    

    
    
    
    // Generate sequential ID
    const idIdx = headers.findIndex(h => String(h).toLowerCase() === 'registration id');
    let nextNum = 1;
    if (idIdx !== -1) {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        const lastId = sheet.getRange(lastRow, idIdx + 1).getValue();
        const match = String(lastId).match(/IND-(\d+)/);
        if (match) {
          nextNum = parseInt(match[1], 10) + 1;
        } else {
           const allIds = sheet.getRange(2, idIdx + 1, lastRow - 1, 1).getValues();
           for (let i = allIds.length - 1; i >= 0; i--) {
             const m = String(allIds[i][0]).match(/IND-(\d+)/);
             if (m) {
               nextNum = parseInt(m[1], 10) + 1;
               break;
             }
           }
        }
      }
    }
    id = 'IND-' + nextNum.toString().padStart(4, '0');
    const row = new Array(headers.length).fill('');
    
    const setVal = (colName, val) => {
      let idx = headers.findIndex(h => String(h).toLowerCase() === String(colName).toLowerCase());
      if (idx === -1) {
        headers.push(colName);
        idx = headers.length - 1;
        sheet.getRange(1, headers.length).setValue(colName);
      }
      row[idx] = val;
    };
    
    setVal('Registration ID', id);
    setVal('Timestamp', new Date().toISOString());
    setVal('Name', participantName);
    setVal('Age', payload.age);
    setVal('Gender', payload.gender);
    setVal('Phone', payload.phone);
    setVal('Email', payload.email);
    setVal('Category', payload.category);
    setVal('T-Shirt Size', payload.tshirtSize);
    setVal('Status', 'Confirmed');

    // Common Fields
    setVal('Organization', payload.organization || '');
    
    // PWD Category Specific
    setVal('Disability Type', payload.disabilityType || '');
    setVal('Disability Other', payload.disabilityOther || '');
    setVal('Institution Name', payload.institutionName || '');
    setVal('Special Requirements', payload.specialRequirements || '');
    
    setVal('Has Caretaker', payload.hasCaretaker ? 'Yes' : 'No');
    setVal('Caretaker Name', payload.caretakerName || '');
    setVal('Caretaker T-Shirt Size', payload.caretakerTShirtSize || '');

    // YI Member Category Specific
    setVal('Employer', payload.employer || '');
    setVal('Yi Chapter', payload.yiChapter || '');
    
    setVal('Has Family Member', payload.hasFamilyMember ? 'Yes' : 'No');
    setVal('Family Member Name', payload.familyMemberName || '');
    setVal('Family Member T-Shirt Size', payload.familyMemberTShirtSize || '');
    
    // Special Invitee Category Specific
    setVal('Remarks', payload.remarks || '');
    
    
    // Dynamically capture any other unexpected fields from the frontend
    const knownKeys = ['name', 'age', 'gender', 'phone', 'email', 'category', 'tshirtSize', 'organization', 'disabilityType', 'disabilityOther', 'institutionName', 'specialRequirements', 'hasCaretaker', 'caretakerName', 'caretakerTShirtSize', 'employer', 'yiChapter', 'hasFamilyMember', 'familyMemberName', 'familyMemberTShirtSize', 'remarks', 'forceSubmit'];
    for (const key in payload) {
      if (payload.hasOwnProperty(key) && !knownKeys.includes(key)) {
        const colName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        setVal(colName, payload[key] || '');
      }
    }
    
    sheet.appendRow(row);

    CacheService.getScriptCache().remove('dashboard_stats');
    CacheService.getScriptCache().remove('participants_data');
  } finally {
    lock.releaseLock();
  }
  return { success: true, id };
}

// Removed submitInstitution

function updateStatus(payload) {
  const start = Date.now();
  const ss = getSpreadsheet();
  const rawId = payload.registrationId || payload.id;
  const status = payload.status;
  
  const sheetName = 'Participants';
  const sheet = ss.getSheetByName(sheetName);
  
  const tf = sheet.createTextFinder(rawId).matchEntireCell(true).findNext();
  if (!tf) throw new Error("Registration not found");
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const statusIdx = headers.findIndex(h => String(h).toLowerCase() === 'status');
  if (statusIdx !== -1) {
    sheet.getRange(tf.getRow(), statusIdx + 1).setValue(status);
  }
  
  CacheService.getScriptCache().remove('dashboard_stats');
  CacheService.getScriptCache().remove('participants_data');
  console.log(`updateStatus duration: ${Date.now() - start}ms`);
  return { success: true, registrationId: rawId, status };
}

function updateStatuses(payload) {
  const start = Date.now();
  const ss = getSpreadsheet();
  const idsToUpdate = new Set(payload.registrationIds);
  const newStatus = payload.status;
  const updated = [];
  const failed = [];

  const updateSheet = (sheetName) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    // SCALE LIMITATION: getDataRange().getValues() loads the entire sheet into memory.
    // Safe up to ~10,000-20,000 rows. Beyond that, memory/execution time limits may be hit.
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;
    
    const headers = data[0];
    const idIdx = headers.findIndex(h => String(h).toLowerCase().trim() === 'registration id' || String(h).toLowerCase().trim() === 'id');
    const statusIdx = headers.findIndex(h => String(h).toLowerCase().trim() === 'status');
    
    if (idIdx !== -1 && statusIdx !== -1) {
      const statusRange = sheet.getRange(2, statusIdx + 1, data.length - 1, 1);
      const statusValues = statusRange.getValues();
      let hasUpdates = false;
      for (let i = 1; i < data.length; i++) {
        const id = String(data[i][idIdx] || '').trim();
        if (id && idsToUpdate.has(id)) {
          statusValues[i - 1][0] = newStatus;
          hasUpdates = true;
          updated.push(id);
          idsToUpdate.delete(id);
        }
      }
      if (hasUpdates) statusRange.setValues(statusValues);
    }
  };

  updateSheet('Participants');

  idsToUpdate.forEach(id => failed.push(id));
  
  CacheService.getScriptCache().remove('dashboard_stats');
  CacheService.getScriptCache().remove('participants_data');
  console.log(`updateStatuses duration: ${Date.now() - start}ms, processed IDs: ${idsToUpdate.size}`);
  return { success: true, updated, failed };
}

function checkInParticipant(payload) {
  const start = Date.now();
  const id = String(payload.registrationId || '').trim();
  const ss = getSpreadsheet();
  const sheetName = 'Participants';
  const sheet = ss.getSheetByName(sheetName);
  
  const tf = sheet.createTextFinder(id).matchEntireCell(true).findNext();
  if (!tf) throw new Error("Registration not found");
  
  const rowIndex = tf.getRow();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const statusIdx = headers.findIndex(h => String(h).toLowerCase() === 'status');
  const rowData = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const adminEmail = payload._authenticatedEmail;
  if (!adminEmail) {
    throw new Error("Unauthorized access. Admin validation failed.");
  }
  
  // Event Date Validation for ALL check-ins to be safe, or just volunteers if requested
  // "Check-in must only be permitted on 6 September 2026 in IST. Enforce this AFTER authentication"
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'numeric', day: 'numeric' });
  const parts = formatter.formatToParts(now);
  let month = '', day = '', year = '';
  parts.forEach(p => {
    if (p.type === 'month') month = p.value;
    if (p.type === 'day') day = p.value;
    if (p.type === 'year') year = p.value;
  });
  if (!(year === '2026' && month === '9' && day === '6')) {
    throw new Error("Check-in is only permitted on the event day (6 September 2026 IST).");
  }

  const details = {};
  const toCamelCase = (str) => {
    return str.replace(/(?:^\w|[A-Z]| \w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  };
  headers.forEach((h, i) => {
    let key = String(h).trim();
    if (key.toLowerCase() === 't-shirt size') key = 'tshirtSize';
    else if (key.toLowerCase() === 'participant name') key = 'name';
    else if (key.toLowerCase() === 'registration id') key = 'id';
    else key = toCamelCase(key);
    details[key] = rowData[i];
  });
  details.status = 'Checked In';

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    throw new Error("System is busy (high traffic). Please scan again.");
  }
  
  try {
    // Re-read status inside lock
    if (statusIdx !== -1) {
      const currentStatus = String(sheet.getRange(rowIndex, statusIdx + 1).getValue() || '').trim();
      if (currentStatus.toLowerCase() === 'checked in') {
        throw new Error("ALREADY_CHECKED_IN");
      }
      sheet.getRange(rowIndex, statusIdx + 1).setValue('Checked In');
    }
    
    let historySheet = ss.getSheetByName('ScanHistory');
    if (!historySheet) {
      historySheet = ss.insertSheet('ScanHistory');
      historySheet.appendRow(['Registration ID', 'Timestamp', 'Admin ID', 'Scan Type']);
    }
    historySheet.appendRow([id, new Date().toISOString(), payload._authenticatedEmail || 'Unknown', 'INDIVIDUAL']);
  } finally {
    lock.releaseLock();
  }
  
  CacheService.getScriptCache().remove('dashboard_stats');
  CacheService.getScriptCache().remove('participants_data');
  console.log(`checkInParticipant duration: ${Date.now() - start}ms`);
  return { success: true, participant: details };
}

function logScan(payload) {
  const start = Date.now();
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName('ScanHistory');
  if (!sheet) {
    sheet = ss.insertSheet('ScanHistory');
    sheet.appendRow(['Registration ID', 'Timestamp', 'Admin ID', 'Scan Type']);
  }
  const id = String(payload.registrationId || '');
  const scanType = 'INDIVIDUAL';
  
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    throw new Error("Could not acquire lock to log scan due to high traffic. Please try again.");
  }
  try {
    sheet.appendRow([id, new Date().toISOString(), payload._authenticatedEmail || 'Unknown', scanType]);
  } finally {
    lock.releaseLock();
  }
  console.log(`logScan duration: ${Date.now() - start}ms`);
  return { success: true };
}

function getScanHistory() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('ScanHistory');
  if (!sheet) return { history: [] };
  
  const data = sheet.getDataRange().getValues();
  const history = [];
  for (let i = data.length - 1; i > 0; i--) {
    history.push({
      registrationId: data[i][0],
      timestamp: data[i][1],
      adminId: data[i][2],
      type: data[i][3] || 'INDIVIDUAL'
    });
    if (history.length >= 50) break;
  }
  return { history };
}

function sendRegistrationPass(payload) {
  const ss = getSpreadsheet();
  const registrationId = payload.registrationId;
  const sheetName = 'Participants';
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet not found.');

  const tf = sheet.createTextFinder(registrationId).matchEntireCell(true).findNext();
  if (!tf) throw new Error('Registration not found.');
  
  const rowIndex = tf.getRow();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const foundRow = data[rowIndex - 1];

  const emailIdx = headers.findIndex(h => String(h).toLowerCase() === 'email');
  const nameIdx = headers.findIndex(h => String(h).toLowerCase() === 'participant name');
  const statusIdx = headers.findIndex(h => String(h).toLowerCase() === 'status');
  const categoryIdx = headers.findIndex(h => String(h).toLowerCase() === 'category');
  const tshirtIdx = headers.findIndex(h => String(h).toLowerCase() === 't-shirt size');
  const phoneIdx = headers.findIndex(h => String(h).toLowerCase() === 'phone');

  const email = String(foundRow[emailIdx]).trim();
  if (!email) throw new Error('Email address was not provided during registration.');

  const name = foundRow[nameIdx] || 'Participant';
  const status = foundRow[statusIdx] || 'Confirmed';
  const category = foundRow[categoryIdx] || '';
  const tshirtSize = foundRow[tshirtIdx] || '';
  const phone = foundRow[phoneIdx] || '';

  const subject = `WalkAlong Registration Confirmation — ${registrationId}`;

  const settingsSheet = ss.getSheetByName('Settings');
  let eventDate = '06 September 2026';
  let eventTime = '07:30 AM IST';
  if (settingsSheet) {
    const settingsData = settingsSheet.getDataRange().getValues();
    for(let i=0; i<settingsData.length; i++){
      if(settingsData[i][0] === 'eventDate' && settingsData[i][1]) {
        eventDate = settingsData[i][1];
      }
    }
  }

  const body = `WalkAlong Chennai Chapter
Your registration for WalkAlong has been confirmed.

Registration ID: ${registrationId}
Participant Name: ${name}
Category: ${category}
T-Shirt Size: ${tshirtSize}
Phone: ${phone}
Registration Status: ${status}

Event: WalkAlong
Date: ${eventDate}
Time: ${eventTime}
Venue: Marina Beach`;

  try {
    MailApp.sendEmail(email, subject, body);
    logAction('SEND_PASS_EMAIL', { id: registrationId, email: email });
    return { success: true, message: 'Registration pass sent to your email.' };
  } catch (e) {
    logAction('ERROR', `Failed to send email to ${email}: ${e.message}`);
    throw new Error('We couldn\'t send your pass right now. Please try again.');
  }
}

// Removed validateInstitutionFile

function updateAdminPassword(payload) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Admins');
  if (!sheet) throw new Error('Admins sheet not found');
  
  const email = String(payload.email || '').trim().toLowerCase();
  const currentPassword = payload.currentPassword || '';
  const newPassword = payload.newPassword || '';
  
  const values = sheet.getDataRange().getDisplayValues();
  let matchedRow = -1;
  let storedHash = '';
  
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0] || '').trim().toLowerCase() === email) {
      matchedRow = i;
      storedHash = String(values[i][1] || '').trim();
      break;
    }
  }
  
  if (matchedRow === -1) throw new Error('Admin not found');
  
  const computeHash = (pw) => Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pw).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  
  if (storedHash !== '' && computeHash(currentPassword).toLowerCase() !== storedHash.toLowerCase()) {
    throw new Error('Invalid current password');
  }
  
  sheet.getRange(matchedRow + 1, 2).setValue(computeHash(newPassword));
  
  const currentRole = String(values[matchedRow][2] || '').trim();
  if (!currentRole) {
    sheet.getRange(matchedRow + 1, 3).setValue('ADMIN');
  }
  
  return { success: true };
}


