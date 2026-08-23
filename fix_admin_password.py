with open('apps-script/Code.js', 'r') as f:
    content = f.read()

real_pwd = """function updateAdminPassword(payload) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Admins');
  if (!sheet) throw new Error('Admins sheet not found');
  
  const email = String(payload.email || '').trim().toLowerCase();
  const currentPassword = payload.currentPassword || '';
  const newPassword = payload.newPassword || '';
  
  const values = sheet.getDataRange().getDisplayValues();
  let matchedRow = -1;
  let storedHash = '';
  
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0] || '').trim().toLowerCase() === email) {
      matchedRow = i;
      storedHash = String(values[i][1] || '').trim();
      break;
    }
  }
  
  if (matchedRow === -1) throw new Error('Admin not found');
  
  const computeHash = (pw) => Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pw).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  
  if (storedHash && computeHash(currentPassword) !== storedHash) {
    throw new Error('Invalid current password');
  }
  
  sheet.getRange(matchedRow + 1, 2).setValue(computeHash(newPassword));
  return { success: true };
}"""

content = content.replace("function updateAdminPassword(payload) {\n  return { success: true };\n}", real_pwd)

with open('apps-script/Code.js', 'w') as f:
    f.write(content)
