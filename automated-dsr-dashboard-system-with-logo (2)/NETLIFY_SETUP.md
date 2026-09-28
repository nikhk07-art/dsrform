# Deploying Your DSR Flow Portal to Netlify (Vite React Build)

This project has been rebuilt as a **100% serverless, static-compatible React Web Application** to prevent any database or serverless connection errors on Netlify, GitHub Pages, or Vercel!

---

## 🚀 Easy 2-Step Netlify Deploy

### Step 1: Push or Upload to Netlify
1. Log in to your [Netlify Dashboard](https://app.netlify.com/).
2. Select **"Import from Git"** (connect your GitHub repository) OR use **"Drag and Drop"** by dragging your static built `dist/` directory directly into Netlify.

### Step 2: Configure Build Settings
If you deploy via GitHub sync on Netlify, configure these exact build settings:
* **Build Command:** `npm run build` or `vite build`
* **Publish Directory:** `dist`

---

## 🔐 Configuration Instructions for Shradha, Atul, and Shalu

Once deployed, follow these steps to link your web application to your Google Sheets:

1. **Access Management Options:**
   - On the portal's main login page, select **Shradha Bayas**, **Atul**, or **Shalu**.
   - Enter your secure password PIN: **`1234`** (Default).
   - Once inside, click on the **"Google Sheets Connection Link"** tab.

2. **Paste Google Sheets Link:**
   - In the "Google Sheets Web App Link" input field, paste your deployed Google Apps Script URL.
   - Click **"Save Connection Link"**.
   - Your connection setting is now saved permanently inside your secure browser localStorage.

3. **Deploy the Password Locked Apps Script:**
   - Inside the connection link tab, click **"Copy Full Apps Script"** to copy the complete Apps Script code.
   - In your Google Sheet, select **Extensions > Apps Script**.
   - Delete any existing code, paste the copied script block, and click **Save**.
   - Deploy the script as a Web App (Deploy > New Deployment, execute as "Me", access "Anyone").
   - This script will auto-format all 5 sheet tabs with headers and prompt anyone opening the Google Sheet to enter a secret password PIN (default `"1234"`) to unlock editing, keeping your spreadsheets locked!
