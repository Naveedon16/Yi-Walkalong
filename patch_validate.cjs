const fs = require('fs');
let code = fs.readFileSync('src/pages/InstitutionRegistration.tsx', 'utf8');

code = code.replace(
  /setIsValidating\(true\);/,
  "setIsValidating(true);\n    setLoadingStateStr('Validating participants...');\n    setSubmitError(null);"
);

code = code.replace(
  /\} catch \(err\) \{\s*console\.error\(err\);\s*setErrors\(\['Failed to parse or validate the file\.'\]\);\s*\} finally \{\s*setIsValidating\(false\);\s*\}/,
  `} catch (error: any) {
        console.error(error);
        if (error.code && error.code !== 'APPLICATION_ERROR' && error.code !== 'UNKNOWN_ERROR') {
          let title = 'Validation Failed';
          if (error.code === 'CONFIGURATION_ERROR') title = 'Configuration error';
          if (error.code === 'NETWORK_ERROR') title = 'Connection problem';
          if (error.code === 'TIMEOUT_ERROR') title = 'Request timed out';
          if (error.code === 'SERVER_ERROR') title = 'Service temporarily unavailable';
          
          setSubmitError({
            title,
            message: error.message || 'An unexpected error occurred during validation.',
            code: error.code || 'UNKNOWN_ERROR'
          });
        } else {
          setErrors([error.message || 'Failed to parse or validate the file.']);
        }
      } finally {
        setIsValidating(false);
        setLoadingStateStr('');
      }`
);

fs.writeFileSync('src/pages/InstitutionRegistration.tsx', code);
console.log('Patched validation block');
