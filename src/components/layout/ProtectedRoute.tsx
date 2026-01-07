import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Loading } from '@/components/ui';
import { ROUTES } from '@/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, role } = useAuth();
console.log("role",role)
  if (isLoading) {
    return <Loading fullScreen text="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // return <Navigate to={ROUTES.DASHBOARD} replace />;
    // Redirect based on user role
    if (role === 'super_admin') {
      return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
    } else {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
    
  }

  return <>{children}</>;
};
