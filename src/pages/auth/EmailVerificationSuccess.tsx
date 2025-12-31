import { Link } from 'react-router-dom';
import { Button, Card, CardContent } from '@/components/ui';
import { CheckCircle } from 'lucide-react';

export const EmailVerificationSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-secondary mb-3">
            Email Verified Successfully!
          </h1>
          <p className="text-neutral-600 mb-8">
            Your email has been verified. You can now access all features of your account.
          </p>
          <Link to="/dashboard">
            <Button variant="primary" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
          <Link to="/login" className="block mt-4 text-neutral-600 hover:text-primary-600">
            Or login to your account
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
