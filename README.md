# ATS Resume Screening Tool

An AI-powered Applicant Tracking System (ATS) that analyzes and ranks resumes against job descriptions using Claude AI and Google Drive integration.

## Features

- **AI-Powered Analysis**: Uses Claude 3.5 Sonnet to intelligently match resumes with job requirements
- **Google Drive Integration**: Access resumes directly from your Google Drive folders
- **Batch Processing**: Analyze multiple resumes simultaneously with real-time progress tracking
- **Smart Ranking**: Candidates are automatically ranked by match score
- **Detailed Insights**: Get key skills matched, missing skills, and AI-generated summaries
- **Export Functionality**: Download results as CSV for further analysis
- **Multi-Environment Support**: Separate configurations for local, staging, and production

## Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Axios** for API communication

### Backend
- **Node.js** with Express
- **Claude API** (Anthropic) for AI analysis
- **Google Drive API** for file access
- **PDF-Parse** and **Mammoth** for document parsing

## Prerequisites

- Node.js 18+ and npm
- Google Cloud Project with Drive API enabled
- Anthropic Claude API key
- Git

## Setup Instructions

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd hr-tool
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend
npm install
\`\`\`

### 3. Frontend Setup

\`\`\`bash
# From project root
npm install
\`\`\`

### 4. Google Drive API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Drive API" and enable it
4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - Local: `http://localhost:4000/auth/google/callback`
     - Staging: `https://your-staging-backend.railway.app/auth/google/callback`
     - Production: `https://your-production-backend.railway.app/auth/google/callback`
   - Download the credentials (Client ID and Client Secret)

### 5. Claude API Setup

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

### 6. Environment Configuration

#### Backend Environment

Create `backend/.env.local`:

\`\`\`env
NODE_ENV=development
PORT=4000

# Claude API
CLAUDE_API_KEY=sk-ant-your-key-here

# Google Drive API
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:4000/auth/google/callback

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
\`\`\`

For staging and production, create `backend/.env.staging` and `backend/.env.production` with appropriate values.

#### Frontend Environment

The frontend environment files are already created. Update them with your backend URLs:

- `.env.local` - Points to `http://localhost:4000`
- `.env.staging` - Update with your staging backend URL
- `.env.production` - Update with your production backend URL

### 7. Running Locally

#### Start Backend

\`\`\`bash
cd backend
npm run dev
\`\`\`

Backend will run on http://localhost:4000

#### Start Frontend

\`\`\`bash
# From project root
npm run dev
\`\`\`

Frontend will run on http://localhost:3000

### 8. Deployment

#### Backend Deployment (Railway/Render)

1. Create a new project on [Railway](https://railway.app/) or [Render](https://render.com/)
2. Connect your GitHub repository
3. Set the root directory to `backend`
4. Add environment variables from `.env.production`
5. Deploy

#### Frontend Deployment (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root
3. Follow the prompts
4. Add environment variables in Vercel dashboard
5. Deploy: `vercel --prod`

Alternatively, connect your GitHub repository directly in the Vercel dashboard.

## Usage

### 1. Enter Job Description
- Visit the home page
- Paste or upload the job description
- Click "Continue to Folder Selection"

### 2. Connect Google Drive
- Authenticate with your Google account
- Grant access to Google Drive

### 3. Select Resume Folder
- Browse or search for the folder containing resumes
- Select the folder
- Click "Start Processing"

### 4. View Results
- Watch real-time progress as resumes are analyzed
- View ranked candidates with match scores
- Filter and sort results
- Export to CSV

## Project Structure

\`\`\`
hr-tool/
├── src/                      # Frontend source
│   ├── app/                  # Next.js app router pages
│   │   ├── page.tsx          # Job description input
│   │   ├── select-folder/    # Folder selection
│   │   ├── process/          # Processing & results
│   │   └── auth/callback/    # OAuth callback
│   └── lib/                  # Utilities
│       ├── api.ts            # API client
│       └── csvExport.ts      # CSV export utilities
├── backend/                  # Backend source
│   └── src/
│       ├── config/           # Configuration
│       ├── controllers/      # Route controllers
│       ├── services/         # Business logic
│       ├── routes/           # API routes
│       ├── middleware/       # Express middleware
│       ├── utils/            # Utilities
│       └── index.js          # Entry point
├── .env.local                # Frontend local env
├── .env.staging              # Frontend staging env
├── .env.production           # Frontend production env
└── package.json              # Frontend dependencies
\`\`\`

## API Endpoints

### Authentication
- `GET /auth/google/url` - Get Google OAuth URL
- `GET /auth/google/callback` - Handle OAuth callback
- `GET /auth/status` - Check authentication status
- `POST /auth/logout` - Logout

### Google Drive
- `GET /api/drive/folders` - List root folders
- `GET /api/drive/folders/search?query=` - Search folders
- `GET /api/drive/folders/:folderId` - Get folder details

### Screening
- `POST /api/screening/process` - Process resumes from folder
- `POST /api/screening/analyze-single` - Analyze single resume

## Environment Variables

### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/staging/production) | Yes |
| `PORT` | Server port | Yes |
| `CLAUDE_API_KEY` | Anthropic Claude API key | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `GOOGLE_REDIRECT_URI` | OAuth redirect URI | Yes |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | Yes |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No |

### Frontend

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_ENV` | Environment name | Yes |
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |

## Troubleshooting

### Google Drive Authentication Fails
- Verify redirect URI matches in Google Cloud Console
- Check that Google Drive API is enabled
- Ensure credentials are correctly set in environment variables

### Claude API Errors
- Verify API key is valid and has sufficient credits
- Check rate limits haven't been exceeded
- Ensure the model name is correct in `backend/src/config/claude.js`

### CORS Errors
- Verify `ALLOWED_ORIGINS` in backend includes your frontend URL
- Check that frontend is using correct `NEXT_PUBLIC_API_URL`

### Resume Parsing Fails
- Ensure files are valid PDF or DOCX format
- Check file size limits (default 10MB)
- Verify pdf-parse and mammoth dependencies are installed

## Security Notes

- Never commit `.env` files to version control
- Keep API keys secure and rotate them regularly
- Use different API keys for staging and production
- Implement proper authentication in production
- Consider adding database for session storage in production
- Review and adjust rate limits based on your needs

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
