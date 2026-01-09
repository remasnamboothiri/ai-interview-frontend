import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input } from '@/components/ui';
import { ArrowLeft, Mail, Phone, Calendar, Shield, Edit, Ban, CheckCircle, Lock, X } from 'lucide-react';
import { format } from 'date-fns';

const mockUser = {
  id: '1',
  full_name: 'Jane Smith',
  email: 'jane.smith@techcorp.com',
  phone: '+1 (555) 987-6543',
  role: 'recruiter',
  company: 'TechCorp Inc.',
  status: 'active',
  email_verified: true,
  created_at: new Date('2024-01-15'),
  last_login: new Date('2024-12-23T09:30:00'),
  stats: {
    jobs_posted: 12,
    candidates_added: 45,
    interviews_conducted: 38,
    hires_made: 8,
  },
};

export const UserDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  console.log('User ID:', id); // Use it somewhere

  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPassword = () => {
    setIsResetting(true);
    // Simulate API call
    setTimeout(() => {
      alert(`Password reset successfully! New password: ${newPassword}`);
      setShowResetModal(false);
      setNewPassword('');
      setIsResetting(false);
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
            Edit User
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<Lock className="w-4 h-4" />}
            onClick={() => setShowResetModal(true)}
          >
            Reset Password
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Ban className="w-4 h-4" />}>
            Suspend
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-3xl font-bold text-primary-600">
              {mockUser.full_name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-secondary">{mockUser.full_name}</h1>
                <Badge variant={mockUser.status === 'active' ? 'success' : 'danger'}>
                  {mockUser.status}
                </Badge>
                {mockUser.email_verified && (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-neutral-600 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {mockUser.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {mockUser.phone}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="primary" className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {mockUser.role}
                </Badge>
                <span className="text-neutral-600">Company: {mockUser.company}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary-50 to-white">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-2">Jobs Posted</p>
            <p className="text-3xl font-bold text-secondary">{mockUser.stats.jobs_posted}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-2">Candidates</p>
            <p className="text-3xl font-bold text-secondary">{mockUser.stats.candidates_added}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-2">Interviews</p>
            <p className="text-3xl font-bold text-secondary">{mockUser.stats.interviews_conducted}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-2">Hires Made</p>
            <p className="text-3xl font-bold text-secondary">{mockUser.stats.hires_made}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Account Created</p>
              <p className="font-semibold text-secondary flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(mockUser.created_at, 'MMMM dd, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Last Login</p>
              <p className="font-semibold text-secondary flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(mockUser.last_login, 'MMMM dd, yyyy • hh:mm a')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border-2 border-neutral-100 rounded-lg">
              <p className="font-medium text-secondary">Created job posting</p>
              <p className="text-sm text-neutral-600">Senior Software Engineer • 2 hours ago</p>
            </div>
            <div className="p-3 border-2 border-neutral-100 rounded-lg">
              <p className="font-medium text-secondary">Scheduled interview</p>
              <p className="text-sm text-neutral-600">John Doe • 5 hours ago</p>
            </div>
            <div className="p-3 border-2 border-neutral-100 rounded-lg">
              <p className="font-medium text-secondary">Added candidate</p>
              <p className="text-sm text-neutral-600">Sarah Wilson • Yesterday</p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Reset User Password</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowResetModal(false);
                    setNewPassword('');
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Warning:</strong> This will reset the password for{' '}
                  <strong>{mockUser.full_name}</strong>. The user will need to use this new
                  password to login.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  New Password *
                </label>
                <Input
                  type="password"
                  placeholder="Enter new password (min. 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowResetModal(false);
                    setNewPassword('');
                  }}
                  disabled={isResetting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleResetPassword}
                  disabled={!newPassword || newPassword.length < 6 || isResetting}
                >
                  {isResetting ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
