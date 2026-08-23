const fs = require('fs');
let code = fs.readFileSync('src/pages/InstitutionRegistration.tsx', 'utf8');

code = code.replace(
  /<Button type="submit" disabled=\{isSubmitting\} className="w-full sm:w-auto">\s*\{isSubmitting \? 'Submitting Institution\.\.\.' : 'Confirm & Register Institution'\}\s*<\/Button>/,
  `<Button type="submit" disabled={isSubmitting || isValidating} aria-busy={isSubmitting || isValidating} className="w-full sm:w-auto min-w-[250px]">
                      {(isSubmitting || isValidating) ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                          {loadingStateStr || 'Processing...'}
                        </>
                      ) : 'Confirm & Register Institution'}
                    </Button>`
);

fs.writeFileSync('src/pages/InstitutionRegistration.tsx', code);
console.log('Patched button');
