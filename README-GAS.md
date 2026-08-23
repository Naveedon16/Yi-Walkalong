# Google Apps Script Setup Instructions

We have created the full backend logic for Google Apps Script. 

## 1. Copy the Code
1. Open the file `apps-script/Code.js` in your AI Studio project explorer (on the left panel).
2. Copy the entire contents of the file.

## 2. Deploy on Google Apps Script
1. Go to [script.google.com](https://script.google.com/) and create a **New Project**.
2. Paste the copied code into `Code.gs` (replace the default empty function).
3. Save the project (Cmd/Ctrl + S).

## 3. Initialize the Database
1. In the Apps Script editor, select the `setup` function from the dropdown menu in the toolbar.
2. Click **Run**.
3. Google will ask for permissions to manage files in your Drive (to create the spreadsheet). Click **Review permissions** -> choose your account -> click **Advanced** -> click **Go to [Project Name] (unsafe)** -> **Allow**.
4. Once it finishes, check the Execution log. It will output a URL. That is your newly created Google Sheet database. 
5. Open your Google Drive, you will find a spreadsheet named **"WalkAlong 2026 Database"** automatically formatted with all the necessary sheets and headers.

## 4. Deploy as a Web App
1. In the Apps Script editor, click the blue **Deploy** button on the top right.
2. Select **New deployment**.
3. Click the gear icon next to "Select type" and choose **Web app**.
4. In the configuration:
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(Important: It must be 'Anyone' so the frontend can send requests without authentication)*.
5. Click **Deploy**.
6. Copy the **Web app URL** provided.

## 5. Connect the Frontend
1. Open your AI Studio project's **Settings**.
2. Find Environment Variables.
3. Add a new variable:
   - Key: `VITE_GAS_ENDPOINT`
   - Value: `[Paste your Web app URL here]`
4. Save and reload the app!

Your application is now fully connected to the Google Sheets backend, generating IDs securely and handling CSV validations on the server!
