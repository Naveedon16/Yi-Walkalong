const fs = require('fs');
let code = fs.readFileSync('apps-script/Code.js', 'utf-8');

const replacement = `
  const rowIndex = tf.getRow();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const statusIdx = headers.findIndex(h => String(h).toLowerCase() === 'status');
  const rowData = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  if (statusIdx !== -1) {
    const currentStatus = String(rowData[statusIdx] || '').trim();
    if (currentStatus.toLowerCase() === 'checked in') {
      throw new Error("ALREADY_CHECKED_IN");
    }
  }

  // Authorization checks
  const role = payload.role || 'ADMIN'; // Frontend should pass this if possible, or we look it up.
  // Actually, wait, let's lookup the role based on adminId (email)
  let adminRole = 'ADMIN';
  const adminEmail = String(payload.adminId || '').trim().toLowerCase();
  if (adminEmail) {
    const adminSheet = ss.getSheetByName('Admins');
    if (adminSheet) {
      const adminData = adminSheet.getDataRange().getDisplayValues();
      for (let i = 1; i < adminData.length; i++) {
        if (String(adminData[i][0] || '').trim().toLowerCase() === adminEmail) {
          adminRole = String(adminData[i][2] || 'ADMIN').toUpperCase();
          break;
        }
      }
    }
  }

  if (adminRole === 'VOLUNTEER') {
    // Check if it's Sep 6, 2026 in IST
    const now = new Date();
    // format to IST
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'numeric', day: 'numeric' });
    const parts = formatter.formatToParts(now);
    let month = '', day = '', year = '';
    parts.forEach(p => {
      if (p.type === 'month') month = p.value;
      if (p.type === 'day') day = p.value;
      if (p.type === 'year') year = p.value;
    });
    // Sep 6 2026 => month 9, day 6, year 2026
    if (!(year === '2026' && month === '9' && day === '6')) {
      throw new Error("Volunteers can only check in participants on the event day (6 September 2026).");
    }
  }

  const details = {};
`;

code = code.replace(/  const rowIndex = tf\.getRow\(\);\n  const headers = sheet\.getRange\(1, 1, 1, sheet\.getLastColumn\(\)\)\.getValues\(\)\[0\];\n  const statusIdx = headers\.findIndex\(h => String\(h\)\.toLowerCase\(\) === 'status'\);\n  const rowData = sheet\.getRange\(rowIndex, 1, 1, sheet\.getLastColumn\(\)\)\.getValues\(\)\[0\];\n  const details = \{\};/g, replacement);

fs.writeFileSync('apps-script/Code.js', code);
