import { apiClient } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      email: string;
      full_name: string;
      user_type: string;
      phone?: string;
      avatar_url?: string;
      is_active: boolean;
      company_id?: number;
    };
    access: string;
    refresh: string;
  };
}

export interface RefreshResponse {
  success: boolean;
  access: string;
}

export const authService = {
  /**
   * Login user and get JWT tokens
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      '/api/auth/login/',
      credentials
    );
    
    // Store tokens in localStorage
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  /**
   * Logout user and clear tokens
   */
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    try {
      await apiClient.post('/api/auth/logout/', {
        refresh: refreshToken
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens regardless of API call success
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiClient.post<RefreshResponse>(
      '/api/auth/refresh/',
      { refresh: refreshToken }
    );
    
    localStorage.setItem('access_token', response.access);
    return response.access;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    return await apiClient.get('/api/auth/me/');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Get stored user data
   */
  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};
