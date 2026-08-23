import React from 'react';

export function SetupInstructions() {
  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-gray-800/50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-[#1e1e1e] max-w-2xl w-full rounded-3xl shadow-lg p-8 border border-[#e1e2ec]">
        <h1 className="text-2xl font-bold text-[#1d1b20] dark:text-white mb-4">
          Backend Configuration Required
        </h1>
        <p className="text-[#49454f] dark:text-gray-300 mb-6">
          This application requires a Google Apps Script backend to function. It appears that the <code className="bg-[#f1f3f4] dark:bg-gray-800 px-2 py-1 rounded text-[#1d1b20] dark:text-white">VITE_GAS_ENDPOINT</code> environment variable is missing.
        </p>

        <div className="space-y-6">
          <div className="bg-[#f1f3f4] dark:bg-gray-800 p-6 rounded-2xl">
            <h2 className="font-bold text-[#1d1b20] dark:text-white mb-2 text-lg">How to set it up:</h2>
            <ol className="list-decimal pl-5 space-y-3 text-[#49454f] dark:text-gray-300">
              <li>
                Open the <code className="bg-white dark:bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#cac4d0]">apps-script/Code.js</code> file in your project.
              </li>
              <li>
                Go to <a href="https://script.google.com/" target="_blank" rel="noreferrer" className="text-[#6750a4] font-medium hover:underline">script.google.com</a> and create a New Project.
              </li>
              <li>
                Paste the code from <code className="bg-white dark:bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#cac4d0]">Code.js</code> and run the <code className="bg-white dark:bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#cac4d0]">setup</code> function to initialize your Google Sheet.
              </li>
              <li>
                Click <strong>Deploy</strong> &gt; <strong>New deployment</strong>. Select <strong>Web app</strong>. Ensure "Who has access" is set to <strong>Anyone</strong>.
              </li>
              <li>
                Copy the Web app URL provided.
              </li>
              <li>
                Open your project Settings in AI Studio (or your local environment variables) and add:
                <div className="mt-2 bg-white dark:bg-[#1e1e1e] p-3 rounded border border-[#cac4d0] font-mono text-sm overflow-x-auto">
                  VITE_GAS_ENDPOINT=https://script.google.com/macros/s/.../exec
                </div>
              </li>
              <li>
                Reload the application.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
