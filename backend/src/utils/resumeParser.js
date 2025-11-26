const pdf = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text from PDF buffer
 */
async function parsePDF(buffer) {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
}

/**
 * Extract text from DOCX buffer
 */
async function parseDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX file');
  }
}

/**
 * Parse resume based on file type
 */
async function parseResume(buffer, mimeType, fileName) {
  const fileExtension = fileName.split('.').pop().toLowerCase();

  if (mimeType.includes('pdf') || fileExtension === 'pdf') {
    return await parsePDF(buffer);
  } else if (
    mimeType.includes('wordprocessingml') ||
    mimeType.includes('msword') ||
    fileExtension === 'docx' ||
    fileExtension === 'doc'
  ) {
    return await parseDOCX(buffer);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

/**
 * Extract candidate name from filename or resume text
 */
function extractCandidateName(fileName, resumeText) {
  // Remove file extension
  let name = fileName.replace(/\.(pdf|docx|doc)$/i, '');

  // Remove common prefixes/suffixes
  name = name.replace(/^(resume|cv)[-_\s]*/i, '');
  name = name.replace(/[-_\s]*(resume|cv)$/i, '');

  // Clean up
  name = name.replace(/[_-]/g, ' ').trim();

  // If name is too long or looks like gibberish, try to extract from resume text
  if (name.length > 50 || name.length < 2) {
    // Try to find name at the beginning of resume (first line usually has the name)
    const firstLine = resumeText.split('\n')[0];
    if (firstLine && firstLine.length < 50) {
      name = firstLine.trim();
    }
  }

  return name || 'Unknown Candidate';
}

module.exports = {
  parsePDF,
  parseDOCX,
  parseResume,
  extractCandidateName,
};
