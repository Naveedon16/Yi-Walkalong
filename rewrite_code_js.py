import re

with open('apps-script/Code.js', 'r') as f:
    content = f.read()

# 1. Update registerInstitution to batch writes
old_register_inst = """  participants.forEach((p, i) => {
    const row = new Array(headers.length).fill('');
    const participantId = `${institutionId}-${String(i + 1).padStart(3, '0')}`;
    row[getColIndex('Institution ID')] = institutionId;
    row[getColIndex('Registration ID')] = participantId;
    row[getColIndex('Timestamp')] = timestamp;
    row[getColIndex('Participant Name')] = p.name || '';
    row[getColIndex('Age')] = p.age || '';
    row[getColIndex('Gender')] = p.gender || '';
    row[getColIndex('Phone')] = p.phone || '';
    row[getColIndex('Email')] = p.email || '';
    row[getColIndex('T-Shirt Size')] = p.tshirtSize || '';
    row[getColIndex('Category')] = p.category || '';
    row[getColIndex('Institution Name')] = p.institutionName || '';
    row[getColIndex('Coordinator Name')] = p.coordinatorName || '';
    row[getColIndex('Coordinator Email')] = p.coordinatorEmail || '';
    row[getColIndex('Coordinator Phone')] = p.coordinatorPhone || '';
    row[getColIndex('Status')] = 'Confirmed';
    
    sheet.appendRow(row);
  });"""

new_register_inst = """  const rows = participants.map((p, i) => {
    const row = new Array(headers.length).fill('');
    const participantId = `${institutionId}-${String(i + 1).padStart(3, '0')}`;
    row[getColIndex('Institution ID')] = institutionId;
    row[getColIndex('Registration ID')] = participantId;
    row[getColIndex('Timestamp')] = timestamp;
    row[getColIndex('Participant Name')] = p.name || '';
    row[getColIndex('Age')] = p.age || '';
    row[getColIndex('Gender')] = p.gender || '';
    row[getColIndex('Phone')] = p.phone || '';
    row[getColIndex('Email')] = p.email || '';
    row[getColIndex('T-Shirt Size')] = p.tshirtSize || '';
    row[getColIndex('Category')] = p.category || '';
    row[getColIndex('Institution Name')] = p.institutionName || '';
    row[getColIndex('Coordinator Name')] = p.coordinatorName || '';
    row[getColIndex('Coordinator Email')] = p.coordinatorEmail || '';
    row[getColIndex('Coordinator Phone')] = p.coordinatorPhone || '';
    row[getColIndex('Status')] = 'Confirmed';
    return row;
  });
  
  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
  }"""

content = content.replace(old_register_inst, new_register_inst)

# 2. Update updateStatuses to batch writes
old_update_statuses = """        for (let i = 1; i < data.length; i++) {
          const id = String(data[i][idIdx] || '').trim();
          if (id && idsToUpdate.has(id)) {
            pSheet.getRange(i + 1, statusIdx + 1).setValue(newStatus);
            updated.push(id);
            idsToUpdate.delete(id);
          }
        }"""

new_update_statuses = """        const statusRange = pSheet.getRange(2, statusIdx + 1, data.length - 1, 1);
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
        if (hasUpdates) statusRange.setValues(statusValues);"""
content = content.replace(old_update_statuses, new_update_statuses)

old_update_statuses_inst = """        for (let i = 1; i < data.length; i++) {
          const id = String(data[i][idIdx] || '').trim();
          if (id && idsToUpdate.has(id)) {
            iSheet.getRange(i + 1, statusIdx + 1).setValue(newStatus);
            updated.push(id);
            idsToUpdate.delete(id);
          }
        }"""

new_update_statuses_inst = """        const statusRange = iSheet.getRange(2, statusIdx + 1, data.length - 1, 1);
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
        if (hasUpdates) statusRange.setValues(statusValues);"""
content = content.replace(old_update_statuses_inst, new_update_statuses_inst)

# 3. Cache getDashboardStats
old_get_stats_start = """function getDashboardStats() {
  const ss = getSpreadsheet();"""

new_get_stats_start = """function getDashboardStats() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('dashboard_stats');
  if (cached) {
    try { return JSON.parse(cached); } catch(e) {}
  }
  const ss = getSpreadsheet();"""

old_get_stats_end = """  stats.trends = Object.values(trends).sort((a, b) => a.date.localeCompare(b.date));
  return stats;
}"""

new_get_stats_end = """  stats.trends = Object.values(trends).sort((a, b) => a.date.localeCompare(b.date));
  cache.put('dashboard_stats', JSON.stringify(stats), 300); // 5 mins
  return stats;
}"""
content = content.replace(old_get_stats_start, new_get_stats_start)
content = content.replace(old_get_stats_end, new_get_stats_end)

# Invalidate cache when status is updated
content = content.replace("try { logAction('UPDATE_STATUS', { id: rawId, status: status }); } catch(e){}", "try { logAction('UPDATE_STATUS', { id: rawId, status: status }); CacheService.getScriptCache().remove('dashboard_stats'); } catch(e){}")
content = content.replace("return { success: true, updated, failed };", "CacheService.getScriptCache().remove('dashboard_stats');\n    return { success: true, updated, failed };")
content = content.replace("logAction('REGISTER_INDIVIDUAL', { id, name: details.name });", "logAction('REGISTER_INDIVIDUAL', { id, name: details.name });\n  CacheService.getScriptCache().remove('dashboard_stats');")
content = content.replace("try { logAction('REGISTER_INSTITUTION', { institutionId, count: participants.length }); } catch(e){}", "try { logAction('REGISTER_INSTITUTION', { institutionId, count: participants.length }); CacheService.getScriptCache().remove('dashboard_stats'); } catch(e){}")

# 4. Add checkInParticipant endpoint
check_in_code = """
function checkInParticipant(payload) {
  const id = String(payload.registrationId || '').trim();
  if (!id) throw new Error("Registration ID is required");
  const ss = getSpreadsheet();
  const sheetName = id.includes('-INS-') ? 'Institutions' : 'Participants';
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet not found");

  const tf = sheet.createTextFinder(id).matchEntireCell(true).findAll();
  if (!tf || tf.length === 0) throw new Error("Registration not found");
  const rowIndex = tf[0].getRow();
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  let statusIdx = headers.findIndex(h => String(h).toLowerCase().trim() === 'status');
  
  if (statusIdx !== -1) {
    sheet.getRange(rowIndex, statusIdx + 1).setValue('Checked In');
  }

  const rowData = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  const details = {};
  
  const toCamelCase = (str) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
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
  return { success: true, participant: details };
}
"""

content += check_in_code

# Add checkInParticipant to doPost
post_routes_old = """    } else if (action === 'logScan') {"""
post_routes_new = """    } else if (action === 'checkInParticipant') {
      validateAdminToken(payload?.token);
      result = checkInParticipant(payload);
    } else if (action === 'logScan') {"""
content = content.replace(post_routes_old, post_routes_new)

with open('apps-script/Code.js', 'w') as f:
    f.write(content)

print("Rewrote Code.js")
