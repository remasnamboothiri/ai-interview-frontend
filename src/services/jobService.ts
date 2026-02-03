import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface Job {
  id: number;
  title: string;
  location: string;
  employment_type: string;
  experience_level: string;
  work_mode: string;
  application_deadline?: string;
  skills_required: string[];
  benefits?: string;
  salary_range?: string;
  description: string;
  requirements: string;
  status: 'draft' | 'active' | 'paused' | 'closed';
  agent_id?: number;
  company_id: number;
  recruiter_id: number;
  created_at?: string;
  updated_at?: string;
}

// ← ADD THIS INTERFACE
export interface JobCustomQuestion {
  id?: number;
  job: number;  // ✅ FIXED: Changed from job_id to job (matches backend)
  question_text: string;
  is_mandatory: boolean;
  created_at?: string;
  updated_at?: string;
}

const jobService = {
  // ========== JOBS ==========
  getAllJobs: async (): Promise<Job[]> => {
    const response = await axios.get(`${API_BASE_URL}/jobs/`);
    return response.data.data;
  },

  getJob: async (id: number): Promise<Job> => {
    const response = await axios.get(`${API_BASE_URL}/jobs/${id}/`);
    return response.data.data;
  },

  createJob: async (data: Partial<Job>): Promise<Job> => {
    const response = await axios.post(`${API_BASE_URL}/jobs/`, data);
    return response.data.data;
  },

  updateJob: async (id: number, data: Partial<Job>): Promise<Job> => {
    const response = await axios.put(`${API_BASE_URL}/jobs/${id}/`, data);
    return response.data.data;
  },

  deleteJob: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/jobs/${id}/`);
  },

  // ========== CUSTOM QUESTIONS ========== ← ADD THESE FUNCTIONS
  getJobCustomQuestions: async (jobId: number): Promise<JobCustomQuestion[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/job-custom-questions/?job_id=${jobId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching custom questions:', error);
      throw error;
    }
  },

  createCustomQuestion: async (data: Partial<JobCustomQuestion>): Promise<JobCustomQuestion> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/job-custom-questions/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating custom question:', error);
      throw error;
    }
  },

  deleteCustomQuestion: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/job-custom-questions/${id}/`);
    } catch (error) {
      console.error('Error deleting custom question:', error);
      throw error;
    }
  },
};

export default jobService;
