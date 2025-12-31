import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Input, Select, Loading } from '@/components/ui';
import { Search, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { adminService, ProfileWithCompany } from '@/services/adminService';
import { formatDistanceToNow } from 'date-fns';

export const UsersManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState<ProfileWithCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Users Management</h1>
          <p className="text-neutral-600 mt-1">Manage all platform users</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/admin/users/create')}>
          Add User
        </Button>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select className="w-48" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="recruiter">Recruiter</option>
              <option value="super_admin">Super Admin</option>
            </Select>
            <Select className="w-48" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-600">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'No users found matching your filters.'
                  : 'No users yet. Create your first user!'}
              </p>
              {!searchTerm && roleFilter === 'all' && statusFilter === 'all' && (
                <Button variant="primary" className="mt-4" onClick={() => navigate('/admin/users/create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First User
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Company</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Last Login</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-secondary">{user.full_name || 'N/A'}</p>
                          <p className="text-sm text-neutral-600">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={user.role === 'super_admin' ? 'warning' : 'neutral'}
                          className="capitalize"
                        >
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-neutral-700">
                        {user.company?.name || (user.role === 'super_admin' ? 'Platform' : '-')}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={user.status === 'active' ? 'success' : 'neutral'}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-neutral-600">
                        {user.last_login_at
                          ? formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true })
                          : 'Never'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user.full_name || user.email)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
