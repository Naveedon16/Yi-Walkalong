const fs = require('fs');
let code = fs.readFileSync('apps-script/Code.js', 'utf8');

// 1. Rewrite validateToken to return session object
code = code.replace(
  /function validateToken\(token\) \{\s*if \(\!token\) return false;\s*const session = CacheService\.getScriptCache\(\)\.get\('admin_token_' \+ token\);\s*return \!\!session;\s*\}/m,
  `function validateToken(token) {
  if (!token) return null;
  const sessionStr = CacheService.getScriptCache().get('admin_token_' + token);
  if (!sessionStr) return null;
  try { return JSON.parse(sessionStr); } catch (e) { return null; }
}`
);

// 2. Rewrite doPost to use session for RBAC
code = code.replace(
  /function doPost\(e\) \{[\s\S]*?try \{[\s\S]*?const body = JSON\.parse\(e\.postData\.contents\);\n    const action = body\.action;\n    const payload = body\.payload;\n    const token = payload\.token;\n    \n    \/\/ Protected actions\n    const protectedActions = \['getParticipants', 'getDashboardStats', 'updateStatus', 'updateStatuses', 'logScan', 'getScanHistory', 'checkInParticipant', 'sendRegistrationPass'\];\n    if \(protectedActions\.includes\(action\)\) \{\n      if \(\!validateToken\(token\)\) \{\n        return ContentService\.createTextOutput\(JSON\.stringify\(\{ success: false, error: 'Unauthorized access', code: 'UNAUTHORIZED' \}\)\)\.setMimeType\(ContentService\.MimeType\.JSON\);\n      \}\n    \}\n    \n    let result;\n    if \(action === 'adminLogin'\) \{/m,
  `function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const payload = body.payload;
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
    if (action === 'adminLogin') {`
);

// 3. Rewrite submitIndividual duplicate checking
code = code.replace(
  /    \/\/ Duplicate check\n    const emailIdx = headers\.findIndex\(h => String\(h\)\.toLowerCase\(\) === 'email'\);\n    const phoneIdx = headers\.findIndex\(h => String\(h\)\.toLowerCase\(\) === 'phone'\);\n    if \(emailIdx \!\=\= -1 \|\| phoneIdx \!\=\= -1\) \{\n      const data = sheet\.getDataRange\(\)\.getDisplayValues\(\);\n      for \(let i = 1; i < data\.length; i\+\+\) \{\n        const rowEmail = emailIdx \!\=\= -1 \? String\(data\[i\]\[emailIdx\]\)\.trim\(\)\.toLowerCase\(\) : '';\n        const rowPhone = phoneIdx \!\=\= -1 \? String\(data\[i\]\[phoneIdx\]\)\.trim\(\) : '';\n        const payloadEmail = String\(payload\.email \|\| ''\)\.trim\(\)\.toLowerCase\(\);\n        const payloadPhone = String\(payload\.phone \|\| ''\)\.trim\(\);\n        \n        if \(\(payloadEmail && rowEmail === payloadEmail\) \|\| \(payloadPhone && rowPhone === payloadPhone\)\) \{\n          throw new Error\("A registration with this email or phone number already exists\."\);\n        \}\n      \}\n    \}/m,
  `    // Duplicate check using TextFinder
    const payloadEmail = String(payload.email || '').trim().toLowerCase();
    const payloadPhone = String(payload.phone || '').trim();
    
    const emailIdx = headers.findIndex(h => String(h).toLowerCase() === 'email');
    const phoneIdx = headers.findIndex(h => String(h).toLowerCase() === 'phone');
    
    if (payloadEmail && emailIdx !== -1) {
      const emailCol = sheet.getRange(2, emailIdx + 1, sheet.getLastRow() || 1, 1);
      const tf = emailCol.createTextFinder(payloadEmail).matchEntireCell(true).findNext();
      if (tf) throw new Error("A registration with this email already exists.");
    }
    
    if (payloadPhone && phoneIdx !== -1) {
      const phoneCol = sheet.getRange(2, phoneIdx + 1, sheet.getLastRow() || 1, 1);
      const tf = phoneCol.createTextFinder(payloadPhone).matchEntireCell(true).findNext();
      if (tf) throw new Error("A registration with this phone number already exists.");
    }`
);

// 4. Secure checkInParticipant identity
code = code.replace(
  /  let adminRole = 'UNAUTHORIZED';\n  const adminEmail = String\(payload\.adminId \|\| ''\)\.trim\(\)\.toLowerCase\(\);\n  if \(adminEmail\) \{\n    const adminSheet = ss\.getSheetByName\('Admins'\);\n    if \(adminSheet\) \{\n      const adminData = adminSheet\.getDataRange\(\)\.getDisplayValues\(\);\n      for \(let i = 1; i < adminData\.length; i\+\+\) \{\n        if \(String\(adminData\[i\]\[0\] \|\| ''\)\.trim\(\)\.toLowerCase\(\) === adminEmail\) \{\n          adminRole = String\(adminData\[i\]\[2\] \|\| 'ADMIN'\)\.toUpperCase\(\);\n          break;\n        \}\n      \}\n    \}\n  \}\n  \n  if \(adminRole === 'UNAUTHORIZED'\) \{\n    throw new Error\("Unauthorized access\. Admin validation failed\."\);\n  \}/m,
  `  const adminEmail = payload._authenticatedEmail;
  if (!adminEmail) {
    throw new Error("Unauthorized access. Admin validation failed.");
  }`
);

code = code.replace(
  /    historySheet\.appendRow\(\[id, new Date\(\)\.toISOString\(\), payload\.adminId \|\| 'Unknown', 'INDIVIDUAL'\]\);/m,
  `    historySheet.appendRow([id, new Date().toISOString(), payload._authenticatedEmail || 'Unknown', 'INDIVIDUAL']);`
);

// 5. Secure logScan identity
code = code.replace(
  /  try \{\n    sheet\.appendRow\(\[id, new Date\(\)\.toISOString\(\), payload\.adminId \|\| 'Unknown', scanType\]\);\n  \} finally \{/m,
  `  try {
    sheet.appendRow([id, new Date().toISOString(), payload._authenticatedEmail || 'Unknown', scanType]);
  } finally {`
);


fs.writeFileSync('apps-script/Code.js', code);
