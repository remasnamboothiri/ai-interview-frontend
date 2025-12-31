import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { XCircle, Mail, Home } from 'lucide-react';

export const InterviewLinkExpiredPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-6">
      <div className="text-center max-w-lg bg-white rounded-xl p-8 shadow-lg">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-secondary mb-4">Interview Link Invalid or Expired</h1>
        <p className="text-neutral-600 mb-8">
          This interview link is no longer valid. It may have expired or been used already. Please check your email for the correct link or contact the recruiter.
        </p>
        <div className="bg-neutral-50 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-neutral-700 mb-2">Need Help?</p>
          <p className="text-sm text-neutral-600 mb-3">
            Contact the recruiter who sent you this interview invitation
          </p>
          <Button variant="outline" size="sm" leftIcon={<Mail className="w-4 h-4" />}>
            Contact Support
          </Button>
        </div>
        <Link to="/">
          <Button variant="primary" className="w-full" leftIcon={<Home className="w-5 h-5" />}>
            Go to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
};
