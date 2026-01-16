// This is what you NEED (real API calls)

import axios from 'axios';

// Backend API URL
const API_BASE_URL = 'http://localhost:8000/api';

export interface Company {
  id: number;
  name: string;
  industry?: string;
  size?: string;
  status: 'active' | 'inactive' | 'pending';
  website?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  stats?: {
    recruiters: number;
    jobs_active: number;
    jobs_total: number;
    candidates: number;
    interviews_conducted: number;
  };
  subscription_plan?: string;
}

export const adminService = {
  // Get all companies from backend
  getAllCompanies: async (): Promise<Company[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/companies/`);
      return response.data.data; // Backend returns { success: true, data: [...] }
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  // Get single company
  getCompany: async (id: number): Promise<Company> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/companies/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw error;
    }
  },

  // Create new company
  createCompany: async (data: Partial<Company>): Promise<Company> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/companies/`, data);
      return response.data.data; // Backend returns { success: true, data: {...} }
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  // Update company
  updateCompany: async (id: number, data: Partial<Company>): Promise<Company> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/companies/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  },

  // Delete company
  deleteCompany: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/companies/${id}/`);
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  },

  // Get company stats (mock for now, implement later)
  getCompanyStats: async (id: number) => {
    return { recruiterCount: 0 }; // Will implement when User model is ready
  }
};

