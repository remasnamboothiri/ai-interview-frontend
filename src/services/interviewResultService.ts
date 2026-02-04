import axios from 'axios';
import { API_BASE_URL } from '@/constants';

const API_URL = `${API_BASE_URL}/api`;

export interface InterviewResult {
  id: number;
  interview_id: number;
  candidate_id: number;
  job_id: number;
  transcript: string;
  scores: Record<string, number>;
  assessment_summary: string;
  strengths: string[];
  weaknesses: string[];
  overall_score: number;
  passed: boolean;
  created_at: string;
}

const interviewResultService = {
  // Get all interview results
  getAllResults: async (): Promise<InterviewResult[]> => {
    try {
      const response = await axios.get(`${API_URL}/interview-results/`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching interview results:', error);
      throw error;
    }
  },

  // Get single interview result
  getResult: async (id: number): Promise<InterviewResult> => {
    try {
      const response = await axios.get(`${API_URL}/interview-results/${id}/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching interview result:', error);
      throw error;
    }
  },

  // Create new interview result
  createResult: async (data: Partial<InterviewResult>): Promise<InterviewResult> => {
    try {
      const response = await axios.post(`${API_URL}/interview-results/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating interview result:', error);
      throw error;
    }
  },

  // Update interview result
  updateResult: async (id: number, data: Partial<InterviewResult>): Promise<InterviewResult> => {
    try {
      const response = await axios.put(`${API_URL}/interview-results/${id}/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating interview result:', error);
      throw error;
    }
  },

  // Delete interview result
  deleteResult: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/interview-results/${id}/`);
    } catch (error) {
      console.error('Error deleting interview result:', error);
      throw error;
    }
  },
};

export default interviewResultService;
