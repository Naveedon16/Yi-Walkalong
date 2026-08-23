const XLSX = require('xlsx');
const workbook = XLSX.readFile('WalkAlong_Registration_Sheet_Bulk.xlsx');
const sheet = workbook.Sheets['Registrations'];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
for (let i = 30; i < Math.min(rows.length, 150); i++) {
  if (rows[i] && rows[i].length > 0) {
    if (rows[i][0] || rows[i][1]) {
      console.log(`Row ${i + 1}:`, rows[i]);
    }
  }
}
