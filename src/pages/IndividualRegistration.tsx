import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { RegistrationService, SettingsService, SettingsResponse } from '../services';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingState } from '../components/ui/LoadingState';
import { Loader2 } from 'lucide-react';
import { Category, RegistrationFormValues } from '../types';
import { SizeGuideModal } from '../components/SizeGuideModal';

export function IndividualRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);
  
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [settingsError, setSettingsError] = useState<{message: string, code: string, title?: string} | null>(null);
  const [submitError, setSubmitError] = useState<{message: string, code: string, title?: string} | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const loadSettings = () => {
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
  }, []);

  const formSchema = z.object({
    category: z.string().min(1, 'Category is required'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    age: z.string().regex(/^[0-9]+$/, 'Age must be valid'),
    gender: z.string().min(1, 'Gender is required'),
    phone: z.string().regex(/^[0-9]{10}$/, 'Must be a valid 10-digit phone number'),
    email: z.string().email('Invalid email address').or(z.literal('')).optional(),
    tshirtSize: z.string().min(1, 'T-Shirt Size is required'),
    organization: z.string().optional(),
    
    // Conditional fields based on category
    disabilityType: z.string().optional(),
    disabilityOther: z.string().optional(),
    institutionName: z.string().optional(),
    specialRequirements: z.string().optional(),

    employer: z.string().optional(),
    yiChapter: z.string().optional(),



    school: z.string().optional(),
    coordinatorName: z.string().optional(),

    college: z.string().optional(),
    department: z.string().optional(),

  }).refine(data => {
    if (data.category === 'PWD' && data.disabilityType === 'Other' && !data.disabilityOther?.trim()) {
      return false;
    }
    return true;
  }, {
    message: "Please specify",
    path: ["disabilityOther"]
  }).refine(data => {
    if (data.category === 'YI_MEMBER' && !data.yiChapter?.trim()) {
      return false;
    }
    return true;
  }, {
    message: "Yi Chapter is required",
    path: ["yiChapter"]
  });

  const { register, handleSubmit, watch, control, formState: { errors }, trigger } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {}
  });

  const selectedCategory = watch('category') as Category | undefined;
  const formData = watch();

  const handleNext = async () => {
    const isValid = await trigger(['category', 'name', 'age', 'gender', 'phone', 'email', 'tshirtSize']);
    
    if (isValid) {
      // Validate dynamic fields based on category
      let dynamicFieldsValid = true;
      if (selectedCategory === 'PWD') {
        dynamicFieldsValid = await trigger(['disabilityType', 'disabilityOther']);
      } else if (selectedCategory === 'YI_MEMBER') {
        dynamicFieldsValid = await trigger(['employer', 'yiChapter']);
      }

      if (dynamicFieldsValid) {
        setStep(2);
      }
    }
  };

  const handleDuplicateContinue = async () => {
    setDuplicateWarning(false);
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const submitData = { ...pendingData, forceSubmit: true };
      const response = await RegistrationService.submitIndividual(submitData);
      if (response.id) {
        navigate(`/success?id=${response.id}`);
      }
    } catch (error: any) {
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
    }
  };

  const handleDuplicateCancel = () => {
    setDuplicateWarning(false);
    setPendingData(null);
    setIsSubmitting(false);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const submitData = { ...data };
      if (submitData.disabilityType === 'Other' && submitData.disabilityOther) {
        submitData.disabilityType = `Other - ${submitData.disabilityOther.trim()}`;
      }
      delete (submitData as any).disabilityOther;

      const response = await RegistrationService.submitIndividual(submitData as any);
      if (response.isDuplicate) {
        setPendingData(submitData);
        setDuplicateWarning(true);
        setIsSubmitting(false);
      } else if (response.id) {
        navigate(`/success?id=${response.id}`);
      }
    } catch (error: any) {
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
    }
  };

  if (settingsError) {
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
    <div className="max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1d1b20] dark:text-white">Individual Registration</h1>
        <p className="text-[#49454f] dark:text-gray-300 mt-2">Fill in your details to register for the walkathon.</p>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#6750a4] text-white flex items-center justify-center font-medium text-sm">1</div>
          <span className="font-medium text-[#1d1b20] dark:text-white">Details</span>
        </div>
        <div className="h-px bg-[#e1e2ec] flex-1"></div>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition-colors ${step === 2 ? 'bg-[#6750a4] text-white' : 'bg-[#f1f3f4] dark:bg-gray-800 text-[#79747e]'}`}>2</div>
          <span className={`font-medium ${step === 2 ? 'text-[#1d1b20] dark:text-white' : 'text-[#79747e]'}`}>Review</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card>
              {submitError && (
                <div className="mb-6">
                  <ErrorState
                    title={submitError.title || 'Error'}
                    message={submitError.message}
                    code={submitError.code}
                    onRetry={() => setSubmitError(null)}
                  />
                </div>
              )}
              <form className="space-y-8">
                {/* Category Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#1d1b20] dark:text-white border-b border-[#e1e2ec] dark:border-gray-700 pb-2">Participant Category</h3>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        label="Select Category"
                        options={settings.categories.filter(c => c.value === 'PWD' || c.value === 'YI_MEMBER')}
                        value={field.value || ''}
                        onChange={field.onChange}
                        error={errors.category?.message}
                        required
                      />
                    )}
                  />
                </div>

                {/* Common Fields */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#1d1b20] dark:text-white border-b border-[#e1e2ec] dark:border-gray-700 pb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name" {...register('name')} error={errors.name?.message} required />
                    <Input label="Age" type="text" inputMode="numeric" pattern="[0-9]*" {...register('age')} error={errors.age?.message} required />
                    <Select
                      label="Gender"
                      options={settings.genders}
                      {...register('gender')}
                      error={errors.gender?.message}
                      required
                    />
                    <Select
                      label="T-Shirt Size"
                      options={settings.tshirtSizes}
                      {...register('tshirtSize')}
                      error={errors.tshirtSize?.message}
                      required
                      labelAction={
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); setShowSizeGuide(true); }}
                          className="text-xs font-semibold text-[#6750a4] hover:underline"
                        >
                          View Size Guide
                        </button>
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#1d1b20] dark:text-white border-b border-[#e1e2ec] dark:border-gray-700 pb-2">Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Phone Number" type="tel" {...register('phone')} error={errors.phone?.message} required />
                    <Input label="Email Address (Optional)" type="email" {...register('email')} error={errors.email?.message} />
                  </div>
                </div>

                {/* Dynamic Fields based on category */}
                {selectedCategory === 'PWD' && (
                  <div className="space-y-4 bg-[#f8f9ff] dark:bg-gray-800/50 p-6 rounded-[24px] border border-[#e1e2ec] dark:border-gray-700">
                    <h3 className="text-lg font-bold text-[#6750a4]">PWD Specific Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Type of Disability (Optional)"
                        options={settings.disabilityTypes}
                        {...register('disabilityType')}
                        error={errors.disabilityType?.message}
                      />
                      {watch('disabilityType') === 'Other' && (
                        <Input
                          label="Please specify"
                          {...register('disabilityOther')}
                          error={errors.disabilityOther?.message}
                          required
                        />
                      )}
                      <Input label="Institution Name" {...register('institutionName')} error={errors.institutionName?.message} />
                      <Input label="Special Requirements" {...register('specialRequirements')} error={errors.specialRequirements?.message} />
                    </div>
                  </div>
                )}

                {selectedCategory === 'YI_MEMBER' && (
                  <div className="space-y-4 bg-[#f8f9ff] dark:bg-gray-800/50 p-6 rounded-[24px] border border-[#e1e2ec] dark:border-gray-700">
                    <h3 className="text-lg font-bold text-[#6750a4]">Yi Member Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Employer / Business Name" {...register('employer')} error={errors.employer?.message} required />
                      <Input label="Yi Chapter" {...register('yiChapter')} error={errors.yiChapter?.message} required />
                    </div>
                  </div>
                )}

                <div className="pt-6 flex justify-end">
                  <Button type="button" onClick={handleNext}>
                    Review Details
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-[#1d1b20] dark:text-white mb-6">Review your information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    <div className="border-b border-[#e1e2ec] dark:border-gray-700 pb-2">
                      <p className="text-[#49454f] dark:text-gray-300 mb-1 font-medium">Category</p>
                      <p className="font-bold text-[#1d1b20] dark:text-white">{settings.categories.find(c => c.value === formData.category)?.label}</p>
                    </div>
                    <div className="border-b border-[#e1e2ec] dark:border-gray-700 pb-2">
                      <p className="text-[#49454f] dark:text-gray-300 mb-1 font-medium">Full Name</p>
                      <p className="font-bold text-[#1d1b20] dark:text-white">{formData.name}</p>
                    </div>
                    <div className="border-b border-[#e1e2ec] dark:border-gray-700 pb-2">
                      <p className="text-[#49454f] dark:text-gray-300 mb-1 font-medium">Email</p>
                      <p className="font-bold text-[#1d1b20] dark:text-white">{formData.email || 'N/A'}</p>
                    </div>
                    <div className="border-b border-[#e1e2ec] dark:border-gray-700 pb-2">
                      <p className="text-[#49454f] dark:text-gray-300 mb-1 font-medium">Phone</p>
                      <p className="font-bold text-[#1d1b20] dark:text-white">{formData.phone}</p>
                    </div>
                    <div className="border-b border-[#e1e2ec] dark:border-gray-700 pb-2">
                      <p className="text-[#49454f] dark:text-gray-300 mb-1 font-medium">Age & Gender</p>
                      <p className="font-bold text-[#1d1b20] dark:text-white">{formData.age} yrs, {formData.gender}</p>
                    </div>
                    <div className="border-b border-[#e1e2ec] dark:border-gray-700 pb-2">
                      <p className="text-[#49454f] dark:text-gray-300 mb-1 font-medium">T-Shirt Size</p>
                      <p className="font-bold text-[#1d1b20] dark:text-white">{formData.tshirtSize}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#f1f3f4] dark:bg-gray-800 p-4 rounded-xl text-sm text-[#49454f] dark:text-gray-300">
                  By submitting this form, you agree to our Terms of Service and Privacy Policy. You confirm that all information provided is accurate.
                </div>

                <div className="pt-4 flex gap-4 justify-end">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isSubmitting}>
                    Edit Details
                  </Button>
                  <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} aria-busy={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                        Submitting...
                      </>
                    ) : (
                      'Confirm & Submit'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />

      {duplicateWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-[#1d1b20] dark:text-white mb-2">Duplicate Registration Detected</h3>
            <p className="text-[#49454f] dark:text-gray-300 mb-6">
              This participant appears to have already been registered. Would you like to continue?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleDuplicateCancel}>
                Cancel
              </Button>
              <Button onClick={handleDuplicateContinue}>
                Continue Registration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
