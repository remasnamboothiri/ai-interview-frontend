import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-secondary mb-2">Forgot Password?</h1>
                <p className="text-neutral-600">
                  No worries, we'll send you reset instructions
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  leftIcon={<Mail className="w-5 h-5" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Button type="submit" variant="primary" className="w-full">
                  Send Reset Link
                </Button>
              </form>

              <Link to="/login">
                <Button
                  variant="ghost"
                  className="w-full mt-4"
                  leftIcon={<ArrowLeft className="w-5 h-5" />}
                >
                  Back to Login
                </Button>
              </Link>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-secondary">Check Your Email</h2>
              <p className="text-neutral-600">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-600">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    className="text-primary-600 font-medium hover:underline"
                    onClick={() => setIsSubmitted(false)}
                  >
                    try another email
                  </button>
                </p>
              </div>
              <Link to="/login">
                <Button variant="primary" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
