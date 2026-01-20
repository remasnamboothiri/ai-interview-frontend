import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Loading } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { adminService, User } from '@/services/adminService';

export const EditUserPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    user_type: 'recruiter' as 'admin' | 'recruiter' | 'candidate',
    company_id: '',
    timezone: 'UTC',
    is_active: true,
    is_email_verified: false,
  });

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const data = await adminService.getUser(id);
      setFormData({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        user_type: data.user_type,
        company_id: data.company_id?.toString() || '',
        timezone: data.timezone || 'UTC',
        is_active: data.is_active,
        is_email_verified: data.is_email_verified,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setIsSaving(true);
      setError(null);

      const updateData: Partial<User> = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || undefined,
        user_type: formData.user_type,
        company_id: formData.company_id ? parseInt(formData.company_id) : undefined,
        timezone: formData.timezone,
        is_active: formData.is_active,
        is_email_verified: formData.is_email_verified,
      };

      await adminService.updateUser(id, updateData);
      alert('User updated successfully!');
      navigate(`/admin/users/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(`/admin/users/${id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to User Details
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit User</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Full Name *
              </label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Phone
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                User Type *
              </label>
              <Select
                value={formData.user_type}
                onChange={(e) => setFormData({ ...formData, user_type: e.target.value as any })}
                required
              >
                <option value="admin">Admin</option>
                <option value="recruiter">Recruiter</option>
                <option value="candidate">Candidate</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Company ID
              </label>
              <Input
                type="number"
                value={formData.company_id}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                placeholder="Leave empty if not applicable"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Timezone
              </label>
              <Input
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-secondary">Active</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_email_verified}
                  onChange={(e) => setFormData({ ...formData, is_email_verified: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-secondary">Email Verified</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(`/admin/users/${id}`)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                leftIcon={<Save className="w-4 h-4" />}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
