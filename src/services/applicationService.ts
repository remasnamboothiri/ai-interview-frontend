import { apiClient, handleApiError } from './api';

export interface JobApplication {
  id: number;
  job: number;
  candidate: number;
  applied_at: string;
  application_status: 'pending' | 'screening' | 'interviewing' | 'rejected' | 'hired';
  created_by: number;
  created_at: string;
  updated_by?: number;
  updated_at: string;
  job_title?: string;
  candidate_name?: string;
  candidate_email?: string;
  company_name?: string;
  created_by_name?: string;
}

export interface JobApplicationDetail extends JobApplication {
  job: {
    id: number;
    title: string;
    description?: string;
    company: {
      id: number;
      name: string;
    };
  };
  candidate: {
    id: number;
    user: {
      id: number;
      full_name: string;
      email: string;
      phone?: string;
    };
    resume_url?: string;
    skills?: string[];
  };
  created_by_detail?: {
    id: number;
    full_name: string;
    email: string;
  };
}

export interface CreateJobApplicationData {
  job: number;
  candidate: number;
  application_status?: 'pending' | 'screening' | 'interviewing' | 'rejected' | 'hired';
}

export interface UpdateJobApplicationData {
  application_status: 'pending' | 'screening' | 'interviewing' | 'rejected' | 'hired';
}

export interface ApplicationStats {
  total: number;
  pending: number;
  screening: number;
  interviewing: number;
  rejected: number;
  hired: number;
}

class ApplicationService {
  private baseUrl = '/api/applications';

  async getApplications(params?: {
    search?: string;
    ordering?: string;
    job_id?: number;
    candidate_id?: number;
    application_status?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ results: JobApplication[]; count: number; next?: string; previous?: string }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.job_id) queryParams.append('job', params.job_id.toString());
      if (params?.candidate_id) queryParams.append('candidate', params.candidate_id.toString());
      if (params?.application_status) queryParams.append('application_status', params.application_status);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

      const url = queryParams.toString() ? `${this.baseUrl}/?${queryParams}` : `${this.baseUrl}/`;
      return await apiClient.get<{ results: JobApplication[]; count: number; next?: string; previous?: string }>(url);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getApplication(id: number): Promise<JobApplicationDetail> {
    try {
      return await apiClient.get<JobApplicationDetail>(`${this.baseUrl}/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createApplication(data: CreateJobApplicationData): Promise<JobApplication> {
    try {
      return await apiClient.post<JobApplication>(`${this.baseUrl}/`, data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateApplication(id: number, data: UpdateJobApplicationData): Promise<JobApplication> {
    try {
      return await apiClient.patch<JobApplication>(`${this.baseUrl}/${id}/`, data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteApplication(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getApplicationsByJob(jobId: number): Promise<JobApplication[]> {
    try {
      return await apiClient.get<JobApplication[]>(`${this.baseUrl}/by_job/?job_id=${jobId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getApplicationsByCandidate(candidateId: number): Promise<JobApplication[]> {
    try {
      return await apiClient.get<JobApplication[]>(`${this.baseUrl}/by_candidate/?candidate_id=${candidateId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateApplicationStatus(id: number, status: JobApplication['application_status']): Promise<JobApplication> {
    try {
      return await apiClient.patch<JobApplication>(`${this.baseUrl}/${id}/update_status/`, {
        application_status: status
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getApplicationStats(): Promise<ApplicationStats> {
    try {
      return await apiClient.get<ApplicationStats>(`${this.baseUrl}/stats/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async bulkUpdateStatus(applicationIds: number[], status: JobApplication['application_status']): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/bulk_update_status/`, {
        application_ids: applicationIds,
        application_status: status
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async exportApplications(params?: {
    format?: 'csv' | 'xlsx';
    application_status?: string;
    job_id?: number;
  }): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.format) queryParams.append('format', params.format);
      if (params?.application_status) queryParams.append('application_status', params.application_status);
      if (params?.job_id) queryParams.append('job_id', params.job_id.toString());

      const url = queryParams.toString() ? `${this.baseUrl}/export/?${queryParams}` : `${this.baseUrl}/export/`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      return await response.blob();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const applicationService = new ApplicationService();