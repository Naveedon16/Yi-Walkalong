const fs = require('fs');
let code = fs.readFileSync('src/pages/InstitutionRegistration.tsx', 'utf8');

// Imports
code = code.replace(
  "import { InstitutionService } from '../services';",
  "import { InstitutionService, SettingsService, SettingsResponse } from '../services';\nimport { ErrorState } from '../components/ui/ErrorState';\nimport { LoadingState } from '../components/ui/LoadingState';\nimport { Loader2 } from 'lucide-react';"
);

// State for settings, loading states
code = code.replace(
  /const \[file, setFile\] = useState<File \| null>\(null\);/,
  `const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [settingsError, setSettingsError] = useState<{message: string, code: string, title?: string} | null>(null);
  const [submitError, setSubmitError] = useState<{message: string, code: string, title?: string} | null>(null);
  const [loadingStateStr, setLoadingStateStr] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);`
);

// Add useEffect to load settings
code = code.replace(
  /const downloadTemplate = \(\) => \{/,
  `const loadSettings = () => {
    setSettingsError(null);
    SettingsService.getSettings()
      .then(setSettings)
      .catch((err: any) => {
        let title = 'Configuration error';
        if (err.code === 'NETWORK_ERROR') title = 'Connection problem';
        if (err.code === 'TIMEOUT_ERROR') title = 'Request timed out';
        if (err.code === 'SERVER_ERROR') title = 'Service temporarily unavailable';
        setSettingsError({
          title,
          message: err.message || 'The registration form could not be loaded right now.',
          code: err.code || 'UNKNOWN_ERROR'
        });
      });
  };

  React.useEffect(() => {
    loadSettings();
  }, []);

  const downloadTemplate = () => {`
);

// On submit changes
code = code.replace(
  /const onSubmit = async \(data: InstitutionFormValues\) => \{\s*if \(!file\) \{\s*setErrors\(\['Please upload a participant list Excel\/CSV file'\]\);\s*return;\s*\}\s*setIsSubmitting\(true\);\s*setErrors\(\[\]\);\s*try \{/,
  `const onSubmit = async (data: InstitutionFormValues) => {
    if (!file) {
      setErrors(['Please upload a participant list Excel/CSV file']);
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLoadingStateStr('Submitting registration...');
    setSubmitError(null);
    setErrors([]);
    try {`
);

code = code.replace(
  /\} catch \(error: any\) \{\s*console\.error\(error\);\s*setErrors\(\[error\.message \|\| 'An error occurred during submission'\]\);\s*setIsSubmitting\(false\);\s*\}/,
  `} catch (error: any) {
      console.error(error);
      let title = 'Registration Failed';
      if (error.code === 'CONFIGURATION_ERROR') title = 'Configuration error';
      if (error.code === 'NETWORK_ERROR') title = 'Connection problem';
      if (error.code === 'TIMEOUT_ERROR') title = 'Request timed out';
      if (error.code === 'SERVER_ERROR') title = 'Service temporarily unavailable';
      
      if (error.code === 'APPLICATION_ERROR' || !error.code) {
        setErrors([error.message || 'An error occurred during submission']);
      } else {
        setSubmitError({
          title,
          message: error.message || 'An unexpected error occurred during submission.',
          code: error.code || 'UNKNOWN_ERROR'
        });
      }
      setIsSubmitting(false);
      setLoadingStateStr('');
    }`
);

// Handle file validation states
code = code.replace(
  /setIsValidating\(true\);\s*try \{\s*const validData = await InstitutionService\.validateParticipantsFile\(uploadedFile\);/,
  `setIsValidating(true);
      setLoadingStateStr('Validating participants...');
      setSubmitError(null);
      try {
        const validData = await InstitutionService.validateParticipantsFile(uploadedFile);`
);

code = code.replace(
  /\} catch \(error: any\) \{\s*console\.error\(error\);\s*setErrors\(\[error\.message \|\| 'Failed to parse file'\]\);\s*\} finally \{\s*setIsValidating\(false\);\s*\}/,
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
          setErrors([error.message || 'Failed to parse file']);
        }
      } finally {
        setIsValidating(false);
        setLoadingStateStr('');
      }`
);

// Add Loading and Settings UI
code = code.replace(
  /return \(\s*<div className="max-w-4xl mx-auto w-full">\s*<div className="mb-8">\s*<h1 className="text-3xl font-bold text-\[\#1d1b20\] dark:text-white">Institution Registration<\/h1>/,
  `if (settingsError) {
    return (
      <div className="pt-8">
        <ErrorState
          title={settingsError.title || 'Error'}
          message={settingsError.message}
          code={settingsError.code}
          onRetry={loadSettings}
        />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="pt-8">
        <LoadingState message="Loading registration form..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1d1b20] dark:text-white">Institution Registration</h1>`
);

// Add submitError to form
code = code.replace(
  /<form onSubmit=\{hookFormSubmit\(onSubmit\)\} className="space-y-8">/,
  `{submitError && (
              <div className="mb-6">
                <ErrorState
                  title={submitError.title || 'Error'}
                  message={submitError.message}
                  code={submitError.code}
                  onRetry={() => setSubmitError(null)}
                />
              </div>
            )}
            <form onSubmit={hookFormSubmit(onSubmit)} className="space-y-8">`
);

// Update button with loading state
code = code.replace(
  /<Button type="submit" disabled=\{isSubmitting \|\| isValidating\} className="min-w-\[200px\]">\s*\{isSubmitting \? 'Submitting\.\.\.' : 'Submit Registration'\}\s*<\/Button>/,
  `<Button type="submit" disabled={isSubmitting || isValidating} aria-busy={isSubmitting || isValidating} className="min-w-[200px]">
                  {(isSubmitting || isValidating) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      {loadingStateStr || 'Processing...'}
                    </>
                  ) : 'Submit Registration'}
                </Button>`
);


fs.writeFileSync('src/pages/InstitutionRegistration.tsx', code);
console.log('Patched InstitutionRegistration.tsx');
