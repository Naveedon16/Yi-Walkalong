import sys

with open('apps-script/Code.js', 'r') as f:
    content = f.read()

# 1. logAction locking
old_logaction = """function logAction(action, details) {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName('Logs');
    if (!sheet) {
      sheet = ss.insertSheet('Logs');
      sheet.appendRow(['Timestamp', 'Action', 'Details']);
    }
    sheet.appendRow([new Date().toISOString(), action, JSON.stringify(details)]);
  } catch (e) {}
}"""

new_logaction = """function logAction(action, details) {
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
}"""
content = content.replace(old_logaction, new_logaction)

# 2. logScan locking
old_logscan = """function logScan(payload) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName('ScanHistory');
  if (!sheet) {
    sheet = ss.insertSheet('ScanHistory');
    sheet.appendRow(['Registration ID', 'Timestamp', 'Admin ID', 'Scan Type']);
  }
  const id = String(payload.registrationId || '');
  const scanType = id.includes('-INS-') ? 'INSTITUTION' : 'INDIVIDUAL';
  sheet.appendRow([id, new Date().toISOString(), payload.adminId || 'Unknown', scanType]);
  return { success: true };
}"""

new_logscan = """function logScan(payload) {
  const start = Date.now();
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName('ScanHistory');
  if (!sheet) {
    sheet = ss.insertSheet('ScanHistory');
    sheet.appendRow(['Registration ID', 'Timestamp', 'Admin ID', 'Scan Type']);
  }
  const id = String(payload.registrationId || '');
  const scanType = id.includes('-INS-') ? 'INSTITUTION' : 'INDIVIDUAL';
  
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    throw new Error("Could not acquire lock to log scan due to high traffic. Please try again.");
  }
  try {
    sheet.appendRow([id, new Date().toISOString(), payload.adminId || 'Unknown', scanType]);
  } finally {
    lock.releaseLock();
  }
  console.log(`logScan duration: ${Date.now() - start}ms`);
  return { success: true };
}"""
content = content.replace(old_logscan, new_logscan)

# 3. checkInParticipant locking
old_checkin = """function checkInParticipant(payload) {
  const id = String(payload.registrationId || '').trim();
  const ss = getSpreadsheet();
  const sheetName = id.includes('-INS-') ? 'Institutions' : 'Participants';
  const sheet = ss.getSheetByName(sheetName);
  
  const tf = sheet.createTextFinder(id).matchEntireCell(true).findNext();
  if (!tf) throw new Error("Registration not found");
  
  const rowIndex = tf.getRow();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const statusIdx = headers.findIndex(h => String(h).toLowerCase() === 'status');
  
  if (statusIdx !== -1) {
    sheet.getRange(rowIndex, statusIdx + 1).setValue('Checked In');
  }

  const rowData = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
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

  try {
    let historySheet = ss.getSheetByName('ScanHistory');
    if (!historySheet) {
      historySheet = ss.insertSheet('ScanHistory');
      historySheet.appendRow(['Registration ID', 'Timestamp', 'Admin ID', 'Scan Type']);
    }
    historySheet.appendRow([id, new Date().toISOString(), payload.adminId || 'Unknown', sheetName === 'Institutions' ? 'INSTITUTION' : 'INDIVIDUAL']);
  } catch(e) {}
  
  CacheService.getScriptCache().remove('dashboard_stats');
  CacheService.getScriptCache().remove('participants_data');
  return { success: true, participant: details };
}"""

