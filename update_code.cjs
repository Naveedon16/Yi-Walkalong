const fs = require('fs');
let code = fs.readFileSync('apps-script/Code.js', 'utf8');

const targetStr = `    // New Fields
    setVal('Organization', payload.organization || '');
    setVal('Emergency Contact', payload.emergencyContact || '');
    setVal('How Did You Hear', payload.howDidYouHear || '');
    setVal('How Did You Hear Other', payload.howDidYouHearOther || '');
    setVal('Guardian Details', payload.guardianDetails || '');
    setVal('Previous Event Issues', payload.previousEventIssues || '');
    
    // Category Specific
    setVal('Disability Type', payload.disabilityType || '');
    setVal('Disability Other', payload.disabilityOther || '');
    setVal('Institution Name', payload.institutionName || '');
    setVal('Special Requirements', payload.specialRequirements || '');
    
    setVal('Has Caretaker', payload.hasCaretaker ? 'Yes' : 'No');
    setVal('Caretaker Name', payload.caretakerName || '');
    setVal('Caretaker T-Shirt Size', payload.caretakerTShirtSize || '');

    setVal('Employer', payload.employer || '');
    setVal('Yi Chapter', payload.yiChapter || '');
    
    setVal('Has Family Member', payload.hasFamilyMember ? 'Yes' : 'No');
    setVal('Family Member Name', payload.familyMemberName || '');
    setVal('Family Member T-Shirt Size', payload.familyMemberTShirtSize || '');`;

const replaceStr = `    // Common Fields
    setVal('Organization', payload.organization || '');
    
    // PWD Category Specific
    setVal('Disability Type', payload.disabilityType || '');
    setVal('Disability Other', payload.disabilityOther || '');
    setVal('Institution Name', payload.institutionName || '');
    setVal('Special Requirements', payload.specialRequirements || '');
    
    setVal('Has Caretaker', payload.hasCaretaker ? 'Yes' : 'No');
    setVal('Caretaker Name', payload.caretakerName || '');
    setVal('Caretaker T-Shirt Size', payload.caretakerTShirtSize || '');

    // YI Member Category Specific
    setVal('Employer', payload.employer || '');
    setVal('Yi Chapter', payload.yiChapter || '');
    
    setVal('Has Family Member', payload.hasFamilyMember ? 'Yes' : 'No');
    setVal('Family Member Name', payload.familyMemberName || '');
    setVal('Family Member T-Shirt Size', payload.familyMemberTShirtSize || '');`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('apps-script/Code.js', code);
