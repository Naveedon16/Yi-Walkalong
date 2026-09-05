const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const newRegistrationCards = `  const registrationCards = (
    <div className="flex flex-col gap-6">
      <div className="bg-red-50/50 rounded-[32px] p-6 sm:p-8 shadow-sm border border-red-100">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-900 leading-tight">Important Update</h3>
            <p className="text-red-700 font-medium">Event Postponed</p>
          </div>
        </div>
        
        <div className="space-y-4 text-[#49454f] text-base leading-relaxed">
          <p>Dear All,</p>
          <p>We regret to inform you that <strong className="text-[#1d1b20]">WalkAlong 4.0 has been postponed</strong> due to certain last minute security protocols.</p>
          <p>We sincerely apologise for the inconvenience caused and truly appreciate your understanding and support.</p>
          <p>We are taking this opportunity to ensure that we come back with an even better and more meaningful experience for everyone.</p>
          <p>We will share further details and the revised schedule.</p>
          <p>Thank you for your patience and continued support.</p>
          <p className="font-semibold text-[#1d1b20] pt-2">Team Walkalong</p>
        </div>
      </div>
    </div>
  );`;

code = code.replace(/  const registrationCards = \([\s\S]*?    <\/div>\n  \);/, newRegistrationCards);
fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Patched Home.tsx to show postponement message");
