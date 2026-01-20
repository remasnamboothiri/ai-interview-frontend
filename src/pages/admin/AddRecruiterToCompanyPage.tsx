import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Select, Loading } from '@/components/ui';
import { UserPlus, Save, X, ArrowLeft, AlertCircle } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { recruiterService } from '@/services/recruiterService';

export const AddRecruiterToCompanyPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // company ID
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Fetch available users when page loads
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await adminService.getAllUsers();
        
        // Filter: Only show users who are NOT already recruiters for ANY company
        const availableUsers = allUsers.filter(
          (user) => user.role === 'recruiter' && !user.company_id
        );
        
        setUsers(availableUsers);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load available users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create recruiter record (link user to company)
      await recruiterService.createRecruiter({
        user_id: Number(selectedUserId),
        company_id: Number(id),
      });

      // Also update the user's company_id
      await adminService.updateUser(selectedUserId, {
        company_id: Number(id),
      });

      alert('Recruiter added to company successfully!');
      navigate(`/admin/companies/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add recruiter');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(`/admin/companies/${id}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Company
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
          <UserPlus className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-secondary">Add Recruiter to Company</h1>
          <p className="text-neutral-600">Select an existing user to assign as recruiter</p>
        </div>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-600 mb-4">
                  No available users found. All recruiter users are already assigned to companies.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => navigate('/admin/users/create')}
                >
                  Create New User
                </Button>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Select User to Add as Recruiter *
                </label>
                <Select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">-- Select a user --</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-neutral-500 mt-2">
                  Only showing users with 'recruiter' role who are not assigned to any company yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {users.length > 0 && (
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/admin/companies/${id}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Add Recruiter
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};
