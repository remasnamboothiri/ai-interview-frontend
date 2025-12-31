import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: 0, label: '' };
    if (pwd.length < 6) return { strength: 25, label: 'Weak', color: 'bg-red-500' };
    if (pwd.length < 10) return { strength: 50, label: 'Fair', color: 'bg-orange-500' };
    if (pwd.length < 14) return { strength: 75, label: 'Good', color: 'bg-yellow-500' };
    return { strength: 100, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setIsSuccess(true);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-secondary mb-2">Invalid Reset Link</h2>
            <p className="text-neutral-600 mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link to="/forgot-password">
              <Button variant="primary" className="w-full">
                Request New Link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {!isSuccess ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-secondary mb-2">Set New Password</h1>
                <p className="text-neutral-600">
                  Create a strong password for your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                    leftIcon={<Lock className="w-5 h-5" />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-600">Password strength:</span>
                        <span className={`text-xs font-medium ${passwordStrength.strength > 50 ? 'text-green-600' : 'text-orange-600'}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${passwordStrength.strength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter new password"
                  leftIcon={<Lock className="w-5 h-5" />}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                {confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-red-600">Passwords do not match</p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={!password || password !== confirmPassword}
                >
                  Reset Password
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-secondary">Password Reset Successful</h2>
              <p className="text-neutral-600">
                Your password has been successfully reset. You can now login with your new password.
              </p>
              <Link to="/login">
                <Button variant="primary" className="w-full">
                  Go to Login
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
