import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000/api';
import { API_BASE_URL } from '@/constants';
const API_URL = `${API_BASE_URL}/api`;


export interface CandidateEducation {
  id?: number;
  candidate: number;
  degree: string;
  institution: string;
  graduation_year: number;
  is_current: boolean;
  created_at?: string;
  updated_at?: string;
}

export const educationService = {
  // Get all education records for a candidate
  getEducationByCandidate: async (candidateId: number): Promise<CandidateEducation[]> => {
    try {
      const response = await axios.get(`${API_URL}/candidate-education/?candidate_id=${candidateId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching education:', error);
      throw error;
    }
  },

  // Create a new education record
  createEducation: async (data: Partial<CandidateEducation>): Promise<CandidateEducation> => {
    try {
      const response = await axios.post(`${API_URL}/candidate-education/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating education:', error);
      throw error;
    }
  },

  // Update education record
  updateEducation: async (id: number, data: Partial<CandidateEducation>): Promise<CandidateEducation> => {
    try {
      const response = await axios.put(`${API_URL}/candidate-education/${id}/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating education:', error);
      throw error;
    }
  },

  // Delete education record
  deleteEducation: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/candidate-education/${id}/`);
    } catch (error) {
      console.error('Error deleting education:', error);
      throw error;
    }
  },
};
