with open('apps-script/Code.js', 'r') as f:
    content = f.read()

old_login = """function adminLogin(payload) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Admins');
  if (!sheet) throw new Error('Admins sheet not found');
  const data = sheet.getDataRange().getValues();
  const email = String(payload.email || '').trim().toLowerCase();
  const password = payload.password;
  
  const computeHash = (pw) => Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pw).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  const hash = computeHash(password);
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === email && String(data[i][1]) === hash) {
      return { success: true, admin: { email: email, role: data[i][2] || 'ADMIN', token: 'dummy-token-' + new Date().getTime() } };
    }
  }
  throw new Error("Invalid credentials");
}"""

new_login = """function adminLogin(payload) {
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
    if (sheetEmail === email && sheetHash === hash) {
      return { success: true, admin: { email: email, role: data[i][2] || 'ADMIN', token: 'dummy-token-' + new Date().getTime() } };
    }
  }
  throw new Error("Invalid credentials");
}"""

if old_login in content:
    content = content.replace(old_login, new_login)
    with open('apps-script/Code.js', 'w') as f:
        f.write(content)
    print("Patched adminLogin successfully.")
else:
    print("Could not find old adminLogin.")
