import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Home, Search } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-6">
      <div className="text-center max-w-lg">
        <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-secondary mb-4">Page Not Found</h2>
        <p className="text-neutral-600 mb-8">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button variant="primary" leftIcon={<Home className="w-5 h-5" />}>
              Go Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" leftIcon={<Search className="w-5 h-5" />}>
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
