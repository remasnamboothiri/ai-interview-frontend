import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { Mail, Lock, User, Building, Phone, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

export const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: '',
    companyName: '',
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-secondary mb-2">Create Your Account</h1>
            <p className="text-neutral-600">Join us and start hiring smarter</p>
          </div>

          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > s ? 'bg-primary-600' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-secondary mb-4">Basic Information</h2>
              <Input
                label="Full Name"
                placeholder="John Doe"
                leftIcon={<User className="w-5 h-5" />}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                leftIcon={<Mail className="w-5 h-5" />}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+1 (555) 000-0000"
                leftIcon={<Phone className="w-5 h-5" />}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Button
                variant="primary"
                className="w-full"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                onClick={handleNext}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-secondary mb-4">Account Type & Security</h2>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    className={`p-6 rounded-lg border-2 transition-all ${
                      formData.userType === 'recruiter'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300'
                    }`}
                    onClick={() => setFormData({ ...formData, userType: 'recruiter' })}
                  >
                    <Building className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <div className="font-semibold text-secondary">Recruiter</div>
                    <div className="text-sm text-neutral-500">Hire talent for my company</div>
                  </button>
                  <button
                    className={`p-6 rounded-lg border-2 transition-all ${
                      formData.userType === 'candidate'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300'
                    }`}
                    onClick={() => setFormData({ ...formData, userType: 'candidate' })}
                  >
                    <User className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <div className="font-semibold text-secondary">Candidate</div>
                    <div className="text-sm text-neutral-500">Looking for opportunities</div>
                  </button>
                </div>
              </div>

              {formData.userType === 'recruiter' && (
                <Input
                  label="Company Name"
                  placeholder="Acme Corp"
                  leftIcon={<Building className="w-5 h-5" />}
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              )}

              <Input
                label="Password"
                type="password"
                placeholder="Create a strong password"
                leftIcon={<Lock className="w-5 h-5" />}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter your password"
                leftIcon={<Lock className="w-5 h-5" />}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  leftIcon={<ArrowLeft className="w-5 h-5" />}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  onClick={handleNext}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-secondary">Check Your Email</h2>
              <p className="text-neutral-600 max-w-md mx-auto">
                We've sent a verification link to <strong>{formData.email}</strong>.
                Please click the link to verify your account and complete registration.
              </p>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-600">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button className="text-primary-600 font-medium hover:underline">
                    resend verification email
                  </button>
                </p>
              </div>
              <Link to="/login">
                <Button variant="primary" className="w-full">
                  Go to Login
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-neutral-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
