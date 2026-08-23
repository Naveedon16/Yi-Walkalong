with open('apps-script/Code.js', 'r') as f:
    content = f.read()

real_pass = """function sendRegistrationPass(payload) {
  const ss = getSpreadsheet();
  const registrationId = payload.registrationId;
  const sheetName = String(registrationId).includes('-INS-') ? 'Institutions' : 'Participants';
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

  const body = `WalkAlong Chennai Chapter\nYour registration for WalkAlong has been confirmed.\n\nRegistration ID: ${registrationId}\nParticipant Name: ${name}\nCategory: ${category}\nT-Shirt Size: ${tshirtSize}\nPhone: ${phone}\nRegistration Status: ${status}\n\nEvent: WalkAlong\nDate: ${eventDate}\nTime: ${eventTime}\nVenue: Marina Beach`;

  try {
    MailApp.sendEmail(email, subject, body);
    logAction('SEND_PASS_EMAIL', { id: registrationId, email: email });
    return { success: true, message: 'Registration pass sent to your email.' };
  } catch (e) {
    logAction('ERROR', `Failed to send email to ${email}: ${e.message}`);
    throw new Error('We couldn\\'t send your pass right now. Please try again.');
  }
}"""

content = content.replace("function sendRegistrationPass(payload) {\n  // Mock email logic since Apps Script MailApp is not accessible in local environment\n  return { success: true, message: 'Pass simulated.' };\n}", real_pass)

with open('apps-script/Code.js', 'w') as f:
    f.write(content)
