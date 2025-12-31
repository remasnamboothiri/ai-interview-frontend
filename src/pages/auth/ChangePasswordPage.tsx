import { useState } from 'react';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { Lock, CheckCircle } from 'lucide-react';

export const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword === formData.confirmPassword) {
      setIsSuccess(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardContent className="p-8">
          {!isSuccess ? (
            <>
              <h1 className="text-2xl font-bold text-secondary mb-2">Change Password</h1>
              <p className="text-neutral-600 mb-8">
                Update your password to keep your account secure
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="Enter current password"
                  leftIcon={<Lock className="w-5 h-5" />}
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, currentPassword: e.target.value })
                  }
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                  leftIcon={<Lock className="w-5 h-5" />}
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter new password"
                  leftIcon={<Lock className="w-5 h-5" />}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                />
                {formData.confirmPassword &&
                  formData.newPassword !== formData.confirmPassword && (
                    <p className="text-sm text-red-600">Passwords do not match</p>
                  )}
                <Button type="submit" variant="primary" className="w-full">
                  Update Password
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-secondary">
                Password Changed Successfully
              </h2>
              <p className="text-neutral-600">
                Your password has been updated. Please use your new password next time you login.
              </p>
              <Button
                variant="primary"
                onClick={() => setIsSuccess(false)}
                className="w-full"
              >
                Done
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
