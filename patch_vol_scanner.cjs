const fs = require('fs');
let code = fs.readFileSync('src/pages/VolunteerScanner.tsx', 'utf8');

code = code.replace(
  /<h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-6">CHECK-IN CONFIRMED<\/h3>/m,
  `<h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">
                    {scanResult.details?.name === 'Pending Sync' ? 'CHECK-IN QUEUED' : 'CHECK-IN CONFIRMED'}
                  </h3>
                  {scanResult.details?.name === 'Pending Sync' && (
                    <p className="text-sm text-green-700 dark:text-green-400 mb-4 font-medium px-4">
                      You are offline. This scan has been saved locally and will sync when your connection returns.
                    </p>
                  )}
                  <div className="mb-6"></div>`
);

fs.writeFileSync('src/pages/VolunteerScanner.tsx', code);
