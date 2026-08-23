const XLSX = require('xlsx');
const workbook = XLSX.readFile('WalkAlong_Registration_Sheet_Bulk.xlsx');

console.log("Sheet Names:", workbook.SheetNames);

for (const sheetName of workbook.SheetNames) {
  console.log(`\n--- Sheet: ${sheetName} ---`);
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    console.log(`Row ${i + 1}:`, rows[i]);
  }
}
