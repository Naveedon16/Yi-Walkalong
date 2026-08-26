const fs = require('fs');
let code = fs.readFileSync('apps-script/Code.js', 'utf8');

const target = `categories: [
      { value: 'PWD', label: 'Participant with Disability' },
      { value: 'YI_MEMBER', label: 'Yi Member' }
    ],`;
    
const replacement = `categories: [
      { value: 'PWD', label: 'Participant with Disability' },
      { value: 'YI_MEMBER', label: 'Yi Member' },
      { value: 'SPECIAL_INVITEE', label: 'Special Invitee' }
    ],`;

if (code.includes(target)) {
  fs.writeFileSync('apps-script/Code.js', code.replace(target, replacement));
  console.log("Success");
} else {
  console.log("Target not found");
}
