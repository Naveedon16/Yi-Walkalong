const fs = require('fs');
let code = fs.readFileSync('apps-script/Code.js', 'utf8');

const adminLoginRegex = /function adminLogin\(payload\) \{[\s\S]*?throw new Error\("Invalid credentials"\);\s*\}/;
const newAdminLogin = `function adminLogin(payload) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Admins');
  if (!sheet) throw new Error('Admins sheet not found');
  const data = sheet.getDataRange().getDisplayValues();
  const email = String(payload.email || '').trim().toLowerCase();
  const password = payload.password || '';
  
  const computeHash = (pw) => Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pw).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  const hash = computeHash(password);
  
  for (let i = 1; i < data.length; i++) {
    const sheetEmail = String(data[i][0] || '').trim().toLowerCase();
    const sheetHash = String(data[i][1] || '').trim();
    if (sheetEmail === email && sheetHash !== '' && sheetHash.toLowerCase() === hash.toLowerCase()) {
      return { success: true, admin: { email: email, role: data[i][2] || 'ADMIN', token: 'dummy-token-' + new Date().getTime() } };
    }
  }
  throw new Error("Invalid credentials");
}`;

code = code.replace(adminLoginRegex, newAdminLogin);

const updateAdminPasswordRegex = /function updateAdminPassword\(payload\) \{[\s\S]*?return \{ success: true \};\s*\}/;
const newUpdateAdminPassword = `function updateAdminPassword(payload) {
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
}`;

code = code.replace(updateAdminPasswordRegex, newUpdateAdminPassword);

const bootstrapFunction = `

/**
 * ONE-TIME BOOTSTRAP MECHANISM
 * Run this function directly from the Apps Script editor to set an initial password.
 * Do NOT expose this via doPost.
 * 
 * Usage:
 * 1. Replace 'YOUR_ADMIN_EMAIL' and 'YOUR_INITIAL_PASSWORD' with actual values.
 * 2. Run the function from the editor.
 * 3. Delete the password from this script afterwards.
 */
function BOOTSTRAP_SET_INITIAL_PASSWORD() {
  const targetEmail = 'YOUR_ADMIN_EMAIL';
  const initialPassword = 'YOUR_INITIAL_PASSWORD';
  
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Admins');
  if (!sheet) throw new Error('Admins sheet not found');
  
  const values = sheet.getDataRange().getDisplayValues();
  let matchedRow = -1;
  let storedHash = '';
  
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0] || '').trim().toLowerCase() === targetEmail.trim().toLowerCase()) {
      matchedRow = i;
      storedHash = String(values[i][1] || '').trim();
      break;
    }
  }
  
  if (matchedRow === -1) {
    Logger.log('Admin email not found in sheet.');
    return;
  }
  
  if (storedHash !== '') {
    Logger.log('Admin already has a password set. Use updateAdminPassword to change it.');
    return;
  }
  
  const computeHash = (pw) => Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pw).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  const hash = computeHash(initialPassword);
  
  sheet.getRange(matchedRow + 1, 2).setValue(hash);
  
  const currentRole = String(values[matchedRow][2] || '').trim();
  if (!currentRole) {
    sheet.getRange(matchedRow + 1, 3).setValue('ADMIN');
  }
  
  Logger.log('Password successfully set for ' + targetEmail + '. Please remove the password from the script now.');
}
`;

if (!code.includes('BOOTSTRAP_SET_INITIAL_PASSWORD')) {
  code += bootstrapFunction;
}

fs.writeFileSync('apps-script/Code.js', code);
