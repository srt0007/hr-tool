'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { screeningAPI, ResumeAnalysis } from '@/lib/api';
import { exportToCSV, exportShortlisted } from '@/lib/csvExport';

export default function ProcessPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState('');
  const [folderId, setFolderId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, fileName: '' });
  const [results, setResults] = useState<ResumeAnalysis[]>([]);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'matchScore' | 'name'>('matchScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterScore, setFilterScore] = useState(0);

  useEffect(() => {
    // Get job description and folder ID from sessionStorage
    const jd = sessionStorage.getItem('jobDescription');
    const folder = sessionStorage.getItem('folderId');

    if (!jd || !folder) {
      router.push('/');
      return;
    }

    setJobDescription(jd);
    setFolderId(folder);
  }, [router]);

  const startProcessing = async () => {
    if (!jobDescription || !folderId) return;

    setIsProcessing(true);
    setError('');
    setResults([]);

    try {
      const result = await screeningAPI.processResumes(
        jobDescription,
        folderId
      );

      if (result.success) {
        setResults(result.results);
        setProgress({
          current: result.totalProcessed || 0,
          total: result.totalProcessed || 0,
          fileName: 'Complete',
        });
      } else {
        setError(result.error || 'Processing failed');
      }
    } catch (err: any) {
      console.error('Processing error:', err);
      setError(err.response?.data?.error || err.message || 'An error occurred during processing');
    } finally {
      setIsProcessing(false);
    }
  };

  const sortedAndFilteredResults = () => {
    let filtered = results.filter((r) => r.matchScore >= filterScore);

    filtered.sort((a, b) => {
      if (sortBy === 'matchScore') {
        return sortOrder === 'desc'
          ? b.matchScore - a.matchScore
          : a.matchScore - b.matchScore;
      } else {
        return sortOrder === 'desc'
          ? b.candidateName.localeCompare(a.candidateName)
          : a.candidateName.localeCompare(b.candidateName);
      }
    });

    return filtered;
  };

  const toggleSort = (column: 'matchScore' | 'name') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  if (!jobDescription || !folderId) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Resume Screening
            </h1>
            <p className="text-xl text-gray-600">
              Step 3: Process resumes and view results
            </p>
          </div>

          {/* Processing Card */}
          {results.length === 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              {!isProcessing ? (
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Ready to Process
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Click the button below to start analyzing resumes with AI
                  </p>
                  <button
                    onClick={startProcessing}
                    className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Start Processing
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Processing Resumes
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Analyzing {progress.current} of {progress.total} resumes...
                  </p>
                  {progress.fileName && (
                    <p className="text-sm text-gray-500">Current: {progress.fileName}</p>
                  )}
                  <div className="mt-6 max-w-md mx-auto">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            progress.total > 0
                              ? (progress.current / progress.total) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Results Section */}
          {results.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Controls */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Results ({sortedAndFilteredResults().length} candidates)
                  </h2>
                </div>

                <div className="flex items-center gap-4">
                  {/* Filter */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Min Score:</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filterScore}
                      onChange={(e) => setFilterScore(Number(e.target.value))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {/* Export Buttons */}
                  <button
                    onClick={() => exportToCSV(results)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Export All CSV
                  </button>
                  <button
                    onClick={() => exportShortlisted(results, 70)}
                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Export Shortlisted
                  </button>
                </div>
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleSort('name')}
                      >
                        Candidate {sortBy === 'name' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th
                        className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleSort('matchScore')}
                      >
                        Match Score {sortBy === 'matchScore' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Key Skills Matched
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Summary
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedAndFilteredResults().map((result, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {result.candidateName}
                            </p>
                            <p className="text-sm text-gray-500">{result.fileName}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                result.matchScore >= 80
                                  ? 'bg-green-100 text-green-800'
                                  : result.matchScore >= 60
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {result.matchScore}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {result.keySkillsMatched.slice(0, 5).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded"
                              >
                                {skill}
                              </span>
                            ))}
                            {result.keySkillsMatched.length > 5 && (
                              <span className="px-2 py-1 text-gray-500 text-xs">
                                +{result.keySkillsMatched.length - 5} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {result.summary}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Actions */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900"
                >
                  Start New Search
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
