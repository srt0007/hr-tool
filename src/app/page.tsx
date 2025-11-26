'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const environment = process.env.NEXT_PUBLIC_ENV || 'local';

  const handleContinue = () => {
    if (jobDescription.trim()) {
      // Store job description in sessionStorage
      sessionStorage.setItem('jobDescription', jobDescription);
      // Navigate to folder selection page
      router.push('/select-folder');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const text = await file.text();
      setJobDescription(text);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ATS Resume Screening Tool
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            AI-powered resume analysis for efficient hiring
          </p>
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              environment === 'production'
                ? 'bg-green-500'
                : environment === 'staging'
                ? 'bg-yellow-500'
                : 'bg-blue-500'
            } text-white`}
          >
            {environment.toUpperCase()}
          </span>
        </div>

        {/* Job Description Input */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Step 1: Enter Job Description
            </h2>
            <p className="text-gray-600">
              Paste the job description or upload a text file
            </p>
          </div>

          <div className="space-y-6">
            {/* Textarea */}
            <div>
              <label
                htmlFor="jobDescription"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Job Description
              </label>
              <textarea
                id="jobDescription"
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Enter the complete job description including required skills, qualifications, and responsibilities..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* File Upload */}
            <div className="flex items-center justify-center">
              <label className="cursor-pointer">
                <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload Job Description (TXT)
                </span>
                <input
                  type="file"
                  accept=".txt"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                />
              </label>
            </div>

            {/* Character Count */}
            <div className="text-sm text-gray-500 text-right">
              {jobDescription.length} characters
            </div>

            {/* Continue Button */}
            <div className="flex justify-end">
              <button
                onClick={handleContinue}
                disabled={!jobDescription.trim() || isLoading}
                className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue to Folder Selection
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-indigo-600 mb-3">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
            <p className="text-sm text-gray-600">
              Using Claude AI to analyze and rank resumes against job requirements
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-indigo-600 mb-3">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Google Drive Integration
            </h3>
            <p className="text-sm text-gray-600">
              Access resumes directly from your Google Drive folders
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-indigo-600 mb-3">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Export Results</h3>
            <p className="text-sm text-gray-600">
              Download screening results and shortlisted candidates as CSV
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
