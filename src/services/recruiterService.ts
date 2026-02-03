import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000/api';
import { API_BASE_URL } from '@/constants';
const API_URL = `${API_BASE_URL}/api`;


export interface Recruiter {
  id: number;
  user_id: number;
  company_id: number;
  role?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
  created_ip?: string;
  updated_ip?: string;
  // Populated fields from joins
  user?: {
    id: number;
    email: string;
    full_name: string;
    phone?: string;
    is_active: boolean;
  };
  company?: {
    id: number;
    name: string;
  };
}

const recruiterService = {
  // Get all recruiters
  getAllRecruiters: async (): Promise<Recruiter[]> => {
    try {
      const response = await axios.get(`${API_URL}/recruiters/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching recruiters:', error);
      throw error;
    }
  },

  // Get single recruiter
  getRecruiter: async (id: number): Promise<Recruiter> => {
    try {
      const response = await axios.get(`${API_URL}/recruiters/${id}/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching recruiter:', error);
      throw error;
    }
  },

  // Get recruiters by company
  getCompanyRecruiters: async (companyId: number): Promise<Recruiter[]> => {
    try {
      const response = await axios.get(`${API_URL}/recruiters/company/${companyId}/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching company recruiters:', error);
      throw error;
    }
  },

  // Create recruiter (link user to company)
  createRecruiter: async (data: Partial<Recruiter>): Promise<Recruiter> => {
    try {
      const response = await axios.post(`${API_URL}/recruiters/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating recruiter:', error);
      throw error;
    }
  },

  // Update recruiter
  updateRecruiter: async (id: number, data: Partial<Recruiter>): Promise<Recruiter> => {
    try {
      const response = await axios.put(`${API_URL}/recruiters/${id}/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating recruiter:', error);
      throw error;
    }
  },

  // Delete recruiter
  deleteRecruiter: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/recruiters/${id}/`);
    } catch (error) {
      console.error('Error deleting recruiter:', error);
      throw error;
    }
  },
};

export { recruiterService };
