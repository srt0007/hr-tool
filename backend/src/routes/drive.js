const express = require('express');
const router = express.Router();
const driveController = require('../controllers/driveController');
const { verifySession } = require('../controllers/authController');

// All drive routes require authentication
router.use(verifySession);

// List folders
router.get('/folders', driveController.listFolders);

// Search folders
router.get('/folders/search', driveController.searchFolders);

// Get folder details
router.get('/folders/:folderId', driveController.getFolderDetails);

module.exports = router;
