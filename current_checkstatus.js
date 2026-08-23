function checkStatus(query) {
  const ss = getSpreadsheet();
  const q = String(query).trim().toLowerCase();
  const phoneNormalized = q.replace(/[^0-9]/g, '');
  const searchQ = phoneNormalized.length > 5 ? phoneNormalized : q;
  
  if (!searchQ) return { statuses: [] };

  const instSheet = ss.getSheetByName('Institutions');
  const partSheet = ss.getSheetByName('Participants');
  let results = [];

  // Check Institutions for exact ID match first
  if (instSheet) {
    const idTf = instSheet.createTextFinder(searchQ).matchEntireCell(true).findAll();
    if (idTf.length > 0) {
      const data = instSheet.getDataRange().getValues();
      const headers = data[0];
      const match = data[idTf[0].getRow() - 1];
      const details = {};
      headers.forEach((h, i) => details[h] = match[i]);
      return { type: 'institution', institutionId: details['Institution ID'], participantCount: details['Participant Count'] || 0 };
    }
  }

  // Check Participants
  if (partSheet) {
    const tf = partSheet.createTextFinder(searchQ).findAll();
    if (tf.length > 0) {
      const data = partSheet.getDataRange().getValues();
      const headers = data[0];
      tf.forEach(cell => {
         const row = data[cell.getRow() - 1];
         // Verify it's a real match in relevant columns
         const id = String(row[headers.indexOf('Registration ID')] || '').toLowerCase();
         const phone = String(row[headers.indexOf('Phone')] || '').replace(/[^0-9]/g, '');
         if (id === searchQ || (phone && phone === searchQ)) {
           results.push({
             registrationId: row[headers.indexOf('Registration ID')],
             name: row[headers.indexOf('Participant Name')],
             status: row[headers.indexOf('Status')],
             type: 'INDIVIDUAL'
           });
         }
      });
    }
  }

  // Deduplicate
  const uniqueResults = [];
  const seen = new Set();
  results.forEach(r => {
    if (!seen.has(r.registrationId)) {
      seen.add(r.registrationId);
      uniqueResults.push(r);
    }
  });

  return { statuses: uniqueResults };
}
