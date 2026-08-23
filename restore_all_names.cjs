const ExcelJS = require('exceljs');

async function fix() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('./public/WalkAlong_Registration_Sheet_Bulk.xlsx');
  
  const worksheet = workbook.getWorksheet('Registrations');
  if (!worksheet) {
    console.error('Worksheet not found');
    return;
  }
  
  // Row 13
  worksheet.getCell('C13').value = 'Ratna Annamalai';
  worksheet.getCell('F13').value = '+91 9841392153';
  
  // Row 14
  worksheet.getCell('C14').value = 'Ritesh Sivakumar';
  worksheet.getCell('F14').value = '+91 9342061449';

  // Row 15
  worksheet.getCell('C15').value = 'Pavithra';
  worksheet.getCell('F15').value = '+91 8124472200';
  
  await workbook.xlsx.writeFile('./public/WalkAlong_Registration_Sheet_Bulk.xlsx');
  console.log('Template restored successfully!');
}

fix().catch(err => console.error(err));
