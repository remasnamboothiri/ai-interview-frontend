import { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '@/types';

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

// Mock user data for UI/UX design
const mockRecruiter: User = {
  id: 'mock-recruiter-id',
  email: 'recruiter@example.com',
  full_name: 'John Recruiter',
  role: 'recruiter',
  company: 'Tech Corp',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockAdmin: User = {
  id: 'mock-admin-id',
  email: 'admin@hireflow.ai',
  full_name: 'Super Admin',
  role: 'super_admin',
  company: 'HireFlow AI',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(mockRecruiter);
  const [role, setRole] = useState<UserRole | null>('recruiter');
  const [isLoading, setIsLoading] = useState(false);

  const refreshUser = async () => {
    // Mock refresh - keep current user
    if (user?.role === 'super_admin') {
      setUser(mockAdmin);
      setRole('super_admin');
    } else {
      setUser(mockRecruiter);
      setRole('recruiter');
    }
  };

  useEffect(() => {
    // Set mock recruiter by default for UI preview
    setUser(mockRecruiter);
    setRole('recruiter');
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - check email to determine role
    await new Promise(resolve => setTimeout(resolve, 500));

    // Admin login
    if (email.includes('admin') || email === 'admin@hireflow.ai') {
      setUser(mockAdmin);
      setRole('super_admin');
    } else {
      // Recruiter login
      setUser(mockRecruiter);
      setRole('recruiter');
    }
  };

  const logout = async () => {
    // Mock logout
    await new Promise(resolve => setTimeout(resolve, 300));
    setUser(null);
    setRole(null);
  };

  const value: AuthContextType = {
    user,
    role,
    isLoading,
    isAuthenticated: !!user,
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
