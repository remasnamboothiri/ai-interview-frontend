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
  getAllResults: async (): Promise<InterviewResult[]> => {
    try {
      const response = await axios.get(`${API_URL}/interview-results/`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching interview results:', error);
      return [];
    }
  },

  getResult: async (id: number): Promise<InterviewResult | null> => {
    try {
      const response = await axios.get(`${API_URL}/interview-results/${id}/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching interview result:', error);
      return null;
    }
  },

  createResult: async (data: Partial<InterviewResult>): Promise<InterviewResult | null> => {
    try {
      const response = await axios.post(`${API_URL}/interview-results/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating interview result:', error);
      return null;
    }
  },

  updateResult: async (id: number, data: Partial<InterviewResult>): Promise<InterviewResult | null> => {
    try {
      const response = await axios.put(`${API_URL}/interview-results/${id}/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating interview result:', error);
      return null;
    }
  },

  deleteResult: async (id: number): Promise<boolean> => {
    try {
      await axios.delete(`${API_URL}/interview-results/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting interview result:', error);
      return false;
    }
  },
};

export default interviewResultService;
