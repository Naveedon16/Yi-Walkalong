const fs = require('fs');
let code = fs.readFileSync('apps-script/Code.js', 'utf8');

const targetStr = `          if (isInstitution) {
            // We only increment the institution trend if it's the first time we see this instId
            // Actually, we've already tracked it above, let's just use it
            // Well, let's just keep it simple: 1 institution = 1 trend increment
            // However, this means we should only do this for the first row of that instId
            // We can just rely on the count of participants for the graph
            trendsMap[dateStr].participants += count;
          } else {
            trendsMap[dateStr].individual++;
            trendsMap[dateStr].participants += count;
          }`;
          
const replaceStr = `          if (isInstitution) {
            // Only count institution registration once per instId per date
            // The uniqueInstitutions set was already populated, so we can use a separate tracking
            if (!trendsMap[dateStr].seenInsts) trendsMap[dateStr].seenInsts = new Set();
            if (instId && !trendsMap[dateStr].seenInsts.has(instId)) {
              trendsMap[dateStr].seenInsts.add(instId);
              trendsMap[dateStr].institution++;
            }
            trendsMap[dateStr].participants += count;
          } else {
            trendsMap[dateStr].individual++;
            trendsMap[dateStr].participants += count;
          }`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('apps-script/Code.js', code);
