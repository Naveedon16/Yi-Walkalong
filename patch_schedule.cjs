const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const oldSchedule = `              <div className="text-sm text-[#49454f]  font-medium mb-1">Event Schedule</div>
              <div className="text-base sm:text-lg font-bold text-[#1d1b20]  leading-tight">
                06 September 2026<br />
                07:00 AM IST
              </div>`;

const newSchedule = `              <div className="text-sm text-[#49454f]  font-medium mb-1">Event Schedule</div>
              <div className="text-base sm:text-lg font-bold text-[#1d1b20]  leading-tight">
                <span className="line-through text-[#49454f] opacity-70">06 September 2026</span><br />
                <span className="text-red-600">To Be Announced</span>
              </div>`;

code = code.replace(oldSchedule, newSchedule);
fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Patched event schedule in Home.tsx");
