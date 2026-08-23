const fs = require('fs');
let code = fs.readFileSync('src/pages/InstitutionRegistration.tsx', 'utf-8');

// The file might be in a broken state now. I will replace the entire return statement.
const renderStart = code.indexOf('return (');
if (renderStart === -1) {
    console.error("renderStart not found");
} else {
    // We will just replace everything from `return (` to the end with our cleanly structured JSX
    const newRender = `return (
    <div className="max-w-4xl mx-auto w-full pb-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#eaddff] flex items-center justify-center">
          <Users className="w-6 h-6 text-[#21005d]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#1d1b20] dark:text-white">Institution Bulk Registration</h1>
          <p className="text-[#49454f] dark:text-gray-300 mt-1">Register participants from institutions seamlessly using the official template.</p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={hookFormSubmit(onSubmit)}>
        <Card>
          <h3 className="text-lg font-bold text-[#1d1b20] dark:text-white border-b border-[#e1e2ec] dark:border-gray-700 pb-2 mb-4">Step 1: Details</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Institution Name" {...register('institutionName')} error={formErrors.institutionName?.message} required />
              <Input label="Institution Location" {...register('institutionLocation')} error={formErrors.institutionLocation?.message} required />
            </div>
            
            <div className="pt-4 border-t border-[#e1e2ec] dark:border-gray-700">
              <h4 className="text-sm font-semibold text-[#6750a4] mb-4">Coordinators</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Coordinator 1 (Required)</h5>
                  <Input label="Name" {...register('coordinator1Name')} error={formErrors.coordinator1Name?.message} required />
                  <Input label="Phone" {...register('coordinator1Phone')} error={formErrors.coordinator1Phone?.message} required />
                  <Input label="Email" type="email" {...register('coordinator1Email')} error={formErrors.coordinator1Email?.message} required />
                </div>
                
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Coordinator 2 (Optional)</h5>
                  <Input label="Name" {...register('coordinator2Name')} error={formErrors.coordinator2Name?.message} />
                  <Input label="Phone" {...register('coordinator2Phone')} error={formErrors.coordinator2Phone?.message} />
                  <Input label="Email" type="email" {...register('coordinator2Email')} error={formErrors.coordinator2Email?.message} />
                </div>

                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Coordinator 3 (Optional)</h5>
                  <Input label="Name" {...register('coordinator3Name')} error={formErrors.coordinator3Name?.message} />
                  <Input label="Phone" {...register('coordinator3Phone')} error={formErrors.coordinator3Phone?.message} />
                  <Input label="Email" type="email" {...register('coordinator3Email')} error={formErrors.coordinator3Email?.message} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#e1e2ec] dark:border-gray-700">
              <div className="md:w-1/3">
                <Input label="Total Participant Count" type="number" {...register('participantCount')} error={formErrors.participantCount?.message} required />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-[#1d1b20] dark:text-white mb-2">Step 2: Template</h3>
          <p className="text-sm text-[#49454f] dark:text-gray-300 mb-4">Download our official blank template to fill in participants. Do not modify the structure.</p>
          <div className="flex gap-4">
            <Button type="button" variant="outline" className="flex-1 sm:flex-none sm:w-64 gap-2" onClick={downloadTemplate}>
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

        <Card>
          <h3 className="text-lg font-bold text-[#1d1b20] dark:text-white mb-4">Step 4: Preview & Submit</h3>
          
          {!file && (
            <div className="h-48 flex flex-col items-center justify-center text-[#79747e] dark:text-gray-400">
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
      </form>

      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
    </div>
  );
}
`;
    
    code = code.substring(0, renderStart) + newRender;
    fs.writeFileSync('src/pages/InstitutionRegistration.tsx', code);
}
