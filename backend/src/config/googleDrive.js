const { google } = require('googleapis');
const config = require('./env');

// OAuth2 client for Google Drive
const oauth2Client = new google.auth.OAuth2(
  config.google.clientId,
  config.google.clientSecret,
  config.google.redirectUri
);

// Scopes required for Google Drive access
const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];

/**
 * Generate authentication URL for Google OAuth
 */
function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

/**
 * Get tokens from authorization code
 */
async function getTokensFromCode(code) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Set credentials for the OAuth2 client
 */
function setCredentials(tokens) {
  oauth2Client.setCredentials(tokens);
}

/**
 * Get Google Drive instance
 */
function getDriveInstance() {
  return google.drive({ version: 'v3', auth: oauth2Client });
}

module.exports = {
  oauth2Client,
  getAuthUrl,
  getTokensFromCode,
  setCredentials,
  getDriveInstance,
  SCOPES,
};
