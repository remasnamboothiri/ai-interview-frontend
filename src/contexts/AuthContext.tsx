import { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '@/types';
import { authService } from '@/services/authService';
import { handleApiError } from '@/services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      const storedUser = authService.getStoredUser();
      if (storedUser && authService.isAuthenticated()) {
        setUser({
          id: storedUser.id.toString(),
          email: storedUser.email,
          full_name: storedUser.full_name,
          role: mapUserTypeToRole(storedUser.user_type),
          company: storedUser.company_id?.toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setRole(mapUserTypeToRole(storedUser.user_type));
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const mapUserTypeToRole = (userType: string): UserRole => {
    switch (userType) {
      case 'admin':
        return 'super_admin';
      case 'recruiter':
        return 'recruiter';
      case 'candidate':
        return 'candidate';
      default:
        return 'recruiter';
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      
      if (response.success && response.data) {
        const userData = response.data.user;
        const mappedUser: User = {
          id: userData.id.toString(),
          email: userData.email,
          full_name: userData.full_name,
          role: mapUserTypeToRole(userData.user_type),
          company: userData.company_id?.toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setUser(mappedUser);
        setRole(mapUserTypeToRole(userData.user_type));
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setRole(null);
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const result: any = await authService.getCurrentUser();
      if (result.success && result.data) {
        const userData = result.data;
        const mappedUser: User = {
          id: userData.id.toString(),
          email: userData.email,
          full_name: userData.full_name,
          role: mapUserTypeToRole(userData.user_type),
          company: userData.company_id?.toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      
        setUser(mappedUser);
        setRole(mapUserTypeToRole(userData.user_type));
      
        // Update localStorage too
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      await logout();
    }
  };


  const value: AuthContextType = {
    user,
    role,
    isLoading,
    isAuthenticated: !!user && authService.isAuthenticated(),
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
