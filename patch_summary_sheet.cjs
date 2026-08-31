const fs = require('fs');
let code = fs.readFileSync('apps-script/Code.js', 'utf8');

const newSubmitCode = `    sheet.appendRow(row);
    CacheService.getScriptCache().remove('dashboard_stats');
    CacheService.getScriptCache().remove('participants_data');
    try { updateSummarySheet(); } catch(e) { console.error(e); }
  } finally {`;

code = code.replace(/    sheet\.appendRow\(row\);\n    CacheService\.getScriptCache\(\)\.remove\('dashboard_stats'\);\n    CacheService\.getScriptCache\(\)\.remove\('participants_data'\);\n  } finally {/m, newSubmitCode);

const appendCode = `

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('WalkAlong')
    .addItem('Update Summary Sheet', 'updateSummarySheet')
    .addToUi();
}

function updateSummarySheet() {
  const ss = getSpreadsheet();
  let summarySheet = ss.getSheetByName('Summary');
  if (!summarySheet) {
    summarySheet = ss.insertSheet('Summary');
  }
  
  summarySheet.clear();
  
  CacheService.getScriptCache().remove('dashboard_stats');
  const stats = getDashboardStats();
  
  const data = [];
  
  data.push(['WalkAlong 2026 - Registration Summary', '']);
  data.push(['Last Updated:', new Date().toLocaleString()]);
  data.push(['', '']);
  
  data.push(['Total Registrations', stats.totalRegistrations]);
  data.push(['Total Participants', stats.totalParticipants]);
  data.push(['', '']);
  
  data.push(['Category Breakdown', '', '', '', '']);
  data.push(['Category', 'Individuals', 'Family Members', 'Caretakers', 'Total']);
  
  const categories = stats.byCategory || {};
  let categoryCount = 0;
  for (const cat in categories) {
    const counts = categories[cat];
    const catTotal = counts.individual + counts.family + counts.caretaker;
    data.push([cat, counts.individual, counts.family, counts.caretaker, catTotal]);
    categoryCount++;
  }
  
  data.push(['', '', '', '', '']);
  
  data.push(['T-Shirt Sizes Breakdown', '', '', '', '']);
  data.push(['Size', 'Count', '', '', '']);
  const sizes = stats.byTshirtSize || {};
  for (const size in sizes) {
    data.push([size, sizes[size], '', '', '']);
  }
  
  summarySheet.getRange(1, 1, data.length, 5).setValues(data);
  
  try {
    summarySheet.getRange(1, 1, 1, 1).setFontWeight('bold').setFontSize(14);
    summarySheet.getRange(7, 1, 1, 5).setFontWeight('bold').setBackground('#f3f3f3');
    summarySheet.getRange(8, 1, 1, 5).setFontWeight('bold');
    
    let sizeHeaderRow = 8 + categoryCount + 2;
    summarySheet.getRange(sizeHeaderRow, 1, 1, 2).setFontWeight('bold').setBackground('#f3f3f3');
    summarySheet.getRange(sizeHeaderRow + 1, 1, 1, 2).setFontWeight('bold');
    
    summarySheet.autoResizeColumns(1, 5);
  } catch(e) {}
}
`;

fs.writeFileSync('apps-script/Code.js', code + appendCode);
console.log("Patched Apps Script to include Summary Sheet");
