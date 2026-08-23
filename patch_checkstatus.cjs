const fs = require('fs');
let code = fs.readFileSync('apps-script/Code.js', 'utf8');

const target = `                  if (key === 'institutionName') instDetails.institutionName = instData[i][index];
                  if (key === 'coordinatorName') instDetails.coordinatorName = instData[i][index];
                  if (key === 'coordinatorEmail') instDetails.coordinatorEmail = instData[i][index];
                  if (key === 'coordinatorPhone') instDetails.coordinatorPhone = instData[i][index];`;
                  
const replace = `                  if (key === 'institutionName') instDetails.institutionName = instData[i][index];
                  if (key === 'coordinatorName' || key === 'instituteCoordinator1Name') instDetails.coordinatorName = instData[i][index];
                  if (key === 'coordinatorEmail' || key === 'instituteCoordinator1Email') instDetails.coordinatorEmail = instData[i][index];
                  if (key === 'coordinatorPhone' || key === 'instituteCoordinator1Phone') instDetails.coordinatorPhone = instData[i][index];`;

code = code.replace(target, replace);
fs.writeFileSync('apps-script/Code.js', code);
