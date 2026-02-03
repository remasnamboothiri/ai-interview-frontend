import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000/api';
import { API_BASE_URL } from '@/constants';
const API_URL = `${API_BASE_URL}/api`;

export interface Agent {
  id: number;
  name: string;
  interview_type: 'technical' | 'behavioral' | 'product' | 'design' | 'general';
  description: string;
  system_prompt: string;
  language: string;
  voice_settings: string;
  agent_type: 'global' | 'private';
  company_id?: number;
  ai_model: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EvaluationCriteria {
  id?: number;
  agent_id: number;
  criteria_name: string;
  weight_percentage: number;
}

export interface DefaultQuestion {
  id?: number;
  agent_id: number;
  question_text: string;
}

const agentService = {
  // ========== AGENTS ==========
  getAllAgents: async (): Promise<Agent[]> => {
    try {
      const response = await axios.get(`${API_URL}/agents/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  },

  getAgent: async (id: number): Promise<Agent> => {
    try {
      const response = await axios.get(`${API_URL}/agents/${id}/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw error;
    }
  },

  createAgent: async (data: Partial<Agent>): Promise<Agent> => {
    try {
      const response = await axios.post(`${API_URL}/agents/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  },

  updateAgent: async (id: number, data: Partial<Agent>): Promise<Agent> => {
    try {
      const response = await axios.put(`${API_URL}/agents/${id}/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  },

  deleteAgent: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/agents/${id}/`);
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  },

  // ========== EVALUATION CRITERIA ==========
  getAgentCriteria: async (agentId: number): Promise<EvaluationCriteria[]> => {
    try {
      const response = await axios.get(`${API_URL}/evaluation-criteria/?agent_id=${agentId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching criteria:', error);
      throw error;
    }
  },

  createCriteria: async (data: EvaluationCriteria): Promise<EvaluationCriteria> => {
    try {
      const response = await axios.post(`${API_URL}/evaluation-criteria/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating criteria:', error);
      throw error;
    }
  },

  // ========== DEFAULT QUESTIONS ==========
  getAgentQuestions: async (agentId: number): Promise<DefaultQuestion[]> => {
    try {
      const response = await axios.get(`${API_URL}/default-questions/?agent_id=${agentId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  },

  createQuestion: async (data: DefaultQuestion): Promise<DefaultQuestion> => {
    try {
      const response = await axios.post(`${API_URL}/default-questions/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  },
};

export default agentService;
