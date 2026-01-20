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

const adminService = {
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
  // Get single company
  getCompany: async (id: number): Promise<Company> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/companies/${id}/`);
      console.log('Raw response:', response.data); // ← DEBUG: See what backend sends
      return response.data.data; // ← FIXED! Now returns just the company object
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
    try {
      // Step 1: Get all users from backend
      const response = await axios.get(`${API_BASE_URL}/users/`);
      const allUsers = response.data.data;

      // Step 2: Count how many recruiters belong to this company
      const recruiterCount = allUsers.filter(
        (user: any) => user.company_id === id && user.user_type === 'recruiter'
      ).length;

      // Step 3: Return the REAL count
      return { recruiterCount };
    } catch (error) {
      console.error('Error fetching company stats:', error);
      return { recruiterCount: 0 }; // If error, return 0

    }
  }    



   
};


// ============= USER INTERFACES =============
export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  user_type: 'admin' | 'recruiter' | 'candidate';
  company_id?: number;
  is_active: boolean;
  is_email_verified: boolean;
  avatar_url?: string;
  timezone?: string;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
}

// For the UsersManagement page (includes company info)
export interface ProfileWithCompany extends User {
  role: string;
  status: string;
  company?: {
    id: number;
    name: string;
  };
}

// ============= USER API FUNCTIONS =============
const userService = {
  // Get all users
  getAllUsers: async (): Promise<ProfileWithCompany[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/`);
      // Transform backend data to match frontend format
      return response.data.data.map((user: User) => ({
        ...user,
        role: user.user_type,
        status: user.is_active ? 'active' : 'inactive',
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get single user
  getUser: async (id: string): Promise<User> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${id}/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Create new user
  createUser: async (data: Partial<User>): Promise<User> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${id}/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/users/${id}/`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
};

// Export both services
const combined = {
  ...adminService,
  ...userService,
};

export { combined as adminService };



 