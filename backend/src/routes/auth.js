const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Get Google OAuth URL
router.get('/google/url', authController.getGoogleAuthUrl);

// OAuth callback
router.get('/google/callback', authController.handleOAuthCallback);

// Check auth status
router.get('/status', authController.checkAuthStatus);

// Logout
router.post('/logout', authController.logout);

module.exports = router;
