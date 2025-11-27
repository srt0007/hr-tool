# HR Tool - Production Deployment Guide

This guide will walk you through deploying the HR Resume Screening Tool to production.

## Architecture Overview

- **Frontend**: Deployed on Vercel (Next.js)
- **Backend**: Deployed on Railway (Node.js/Express)
- **Services**: Google Drive API, Claude AI API

---

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click "Login" and sign in with GitHub
3. Authorize Railway to access your GitHub account

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your repository: `srt0007/hr-tool`
4. Railway will detect your project

### Step 3: Configure Root Directory
1. After the project is created, click on the service
2. Go to "Settings" tab
3. Under "Build & Deploy", set:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start` (should be auto-detected)

### Step 4: Set Environment Variables
1. Go to the "Variables" tab
2. Add the following environment variables:

```
NODE_ENV=production
PORT=4000
CLAUDE_API_KEY=your-claude-api-key-here
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

**Use the same values from your `.env.local` file**

**IMPORTANT**: We'll update `GOOGLE_REDIRECT_URI` and `ALLOWED_ORIGINS` after we get the URLs.

### Step 5: Deploy
1. Railway will automatically deploy your backend
2. Wait for deployment to complete (usually 2-3 minutes)
3. Once deployed, Railway will provide you with a public URL (e.g., `https://your-app.up.railway.app`)
4. **Copy this URL** - you'll need it for the next steps

### Step 6: Update Backend Environment Variables
1. Go back to the "Variables" tab
2. Update `GOOGLE_REDIRECT_URI` to:
   ```
   https://your-backend-url.up.railway.app/auth/google/callback
   ```
   (Replace `your-backend-url` with your actual Railway URL)

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" and sign in with GitHub
3. Authorize Vercel to access your GitHub account

### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Find and select your repository: `srt0007/hr-tool`
3. Click "Import"

### Step 3: Configure Project Settings
1. **Framework Preset**: Next.js (should be auto-detected)
2. **Root Directory**: Leave as `.` (root)
3. **Build Command**: `npm run build` (auto-detected)
4. **Output Directory**: `.next` (auto-detected)

### Step 4: Set Environment Variables
1. Under "Environment Variables", add:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app
```
(Replace `your-backend-url` with your actual Railway backend URL from Part 1)

### Step 5: Deploy
1. Click "Deploy"
2. Vercel will build and deploy your frontend (usually 2-3 minutes)
3. Once deployed, Vercel will provide you with a public URL (e.g., `https://hr-tool.vercel.app`)
4. **Copy this URL** - you'll need it for Google OAuth setup

---

## Part 3: Update Google OAuth Settings

### Step 1: Go to Google Cloud Console
1. Visit [console.cloud.google.com](https://console.cloud.google.com)
2. Select your project (the one with your OAuth credentials)

### Step 2: Update OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Under "Authorized domains", add:
   - `vercel.app` (for your Vercel frontend)
   - `railway.app` (for your Railway backend)

### Step 3: Update Authorized Redirect URIs
1. Go to "APIs & Services" → "Credentials"
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   ```
   https://your-backend-url.up.railway.app/auth/google/callback
   ```
   (Replace `your-backend-url` with your actual Railway backend URL)
4. Click "Save"

### Step 4: Update Railway Backend ALLOWED_ORIGINS
1. Go back to Railway
2. Go to your backend service → "Variables" tab
3. Update `ALLOWED_ORIGINS` to your Vercel frontend URL:
   ```
   https://hr-tool.vercel.app
   ```
   (Replace with your actual Vercel URL)
4. Save - Railway will automatically redeploy

---

## Part 4: Test Your Production Deployment

### Step 1: Access Your Application
1. Open your Vercel URL in a browser (e.g., `https://hr-tool.vercel.app`)
2. You should see the job description input page

### Step 2: Test Google OAuth
1. Enter a job description
2. Click "Continue to Select Folder"
3. Click "Sign in with Google"
4. Authorize the application
5. You should see your Google Drive folders

### Step 3: Test Resume Processing
1. Select a folder with resume files
2. Click "Continue to Process"
3. Click "Start Processing"
4. Verify that resumes are analyzed and results are displayed

---

## Troubleshooting

### Backend Issues
- Check Railway logs: Go to your service → "Deployments" → Click on latest deployment → "View Logs"
- Verify all environment variables are set correctly
- Ensure PORT is set to 4000 or let Railway assign it automatically

### Frontend Issues
- Check Vercel logs: Go to your project → "Deployments" → Click on latest deployment → "View Function Logs"
- Verify `NEXT_PUBLIC_API_URL` points to your Railway backend URL
- Make sure the URL includes `https://` and no trailing slash

### Google OAuth Issues
- Ensure redirect URI in Google Cloud Console matches Railway backend URL exactly
- Verify authorized domains are added in OAuth consent screen
- Check that you're added as a test user if the app isn't published

### CORS Issues
- Verify `ALLOWED_ORIGINS` in Railway matches your Vercel frontend URL exactly
- Make sure both URLs use `https://`

---

## Environment Variables Summary

### Railway (Backend)
```env
NODE_ENV=production
PORT=4000
CLAUDE_API_KEY=sk-ant-api03-...
GOOGLE_CLIENT_ID=1083175336670-...
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=https://your-backend-url.up.railway.app/auth/google/callback
ALLOWED_ORIGINS=https://hr-tool.vercel.app
```

### Vercel (Frontend)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app
```

---

## Next Steps

1. Share the Vercel URL with your HR team
2. Test thoroughly with real resume data
3. Consider setting up a custom domain in Vercel settings
4. Monitor usage and costs in Railway and Vercel dashboards
5. Set up error tracking (optional): Sentry, LogRocket, etc.

---

## Security Notes

- Never commit `.env.local` or `.env.production` files to Git
- Rotate API keys regularly
- Review Google Cloud Console security settings
- Enable Vercel password protection if needed (Settings → Password Protection)
- Consider implementing authentication for your HR team (future enhancement)

---

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review logs in Railway and Vercel
3. Verify all environment variables are correct
4. Ensure Google OAuth settings are properly configured
