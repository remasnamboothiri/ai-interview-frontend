import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000/api';
import { API_BASE_URL } from '@/constants';
const API_URL = `${API_BASE_URL}/api`;


export interface Candidate {
  id: number;
  user_id: number;
  full_name?: string;
  email?: string;
  phone?: string;
  experience_years?: number;
  current_company?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  skills?: string[];
  general_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const candidateService = {
  getAllCandidates: async (): Promise<Candidate[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/candidates/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  },

  getCandidate: async (id: string): Promise<Candidate> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/candidates/${id}/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching candidate:', error);
      throw error;
    }
  },

  createCandidate: async (data: Partial<Candidate>): Promise<Candidate> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/candidates/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating candidate:', error);
      throw error;
    }
  },

  updateCandidate: async (id: string, data: Partial<Candidate>): Promise<Candidate> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/candidates/${id}/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating candidate:', error);
      throw error;
    }
  },

  deleteCandidate: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/candidates/${id}/`);
    } catch (error) {
      console.error('Error deleting candidate:', error);
      throw error;
    }
  },
};
