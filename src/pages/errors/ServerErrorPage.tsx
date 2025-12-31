import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ServerCrash, Home, RefreshCw } from 'lucide-react';

export const ServerErrorPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-6">
      <div className="text-center max-w-lg">
        <ServerCrash className="w-24 h-24 text-red-500 mx-auto mb-6" />
        <h1 className="text-7xl font-bold text-red-600 mb-4">500</h1>
        <h2 className="text-3xl font-bold text-secondary mb-4">Internal Server Error</h2>
        <p className="text-neutral-600 mb-8">
          Something went wrong on our end. We're working to fix it. Please try again later or contact support if the problem persists.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="primary" leftIcon={<RefreshCw className="w-5 h-5" />} onClick={() => window.location.reload()}>
            Retry
          </Button>
          <Link to="/">
            <Button variant="outline" leftIcon={<Home className="w-5 h-5" />}>
              Go Home
            </Button>
          </Link>
        </div>
        <p className="text-sm text-neutral-500 mt-6">
          Need help? <a href="mailto:support@example.com" className="text-primary-600 hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
};
