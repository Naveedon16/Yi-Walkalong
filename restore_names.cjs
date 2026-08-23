const ExcelJS = require('exceljs');

async function fix() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('./public/WalkAlong_Registration_Sheet_Bulk.xlsx');
  
  const worksheet = workbook.getWorksheet('Registrations');
  if (!worksheet) {
    console.error('Worksheet not found');
    return;
  }
  
  // Re-insert what we know
  worksheet.getCell('C12').value = 'Radhika Asrani';
  worksheet.getCell('F12').value = '+91 9003019222';
  worksheet.getCell('H12').value = 'Email: radhikaasrani@gmail.com';
  
  // Informing about others
  console.log("Restored Radhika Asrani. Other cells C13-15 and F13-15 are blanked out since the data was lost when the file was overwritten.");
  
  await workbook.xlsx.writeFile('./public/WalkAlong_Registration_Sheet_Bulk.xlsx');
  console.log('Template restored successfully!');
}

fix().catch(err => console.error(err));
