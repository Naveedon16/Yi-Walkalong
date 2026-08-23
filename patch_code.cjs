const fs = require('fs');
let code = fs.readFileSync('apps-script/Code.js', 'utf8');

const target = `    setVal('Institution Name', p.institutionName || payload[0].institutionName);
    setVal('Coordinator Name', p.coordinatorName || payload[0].coordinatorName);
    setVal('Coordinator Email', p.coordinatorEmail || payload[0].coordinatorEmail);
    setVal('Coordinator Phone', p.coordinatorPhone || payload[0].coordinatorPhone);
    setVal('Status', 'Confirmed');`;

const replacement = `    setVal('Institution Name', p.institutionName || payload[0].institutionName);
    setVal('Institution Location', p.institutionLocation || payload[0].institutionLocation);
    setVal('Coordinator Name', p.coordinatorName || payload[0].coordinatorName);
    setVal('Coordinator Email', p.coordinatorEmail || payload[0].coordinatorEmail);
    setVal('Coordinator Phone', p.coordinatorPhone || payload[0].coordinatorPhone);
    setVal('Coordinator 2 Name', p.coordinator2Name || payload[0].coordinator2Name);
    setVal('Coordinator 2 Phone', p.coordinator2Phone || payload[0].coordinator2Phone);
    setVal('Coordinator 2 Email', p.coordinator2Email || payload[0].coordinator2Email);
    setVal('Coordinator 3 Name', p.coordinator3Name || payload[0].coordinator3Name);
    setVal('Coordinator 3 Phone', p.coordinator3Phone || payload[0].coordinator3Phone);
    setVal('Coordinator 3 Email', p.coordinator3Email || payload[0].coordinator3Email);
    setVal('Yi Coordinator Name', p.yiCoordinatorName || payload[0].yiCoordinatorName);
    setVal('Yi Coordinator Phone', p.yiCoordinatorPhone || payload[0].yiCoordinatorPhone);
    setVal('Yi Coordinator Email', p.yiCoordinatorEmail || payload[0].yiCoordinatorEmail);
    setVal('Yuva SPOC Name', p.yuvaSpocName || payload[0].yuvaSpocName);
    setVal('Yuva SPOC Phone', p.yuvaSpocPhone || payload[0].yuvaSpocPhone);
    setVal('Transport Coordinator Name', p.transportCoordinatorName || payload[0].transportCoordinatorName);
    setVal('Transport Coordinator Phone', p.transportCoordinatorPhone || payload[0].transportCoordinatorPhone);
    setVal('Status', 'Confirmed');`;

code = code.replace(target, replacement);
fs.writeFileSync('apps-script/Code.js', code);