new_checkin = """function checkInParticipant(payload) {
  const start = Date.now();
  const id = String(payload.registrationId || '').trim();
  const ss = getSpreadsheet();
  const sheetName = id.includes('-INS-') ? 'Institutions' : 'Participants';
  const sheet = ss.getSheetByName(sheetName);
  
  const tf = sheet.createTextFinder(id).matchEntireCell(true).findNext();
  if (!tf) throw new Error("Registration not found");
  
  const rowIndex = tf.getRow();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const statusIdx = headers.findIndex(h => String(h).toLowerCase() === 'status');
  const rowData = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  const details = {};
  
  const toCamelCase = (str) => {
    return str.replace(/(?:^\\w|[A-Z]| \\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\\s+/g, '');
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

  let historySheet = ss.getSheetByName('ScanHistory');
  if (!historySheet) {
    historySheet = ss.insertSheet('ScanHistory');
    historySheet.appendRow(['Registration ID', 'Timestamp', 'Admin ID', 'Scan Type']);
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    throw new Error("System is busy (high traffic). Please scan again.");
  }
  try {
    if (statusIdx !== -1) {
      sheet.getRange(rowIndex, statusIdx + 1).setValue('Checked In');
    }
    historySheet.appendRow([id, new Date().toISOString(), payload.adminId || 'Unknown', sheetName === 'Institutions' ? 'INSTITUTION' : 'INDIVIDUAL']);
  } finally {
    lock.releaseLock();
  }
  
  CacheService.getScriptCache().remove('dashboard_stats');
  CacheService.getScriptCache().remove('participants_data');
  console.log(`checkInParticipant duration: ${Date.now() - start}ms`);
  return { success: true, participant: details };
}"""
content = content.replace(old_checkin, new_checkin.replace('\\\\', '\\')) # Fix python backslash escaping

# 4. getDashboardStats logging
content = content.replace("function getDashboardStats() {\n  const cache", "function getDashboardStats() {\n  const start = Date.now();\n  const cache")
content = content.replace("cache.put('dashboard_stats', JSON.stringify(stats), 300); // 5 mins cache\n  return stats;\n}", "cache.put('dashboard_stats', JSON.stringify(stats), 300); // 5 mins cache\n  console.log(`getDashboardStats duration: ${Date.now() - start}ms`);\n  return stats;\n}")

# 5. getParticipants logging & comment
content = content.replace("function getParticipants() {\n  const cache", "function getParticipants() {\n  const start = Date.now();\n  const cache")
content = content.replace("const sheet = ss.getSheetByName(sheetName);\n    if (!sheet) return;\n    const data = sheet.getDataRange().getValues();", "const sheet = ss.getSheetByName(sheetName);\n    if (!sheet) return;\n    // SCALE LIMITATION: getDataRange().getValues() loads the entire sheet into memory.\n    // Safe up to ~10,000-20,000 rows. Beyond that, memory/execution time limits may be hit.\n    const data = sheet.getDataRange().getValues();")
content = content.replace("cache.put('participants_data', JSON.stringify(result), 60); // 1 min cache\n  return result;\n}", "cache.put('participants_data', JSON.stringify(result), 60); // 1 min cache\n  console.log(`getParticipants duration: ${Date.now() - start}ms, rows: ${result.length}`);\n  return result;\n}")

# 6. updateStatuses logging & comment
content = content.replace("function updateStatuses(payload) {\n  const ss = getSpreadsheet();", "function updateStatuses(payload) {\n  const start = Date.now();\n  const ss = getSpreadsheet();")
content = content.replace("const sheet = ss.getSheetByName(sheetName);\n    if (!sheet) return;\n    const data = sheet.getDataRange().getValues();", "const sheet = ss.getSheetByName(sheetName);\n    if (!sheet) return;\n    // SCALE LIMITATION: Full sheet memory load for bulk mapping.\n    // Considered a safe fallback over fragile caching of mutable row indices.\n    const data = sheet.getDataRange().getValues();")
content = content.replace("CacheService.getScriptCache().remove('dashboard_stats');\n  CacheService.getScriptCache().remove('participants_data');\n  return { success: true, updated, failed };\n}", "CacheService.getScriptCache().remove('dashboard_stats');\n  CacheService.getScriptCache().remove('participants_data');\n  console.log(`updateStatuses duration: ${Date.now() - start}ms, processed IDs: ${idsToUpdate.size}`);\n  return { success: true, updated, failed };\n}")

# 7. updateStatus logging
content = content.replace("function updateStatus(payload) {\n  const ss = getSpreadsheet();", "function updateStatus(payload) {\n  const start = Date.now();\n  const ss = getSpreadsheet();")
content = content.replace("CacheService.getScriptCache().remove('dashboard_stats');\n  CacheService.getScriptCache().remove('participants_data');\n  return { success: true, registrationId: rawId, status };\n}", "CacheService.getScriptCache().remove('dashboard_stats');\n  CacheService.getScriptCache().remove('participants_data');\n  console.log(`updateStatus duration: ${Date.now() - start}ms`);\n  return { success: true, registrationId: rawId, status };\n}")

with open('apps-script/Code.js', 'w') as f:
    f.write(content)
