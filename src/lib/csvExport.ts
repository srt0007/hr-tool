import { ResumeAnalysis } from './api';

/**
 * Export resume analysis results to CSV
 */
export function exportToCSV(results: ResumeAnalysis[], filename = 'resume-screening-results.csv') {
  // Define CSV headers
  const headers = [
    'Candidate Name',
    'File Name',
    'Match Score (%)',
    'Key Skills Matched',
    'Missing Skills',
    'Summary',
    'File Size (KB)',
    'Modified Time',
  ];

  // Convert results to CSV rows
  const rows = results.map((result) => [
    result.candidateName,
    result.fileName,
    result.matchScore,
    result.keySkillsMatched.join('; '),
    result.missingSkills.join('; '),
    result.summary.replace(/"/g, '""'), // Escape quotes
    result.fileSize ? Math.round(result.fileSize / 1024) : '',
    result.modifiedTime
      ? new Date(result.modifiedTime).toLocaleString()
      : '',
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${cell}"`).join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export shortlisted candidates (match score >= threshold)
 */
export function exportShortlisted(
  results: ResumeAnalysis[],
  threshold = 70,
  filename = 'shortlisted-candidates.csv'
) {
  const shortlisted = results.filter((result) => result.matchScore >= threshold);
  exportToCSV(shortlisted, filename);
}
