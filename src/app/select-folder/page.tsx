'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, driveAPI, Folder } from '@/lib/api';

export default function SelectFolder() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.checkAuthStatus();
      if (response.authenticated) {
        setIsAuthenticated(true);
        loadFolders();
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const response = await authAPI.getGoogleAuthUrl();
      if (response.authUrl) {
        // Redirect to Google OAuth
        window.location.href = response.authUrl;
      }
    } catch (err) {
      setError('Failed to initiate Google authentication');
    }
  };

  const loadFolders = async () => {
    try {
      setIsLoading(true);
      const response = await driveAPI.listFolders();
      setFolders(response.folders || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load folders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadFolders();
      return;
    }

    try {
      setIsLoading(true);
      const response = await driveAPI.searchFolders(searchQuery);
      setFolders(response.folders || []);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedFolder) {
      sessionStorage.setItem('folderId', selectedFolder);
      router.push('/process');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-indigo-600"
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Google Drive
          </h2>
          <p className="text-gray-600 mb-6">
            To access your resume folders, please connect your Google Drive account.
          </p>
          <button
            onClick={handleGoogleAuth}
            className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Connect Google Drive
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full mt-4 px-6 py-3 text-gray-700 font-medium hover:text-gray-900"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Select Resume Folder
            </h1>
            <p className="text-xl text-gray-600">
              Step 2: Choose the Google Drive folder containing resumes
            </p>
          </div>

          {/* Search and Folder List */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Search */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search folders..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Folder List */}
            <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
              {folders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No folders found. Try searching or create a folder in Google Drive.
                </p>
              ) : (
                folders.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedFolder === folder.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg
                        className="w-6 h-6 text-gray-400 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{folder.name}</p>
                        {folder.modifiedTime && (
                          <p className="text-sm text-gray-500">
                            Modified: {new Date(folder.modifiedTime).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {selectedFolder === folder.id && (
                        <svg
                          className="w-6 h-6 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900"
              >
                Back
              </button>
              <button
                onClick={handleContinue}
                disabled={!selectedFolder}
                className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Start Processing
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
