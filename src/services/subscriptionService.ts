import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000/api';
import { API_BASE_URL } from '@/constants';
const API_URL = `${API_BASE_URL}/api`;


export interface Subscription {
  id: number;
  company_id: number;
  plan_name: 'free' | 'basic' | 'pro' | 'enterprise';
  plan_price: number;
  billing_cycle: 'monthly' | 'yearly';
  max_recruiters: number;
  max_jobs: number;
  max_interviews_per_month: number;
  max_storage_gb: number;
  features: {
    ai_interviews: boolean;
    video_recording: boolean;
    analytics: boolean;
  };
  status: 'active' | 'trial' | 'expired' | 'cancelled' | 'suspended';
  trial_ends_at?: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  payment_method?: string;
  last_payment_date?: string;
  next_payment_date?: string;
  payment_status: 'paid' | 'pending' | 'failed' | 'overdue';
  created_at: string;
  updated_at: string;
}

const subscriptionService = {
  // Get all subscriptions
  getAllSubscriptions: async (): Promise<Subscription[]> => {
    try {
      const response = await axios.get(`${API_URL}/subscriptions/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  },

  // Get single subscription
  getSubscription: async (id: number): Promise<Subscription> => {
    try {
      const response = await axios.get(`${API_URL}/subscriptions/${id}/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  },

  // Get subscription by company
  getCompanySubscription: async (companyId: number): Promise<Subscription> => {
    try {
      const response = await axios.get(`${API_URL}/subscriptions/company/${companyId}/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching company subscription:', error);
      throw error;
    }
  },

  // Create subscription
  createSubscription: async (data: Partial<Subscription>): Promise<Subscription> => {
    try {
      const response = await axios.post(`${API_URL}/subscriptions/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  // Update subscription
  updateSubscription: async (id: number, data: Partial<Subscription>): Promise<Subscription> => {
    try {
      const response = await axios.put(`${API_URL}/subscriptions/${id}/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  // Delete subscription
  deleteSubscription: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/subscriptions/${id}/`);
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  },
};

export { subscriptionService };
