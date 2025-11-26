const express = require('express');
const router = express.Router();
const multer = require('multer');
const screeningController = require('../controllers/screeningController');
const { verifySession } = require('../controllers/authController');
const { analysisLimiter } = require('../middleware/rateLimiter');

// Configure multer for file uploads (in-memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
    }
  },
});

// Process resumes from Google Drive folder
router.post(
  '/process',
  verifySession,
  analysisLimiter,
  screeningController.processResumes
);

// Analyze single uploaded resume
router.post(
  '/analyze-single',
  analysisLimiter,
  upload.single('resume'),
  screeningController.analyzeSingleResume
);

module.exports = router;
