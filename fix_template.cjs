const ExcelJS = require('exceljs');

async function fix() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('./WalkAlong_Registration_Sheet_Bulk.xlsx');
  
  const worksheet = workbook.getWorksheet('Registrations');
  if (!worksheet) {
    console.error('Worksheet not found');
    return;
  }
  
  const cellsToClear = ['C12', 'F12', 'C13', 'F13', 'C14', 'F14', 'C15', 'F15'];
  
  cellsToClear.forEach(cellAddress => {
    const cell = worksheet.getCell(cellAddress);
    cell.value = null; // Clear the text
  });
  
  const h12 = worksheet.getCell('H12');
  if (h12.value && typeof h12.value === 'string' && h12.value.includes('radhika')) {
    h12.value = 'Email:';
  }
  
  await workbook.xlsx.writeFile('./public/WalkAlong_Registration_Sheet_Bulk.xlsx');
  console.log('Fixed template saved successfully!');
}

fix().catch(err => console.error(err));
