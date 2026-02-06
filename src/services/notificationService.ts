import axios from 'axios';

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

const isValidUserId = (userId: number | string): boolean => {
  // Check if userId is a mock ID (string containing 'mock')
  if (typeof userId === 'string' && (userId.includes('mock') || userId.includes('Mock'))) {
    return false;
  }
  // Check if it's a valid number
  if (typeof userId === 'number' && userId > 0) {
    return true;
  }
  // Check if string can be converted to valid number
  if (typeof userId === 'string') {
    const num = Number(userId);
    return !isNaN(num) && num > 0;
  }
  return false;
};

const notificationService = {
  getUserNotifications: async (userId: number | string): Promise<Notification[]> => {
    try {
      if (!isValidUserId(userId)) {
        return [];
      }

      const response = await axios.get(`${API_URL}/notifications/?user_id=${userId}`);
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  getNotification: async (id: number): Promise<Notification> => {
    try {
      const response = await axios.get(`${API_URL}/notifications/${id}/`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  },

  createNotification: async (data: Partial<Notification>): Promise<Notification> => {
    try {
      const response = await axios.post(`${API_URL}/notifications/`, data);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  markAsRead: async (id: number): Promise<Notification> => {
    try {
      const response = await axios.post(`${API_URL}/notifications/${id}/mark_as_read/`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  markAllAsRead: async (userId: number | string): Promise<void> => {
    try {
      if (!isValidUserId(userId)) {
        return;
      }

      await axios.post(`${API_URL}/notifications/mark_all_as_read/`, { user_id: userId });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  deleteNotification: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/notifications/${id}/`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  getUnreadCount: async (userId: number | string): Promise<number> => {
    try {
      if (!isValidUserId(userId)) {
        return 0;
      }

      const response = await axios.get(`${API_URL}/notifications/unread_count/?user_id=${userId}`);
      
      if (response.data && response.data.success && typeof response.data.unread_count === 'number') {
        return response.data.unread_count;
      } else if (response.data && typeof response.data.unread_count === 'number') {
        return response.data.unread_count;
      } else if (typeof response.data === 'number') {
        return response.data;
      } else {
        return 0;
      }
    } catch (error) {
      return 0;
    }
  },
};

export default notificationService;
