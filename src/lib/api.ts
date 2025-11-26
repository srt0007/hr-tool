import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add session ID to requests if available
api.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) {
    config.headers['x-session-id'] = sessionId;
  }
  return config;
});

export interface AuthResponse {
  success: boolean;
  authUrl?: string;
  authenticated?: boolean;
  error?: string;
}

export interface Folder {
  id: string;
  name: string;
  modifiedTime?: string;
}

export interface FolderDetailsResponse {
  success: boolean;
  folder: {
    id: string;
    name: string;
    fileCount: number;
  };
  files: Array<{
    id: string;
    name: string;
    size: number;
    modifiedTime: string;
  }>;
  error?: string;
}

export interface ResumeAnalysis {
  id: string;
  candidateName: string;
  fileName: string;
  matchScore: number;
  keySkillsMatched: string[];
  missingSkills: string[];
  summary: string;
  error?: boolean;
  fileSize?: number;
  modifiedTime?: string;
}

export interface ScreeningResult {
  success: boolean;
  results: ResumeAnalysis[];
  totalProcessed: number;
  totalErrors: number;
  error?: string;
}

// Auth APIs
export const authAPI = {
  getGoogleAuthUrl: async (): Promise<AuthResponse> => {
    const response = await api.get('/auth/google/url');
    return response.data;
  },

  checkAuthStatus: async (): Promise<AuthResponse> => {
    const response = await api.get('/auth/status');
    return response.data;
  },

  logout: async (): Promise<{ success: boolean }> => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('sessionId');
    return response.data;
  },
};

// Drive APIs
export const driveAPI = {
  listFolders: async (): Promise<{ success: boolean; folders: Folder[] }> => {
    const response = await api.get('/api/drive/folders');
    return response.data;
  },

  searchFolders: async (
    query: string
  ): Promise<{ success: boolean; folders: Folder[] }> => {
    const response = await api.get('/api/drive/folders/search', {
      params: { query },
    });
    return response.data;
  },

  getFolderDetails: async (folderId: string): Promise<FolderDetailsResponse> => {
    const response = await api.get(`/api/drive/folders/${folderId}`);
    return response.data;
  },
};

// Screening APIs
export const screeningAPI = {
  processResumes: async (
    jobDescription: string,
    folderId: string,
    onProgress?: (progress: any) => void
  ): Promise<ScreeningResult> => {
    if (onProgress) {
      // Use Server-Sent Events for progress updates
      return new Promise((resolve, reject) => {
        const sessionId = localStorage.getItem('sessionId');
        const eventSource = new EventSource(
          `${API_URL}/api/screening/process?jobDescription=${encodeURIComponent(
            jobDescription
          )}&folderId=${encodeURIComponent(folderId)}&sessionId=${sessionId}`
        );

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.type === 'complete') {
            eventSource.close();
            resolve(data);
          } else if (data.type === 'error') {
            eventSource.close();
            reject(new Error(data.error));
          } else {
            onProgress(data);
          }
        };

        eventSource.onerror = (error) => {
          eventSource.close();
          reject(error);
        };
      });
    } else {
      // Regular POST request without SSE
      const response = await api.post('/api/screening/process', {
        jobDescription,
        folderId,
      });
      return response.data;
    }
  },

  analyzeSingleResume: async (
    jobDescription: string,
    file: File
  ): Promise<{ success: boolean; result: ResumeAnalysis }> => {
    const formData = new FormData();
    formData.append('jobDescription', jobDescription);
    formData.append('resume', file);

    const response = await api.post('/api/screening/analyze-single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;
