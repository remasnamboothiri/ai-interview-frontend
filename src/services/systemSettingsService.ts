import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000/api';
import { API_BASE_URL } from '@/constants';
const API_URL = `${API_BASE_URL}/api`;


export interface SystemSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  data_type: 'string' | 'integer' | 'boolean' | 'json';
  description?: string;
  is_public: boolean;
  updated_by?: number;
  updated_at: string;
  created_at: string;
  created_by?: number;
}

const systemSettingsService = {
  getAllSettings: async (): Promise<SystemSetting[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/system-settings/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  getSetting: async (id: number): Promise<SystemSetting> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/system-settings/${id}/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching setting:', error);
      throw error;
    }
  },

  createSetting: async (data: Partial<SystemSetting>): Promise<SystemSetting> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/system-settings/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating setting:', error);
      throw error;
    }
  },

  updateSetting: async (id: number, data: Partial<SystemSetting>): Promise<SystemSetting> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/system-settings/${id}/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  },

  deleteSetting: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/system-settings/${id}/`);
    } catch (error) {
      console.error('Error deleting setting:', error);
      throw error;
    }
  },
};

export default systemSettingsService;
