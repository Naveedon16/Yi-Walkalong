const XLSX = require('xlsx');
const workbook = XLSX.readFile('public/WalkAlong_Registration_Sheet_Bulk.xlsx');
const worksheet = workbook.Sheets['Registrations'];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
data.slice(11, 15).forEach((row, i) => {
  console.log(`Row ${i + 12}:`, row.map((c, j) => `[Col ${j}: ${c}]`).join(' '));
});
