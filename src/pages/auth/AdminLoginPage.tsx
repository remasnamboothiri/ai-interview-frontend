import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/ui';
import { Mail, Lock, Shield } from 'lucide-react';
import { ROUTES } from '@/constants';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(ROUTES.ADMIN.DASHBOARD);
    } catch (err) {
      setError('Invalid admin credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-secondary p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-secondary">Admin Portal</h1>
            <p className="text-neutral-600 text-sm mt-2">Super admin access only</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              placeholder="admin@hireflow.ai"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="secondary"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In as Admin
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-neutral-600">
            Recruiter?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary-600 hover:text-primary-700 font-medium">
              Login here
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-500 mt-6">
          © 2024 HireFlow AI. All rights reserved.
        </p>
      </div>
    </div>
  );
};
