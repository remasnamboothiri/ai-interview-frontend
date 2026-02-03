import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Loading } from '@/components/ui';
import { ArrowLeft, Mail, Phone, Calendar, Shield, Edit, Ban, CheckCircle, Lock, X } from 'lucide-react';
import { format } from 'date-fns';
import { adminService, User } from '@/services/adminService';

export const UserDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // State for user data
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for password reset modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Load user data from API
  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getUser(id);
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSuspendUser = async () => {
    if (!user || !id) return;

  const action = user.is_active ? 'suspend' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      await adminService.updateUser(id, { is_active: !user.is_active });
      alert(`User ${action}ed successfully!`);
      loadUser(); // Reload user data
    } catch (err) {
      alert(err instanceof Error ? err.message : `Failed to ${action} user`);
    }
  };


  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // Show error state
  if (error || !user) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 mt-8">
        <Button variant="ghost" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-red-800">{error || 'User not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<Edit className="w-4 h-4" />}
            onClick={() => navigate(`/admin/users/edit/${id}`)}  
          >
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
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<Ban className="w-4 h-4" />}
            onClick={handleSuspendUser}  
          >
            Suspend
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-3xl font-bold text-primary-600">
              {user.full_name?.split(' ').map(n => n[0]).join('') || 'NA'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-secondary">{user.full_name || 'N/A'}</h1>
                <Badge variant={user.is_active ? 'success' : 'danger'}>
                  {user.is_active ? 'active' : 'inactive'}
                </Badge>
                {user.is_email_verified && (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-neutral-600 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {user.phone || 'N/A'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="neutral" className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {user.user_type}
                </Badge>
                <span className="text-neutral-600">
                  Company ID: {user.company_name || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-primary-50 to-white">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-2">User Type</p>
            <p className="text-2xl font-bold text-secondary capitalize">{user.user_type}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-2">Timezone</p>
            <p className="text-2xl font-bold text-secondary">{user.timezone || 'UTC'}</p>
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
                {user.created_at ? format(new Date(user.created_at), 'MMMM dd, yyyy') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Last Login</p>
              <p className="font-semibold text-secondary flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {user.last_login_at 
                  ? format(new Date(user.last_login_at), 'MMMM dd, yyyy • hh:mm a')
                  : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Last Updated</p>
              <p className="font-semibold text-secondary flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {user.updated_at ? format(new Date(user.updated_at), 'MMMM dd, yyyy') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Email Verified</p>
              <p className="font-semibold text-secondary">
                {user.is_email_verified ? 'Yes' : 'No'}
              </p>
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
                  <strong>{user.full_name}</strong>. The user will need to use this new
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







