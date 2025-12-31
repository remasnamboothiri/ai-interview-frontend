import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Clock, LogIn } from 'lucide-react';

export const SessionExpiredPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-6">
      <div className="text-center max-w-lg bg-white rounded-xl p-8 shadow-lg">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-12 h-12 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold text-secondary mb-4">Session Expired</h1>
        <p className="text-neutral-600 mb-8">
          Your session has expired for security reasons. Please log in again to continue.
        </p>
        <Link to="/login">
          <Button variant="primary" className="w-full" leftIcon={<LogIn className="w-5 h-5" />}>
            Log In Again
          </Button>
        </Link>
        <p className="text-sm text-neutral-500 mt-6">
          Your work has been saved automatically
        </p>
      </div>
    </div>
  );
};
