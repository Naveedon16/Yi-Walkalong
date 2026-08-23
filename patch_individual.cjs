const fs = require('fs');
let code = fs.readFileSync('src/pages/IndividualRegistration.tsx', 'utf8');

// Imports
code = code.replace(
  "import { RegistrationService, SettingsService, SettingsResponse } from '../services';",
  "import { RegistrationService, SettingsService, SettingsResponse } from '../services';\nimport { ErrorState } from '../components/ui/ErrorState';\nimport { LoadingState } from '../components/ui/LoadingState';\nimport { Loader2 } from 'lucide-react';"
);

// State for settings
code = code.replace(
  /const \[settings, setSettings\] = useState<SettingsResponse \| null>\(null\);\s*const \[settingsError, setSettingsError\] = useState<string \| null>\(null\);/,
  "const [settings, setSettings] = useState<SettingsResponse | null>(null);\n  const [settingsError, setSettingsError] = useState<{message: string, code: string, title?: string} | null>(null);\n  const [submitError, setSubmitError] = useState<{message: string, code: string, title?: string} | null>(null);"
);

// useEffect
code = code.replace(
  /useEffect\(\(\) => \{\s*SettingsService.getSettings\(\)\s*\.then\(setSettings\)\s*\.catch\(err => setSettingsError\(err\.message \|\| 'Failed to load form settings\.'\)\);\s*\}, \[\]\);/,
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

  useEffect(() => {
    loadSettings();
  }, []);`
);

// onSubmit
code = code.replace(
  /const onSubmit = async \(data: z\.infer<typeof formSchema>\) => \{\s*setIsSubmitting\(true\);\s*try \{/,
  `const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {`
);

code = code.replace(
  /\} catch \(error\) \{\s*console\.error\(error\);\s*setIsSubmitting\(false\);\s*\}/,
  `} catch (error: any) {
      console.error(error);
      let title = 'Registration Failed';
      if (error.code === 'CONFIGURATION_ERROR') title = 'Configuration error';
      if (error.code === 'NETWORK_ERROR') title = 'Connection problem';
      if (error.code === 'TIMEOUT_ERROR') title = 'Request timed out';
      if (error.code === 'SERVER_ERROR') title = 'Service temporarily unavailable';
      
      setSubmitError({
        title,
        message: error.message || 'An unexpected error occurred during submission.',
        code: error.code || 'UNKNOWN_ERROR'
      });
      setIsSubmitting(false);
    }`
);

// Settings error and loading views
code = code.replace(
  /if \(settingsError\) \{[\s\S]*?if \(!settings\) \{[\s\S]*?Loading form\.\.\.<\/div>;\s*\}/,
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
  }`
);

// Add submitError display before the form
code = code.replace(
  /<form className="space-y-8">/,
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
              <form className="space-y-8">`
);

// Button states (in Confirm & Submit and Edit Details)
code = code.replace(
  /<Button type="button" onClick=\{handleSubmit\(onSubmit\)\} disabled=\{isSubmitting\}>\s*\{isSubmitting \? 'Submitting\.\.\.' : 'Confirm & Submit'\}\s*<\/Button>/,
  `<Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} aria-busy={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                        Submitting...
                      </>
                    ) : (
                      'Confirm & Submit'
                    )}
                  </Button>`
);

// Duplicate Continue Button
code = code.replace(
  /const handleDuplicateContinue = async \(\) => \{\s*setDuplicateWarning\(false\);\s*setIsSubmitting\(true\);\s*try \{/,
  `const handleDuplicateContinue = async () => {
    setDuplicateWarning(false);
    setIsSubmitting(true);
    setSubmitError(null);
    try {`
);

code = code.replace(
  /\} catch \(error\) \{\s*console\.error\(error\);\s*setIsSubmitting\(false\);\s*\}/,
  `} catch (error: any) {
      console.error(error);
      let title = 'Registration Failed';
      if (error.code === 'CONFIGURATION_ERROR') title = 'Configuration error';
      if (error.code === 'NETWORK_ERROR') title = 'Connection problem';
      if (error.code === 'TIMEOUT_ERROR') title = 'Request timed out';
      if (error.code === 'SERVER_ERROR') title = 'Service temporarily unavailable';
      
      setSubmitError({
        title,
        message: error.message || 'An unexpected error occurred during submission.',
        code: error.code || 'UNKNOWN_ERROR'
      });
      setIsSubmitting(false);
      setStep(1); // Go back to show error
    }`
);

fs.writeFileSync('src/pages/IndividualRegistration.tsx', code);
console.log('Patched IndividualRegistration.tsx');
