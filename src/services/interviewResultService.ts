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
  // Computed fields for frontend compatibility
  scores: Record<string, number>;
  passed: boolean;
  candidate_id: number;
  job_id: number;
  assessment_summary: string;
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

/**
 * Transform raw API response into frontend-friendly format
 * Adds computed fields: scores, passed, candidate_id, job_id, assessment_summary
 */
function transformResult(raw: any): InterviewResult {
  return {
    ...raw,
    // Build scores object from flat fields
    scores: {
      technical_depth: Number(raw.technical_score) || 0,
      problem_solving: Number(raw.behavioral_score) || 0,
      communication: Number(raw.communication_score) || 0,
      experience: Number(raw.technical_depth) || Number(raw.technical_score) || 0,
      culture_fit: Number(raw.cultural_fit_score) || 0,
    },
    // Passed = recommendation is hire or second_round
    passed: raw.recommendation === 'hire' || raw.recommendation === 'second_round',
    // Extract candidate/job IDs from interview detail or interview ID
    candidate_id: raw.interview_detail?.candidate || raw.interview_detail?.candidate_id || null,
    job_id: raw.interview_detail?.job || raw.interview_detail?.job_id || null,
    // Assessment summary from ai_feedback
    assessment_summary:
      raw.ai_feedback?.summary ||
      raw.ai_feedback?.hiring_justification ||
      `Overall score: ${raw.overall_score}/10. Recommendation: ${raw.recommendation}.`,
    // Ensure arrays exist
    strengths: raw.strengths || [],
    weaknesses: raw.weaknesses || [],
    red_flags: raw.red_flags || [],
    questions_asked: raw.questions_asked || [],
    overall_score: Number(raw.overall_score) || 0,
    technical_score: Number(raw.technical_score) || 0,
    communication_score: Number(raw.communication_score) || 0,
    cultural_fit_score: Number(raw.cultural_fit_score) || 0,
    behavioral_score: Number(raw.behavioral_score) || 0,
  };
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
      const response = await apiClient.get<any>(url);

      // Handle both array and paginated response
      const rawResults = Array.isArray(response) ? response : (response.results || []);
      const results = rawResults.map(transformResult);

      return {
        results,
        count: Array.isArray(response) ? response.length : (response.count || results.length),
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getResult(id: number): Promise<InterviewResult> {
    try {
      const raw = await apiClient.get<any>(`${this.baseUrl}/${id}/`);
      return transformResult(raw);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createResult(data: CreateInterviewResultData): Promise<InterviewResult> {
    try {
      const raw = await apiClient.post<any>(`${this.baseUrl}/`, data);
      return transformResult(raw);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateResult(id: number, data: UpdateInterviewResultData): Promise<InterviewResult> {
    try {
      const raw = await apiClient.patch<any>(`${this.baseUrl}/${id}/`, data);
      return transformResult(raw);
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
      const raw = await apiClient.post<any>(`${this.baseUrl}/${id}/mark_reviewed/`);
      return transformResult(raw);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getResultByInterview(interviewId: number): Promise<InterviewResult> {
    try {
      const raw = await apiClient.get<any>(`${this.baseUrl}/by_interview/?interview_id=${interviewId}`);
      return transformResult(raw);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Legacy method for backward compatibility
  // async getAllResults(): Promise<InterviewResult[]> {
  //   try {
  //     const response = await this.getResults();
  //     return response.results || [];
  //   } catch (error) {
  //     console.error('Error fetching interview results:', error);
  //     return [];
  //   }
  // }

  async getAllResults(): Promise<InterviewResult[]> {
    try {
      // ✅ FIX: Use direct API call instead of getResults() to avoid transformation issues
      const response = await apiClient.get<any>(`${this.baseUrl}/`);
    
      // Handle both array and paginated response
      const rawResults = Array.isArray(response) ? response : (response.results || []);
    
      // ✅ FIX: Transform each result safely, skip if transformation fails
      const results: InterviewResult[] = [];
      for (const raw of rawResults) {
        try {
          const transformed = transformResult(raw);
          results.push(transformed);
        } catch (error) {
          console.warn('Failed to transform result:', raw.id, error);
          // Skip this result instead of failing completely
        }
      }
    
      return results;
    } catch (error) {
      console.error('Error fetching interview results:', error);
      return [];
    }
  }

}

export const interviewResultService = new InterviewResultService();
export default interviewResultService;





