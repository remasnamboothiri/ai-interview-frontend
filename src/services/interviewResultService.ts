import { apiClient, handleApiError } from './api';

export interface InterviewResult {
  id: number;
  interview: number;
  interview_detail?: any;
  primary_session?: number;
  primary_session_detail?: any;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  cultural_fit_score: number;
  behavioral_score?: number;
  questions_asked: any[];
  response_times: any[];
  behavioral_analysis: any;
  skill_assessment: any;
  strengths: string[];
  weaknesses: string[];
  red_flags: string[];
  recommendation: 'hire' | 'reject' | 'maybe' | 'second_round';
  transcript: string;
  recording_url?: string;
  ai_feedback: any;
  recruiter_feedback: string;
  interview_quality?: number;
  technical_depth?: number;
  result_document?: number;
  result_generated_at: string;
  result_reviewed_at?: string;
  result_reviewed_by?: number;
  created_at: string;
  created_by?: number;
  updated_at: string;
  updated_by?: number;
}

export interface CreateInterviewResultData {
  interview: number;
  primary_session?: number;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  cultural_fit_score: number;
  behavioral_score?: number;
  questions_asked?: any[];
  response_times?: any[];
  behavioral_analysis?: any;
  skill_assessment?: any;
  strengths?: string[];
  weaknesses?: string[];
  red_flags?: string[];
  recommendation: 'hire' | 'reject' | 'maybe' | 'second_round';
  transcript?: string;
  recording_url?: string;
  ai_feedback?: any;
  recruiter_feedback?: string;
  interview_quality?: number;
  technical_depth?: number;
  result_document?: number;
}

export interface UpdateInterviewResultData {
  primary_session?: number;
  overall_score?: number;
  technical_score?: number;
  communication_score?: number;
  cultural_fit_score?: number;
  behavioral_score?: number;
  questions_asked?: any[];
  response_times?: any[];
  behavioral_analysis?: any;
  skill_assessment?: any;
  strengths?: string[];
  weaknesses?: string[];
  red_flags?: string[];
  recommendation?: 'hire' | 'reject' | 'maybe' | 'second_round';
  transcript?: string;
  recording_url?: string;
  ai_feedback?: any;
  recruiter_feedback?: string;
  interview_quality?: number;
  technical_depth?: number;
  result_document?: number;
  result_reviewed_at?: string;
  result_reviewed_by?: number;
}

class InterviewResultService {
  private baseUrl = '/api/interview-results';

  async getResults(params?: {
    interview?: number;
    recommendation?: string;
  }): Promise<{ results: InterviewResult[]; count: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.interview) queryParams.append('interview', params.interview.toString());
      if (params?.recommendation) queryParams.append('recommendation', params.recommendation);

      const url = queryParams.toString() ? `${this.baseUrl}/?${queryParams}` : `${this.baseUrl}/`;
      return await apiClient.get<{ results: InterviewResult[]; count: number }>(url);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getResult(id: number): Promise<InterviewResult> {
    try {
      return await apiClient.get<InterviewResult>(`${this.baseUrl}/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createResult(data: CreateInterviewResultData): Promise<InterviewResult> {
    try {
      return await apiClient.post<InterviewResult>(`${this.baseUrl}/`, data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateResult(id: number, data: UpdateInterviewResultData): Promise<InterviewResult> {
    try {
      return await apiClient.patch<InterviewResult>(`${this.baseUrl}/${id}/`, data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteResult(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async markReviewed(id: number): Promise<InterviewResult> {
    try {
      return await apiClient.post<InterviewResult>(`${this.baseUrl}/${id}/mark_reviewed/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getResultByInterview(interviewId: number): Promise<InterviewResult> {
    try {
      return await apiClient.get<InterviewResult>(`${this.baseUrl}/by_interview/?interview_id=${interviewId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Legacy methods for backward compatibility
  async getAllResults(): Promise<InterviewResult[]> {
    try {
      const response = await this.getResults();
      return response.results || [];
    } catch (error) {
      console.error('Error fetching interview results:', error);
      return [];
    }
  }
}

export const interviewResultService = new InterviewResultService();
export default interviewResultService;