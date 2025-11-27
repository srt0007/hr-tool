const jwt = require('jsonwebtoken');
const {
  getAuthUrl,
  getTokensFromCode,
  setCredentials,
} = require('../config/googleDrive');

// JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

    // Create JWT token containing the OAuth credentials (expires in 7 days)
    const sessionToken = jwt.sign(
      { tokens },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set credentials
    setCredentials(tokens);

    // Redirect back to frontend with JWT session token
    const frontendUrl = process.env.ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?session=${sessionToken}`);
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
  const sessionToken = req.headers['x-session-id'];

  if (!sessionToken) {
    return res.status(401).json({
      success: false,
      error: 'Session token is required',
    });
  }

  try {
    // Verify and decode JWT token
    const decoded = jwt.verify(sessionToken, JWT_SECRET);
    const tokens = decoded.tokens;

    if (!tokens) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session token',
      });
    }

    // Set credentials for this request
    setCredentials(tokens);

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session',
    });
  }
}

/**
 * Logout - clear session (client-side)
 */
function logout(req, res) {
  // With JWT, logout is handled client-side by removing the token
  // No server-side cleanup needed
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}

/**
 * Check authentication status
 */
function checkAuthStatus(req, res) {
  const sessionToken = req.headers['x-session-id'];

  if (!sessionToken) {
    return res.json({
      success: true,
      authenticated: false,
    });
  }

  try {
    // Verify JWT token
    jwt.verify(sessionToken, JWT_SECRET);
    res.json({
      success: true,
      authenticated: true,
    });
  } catch (error) {
    res.json({
      success: true,
      authenticated: false,
    });
  }
}

module.exports = {
  getGoogleAuthUrl,
  handleOAuthCallback,
  verifySession,
  logout,
  checkAuthStatus,
};
