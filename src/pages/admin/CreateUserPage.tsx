import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Loading } from '@/components/ui';
import { UserPlus, Save, X, AlertCircle } from 'lucide-react';
import { adminService, Company } from '@/services/adminService';

export const CreateUserPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'recruiter' as 'recruiter' | 'super_admin',
    company_id: '',
    
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await adminService.getAllCompanies();
      setCompanies(data.filter((c) => c.status === 'active'));
    } catch (err) {
      console.error('Failed to load companies:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (formData.role === 'recruiter' && !formData.company_id) {
      setError('Please select a company for recruiter role');
      setIsLoading(false);
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      await adminService.createUser({
        ...formData,
        company_id: formData.role === 'recruiter' ? formData.company_id : undefined,
      });
      navigate('/admin/users');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary">Create New User</h1>
            <p className="text-neutral-600">Add a new user to the platform</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => navigate('/admin/users')}>
          <X className="w-4 h-4 mr-2" />
          Cancel
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

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Full Name *
              </label>
              <Input
                required
                placeholder="e.g., John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Email Address *
              </label>
              <Input
                required
                type="email"
                placeholder="john.doe@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Password *
              </label>
              <Input
                required
                type="password"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <p className="text-xs text-neutral-500 mt-1">
                User will be able to change this after first login
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Phone Number
              </label>
              <Input
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Role *
              </label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="recruiter">Recruiter</option>
                <option value="super_admin">Super Admin</option>
              </Select>
            </div>

            {formData.role === 'recruiter' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Company *
                  </label>
                  <Select
                    value={formData.company_id}
                    onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                    required
                  >
                    <option value="">Select Company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </Select>
                  {companies.length === 0 && (
                    <p className="text-xs text-neutral-500 mt-1">
                      No active companies. Please create a company first.
                    </p>
                  )}
                </div>

                {/* <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Job Title
                    </label>
                    <Input
                      placeholder="e.g., Senior Recruiter"
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Department
                    </label>
                    <Input
                      placeholder="e.g., Human Resources"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                </div> */}
              </>
            )}

            {formData.role === 'super_admin' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Super admins have full access to the platform and are not
                  associated with any company.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/users')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loading size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create User
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
