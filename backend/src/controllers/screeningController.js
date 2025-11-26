const resumeScreeningService = require('../services/resumeScreeningService');

/**
 * Process resumes from Google Drive folder
 * Supports Server-Sent Events (SSE) for real-time progress
 */
async function processResumes(req, res) {
  try {
    const { jobDescription, folderId } = req.body;

    if (!jobDescription || !folderId) {
      return res.status(400).json({
        success: false,
        error: 'Job description and folder ID are required',
      });
    }

    // Check if client wants SSE
    const wantsSSE = req.headers.accept === 'text/event-stream';

    if (wantsSSE) {
      // Set up SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Progress callback for SSE
      const progressCallback = (progress) => {
        res.write(`data: ${JSON.stringify(progress)}\n\n`);
      };

      // Process resumes with progress updates
      const result = await resumeScreeningService.processResumesFromFolder(
        jobDescription,
        folderId,
        progressCallback
      );

      // Send final result
      res.write(`data: ${JSON.stringify({ type: 'complete', ...result })}\n\n`);
      res.end();
    } else {
      // Regular JSON response without progress updates
      const result = await resumeScreeningService.processResumesFromFolder(
        jobDescription,
        folderId
      );

      res.json(result);
    }
  } catch (error) {
    console.error('Error processing resumes:', error);

    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
      res.end();
    } else {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

/**
 * Analyze single uploaded resume
 */
async function analyzeSingleResume(req, res) {
  try {
    const { jobDescription } = req.body;
    const file = req.file;

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Job description is required',
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'Resume file is required',
      });
    }

    const result = await resumeScreeningService.analyzeSingleResume(
      jobDescription,
      file.buffer,
      file.originalname,
      file.mimetype
    );

    res.json(result);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  processResumes,
  analyzeSingleResume,
};
