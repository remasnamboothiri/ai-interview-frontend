import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000/api';
import { API_BASE_URL } from '@/constants';
const API_URL = `${API_BASE_URL}/api`;


export interface Notification {
  id: number;
  user: number;
  notification_type: string;
  title: string;
  message: string;
  related_resource_type?: string;
  related_resource_id?: number;
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  expires_at?: string;
}

const notificationService = {
  getUserNotifications: async (userId: number): Promise<Notification[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/?user_id=${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  getNotification: async (id: number): Promise<Notification> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/${id}/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  },

  createNotification: async (data: Partial<Notification>): Promise<Notification> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/notifications/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  markAsRead: async (id: number): Promise<Notification> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/notifications/${id}/mark_as_read/`);
      return response.data.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  markAllAsRead: async (userId: number): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/notifications/mark_all_as_read/`, { user_id: userId });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  deleteNotification: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/notifications/${id}/`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
};

export default notificationService;
