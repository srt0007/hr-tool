const {
  getAuthUrl,
  getTokensFromCode,
  setCredentials,
} = require('../config/googleDrive');

// In-memory token storage (in production, use a database or secure session storage)
const tokenStore = new Map();

/**
 * Get Google OAuth URL
 */
function getGoogleAuthUrl(req, res) {
  try {
    const authUrl = getAuthUrl();
    res.json({
      success: true,
      authUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate auth URL',
    });
  }
}

/**
 * Handle OAuth callback
 */
async function handleOAuthCallback(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code is required',
      });
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    // Generate session ID
    const sessionId = Math.random().toString(36).substring(7);

    // Store tokens (in production, use secure session storage)
    tokenStore.set(sessionId, tokens);

    // Set credentials
    setCredentials(tokens);

    // Redirect back to frontend with session ID
    const frontendUrl = process.env.ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?session=${sessionId}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to authenticate with Google',
    });
  }
}

/**
 * Verify session and set credentials
 */
function verifySession(req, res, next) {
  const sessionId = req.headers['x-session-id'];

  if (!sessionId) {
    return res.status(401).json({
      success: false,
      error: 'Session ID is required',
    });
  }

  const tokens = tokenStore.get(sessionId);

  if (!tokens) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session',
    });
  }

  // Set credentials for this request
  setCredentials(tokens);

  next();
}

/**
 * Logout - clear session
 */
function logout(req, res) {
  const sessionId = req.headers['x-session-id'];

  if (sessionId) {
    tokenStore.delete(sessionId);
  }

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}

/**
 * Check authentication status
 */
function checkAuthStatus(req, res) {
  const sessionId = req.headers['x-session-id'];

  if (!sessionId || !tokenStore.has(sessionId)) {
    return res.json({
      success: true,
      authenticated: false,
    });
  }

  res.json({
    success: true,
    authenticated: true,
  });
}

module.exports = {
  getGoogleAuthUrl,
  handleOAuthCallback,
  verifySession,
  logout,
  checkAuthStatus,
};
