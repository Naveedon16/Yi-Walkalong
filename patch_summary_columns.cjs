const fs = require('fs');
let code = fs.readFileSync('apps-script/Code.js', 'utf8');

const oldLines = [
  "data.push(['WalkAlong 2026 - Registration Summary', '']);",
  "data.push(['Last Updated:', new Date().toLocaleString()]);",
  "data.push(['', '']);",
  "data.push(['Total Registrations', stats.totalRegistrations]);",
  "data.push(['Total Participants', stats.totalParticipants]);",
  "data.push(['', '']);"
];

const newLines = [
  "data.push(['WalkAlong 2026 - Registration Summary', '', '', '', '']);",
  "data.push(['Last Updated:', new Date().toLocaleString(), '', '', '']);",
  "data.push(['', '', '', '', '']);",
  "data.push(['Total Registrations', stats.totalRegistrations, '', '', '']);",
  "data.push(['Total Participants', stats.totalParticipants, '', '', '']);",
  "data.push(['', '', '', '', '']);"
];

for (let i = 0; i < oldLines.length; i++) {
  code = code.replace(oldLines[i], newLines[i]);
}

// Catch the double empty string one that appears twice
code = code.replace(/data\.push\(\['', ''\]\);/g, "data.push(['', '', '', '', '']);");

fs.writeFileSync('apps-script/Code.js', code);
console.log("Patched Code.js to have exactly 5 columns for all rows");
