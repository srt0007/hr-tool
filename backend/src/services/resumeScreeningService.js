const googleDriveService = require('./googleDriveService');
const { parseResume, extractCandidateName } = require('../utils/resumeParser');
const { analyzeResume } = require('../config/claude');

/**
 * Process all resumes in a Google Drive folder
 */
async function processResumesFromFolder(jobDescription, folderId, progressCallback) {
  try {
    // Get list of files
    const files = await googleDriveService.listFilesInFolder(folderId);

    if (files.length === 0) {
      return {
        success: true,
        message: 'No resume files found in the folder',
        results: [],
      };
    }

    const results = [];
    const total = files.length;

    // Process each resume
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Send progress update
        if (progressCallback) {
          progressCallback({
            current: i + 1,
            total,
            fileName: file.name,
            status: 'processing',
          });
        }

        // Download file
        const fileBuffer = await googleDriveService.downloadFile(file.id);

        // Parse resume text
        const resumeText = await parseResume(fileBuffer, file.mimeType, file.name);

        // Extract candidate name
        const candidateName = extractCandidateName(file.name, resumeText);

        // Analyze with Claude
        const analysis = await analyzeResume(jobDescription, resumeText, candidateName);

        // Store result
        results.push({
          id: file.id,
          candidateName,
          fileName: file.name,
          matchScore: analysis.matchScore,
          keySkillsMatched: analysis.keySkillsMatched,
          missingSkills: analysis.missingSkills,
          summary: analysis.summary,
          fileSize: file.size,
          modifiedTime: file.modifiedTime,
        });

        // Send progress update
        if (progressCallback) {
          progressCallback({
            current: i + 1,
            total,
            fileName: file.name,
            status: 'completed',
          });
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);

        // Add error result
        results.push({
          id: file.id,
          candidateName: extractCandidateName(file.name, ''),
          fileName: file.name,
          matchScore: 0,
          keySkillsMatched: [],
          missingSkills: [],
          summary: `Error processing resume: ${error.message}`,
          error: true,
          fileSize: file.size,
          modifiedTime: file.modifiedTime,
        });

        if (progressCallback) {
          progressCallback({
            current: i + 1,
            total,
            fileName: file.name,
            status: 'error',
            error: error.message,
          });
        }
      }
    }

    // Sort by match score (highest first)
    results.sort((a, b) => b.matchScore - a.matchScore);

    return {
      success: true,
      results,
      totalProcessed: files.length,
      totalErrors: results.filter((r) => r.error).length,
    };
  } catch (error) {
    console.error('Error in processResumesFromFolder:', error);
    throw error;
  }
}

/**
 * Analyze a single uploaded resume
 */
async function analyzeSingleResume(jobDescription, fileBuffer, fileName, mimeType) {
  try {
    // Parse resume text
    const resumeText = await parseResume(fileBuffer, mimeType, fileName);

    // Extract candidate name
    const candidateName = extractCandidateName(fileName, resumeText);

    // Analyze with Claude
    const analysis = await analyzeResume(jobDescription, resumeText, candidateName);

    return {
      success: true,
      result: {
        candidateName,
        fileName,
        matchScore: analysis.matchScore,
        keySkillsMatched: analysis.keySkillsMatched,
        missingSkills: analysis.missingSkills,
        summary: analysis.summary,
      },
    };
  } catch (error) {
    console.error('Error analyzing single resume:', error);
    throw error;
  }
}

module.exports = {
  processResumesFromFolder,
  analyzeSingleResume,
};
