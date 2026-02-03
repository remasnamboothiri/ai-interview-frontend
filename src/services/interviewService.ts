import { apiClient, handleApiError } from './api';

export interface Interview {
  id: number;
  uuid: string;
  job: number;
  candidate: number;
  recruiter: number;
  agent?: number;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  interview_type: 'ai_only' | 'human_only' | 'hybrid';
  meeting_link?: string;
  instructions?: string;
  email_sent: boolean;
  email_sent_at?: string;
  candidate_notified: boolean;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by?: number;
  cancelled_at?: string;
  cancelled_by?: number;
  cancellation_reason?: string;
  // Display fields
  job_title?: string;
  candidate_name?: string;
  candidate_email?: string;
  agent_name?: string;
  recruiter_name?: string;
  company_name?: string;
}

export interface InterviewDetail {
  id: number;
  uuid: string;
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
  recruiter: {
    id: number;
    full_name: string;
    email: string;
  };
  agent?: {
    id: number;
    name: string;
  };
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  interview_type: 'ai_only' | 'human_only' | 'hybrid';
  meeting_link?: string;
  instructions?: string;
  email_sent: boolean;
  email_sent_at?: string;
  candidate_notified: boolean;
  created_at: string;
  created_by: {
    id: number;
    full_name: string;
    email: string;
  };
  updated_at: string;
  updated_by?: {
    id: number;
    full_name: string;
    email: string;
  };
  cancelled_at?: string;
  cancelled_by?: {
    id: number;
    full_name: string;
    email: string;
  };
  cancellation_reason?: string;
}


export interface CreateInterviewData {
  job: number;
  candidate: number;
  agent?: number;
  scheduled_at: string;
  duration_minutes: number;
  interview_type?: 'ai_only' | 'human_only' | 'hybrid';
  meeting_link?: string;
  instructions?: string;
}

export interface UpdateInterviewData {
  scheduled_at?: string;
  duration_minutes?: number;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  interview_type?: 'ai_only' | 'human_only' | 'hybrid';
  meeting_link?: string;
  instructions?: string;
  cancellation_reason?: string;
}

class InterviewService {
  private baseUrl = '/api/interviews';

  async getInterviews(params?: {
    search?: string;
    ordering?: string;
    status?: string;
    job?: number;
    candidate?: number;
  }): Promise<{ results: Interview[]; count: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.job) queryParams.append('job', params.job.toString());
      if (params?.candidate) queryParams.append('candidate', params.candidate.toString());

      const url = queryParams.toString() ? `${this.baseUrl}/?${queryParams}` : `${this.baseUrl}/`;
      return await apiClient.get<{ results: Interview[]; count: number }>(url);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getInterview(id: number): Promise<InterviewDetail> {
    try {
      return await apiClient.get<InterviewDetail>(`${this.baseUrl}/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createInterview(data: CreateInterviewData): Promise<Interview> {
    try {
      return await apiClient.post<Interview>(`${this.baseUrl}/`, data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateInterview(id: number, data: UpdateInterviewData): Promise<Interview> {
    try {
      return await apiClient.patch<Interview>(`${this.baseUrl}/${id}/`, data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteInterview(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async cancelInterview(id: number, reason?: string): Promise<Interview> {
    try {
      return await apiClient.post<Interview>(`${this.baseUrl}/${id}/cancel/`, {
        cancellation_reason: reason
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async rescheduleInterview(id: number, newTime: string): Promise<Interview> {
    try {
      return await apiClient.post<Interview>(`${this.baseUrl}/${id}/reschedule/`, {
        scheduled_at: newTime
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getUpcomingInterviews(): Promise<Interview[]> {
    try {
      return await apiClient.get<Interview[]>(`${this.baseUrl}/upcoming/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getInterviewsByJob(jobId: number): Promise<Interview[]> {
    try {
      return await apiClient.get<Interview[]>(`${this.baseUrl}/by_job/?job_id=${jobId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getInterviewsByCandidate(candidateId: number): Promise<Interview[]> {
    try {
      return await apiClient.get<Interview[]>(`${this.baseUrl}/by_candidate/?candidate_id=${candidateId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const interviewService = new InterviewService();