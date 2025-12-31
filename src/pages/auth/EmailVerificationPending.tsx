import { Link } from 'react-router-dom';
import { Button, Card, CardContent } from '@/components/ui';
import { Mail, RefreshCw } from 'lucide-react';

export const EmailVerificationPending = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-12 h-12 text-primary-600" />
          </div>

          <h1 className="text-2xl font-bold text-secondary mb-3">
            Verify Your Email
          </h1>

          <p className="text-neutral-600 mb-2">
            We've sent a verification link to
          </p>
          <p className="font-semibold text-secondary mb-6">
            your-email@example.com
          </p>

          <p className="text-sm text-neutral-600 mb-8">
            Click the link in the email to verify your account and get started.
          </p>

          <div className="bg-neutral-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-neutral-700 mb-3">
              Didn't receive the email?
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Resend Verification Email
            </Button>
          </div>

          <div className="text-sm text-neutral-600">
            <p className="mb-2">Check your spam folder if you don't see it</p>
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
