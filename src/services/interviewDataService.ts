import { apiClient, handleApiError } from './api';

export interface InterviewSession {
  id: number;
  interview: number;
  session_number: number;
  session_uuid: string;
  url_opened_at?: string;
  started_at?: string;
  ended_at?: string;
  actual_duration_minutes?: number;
  status: 'waiting' | 'active' | 'paused' | 'completed' | 'abandoned';
  candidate_ip?: string;
  candidate_location?: string;
  device_info?: string;
  is_primary_session: boolean;
  network_interruptions: number;
  questions_answered: number;
  last_activity_at?: string;
  completion_percentage: number;
  session_quality_score?: number;
  audio_quality?: number;
  video_quality?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionData {
  interview: number;
  session_number: number;
  candidate_ip?: string;
  device_info?: string;
  candidate_location?: string;
}

export interface UpdateSessionData {
  url_opened_at?: string;
  started_at?: string;
  ended_at?: string;
  actual_duration_minutes?: number;
  status?: 'waiting' | 'active' | 'paused' | 'completed' | 'abandoned';
  network_interruptions?: number;
  questions_answered?: number;
  last_activity_at?: string;
  completion_percentage?: number;
  session_quality_score?: number;
  audio_quality?: number;
  video_quality?: number;
  is_primary_session?: boolean;
}

class InterviewDataService {
  private baseUrl = '/api/interview-data';

  async getSessions(params?: {
    interview?: number;
    status?: string;
  }): Promise<{ results: InterviewSession[]; count: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.interview) queryParams.append('interview', params.interview.toString());
      if (params?.status) queryParams.append('status', params.status);

      const url = queryParams.toString() ? `${this.baseUrl}/?${queryParams}` : `${this.baseUrl}/`;
      return await apiClient.get<{ results: InterviewSession[]; count: number }>(url);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getSession(id: number): Promise<InterviewSession> {
    try {
      return await apiClient.get<InterviewSession>(`${this.baseUrl}/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createSession(data: CreateSessionData): Promise<InterviewSession> {
    try {
      return await apiClient.post<InterviewSession>(`${this.baseUrl}/`, data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateSession(id: number, data: UpdateSessionData): Promise<InterviewSession> {
    try {
      return await apiClient.patch<InterviewSession>(`${this.baseUrl}/${id}/`, data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async startSession(id: number): Promise<InterviewSession> {
    try {
      return await apiClient.post<InterviewSession>(`${this.baseUrl}/${id}/start_session/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async endSession(id: number): Promise<InterviewSession> {
    try {
      return await apiClient.post<InterviewSession>(`${this.baseUrl}/${id}/end_session/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateActivity(id: number): Promise<InterviewSession> {
    try {
      return await apiClient.post<InterviewSession>(`${this.baseUrl}/${id}/update_activity/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getSessionsByInterview(interviewId: number): Promise<InterviewSession[]> {
    try {
      return await apiClient.get<InterviewSession[]>(`${this.baseUrl}/by_interview/?interview_id=${interviewId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const interviewDataService = new InterviewDataService();
