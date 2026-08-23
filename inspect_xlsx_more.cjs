const XLSX = require('xlsx');
const workbook = XLSX.readFile('WalkAlong_Registration_Sheet_Bulk.xlsx');

const worksheet = workbook.Sheets['Registrations'];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

data.slice(15, 60).forEach((row, i) => {
  console.log(`Row ${i + 16}:`, row);
});
