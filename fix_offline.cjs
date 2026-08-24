const fs = require('fs');
let code = fs.readFileSync('src/services/OfflineQueueService.ts', 'utf8');

code = code.replace(
  /      \}\n    \}\n    \},\n  \}\);/m,
  `      }
    },
  });`
);

fs.writeFileSync('src/services/OfflineQueueService.ts', code);
