import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000/api';
import { API_BASE_URL } from '@/constants';
const API_URL = `${API_BASE_URL}/api`;


export interface ActivityLog {
  id: number;
  user?: number;
  action: string;
  resource_type?: string;
  resource_id?: number;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

const activityLogService = {
  getAllLogs: async (): Promise<ActivityLog[]> => {
    try {
      const response = await axios.get(`${API_URL}/activity-logs/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  },

  getUserLogs: async (userId: number): Promise<ActivityLog[]> => {
    try {
      const response = await axios.get(`${API_URL}/activity-logs/?user_id=${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user logs:', error);
      throw error;
    }
  },

  createLog: async (data: Partial<ActivityLog>): Promise<ActivityLog> => {
    try {
      const response = await axios.post(`${API_URL}/activity-logs/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating activity log:', error);
      throw error;
    }
  },
};

export default activityLogService;
