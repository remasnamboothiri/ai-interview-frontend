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
    };
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

class ApplicationService {
  private baseUrl = '/api/applications';

  async getApplications(params?: {
    search?: string;
    ordering?: string;
    job_id?: number;
    candidate_id?: number;
    application_status?: string;
  }): Promise<{ results: JobApplication[]; count: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.job_id) queryParams.append('job', params.job_id.toString());
      if (params?.candidate_id) queryParams.append('candidate', params.candidate_id.toString());
      if (params?.application_status) queryParams.append('application_status', params.application_status);

      const url = queryParams.toString() ? `${this.baseUrl}/?${queryParams}` : `${this.baseUrl}/`;
      return await apiClient.get<{ results: JobApplication[]; count: number }>(url);
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
}

export const applicationService = new ApplicationService();