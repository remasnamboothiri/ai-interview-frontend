import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ShieldOff, Home } from 'lucide-react';

export const ForbiddenPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-6">
      <div className="text-center max-w-lg">
        <ShieldOff className="w-24 h-24 text-red-500 mx-auto mb-6" />
        <h1 className="text-7xl font-bold text-red-600 mb-4">403</h1>
        <h2 className="text-3xl font-bold text-secondary mb-4">Access Forbidden</h2>
        <p className="text-neutral-600 mb-8">
          You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
        </p>
        <Link to="/">
          <Button variant="primary" leftIcon={<Home className="w-5 h-5" />}>
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
