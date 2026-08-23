const fs = require('fs');

const code = `
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as XLSX from 'xlsx';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Download, Upload, AlertCircle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InstitutionService, SettingsService, SettingsResponse } from '../services';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingState } from '../components/ui/LoadingState';
import { Loader2 } from 'lucide-react';
import { SizeGuideModal } from '../components/SizeGuideModal';

const formSchema = z.object({
  institutionName: z.string().min(2, 'Institution Name is required'),
  institutionLocation: z.string().min(2, 'Institution Location is required'),
  coordinator1Name: z.string().min(2, 'Coordinator 1 Name is required'),
  coordinator1Phone: z.string().regex(/^[0-9]{10}$/, 'Must be a valid 10-digit phone number'),
  coordinator1Email: z.string().email('Invalid email address'),
  
  coordinator2Name: z.string().optional(),
  coordinator2Phone: z.string().optional(),
  coordinator2Email: z.string().optional(),
  
  coordinator3Name: z.string().optional(),
  coordinator3Phone: z.string().optional(),
  coordinator3Email: z.string().optional(),
  
  yiCoordinatorName: z.string().optional(),
  yiCoordinatorPhone: z.string().optional(),
  yiCoordinatorEmail: z.string().optional(),
  
  yuvaSpocName: z.string().optional(),
  yuvaSpocPhone: z.string().optional(),
  
  transportCoordinatorName: z.string().optional(),
  transportCoordinatorPhone: z.string().optional(),
  
  participantCount: z.coerce.number().min(1, 'Participant count must be at least 1')
});

type InstitutionFormValues = z.infer<typeof formSchema>;

export function InstitutionRegistration() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [settingsError, setSettingsError] = useState<{message: string, code: string, title?: string} | null>(null);
  const [submitError, setSubmitError] = useState<{message: string, code: string, title?: string} | null>(null);
  const [loadingStateStr, setLoadingStateStr] = useState<string>('');
  
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const { register, handleSubmit: hookFormSubmit, formState: { errors: formErrors } } = useForm<InstitutionFormValues>({
    resolver: zodResolver(formSchema)
  });

  const loadSettings = () => {
    setSettingsError(null);
    SettingsService.getSettings()
      .then(setSettings)
      .catch(err => {
        setSettingsError({
          message: err.message || 'The registration form could not be loaded right now.',
          code: err.code || 'UNKNOWN_ERROR'
        });
      });
  };

  React.useEffect(() => {
    loadSettings();
  }, []);

  const downloadTemplate = () => {
    const link = document.createElement("a");
    link.setAttribute("href", "/WalkAlong_Registration_Sheet_Bulk.xlsx");
    link.setAttribute("download", "WalkAlong_Registration_Sheet_Bulk.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    setErrors([]);
    setPreviewData([]);
    setIsValidating(true);
    setLoadingStateStr('Validating participants...');
    setSubmitError(null);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        let pwdMode = false;
        let staffMode = false;
        
        const participants: any[] = [];
        const validationErrs: string[] = [];
        
        for (let i = 0; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row || row.length === 0) continue;
          
          const firstCell = String(row[0] || '').trim();
          
          if (firstCell === 'PERSONS WITH DISABILITIES (PWD)') {
            pwdMode = true;
            staffMode = false;
            i++; // skip header
            continue;
          }
          if (firstCell === 'SUPPORT STAFF / CAREGIVERS / DRIVERS / VOLUNTEERS') {
            pwdMode = false;
            staffMode = true;
            i++; // skip header
            continue;
          }
          if (firstCell === 'SUMMARY') {
            break; // End of list
          }
          
          if (pwdMode || staffMode) {
            const name = row[1];
            if (!name || String(name).trim() === '') continue; // Skip empty rows
            
            const age = row[2];
            const gender = row[3];
            const phone = row[4];
            const tshirtSize = row[5];
            const category = row[6];
            
            if (!age) validationErrs.push(\`Row \${i+1}: Missing age for \${name}\`);
            if (!gender) validationErrs.push(\`Row \${i+1}: Missing gender for \${name}\`);
            if (!tshirtSize) validationErrs.push(\`Row \${i+1}: Missing T-Shirt size for \${name}\`);
            
            const participant: any = {
              name: String(name),
              age: age ? String(age) : '',
              gender: gender ? String(gender) : '',
              phone: phone ? String(phone) : '',
              tshirtSize: tshirtSize ? String(tshirtSize) : '',
              category: category ? String(category) : (pwdMode ? 'PWD' : 'Support Staff'),
              isPwd: pwdMode
            };
            
            if (pwdMode) {
              participant.disabilityType = row[7] || '';
              participant.specialNotes = row[8] || '';
            }
            
            participants.push(participant);
          }
        }
        
        if (participants.length === 0) {
          validationErrs.push("No valid participants found in the uploaded file.");
        }
        
        setPreviewData(participants);
        setErrors(validationErrs);
      } catch (error: any) {
        console.error(error);
        setErrors([error.message || 'Failed to parse or validate the file. Ensure you are using the provided template.']);
      } finally {
        setIsValidating(false);
        setLoadingStateStr('');
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const onSubmit = async (data: InstitutionFormValues) => {
    if (previewData.length === 0) {
      setErrors(['Please upload and validate the participant template first.']);
      return;
    }
    
    if (previewData.length !== data.participantCount) {
      setErrors([\`Participant count mismatch. The form indicates \${data.participantCount} participants, but the uploaded file contains \${previewData.length} valid participants.\`]);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = previewData.map(p => ({
        ...p,
        ...data // spread all coordinator fields
      }));
      
      const response = await InstitutionService.submitInstitution(payload);
      navigate(\`/success?id=\${response.id}&type=institution\`);
    } catch (error: any) {
      setSubmitError({
        message: error.message || 'An unexpected error occurred during submission.',
        code: error.code || 'UNKNOWN_ERROR'
      });
      setIsSubmitting(false);
    }
  };

  if (settingsError) return <ErrorState title={settingsError.title} message={settingsError.message} onRetry={loadSettings} />;
  if (!settings) return <LoadingState message="Loading registration forms..." />;

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#eaddff] flex items-center justify-center">
          <Users className="w-6 h-6 text-[#21005d]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#1d1b20] dark:text-white">Institution Bulk Registration</h1>
          <p className="text-[#49454f] dark:text-gray-300 mt-1">Register participants from institutions seamlessly using the official template.</p>
        </div>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-3 gap-6" onSubmit={hookFormSubmit(onSubmit)}>
        <div className="md:col-span-1 space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-[#1d1b20] dark:text-white border-b border-[#e1e2ec] dark:border-gray-700 pb-2 mb-4">Step 1: Details</h3>
            
            <div className="space-y-4">
              <Input label="Institution Name" {...register('institutionName')} error={formErrors.institutionName?.message} required />
              <Input label="Institution Location" {...register('institutionLocation')} error={formErrors.institutionLocation?.message} required />
              
              <div className="pt-4 border-t border-[#e1e2ec] dark:border-gray-700 space-y-4">
                <h4 className="text-sm font-semibold text-[#6750a4]">Coordinator 1 (Required)</h4>
                <Input label="Name" {...register('coordinator1Name')} error={formErrors.coordinator1Name?.message} required />
                <Input label="Phone" {...register('coordinator1Phone')} error={formErrors.coordinator1Phone?.message} required />
                <Input label="Email" type="email" {...register('coordinator1Email')} error={formErrors.coordinator1Email?.message} required />
              </div>
              
              <div className="pt-4 border-t border-[#e1e2ec] dark:border-gray-700 space-y-4">
                <h4 className="text-sm font-semibold text-[#6750a4]">Coordinator 2 (Optional)</h4>
                <Input label="Name" {...register('coordinator2Name')} error={formErrors.coordinator2Name?.message} />
                <Input label="Phone" {...register('coordinator2Phone')} error={formErrors.coordinator2Phone?.message} />
                <Input label="Email" type="email" {...register('coordinator2Email')} error={formErrors.coordinator2Email?.message} />
              </div>

              <div className="pt-4 border-t border-[#e1e2ec] dark:border-gray-700 space-y-4">
                <h4 className="text-sm font-semibold text-[#6750a4]">Coordinator 3 (Optional)</h4>
                <Input label="Name" {...register('coordinator3Name')} error={formErrors.coordinator3Name?.message} />
                <Input label="Phone" {...register('coordinator3Phone')} error={formErrors.coordinator3Phone?.message} />
                <Input label="Email" type="email" {...register('coordinator3Email')} error={formErrors.coordinator3Email?.message} />
              </div>

              <div className="pt-4 border-t border-[#e1e2ec] dark:border-gray-700 space-y-4">
                <h4 className="text-sm font-semibold text-[#6750a4]">Yi Coordinator (Optional)</h4>
                <Input label="Name" {...register('yiCoordinatorName')} error={formErrors.yiCoordinatorName?.message} />
                <Input label="Phone" {...register('yiCoordinatorPhone')} error={formErrors.yiCoordinatorPhone?.message} />
                <Input label="Email" type="email" {...register('yiCoordinatorEmail')} error={formErrors.yiCoordinatorEmail?.message} />
              </div>

              <div className="pt-4 border-t border-[#e1e2ec] dark:border-gray-700 space-y-4">
                <h4 className="text-sm font-semibold text-[#6750a4]">Yuva SPOC (Optional)</h4>
                <Input label="Name" {...register('yuvaSpocName')} error={formErrors.yuvaSpocName?.message} />
                <Input label="Phone" {...register('yuvaSpocPhone')} error={formErrors.yuvaSpocPhone?.message} />
              </div>

              <div className="pt-4 border-t border-[#e1e2ec] dark:border-gray-700 space-y-4">
                <h4 className="text-sm font-semibold text-[#6750a4]">Transport Coordinator (Optional)</h4>
                <Input label="Name" {...register('transportCoordinatorName')} error={formErrors.transportCoordinatorName?.message} />
                <Input label="Phone" {...register('transportCoordinatorName')} error={formErrors.transportCoordinatorPhone?.message} />
              </div>

              <div className="pt-4 border-t border-[#e1e2ec] dark:border-gray-700">
                <Input label="Total Participant Count" type="number" {...register('participantCount')} error={formErrors.participantCount?.message} required />
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-[#1d1b20] dark:text-white mb-2">Step 2: Template</h3>
            <p className="text-sm text-[#49454f] dark:text-gray-300 mb-4">Download our official blank template to fill in participants. Do not modify the structure.</p>
            <div className="flex gap-4">
              <Button type="button" variant="outline" className="flex-1 gap-2" onClick={downloadTemplate}>
                <Download className="w-4 h-4" />
                Download Blank Template
              </Button>
              <Button type="button" variant="ghost" className="text-[#6750a4]" onClick={() => setShowSizeGuide(true)}>
                View Size Guide
              </Button>
            </div>
          </Card>
          
          <Card>
            <h3 className="text-lg font-bold text-[#1d1b20] dark:text-white mb-2">Step 3: Upload Data</h3>
            <p className="text-sm text-[#49454f] dark:text-gray-300 mb-4">Upload the filled template. We will validate it automatically.</p>
            
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#cac4d0] dark:border-gray-700 rounded-2xl cursor-pointer hover:bg-[#f8f9ff] dark:bg-gray-800/50 hover:border-[#6750a4] transition-colors bg-white dark:bg-[#1e1e1e]">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-[#79747e] dark:text-gray-400 mb-2" />
                <p className="text-sm text-[#49454f] dark:text-gray-300 font-medium">Click to upload template</p>
                <p className="text-xs text-[#79747e] dark:text-gray-400">.xlsx</p>
              </div>
              <input type="file" className="hidden" accept=".xlsx" onChange={handleFileUpload} />
            </label>
            
            {file && (
              <p className="text-xs text-center mt-3 text-[#6750a4] font-medium truncate">
                Selected: {file.name}
              </p>
            )}
          </Card>

          <Card className="h-full min-h-[400px]">
            <h3 className="text-lg font-bold text-[#1d1b20] dark:text-white mb-4">Step 4: Preview & Submit</h3>
            
            {!file && (
              <div className="h-64 flex flex-col items-center justify-center text-[#79747e] dark:text-gray-400">
                <Users className="w-12 h-12 mb-4 opacity-20" />
                <p>Upload a file to preview data</p>
              </div>
            )}

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-[#b3261e] font-semibold mb-2">
                  <AlertCircle className="w-5 h-5" />
                  Validation Errors Found
                </div>
                <ul className="list-disc list-inside text-sm text-[#b3261e] space-y-1">
                  {errors.slice(0, 10).map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                  {errors.length > 10 && (
                    <li className="font-medium">...and {errors.length - 10} more errors</li>
                  )}
                </ul>
              </div>
            )}

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-[#b3261e] font-semibold mb-2">
                  <AlertCircle className="w-5 h-5" />
                  {submitError.title || 'Submission Failed'}
                </div>
                <p className="text-sm text-[#b3261e]">{submitError.message}</p>
              </div>
            )}

            {previewData.length > 0 && errors.length === 0 && (
              <div className="space-y-4">
                <div className="bg-[#f1f3f4] dark:bg-gray-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1d1b20] dark:text-white">Valid Participants</p>
                    <p className="text-2xl font-bold text-[#6750a4]">{previewData.length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>

                <div className="border border-[#e1e2ec] dark:border-gray-700 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#f8f9ff] dark:bg-gray-800/50 text-[#49454f] dark:text-gray-300">
                        <tr>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Age</th>
                          <th className="px-4 py-3">T-Shirt</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="border-b border-[#e1e2ec] dark:border-gray-700">
                            <td className="px-4 py-3 font-medium text-[#1d1b20] dark:text-white">{row.name}</td>
                            <td className="px-4 py-3">{row.age}</td>
                            <td className="px-4 py-3">{row.tshirtSize}</td>
                            <td className="px-4 py-3">{row.category}</td>
                            <td className="px-4 py-3">
                              {row.isPwd ? (
                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-medium">PWD</span>
                              ) : (
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">Staff</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {previewData.length > 10 && (
                    <div className="bg-[#f8f9ff] dark:bg-gray-800/50 p-2 text-center text-xs text-[#79747e] dark:text-gray-400 border-t border-[#e1e2ec] dark:border-gray-700">
                      Showing 10 of {previewData.length} participants
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSubmitting || isValidating} aria-busy={isSubmitting || isValidating} className="w-full sm:w-auto min-w-[250px]">
                    {(isSubmitting || isValidating) ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                        {loadingStateStr || 'Processing...'}
                      </>
                    ) : 'Confirm & Register Institution'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </form>
      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
    </div>
  );
}
`;

fs.writeFileSync('src/pages/InstitutionRegistration.tsx', code);
