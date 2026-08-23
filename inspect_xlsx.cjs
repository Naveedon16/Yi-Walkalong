const XLSX = require('xlsx');
const workbook = XLSX.readFile('WalkAlong_Registration_Sheet_Bulk.xlsx');

console.log("Sheet Names:", workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
  console.log(`\n--- Sheet: ${sheetName} ---`);
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Print first 15 rows to understand the structure
  data.slice(0, 15).forEach((row, i) => {
    console.log(`Row ${i + 1}:`, row);
  });
});
