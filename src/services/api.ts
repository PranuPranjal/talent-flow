import type { Job, Candidate, Assessment, AssessmentResponse, PaginatedResponse } from '../types';

const API_BASE_URL = '/api';

// Generic API client
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return this.request<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

const apiClient = new ApiClient();

// Jobs API
export const jobsApi = {
  getJobs: (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    tags?: string[];
    sort?: string;
  }) => apiClient.get<PaginatedResponse<Job>>('/jobs', params),

  getJob: (id: string) => apiClient.get<Job>(`/jobs/${id}`),

  createJob: (data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => 
    apiClient.post<Job>('/jobs', data),

  updateJob: (id: string, data: Partial<Job>) => 
    apiClient.patch<Job>(`/jobs/${id}`, data),

  reorderJobs: (id: string, fromOrder: number, toOrder: number) => 
    apiClient.patch(`/jobs/${id}/reorder`, { fromOrder, toOrder }),

  deleteJob: (id: string) => apiClient.delete(`/jobs/${id}`),
};

// Candidates API
export const candidatesApi = {
  getCandidates: (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    stage?: string;
    jobId?: string;
    sort?: string;
  }) => apiClient.get<PaginatedResponse<Candidate>>('/candidates', params),

  getCandidate: (id: string) => apiClient.get<Candidate>(`/candidates/${id}`),

  getCandidateTimeline: (id: string) => 
    apiClient.get<any[]>(`/candidates/${id}/timeline`),

  createCandidate: (data: Omit<Candidate, 'id' | 'appliedAt' | 'updatedAt'>) => 
    apiClient.post<Candidate>('/candidates', data),

  updateCandidate: (id: string, data: Partial<Candidate>) => 
    apiClient.patch<Candidate>(`/candidates/${id}`, data),
};

// Assessments API
export const assessmentsApi = {
  getAssessments: (params?: {
    page?: number;
    pageSize?: number;
    jobId?: string;
    search?: string;
  }) => apiClient.get<PaginatedResponse<Assessment>>('/assessments', params),

  getAssessment: (jobId: string) => apiClient.get<Assessment>(`/assessments/${jobId}`),

  saveAssessment: (jobId: string, data: Omit<Assessment, 'id' | 'jobId' | 'createdAt' | 'updatedAt'>) => 
    apiClient.put<Assessment>(`/assessments/${jobId}`, data),

  submitAssessment: (jobId: string, data: Omit<AssessmentResponse, 'id' | 'assessmentId' | 'completedAt'>) => 
    apiClient.post<AssessmentResponse>(`/assessments/${jobId}/submit`, data),
};

export default apiClient;

