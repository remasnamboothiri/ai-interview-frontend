import { apiClient, handleApiError } from './api';

export interface InterviewScreenshot {
  id: number;
  interview: number;
  session?: number;
  screenshot_url: string;
  timestamp: string;
  screenshot_number: number;
  multiple_people_detected: boolean;
  face_count: number;
  confidence_score?: number;
  issue_type?: 'multiple_people' | 'no_face' | 'looking_away' | 'phone_detected';
  metadata: any;
  created_at: string;
  created_ip?: string;
}

export interface CreateScreenshotData {
  interview: number;
  session?: number;
  screenshot_url: string;
  screenshot_number: number;
  multiple_people_detected?: boolean;
  face_count?: number;
  confidence_score?: number;
  issue_type?: 'multiple_people' | 'no_face' | 'looking_away' | 'phone_detected';
  metadata?: any;
  created_ip?: string;
}

class InterviewScreenshotService {
  private baseUrl = '/api/interview-screenshots';

  async getScreenshots(params?: {
    interview?: number;
    session?: number;
    issue_type?: string;
    flagged?: boolean;
  }): Promise<{ results: InterviewScreenshot[]; count: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.interview) queryParams.append('interview', params.interview.toString());
      if (params?.session) queryParams.append('session', params.session.toString());
      if (params?.issue_type) queryParams.append('issue_type', params.issue_type);
      if (params?.flagged) queryParams.append('flagged', 'true');

      const url = queryParams.toString() ? `${this.baseUrl}/?${queryParams}` : `${this.baseUrl}/`;
      return await apiClient.get<{ results: InterviewScreenshot[]; count: number }>(url);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getScreenshot(id: number): Promise<InterviewScreenshot> {
    try {
      return await apiClient.get<InterviewScreenshot>(`${this.baseUrl}/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createScreenshot(data: CreateScreenshotData): Promise<InterviewScreenshot> {
    try {
      return await apiClient.post<InterviewScreenshot>(`${this.baseUrl}/`, data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteScreenshot(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getScreenshotsByInterview(interviewId: number): Promise<InterviewScreenshot[]> {
    try {
      return await apiClient.get<InterviewScreenshot[]>(`${this.baseUrl}/by_interview/?interview_id=${interviewId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getFlaggedScreenshots(): Promise<InterviewScreenshot[]> {
    try {
      return await apiClient.get<InterviewScreenshot[]>(`${this.baseUrl}/flagged/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async uploadScreenshot(file: File, interviewId: number, sessionId?: number): Promise<InterviewScreenshot> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('interview', interviewId.toString());
      if (sessionId) {
        formData.append('session', sessionId.toString());
      }

      return await apiClient.post<InterviewScreenshot>(`${this.baseUrl}/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async bulkDeleteScreenshots(screenshotIds: number[]): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/bulk_delete/`, {
        screenshot_ids: screenshotIds
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getScreenshotStats(interviewId: number): Promise<{
    total: number;
    flagged: number;
    multiple_people: number;
    no_face: number;
    looking_away: number;
    phone_detected: number;
  }> {
    try {
      return await apiClient.get(`${this.baseUrl}/stats/?interview_id=${interviewId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const interviewScreenshotService = new InterviewScreenshotService();